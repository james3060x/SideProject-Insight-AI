
import { RedditPost } from '../types';

/**
 * 获取 r/SideProject 热门帖子
 */
export const fetchTrendingSideProjects = async (): Promise<RedditPost[]> => {
  const redditUrl = 'https://www.reddit.com/r/SideProject/top.json?t=day&limit=20';
  
  // 代理列表优化：增加直连选项，优化高可用节点
  const fetchStrategies = [
    // 策略 0: 直接访问 (如果用户有系统级代理/VPN，这是最快的)
    { name: 'Direct Connect', url: (url: string) => url },
    // 策略 1: AllOrigins (包装模式)
    { name: 'AllOrigins Proxy', url: (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&_=${Date.now()}` },
    // 策略 2: CORS Proxy IO (透明代理)
    { name: 'CORS Proxy IO', url: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}` },
    // 策略 3: CodeTabs (透明代理)
    { name: 'CodeTabs Proxy', url: (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` },
    // 策略 4: YACDN (带缓存代理)
    { name: 'YACDN Proxy', url: (url: string) => `https://yacdn.org/proxy/${encodeURIComponent(url)}` },
  ];

  let lastError: any = null;

  for (let i = 0; i < fetchStrategies.length; i++) {
    const strategy = fetchStrategies[i];
    const targetUrl = strategy.url(redditUrl);
    
    try {
      console.log(`[Network] 尝试通道 ${i}: ${strategy.name} -> ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        // 增加超时到 15 秒，解决 "The user aborted a request"
        signal: AbortSignal.timeout(15000) 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} (${response.statusText})`);
      }

      const rawData = await response.json();
      
      // 深度解析不同代理的数据结构
      let data;
      if (rawData && rawData.contents) {
        // AllOrigins 模式
        data = typeof rawData.contents === 'string' ? JSON.parse(rawData.contents) : rawData.contents;
      } else {
        // 透明代理模式
        data = rawData;
      }

      if (data && data.data && data.data.children) {
        console.log(`[Network] 通道 ${i} (${strategy.name}) 成功击穿`);
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
      throw new Error('Reddit 响应数据结构无效');
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = `请求超时 (15s)，通道 ${strategy.name} 响应过慢。`;
      }
      console.warn(`[Network] 通道 ${i} (${strategy.name}) 失败:`, errorMessage);
      lastError = { name: strategy.name, message: errorMessage };
      
      // 快速重试下一个通道
      continue;
    }
  }

  throw new Error(`链路解析全线溃败。最后尝试的通道 [${lastError?.name}] 报错: ${lastError?.message}\n\n建议：请检查网络工具是否拦截了跨域脚本，或尝试切换网络节点。`);
};
