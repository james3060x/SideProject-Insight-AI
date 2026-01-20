
export interface RedditPost {
  id: string;
  title: string;
  author: string;
  selftext: string;
  url: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

export interface ProjectInsight {
  projectName: string;
  projectIntro: string;
  problemSolved: string;
  customerPersona: string;
  solution: string;
  externalLink: string;
}

export interface AIReadyPrompt {
  summary: ProjectInsight;
  developerPrompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  FETCHING_REDDIT = 'FETCHING_REDDIT',
  ANALYZING_AI = 'ANALYZING_AI',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
