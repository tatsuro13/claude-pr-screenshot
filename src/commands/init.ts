import inquirer from 'inquirer';
import * as fs from 'fs';
import { promisify } from 'util';
import { detectGitHubRepo } from '../utils/git.js';
import type { Config, InquirerAnswers } from '../types.js';

const writeFile = promisify(fs.writeFile);

export const initConfig = async (): Promise<void> => {
  console.log('🚀 Claude PR Screenshot の初期設定');

  const gitRepo = await detectGitHubRepo();
  
  const answers = await inquirer.prompt<InquirerAnswers>([
    {
      type: 'input',
      name: 'githubToken',
      message: 'GitHub Personal Access Token:',
      validate: (input: string) => input.length > 0 || 'トークンを入力してください'
    },
    {
      type: 'input',
      name: 'owner',
      message: 'GitHub Owner:',
      default: gitRepo?.owner
    },
    {
      type: 'input',
      name: 'repo',
      message: 'Repository Name:',
      default: gitRepo?.repo
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'Development Server URL:',
      default: 'http://localhost:3000'
    },
    {
      type: 'input',
      name: 'screenshotPaths',
      message: 'Screenshot paths (comma separated):',
      default: '/, /about, /contact'
    }
  ]);

  const config: Config = {
    github: {
      token: answers.githubToken,
      owner: answers.owner,
      repo: answers.repo
    },
    playwright: {
      viewport: { width: 1920, height: 1080 },
      baseUrl: answers.baseUrl
    },
    screenshots: {
      paths: answers.screenshotPaths.split(',').map((p: string) => p.trim())
    }
  };

  await writeFile('.claude-pr-config.json', JSON.stringify(config, null, 2));
  console.log('✅ 設定ファイルを作成しました: .claude-pr-config.json');
  
  // .gitignoreに設定ファイルを追加
  await addToGitignore();
};

const addToGitignore = async (): Promise<void> => {
  const gitignorePath = '.gitignore';
  const configEntry = '.claude-pr-config.json';
  
  try {
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    if (!gitignoreContent.includes(configEntry)) {
      const newContent = gitignoreContent.trim() + '\n\n# Claude PR Screenshot config\n' + configEntry + '\n';
      await writeFile(gitignorePath, newContent);
      console.log('✅ .gitignore に設定ファイルを追加しました');
    }
  } catch (error) {
    console.warn('⚠️  .gitignore の更新に失敗しました:', error);
  }
};

export const validateInitialSetup = (): boolean => {
  return fs.existsSync('.claude-pr-config.json');
};

export const showSetupInstructions = (): void => {
  console.log(`
🚀 Claude PR Screenshot セットアップ手順:

1. GitHub Personal Access Token を取得:
   - https://github.com/settings/tokens にアクセス
   - "Generate new token (classic)" をクリック
   - 必要な権限: repo, workflow

2. 初期設定を実行:
   npx claude-pr-screenshot init

3. 使用方法:
   npx claude-pr-screenshot create-pr <branch-name>
   
   または Claude Code 内で:
   /pr-ready <branch-name>

詳細: https://github.com/your-repo/claude-pr-screenshot
  `);
};