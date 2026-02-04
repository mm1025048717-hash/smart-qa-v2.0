import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Sparkles, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  onNewChat: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ onNewChat, collapsed, onToggle }: SidebarProps) => {
  const [searchValue, setSearchValue] = useState('');

  const historyItems = [
    { id: '1', title: '今年销售额分析', time: '刚刚' },
    { id: '2', title: '各地区销售对比', time: '2小时前' },
    { id: '3', title: '11月销售额异常', time: '昨天' },
  ];

  const filteredHistory = searchValue.trim()
    ? historyItems.filter((item) => item.title.includes(searchValue.trim()))
    : historyItems;

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-full bg-[#F9F9FB] border-r border-[#E5E5EA] flex flex-col flex-shrink-0 z-30 relative"
    >
      {/* 顶部Logo区域 */}
      <div className="h-14 px-4 flex items-center">
        <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E5EA] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
        </div>
        {!collapsed && (
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            className="ml-2 text-[13px] font-semibold text-[#1D1D1F] tracking-tight whitespace-nowrap overflow-hidden"
          >
            亿问 Data Agent
          </motion.span>
        )}
      </div>

      {/* 新建任务 + 搜索 */}
      <div className="px-4 pt-2 pb-3">
        <button
          onClick={onNewChat}
          className={clsx(
            "w-full inline-flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200",
            "bg-white border border-[#E5E5EA] hover:border-[#007AFF]/30 hover:bg-[#F5F5F7] text-[#1D1D1F]"
          )}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && <span className="font-medium text-[13px]">新建任务</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-[#C7C7CC] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="搜索"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E5E5EA] text-[13px] text-[#1D1D1F] placeholder:text-[#C7C7CC] focus:outline-none focus:border-[#007AFF]/40 focus:ring-2 focus:ring-[#007AFF]/10 transition-all"
            />
          </div>
        )}
      </div>

      {/* 探索数字员工 */}
      <div className="px-4 space-y-2">
        <button
          type="button"
          className="w-full inline-flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-[#E5E5EA] hover:border-[#007AFF]/30 hover:bg-[#F5F5F7] transition-all"
        >
          <span className="inline-flex items-center gap-2 text-[13px] text-[#1D1D1F]">
            <Sparkles className="w-4 h-4 text-[#007AFF]" />
            {!collapsed && (
              <>
                探索数字员工
                <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F0F7FF] text-[#007AFF] border border-[#007AFF]/15">
                  New
                </span>
              </>
            )}
          </span>
          {!collapsed && <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />}
        </button>
        
        {/* PRD文档入口 */}
        <a
          href="?page=prd"
          className="w-full inline-flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#F0F7FF] to-[#F5F0FF] border border-[#E5E5EA] hover:border-[#5856D6]/30 hover:shadow-sm transition-all"
        >
          <span className="inline-flex items-center gap-2 text-[13px] text-[#1D1D1F]">
            <FileText className="w-4 h-4 text-[#5856D6]" />
            {!collapsed && (
              <>
                PRD 文档
                <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[#5856D6]/10 text-[#5856D6] border border-[#5856D6]/15">
                  交互式
                </span>
              </>
            )}
          </span>
          {!collapsed && <ChevronRight className="w-4 h-4 text-[#C7C7CC]" />}
        </a>
      </div>

      {/* 任务记录 */}
      {!collapsed && (
        <div className="mt-5 px-4 text-[12px] text-[#86868B] flex-shrink-0">
          任务记录
        </div>
      )}

      <nav className="px-2 pb-4 mt-2 flex-1 overflow-y-auto scrollbar-hidden">
        {filteredHistory.map((item) => (
          <button
            key={item.id}
            className={clsx(
              "w-full text-left px-3 py-2 rounded-xl transition-colors",
              "hover:bg-white text-[#1D1D1F]"
            )}
          >
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[13px] truncate">{item.title}</div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* 用户信息 */}
      <div className="mt-auto px-4 py-4 border-t border-[#E5E5EA] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center text-xs font-semibold">
            我
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[13px] text-[#1D1D1F] font-medium truncate">
                业务负责人
              </div>
              <div className="text-[11px] text-[#86868B] truncate">
                看业务表现、对比增长机会
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-[#E5E5EA] shadow-sm rounded-full flex items-center justify-center text-[#C7C7CC] hover:text-[#007AFF] hover:scale-110 transition-all z-40"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.div>
  );
};

export default Sidebar;
