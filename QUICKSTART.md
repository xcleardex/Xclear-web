# 快速启动指南

## 第一步：安装依赖

```bash
npm install
```

## 第二步：配置 Privy

1. 访问 [Privy Dashboard](https://dashboard.privy.io/)
2. 注册/登录账户
3. 创建新应用
4. 复制 App ID

## 第三步：创建环境变量文件

在项目根目录创建 `.env` 文件：

```env
VITE_PRIVY_APP_ID=你的-privy-app-id
```

## 第四步：启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:3000`

## 功能测试

1. **钱包连接**: 点击右上角"连接钱包"按钮，使用 Privy 连接钱包
2. **交易对选择**: 点击左侧交易对列表中的任意交易对
3. **图表查看**: 中间区域会显示选中交易对的图表
4. **交易操作**: 在右侧面板调整参数后，可以点击买入/卖出按钮（当前为 UI 展示）

## 常见问题

### Q: Privy 连接失败？
A: 检查 `.env` 文件中的 `VITE_PRIVY_APP_ID` 是否正确配置，并确保已重启开发服务器。

### Q: 图表不显示？
A: 确保浏览器控制台没有错误，图表使用 Lightweight Charts 库，需要现代浏览器支持。

### Q: 样式显示异常？
A: 确保 TailwindCSS 已正确安装，运行 `npm install` 重新安装依赖。
