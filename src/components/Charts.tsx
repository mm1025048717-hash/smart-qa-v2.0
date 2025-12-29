/**
 * 图表组件 - 字节风极简配色
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import { ContentBlock } from '../types';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';

/**
 * 解析图表 JSON 字符串
 * 将 JSON 字符串转换为图表数据对象，并进行格式化和验证
 */
export function parseChartJson(jsonStr: string): any | null {
  if (!jsonStr || typeof jsonStr !== 'string') {
    return null;
  }

  try {
    // 修复 JSON 中数字前导 + 号的问题（如 +3.4 应该改为 3.4）
    // 使用正则表达式替换所有数字前的 + 号
    let cleanedJson = jsonStr.replace(/:\s*\+(\d+\.?\d*)/g, ': $1');
    // 也处理数组中的情况
    cleanedJson = cleanedJson.replace(/,\s*\+(\d+\.?\d*)/g, ', $1');
    cleanedJson = cleanedJson.replace(/\[\s*\+(\d+\.?\d*)/g, '[$1');
    
    // 修复常见的 JSON 语法错误
    // 1. 修复缺少逗号的情况：}]{ 或 }]{
    cleanedJson = cleanedJson.replace(/\}\s*\{/g, '},{');
    // 2. 修复数组中的缺少逗号：}]{ 或 }]{
    cleanedJson = cleanedJson.replace(/\}\s*\{/g, '},{');
    // 3. 修复多余的逗号：},]
    cleanedJson = cleanedJson.replace(/,\s*\]/g, ']');
    cleanedJson = cleanedJson.replace(/,\s*\}/g, '}');
    // 4. 修复缺少引号的键名（如果键名没有引号）
    cleanedJson = cleanedJson.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
    
    // 解析 JSON
    const chartData = JSON.parse(cleanedJson);
    
    // 验证基本结构
    if (!chartData || typeof chartData !== 'object') {
      return null;
    }

    // 确保有 data 字段且为数组
    if (!chartData.data || !Array.isArray(chartData.data) || chartData.data.length === 0) {
      // 某些图表类型可能不需要 data 字段（如 year-comparison）
      if (chartData.type === 'year-comparison' && chartData.currentYear && chartData.lastYear) {
        return chartData;
      }
      return null;
    }

    const dataArray = chartData.data;
    const firstItem = dataArray[0];

    // 如果没有 type，尝试推断
    if (!chartData.type) {
      if (chartData.xKey && chartData.yKeys) {
        chartData.type = 'line';
      } else if (chartData.xKey && chartData.yKey) {
        chartData.type = 'bar';
      } else if (firstItem.value !== undefined && firstItem.name !== undefined) {
        chartData.type = 'pie';
      } else if (firstItem.stage !== undefined) {
        chartData.type = 'funnel';
      } else {
        // 默认推断为折线图或柱状图
        chartData.type = 'line';
      }
    }

    // 如果没有 xKey，尝试从数据中推断
    if (!chartData.xKey && firstItem) {
      // 常见的 x 轴字段名
      const xKeyCandidates = ['date', 'month', 'time', 'name', 'region', 'category', 'x', 'label', 'key'];
      for (const key of xKeyCandidates) {
        if (firstItem[key] !== undefined) {
          chartData.xKey = key;
          break;
        }
      }
      // 如果还是没找到，使用第一个非数值字段
      if (!chartData.xKey) {
        const keys = Object.keys(firstItem);
        for (const key of keys) {
          if (typeof firstItem[key] !== 'number' && key !== 'value' && key !== 'y') {
            chartData.xKey = key;
            break;
          }
        }
      }
    }

    // 如果没有 yKey/yKeys，尝试从数据中推断
    if (chartData.type === 'line' || chartData.type === 'line-chart' || chartData.type === 'area' || chartData.type === 'area-chart') {
      if (!chartData.yKeys || !Array.isArray(chartData.yKeys) || chartData.yKeys.length === 0) {
        // 常见的 y 轴字段名
        const yKeyCandidates = ['value', 'sales', 'amount', 'count', 'y', 'data'];
        const foundYKeys: { key: string; name: string; color?: string }[] = [];
        
        if (firstItem) {
          for (const key of yKeyCandidates) {
            if (firstItem[key] !== undefined && typeof firstItem[key] === 'number') {
              foundYKeys.push({ 
                key, 
                name: key === 'value' ? '数值' : key === 'sales' ? '销售额' : key === 'amount' ? '金额' : key 
              });
            }
          }
          // 如果没找到，查找所有数值字段（排除 xKey）
          if (foundYKeys.length === 0) {
            const keys = Object.keys(firstItem);
            for (const key of keys) {
              if (key !== chartData.xKey && typeof firstItem[key] === 'number') {
                foundYKeys.push({ key, name: key });
                break; // 只取第一个数值字段
              }
            }
          }
        }
        
        if (foundYKeys.length > 0) {
          chartData.yKeys = foundYKeys;
        }
      }
    } else if (chartData.type === 'bar' || chartData.type === 'bar-chart') {
      if (!chartData.yKey) {
        // 常见的 y 轴字段名
        const yKeyCandidates = ['value', 'sales', 'amount', 'count', 'y', 'data'];
        if (firstItem) {
          for (const key of yKeyCandidates) {
            if (firstItem[key] !== undefined && typeof firstItem[key] === 'number') {
              chartData.yKey = key;
              break;
            }
          }
          // 如果没找到，查找第一个数值字段（排除 xKey）
          if (!chartData.yKey) {
            const keys = Object.keys(firstItem);
            for (const key of keys) {
              if (key !== chartData.xKey && typeof firstItem[key] === 'number') {
                chartData.yKey = key;
                break;
              }
            }
          }
        }
      }
    }

    return chartData;
  } catch (e) {
    console.warn('Failed to parse chart JSON:', e, 'JSON:', jsonStr);
    return null;
  }
}

