import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// @ethersproject/solidity 的 ESM 构建缺少 _version，用 CJS 入口（Privy 等依赖会间接用到）
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
    open: true,
  },
})
