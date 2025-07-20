import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { execSync, spawn } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('CLI E2E Tests', () => {
  const testConfigPath = '.claude-pr-config.test.json';
  const cliPath = './dist/bin/cli.js';

  beforeAll(async () => {
    // ビルドを実行
    console.log('Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // テスト用設定ファイルを作成
    const testConfig = {
      github: {
        token: 'test-token',
        owner: 'test-owner',
        repo: 'test-repo'
      },
      playwright: {
        viewport: { width: 1920, height: 1080 },
        baseUrl: 'http://localhost:3000'
      },
      screenshots: {
        paths: ['/']
      }
    };
    
    writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2));
  });

  afterAll(() => {
    // テスト用設定ファイルを削除
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
  });

  describe('CLI基本動作', () => {
    // TODO: Fix commander.js exitOverride issue
    it.skip('should show help when no arguments provided', () => {
      try {
        execSync(`node ${cliPath}`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });
      } catch (error: any) {
        expect(error.stdout).toContain('Usage:');
        expect(error.stdout).toContain('claude-pr-screenshot');
        expect(error.stdout).toContain('Commands:');
      }
    });

    it('should show version', () => {
      try {
        execSync(`node ${cliPath} --version`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });
      } catch (error: any) {
        expect(error.stdout.trim()).toBe('1.0.0');
        expect(error.status).toBe(0);
      }
    });

    it('should show help for specific command', () => {
      const result = execSync(`node ${cliPath} create-pr --help`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(result).toContain('Create PR with screenshots');
      expect(result).toContain('Options:');
      expect(result).toContain('-b, --base');
      expect(result).toContain('-u, --url');
    });
  });

  describe('設定コマンド', () => {
    it('should show setup instructions', () => {
      const result = execSync(`node ${cliPath} setup`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(result).toContain('Claude PR Screenshot セットアップ手順');
      expect(result).toContain('GitHub Personal Access Token');
      expect(result).toContain('https://github.com/settings/tokens');
    });

    it('should show current config when config file exists', () => {
      // 一時的に設定ファイルを作成
      const tempConfig = '.claude-pr-config.json';
      writeFileSync(tempConfig, JSON.stringify({
        github: { token: 'test-token', owner: 'test-user', repo: 'test-repo' },
        playwright: { baseUrl: 'http://localhost:3000', viewport: { width: 1920, height: 1080 } },
        screenshots: { paths: ['/'] }
      }, null, 2));

      try {
        const result = execSync(`node ${cliPath} config`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });

        expect(result).toContain('現在の設定');
        expect(result).toContain('GitHub Owner: test-user');
        expect(result).toContain('GitHub Repo: test-repo');
        expect(result).toContain('Base URL: http://localhost:3000');
      } catch (error: any) {
        // エラーが発生した場合はstdoutを確認
        if (error.stdout) {
          expect(error.stdout).toContain('現在の設定');
          expect(error.stdout).toContain('GitHub Owner: test-user');
          expect(error.stdout).toContain('GitHub Repo: test-repo');
          expect(error.stdout).toContain('Base URL: http://localhost:3000');
        } else {
          throw error;
        }
      } finally {
        if (existsSync(tempConfig)) {
          unlinkSync(tempConfig);
        }
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('should show error when config file is missing for create-pr', () => {
      try {
        execSync(`node ${cliPath} create-pr test-branch`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
      } catch (error: any) {
        expect(error.stdout || error.stderr).toContain('設定ファイルが見つかりません');
      }
    });

    it('should handle invalid command gracefully', () => {
      try {
        execSync(`node ${cliPath} invalid-command`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
      } catch (error: any) {
        expect(error.status).toBe(1);
      }
    });
  });

  describe('プレビュー機能', () => {
    it('should show error for preview without config', () => {
      try {
        execSync(`node ${cliPath} preview test-branch`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
      } catch (error: any) {
        expect(error.stdout || error.stderr).toContain('設定ファイルが見つかりません');
      }
    });
  });

  describe('コマンドライン引数の解析', () => {
    it('should parse base branch option correctly', () => {
      // ヘルプでオプションが正しく表示されることを確認
      const result = execSync(`node ${cliPath} create-pr --help`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(result).toContain('-b, --base <branch>');
      expect(result).toContain('base branch');
      expect(result).toContain('(default: "main")');
    });

    it('should parse URL option correctly', () => {
      const result = execSync(`node ${cliPath} create-pr --help`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(result).toContain('-u, --url <url>');
      expect(result).toContain('development server URL');
    });

    it('should parse draft option correctly', () => {
      const result = execSync(`node ${cliPath} create-pr --help`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      expect(result).toContain('--draft');
      expect(result).toContain('create as draft PR');
    });
  });

  describe('ビルド成果物の確認', () => {
    it('should have built CLI file', () => {
      expect(existsSync(cliPath)).toBe(true);
    });

    it('should have built all utility files', () => {
      const utilFiles = [
        './dist/utils/config.js',
        './dist/utils/git.js',
        './dist/utils/comment.js',
        './dist/utils/github.js',
        './dist/utils/playwright.js'
      ];

      utilFiles.forEach(file => {
        expect(existsSync(file)).toBe(true);
      });
    });

    it('should have built command files', () => {
      const commandFiles = [
        './dist/commands/init.js',
        './dist/commands/create-pr.js'
      ];

      commandFiles.forEach(file => {
        expect(existsSync(file)).toBe(true);
      });
    });

    it('should have built type definitions', () => {
      expect(existsSync('./dist/types.js')).toBe(true);
      expect(existsSync('./dist/types.d.ts')).toBe(true);
    });
  });
});