/**
 * 甘特图组件 - 蓝白配色，Apple风格
 */

import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface GanttData {
  name: string;
  start: string; // 格式: "2024-01" 或 "2024-01-15"
  end: string;
  progress?: number; // 0-100，可选
  status?: 'pending' | 'in-progress' | 'completed' | 'delayed';
  department?: string;
}

export interface GanttChartProps {
  title?: string;
  data: GanttData[];
  delay?: number;
}

// 将日期字符串转换为月份索引（从2024-01开始为0）
function parseDate(dateStr: string): number {
  const match = dateStr.match(/(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (!match) return 0;
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  return (year - 2024) * 12 + (month - 1);
}

// 计算月份跨度
function getMonthRange(data: GanttData[]): { start: number; end: number; months: string[] } {
  if (data.length === 0) {
    return { start: 0, end: 11, months: [] };
  }
  
  let minMonth = Infinity;
  let maxMonth = -Infinity;
  
  data.forEach(item => {
    const start = parseDate(item.start);
    const end = parseDate(item.end);
    minMonth = Math.min(minMonth, start);
    maxMonth = Math.max(maxMonth, end);
  });
  
  // 至少显示12个月
  minMonth = Math.max(0, minMonth - 1);
  maxMonth = Math.max(minMonth + 11, maxMonth + 1);
  
  const months: string[] = [];
  for (let i = minMonth; i <= maxMonth; i++) {
    const year = 2024 + Math.floor(i / 12);
    const month = (i % 12) + 1;
    months.push(`${year}-${String(month).padStart(2, '0')}`);
  }
  
  return { start: minMonth, end: maxMonth, months };
}

export const GanttChart = ({ title, data, delay = 0 }: GanttChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="my-4 p-4 bg-white rounded-xl border border-[#E5E5EA]">
        <p className="text-[13px] text-[#86868b]">甘特图数据为空</p>
      </div>
    );
  }
  
  const { start: minMonth, end: maxMonth, months } = getMonthRange(data);
  const totalMonths = maxMonth - minMonth + 1;
  const monthWidth = 100 / totalMonths;
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-[#34C759]';
      case 'in-progress': return 'bg-[#007AFF]';
      case 'delayed': return 'bg-[#FF3B30]';
      default: return 'bg-[#8E8E93]';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="my-4 bg-white rounded-xl border border-[#E5E5EA] shadow-sm overflow-hidden"
    >
      {title && (
        <div className="px-5 py-3 border-b border-[#E5E5EA] bg-[#F5F5F7]">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">{title}</h3>
        </div>
      )}
      
      <div className="p-5 overflow-x-auto">
        {/* 时间轴头部 */}
        <div className="flex mb-4 border-b border-[#E5E5EA] pb-2">
          <div className="w-32 flex-shrink-0"></div>
          <div className="flex-1 flex">
            {months.map((month) => {
              const [year, monthNum] = month.split('-');
              return (
                <div
                  key={month}
                  className="flex-shrink-0 text-center"
                  style={{ width: `${monthWidth}%` }}
                >
                  <div className="text-[11px] font-medium text-[#86868b]">
                    {year}年{parseInt(monthNum)}月
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 项目行 */}
        <div className="space-y-3">
          {data.map((item, index) => {
            const itemStart = parseDate(item.start);
            const itemEnd = parseDate(item.end);
            const left = ((itemStart - minMonth) / totalMonths) * 100;
            const width = ((itemEnd - itemStart + 1) / totalMonths) * 100;
            const progress = item.progress || 0;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + index * 0.05 }}
                className="flex items-center gap-3"
              >
                {/* 项目名称 */}
                <div className="w-32 flex-shrink-0">
                  <div className="text-[13px] font-medium text-[#1d1d1f] truncate">
                    {item.name}
                  </div>
                  {item.department && (
                    <div className="text-[11px] text-[#86868b] mt-0.5">
                      {item.department}
                    </div>
                  )}
                </div>
                
                {/* 时间条 */}
                <div className="flex-1 relative h-8 bg-[#F5F5F7] rounded-lg overflow-hidden">
                  {/* 进度条 */}
                  <div
                    className={clsx(
                      'absolute h-full rounded-lg transition-all',
                      getStatusColor(item.status)
                    )}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      opacity: 0.8,
                    }}
                  >
                    {/* 进度指示 */}
                    {progress > 0 && progress < 100 && (
                      <div
                        className="absolute top-0 left-0 h-full bg-white/30 rounded-lg"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                  </div>
                  
                  {/* 时间标签 */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#1d1d1f] whitespace-nowrap"
                    style={{ left: `calc(${left}% + 4px)` }}
                  >
                    {item.start} ~ {item.end}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};



