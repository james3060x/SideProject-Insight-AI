
import { RedditPost } from '../types';

export const fetchTrendingSideProjects = async (): Promise<RedditPost[]> => {
  try {
    // Reddit API does not allow direct cross-origin requests from the browser.
    // We use a CORS proxy to bypass this restriction.
    const redditUrl = 'https://www.reddit.com/r/SideProject/top.json?t=day&limit=20';
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(redditUrl)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Reddit API returned status: ${response.status}. This might be a temporary issue with the CORS proxy or Reddit.`);
    }
    
    const data = await response.json();
    
    if (!data || !data.data || !data.data.children) {
      throw new Error('Invalid data structure received from Reddit.');
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
    console.error('Error fetching Reddit data:', error);
    // Rethrow a more user-friendly error message if it's a generic "Failed to fetch"
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('无法连接到 Reddit。这通常是由于浏览器跨域 (CORS) 限制导致的。请检查网络或稍后再试。');
    }
    throw error;
  }
};
