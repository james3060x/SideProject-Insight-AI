
import { RedditPost } from '../types';

/**
 * 获取 r/SideProject 24小时内的前 20 个热门帖子
 * 采用多重代理策略，增强在不同网络环境下的稳定性
 */
export const fetchTrendingSideProjects = async (): Promise<RedditPost[]> => {
  const redditUrl = 'https://www.reddit.com/r/SideProject/top.json?t=day&limit=20';
  
  // 公共 CORS 代理列表，增加随机因子规避缓存
  const proxies = [
    (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&_=${Date.now()}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`,
  ];

  let lastError: any = null;

  for (const getProxyUrl of proxies) {
    try {
      console.log(`正在尝试代理: ${getProxyUrl(redditUrl)}`);
      const response = await fetch(getProxyUrl(redditUrl), {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const rawData = await response.json();
      
      // 处理不同代理返回的数据格式
      let data;
      if (rawData && typeof rawData.contents === 'string') {
        data = JSON.parse(rawData.contents);
      } else if (rawData && rawData.contents) {
        data = rawData.contents;
      } else {
        data = rawData;
      }

      if (!data || !data.data || !data.data.children) {
        throw new Error('Reddit 返回数据格式不匹配');
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
      console.warn('当前代理请求失败:', error);
      lastError = error;
      continue; // 尝试下一个代理
    }
  }

  throw new Error(
    `无法加载数据。原因: ${lastError?.message || '未知网络错误'}。提示：请检查是否开启了广告拦截器，或者尝试稍后刷新。`
  );
};
