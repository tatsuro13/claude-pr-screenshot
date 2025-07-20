export type Config = {
  github: {
    token: string;
    owner: string;
    repo: string;
  };
  playwright: {
    viewport: { width: number; height: number };
    baseUrl: string;
  };
  screenshots: {
    paths: string[];
    selectors?: Record<string, string>;
  };
};

export type GitAnalysis = {
  changedFiles: string[];
  commitMessages: string[];
  addedFiles: string[];
  modifiedFiles: string[];
  deletedFiles: string[];
};

export type Screenshot = {
  name: string;
  path: string;
  image?: string; // base64 (optional for backward compatibility)
  githubUrl?: string; // GitHub hosted image URL
  placement: string;
};

export type PROptions = {
  branch: string;
  base: string;
  url: string;
};

export type GitRepo = {
  owner: string;
  repo: string;
};

export type CommentTemplate = {
  title: string;
  sections: {
    overview: string;
    changes: string;
    screenshots: string;
    testing: string;
  };
};

export type InquirerAnswers = {
  githubToken: string;
  owner: string;
  repo: string;
  baseUrl: string;
  screenshotPaths: string;
};