// 字节风数据色盘 (Lark Data Colors)
const COLORS = {
  primary: '#3370FF',    // 品牌蓝
  secondary: '#34C724',  // 成功绿
  warning: '#FF8800',    // 警告橙
  danger: '#F54A45',     // 错误红
  purple: '#7B61FF',     // 辅助紫
  cyan: '#19B9E3',       // 辅助青
  
  // 数据序列色
  palette: ['#3370FF', '#34C724', '#FF8800', '#7B61FF', '#19B9E3', '#F54A45'],
  comparison: ['#3370FF', '#9CA3AF'], // 对比色：蓝 vs 灰
  
  // 基础色
  text: '#1F2329',
  textLight: '#8F959E',
  border: '#DEE0E3',
  bg: '#F5F6F7',
};

// 汇总信息类型
interface SummaryItem {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

// 图表容器
interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  showTabs?: boolean;
  delay?: number;
  summary?: SummaryItem[] | string; // 底部汇总信息
  blockData?: ContentBlock; // 图表块数据，用于添加到看板
  onAddToDashboard?: (block: ContentBlock) => void; // 添加到看板回调
}

export const ChartContainer = ({ 
  title, 
  children, 
  showTabs = false,  // 默认不显示 tabs
  delay = 0,
  summary,
  blockData,
  onAddToDashboard,
}: ChartContainerProps) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'code'>('chart');
  
  // 处理添加到看板
  const handleAddToDashboard = () => {
    if (blockData && onAddToDashboard) {
      onAddToDashboard(blockData);
    }
  };
  
  // 格式化汇总显示
  const renderSummary = () => {
    if (!summary) return null;
    
    // 字符串格式直接显示
    if (typeof summary === 'string') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 pt-3 border-t border-slate-100 flex-shrink-0"
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-500">总计：</span>
            <span className="font-semibold text-blue-600">{summary}</span>
          </div>
        </motion.div>
      );
    }
    
    // 数组格式显示多个汇总项
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3 pt-3 border-t border-slate-100 flex-shrink-0"
      >
        <div className="flex items-center justify-center gap-1 flex-wrap text-sm">
          <span className="text-slate-500">总计：</span>
          {summary.map((item, index) => (
            <span key={index} className="inline-flex items-center">
              <span className="text-slate-600">{item.label}</span>
              <span className={clsx(
                "font-semibold mx-1",
                item.highlight ? "text-blue-600" : "text-slate-800"
              )}>
                {item.value}{item.unit || ''}
              </span>
              {index < summary.length - 1 && (
                <span className="text-slate-300 mx-1">，</span>
              )}
            </span>
          ))}
        </div>
      </motion.div>
    );
  };

  // 如果没有标题和tabs，直接渲染内容（无边框无padding）
  const hasHeader = title || showTabs;

  // 纯净模式：直接渲染图表，无任何包装，但仍需要显示添加到看板按钮
  if (!hasHeader) {
    return (
      <div className="h-full w-full flex flex-col relative" style={{ minHeight: '200px' }}>
        {/* 添加到数据看板按钮 - 即使没有标题也显示 */}
        {blockData && onAddToDashboard && (
          <button
            onClick={handleAddToDashboard}
            className="absolute top-2 right-2 h-7 px-3 rounded-lg flex items-center justify-center text-[#007AFF] hover:text-white bg-white hover:bg-[#007AFF] transition-all duration-200 border border-[#007AFF]/30 hover:border-[#007AFF] z-[60] text-[12px] font-medium whitespace-nowrap"
            title="添加到数据看板"
          >
            添加
          </button>
        )}
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
      className={clsx(
        "h-full flex flex-col min-h-0",
        hasHeader && "bg-white rounded-xl border border-[#DEE0E3] p-4 shadow-sm"
      )}
    >
      {hasHeader && (
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1">
            {title && <h4 className="font-semibold text-[#1F2329] text-[15px]">{title}</h4>}
          </div>
          <div className="flex items-center gap-2 relative z-[60]">
            {/* 添加到数据看板按钮 */}
            {blockData && onAddToDashboard && (
              <button
                onClick={handleAddToDashboard}
                className="h-7 px-3 rounded-lg flex items-center justify-center text-[#007AFF] hover:text-white bg-white hover:bg-[#007AFF] transition-all duration-200 border border-[#007AFF]/30 hover:border-[#007AFF] text-[12px] font-medium whitespace-nowrap relative z-[60]"
                title="添加到数据看板"
              >
                添加
              </button>
            )}
            {showTabs && (
              <div className="flex bg-[#F5F6F7] rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('chart')}
                  className={clsx(
                    'px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all',
                    activeTab === 'chart' ? 'bg-white text-[#3370FF] shadow-sm' : 'text-[#646A73] hover:text-[#1F2329]'
                  )}
                >
                  图表
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={clsx(
                    'px-3 py-1 rounded-[6px] text-[12px] font-medium transition-all',
                    activeTab === 'code' ? 'bg-white text-[#3370FF] shadow-sm' : 'text-[#646A73] hover:text-[#1F2329]'
                  )}
                >
                  代码
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={clsx(
        "flex-1 min-h-0 flex flex-col",
        activeTab === 'chart' ? 'block' : 'hidden'
      )}>
        <div className="flex-1 min-h-0">
          {children}
        </div>
        {renderSummary()}
      </div>
      
      {activeTab === 'code' && showTabs && (
        <div className="flex-1 bg-[#F5F6F7] rounded-lg p-4 text-[12px] font-mono text-[#646A73] overflow-auto border border-[#DEE0E3]">
          <pre className="whitespace-pre-wrap">{`SELECT date_trunc('month', order_date) as month,
  SUM(amount) as total_amount
FROM orders WHERE year = 2024
GROUP BY 1 ORDER BY 1;`}</pre>
        </div>
      )}
    </motion.div>
  );
};

// 折线图
interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: { key: string; name: string; color?: string }[];
  title?: string;
  showArea?: boolean;
  delay?: number;
  summary?: SummaryItem[] | string;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const LineChartComponent = ({
  data,
  xKey,
  yKeys,
  title,
  showArea = false,
  delay = 0,
  summary,
  blockData,
  onAddToDashboard,
}: LineChartProps) => {
  const ChartComponent = showArea ? AreaChart : RechartsLineChart;
  
  // 数据验证
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
        <div className="py-8 text-center text-[#646A73] text-[13px]">
          暂无数据
        </div>
      </ChartContainer>
    );
  }

  if (!xKey || !yKeys || !Array.isArray(yKeys) || yKeys.length === 0) {
    return (
      <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
        <div className="py-8 text-center text-[#FF3B30] text-[13px]">
          图表配置错误：缺少必要的参数
        </div>
      </ChartContainer>
    );
  }
  
  return (
    <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="flex items-center gap-4 mb-2 flex-shrink-0">
        {yKeys.map((item, index) => (
          <div key={item.key} className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: item.color || COLORS.comparison[index] }}
            />
            <span className="text-[12px] text-[#646A73]">{item.name}</span>
          </div>
        ))}
      </div>
      
      <div className="flex-1 relative" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: COLORS.textLight, fontSize: 11 }}
            dy={8}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: COLORS.textLight, fontSize: 11 }}
            tickFormatter={(value) => {
              if (value >= 10000) return (value / 10000).toFixed(0) + '万';
              return value;
            }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #DEE0E3', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
              color: '#1F2329'
            }}
            itemStyle={{ color: '#1F2329' }}
          />
          {yKeys.map((item, index) => (
            showArea ? (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color || COLORS.comparison[index]}
                fill={item.color || COLORS.comparison[index]}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ) : (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color || COLORS.comparison[index]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
        </div>
      </div>
    </ChartContainer>
  );
};

// 柱状图
interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
  horizontal?: boolean;
  delay?: number;
  summary?: SummaryItem[] | string;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const BarChartComponent = ({
  data,
  xKey,
  yKey,
  title,
  color = COLORS.primary,
  horizontal = false,
  delay = 0,
  summary,
  blockData,
  onAddToDashboard,
}: BarChartProps) => {
  // 数据验证
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
        <div className="py-8 text-center text-[#646A73] text-[13px]">
          暂无数据
        </div>
      </ChartContainer>
    );
  }

  if (!xKey || !yKey) {
    return (
      <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
        <div className="py-8 text-center text-[#FF3B30] text-[13px]">
          图表配置错误：缺少必要的参数
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="flex-1 relative" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart 
              data={data} 
              layout={horizontal ? 'vertical' : 'horizontal'}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" horizontal={!horizontal} vertical={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} />
              <YAxis type="category" dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 11 }} />
            </>
          )}
          <Tooltip
            cursor={{ fill: '#F5F6F7' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #DEE0E3',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px'
            }}
          />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 4, 4]} maxBarSize={32} />
        </RechartsBarChart>
      </ResponsiveContainer>
        </div>
      </div>
    </ChartContainer>
  );
};

