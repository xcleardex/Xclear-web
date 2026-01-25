# shadcn/ui 使用指南

## 当前状态

项目已配置好 shadcn/ui，`components.json` 配置文件已就绪。当前项目中的 UI 组件是手动创建的，功能完全正常。

## 使用 CLI 添加新组件（推荐方式）

### 基本用法

```bash
# 使用 pnpm（推荐）
pnpm dlx shadcn@latest add [component-name]

# 或使用 npx
npx shadcn@latest add [component-name]
```

### 示例

```bash
# 添加单个组件
pnpm dlx shadcn@latest add dialog

# 添加多个组件
pnpm dlx shadcn@latest add dialog dropdown-menu tooltip popover

# 查看所有可用组件
pnpm dlx shadcn@latest add
```

### 常用组件列表

以下是一些常用的 shadcn/ui 组件，可以根据需要添加：

- `dialog` - 对话框/模态框
- `dropdown-menu` - 下拉菜单
- `popover` - 弹出框
- `tooltip` - 工具提示
- `alert` - 警告框
- `toast` -  toast 通知
- `table` - 表格
- `form` - 表单
- `label` - 标签
- `textarea` - 多行输入
- `checkbox` - 复选框
- `radio-group` - 单选按钮组
- `switch` - 开关
- `separator` - 分隔线
- `badge` - 徽章
- `avatar` - 头像
- `skeleton` - 骨架屏

## 重新初始化组件（可选）

如果你想使用 CLI 重新添加所有当前使用的组件（确保使用最新版本），可以：

1. 删除手动创建的组件：
```bash
rm -rf src/components/ui
```

2. 使用 CLI 重新添加：
```bash
pnpm dlx shadcn@latest add button card input select tabs slider
```

## 配置说明

项目的 `components.json` 配置：

- **style**: `default` - 使用默认样式
- **rsc**: `false` - 不使用 React Server Components
- **tsx**: `true` - 使用 TypeScript
- **cssVariables**: `true` - 使用 CSS 变量（支持主题切换）
- **aliases**: 
  - `components`: `@/components`
  - `utils`: `@/lib/utils`

## 注意事项

1. CLI 会自动安装所需的 Radix UI 依赖
2. 组件代码会直接添加到 `src/components/ui/` 目录
3. 可以随时修改组件代码以满足项目需求
4. 使用 CLI 添加的组件与手动创建的组件功能相同

## 更多信息

- [shadcn/ui 官方文档](https://ui.shadcn.com/)
- [所有可用组件列表](https://ui.shadcn.com/docs/components)
