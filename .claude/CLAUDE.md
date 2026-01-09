# Microblog 项目开发指南

## 项目概述

这是一个基于 Next.js 16 构建的个人微博客系统，支持 Markdown 文章发布、代码高亮、数学公式渲染等功能。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **包管理器**: pnpm 9.15.1
- **Markdown 处理**: gray-matter + remark + rehype
- **代码高亮**: Shiki + rehype-pretty-code
- **数学公式**: KaTeX
- **UI 组件**: Radix UI + Lucide React

## 代码规范

### 格式要求（强制）

- **缩进**: 必须使用 **Tab** 缩进，严禁使用空格
- **分号**: 禁止在语句末尾使用分号
- **引号**: 优先使用单引号 `''`，除非字符串内包含单引号
- **末尾逗号**: 多行对象/数组末尾必须添加逗号
- **大括号**: 采用 1TBS 风格（左大括号与控制语句同行）

### TypeScript 规范

- 优先使用类型推导，避免冗余类型标注
- 使用 `interface` 定义对象类型，`type` 用于联合类型和工具类型
- 组件 props 使用 `interface` 定义
- 避免使用 `any`，必要时使用 `unknown`

### React 规范

- 优先使用函数组件和 Hooks
- 组件文件使用 PascalCase 命名（如 `Header.tsx`）
- 工具函数文件使用 camelCase 命名（如 `posts.ts`）
- 使用 `'use client'` 明确标记客户端组件
- 服务端组件默认为 async 函数

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── about/             # 关于页面
│   ├── songs/             # 歌曲页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── error.tsx          # 错误页面
│   └── not-found.tsx      # 404 页面
├── components/            # React 组件
│   ├── ui/               # UI 基础组件（shadcn/ui）
│   ├── Header.tsx        # 头部导航
│   ├── ThemeToggle.tsx   # 主题切换
│   ├── Timeline.tsx      # 时间线组件
│   ├── SongList.tsx      # 歌曲列表
│   └── CopyButton.tsx    # 复制按钮
├── lib/                   # 工具函数库
│   ├── posts.ts          # 文章处理逻辑
│   ├── songs.ts          # 歌曲数据处理
│   └── utils.ts          # 通用工具函数
├── data/                  # 数据文件
│   ├── *.md              # Markdown 文章
│   ├── songs.csv         # 歌曲数据
│   └── avatar.png        # 头像图片
├── public/               # 静态资源
└── .claude/              # Claude 配置
```

## 开发工作流

### 启动开发

```bash
pnpm dev          # 启动开发服务器（http://localhost:3000）
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行 ESLint 检查
```

### 添加新文章

1. 在 `data/` 目录创建新的 `.md` 文件
2. 文件开头添加 frontmatter：
   ```yaml
   ---
   title: 文章标题
   date: YYYY-MM-DD
   ---
   ```
3. 使用 Markdown 编写内容，支持 GFM、数学公式、代码高亮

### 添加新组件

1. 在 `components/` 目录创建组件文件
2. 如需客户端交互，添加 `'use client'` 指令
3. 使用 Tailwind CSS 编写样式
4. 导出组件供页面使用

### 修改样式

- 全局样式：修改 `app/globals.css`
- 组件样式：使用 Tailwind CSS 类名
- 自定义主题：修改 Tailwind 配置

## 重要注意事项

### Markdown 处理

- 文章存储在 `data/` 目录，使用 `.md` 扩展名
- `lib/posts.ts` 负责读取和解析 Markdown 文件
- 支持 frontmatter 元数据（title、date、updatedAt）
- 使用 remark 和 rehype 插件链处理内容

### 代码高亮

- 使用 Shiki 进行语法高亮
- 配置在 `lib/posts.ts` 的 rehype-pretty-code 插件中
- 支持多种主题和语言

### 数学公式

- 使用 remark-math 和 rehype-katex 处理
- 行内公式：`$formula$`
- 块级公式：`$$formula$$`

### 路由结构

- `/` - 首页（文章时间线）
- `/about` - 关于页面
- `/songs` - 歌曲页面
- 使用 Next.js App Router，文件系统即路由

### 部署

- 项目配置了 Vercel 部署（`vercel.json`）
- 推送到 main 分支自动触发部署
- 构建命令：`pnpm build`
- 输出目录：`.next`

## Git 提交规范

- 使用简体中文编写 commit message
- 格式：`feat: 功能描述` / `fix: 修复描述` / `refactor: 重构描述`
- 提交前确保代码符合格式规范
- 避免提交 `node_modules`、`.next`、`.env` 等文件

## 常见任务

### 修改文章

1. 编辑 `data/` 目录下的对应 `.md` 文件
2. 更新 frontmatter 中的 `updatedAt` 字段
3. 保存后开发服务器自动刷新

### 添加新页面

1. 在 `app/` 目录创建新文件夹
2. 添加 `page.tsx` 文件
3. 导出 React 组件作为页面内容

### 修改导航

- 编辑 `components/Header.tsx`
- 更新导航链接和样式

### 调试问题

- 查看浏览器控制台错误信息
- 检查终端中的 Next.js 构建输出
- 使用 React DevTools 检查组件状态
- 查看 `.next` 目录下的构建产物

## 性能优化建议

- 使用 Next.js Image 组件优化图片加载
- 合理使用服务端组件和客户端组件
- 避免不必要的客户端 JavaScript
- 使用动态导入（dynamic import）按需加载组件
- 利用 Next.js 的静态生成（SSG）能力

## 安全注意事项

- 不要在代码中硬编码敏感信息
- 使用环境变量管理配置
- 验证和清理用户输入
- 定期更新依赖包版本
