import Timeline from '@/components/Timeline';
import { getAllPosts } from '@/lib/posts';

export default async function Home() {
  const posts = await getAllPosts();

  return <Timeline posts={posts} />;
}
