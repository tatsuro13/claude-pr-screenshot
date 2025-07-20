#!/usr/bin/env node

import { Command } from 'commander';
import { initConfig, validateInitialSetup, showSetupInstructions } from '../commands/init.js';
import { createPR, showPRPreview } from '../commands/create-pr.js';

const program = new Command();

program
  .name('claude-pr-screenshot')
  .description('Claude Code PR automation with screenshots')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize configuration')
  .action(async () => {
    try {
      await initConfig();
    } catch (error) {
      console.error('❌ 初期化エラー:', error instanceof Error ? error.message : error);
      // process.exit(1);
    }
  });

program
  .command('create-pr <branch>')
  .option('-b, --base <branch>', 'base branch', 'main')
  .option('-u, --url <url>', 'development server URL')
  .option('--draft', 'create as draft PR')
  .description('Create PR with screenshots')
  .action(async (branch: string, options: any) => {
    try {
      if (!validateInitialSetup()) {
        console.error('❌ 設定ファイルが見つかりません。先に `claude-pr-screenshot init` を実行してください。');
        return;
      }
      
      await createPR(branch, {
        base: options.base,
        url: options.url,
        branch
      });
    } catch (error) {
      console.error('❌ PR作成エラー:', error instanceof Error ? error.message : error);
      // process.exit(1);
    }
  });

program
  .command('preview <branch>')
  .option('-b, --base <branch>', 'base branch', 'main')
  .option('-u, --url <url>', 'development server URL')
  .description('Preview PR comment without creating')
  .action(async (branch: string, options: any) => {
    try {
      if (!validateInitialSetup()) {
        console.error('❌ 設定ファイルが見つかりません。先に `claude-pr-screenshot init` を実行してください。');
        return;
      }
      
      await showPRPreview(branch, {
        base: options.base,
        url: options.url,
        branch
      });
    } catch (error) {
      console.error('❌ プレビューエラー:', error instanceof Error ? error.message : error);
    }
  });

program
  .command('setup')
  .description('Show setup instructions')
  .action(() => {
    showSetupInstructions();
  });

program
  .command('config')
  .description('Show current configuration')
  .action(async () => {
    try {
      const { loadConfig } = await import('../utils/config.js');
      const config = await loadConfig();
      
      console.log('📋 現在の設定:');
      console.log(`GitHub Owner: ${config.github.owner}`);
      console.log(`GitHub Repo: ${config.github.repo}`);
      console.log(`Base URL: ${config.playwright.baseUrl}`);
      console.log(`Screenshot Paths: ${config.screenshots.paths.join(', ')}`);
      console.log(`Viewport: ${config.playwright.viewport.width}x${config.playwright.viewport.height}`);
    } catch (error) {
      console.error('❌ 設定読み込みエラー:', error instanceof Error ? error.message : error);
    }
  });

// エラーハンドリング
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.version') {
    console.log(err.message);
    process.exit(err.exitCode);
  }
  throw err;
});

program.parse();

// 引数なしで実行された場合のヘルプ表示
if (process.argv.length <= 2) {
  program.help();
}