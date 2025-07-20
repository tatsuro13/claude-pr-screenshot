import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { detectGitHubRepo, analyzeBranch, getCurrentBranch, checkUncommittedChanges, checkBranchExists } from '../../../src/utils/git';
import * as childProcess from 'child_process';

// childProcessのモック
jest.mock('child_process');
const mockedChildProcess = childProcess as jest.Mocked<typeof childProcess>;

describe('git.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('detectGitHubRepo', () => {
    it('should detect GitHub repository from HTTPS URL', async () => {
      mockedChildProcess.execSync.mockReturnValue('https://github.com/user/repo.git\n');

      const result = await detectGitHubRepo();

      expect(result).toEqual({
        owner: 'user',
        repo: 'repo'
      });
      expect(mockedChildProcess.execSync).toHaveBeenCalledWith(
        'git remote get-url origin',
        { encoding: 'utf8' }
      );
    });

    it('should detect GitHub repository from SSH URL', async () => {
      mockedChildProcess.execSync.mockReturnValue('git@github.com:user/repo.git\n');

      const result = await detectGitHubRepo();

      expect(result).toEqual({
        owner: 'user',
        repo: 'repo'
      });
    });

    it('should detect GitHub repository without .git suffix', async () => {
      mockedChildProcess.execSync.mockReturnValue('https://github.com/user/repo\n');

      const result = await detectGitHubRepo();

      expect(result).toEqual({
        owner: 'user',
        repo: 'repo'
      });
    });

    it('should return null for non-GitHub URLs', async () => {
      mockedChildProcess.execSync.mockReturnValue('https://gitlab.com/user/repo.git\n');

      const result = await detectGitHubRepo();

      expect(result).toBeNull();
    });

    it('should return null when git command fails', async () => {
      mockedChildProcess.execSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      const result = await detectGitHubRepo();

      expect(result).toBeNull();
    });

    it('should handle malformed URLs', async () => {
      mockedChildProcess.execSync.mockReturnValue('invalid-url\n');

      const result = await detectGitHubRepo();

      expect(result).toBeNull();
    });
  });

  describe('analyzeBranch', () => {
    it('should analyze branch differences correctly', async () => {
      const mockDiffOutput = 'A\tsrc/new-file.ts\nM\tsrc/existing-file.ts\nD\tsrc/old-file.ts\n';
      const mockCommitOutput = 'abc123 Add new feature\ndef456 Fix bug in existing file\n';

      mockedChildProcess.execSync
        .mockReturnValueOnce(mockDiffOutput)
        .mockReturnValueOnce(mockCommitOutput);

      const result = await analyzeBranch('main', 'feature-branch');

      expect(result).toEqual({
        changedFiles: ['src/new-file.ts', 'src/existing-file.ts', 'src/old-file.ts'],
        commitMessages: ['abc123 Add new feature', 'def456 Fix bug in existing file'],
        addedFiles: ['src/new-file.ts'],
        modifiedFiles: ['src/existing-file.ts'],
        deletedFiles: ['src/old-file.ts']
      });

      expect(mockedChildProcess.execSync).toHaveBeenCalledWith(
        'git diff main..feature-branch --name-status',
        { encoding: 'utf8' }
      );
      expect(mockedChildProcess.execSync).toHaveBeenCalledWith(
        'git log main..feature-branch --oneline',
        { encoding: 'utf8' }
      );
    });

    it('should handle empty diff output', async () => {
      mockedChildProcess.execSync
        .mockReturnValueOnce('')
        .mockReturnValueOnce('');

      const result = await analyzeBranch('main', 'feature-branch');

      expect(result).toEqual({
        changedFiles: [],
        commitMessages: [],
        addedFiles: [],
        modifiedFiles: [],
        deletedFiles: []
      });
    });

    it('should filter out empty lines', async () => {
      const mockDiffOutput = 'A\tsrc/file1.ts\n\nM\tsrc/file2.ts\n\n';
      const mockCommitOutput = 'abc123 Commit 1\n\ndef456 Commit 2\n\n';

      mockedChildProcess.execSync
        .mockReturnValueOnce(mockDiffOutput)
        .mockReturnValueOnce(mockCommitOutput);

      const result = await analyzeBranch('main', 'feature-branch');

      expect(result.changedFiles).toEqual(['src/file1.ts', 'src/file2.ts']);
      expect(result.commitMessages).toEqual(['abc123 Commit 1', 'def456 Commit 2']);
    });

    it('should handle malformed diff output gracefully', async () => {
      const mockDiffOutput = 'invalid-line\nA\tsrc/valid-file.ts\n';
      const mockCommitOutput = 'abc123 Valid commit\n';

      mockedChildProcess.execSync
        .mockReturnValueOnce(mockDiffOutput)
        .mockReturnValueOnce(mockCommitOutput);

      const result = await analyzeBranch('main', 'feature-branch');

      expect(result.changedFiles).toEqual(['src/valid-file.ts']);
      expect(result.addedFiles).toEqual(['src/valid-file.ts']);
    });
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', () => {
      mockedChildProcess.execSync.mockReturnValue('feature-branch\n');

      const result = getCurrentBranch();

      expect(result).toBe('feature-branch');
      expect(mockedChildProcess.execSync).toHaveBeenCalledWith(
        'git branch --show-current',
        { encoding: 'utf8' }
      );
    });

    it('should throw error when not in git repository', () => {
      mockedChildProcess.execSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      expect(() => getCurrentBranch()).toThrow(
        '現在のブランチを取得できませんでした。Gitリポジトリ内で実行してください。'
      );
    });

    it('should handle empty branch name', () => {
      mockedChildProcess.execSync.mockReturnValue('\n');

      const result = getCurrentBranch();

      expect(result).toBe('');
    });
  });

  describe('checkUncommittedChanges', () => {
    it('should return true when there are uncommitted changes', () => {
      mockedChildProcess.execSync.mockReturnValue('M src/file.ts\n?? new-file.ts\n');

      const result = checkUncommittedChanges();

      expect(result).toBe(true);
      expect(mockedChildProcess.execSync).toHaveBeenCalledWith(
        'git status --porcelain',
        { encoding: 'utf8' }
      );
    });

    it('should return false when there are no uncommitted changes', () => {
      mockedChildProcess.execSync.mockReturnValue('');

      const result = checkUncommittedChanges();

      expect(result).toBe(false);
    });

    it('should return false when git command fails', () => {
      mockedChildProcess.execSync.mockImplementation(() => {
        throw new Error('Not a git repository');
      });

      const result = checkUncommittedChanges();

      expect(result).toBe(false);
    });

    it('should handle whitespace-only output', () => {
      mockedChildProcess.execSync.mockReturnValue('   \n  \n');

      const result = checkUncommittedChanges();

      expect(result).toBe(false);
    });
  });

  describe('checkBranchExists', () => {
    it('should return true when branch exists', () => {
      mockedChildProcess.execSync.mockReturnValue('');

      const result = checkBranchExists('feature-branch');

      expect(result).toBe(true);
      expect(mockedChildProcess.execSync).toHaveBeenCalledWith(
        'git show-ref --verify --quiet refs/heads/feature-branch',
        { stdio: 'ignore' }
      );
    });

    it('should return false when branch does not exist', () => {
      mockedChildProcess.execSync.mockImplementation(() => {
        throw new Error('Branch not found');
      });

      const result = checkBranchExists('non-existent-branch');

      expect(result).toBe(false);
    });

    it('should handle special characters in branch names', () => {
      mockedChildProcess.execSync.mockReturnValue('');

      const result = checkBranchExists('feature/user-auth');

      expect(result).toBe(true);
      expect(mockedChildProcess.execSync).toHaveBeenCalledWith(
        'git show-ref --verify --quiet refs/heads/feature/user-auth',
        { stdio: 'ignore' }
      );
    });
  });
});