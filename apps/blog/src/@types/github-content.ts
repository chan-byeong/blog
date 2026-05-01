export interface GitHubContentConfig {
  owner: string;
  repo: string;
  branch: string;
  token?: string;
}

export interface GitHubContentItem {
  name: string;
  type: string;
}

export interface GitHubFileContent {
  type: string;
  encoding?: string;
  content?: string;
}

export interface GitHubRequestError {
  status: number;
  message: string;
}

export interface PostSource {
  slug: string;
  source: string;
}
