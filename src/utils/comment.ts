import type { GitAnalysis, Screenshot, CommentTemplate } from '../types.js';

export const generateComment = async (analysis: GitAnalysis, screenshots: Screenshot[]): Promise<string> => {
  const template: CommentTemplate = {
    title: '## 🚀 変更概要',
    sections: {
      overview: generateOverview(analysis),
      changes: generateChanges(analysis),
      screenshots: generateScreenshotSection(screenshots),
      testing: '## ✅ テスト項目\n- [ ] 機能動作確認\n- [ ] レスポンシブ確認\n- [ ] 既存機能への影響なし'
    }
  };

  return [
    template.title,
    template.sections.overview,
    template.sections.changes,
    template.sections.screenshots,
    template.sections.testing
  ].join('\n\n');
};

const generateOverview = (analysis: GitAnalysis): string => {
  if (analysis.commitMessages.length === 0) {
    return '### 📋 実装内容\n変更内容の詳細を記載してください。';
  }

  const summary = analysis.commitMessages.join('\n- ');
  return `### 📋 実装内容\n- ${summary}`;
};

const generateChanges = (analysis: GitAnalysis): string => {
  const changes: string[] = [];
  
  if (analysis.addedFiles.length > 0) {
    changes.push(`**追加**: ${analysis.addedFiles.join(', ')}`);
  }
  
  if (analysis.modifiedFiles.length > 0) {
    changes.push(`**変更**: ${analysis.modifiedFiles.join(', ')}`);
  }
  
  if (analysis.deletedFiles.length > 0) {
    changes.push(`**削除**: ${analysis.deletedFiles.join(', ')}`);
  }

  if (changes.length === 0) {
    return '### 📁 ファイル変更\n変更されたファイルはありません。';
  }

  return `### 📁 ファイル変更\n${changes.join('\n')}`;
};

const generateScreenshotSection = (screenshots: Screenshot[]): string => {
  if (screenshots.length === 0) {
    return '## 🖼️ スクリーンショット\nスクリーンショットの撮影に失敗しました。';
  }

  const screenshotMarkdown = screenshots
    .map((screenshot: Screenshot) => 
      `### ${screenshot.name}\n![${screenshot.name}](data:image/png;base64,${screenshot.image})`
    )
    .join('\n\n');

  return `## 🖼️ スクリーンショット\n\n${screenshotMarkdown}`;
};

export const generateCustomComment = (
  title: string,
  description: string,
  screenshots: Screenshot[],
  additionalSections?: Record<string, string>
): string => {
  const sections = [
    `## ${title}`,
    description,
    generateScreenshotSection(screenshots)
  ];

  if (additionalSections) {
    Object.entries(additionalSections).forEach(([sectionTitle, content]) => {
      sections.push(`## ${sectionTitle}\n${content}`);
    });
  }

  return sections.join('\n\n');
};

export const insertScreenshotsIntoTemplate = (
  template: string,
  screenshots: Screenshot[]
): string => {
  let result = template;

  screenshots.forEach((screenshot: Screenshot) => {
    const placeholder = `{{${screenshot.placement}}}`;
    const imageMarkdown = `![${screenshot.name}](data:image/png;base64,${screenshot.image})`;
    result = result.replace(placeholder, imageMarkdown);
  });

  // 未使用のプレースホルダーを削除
  result = result.replace(/\{\{SCREENSHOT_[^}]+\}\}/g, '');

  return result;
};