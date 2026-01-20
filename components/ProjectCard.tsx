
import React, { useState } from 'react';
import { AIReadyPrompt, RedditPost } from '../types';
import StatusBadge from './StatusBadge';

interface ProjectCardProps {
  post: RedditPost;
  insight?: AIReadyPrompt;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ post, insight, isAnalyzing, onAnalyze }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap">
            <StatusBadge icon="fas fa-arrow-up" label={`${post.score} Upvotes`} color="bg-orange-100 text-orange-700" />
            <StatusBadge icon="fas fa-comment" label={`${post.num_comments} Comments`} color="bg-blue-100 text-blue-700" />
          </div>
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
            <i className="fab fa-reddit text-xl"></i>
          </a>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
          {insight ? insight.summary.projectName : post.title}
        </h3>

        {!insight ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 line-clamp-3 mb-4">
              {post.selftext || "此贴不含文字说明，可能为纯链接或图片。点击下方按钮开始 AI 分析。"}
            </p>
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center font-semibold transition-all ${
                isAnalyzing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  AI 分析中...
                </>
              ) : (
                <>
                  <i className="fas fa-brain mr-2"></i>
                  开始 AI 深度解析
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm">
              <span className="font-bold text-indigo-600 block mb-1">项目介绍：</span>
              <p className="text-slate-600 leading-relaxed">{insight.summary.projectIntro}</p>
            </div>
            
            <div className="text-sm">
              <span className="font-bold text-indigo-600 block mb-1">解决问题：</span>
              <p className="text-slate-600 leading-relaxed">{insight.summary.problemSolved}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">客户画像</span>
                <p className="text-sm text-slate-700">{insight.summary.customerPersona}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">核心方案</span>
                <p className="text-sm text-slate-700">{insight.summary.solution}</p>
              </div>
            </div>

            {insight.summary.externalLink && (
              <a 
                href={insight.summary.externalLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                <i className="fas fa-link mr-1.5"></i>
                成品/演示链接
              </a>
            )}

            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full mt-4 py-2 border-2 border-dashed border-indigo-200 rounded-lg text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center"
            >
              <i className={`fas ${showPrompt ? 'fa-chevron-up' : 'fa-code'} mr-2`}></i>
              {showPrompt ? '收起 AI Code Prompt' : '生成 AI 代码 Prompt'}
            </button>

            {showPrompt && (
              <div className="mt-2 p-3 bg-indigo-900 text-indigo-100 rounded-lg text-xs font-mono relative">
                <button 
                  onClick={() => navigator.clipboard.writeText(insight.developerPrompt)}
                  className="absolute top-2 right-2 p-1 hover:bg-indigo-700 rounded transition-colors"
                >
                  <i className="fas fa-copy"></i>
                </button>
                <p className="whitespace-pre-wrap leading-relaxed pr-6">{insight.developerPrompt}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
