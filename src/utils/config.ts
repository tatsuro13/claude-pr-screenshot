import * as fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const { existsSync } = fs;
import type { Config } from '../types.js';

export const loadConfig = async (): Promise<Config> => {
  const configPath = '.claude-pr-config.json';
  
  if (!existsSync(configPath)) {
    throw new Error(
      '設定ファイルが見つかりません。先に `claude-pr-screenshot init` を実行してください。'
    );
  }

  try {
    const configContent = await readFile(configPath, 'utf8');
    const config = JSON.parse(configContent) as Config;
    
    // 必須フィールドの検証
    if (!config.github?.token) {
      throw new Error('GitHub tokenが設定されていません。');
    }
    
    if (!config.github?.owner || !config.github?.repo) {
      throw new Error('GitHub owner/repoが設定されていません。');
    }
    
    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('設定ファイルのJSONが不正です。');
    }
    throw error;
  }
};

export const validateConfig = (config: Config): void => {
  const requiredFields = [
    'github.token',
    'github.owner', 
    'github.repo',
    'playwright.baseUrl',
    'screenshots.paths'
  ];

  for (const field of requiredFields) {
    const keys = field.split('.');
    let current: any = config;
    
    for (const key of keys) {
      if (current[key] === undefined || current[key] === null) {
        throw new Error(`設定項目 '${field}' が不足しています。`);
      }
      current = current[key];
    }
  }

  if (!Array.isArray(config.screenshots.paths) || config.screenshots.paths.length === 0) {
    throw new Error('screenshots.pathsは空でない配列である必要があります。');
  }
};