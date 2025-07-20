import { chromium } from 'playwright';
import type { Config, Screenshot } from '../types.js';

export const captureScreenshots = async (config: Config, baseUrl: string): Promise<Screenshot[]> => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: config.playwright.viewport
  });

  const screenshots: Screenshot[] = [];

  for (const path of config.screenshots.paths) {
    const url = `${baseUrl}${path}`;
    
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      
      const screenshot = await page.screenshot({ 
        fullPage: true,
        type: 'png'
      });

      screenshots.push({
        name: path === '/' ? 'Homepage' : path.replace('/', ''),
        path,
        image: screenshot.toString('base64'),
        placement: `SCREENSHOT_${path.replace('/', '').toUpperCase() || 'HOME'}`
      });

    } catch (error) {
      console.warn(`⚠️  スクリーンショット失敗: ${url}`, error);
    }
  }

  await browser.close();
  return screenshots;
};

export const captureElementScreenshot = async (
  config: Config, 
  baseUrl: string, 
  selector: string
): Promise<Screenshot | null> => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: config.playwright.viewport
  });

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
    const element = await page.locator(selector);
    if (await element.count() === 0) {
      console.warn(`⚠️  要素が見つかりません: ${selector}`);
      return null;
    }

    const screenshot = await element.screenshot({ type: 'png' });

    return {
      name: `Element: ${selector}`,
      path: baseUrl,
      image: screenshot.toString('base64'),
      placement: `SCREENSHOT_ELEMENT_${selector.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`
    };

  } catch (error) {
    console.warn(`⚠️  要素スクリーンショット失敗: ${selector}`, error);
    return null;
  } finally {
    await browser.close();
  }
};