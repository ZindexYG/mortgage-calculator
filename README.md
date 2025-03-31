# 房贷方案计算器

一个简洁、响应式的房贷计算器 Web 应用，基于 React、TypeScript 和 Semi Design UI 构建，帮助您快速计算和比较不同的房贷方案。

## 功能特点

- 根据房屋总价、首付金额、贷款利率和贷款期限计算月供
- 输入参数变化时实时更新计算结果
- 自动保存历史计算方案，并使用表情符号区分
- 一键复制房贷方案详情，方便分享
- 响应式设计，同时适配移动端和桌面端设备

## 技术栈

- React 19
- TypeScript 5.7
- Vite 6（构建工具）
- Semi Design UI（字节跳动开源组件库）
- TailwindCSS（样式工具）
- CSS 变量（主题定制）

## 快速开始

### 环境要求

- Node.js 16+ 和 npm/yarn/pnpm

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/yourusername/mortgage-calculator.git
cd mortgage-calculator

# 安装依赖
npm install
# 或使用 yarn
yarn
# 或使用 pnpm
pnpm install

# 启动开发服务器
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

然后在浏览器中打开 http://localhost:5173 访问应用。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

构建后的文件将位于 `dist` 目录中。

## 环境变量配置

通过创建 `.env` 文件可以配置房贷计算器的默认值。支持的环境变量有：

```
# .env 文件示例

# 默认房屋总价
VITE_DEFAULT_TOTAL_PRICE=1000000

# 默认首付金额(60万)
VITE_DEFAULT_DOWN_PAYMENT=400000

# 默认贷款利率(%)
VITE_DEFAULT_INTEREST_RATE=3.15

# 默认贷款期限(月) - 30年
VITE_DEFAULT_LOAN_TERM=360

```

要使用这些配置，请在项目根目录创建 `.env` 文件，或者复制 `.env.example` 并根据需要修改值。

## 开发说明

房贷计算器主要由三部分组成：

1. 输入表单 - 用于设置房贷计算参数
2. 贷款方案 - 展示当前计算结果，包括月供和贷款详情
3. 历史方案 - 记录之前的计算结果，可一键恢复或复制

所有计算在客户端进行，无需后端服务，确保用户数据的私密性。

## 许可证

MIT
