import { Octokit } from '@octokit/rest';
import type { Config } from '../types.js';

export const createPullRequest = async (
  config: Config,
  headBranch: string,
  baseBranch: string,
  body: string
): Promise<string> => {
  const octokit = new Octokit({
    auth: config.github.token,
  });

  try {
    const response = await octokit.rest.pulls.create({
      owner: config.github.owner,
      repo: config.github.repo,
      title: generatePRTitle(headBranch),
      head: headBranch,
      base: baseBranch,
      body,
      draft: false,
    });

    return response.data.html_url;
  } catch (error: any) {
    if (error.status === 422) {
      throw new Error(`PR作成エラー: ${headBranch} → ${baseBranch} のPRは既に存在するか、ブランチに差分がありません。`);
    }
    throw new Error(`GitHub API エラー: ${error.message}`);
  }
};

export const updatePullRequest = async (
  config: Config,
  prNumber: number,
  body: string,
  title?: string
): Promise<void> => {
  const octokit = new Octokit({
    auth: config.github.token,
  });

  try {
    await octokit.rest.pulls.update({
      owner: config.github.owner,
      repo: config.github.repo,
      pull_number: prNumber,
      body,
      ...(title && { title }),
    });
  } catch (error: any) {
    throw new Error(`PR更新エラー: ${error.message}`);
  }
};

export const addCommentToPR = async (
  config: Config,
  prNumber: number,
  comment: string
): Promise<void> => {
  const octokit = new Octokit({
    auth: config.github.token,
  });

  try {
    await octokit.rest.issues.createComment({
      owner: config.github.owner,
      repo: config.github.repo,
      issue_number: prNumber,
      body: comment,
    });
  } catch (error: any) {
    throw new Error(`コメント追加エラー: ${error.message}`);
  }
};

export const findExistingPR = async (
  config: Config,
  headBranch: string,
  baseBranch: string
): Promise<number | null> => {
  const octokit = new Octokit({
    auth: config.github.token,
  });

  try {
    const response = await octokit.rest.pulls.list({
      owner: config.github.owner,
      repo: config.github.repo,
      head: `${config.github.owner}:${headBranch}`,
      base: baseBranch,
      state: 'open',
    });

    return response.data.length > 0 ? response.data[0].number : null;
  } catch (error: any) {
    throw new Error(`PR検索エラー: ${error.message}`);
  }
};

const generatePRTitle = (branchName: string): string => {
  // ブランチ名からPRタイトルを生成
  const cleanBranchName = branchName
    .replace(/^(feature|fix|hotfix|bugfix|chore)\//, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  return cleanBranchName || `Update from ${branchName}`;
};

export const validateGitHubToken = async (token: string): Promise<boolean> => {
  const octokit = new Octokit({ auth: token });

  try {
    await octokit.rest.users.getAuthenticated();
    return true;
  } catch {
    return false;
  }
};

export const getRepositoryInfo = async (config: Config) => {
  const octokit = new Octokit({
    auth: config.github.token,
  });

  try {
    const response = await octokit.rest.repos.get({
      owner: config.github.owner,
      repo: config.github.repo,
    });

    return {
      name: response.data.name,
      fullName: response.data.full_name,
      defaultBranch: response.data.default_branch,
      private: response.data.private,
    };
  } catch (error: any) {
    throw new Error(`リポジトリ情報取得エラー: ${error.message}`);
  }
};