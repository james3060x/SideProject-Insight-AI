
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- 排除法：屏蔽非业务代码噪音 ---
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;

  // 屏蔽 Zustand 警告和 Vercel 相关噪音
  console.warn = (...args) => {
    if (args[0]?.includes?.('zustand') || args[0]?.includes?.('vercel.live')) return;
    originalWarn(...args);
  };

  // 屏蔽沉浸式翻译等插件产生的 DOM 报错
  console.error = (...args) => {
    if (args[0]?.includes?.('vercel.live') || args[0]?.includes?.('Immersive Translate')) return;
    originalError(...args);
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