// 饼图
interface PieChartProps {
  data: { name: string; value: number }[];
  title?: string;
  showPercent?: boolean;
  innerRadius?: number;
  delay?: number;
  summary?: SummaryItem[] | string;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const PieChartComponent = ({
  data,
  title,
  showPercent = true,
  innerRadius = 45,
  delay = 0,
  summary,
  blockData,
  onAddToDashboard,
}: PieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="flex items-center h-full gap-4" style={{ minHeight: '180px' }}>
        {/* 饼图区域 - 占据左侧 */}
        <div className="flex-1 h-full relative" style={{ minHeight: '150px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.palette[index % COLORS.palette.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #DEE0E3',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px'
                }}
              />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 图例区域 - 占据右侧 */}
        <div className="w-[140px] flex-shrink-0 flex flex-col justify-center space-y-2 overflow-y-auto">
          {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: COLORS.palette[index % COLORS.palette.length] }}
                  />
                  <span className="text-[12px] text-[#646A73]">{item.name}</span>
                </div>
                <span className="text-[13px] font-semibold text-[#1F2329] font-mono">
                  {showPercent ? `${((item.value / total) * 100).toFixed(1)}%` : item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ChartContainer>
    );
  };

// 年度对比图
interface YearComparisonChartProps {
  data: Record<string, unknown>[];
  currentYear: string;
  lastYear: string;
  title?: string;
  delay?: number;
  onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比' }) => void;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const YearComparisonChart = ({
  data,
  currentYear,
  lastYear,
  title = '年度趋势对比',
  delay = 0,
  onAttributionClick,
  blockData,
  onAddToDashboard,
}: YearComparisonChartProps) => {
  // 计算年度对比的增长率（如果有数据）
  const calculateYearGrowth = () => {
    if (!data || data.length === 0) return null;
    
    // 计算当前年度和去年度的总和
    const currentYearTotal = data.reduce((sum: number, item: any) => {
      const value = item[currentYear];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
    
    const lastYearTotal = data.reduce((sum: number, item: any) => {
      const value = item[lastYear];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
    
    if (lastYearTotal === 0) return null;
    
    const growth = ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100;
    return {
      value: Math.abs(growth),
      direction: growth > 0 ? 'up' as const : 'down' as const,
      changeType: '同比' as const,
    };
  };
  
  const growthInfo = calculateYearGrowth();
  
  return (
    <div className="relative">
      <LineChartComponent
        data={data}
        xKey="month"
        yKeys={[
          { key: currentYear, name: `${currentYear}年`, color: COLORS.primary },
          { key: lastYear, name: `${lastYear}年`, color: '#C9CFD8' },
        ]}
        title={title}
        delay={delay}
        blockData={blockData}
        onAddToDashboard={onAddToDashboard}
      />
      {/* 年度对比归因按钮 */}
      {onAttributionClick && growthInfo && (
        <div className="absolute top-2 right-2">
          <div className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAttributionClick({
                  metric: title?.replace('年度趋势对比', '销售额') || '销售额',
                  changeValue: growthInfo.value,
                  changeDirection: growthInfo.direction,
                  changeType: growthInfo.changeType,
                });
              }}
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                'text-[#007AFF] hover:text-white',
                'bg-white hover:bg-[#007AFF]',
                'border border-[#007AFF]/30 hover:border-[#007AFF]',
                'hover:scale-110 active:scale-95',
                'cursor-pointer shadow-sm hover:shadow-md'
              )}
              aria-label="归因分析"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            {/* 悬停提示 */}
            <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-[#1d1d1f] text-white text-[11px] rounded whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              想知道为何{growthInfo.direction === 'up' ? '涨' : '降'}了{growthInfo.value.toFixed(1)}%？点击进行归因
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 散点图
interface ScatterChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  title?: string;
  delay?: number;
  summary?: SummaryItem[] | string;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const ScatterChartComponent = ({
  data,
  xKey,
  yKey,
  title,
  delay = 0,
  summary,
  blockData,
  onAddToDashboard,
}: ScatterChartProps) => {
  return (
    <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="flex-1 relative" style={{ minHeight: '180px' }}>
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
          <XAxis type="number" dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 10 }} />
          <YAxis type="number" dataKey={yKey} axisLine={false} tickLine={false} tick={{ fill: COLORS.textLight, fontSize: 10 }} />
          <ZAxis range={[60, 200]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #DEE0E3', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }} 
          />
          <Scatter data={data} fill={COLORS.primary}>
            {data.map((entry: any, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.category === '明星' ? '#34C724' : entry.category === '金牛' ? '#3370FF' : entry.category === '问题' ? '#FF8800' : entry.category === '瘦狗' ? '#F54A45' : COLORS.primary}
              />
            ))}
          </Scatter>
          <ReferenceLine x={400} stroke="#C9CFD8" strokeDasharray="5 5" />
          <ReferenceLine y={20} stroke="#C9CFD8" strokeDasharray="5 5" />
        </ScatterChart>
      </ResponsiveContainer>
        </div>
      </div>
    </ChartContainer>
  );
};

// 漏斗图
interface FunnelChartProps {
  data: { stage: string; value: number; rate?: string }[];
  title?: string;
  delay?: number;
  summary?: SummaryItem[] | string;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const FunnelChartComponent = ({ data, title, delay = 0, summary, blockData, onAddToDashboard }: FunnelChartProps) => {
  return (
    <ChartContainer title={title} delay={delay} summary={summary} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="space-y-3">
        {data.map((item, index) => {
          const widthPercent = (item.value / data[0].value) * 100;
          const prevValue = index > 0 ? data[index - 1].value : null;
          const dropRate = prevValue ? ((prevValue - item.value) / prevValue * 100).toFixed(1) : null;
          
          return (
            <div key={item.stage}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[12px] text-[#646A73] w-16 text-right">{item.stage}</span>
                <div className="flex-1 relative h-8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ delay: delay + index * 0.1, duration: 0.4 }}
                    className="h-full rounded-md flex items-center justify-end pr-3"
                    style={{ backgroundColor: COLORS.palette[index % COLORS.palette.length], minWidth: '60px' }}
                  >
                    <span className="text-white text-[12px] font-semibold">{item.value.toLocaleString()}</span>
                  </motion.div>
                </div>
                {dropRate && <span className="text-[11px] text-[#F54A45] font-medium w-12">↓{dropRate}%</span>}
              </div>
            </div>
          );
        })}
      </div>
    </ChartContainer>
  );
};

// 箱线图
interface BoxPlotProps {
  data: { min: number; q1: number; median: number; q3: number; max: number; outliers?: number[] };
  title?: string;
  delay?: number;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const BoxPlotComponent = ({ data, title, delay = 0, blockData, onAddToDashboard }: BoxPlotProps) => {
  const range = data.max - data.min;
  const scale = (val: number) => ((val - data.min) / range) * 100;
  
  return (
    <ChartContainer title={title} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="py-6 px-2">
        <div className="relative h-12">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[#E5E6EB]" />
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay }} className="absolute top-1/2 h-px bg-[#3370FF] origin-left" style={{ left: `${scale(data.min)}%`, width: `${scale(data.q1) - scale(data.min)}%` }} />
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: delay + 0.1 }} className="absolute top-1/2 h-px bg-[#3370FF] origin-left" style={{ left: `${scale(data.q3)}%`, width: `${scale(data.max) - scale(data.q3)}%` }} />
          <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: delay + 0.2 }} className="absolute top-1/2 -translate-y-1/2 h-8 bg-[#3370FF]/10 border-2 border-[#3370FF] rounded-sm origin-left" style={{ left: `${scale(data.q1)}%`, width: `${scale(data.q3) - scale(data.q1)}%` }} />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.4 }} className="absolute top-1/2 -translate-y-1/2 w-0.5 h-8 bg-[#3370FF]" style={{ left: `${scale(data.median)}%` }} />
          {data.outliers?.map((outlier, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.5 + i * 0.1 }} className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#F54A45] border border-white shadow-sm" style={{ left: `${Math.min(Math.max(scale(outlier), 0), 100)}%`, marginLeft: '-5px' }} />
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[11px] text-[#8F959E] font-mono">
          <span>{data.min}</span>
          <span>Q1: {data.q1}</span>
          <span>Med: {data.median}</span>
          <span>Q3: {data.q3}</span>
          <span>{data.max}</span>
        </div>
        {data.outliers && data.outliers.length > 0 && (
          <div className="mt-3 text-[12px] text-[#F54A45] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F54A45]" />
            发现 {data.outliers.length} 个异常值
          </div>
        )}
      </div>
    </ChartContainer>
  );
};

// 地图
interface MapChartProps {
  data: { province?: string; city?: string; value: number }[];
  title?: string;
  delay?: number;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const MapChartComponent = ({ data, title, delay = 0, blockData, onAddToDashboard }: MapChartProps) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 8);
  const maxValue = sortedData[0]?.value || 1;
  
  return (
    <ChartContainer title={title} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="space-y-4">
        <div className="bg-[#F5F6F7] rounded-lg p-4">
          <div className="text-center text-[#646A73] text-[12px] font-medium mb-3">热力分布</div>
          <div className="grid grid-cols-4 gap-2">
            {sortedData.slice(0, 8).map((item, index) => {
              const intensity = item.value / maxValue;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + index * 0.05 }}
                  className="aspect-square rounded-md flex items-center justify-center text-[11px] font-medium text-white shadow-sm"
                  style={{ backgroundColor: `rgba(51, 112, 255, ${0.3 + intensity * 0.7})` }}
                >
                  {item.province || item.city}
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-2">
          {sortedData.map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.2 + index * 0.03 }} className="flex items-center gap-3">
              <span className={clsx('w-5 h-5 rounded text-[11px] flex items-center justify-center font-semibold', index < 3 ? 'bg-[#3370FF] text-white' : 'bg-[#E5E6EB] text-[#646A73]')}>{index + 1}</span>
              <span className="text-[13px] text-[#1F2329] w-12">{item.province || item.city}</span>
              <div className="flex-1 h-1.5 bg-[#F5F6F7] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / maxValue) * 100}%` }} transition={{ delay: delay + 0.3 + index * 0.03 }} className="h-full rounded-full bg-[#3370FF]" />
              </div>
              <span className="text-[12px] font-medium text-[#1F2329] w-16 text-right font-mono">{item.value.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
};

// 四象限图
interface QuadrantChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  title?: string;
  quadrants?: { label: string; position: string }[];
  delay?: number;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const QuadrantChartComponent = ({ data, xKey, yKey, title, quadrants, delay = 0, blockData, onAddToDashboard }: QuadrantChartProps) => {
  return (
    <ChartContainer title={title} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="relative">
        {quadrants && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {quadrants.map((q, i) => (
              <div key={i} className={clsx('absolute text-[11px] text-[#646A73] font-medium px-2 py-1 bg-white/90 rounded border border-[#DEE0E3] shadow-sm', q.position === 'top-right' && 'top-1 right-1', q.position === 'top-left' && 'top-1 left-1', q.position === 'bottom-right' && 'bottom-8 right-1', q.position === 'bottom-left' && 'bottom-8 left-1')}>{q.label}</div>
            ))}
          </div>
        )}
        <ScatterChartComponent data={data} xKey={xKey} yKey={yKey} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard} />
      </div>
    </ChartContainer>
  );
};

// SmartChart - 智能图表组件，根据类型自动选择合适的图表
interface SmartChartProps {
  chartData: {
    type: string;
    data?: any;
    [key: string]: any;
  };
  delay?: number;
  onDrillDown?: (data: any) => void;
  onAttributionClick?: (data: { metric: string; changeValue: number; changeDirection: 'up' | 'down'; changeType: '同比' | '环比' }) => void;
  blockData?: ContentBlock;
  onAddToDashboard?: (block: ContentBlock) => void;
}

export const SmartChart = ({ chartData, delay = 0, onAttributionClick, blockData, onAddToDashboard }: SmartChartProps) => {
  if (!chartData || !chartData.type) {
    return (
      <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
        <p className="text-[13px] text-[#FF3B30]">图表类型未指定</p>
      </div>
    );
  }

  const { type, ...restProps } = chartData;

  // 验证数据格式
  if (!restProps.data || !Array.isArray(restProps.data) || restProps.data.length === 0) {
    return (
      <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
        <p className="text-[13px] text-[#FF3B30]">图表数据为空或格式错误</p>
      </div>
    );
  }

  // 尝试从数据中推断缺失的参数
  const inferChartParams = (data: any[], type: string) => {
    if (!data || data.length === 0) return null;
    const firstItem = data[0];
    const inferred: any = {};

    // 推断 xKey
    if (!restProps.xKey) {
      const xKeyCandidates = ['date', 'month', 'time', 'name', 'region', 'category', 'x', 'label', 'key'];
      for (const key of xKeyCandidates) {
        if (firstItem[key] !== undefined) {
          inferred.xKey = key;
          break;
        }
      }
      if (!inferred.xKey) {
        const keys = Object.keys(firstItem);
        for (const key of keys) {
          if (typeof firstItem[key] !== 'number' && key !== 'value' && key !== 'y') {
            inferred.xKey = key;
            break;
          }
        }
      }
    }

    // 推断 yKey/yKeys
    if (type === 'line' || type === 'line-chart') {
      if (!restProps.yKeys || !Array.isArray(restProps.yKeys) || restProps.yKeys.length === 0) {
        const yKeyCandidates = ['value', 'sales', 'amount', 'count', 'y', 'data'];
        const foundYKeys: { key: string; name: string; color?: string }[] = [];
        for (const key of yKeyCandidates) {
          if (firstItem[key] !== undefined && typeof firstItem[key] === 'number') {
            foundYKeys.push({ 
              key, 
              name: key === 'value' ? '数值' : key === 'sales' ? '销售额' : key === 'amount' ? '金额' : key 
            });
          }
        }
        if (foundYKeys.length === 0) {
          const keys = Object.keys(firstItem);
          for (const key of keys) {
            if (key !== (restProps.xKey || inferred.xKey) && typeof firstItem[key] === 'number') {
              foundYKeys.push({ key, name: key });
              break;
            }
          }
        }
        if (foundYKeys.length > 0) {
          inferred.yKeys = foundYKeys;
        }
      }
    } else if (type === 'bar' || type === 'bar-chart') {
      if (!restProps.yKey) {
        const yKeyCandidates = ['value', 'sales', 'amount', 'count', 'y', 'data'];
        for (const key of yKeyCandidates) {
          if (firstItem[key] !== undefined && typeof firstItem[key] === 'number') {
            inferred.yKey = key;
            break;
          }
        }
        if (!inferred.yKey) {
          const keys = Object.keys(firstItem);
          for (const key of keys) {
            if (key !== (restProps.xKey || inferred.xKey) && typeof firstItem[key] === 'number') {
              inferred.yKey = key;
              break;
            }
          }
        }
      }
    } else if (type === 'scatter' || type === 'scatter-chart') {
      // 散点图需要 xKey 和 yKey（都是数值字段）
      // xKey 可能是翻台率、坪效等指标
      if (!restProps.xKey) {
        const xKeyCandidates = ['翻台率', 'turnoverRate', '坪效', 'salesPerSqm', '客单价', 'avgOrderValue', 'x', 'xAxis'];
        for (const key of xKeyCandidates) {
          if (firstItem[key] !== undefined && typeof firstItem[key] === 'number') {
            inferred.xKey = key;
            break;
          }
        }
        // 如果还没找到，查找第一个数值字段作为 xKey
        if (!inferred.xKey) {
          const keys = Object.keys(firstItem);
          for (const key of keys) {
            if (typeof firstItem[key] === 'number') {
              inferred.xKey = key;
              break;
            }
          }
        }
      }
      
      // yKey 是另一个数值字段（不能和 xKey 相同）
      if (!restProps.yKey) {
        const yKeyCandidates = ['客单价', 'avgOrderValue', '翻台率', 'turnoverRate', '坪效', 'salesPerSqm', 'y', 'yAxis', 'value', 'sales', 'amount'];
        for (const key of yKeyCandidates) {
          if (firstItem[key] !== undefined && typeof firstItem[key] === 'number' && key !== (restProps.xKey || inferred.xKey)) {
            inferred.yKey = key;
            break;
          }
        }
        // 如果还没找到，查找第二个数值字段作为 yKey
        if (!inferred.yKey) {
          const keys = Object.keys(firstItem);
          let foundFirst = false;
          for (const key of keys) {
            if (typeof firstItem[key] === 'number') {
              if (!foundFirst && key === (restProps.xKey || inferred.xKey)) {
                foundFirst = true;
                continue;
              }
              if (foundFirst || key !== (restProps.xKey || inferred.xKey)) {
                inferred.yKey = key;
                break;
              }
            }
          }
        }
      }
    }

    return inferred;
  };

  const inferredParams = inferChartParams(restProps.data, type);
  const finalProps = { ...restProps, ...inferredParams };

  switch (type) {
    case 'line':
    case 'line-chart':
      if (finalProps.type === 'year-comparison') {
        return <YearComparisonChart {...finalProps} delay={delay} onAttributionClick={onAttributionClick} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
      }
      // 验证折线图必需的参数
      if (!finalProps.xKey || !finalProps.yKeys || !Array.isArray(finalProps.yKeys) || finalProps.yKeys.length === 0) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">折线图配置错误：缺少 xKey 或 yKeys</p>
            <p className="text-[11px] text-[#86868b] mt-1">数据字段: {restProps.data?.[0] ? Object.keys(restProps.data[0]).join(', ') : '无'}</p>
          </div>
        );
      }
      return <LineChartComponent {...finalProps} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
    
    case 'bar':
    case 'bar-chart':
      // 验证柱状图必需的参数
      if (!finalProps.xKey || !finalProps.yKey) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">柱状图配置错误：缺少 xKey 或 yKey</p>
            <p className="text-[11px] text-[#86868b] mt-1">数据字段: {restProps.data?.[0] ? Object.keys(restProps.data[0]).join(', ') : '无'}</p>
          </div>
        );
      }
      return <BarChartComponent {...finalProps} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
    
    case 'pie':
    case 'pie-chart':
      // 饼图需要 data 数组
      if (!restProps.data || !Array.isArray(restProps.data) || restProps.data.length === 0) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">饼图数据为空</p>
          </div>
        );
      }
      return <PieChartComponent data={restProps.data} title={restProps.title} showPercent={restProps.showPercent} innerRadius={restProps.innerRadius} delay={delay} summary={restProps.summary} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
    
    case 'scatter':
    case 'scatter-chart':
      // 尝试自动推断 xKey 和 yKey（如果缺失）
      if (!finalProps.xKey || !finalProps.yKey) {
        const firstItem = finalProps.data?.[0];
        if (firstItem) {
          // 推断 xKey（散点图通常用于关联分析，xKey可能是翻台率、客单价等）
          if (!finalProps.xKey) {
            const xKeyCandidates = ['date', 'month', 'time', 'name', 'region', 'category', 'x', 'label', 'key', 'xAxis', '翻台率', 'turnoverRate', '坪效', 'salesPerSqm', '客单价', 'avgOrderValue'];
            for (const key of xKeyCandidates) {
              if (firstItem[key] !== undefined) {
                finalProps.xKey = key;
                break;
              }
            }
            // 如果还没找到，查找第一个非数值字段
            if (!finalProps.xKey) {
              for (const key of Object.keys(firstItem)) {
                if (typeof firstItem[key] !== 'number' && key !== 'value' && key !== 'y' && key !== 'yAxis') {
                  finalProps.xKey = key;
                  break;
                }
              }
            }
          }
          
          // 推断 yKey（散点图的yKey通常是另一个数值指标）
          if (!finalProps.yKey) {
            const yKeyCandidates = ['value', 'sales', 'amount', 'count', 'y', 'data', '客单价', 'avgOrderValue', '翻台率', 'turnoverRate', '坪效', 'salesPerSqm', 'yAxis'];
            for (const key of yKeyCandidates) {
              if (firstItem[key] !== undefined && typeof firstItem[key] === 'number' && key !== finalProps.xKey) {
                finalProps.yKey = key;
                break;
              }
            }
            // 如果还没找到，查找第一个数值字段（排除 xKey）
            if (!finalProps.yKey) {
              for (const key of Object.keys(firstItem)) {
                if (key !== finalProps.xKey && typeof firstItem[key] === 'number') {
                  finalProps.yKey = key;
                  break;
                }
              }
            }
          }
        }
      }
      
      // 最终检查
      if (!finalProps.xKey || !finalProps.yKey) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">散点图配置错误：缺少 xKey 或 yKey</p>
            <p className="text-[11px] text-[#86868b] mt-1">数据字段: {finalProps.data?.[0] ? Object.keys(finalProps.data[0]).join(', ') : '无'}</p>
            <p className="text-[11px] text-[#86868b] mt-1">提示：散点图需要明确指定 xKey 和 yKey，例如：{"{"}"type":"scatter","xKey":"翻台率","yKey":"客单价","data":[...]{"}"}</p>
          </div>
        );
      }
      return <ScatterChartComponent data={finalProps.data} xKey={finalProps.xKey} yKey={finalProps.yKey} title={finalProps.title} delay={delay} summary={finalProps.summary} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
    
    case 'funnel':
    case 'funnel-chart':
      if (!restProps.data || !Array.isArray(restProps.data) || restProps.data.length === 0) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">漏斗图数据为空</p>
          </div>
        );
      }
      return <FunnelChartComponent data={restProps.data} title={restProps.title} delay={delay} summary={restProps.summary} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
    
    case 'box-plot':
      if (!restProps.data) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">箱线图数据为空</p>
          </div>
        );
      }
      // 箱线图需要单个对象，不是数组
      const boxPlotData = Array.isArray(restProps.data) ? restProps.data[0] : restProps.data;
      if (!boxPlotData || typeof boxPlotData !== 'object' || !('min' in boxPlotData) || !('q1' in boxPlotData) || !('median' in boxPlotData) || !('q3' in boxPlotData) || !('max' in boxPlotData)) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">箱线图数据格式错误：需要包含 min, q1, median, q3, max 的对象</p>
          </div>
        );
      }
      return <BoxPlotComponent data={boxPlotData as { min: number; q1: number; median: number; q3: number; max: number; outliers?: number[] }} title={restProps.title} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
    
    case 'map':
    case 'map-chart':
      if (!restProps.data || !Array.isArray(restProps.data) || restProps.data.length === 0) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">地图数据为空</p>
          </div>
        );
      }
      return <MapChartComponent data={restProps.data} title={restProps.title} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
    
    case 'quadrant':
    case 'quadrant-chart':
      if (!restProps.xKey || !restProps.yKey) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">四象限图配置错误：缺少 xKey 或 yKey</p>
          </div>
        );
      }
      return <QuadrantChartComponent data={restProps.data} xKey={restProps.xKey} yKey={restProps.yKey} title={restProps.title} quadrants={restProps.quadrants} delay={delay} />;
    
    case 'year-comparison':
      if (!restProps.currentYear || !restProps.lastYear) {
        return (
          <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
            <p className="text-[13px] text-[#FF3B30]">年度对比图配置错误：缺少 currentYear 或 lastYear</p>
          </div>
        );
      }
      return <YearComparisonChart data={restProps.data} currentYear={restProps.currentYear} lastYear={restProps.lastYear} title={restProps.title} delay={delay} onAttributionClick={(restProps as any).onAttributionClick} />;
    
    case 'area':
    case 'area-chart':
      // area 图表类似于折线图，但使用 AreaChart
      // 如果缺少 xKey 或 yKeys，尝试自动推断
      let areaXKey = finalProps.xKey;
      let areaYKeys = finalProps.yKeys;
      let areaData = finalProps.data;
      
      if (!areaXKey || !areaYKeys || !Array.isArray(areaYKeys) || areaYKeys.length === 0) {
        const firstItem = finalProps.data?.[0];
        if (firstItem) {
          // 自动推断 xKey
          if (!areaXKey) {
            const xKeyCandidates = ['date', 'month', 'time', 'name', 'region', 'category', 'x', 'label', 'key'];
            for (const key of xKeyCandidates) {
              if (firstItem[key] !== undefined) {
                areaXKey = key;
                break;
              }
            }
            // 如果还是没找到，使用第一个非数值字段
            if (!areaXKey) {
              const keys = Object.keys(firstItem);
              for (const key of keys) {
                if (typeof firstItem[key] !== 'number' && key !== 'value' && key !== 'y') {
                  areaXKey = key;
                  break;
                }
              }
            }
          }
          
          // 自动推断 yKeys
          if (!areaYKeys || !Array.isArray(areaYKeys) || areaYKeys.length === 0) {
            const yKeyCandidates = ['value', 'sales', 'amount', 'count', 'y', 'data'];
            const foundYKeys: { key: string; name: string; color?: string }[] = [];
            
            for (const key of yKeyCandidates) {
              if (firstItem[key] !== undefined && typeof firstItem[key] === 'number') {
                foundYKeys.push({ 
                  key, 
                  name: key === 'value' ? '数值' : key === 'sales' ? '销售额' : key === 'amount' ? '金额' : key,
                  color: COLORS.palette[foundYKeys.length % COLORS.palette.length]
                });
              }
            }
            // 如果没找到，查找所有数值字段（排除 xKey）
            if (foundYKeys.length === 0) {
              const keys = Object.keys(firstItem);
              for (const key of keys) {
                if (key !== areaXKey && typeof firstItem[key] === 'number') {
                  foundYKeys.push({ 
                    key, 
                    name: key,
                    color: COLORS.palette[foundYKeys.length % COLORS.palette.length]
                  });
                  break; // 只取第一个数值字段
                }
              }
            }
            
            if (foundYKeys.length > 0) {
              areaYKeys = foundYKeys;
            }
          }
        }
        
        // 如果推断后仍然缺少必要参数，显示错误
        if (!areaXKey || !areaYKeys || !Array.isArray(areaYKeys) || areaYKeys.length === 0) {
          return (
            <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
              <p className="text-[13px] text-[#FF3B30]">面积图配置错误：无法自动推断 xKey 或 yKeys</p>
              <p className="text-[11px] text-[#86868b] mt-1">数据字段: {restProps.data?.[0] ? Object.keys(restProps.data[0]).join(', ') : '无'}</p>
              <p className="text-[11px] text-[#86868b] mt-1">提示：请确保数据包含 name/value 或 date/value 等字段</p>
            </div>
          );
        }
      }
      
      // 兼容数据字段为 name + values 的情况：
      // 如果 values 是数字，直接作为 yKey；如果 values 是数字数组，拆分为多个系列
      if (Array.isArray(areaData) && areaData.length > 0) {
        const firstItem = areaData[0] as any;
        
        // values 为数字数组，拆分成多个字段 series_1, series_2...
        if (Array.isArray(firstItem?.values) && firstItem.values.every((v: any) => typeof v === 'number')) {
          const seriesKeys = firstItem.values.map((_: any, idx: number) => `series_${idx + 1}`);
          areaData = areaData.map((item: any) => {
            const cloned = { ...item };
            seriesKeys.forEach((key: string, idx: number) => {
              cloned[key] = item.values?.[idx];
            });
            return cloned;
          });
          
          if (!areaYKeys || areaYKeys.length === 0) {
            areaYKeys = seriesKeys.map((key: string, idx: number) => ({
              key,
              name: `系列${idx + 1}`,
              color: COLORS.palette[idx % COLORS.palette.length],
            }));
          }
        }
        
        // values 为单个数字
        if (typeof firstItem?.values === 'number') {
          if (!areaYKeys || areaYKeys.length === 0) {
            areaYKeys = [{
              key: 'values',
              name: '数值',
              color: COLORS.palette[0],
            }];
          }
          // 确保数据可被 AreaChart 读取
          areaData = areaData.map((item: any) => ({
            ...item,
            values: item.values,
          }));
        }
      }
      
      return <LineChartComponent {...finalProps} data={areaData} xKey={areaXKey} yKeys={areaYKeys} showArea={true} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
    
    default:
      // 通用图表渲染器：尝试自动适配未知类型
      return <UniversalChartRenderer chartData={finalProps} chartType={type} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard} />;
  }
};

