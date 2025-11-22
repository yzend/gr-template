import { config } from '@/config';

// 上传云函数基础URL
const UPLOAD_FUNCTION_URL =
  'https://demo-8g0wq0tscefeb0e1.api.tcloudbasegateway.com/v1/functions/upload';

// 获取请求头
function getHeaders() {
  return {
    'Content-Type': 'multipart/form-data',
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
  name?: string; // 文件字段名，默认为 'file'
  path?: string; // 可选：自定义路径
  formData?: Record<string, any>; // 可选：额外的表单数据
}

/**
 * 上传文件
 * @param params 上传参数
 * @returns Promise<UploadResponse['data']>
 */
export function uploadFile(params: UploadFileParams): Promise<UploadResponse['data']> {
  return new Promise((resolve, reject) => {
    const { filePath, name = 'file', path, formData = {} } = params;

    // 构建表单数据
    const uploadFormData: Record<string, any> = {
      ...formData,
    };

    // 如果提供了自定义路径，添加到表单数据
    if (path != null && path != '') {
      uploadFormData.path = path;
    }

    uni.uploadFile({
      url: UPLOAD_FUNCTION_URL,
      filePath: filePath,
      name: name,
      header: getHeaders(),
      formData: uploadFormData,
      success: (res) => {
        try {
          // 解析响应数据
          const result = JSON.parse(res.data) as UploadResponse;

          if (result.success) {
            resolve(result.data);
          } else {
            reject(new Error(result.message || '上传失败'));
          }
        } catch (error) {
          console.error('解析上传响应失败:', error);
          reject(new Error('解析响应数据失败'));
        }
      },
      fail: (error) => {
        console.error('上传文件失败:', error);
        reject(new Error(error.errMsg || '上传文件失败'));
      },
    });
  });
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
    name?: string;
    path?: string;
    formData?: Record<string, any>;
  }
): Promise<string[]> {
  const uploadPromises = filePaths.map((filePath) =>
    uploadFile({
      filePath,
      name: options?.name,
      path: options?.path,
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

