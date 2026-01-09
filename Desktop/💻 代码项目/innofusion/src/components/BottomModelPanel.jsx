import React from 'react';

export function BottomModelPanel({ model, setModel, agent, setAgent, prompt, setPrompt }) {
  return (
    <div className="absolute left-4 bottom-6 z-20 bg-white/90 border border-bfl-border rounded-2xl shadow-sm px-3 py-2 flex items-center gap-2">
      <select className="text-sm border border-bfl-border rounded px-2 py-1" value={agent} onChange={(e)=>setAgent(e.target.value)}>
        <option value="fusion">Fusion-Agent</option>
        <option value="pitch">Pitch-Agent</option>
      </select>
      <select className="text-sm border border-bfl-border rounded px-2 py-1" value={model} onChange={(e)=>setModel(e.target.value)}>
        <option value="deepseek-chat">DeepSeek</option>
        <option value="ali:qwen-turbo">Qwen (Aliyun)</option>
      </select>
      <input className="text-sm border border-bfl-border rounded px-2 py-1 w-64" placeholder="优化提示词（可选）"
        value={prompt} onChange={e=>setPrompt(e.target.value)} />
    </div>
  );
}


