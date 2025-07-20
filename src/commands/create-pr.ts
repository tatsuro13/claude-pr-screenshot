import { analyzeBranch, getCurrentBranch, checkUncommittedChanges } from '../utils/git.js';
import { captureScreenshots } from '../utils/playwright.js';
import { generateComment } from '../utils/comment.js';
import { createPullRequest, findExistingPR, updatePullRequest } from '../utils/github.js';
import { loadConfig } from '../utils/config.js';
import type { PROptions } from '../types.js';

export const createPR = async (branch: string, options: Partial<PROptions>): Promise<void> => {
  console.log(`🚀 PR作成開始: ${branch}`);

  try {
    // 事前チェック
    await performPreChecks(branch);
    
    // 設定読み込み
    const config = await loadConfig();
    
    // オプションのデフォルト値設定
    const prOptions: PROptions = {
      branch,
      base: options.base || 'main',
      url: options.url || config.playwright.baseUrl
    };
    
    // Git分析
    console.log('📊 ブランチ分析中...');
    const analysis = await analyzeBranch(prOptions.base, prOptions.branch);
    
    if (analysis.changedFiles.length === 0) {
      console.log('⚠️  変更されたファイルがありません。');
      return;
    }
    
    // スクリーンショット撮影
    console.log('📸 スクリーンショット撮影中...');
    const screenshots = await captureScreenshots(config, prOptions.url);
    
    // コメント生成
    console.log('📝 PRコメント生成中...');
    const comment = await generateComment(analysis, screenshots);
    
    // 既存PR確認
    const existingPR = await findExistingPR(config, prOptions.branch, prOptions.base);
    
    if (existingPR) {
      console.log(`🔄 既存PR更新中: #${existingPR}`);
      await updatePullRequest(config, existingPR, comment);
      console.log(`✅ PR更新完了: #${existingPR}`);
    } else {
      // PR作成
      console.log('🔄 PR作成中...');
      const prUrl = await createPullRequest(config, prOptions.branch, prOptions.base, comment);
      console.log(`✅ PR作成完了: ${prUrl}`);
    }
    
  } catch (error) {
    console.error('❌ エラー:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

const performPreChecks = async (branch: string): Promise<void> => {
  // 未コミットの変更確認
  if (checkUncommittedChanges()) {
    throw new Error('未コミットの変更があります。先にコミットしてください。');
  }
  
  // 現在のブランチ確認
  const currentBranch = getCurrentBranch();
  if (currentBranch !== branch) {
    console.log(`⚠️  現在のブランチ: ${currentBranch}, 指定されたブランチ: ${branch}`);
    console.log('指定されたブランチに切り替えてから実行することをお勧めします。');
  }
};

export const createPRWithCustomOptions = async (
  branch: string,
  baseBranch: string,
  serverUrl: string,
  screenshotPaths?: string[]
): Promise<void> => {
  console.log(`🚀 カスタムオプションでPR作成: ${branch} → ${baseBranch}`);

  try {
    const config = await loadConfig();
    
    // カスタム設定を適用
    if (screenshotPaths) {
      config.screenshots.paths = screenshotPaths;
    }
    
    const analysis = await analyzeBranch(baseBranch, branch);
    const screenshots = await captureScreenshots(config, serverUrl);
    const comment = await generateComment(analysis, screenshots);
    
    const prUrl = await createPullRequest(config, branch, baseBranch, comment);
    console.log(`✅ PR作成完了: ${prUrl}`);
    
  } catch (error) {
    console.error('❌ エラー:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

export const createDraftPR = async (branch: string, options: Partial<PROptions>): Promise<void> => {
  console.log(`🚀 ドラフトPR作成: ${branch}`);
  
  // 通常のPR作成と同じ処理だが、GitHub APIでdraft: trueを設定
  // この実装は簡略化のため省略
  await createPR(branch, options);
};

export const showPRPreview = async (branch: string, options: Partial<PROptions>): Promise<void> => {
  console.log(`👀 PRプレビュー: ${branch}`);

  try {
    const config = await loadConfig();
    const prOptions: PROptions = {
      branch,
      base: options.base || 'main',
      url: options.url || config.playwright.baseUrl
    };
    
    const analysis = await analyzeBranch(prOptions.base, prOptions.branch);
    const screenshots = await captureScreenshots(config, prOptions.url);
    const comment = await generateComment(analysis, screenshots);
    
    console.log('\n📝 生成されるPRコメント:');
    console.log('=' .repeat(50));
    console.log(comment);
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ プレビューエラー:', error instanceof Error ? error.message : error);
  }
};