// 通用图表渲染器 - 自动适配任何图表类型
const UniversalChartRenderer = ({ chartData, chartType, delay = 0, blockData, onAddToDashboard }: { chartData: any; chartType: string; delay?: number; blockData?: ContentBlock; onAddToDashboard?: (block: ContentBlock) => void }) => {
  const { data, xKey, yKey, yKeys, title } = chartData;

  // 如果没有数据，显示错误
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
        <p className="text-[13px] text-[#FF3B30]">图表数据为空</p>
        <p className="text-[11px] text-[#86868b] mt-1">图表类型: {chartType}</p>
      </div>
    );
  }

  const firstItem = data[0];
  if (!firstItem) {
    return (
      <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
        <p className="text-[13px] text-[#FF3B30]">图表数据格式错误</p>
      </div>
    );
  }

  // 自动推断参数
  let inferredXKey = xKey;
  let inferredYKey = yKey;
  let inferredYKeys = yKeys;

  // 推断 xKey
  if (!inferredXKey) {
    const xKeyCandidates = ['date', 'month', 'time', 'name', 'region', 'category', 'x', 'label', 'key', 'xAxis'];
    for (const key of xKeyCandidates) {
      if (firstItem[key] !== undefined) {
        inferredXKey = key;
        break;
      }
    }
    if (!inferredXKey) {
      const keys = Object.keys(firstItem);
      for (const key of keys) {
        if (typeof firstItem[key] !== 'number' && key !== 'value' && key !== 'y' && key !== 'yAxis') {
          inferredXKey = key;
          break;
        }
      }
    }
  }

  // 推断 yKey/yKeys
  const numericKeys: string[] = [];
  Object.keys(firstItem).forEach(key => {
    if (key !== inferredXKey && typeof firstItem[key] === 'number') {
      numericKeys.push(key);
    }
  });

  if (numericKeys.length === 0) {
    return (
      <div className="my-4 p-4 bg-[#FFF5F5] border border-[#FFE5E5] rounded-xl">
        <p className="text-[13px] text-[#FF3B30]">无法找到数值字段</p>
        <p className="text-[11px] text-[#86868b] mt-1">数据字段: {Object.keys(firstItem).join(', ')}</p>
      </div>
    );
  }

  // 根据图表类型和数据结构选择合适的渲染方式
  // 如果只有一个数值字段，使用柱状图
  if (numericKeys.length === 1 && !inferredYKeys) {
    inferredYKey = numericKeys[0];
    return (
      <BarChartComponent
        data={data}
        xKey={inferredXKey || 'name'}
        yKey={inferredYKey}
        title={title || chartType}
        delay={delay}
        blockData={blockData}
        onAddToDashboard={onAddToDashboard}
      />
    );
  }

  // 如果有多个数值字段，使用折线图
  if (!inferredYKeys && numericKeys.length > 0) {
    inferredYKeys = numericKeys.map((key, index) => ({
      key,
      name: key === 'value' ? '数值' : key === 'sales' ? '销售额' : key === 'amount' ? '金额' : key,
      color: COLORS.palette[index % COLORS.palette.length]
    }));
  }

  if (inferredYKeys && Array.isArray(inferredYKeys) && inferredYKeys.length > 0) {
    // 判断是否应该使用面积图（基于图表类型名称）
    const useArea = chartType.toLowerCase().includes('area') || chartType.toLowerCase().includes('filled');
    
    return (
      <LineChartComponent
        data={data}
        xKey={inferredXKey || 'name'}
        yKeys={inferredYKeys}
        title={title || chartType}
        showArea={useArea}
        delay={delay}
        blockData={blockData}
        onAddToDashboard={onAddToDashboard}
      />
    );
  }

  // 如果数据看起来像饼图（有 name 和 value）
  if (firstItem.name && firstItem.value !== undefined) {
    return (
      <PieChartComponent
        data={data.map((item: any) => ({ name: item.name, value: item.value }))}
        title={title || chartType}
        delay={delay}
        blockData={blockData}
        onAddToDashboard={onAddToDashboard}
      />
    );
  }

  // 最后的备选方案：显示数据表格
  return (
    <ChartContainer title={title || chartType} delay={delay} blockData={blockData} onAddToDashboard={onAddToDashboard}>
      <div className="py-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#F5F6F7]">
                {Object.keys(firstItem).map((key) => (
                  <th key={key} className="px-4 py-2 text-left border border-[#DEE0E3] text-[#646A73] font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                  {Object.keys(firstItem).map((key) => (
                    <td key={key} className="px-4 py-2 border border-[#DEE0E3] text-[#1F2329]">
                      {typeof item[key] === 'number' ? item[key].toLocaleString() : String(item[key] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <div className="mt-2 text-[12px] text-[#646A73] text-center">
              显示前 10 条，共 {data.length} 条数据
            </div>
          )}
        </div>
      </div>
    </ChartContainer>
  );
};

export default { ChartContainer, LineChartComponent, BarChartComponent, PieChartComponent, YearComparisonChart, ScatterChartComponent, FunnelChartComponent, BoxPlotComponent, MapChartComponent, QuadrantChartComponent, SmartChart };
