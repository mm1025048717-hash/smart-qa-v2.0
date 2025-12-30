import { useState } from 'react';
import { Send, Globe, Terminal, Plus, MessageSquare, ExternalLink, MoreHorizontal, Layout, Type } from 'lucide-react';

// --- 1. 问答卡片 (Q&A Card) ---
interface QnACardProps {
  data: { question: string; answer?: string }[];
}

export const QnACard = ({ data = [] }: QnACardProps) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState(Array.isArray(data) ? data : []);

  const handleSend = () => {
    if (!input.trim()) return;
    setHistory([...history, { question: input, answer: 'AI 正在思考中... (模拟响应)' }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden w-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 w-full">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">暂无问答记录</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="space-y-2 w-full">
              <div className="flex justify-end">
                <div className="bg-[#1664FF] text-white px-3 py-2 rounded-l-xl rounded-tr-xl text-xs max-w-[90%] break-words">
                  {item.question}
                </div>
              </div>
              {item.answer && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-r-xl rounded-tl-xl text-xs max-w-[90%] break-words">
                    {item.answer}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="p-2 border-t border-gray-100 flex gap-2 w-full mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入问题..."
          className="flex-1 text-xs px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1664FF] min-w-0"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          onClick={(e) => e.stopPropagation()} 
        />
        <button 
          onClick={(e) => { e.stopPropagation(); handleSend(); }}
          className="p-2 bg-[#1664FF] text-white rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// --- 2. 导航栏卡片 (Navigation Card) ---
interface NavCardProps {
  data: { buttons: { name: string; link?: string; color?: string }[] };
}

export const NavCard = ({ data }: NavCardProps) => {
  const buttons = data?.buttons || [];
  
  return (
    <div className="flex flex-wrap gap-2 h-full w-full items-center content-center p-2 overflow-hidden">
      {buttons.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
          <Layout className="w-8 h-8 mb-2 opacity-30" />
          <div className="text-xs">暂无导航项</div>
        </div>
      ) : (
        buttons.map((btn, idx) => (
          <a
            key={idx}
            href={btn.link || '#'}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[80px] max-w-[120px] px-3 py-2 rounded-lg text-xs font-medium transition-all hover:brightness-95 active:scale-95 shadow-sm text-center truncate flex items-center justify-center"
            style={{ 
              backgroundColor: btn.color || '#F5F9FF',
              color: btn.color ? '#FFFFFF' : '#1D2129'
            }}
          >
            {btn.name}
          </a>
        ))
      )}
      <button 
        onClick={(e) => e.stopPropagation()}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-[#1664FF] hover:text-[#1664FF] transition-colors flex-shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- 3. 指令卡片 (Command Card) ---
interface CommandCardProps {
  data: { commands: { label: string; action: string }[] };
}

export const CommandCard = ({ data }: CommandCardProps) => {
  const commands = data?.commands || [];

  return (
    <div className="grid grid-cols-1 gap-2 h-full w-full p-2 overflow-y-auto">
      {commands.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 col-span-full">
          <Terminal className="w-8 h-8 mb-2 opacity-30" />
          <div className="text-xs">暂无指令</div>
        </div>
      ) : (
        commands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); /* TODO: Execute command */ }}
            className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 rounded-lg transition-all group text-left w-full"
          >
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <Terminal className="w-3 h-3 text-gray-600 group-hover:text-[#1664FF]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 group-hover:text-[#1664FF] truncate">{cmd.label}</div>
              <div className="text-[9px] text-gray-400 truncate font-mono">{cmd.action}</div>
            </div>
          </button>
        ))
      )}
      <button 
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center p-2 border border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-[#1664FF] hover:text-[#1664FF] hover:bg-blue-50/30 transition-all text-xs gap-1"
      >
        <Plus className="w-3 h-3" />
        <span>新建指令</span>
      </button>
    </div>
  );
};

// --- 4. 网页卡片 (Web Card) ---
interface WebCardProps {
  data: { url: string; title?: string };
}

export const WebCard = ({ data }: WebCardProps) => {
  const [url, setUrl] = useState(data?.url || '');
  const [isEditing, setIsEditing] = useState(!data?.url);

  if (isEditing) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
        <Globe className="w-8 h-8 text-gray-300 mb-3" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="请输入以 https:// 开头的网址"
          className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg mb-2 focus:border-[#1664FF] focus:outline-none"
        />
        <button 
          onClick={(e) => { e.stopPropagation(); if(url) setIsEditing(false); }}
          className="px-4 py-1.5 bg-[#1664FF] text-white text-xs rounded-md hover:bg-blue-600"
        >
          嵌入网页
        </button>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative group bg-gray-100 rounded-lg overflow-hidden">
      <iframe 
        src={url} 
        className="w-full h-full border-0" 
        title="Embedded Content"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 p-1 rounded-lg backdrop-blur">
        <button 
          onClick={(e) => { e.stopPropagation(); window.open(url, '_blank'); }}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#1664FF]"
          title="在新窗口打开"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#1664FF]"
          title="修改地址"
        >
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// --- 5. 文本卡片 (Text Card) - 增强版 ---
interface TextCardProps {
  data: string;
}

export const TextCard = ({ data }: TextCardProps) => {
  if (!data) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-300">
        <Type className="w-6 h-6 mb-2 opacity-30" />
        <span className="text-xs">点击编辑输入内容</span>
      </div>
    );
  }
  return (
    <div className="h-full w-full p-2 overflow-y-auto">
      <div className="whitespace-pre-wrap text-xs leading-relaxed text-gray-600 font-sans">
        {data}
      </div>
    </div>
  );
};

// --- 6. 空白卡片 (Empty Card) ---
export const EmptyCard = () => {
  return (
    <div className="h-full w-full border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center group hover:border-blue-300 transition-colors bg-gray-50/30">
      <Plus className="w-6 h-6 text-gray-300 group-hover:text-blue-400 transition-colors mb-1" />
      <span className="text-[10px] text-gray-400 group-hover:text-blue-400">空白区域</span>
    </div>
  );
};
