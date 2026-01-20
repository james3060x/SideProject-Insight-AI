
import { RedditPost } from '../types';

/**
 * 获取 r/SideProject 热门帖子
 */
export const fetchTrendingSideProjects = async (): Promise<RedditPost[]> => {
  const redditUrl = 'https://www.reddit.com/r/SideProject/top.json?t=day&limit=20';
  
  // 使用更稳健的代理列表
  const proxies = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&_=${Date.now()}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  let lastError: any = null;

  for (const getProxyUrl of proxies) {
    const targetUrl = getProxyUrl(redditUrl);
    try {
      console.log(`正在请求代理: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`代理响应失败: ${response.status}`);
      }

      const rawData = await response.json();
      
      // 处理 AllOrigins 特有的 contents 包装
      let data;
      if (rawData && rawData.contents) {
        data = typeof rawData.contents === 'string' ? JSON.parse(rawData.contents) : rawData.contents;
      } else {
        data = rawData;
      }

      if (data && data.data && data.data.children) {
        return data.data.children.map((child: any) => ({
          id: child.data.id,
          title: child.data.title,
          author: child.data.author,
          selftext: child.data.selftext || '',
          url: child.data.url,
          permalink: `https://reddit.com${child.data.permalink}`,
          score: child.data.score,
          num_comments: child.data.num_comments,
          created_utc: child.data.created_utc,
        }));
      }
      throw new Error('Reddit 响应结构异常');
    } catch (error: any) {
      console.warn(`代理 ${targetUrl} 失败:`, error.message);
      lastError = error;
      continue;
    }
  }

  throw new Error(`无法获取 Reddit 数据。这可能是 Vercel 节点访问受限，请在本地环境尝试或稍后重试。详细信息: ${lastError?.message}`);
};
