
import React, { useState, useEffect } from 'react';
import { fetchTrendingSideProjects } from './services/redditService';
import { analyzeProject } from './services/geminiService';
import { RedditPost, AIReadyPrompt, AppStatus } from './types';
import ProjectCard from './components/ProjectCard';
import NewsletterSection from './components/NewsletterSection';

const App: React.FC = () => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [analyzedData, setAnalyzedData] = useState<Record<string, AIReadyPrompt>>({});
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // 系统健康度检查
  const isKeyConfigured = process.env.API_KEY && process.env.API_KEY !== 'undefined';

  const handleFetch = async () => {
    try {
      setStatus(AppStatus.FETCHING_REDDIT);
      setError(null);
      const data = await fetchTrendingSideProjects();
      setPosts(data);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || '获取 Reddit 数据失败。');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleAnalyze = async (post: RedditPost) => {
    if (analyzingIds.has(post.id)) return;
    setAnalyzingIds(prev => new Set(prev).add(post.id));
    try {
      const insight = await analyzeProject(post);
      setAnalyzedData(prev => ({ ...prev, [post.id]: insight }));
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      alert(err.message || 'AI 分析失败，请重试。');
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    }
  };

  const analyzeAll = async () => {
    if (posts.length === 0) return;
    const postsToAnalyze = posts.filter(p => !analyzedData[p.id]);
    for (const post of postsToAnalyze) {
      await handleAnalyze(post);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <i className="fas fa-rocket text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                SideProject Insight AI
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Trends</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${isKeyConfigured ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} font-bold`}>
                  {isKeyConfigured ? 'AI READY' : 'KEY MISSING'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleFetch}
              disabled={status === AppStatus.FETCHING_REDDIT}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <i className={`fas fa-sync-alt ${status === AppStatus.FETCHING_REDDIT ? 'fa-spin text-indigo-600' : ''}`}></i>
            </button>
            <button 
              onClick={analyzeAll}
              disabled={posts.length === 0 || status === AppStatus.FETCHING_REDDIT}
              className="hidden sm:flex bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <i className="fas fa-magic mr-2"></i>
              全部分解
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isKeyConfigured && (
          <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
            <i className="fas fa-triangle-exclamation text-amber-500 mt-1"></i>
            <div>
              <h4 className="text-sm font-bold text-amber-900">检测到配置缺失</h4>
              <p className="text-xs text-amber-700 mt-1">
                环境变量 API_KEY 未设置。Reddit 列表仍可预览，但 AI 分析功能无法启用。
                请在 Vercel 后台配置后再试。
              </p>
            </div>
          </div>
        )}

        <NewsletterSection />

        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">今日热门项目</h2>
            <p className="text-slate-500 font-medium">实时抓取 Reddit 灵感，Gemini 全自动商业拆解。</p>
          </div>
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 animate-pulse">
            LIVE UPDATE
          </div>
        </div>

        {status === AppStatus.FETCHING_REDDIT && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold">正在安全穿透代理获取 Reddit 数据...</p>
          </div>
        )}

        {error && (
          <div className="bg-white border-2 border-red-100 rounded-3xl p-10 text-center max-w-xl mx-auto mb-10 shadow-2xl shadow-red-50">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <i className="fas fa-plug-circle-xmark text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">网络链路中断</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              {error}<br/>
              <span className="text-[10px] text-slate-400 mt-2 block uppercase font-bold tracking-tighter">此报错可能由于某些浏览器插件拦截了跨域请求引起</span>
            </p>
            <button 
              onClick={handleFetch}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-95"
            >
              重新连接系统
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <ProjectCard
              key={post.id}
              post={post}
              insight={analyzedData[post.id]}
              isAnalyzing={analyzingIds.has(post.id)}
              onAnalyze={() => handleAnalyze(post)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
