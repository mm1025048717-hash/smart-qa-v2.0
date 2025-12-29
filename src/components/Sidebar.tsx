import { motion } from 'framer-motion';
import { 
  MessageSquarePlus, 
  History, 
  Settings, 
  Database,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  onNewChat: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ onNewChat, collapsed, onToggle }: SidebarProps) => {

  const menuItems = [
    { id: 'history', icon: History, label: '历史对话' },
    { id: 'data', icon: Database, label: '数据源' },
    { id: 'settings', icon: Settings, label: '设置' },
  ];

  const historyItems = [
    { id: '1', title: '今年销售额分析', time: '刚刚' },
    { id: '2', title: '各地区销售对比', time: '2小时前' },
    { id: '3', title: '11月销售额异常', time: '昨天' },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-full bg-white border-r border-[#E8F0FF] flex flex-col flex-shrink-0 z-30 relative"
    >
      {/* 顶部Logo区域 */}
      <div className="h-16 flex items-center px-6 border-b border-[#E8F0FF]">
        <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
          <MessageSquarePlus className="w-5 h-5 text-white" />
        </div>
        <motion.span 
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          className="ml-3 font-semibold text-apple-text text-lg whitespace-nowrap overflow-hidden"
        >
          智能问答
        </motion.span>
      </div>

      {/* 新建对话按钮 */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className={clsx(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            "bg-primary-50 hover:bg-primary-100 text-primary-600"
          )}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="font-medium">新建对话</span>
          )}
        </button>
      </div>

      {/* 导航菜单 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 text-xs font-medium text-[#4E5969]">最近历史</div>
        )}
        
        {historyItems.map((item) => (
          <button
            key={item.id}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group",
              "hover:bg-[#F5F9FF]"
            )}
          >
            <MessageSquarePlus className="w-4 h-4 text-[#86909C] group-hover:text-[#1664FF]" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#1D2129] truncate">{item.title}</div>
                <div className="text-xs text-[#86909C]">{item.time}</div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 底部菜单 */}
      <div className="p-3 border-t border-[#E8F0FF] space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
              "text-[#4E5969] hover:text-[#1664FF] hover:bg-[#F5F9FF]"
            )}
          >
            <item.icon className="w-5 h-5" />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
        
        {/* 用户信息 */}
        <div className="mt-2 pt-2 border-t border-[#E8F0FF] flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[#E8F0FF] flex items-center justify-center text-[#1664FF] font-semibold text-sm">
            AC
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#1D2129]">Alex Chen</div>
              <div className="text-xs text-[#86909C]">Pro Plan</div>
            </div>
          )}
          {!collapsed && (
            <button className="p-1 hover:bg-[#F5F9FF] rounded-lg text-[#86909C]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-[#E8F0FF] shadow-sm rounded-full flex items-center justify-center text-[#86909C] hover:text-[#1664FF] hover:scale-110 transition-all z-40"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.div>
  );
};

export default Sidebar;
