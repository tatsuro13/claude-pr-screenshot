import { jest } from '@jest/globals';

// グローバルなテストセットアップ
beforeEach(() => {
  // 各テスト前にモックをクリア
  jest.clearAllMocks();
});

// プロセス環境変数のモック
process.env.NODE_ENV = 'test';

// コンソール出力を抑制（必要に応じて）
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// タイムアウト設定
jest.setTimeout(10000);