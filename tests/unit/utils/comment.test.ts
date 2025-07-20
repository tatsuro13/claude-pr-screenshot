import { describe, it, expect } from '@jest/globals';
import { generateComment, generateCustomComment, insertScreenshotsIntoTemplate } from '../../../src/utils/comment';
import type { GitAnalysis, Screenshot } from '../../../src/types';

describe('comment.ts', () => {
  const mockGitAnalysis: GitAnalysis = {
    changedFiles: ['src/app.ts', 'src/utils.ts'],
    commitMessages: ['Add new feature', 'Fix bug in utils'],
    addedFiles: ['src/app.ts'],
    modifiedFiles: ['src/utils.ts'],
    deletedFiles: []
  };

  const mockScreenshots: Screenshot[] = [
    {
      name: 'Homepage',
      path: '/',
      image: 'base64imagedata',
      placement: 'SCREENSHOT_HOME'
    },
    {
      name: 'About',
      path: '/about',
      image: 'base64aboutdata',
      placement: 'SCREENSHOT_ABOUT'
    }
  ];

  describe('generateComment', () => {
    it('should generate a complete PR comment with all sections', async () => {
      const result = await generateComment(mockGitAnalysis, mockScreenshots);

      expect(result).toContain('## 🚀 変更概要');
      expect(result).toContain('### 📋 実装内容');
      expect(result).toContain('Add new feature');
      expect(result).toContain('Fix bug in utils');
      expect(result).toContain('### 📁 ファイル変更');
      expect(result).toContain('**追加**: src/app.ts');
      expect(result).toContain('**変更**: src/utils.ts');
      expect(result).toContain('## 🖼️ スクリーンショット');
      expect(result).toContain('### Homepage');
      expect(result).toContain('### About');
      expect(result).toContain('## ✅ テスト項目');
    });

    it('should handle empty commit messages', async () => {
      const emptyAnalysis: GitAnalysis = {
        ...mockGitAnalysis,
        commitMessages: []
      };

      const result = await generateComment(emptyAnalysis, mockScreenshots);

      expect(result).toContain('変更内容の詳細を記載してください。');
    });

    it('should handle empty screenshots', async () => {
      const result = await generateComment(mockGitAnalysis, []);

      expect(result).toContain('スクリーンショットの撮影に失敗しました。');
    });

    it('should handle no file changes', async () => {
      const noChangesAnalysis: GitAnalysis = {
        changedFiles: [],
        commitMessages: ['Update documentation'],
        addedFiles: [],
        modifiedFiles: [],
        deletedFiles: []
      };

      const result = await generateComment(noChangesAnalysis, mockScreenshots);

      expect(result).toContain('変更されたファイルはありません。');
    });
  });

  describe('generateCustomComment', () => {
    it('should generate custom comment with provided sections', () => {
      const title = 'Custom Feature';
      const description = 'This is a custom feature implementation';
      const additionalSections = {
        'Performance': 'Improved loading time by 50%',
        'Security': 'Added input validation'
      };

      const result = generateCustomComment(
        title,
        description,
        mockScreenshots,
        additionalSections
      );

      expect(result).toContain(`## ${title}`);
      expect(result).toContain(description);
      expect(result).toContain('## Performance');
      expect(result).toContain('Improved loading time by 50%');
      expect(result).toContain('## Security');
      expect(result).toContain('Added input validation');
      expect(result).toContain('### Homepage');
      expect(result).toContain('### About');
    });

    it('should work without additional sections', () => {
      const result = generateCustomComment(
        'Simple Feature',
        'Basic implementation',
        mockScreenshots
      );

      expect(result).toContain('## Simple Feature');
      expect(result).toContain('Basic implementation');
      expect(result).toContain('### Homepage');
    });
  });

  describe('insertScreenshotsIntoTemplate', () => {
    it('should replace screenshot placeholders with images', () => {
      const template = `
# Test Template

{{SCREENSHOT_HOME}}

Some content here.

{{SCREENSHOT_ABOUT}}

More content.
      `;

      const result = insertScreenshotsIntoTemplate(template, mockScreenshots);

      expect(result).toContain('![Homepage](data:image/png;base64,base64imagedata)');
      expect(result).toContain('![About](data:image/png;base64,base64aboutdata)');
      expect(result).not.toContain('{{SCREENSHOT_HOME}}');
      expect(result).not.toContain('{{SCREENSHOT_ABOUT}}');
    });

    it('should remove unused placeholders', () => {
      const template = `
# Test Template

{{SCREENSHOT_HOME}}
{{SCREENSHOT_UNUSED}}
{{SCREENSHOT_ANOTHER}}
      `;

      const result = insertScreenshotsIntoTemplate(template, mockScreenshots);

      expect(result).toContain('![Homepage](data:image/png;base64,base64imagedata)');
      expect(result).not.toContain('{{SCREENSHOT_UNUSED}}');
      expect(result).not.toContain('{{SCREENSHOT_ANOTHER}}');
    });

    it('should handle template without placeholders', () => {
      const template = 'Simple template without placeholders';

      const result = insertScreenshotsIntoTemplate(template, mockScreenshots);

      expect(result).toBe(template);
    });

    it('should handle empty screenshots array', () => {
      const template = '{{SCREENSHOT_HOME}} content {{SCREENSHOT_ABOUT}}';

      const result = insertScreenshotsIntoTemplate(template, []);

      expect(result).not.toContain('{{SCREENSHOT_HOME}}');
      expect(result).not.toContain('{{SCREENSHOT_ABOUT}}');
      expect(result).toContain('content');
    });
  });
});