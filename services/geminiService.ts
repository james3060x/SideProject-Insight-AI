
import { GoogleGenAI, Type } from "@google/genai";
import { RedditPost, AIReadyPrompt } from "../types";

// Fix: Use process.env.API_KEY directly as required by guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProject = async (post: RedditPost): Promise<AIReadyPrompt> => {
  const ai = getAI();
  
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
    3. **重点：** 从正文或附件链接中提取该项目的**官方网站或在线演示地址**（排除 i.redd.it, v.redd.it, reddit.com 等链接，除非那是项目本身）。
    4. 生成一个适合交给 AI 编程助手（如 Cursor, Windsurf, Artifacts）的详细开发 Prompt。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING, description: "项目名称" },
          projectIntro: { type: Type.STRING, description: "项目介绍" },
          problemSolved: { type: Type.STRING, description: "解决了什么问题" },
          customerPersona: { type: Type.STRING, description: "主要目标用户" },
          solution: { type: Type.STRING, description: "核心解决方案" },
          externalLink: { type: Type.STRING, description: "项目官方网站或演示 Demo 的完整 URL" },
          developerPrompt: { type: Type.STRING, description: "AI 代码辅助生成的 Prompt，描述清楚功能模块、技术栈建议和核心交互" }
        },
        required: ["projectName", "projectIntro", "problemSolved", "customerPersona", "solution", "developerPrompt"]
      },
    },
  });

  // Fix: response.text is a property, not a method. Ensuring it's not undefined before parsing.
  const text = response.text;
  if (!text) throw new Error("AI analysis response was empty");
  
  const result = JSON.parse(text);
  
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
