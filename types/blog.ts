export interface BlogArticle {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  author: string;
  authorAvatar: string;
  date: string;
  image: string;
  category: string;
  readTime: number;
  views?: number;
}
