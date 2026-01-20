
import { RedditPost } from '../types';

/**
 * 随机洗牌算法
 */
const shuffle = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const fetchTrendingSideProjects = async (): Promise<RedditPost[]> => {
  const redditUrl = `https://www.reddit.com/r/SideProject/top.json?t=day&limit=20&cb=${Date.now()}`;
  
  const fetchStrategies = [
    { name: '🌐 直接连接', url: (url: string) => url },
    { name: '🛡️ CORS Proxy IO', url: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}` },
    { name: '🚀 AllOrigins', url: (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}` },
    { name: '⚡ CodeTabs', url: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` },
    { name: '📡 YACDN', url: (url: string) => `https://yacdn.org/proxy/${encodeURIComponent(url)}` }
  ];

  const randomizedStrategies = shuffle(fetchStrategies);
  let errors: string[] = [];

  for (let i = 0; i < randomizedStrategies.length; i++) {
    const strategy = randomizedStrategies[i];
    const targetUrl = strategy.url(redditUrl);
    
    // 自适应超时：第一次尝试 10s，之后每次增加 5s 给慢速网络更多机会
    const timeout = 10000 + (i * 5000);
    
    try {
      console.log(`[RedditFetch] 正在通过 ${strategy.name} 抓取 (超时限制: ${timeout/1000}s)...`);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(timeout)
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const rawData = await response.json();
      let data;
      
      // 解析嵌套结构
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
      throw new Error('响应格式不正确');
    } catch (error: any) {
      const msg = error.name === 'AbortError' ? '连接超时(Aborted)' : error.message;
      console.warn(`[RedditFetch] ${strategy.name} 失败: ${msg}`);
      errors.push(`${strategy.name}: ${msg}`);
      continue;
    }
  }

  throw new Error(`网络链路全线封锁：\n${errors.join('\n')}\n\n检测到您的浏览器插件可能会干扰请求，请尝试在“无痕模式”下运行应用，或检查您的 VPN 状态。`);
};
