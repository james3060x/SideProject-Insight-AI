
import { RedditPost } from '../types';

/**
 * Fetches the top 20 posts from r/SideProject for the last 24 hours.
 * Uses multiple CORS proxies as fallbacks to ensure reliability.
 */
export const fetchTrendingSideProjects = async (): Promise<RedditPost[]> => {
  const redditUrl = 'https://www.reddit.com/r/SideProject/top.json?t=day&limit=20';
  
  // List of public CORS proxies to try
  const proxies = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  let lastError: any = null;

  for (const getProxyUrl of proxies) {
    try {
      const response = await fetch(getProxyUrl(redditUrl));
      
      if (!response.ok) {
        throw new Error(`Proxy returned status: ${response.status}`);
      }

      const rawData = await response.json();
      
      // AllOrigins returns data in a 'contents' field as a stringified JSON
      let data;
      if (rawData.contents) {
        data = JSON.parse(rawData.contents);
      } else {
        data = rawData;
      }

      if (!data || !data.data || !data.data.children) {
        throw new Error('Invalid Reddit data structure');
      }

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
    } catch (error) {
      console.warn(`Failed to fetch using proxy: ${getProxyUrl(redditUrl)}`, error);
      lastError = error;
      // Continue to next proxy
    }
  }

  // If we reach here, all proxies failed
  console.error('All CORS proxies failed to fetch Reddit data.');
  throw new Error(
    lastError?.message === 'Failed to fetch' 
      ? '无法连接到 Reddit 数据源。请检查网络连接或尝试关闭可能干扰请求的浏览器扩展（如广告拦截插件）。' 
      : '数据同步失败，Reddit API 目前无法通过代理访问，请稍后再试。'
  );
};
