import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// @ethersproject/solidity 的 ESM 构建缺少 _version，用 CJS 入口路径（运行时解析，兼容 pnpm）
const solidityCjsPath = path.join(path.dirname(require.resolve('@ethersproject/solidity/package.json')), 'lib/index.js')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ethersproject/solidity": solidityCjsPath,
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
