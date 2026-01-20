
import { GoogleGenAI, Type } from "@google/genai";
import { RedditPost, ProjectInsight, AIReadyPrompt } from "../types";

export const analyzeProject = async (post: RedditPost): Promise<AIReadyPrompt> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请分析并翻译以下来自 r/SideProject 的 Reddit 帖子内容：
    
    标题: ${post.title}
    内容: ${post.selftext}
    原文链接: ${post.permalink}
    外部链接: ${post.url}

    请完成以下步骤：
    1. 翻译核心内容为中文。
    2. 提炼出核心业务要素。
    3. 如果内容中有成品的外部链接（非 Reddit 链接），请提取。
    4. 生成一个适合交给 AI 编程助手（如 Cursor, Windsurf, Artifacts）的开发 Prompt。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING, description: "项目名称" },
          projectIntro: { type: Type.STRING, description: "项目介绍" },
          problemSolved: { type: Type.STRING, description: "解决了什么问题" },
          customerPersona: { type: Type.STRING, description: "客户画像" },
          solution: { type: Type.STRING, description: "解决方案" },
          externalLink: { type: Type.STRING, description: "成品或演示链接" },
          developerPrompt: { type: Type.STRING, description: "AI 代码辅助生成的 Prompt，描述清楚功能模块、技术栈建议和核心交互" }
        },
        required: ["projectName", "projectIntro", "problemSolved", "customerPersona", "solution", "developerPrompt"]
      },
    },
  });

  const result = JSON.parse(response.text);
  
  return {
    summary: {
      projectName: result.projectName,
      projectIntro: result.projectIntro,
      problemSolved: result.problemSolved,
      customerPersona: result.customerPersona,
      solution: result.solution,
      externalLink: result.externalLink || post.url
    },
    developerPrompt: result.developerPrompt
  };
};
