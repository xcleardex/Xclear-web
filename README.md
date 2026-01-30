# XClear Web - 交易平台

一个基于 React + TypeScript + Vite + TailwindCSS 构建的现代化金融交易平台，支持多种交易对（黄金、白银、原油、外汇等），集成了 TradingView 图表和 Privy 钱包连接功能。

## 项目概述

XClear Web 是一个专业的金融交易平台前端应用，提供实时价格展示、图表分析、交易执行和账户管理等功能。平台采用深色主题设计，提供流畅的用户体验。

## 技术栈

- **框架**: React 18.2.0
- **语言**: TypeScript 5.2.2
- **构建工具**: Vite 5.0.8
- **样式**: TailwindCSS 3.3.6
- **UI 组件库**: [shadcn/ui](https://ui.shadcn.com/) - 基于 Radix UI 和 Tailwind CSS
- **图表**: TradingView Lightweight Charts 4.x + WebSocket 数据
- **钱包连接**: Privy 1.60.0
- **图标**: Lucide React 0.294.0

## 项目结构

```
XClear-web/
├── src/
│   ├── components/          # 组件目录
│   │   ├── ui/              # shadcn/ui 组件
│   │   │   ├── button.tsx   # 按钮组件
│   │   │   ├── card.tsx     # 卡片组件
│   │   │   ├── input.tsx    # 输入框组件
│   │   │   ├── select.tsx   # 选择器组件
│   │   │   ├── tabs.tsx     # 标签页组件
│   │   │   └── slider.tsx   # 滑块组件
│   │   ├── Header.tsx       # 顶部导航栏组件
│   │   ├── TradingPairs.tsx # 左侧交易对列表组件
│   │   ├── ChartPanel.tsx   # 中间图表面板组件
│   │   ├── TradingViewChart.tsx # TradingView 图表组件
│   │   ├── TradingPanel.tsx # 右侧交易执行面板组件
│   │   └── AccountInfo.tsx  # 账户信息组件
│   ├── lib/
│   │   └── utils.ts         # 工具函数（cn 函数等）
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 应用入口文件
│   ├── index.css            # 全局样式文件
│   └── vite-env.d.ts        # Vite 环境类型定义
├── components.json          # shadcn/ui 配置文件
├── index.html               # HTML 模板
├── package.json             # 项目依赖配置
├── vite.config.ts           # Vite 配置文件
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.js       # TailwindCSS 配置
└── README.md                # 项目说明文档
```

## 功能特性

### 1. 顶部导航栏 (Header)
- **功能**: 显示平台 Logo、导航菜单和钱包连接按钮
- **组件位置**: `src/components/Header.tsx`
- **主要功能**:
  - 平台 Logo 展示
  - 导航菜单（交易、LP池、推荐、统计、排行榜、生态系统）
  - Privy 钱包连接/断开功能
  - 设置按钮

### 2. 交易对列表 (TradingPairs)
- **功能**: 显示可交易的金融产品列表
- **组件位置**: `src/components/TradingPairs.tsx`
- **主要功能**:
  - 显示多个交易对（XAU/USD、XAG/USD、WTI/USD、EUR/USD 等）
  - 实时价格和涨跌幅显示
  - 交易对选择功能
  - 可折叠/展开面板

### 3. 图表面板 (ChartPanel)
- **功能**: 显示选中交易对的详细信息和图表
- **组件位置**: `src/components/ChartPanel.tsx`
- **主要功能**:
  - 当前价格显示
  - 24小时成交量、最高价、最低价
  - TradingView 图表集成
  - 时间周期选择（1D、1W、1M）
  - 持仓、仓位历史、交易历史标签页

### 4. TradingView 图表 (TradingViewChart)
- **功能**: 使用 [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/) + WebSocket 渲染 K 线
- **组件位置**: `src/components/TradingViewChart.tsx`
- **数据源**: WebSocket `ws://54.153.138.55:8080/hub/tradingview?id=<随机id>`，id 由 `generateTradingViewWsId()` 生成
- **主要功能**:
  - 实时 K 线由 WebSocket 推送更新（`subscribeTradingViewWsBars`）
  - 深色主题、蜡烛图、响应式
  - 无需额外下载 Charting Library，开箱即用

### 5. 交易执行面板 (TradingPanel)
- **功能**: 提供交易执行界面
- **组件位置**: `src/components/TradingPanel.tsx`
- **主要功能**:
  - 交易对选择
  - 执行方式选择（市价单等）
  - 数量调整（快速按钮和手动输入）
  - 杠杆调节（1x-100x）
  - 止损/止盈设置
  - 买卖价格显示
  - 市价买入/卖出按钮

### 6. 账户信息 (AccountInfo)
- **功能**: 显示用户账户余额和盈亏信息
- **组件位置**: `src/components/AccountInfo.tsx`
- **主要功能**:
  - 账户总余额显示（美元和人民币）
  - 充值和提现按钮
  - 未实现盈亏显示
  - 已实现盈亏显示

## 安装和运行

### 前置要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）或 npm >= 9.0.0 或 yarn >= 1.22.0

### 安装步骤

1. **安装依赖**
```bash
# 推荐使用 pnpm
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

**注意**: 项目已配置好 shadcn/ui，`components.json` 已就绪。当前组件是手动创建的，功能正常。如需使用 CLI 添加新组件，请参考下方说明。

2. **配置环境变量**
创建 `.env` 文件并添加 Privy App ID：
```env
VITE_PRIVY_APP_ID=your-privy-app-id
```

获取 Privy App ID 的步骤：
1. 访问 [Privy Dashboard](https://dashboard.privy.io/)
2. 创建新应用或选择现有应用
3. 复制 App ID 到 `.env` 文件中

4. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

应用将在 `http://localhost:3000` 启动

5. **构建生产版本**
```bash
npm run build
# 或
yarn build
```

6. **预览生产构建**
```bash
npm run preview
# 或
yarn preview
```

## 配置说明

### Privy 钱包配置

在 `src/App.tsx` 中配置 Privy Provider：

```typescript
<PrivyProvider
  appId={import.meta.env.VITE_PRIVY_APP_ID}
  config={{
    loginMethods: ['wallet', 'email', 'sms'],
    appearance: {
      theme: 'dark',
      accentColor: '#FF6B35',
    },
  }}
>
```

**配置参数说明**:
- `appId`: Privy 应用 ID（从环境变量读取）
- `loginMethods`: 支持的登录方式（钱包、邮箱、短信）
- `appearance.theme`: 主题设置（dark/light）
- `appearance.accentColor`: 主题色

### TailwindCSS 和 shadcn/ui 配置

项目使用 shadcn/ui 作为 UI 组件库，所有组件都基于 Tailwind CSS 和 Radix UI 构建。

**主题颜色配置**:
- 主题颜色通过 CSS 变量在 `src/index.css` 中定义
- 支持深色主题，所有颜色使用 HSL 格式
- 主色调：`--primary: 13 77% 60%` (橙色)

**shadcn/ui 组件**:
- 所有 UI 组件位于 `src/components/ui/` 目录
- 组件可以直接修改和定制
- 使用 `cn()` 工具函数合并 Tailwind 类名

**使用 shadcn/ui CLI 添加组件**:

项目已配置好 `components.json`，可以直接使用 CLI 命令添加组件：

```bash
# 使用 pnpm（推荐）
pnpm dlx shadcn@latest add [component-name]

# 或使用 npx
npx shadcn@latest add [component-name]

# 示例：添加 dialog 组件
pnpm dlx shadcn@latest add dialog

# 添加多个组件
pnpm dlx shadcn@latest add dialog dropdown-menu tooltip
```

**当前已使用的组件**（已手动创建，功能正常）:
- `button` - 按钮组件
- `card` - 卡片组件
- `input` - 输入框组件
- `select` - 选择器组件
- `tabs` - 标签页组件
- `slider` - 滑块组件

**关于手动创建 vs CLI**:
- 当前组件是手动创建的，功能与 CLI 添加的完全相同
- shadcn/ui 的本质就是将组件代码复制到项目中，所以两种方式都可以
- 使用 CLI 的优势：自动安装依赖、确保使用最新版本、更符合官方推荐
- 如果需要，可以删除 `src/components/ui/` 目录，然后使用 CLI 重新添加所有组件

## 组件使用说明

### Header 组件
```tsx
import Header from './components/Header'

<Header />
```
- 自动处理钱包连接状态
- 支持登录/登出功能

### TradingPairs 组件
```tsx
import TradingPairs from './components/TradingPairs'

<TradingPairs />
```
- 显示所有可用交易对
- 点击交易对可切换选中状态

### ChartPanel 组件
```tsx
import ChartPanel from './components/ChartPanel'

<ChartPanel />
```
- 显示当前选中交易对的详细信息
- 集成 TradingView 图表

### TradingPanel 组件
```tsx
import TradingPanel from './components/TradingPanel'

<TradingPanel />
```
- 提供完整的交易执行界面
- 支持数量、杠杆等参数调整

### AccountInfo 组件
```tsx
import AccountInfo from './components/AccountInfo'

<AccountInfo />
```
- 显示账户余额和盈亏信息
- 提供充值和提现入口

## 开发指南

### 添加新的交易对

在 `src/components/TradingPairs.tsx` 中的 `tradingPairs` 数组中添加新项：

```typescript
{
  symbol: 'BTC/USD',
  name: '比特币',
  price: 45000.00,
  change: 2.5,
  changePercent: 2.5
}
```

### TradingView 图表与 WebSocket 数据

- 图表使用 TradingView Lightweight Charts，数据由 WebSocket 订阅提供（`src/lib/tradingview-ws-datafeed.ts` 中的 `subscribeTradingViewWsBars`）。
- WebSocket 地址：`ws://54.153.138.55:8080/hub/tradingview?id=<随机id>`，id 由 `src/lib/utils.ts` 中的 `generateTradingViewWsId()` 生成。
- 若后端推送的 K 线格式与默认不同，可修改 `tradingview-ws-datafeed.ts` 中的 `normalizeBar` 或消息解析逻辑。默认支持 `{ time, open, high, low, close, volume? }` 及 `o/h/l/c` 简写，time 支持秒或毫秒。

### 扩展交易功能

在 `src/components/TradingPanel.tsx` 中添加新的交易类型或参数。

## 已知问题和改进方向

### 当前限制
1. 图表使用 Lightweight Charts + WebSocket，数据已接入
2. 交易执行功能为 UI 展示，需要后端 API 支持
3. 账户信息为静态数据，需要连接真实账户系统

### 计划改进
1. **数据集成**
   - 若后端支持历史 K 线接口，可在 Datafeed 的 `getBars` 中对接，减少首屏空白
   - 集成行情/账户等其它 WebSocket 或 REST 接口

2. **交易功能**
   - 实现真实的交易执行逻辑
   - 添加订单管理功能
   - 实现止损/止盈功能

3. **用户体验**
   - 添加加载状态提示
   - 实现错误处理和提示
   - 优化移动端适配

4. **安全增强**
   - 实现交易签名验证
   - 添加风险提示
   - 完善权限控制

## 许可证

本项目为私有项目，未经授权不得使用。

## 联系方式

如有问题或建议，请联系开发团队。
�目，未经授权不得使用。

## 联系方式

如有问题或建议，请联系开发团队。
有项目，未经授权不得使用。

## 联系方式

如有问题或建议，请联系开发团队。
�目，未经授权不得使用。

## 联系方式

如有问题或建议，请联系开发团队。
