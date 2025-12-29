# Microblog

个人微博客，基于 Next.js 构建的现代化博客系统。

## 技术栈

- **框架**: Next.js 16 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **Markdown**: gray-matter, remark, rehype
- **代码高亮**: Shiki + rehype-pretty-code
- **数学公式**: KaTeX
- **UI 组件**: Radix UI, Lucide React

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/              # Next.js App Router
│   ├── about/        # 关于页面
│   ├── songs/        # 歌曲页面
│   └── page.tsx      # 首页
├── components/       # React 组件
├── data/            # 数据文件
├── lib/             # 工具函数
└── public/          # 静态资源
```

## 功能特性

- 📝 Markdown 文章支持
- 🎨 代码语法高亮
- 🧮 数学公式渲染
- 🌓 深色模式
- 📱 响应式设计
- ⚡ 性能优化

## 部署

项目已配置 Vercel 部署，推送到主分支即可自动部署。

## 作者

**14K** - 前端开发者

- GitHub: [@14Kay](https://github.com/14Kay)
- Email: rsndm.14k@gmail.com
