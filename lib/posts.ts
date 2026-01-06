import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';

export interface Post {
  id: string;
  date: string;
  edited?: string;
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'data');

export async function getAllPosts(): Promise<Post[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    fileNames
      .filter(fileName => fileName.endsWith('.md'))
      .map(async (fileName) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const stats = fs.statSync(fullPath);
        const matterResult = matter(fileContents);
        const processedContent = await remark()
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkRehype)
          .use(rehypeKatex)
          .use(rehypePrettyCode, {
            theme: {
              light: 'one-light',
              dark: 'github-dark',
            },
          })
          .use(rehypeStringify)
          .process(matterResult.content);
        const content = processedContent.toString();

        const publishDate = new Date(matterResult.data.date);
        const modifiedDate = stats.mtime;
        const edited = Math.abs(modifiedDate.getTime() - publishDate.getTime()) > 60000
          ? modifiedDate.toISOString()
          : undefined;

        return {
          id,
          date: matterResult.data.date,
          edited,
          content,
        };
      })
  );

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}
