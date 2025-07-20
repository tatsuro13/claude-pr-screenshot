import * as childProcess from 'child_process';
import type { GitAnalysis, GitRepo } from '../types.js';

const { execSync } = childProcess;

export const detectGitHubRepo = async (): Promise<GitRepo | null> => {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(?:\.git)?$/);
    return match ? { owner: match[1], repo: match[2] } : null;
  } catch {
    return null;
  }
};

export const analyzeBranch = async (baseBranch: string, targetBranch: string): Promise<GitAnalysis> => {
  const diffOutput = execSync(`git diff ${baseBranch}..${targetBranch} --name-status`, { encoding: 'utf8' });
  const commitOutput = execSync(`git log ${baseBranch}..${targetBranch} --oneline`, { encoding: 'utf8' });
  
  const changedFiles = diffOutput
    .split('\n')
    .filter((line: string) => line.trim())
    .map((line: string) => line.split('\t')[1])
    .filter(Boolean);

  const commitMessages = commitOutput
    .split('\n')
    .filter((line: string) => line.trim());

  return {
    changedFiles,
    commitMessages,
    addedFiles: changedFiles.filter((file: string) => diffOutput.includes(`A\t${file}`)),
    modifiedFiles: changedFiles.filter((file: string) => diffOutput.includes(`M\t${file}`)),
    deletedFiles: changedFiles.filter((file: string) => diffOutput.includes(`D\t${file}`))
  };
};

export const getCurrentBranch = (): string => {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('現在のブランチを取得できませんでした。Gitリポジトリ内で実行してください。');
  }
};

export const checkUncommittedChanges = (): boolean => {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().length > 0;
  } catch {
    return false;
  }
};

export const checkBranchExists = (branchName: string): boolean => {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};