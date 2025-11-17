import { UserModel } from './UserModel';

export default class PresetModel {
  id: string;
  name: string; // 预设名称
  description: string; // 描述
  tags?: string[]; // 标签
  user_id: string; // 用户ID
  camera_model: string; // 相机型号
  author?: UserModel; // 作者信息

  params: {
    base_preset: string; // 基础预设
    white_balance: string; // 白平衡
    wb_shift: string; // 白平衡偏移
    saturation: number; // 饱和度
    color_tone: number; // 颜色色调
    contrast: number; // 对比度
    contrast_highlight: number; // 对比度高光
    contrast_shadow: number; // 对比度阴影
    sharpness: number; // 锐度
    clarity: number; // 清晰度
    shadow_tone: number; // 阴影色调
    highlight_tone: number; // 高光色调
  } | null;

  preview_images: { before: string; after: string }[]; // 预览图片
  likes: number; // 点赞数
  created_at: Date; // 创建时间
  updated_at: Date; // 更新时间
  is_bookmarked: boolean; // 是否收藏

  constructor(data: Partial<PresetModel>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.tags = data.tags || [];
    this.user_id = data.user_id || '';
    this.camera_model = data.camera_model || '';
    this.author = data.author;
    this.params = data.params || null;
    this.preview_images = data.preview_images || [];
    this.likes = data.likes || 0;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
    this.is_bookmarked = data.is_bookmarked || false;
  }
}
