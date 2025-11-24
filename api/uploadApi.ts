import { config } from '@/config';
import { uuid } from '@/cool/utils/comm';

// 上传云函数基础URL
const UPLOAD_FUNCTION_URL =
  'https://demo-8g0wq0tscefeb0e1.api.tcloudbasegateway.com/v1/functions/upload?webfn=true';

// 获取请求头
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };
}

/**
 * 上传响应通用格式
 */
interface UploadResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    path?: string;
    [key: string]: any;
  };
}

/**
 * 上传文件参数
 */
export interface UploadFileParams {
  filePath: string; // 文件路径
  path?: string; // 可选：自定义路径（文件将保存在此路径下）
  contentType?: string; // 可选：文件内容类型，如 'image/jpeg', 'image/png' 等
  formData?: Record<string, any>; // 可选：额外的表单数据
}

/**
 * 读取文件并转换为 base64
 * @param filePath 文件路径
 * @returns Promise<string> base64 字符串
 */
function readFileAsBase64(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // #ifdef H5 || WEB
    // Web 平台处理
    // 如果是 data URL，直接提取 base64 部分
    if (filePath.startsWith('data:')) {
      const base64Index = filePath.indexOf(',');
      if (base64Index != -1) {
        resolve(filePath.substring(base64Index + 1));
        return;
      }
    }

    // 如果是 blob URL 或普通 URL，使用 fetch 获取并转换为 base64
    if (filePath.startsWith('blob:') || filePath.startsWith('http://') || filePath.startsWith('https://')) {
      fetch(filePath)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // 移除 data URL 前缀，只保留 base64 部分
            const base64Index = result.indexOf(',');
            if (base64Index != -1) {
              resolve(result.substring(base64Index + 1));
            } else {
              resolve(result);
            }
          };
          reader.onerror = () => {
            reject(new Error('读取文件失败'));
          };
          reader.readAsDataURL(blob);
        })
        .catch((error) => {
          console.error('获取文件失败:', error);
          reject(new Error('获取文件失败'));
        });
      return;
    }

    // 其他情况，尝试使用 FileReader（适用于 input file 选择的文件）
    reject(new Error('Web 平台不支持此文件路径格式'));
    // #endif

    // #ifdef APP || MP
    // APP 和小程序平台使用文件系统管理器
    const fileManager = uni.getFileSystemManager();
    
    fileManager.readFile({
      filePath: filePath,
      encoding: 'base64',
      success: (res) => {
        // res.data 是 base64 字符串
        resolve(res.data as string);
      },
      fail: (error) => {
        console.error('读取文件失败:', error);
        reject(new Error(error.errMsg || '读取文件失败'));
      },
    });
    // #endif
  });
}

/**
 * 根据 base64 数据检测文件类型（通过文件魔数）
 * @param base64Data base64 字符串
 * @returns 内容类型字符串，如果无法检测则返回 null
 */
function detectContentTypeFromBase64(base64Data: string): string | null {
  try {
    // 解码 base64 的前几个字节用于检测文件类型
    // 取前 20 个字符（约 15 字节）足够检测常见文件类型
    const sample = base64Data.substring(0, 20);
    let byteArray: number[] = [];
    
    // #ifdef H5 || WEB
    // Web 平台使用 atob 解码
    const bytes = atob(sample);
    byteArray = [];
    for (let i = 0; i < bytes.length; i++) {
      byteArray.push(bytes.charCodeAt(i));
    }
    // #endif

    // #ifdef APP || MP
    // APP 和小程序平台需要手动解码 base64
    // base64 字符映射
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    byteArray = [];
    let buffer = 0;
    let bitsCollected = 0;
    
    for (let i = 0; i < sample.length && byteArray.length < 20; i++) {
      const char = sample.charAt(i);
      if (char == '=') break;
      
      const value = base64Chars.indexOf(char);
      if (value == -1) continue;
      
      buffer = (buffer << 6) | value;
      bitsCollected += 6;
      
      if (bitsCollected >= 8) {
        byteArray.push((buffer >> (bitsCollected - 8)) & 0xFF);
        bitsCollected -= 8;
      }
    }
    // #endif

    // 检测文件类型（通过文件魔数）
    if (byteArray.length >= 3) {
      // JPEG: FF D8 FF
      if (byteArray[0] == 0xFF && byteArray[1] == 0xD8 && byteArray[2] == 0xFF) {
        return 'image/jpeg';
      }
      
      // PNG: 89 50 4E 47
      if (byteArray.length >= 4 && 
          byteArray[0] == 0x89 && 
          byteArray[1] == 0x50 && 
          byteArray[2] == 0x4E && 
          byteArray[3] == 0x47) {
        return 'image/png';
      }
      
      // GIF: 47 49 46 38 (GIF8)
      if (byteArray.length >= 4 && 
          byteArray[0] == 0x47 && 
          byteArray[1] == 0x49 && 
          byteArray[2] == 0x46 && 
          byteArray[3] == 0x38) {
        return 'image/gif';
      }
      
      // PDF: 25 50 44 46 (%PDF)
      if (byteArray.length >= 4 && 
          byteArray[0] == 0x25 && 
          byteArray[1] == 0x50 && 
          byteArray[2] == 0x44 && 
          byteArray[3] == 0x46) {
        return 'application/pdf';
      }
    }
    
    // WebP: 需要检查 RIFF 头 (52 49 46 46) 和 WEBP (57 45 42 50)
    if (byteArray.length >= 12 && 
        byteArray[0] == 0x52 && 
        byteArray[1] == 0x49 && 
        byteArray[2] == 0x46 && 
        byteArray[3] == 0x46 &&
        byteArray[8] == 0x57 && 
        byteArray[9] == 0x45 && 
        byteArray[10] == 0x42 && 
        byteArray[11] == 0x50) {
      return 'image/webp';
    }
    
    return null;
  } catch (error) {
    console.error('检测文件类型失败:', error);
    return null;
  }
}

