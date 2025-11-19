import { isMp } from '@/cool';
import { dev } from './dev';
import { prod } from './prod';

// 判断当前是否为开发环境
export const isDev = process.env.NODE_ENV == 'development';

// 忽略 token 校验的接口路径
export const ignoreTokens: string[] = [];

// 微信配置
type WxConfig = {
  debug: boolean;
};

// 配置类型定义
type Config = {
  name: string; // 应用名称
  version: string; // 应用版本
  locale: string; // 应用语言
  website: string; // 官网地址
  host: string; // 主机地址
  baseUrl: string; // 基础路径
  showDarkButton: boolean; // 是否显示暗色模式切换按钮
  isCustomTabBar: boolean; // 是否自定义 tabBar
  backTop: boolean; // 是否显示回到顶部按钮
  wx: WxConfig; // 微信配置
  apiKey: string; // 支付公钥
};

// 根据环境导出最终配置
export const config = {
  name: 'GR 预设',
  version: '1.0.0',
  locale: 'zh',
  website: 'https://cool-js.com',
  showDarkButton: isMp() ? false : true,
  isCustomTabBar: true,
  backTop: true,
  wx: {
    debug: false,
  },
  ...(isDev ? dev() : prod()),
  apiKey:
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJhdWQiOiJkZW1vLThnMHdxMHRzY2VmZWIwZTEiLCJleHAiOjI1MzQwMjMwMDc5OSwiaWF0IjoxNzYzNTY5NDY5LCJhdF9oYXNoIjoiT09Oa0ZNVmtFZkNtbGxKVUFKTGJxdyIsInByb2plY3RfaWQiOiJkZW1vLThnMHdxMHRzY2VmZWIwZTEiLCJtZXRhIjp7InBsYXRmb3JtIjoiQXBpS2V5In0sImFkbWluaXN0cmF0b3JfaWQiOiIxOTg5MjU2MjA0NDcwNjgxNjAxIiwidXNlcl90eXBlIjoiIiwiY2xpZW50X3R5cGUiOiJjbGllbnRfc2VydmVyIiwiaXNfc3lzdGVtX2FkbWluIjp0cnVlfQ.K8U-oheU3KrnqFAZnvIPWF_WU2Mm8dYuj9J1vbSDh3m-DxZWZEppCnpAMCiGfPmjnau1GPHr8SpnkBCNb0gJtX6toGcHn2WeW7SDE6nUtpSSPktUf7jy1PugTpQZdaihHmvURrOVeI63zBGl5WpkIpWT828SCM3UwHDDNhfw4ynZsMYOGmi5sLSF-U69oMaxD30QE-XSyiocDhXTwwPQjEaJTml6Hql-qHamNBYeh6PHr6PMkpWA4KINYwB4l-6PQDSznAcZNK0Plxda_qwnXGwAs7T4EKBtWkdbDkK4m3uQgeYNRjDBogA6e5lbewh5EnPphnQj-v-coEdojm8KLg',
} as Config;

// 导出代理相关配置
export * from './proxy';
