
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * 极致控制台过滤器：屏蔽所有已知的插件噪音
 */
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  const originalInfo = console.info;

  const noiseKeywords = [
    'solanaActionsContentScript', // 屏蔽 Solana 钱包插件
    'solana',
    'Immersive Translate',        // 屏蔽沉浸式翻译
    'immersive-translate',
    'vercel.live',                // 屏蔽 Vercel 工具
    'zustand',
    'cdn.tailwindcss.com',
    'favicon.ico',
    'default:',                   // 屏蔽一些插件的性能打点
    'can not detect a valid body' // 屏蔽特定翻译插件的报错
  ];

  const isNoise = (args: any[]) => {
    const message = args.map(arg => {
      try {
        return typeof arg === 'string' ? arg : JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
    return noiseKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  };

  console.warn = (...args) => {
    if (isNoise(args)) return;
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (isNoise(args)) return;
    // 忽略特定的扩展错误
    if (args[0] instanceof Error && isNoise([args[0].message, args[0].stack])) return;
    originalError(...args);
  };

  console.log = (...args) => {
    if (isNoise(args)) return;
    originalLog(...args);
  };

  console.info = (...args) => {
    if (isNoise(args)) return;
    originalInfo(...args);
  };
}

const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
