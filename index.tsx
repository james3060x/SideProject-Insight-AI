
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * 排除法：彻底屏蔽非业务代码产生的控制台噪音
 * 针对：Vercel Toolbar, 沉浸式翻译插件, 浏览器 Favicon 请求
 */
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;

  const noiseKeywords = [
    'zustand',
    'vercel.live',
    'Immersive Translate',
    'favicon.ico',
    '_next-live',
    'feedback.html'
  ];

  const isNoise = (args: any[]) => {
    const message = args.map(arg => String(arg)).join(' ');
    return noiseKeywords.some(keyword => message.includes(keyword));
  };

  console.warn = (...args) => {
    if (isNoise(args)) return;
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (isNoise(args)) return;
    originalError(...args);
  };

  console.log = (...args) => {
    // 屏蔽特定的 default: XX ms 噪音
    if (args[0] === 'default' && typeof args[1] === 'number') return;
    if (isNoise(args)) return;
    originalLog(...args);
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

// 确保 DOM 完全加载后再挂载，防止插件检测不到 body
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
