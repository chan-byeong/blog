export interface AdminPostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedAt?: string;
  tags?: string[];
  author?: string;
  image?: string;
  coverImage?: string;
  published: boolean;
}
