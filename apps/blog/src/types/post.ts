export interface PostMetadata {
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  tags?: string[];
  author?: string;
  image?: string;
  coverImage?: string;
  published?: boolean;
}

export interface Post extends PostMetadata {
  slug: string;
  content: string;
}
