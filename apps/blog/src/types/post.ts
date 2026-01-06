export interface PostMetadata {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  author?: string;
  image?: string;
}

export interface Post extends PostMetadata {
  slug: string;
  content: string;
}
