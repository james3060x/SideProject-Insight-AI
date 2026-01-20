
import React, { useState } from 'react';

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    // Mock subscription
    setIsSubscribed(true);
    setTimeout(() => {
      alert(`订阅成功！我们将每日为 ${email} 发送最新独立项目拆解。`);
    }, 100);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 md:p-12 text-white mb-12 shadow-xl shadow-indigo-200 relative overflow-hidden text-center">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">免费服务</span>
          <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs font-medium">每日早 8:00 定时推送</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">订阅每日独立开发灵感</h2>
        <p className="text-indigo-100 text-base md:text-lg mb-8 leading-relaxed">
          错过今日热门？我们将过去 24h 全球最火的 SideProject 深度拆解直发邮箱。<br className="hidden md:block" />
          包含商业逻辑剖析、核心盈利点及 AI 编程指令。
        </p>
        
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input 
            type="email" 
            placeholder="输入您的邮箱地址..." 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg"
          />
          <button 
            type="submit"
            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-lg text-lg whitespace-nowrap"
          >
            {isSubscribed ? '已加入列表' : '免费订阅'}
          </button>
        </form>
        
        {isSubscribed ? (
          <p className="mt-4 text-sm text-indigo-100 font-medium animate-bounce">
            ✨ 欢迎加入！第一份灵感周报将于明日送达。
          </p>
        ) : (
          <p className="mt-6 text-xs text-indigo-200/70">
            已有 5,000+ 独立开发者订阅，随时可取消订阅。
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsletterSection;
