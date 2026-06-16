import { defineConfig } from '@edgeone/builder';

export default defineConfig({
  // 纯静态应用配置
  type: 'static',
  
  // 构建输出目录
  outDir: 'dist',
  
  // 构建命令
  buildCommand: 'npm run build',
});
