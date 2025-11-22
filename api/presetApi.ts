import type PresetModel from '@/dataModal/PresetModel';
import { config } from '@/config';

// 云函数基础URL
const CLOUD_FUNCTION_URL =
  'https://demo-8g0wq0tscefeb0e1.api.tcloudbasegateway.com/v1/functions/preset';

// 获取请求头
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
  };
}

/**
 * 请求响应通用格式
 */
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 获取预设列表的参数
 */
export interface GetPresetsParams {
  page?: number; // 页码
  pageSize?: number; // 每页数量
  tags?: string[]; // 标签筛选
  camera_model?: string; // 相机型号筛选
  upload_time?: string; // 上传时间筛选
  user_id?: string; // 用户ID筛选（获取某个用户的预设）
  sort?: 'latest' | 'popular'; // 排序方式：最新 | 最热
}

/**
 * 创建预设的参数
 * 从 PresetModel 中提取需要的字段，排除自动生成的字段
 */
export type CreatePresetParams = Pick<
  PresetModel,
  'name' | 'description' | 'tags' | 'camera_model' | 'params' | 'preview_images'
> & {
  params: NonNullable<PresetModel['params']>; // 确保 params 不为 null
};

/**
 * 更新预设的参数
 * 从 CreatePresetParams 中提取字段并设为可选，同时添加必需的 id
 */
export type UpdatePresetParams = Partial<Omit<CreatePresetParams, 'params'>> & {
  id: string;
  params?: NonNullable<PresetModel['params']>;
};

/**
 * 预设列表响应
 */
export interface PresetsListResponse {
  list: PresetModel[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取预设列表
 * @param params 查询参数
 * @returns Promise<PresetsListResponse>
 */
export async function presetGetList(
  params: GetPresetsParams = {}
): Promise<PresetsListResponse> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'getList',
        ...params,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<PresetsListResponse>;
      if (resData.success) {
        return resData.data!;
      } else {
        throw new Error(resData.message || '获取预设列表失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('获取预设列表错误:', error);
    throw error;
  }
}

/**
 * 获取预设详情
 * @param id 预设ID
 * @returns Promise<PresetModel>
 */
export async function presetGetDetail(id: string): Promise<PresetModel> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'getDetail',
        id,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<PresetModel>;
      if (resData.success) {
        return resData.data!;
      } else {
        throw new Error(resData.message || '获取预设详情失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('获取预设详情错误:', error);
    throw error;
  }
}

/**
 * 创建预设
 * @param params 预设数据
 * @returns Promise<PresetModel>
 */
export async function presetCreate(params: CreatePresetParams): Promise<PresetModel> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'create',
        ...params,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<PresetModel>;
      if (resData.success) {
        return resData.data!;
      } else {
        throw new Error(resData.message || '创建预设失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('创建预设错误:', error);
    throw error;
  }
}

/**
 * 更新预设
 * @param params 更新数据
 * @returns Promise<PresetModel>
 */
export async function presetUpdate(params: UpdatePresetParams): Promise<PresetModel> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'update',
        ...params,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<PresetModel>;
      if (resData.success) {
        return resData.data!;
      } else {
        throw new Error(resData.message || '更新预设失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('更新预设错误:', error);
    throw error;
  }
}

/**
 * 删除预设
 * @param id 预设ID
 * @returns Promise<boolean>
 */
export async function presetDelete(id: string): Promise<boolean> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'delete',
        id,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<boolean>;
      if (resData.success) {
        return true;
      } else {
        throw new Error(resData.message || '删除预设失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('删除预设错误:', error);
    throw error;
  }
}

/**
 * 收藏预设
 * @param id 预设ID
 * @returns Promise<boolean>
 */
export async function presetBookmark(id: string): Promise<boolean> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'bookmark',
        preset_id: id,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<boolean>;
      if (resData.success) {
        return true;
      } else {
        throw new Error(resData.message || '收藏失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('收藏预设错误:', error);
    throw error;
  }
}

/**
 * 取消收藏预设
 * @param id 预设ID
 * @returns Promise<boolean>
 */
export async function presetUnbookmark(id: string): Promise<boolean> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'unbookmark',
        preset_id: id,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<boolean>;
      if (resData.success) {
        return true;
      } else {
        throw new Error(resData.message || '取消收藏失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('取消收藏预设错误:', error);
    throw error;
  }
}

/**
 * 点赞预设
 * @param id 预设ID
 * @returns Promise<boolean>
 */
export async function presetLike(id: string): Promise<boolean> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'like',
        preset_id: id,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<boolean>;
      if (resData.success) {
        return true;
      } else {
        throw new Error(resData.message || '点赞失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('点赞预设错误:', error);
    throw error;
  }
}

/**
 * 获取用户收藏的预设列表
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns Promise<PresetsListResponse>
 */
export async function presetGetBookmarkedList(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PresetsListResponse> {
  try {
    const res = await uni.request({
      url: CLOUD_FUNCTION_URL,
      method: 'POST',
      data: {
        action: 'getBookmarkedList',
        user_id: userId,
        page,
        pageSize,
      },
      header: getHeaders(),
    });

    if (res.statusCode === 200) {
      const resData = res.data as ApiResponse<PresetsListResponse>;
      if (resData.success) {
        return resData.data!;
      } else {
        throw new Error(resData.message || '获取收藏列表失败');
      }
    } else {
      throw new Error('网络请求失败');
    }
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    throw error;
  }
}
