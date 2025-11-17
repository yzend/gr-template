export class UserModel {
  id: string;
  name: string;
  avatar_url: string; // 头像URL
  bio?: string; // 个人简介
  upload_count?: number; // 上传数
  collect_count?: number; // 收藏数
  created_at: Date; // 创建时间
  updated_at: Date; // 更新时间

  constructor(data: Partial<UserModel>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.avatar_url = data.avatar_url || '';
    this.bio = data.bio || '';
    this.upload_count = data.upload_count || 0;
    this.collect_count = data.collect_count || 0;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }
}
