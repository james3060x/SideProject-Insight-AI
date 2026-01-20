
import React, { useState, useEffect, useCallback } from 'react';
import { fetchTrendingSideProjects } from './services/redditService';
import { analyzeProject } from './services/geminiService';
import { RedditPost, AIReadyPrompt, AppStatus } from './types';
import ProjectCard from './components/ProjectCard';

const App: React.FC = () => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [analyzedData, setAnalyzedData] = useState<Record<string, AIReadyPrompt>>({});
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    try {
      setStatus(AppStatus.FETCHING_REDDIT);
      setError(null);
      const data = await fetchTrendingSideProjects();
      setPosts(data);
      setStatus(AppStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError('无法获取 Reddit 数据。这可能是由于 CORS 限制或网络问题。请尝试刷新。');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleAnalyze = async (post: RedditPost) => {
    if (analyzingIds.has(post.id)) return;

    setAnalyzingIds(prev => new Set(prev).add(post.id));
    try {
      const insight = await analyzeProject(post);
      setAnalyzedData(prev => ({ ...prev, [post.id]: insight }));
    } catch (err) {
      console.error('AI Analysis failed:', err);
      // Fail silently for individual card, user can retry
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    }
  };

  const analyzeAll = async () => {
    // Only analyze what isn't analyzed yet
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <i className="fas fa-rocket text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                SideProject Insight AI
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Reddit r/SideProject Trends</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleFetch}
              disabled={status === AppStatus.FETCHING_REDDIT}
              className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
              title="刷新数据"
            >
              <i className={`fas fa-sync-alt ${status === AppStatus.FETCHING_REDDIT ? 'fa-spin' : ''}`}></i>
            </button>
            <button 
              onClick={analyzeAll}
              disabled={posts.length === 0 || status === AppStatus.FETCHING_REDDIT}
              className="hidden sm:flex bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed items-center"
            >
              <i className="fas fa-wand-magic-sparkles mr-2"></i>
              一键分析全榜
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              今日全球热门独立项目
            </h2>
            <p className="text-slate-600 max-w-2xl">
              实时追踪 Reddit r/SideProject 24小时内高赞项目。利用 Gemini AI 深度解析商业模式，并为你生成直接可用的 AI 开发 Prompt。
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span>当前更新: 过去24小时 Top 20</span>
          </div>
        </div>

        {/* Loading / Error States */}
        {status === AppStatus.FETCHING_REDDIT && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">正在同步 Reddit 热门贴...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-lg mx-auto mb-10">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
            <h3 className="text-lg font-bold text-red-900 mb-2">获取失败</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <button 
              onClick={handleFetch}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {posts.length > 0 && (
          <div className="mt-12 text-center py-10 border-t border-slate-200">
            <p className="text-slate-500 text-sm italic">
              * 灵感来源 Reddit r/SideProject | 由 Gemini AI 提供中文深度解析支持
            </p>
          </div>
        )}
      </main>

      {/* Bottom Sticky CTA for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <button 
          onClick={analyzeAll}
          className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90"
        >
          <i className="fas fa-magic"></i>
        </button>
      </div>
    </div>
  );
};

export default App;
