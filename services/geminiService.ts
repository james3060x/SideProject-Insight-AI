
import { GoogleGenAI, Type } from "@google/genai";
import { RedditPost, AIReadyPrompt } from "../types";

export const analyzeProject = async (post: RedditPost): Promise<AIReadyPrompt> => {
  // 直接从 process.env.API_KEY 获取，遵循严格规范
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请分析并翻译以下来自 r/SideProject 的 Reddit 帖子内容。
    
    帖子标题: ${post.title}
    帖子正文: ${post.selftext}
    Reddit 链接: ${post.permalink}
    原始附件链接: ${post.url}

    请完成以下步骤：
    1. 翻译核心内容为中文，语言要专业且具有洞察力。
    2. 提炼出核心业务要素。
    3. 提取项目官网或 Demo 地址（排除 reddit 内部链接）。
    4. 生成一个详细的 Cursor/Windsurf 开发 Prompt。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          projectIntro: { type: Type.STRING },
          problemSolved: { type: Type.STRING },
          customerPersona: { type: Type.STRING },
          solution: { type: Type.STRING },
          externalLink: { type: Type.STRING },
          developerPrompt: { type: Type.STRING }
        },
        required: ["projectName", "projectIntro", "problemSolved", "customerPersona", "solution", "developerPrompt"]
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("AI 响应内容为空");
  
  // 增加对 markdown 代码块包裹的容错
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const result = JSON.parse(cleanJson);
  
  let finalExternalLink = result.externalLink;
  if (!finalExternalLink || finalExternalLink.includes('reddit.com') || finalExternalLink.includes('redd.it')) {
    if (!post.url.includes('reddit.com') && !post.url.includes('redd.it')) {
      finalExternalLink = post.url;
    }
  }

  return {
    summary: {
      projectName: result.projectName,
      projectIntro: result.projectIntro,
      problemSolved: result.problemSolved,
      customerPersona: result.customerPersona,
      solution: result.solution,
      externalLink: finalExternalLink || ''
    },
    developerPrompt: result.developerPrompt
  };
};
