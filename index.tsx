
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * 核心：极致控制台清理器
 * 针对性拦截：
 * 1. Tailwind CDN 生产环境警告
 * 2. 浏览器插件产生的 'default: XXX ms' 性能日志
 * 3. 沉浸式翻译 (Immersive Translate) 插件报错
 * 4. Vercel Toolbar 内部通讯噪音
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
    'feedback.html',
    'cdn.tailwindcss.com', // 拦截 Tailwind 生产环境警告
    'tailwindcss'
  ];

  const isNoise = (args: any[]) => {
    const message = args.map(arg => {
      try {
        return typeof arg === 'string' ? arg : JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
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
    // 特别处理 'default: 0.123 ms' 这种形式的日志 (来自插件或 timeEnd)
    const firstArg = String(args[0]);
    if (firstArg.startsWith('default:') || (firstArg === 'default' && typeof args[1] === 'number')) {
      return;
    }
    if (isNoise(args)) return;
    originalLog(...args);
  };

  // 尝试劫持 console.info 处理沉浸式翻译的 INFO 级别日志
  const originalInfo = console.info;
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

// 预热 body 结构，防止插件因为 body 检测延迟报错
if (!document.body) {
  const body = document.createElement('body');
  document.documentElement.appendChild(body);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