/**
 * 根据内容类型获取文件扩展名
 * @param contentType 内容类型
 * @returns 文件扩展名
 */
function getExtensionFromContentType(contentType: string): string {
  const contentTypeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'text/plain': 'txt',
    'application/json': 'json',
    'application/pdf': 'pdf',
  };
  return contentTypeMap[contentType] || 'bin';
}

/**
 * 上传文件（base64 方式）
 * @param params 上传参数
 * @returns Promise<UploadResponse['data']>
 */
export async function uploadFile(params: UploadFileParams): Promise<UploadResponse['data']> {
  try {
    const { filePath, path, contentType, formData = {} } = params;

    // 读取文件并转换为 base64
    const base64Data = await readFileAsBase64(filePath);

    // 获取内容类型（优先级：参数 > base64检测）
    let finalContentType: string;
    if (contentType != null && contentType != '') {
      finalContentType = contentType;
    } else {
      // 尝试从 base64 数据检测文件类型
      const detectedType = detectContentTypeFromBase64(base64Data);
      if (detectedType != null) {
        finalContentType = detectedType;
      } else {
        // 如果无法检测，使用默认类型
        finalContentType = 'application/octet-stream';
      }
    }

    // 根据内容类型获取文件扩展名
    const extension = getExtensionFromContentType(finalContentType);
    
    // 生成文件名：uuid + 扩展名
    const finalFileName = `${uuid()}.${extension}`;

    // 构建 filePath：如果提供了 path，则在 path 基础上加上 finalFileName
    let finalFilePath: string;
    if (path != null && path != '') {
      // 确保 path 以 / 结尾
      const normalizedPath = path.endsWith('/') ? path : `${path}/`;
      finalFilePath = `${normalizedPath}${finalFileName}`;
    } else {
      finalFilePath = finalFileName;
    }

    // 构建请求数据（按照 API 文档格式）
    const requestData: Record<string, any> = {
      base64: base64Data,
      fileName: finalFileName,
      filePath: finalFilePath,
      contentType: finalContentType,
      ...formData,
    };

    // 使用 uni.request 发送 base64 数据
    const res = await uni.request({
      url: UPLOAD_FUNCTION_URL,
      method: 'POST',
      header: getHeaders(),
      data: requestData,
    });

    if (res.statusCode === 200) {
      const result = res.data as UploadResponse;

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || '上传失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('上传文件失败:', error);
    throw error;
  }
}

/**
 * 批量上传文件
 * @param filePaths 文件路径数组
 * @param options 上传选项
 * @returns Promise<string[]> 返回上传后的 URL 数组
 */
export async function uploadFiles(
  filePaths: string[],
  options?: {
    path?: string;
    contentType?: string;
    formData?: Record<string, any>;
  }
): Promise<string[]> {
  const uploadPromises = filePaths.map((filePath) =>
    uploadFile({
      filePath,
      path: options?.path,
      contentType: options?.contentType,
      formData: options?.formData,
    })
  );

  const results = await Promise.all(uploadPromises);

  // 提取 URL
  return results.map((result) => {
    if (result != null && result.url != null) {
      return result.url;
    }
    return '';
  }).filter((url) => url != '');
}

