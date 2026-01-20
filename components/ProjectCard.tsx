
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

  // Determine if there's a usable direct link before analysis
  const directLink = !post.url.includes('reddit.com') && !post.url.includes('redd.it') ? post.url : null;
  const projectUrl = insight?.summary.externalLink || directLink;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full group">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap">
            <StatusBadge icon="fas fa-arrow-up" label={`${post.score}`} color="bg-orange-50 text-orange-600" />
            <StatusBadge icon="fas fa-comment" label={`${post.num_comments}`} color="bg-slate-100 text-slate-600" />
          </div>
          <div className="flex space-x-2">
            {projectUrl && (
              <a href={projectUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors" title="访问项目官网">
                <i className="fas fa-external-link-alt"></i>
              </a>
            )}
            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-600 transition-colors" title="查看 Reddit 原贴">
              <i className="fab fa-reddit"></i>
            </a>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
          {projectUrl ? (
            <a href={projectUrl} target="_blank" rel="noopener noreferrer">
              {insight ? insight.summary.projectName : post.title}
              <i className="fas fa-link ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </a>
          ) : (
            insight ? insight.summary.projectName : post.title
          )}
        </h3>

        {!insight ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 line-clamp-3 mb-4">
              {post.selftext || "此贴不含文字说明，可能为纯链接或图片。点击下方按钮开始 AI 分析。"}
            </p>
            
            {directLink && (
              <div className="mb-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">发现外部链接</p>
                <a href={directLink} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 truncate block hover:underline">
                  {directLink}
                </a>
              </div>
            )}

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center font-semibold transition-all ${
                isAnalyzing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm shadow-indigo-200'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  AI 正在深度拆解...
                </>
              ) : (
                <>
                  <i className="fas fa-brain mr-2"></i>
                  开始 AI 商业分析
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

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 tracking-tight">目标用户</span>
                <p className="text-xs text-slate-700 font-medium">{insight.summary.customerPersona}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1 tracking-tight">核心方案</span>
                <p className="text-xs text-slate-700 font-medium">{insight.summary.solution}</p>
              </div>
            </div>

            {insight.summary.externalLink && (
              <a 
                href={insight.summary.externalLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                <i className="fas fa-globe mr-2"></i>
                访问项目官网
              </a>
            )}

            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full mt-2 py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 font-bold text-sm hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center"
            >
              <i className={`fas ${showPrompt ? 'fa-chevron-up' : 'fa-code'} mr-2`}></i>
              {showPrompt ? '收起开发指令' : '获取 AI 编程指令'}
            </button>

            {showPrompt && (
              <div className="mt-2 p-3 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono relative group/code">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(insight.developerPrompt);
                    alert('已复制到剪贴板');
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                  title="复制代码"
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
