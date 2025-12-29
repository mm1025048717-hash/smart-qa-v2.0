/**
 * 归因分析面板 - 轻量级侧边弹出组件
 * 使用"进入式"导航，点击进入详情，返回按钮回退
 */

import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertCircle, Loader2, ChevronRight, ChevronLeft, BarChart3, MapPin, ShoppingBag, Maximize2, Minimize2 } from 'lucide-react';
import React, { useState } from 'react';
import clsx from 'clsx';
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
} from 'recharts';

export interface AttributionData {
  metric: string;
  changeValue: number;
  changeDirection: 'up' | 'down';
  changeType: '同比' | '环比';
  factors: Array<{
    dimension: string;
    contribution: number;
    ratio: number;
    description?: string;
    drillDownable?: boolean;
    icon?: 'region' | 'channel' | 'product' | 'other';
  }>;
  topFactors: string[];
  summary?: string;
  timeRangeLabel?: string;
}

interface AttributionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: AttributionData | null;
  isLoading?: boolean;
  position?: { top: number; left: number }; // 这里其实可以改为 right/top 浮动位置
  onDrillDown?: (dimension: string, factor: AttributionData['factors'][0]) => void;
  onActionSelect?: (query: string) => void;
}

// 导航层级数据
interface DrillLevel {
  dimension: string;
  icon?: 'region' | 'channel' | 'product' | 'other';
  depth: number;
  factors: AttributionData['factors'];
  kpi?: {
    label: string;
    value: number;
    unit: string;
    trend: { value: number; direction: 'up' | 'down'; label: string };
  };
  chart?: {
    type: 'line' | 'bar' | 'pie';
    title: string;
    data: any[];
  };
  description?: string;
}

// 样式获取函数
const getPanelStyle = (data: AttributionData | null) => {
  if (!data) return {
    iconBg: 'bg-[#34C759]',
    iconColor: 'text-white',
    positiveColor: 'text-[#34C759]',
    positiveBg: 'bg-[#34C759]',
    negativeColor: 'text-[#FF3B30]',
    negativeBg: 'bg-[#FF3B30]',
  };
  
  const isGrowth = data.changeDirection === 'up';
  const isYoY = data.changeType === '同比';
  
  const baseStyle = {
    iconColor: 'text-white',
    negativeColor: 'text-[#FF3B30]',
    negativeBg: 'bg-[#FF3B30]',
  };
  
  if (isGrowth && isYoY) {
    return { ...baseStyle, iconBg: 'bg-[#34C759]', positiveColor: 'text-[#34C759]', positiveBg: 'bg-[#34C759]' };
  } else if (isGrowth && !isYoY) {
    return { ...baseStyle, iconBg: 'bg-[#007AFF]', positiveColor: 'text-[#007AFF]', positiveBg: 'bg-[#007AFF]' };
  } else if (!isGrowth && isYoY) {
    return { ...baseStyle, iconBg: 'bg-[#FF9500]', positiveColor: 'text-[#FF9500]', positiveBg: 'bg-[#FF9500]' };
  } else {
    return { ...baseStyle, iconBg: 'bg-[#FF3B30]', positiveColor: 'text-[#FF3B30]', positiveBg: 'bg-[#FF3B30]' };
  }
};

// 获取维度图标
const getDimensionIcon = (iconType?: string) => {
  switch (iconType) {
    case 'region': return <MapPin className="w-3.5 h-3.5 text-white" />;
    case 'channel': return <BarChart3 className="w-3.5 h-3.5 text-white" />;
    case 'product': return <ShoppingBag className="w-3.5 h-3.5 text-white" />;
    default: return <AlertCircle className="w-3.5 h-3.5 text-white" />;
  }
};

// 生成图表数据
const generateChartData = (iconType: string | undefined, depth: number): { type: 'line' | 'bar' | 'pie'; data: any[] } => {
  if (iconType === 'region') {
    return depth === 1 
      ? { type: 'bar', data: [{ name: '上海', value: 180 }, { name: '杭州', value: 120 }, { name: '南京', value: 100 }, { name: '苏州', value: 80 }] }
      : { type: 'pie', data: [{ name: '核心商圈', value: 45 }, { name: '社区店', value: 30 }, { name: '交通枢纽', value: 15 }, { name: '其他', value: 10 }] };
  } else if (iconType === 'channel') {
    return { type: 'pie', data: [{ name: '天猫', value: 35 }, { name: '京东', value: 28 }, { name: '抖音', value: 22 }, { name: '小程序', value: 15 }] };
  } else if (iconType === 'product') {
    return depth === 1
      ? { type: 'line', data: [{ date: '1月', value: 300 }, { date: '2月', value: 320 }, { date: '3月', value: 350 }, { date: '4月', value: 380 }, { date: '5月', value: 420 }, { date: '6月', value: 450 }] }
      : { type: 'bar', data: [{ name: 'SKU-001', value: 120 }, { name: 'SKU-002', value: 100 }, { name: 'SKU-003', value: 80 }] };
  }
  return { type: 'line', data: [{ date: '1月', value: 300 }, { date: '2月', value: 350 }, { date: '3月', value: 400 }, { date: '4月', value: 450 }] };
};

// 生成子因子
const generateSubFactors = (iconType: string | undefined, depth: number): AttributionData['factors'] | undefined => {
  if (depth >= 3) return undefined;
  
  if (iconType === 'region' && depth === 1) {
    return [
      { dimension: '上海', contribution: 60000, ratio: 0.50, description: '上海门店表现突出', drillDownable: true, icon: 'region' },
      { dimension: '杭州', contribution: 30000, ratio: 0.25, description: '杭州新店开业', drillDownable: true, icon: 'region' },
      { dimension: '南京', contribution: 20000, ratio: 0.17, description: '南京稳定增长', drillDownable: false, icon: 'region' },
      { dimension: '其他', contribution: 10000, ratio: 0.08, drillDownable: false, icon: 'other' },
    ];
  } else if (iconType === 'channel' && depth === 1) {
    return [
      { dimension: '天猫旗舰店', contribution: 35000, ratio: 0.44, description: '天猫促销活动', drillDownable: true, icon: 'channel' },
      { dimension: '京东自营', contribution: 25000, ratio: 0.31, description: '京东流量增长', drillDownable: false, icon: 'channel' },
      { dimension: '抖音直播', contribution: 15000, ratio: 0.19, drillDownable: false, icon: 'channel' },
      { dimension: '其他', contribution: 5000, ratio: 0.06, drillDownable: false, icon: 'other' },
    ];
  } else if (iconType === 'product' && depth === 1) {
    return [
      { dimension: 'SKU-A001', contribution: 20000, ratio: 0.50, description: '主推SKU', drillDownable: false, icon: 'product' },
      { dimension: 'SKU-A002', contribution: 12000, ratio: 0.30, drillDownable: false, icon: 'product' },
      { dimension: 'SKU-A003', contribution: 6000, ratio: 0.15, drillDownable: false, icon: 'product' },
      { dimension: '其他', contribution: 2000, ratio: 0.05, drillDownable: false, icon: 'other' },
    ];
  } else if (iconType === 'region' && depth === 2) {
    return [
      { dimension: '浦东新区', contribution: 25000, ratio: 0.42, drillDownable: false, icon: 'region' },
      { dimension: '静安区', contribution: 18000, ratio: 0.30, drillDownable: false, icon: 'region' },
      { dimension: '徐汇区', contribution: 12000, ratio: 0.20, drillDownable: false, icon: 'region' },
      { dimension: '其他', contribution: 5000, ratio: 0.08, drillDownable: false, icon: 'other' },
    ];
  }
  return undefined;
};

export const AttributionPanel = ({
  isOpen,
  onClose,
  data,
  isLoading = false,
  position,
}: AttributionPanelProps) => {
  // 导航栈：存储下钻路径
  const [navStack, setNavStack] = useState<DrillLevel[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // 缩放状态
  
  // 拖拽控制
  const dragControls = useDragControls();
  
  if (!isOpen) return null;
  
  const styles = getPanelStyle(data);
  
  // 当前显示的层级（栈顶或根层级）
  const currentLevel = navStack.length > 0 ? navStack[navStack.length - 1] : null;
  
  // 进入下一层级
  const handleDrillInto = (factor: AttributionData['factors'][0]) => {
    if (factor.drillDownable === false) return;
    
    setIsNavigating(true);
    
    setTimeout(() => {
      const depth = (currentLevel?.depth || 0) + 1;
      const chartData = generateChartData(factor.icon, depth);
      const subFactors = generateSubFactors(factor.icon, depth);
      
      const newLevel: DrillLevel = {
        dimension: factor.dimension,
        icon: factor.icon,
        depth,
        factors: subFactors || [],
        kpi: {
          label: `${factor.dimension}销售额`,
          value: Math.abs(factor.contribution) + 200000,
          unit: '万元',
          trend: {
            value: factor.ratio * 100,
            direction: factor.contribution > 0 ? 'up' : 'down',
            label: data?.changeType || '同比',
          },
        },
        chart: {
          type: chartData.type,
          title: `${factor.dimension}${chartData.type === 'pie' ? '分布' : chartData.type === 'bar' ? '对比' : '趋势'}`,
          data: chartData.data,
        },
        description: `${factor.dimension}贡献度${(factor.ratio * 100).toFixed(1)}%，贡献值${factor.contribution > 0 ? '+' : ''}${factor.contribution.toLocaleString()}`,
      };
      
      setNavStack([...navStack, newLevel]);
      setIsNavigating(false);
    }, 300);
  };
  
  // 返回上一层级
  const handleGoBack = () => {
    if (navStack.length > 0) {
      setNavStack(navStack.slice(0, -1));
    }
  };
  
  // 面包屑路径
  const breadcrumbs = [
    data?.metric || '归因分析',
    ...navStack.map(level => level.dimension)
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 - 只在展开模式下显示 */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/10 z-40"
            />
          )}
          
          {/* 面板 */}
          <motion.div
            drag
            dragListener={false} // 仅通过 dragControls 触发
            dragControls={dragControls}
            dragMomentum={false} // 禁用惯性，避免滑出屏幕
            dragElastic={0} // 禁用弹性
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              width: isExpanded ? 600 : 320,
              height: isExpanded ? '85vh' : 'auto',
              maxHeight: isExpanded ? '85vh' : '600px'
            }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className={clsx(
              'fixed z-50 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
              'flex flex-col overflow-hidden',
              'border border-[#d2d2d7]/50',
              // 默认定位在右侧，但比之前更靠上且更小
              position ? '' : 'right-4 top-24'
            )}
            style={position ? { top: `${position.top}px`, left: `${position.left}px` } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 - 可拖拽区域 */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-between px-3 py-2.5 border-b border-[#d2d2d7]/30 bg-[#fbfbfd] cursor-move select-none active:cursor-grabbing"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* 返回按钮 */}
                {navStack.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 防止触发拖拽
                      handleGoBack();
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // 防止触发拖拽
                    className="w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors flex-shrink-0 -ml-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-[#007AFF]" />
                  </button>
                )}
                
                <div className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                  styles.iconBg
                )}>
                  {currentLevel ? getDimensionIcon(currentLevel.icon) : (
                    data?.changeDirection === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-white" />
                    )
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-semibold text-[#1d1d1f] truncate">
                    {currentLevel ? currentLevel.dimension : '归因分析'}
                  </h3>
                  {/* 面包屑或概要 */}
                  <p className="text-[10px] text-[#86868b] truncate">
                    {navStack.length > 0 
                      ? breadcrumbs.slice(0, -1).join(' › ')
                      : (data && `${data.timeRangeLabel} ${data.changeType}${data.changeDirection === 'up' ? '增长' : '下降'}${data.changeValue.toFixed(1)}%`)
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* 缩放按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-[#86868b] hover:text-[#1d1d1f] cursor-pointer"
                  title={isExpanded ? "缩小" : "放大"}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                
                {/* 关闭按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-[#86868b] hover:text-[#1d1d1f] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto bg-white">
              <AnimatePresence mode="wait">
                {isLoading || isNavigating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <Loader2 className="w-5 h-5 text-[#007AFF] animate-spin mb-2" />
                    <p className="text-[11px] text-[#86868b]">分析中...</p>
                  </motion.div>
                ) : currentLevel ? (
                  /* 下钻详情视图 */
                  <motion.div
                    key={`level-${navStack.length}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 space-y-3"
                  >
                    {/* 描述 */}
                    {currentLevel.description && (
                      <p className="text-[12px] text-[#1d1d1f] leading-relaxed">
                        {currentLevel.description}
                      </p>
                    )}
                    
                    {/* KPI卡片 - 仅在放大模式显示大号字体 */}
                    {currentLevel.kpi && (
                      <div className="p-2.5 bg-[#F5F5F7] rounded-lg">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-[#86868b]">{currentLevel.kpi.label}</span>
                          <span className={clsx(
                            'text-[11px] font-semibold',
                            currentLevel.kpi.trend.direction === 'up' ? styles.positiveColor : styles.negativeColor
                          )}>
                            {currentLevel.kpi.trend.direction === 'up' ? '↑' : '↓'}
                            {currentLevel.kpi.trend.value.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={clsx(
                            "font-bold text-[#1d1d1f]",
                            isExpanded ? "text-[20px]" : "text-[16px]"
                          )}>
                            {currentLevel.kpi.value.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#86868b]">{currentLevel.kpi.unit}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 图表 - 自适应高度 */}
                    {currentLevel.chart && (
                      <div className="bg-[#F5F5F7] rounded-lg p-2.5">
                        <h5 className="text-[10px] font-medium text-[#86868b] mb-2">{currentLevel.chart.title}</h5>
                        <div className={isExpanded ? "h-48 w-full" : "h-28 w-full"}>
                          <ResponsiveContainer width="100%" height="100%">
                            {currentLevel.chart.type === 'line' ? (
                              <RechartsLineChart data={currentLevel.chart.data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#86868b' }} stroke="#d2d2d7" />
                                <YAxis tick={{ fontSize: 9, fill: '#86868b' }} stroke="#d2d2d7" />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #d2d2d7', borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }} />
                                <Line type="monotone" dataKey="value" stroke={data?.changeDirection === 'up' ? '#34C759' : '#FF3B30'} strokeWidth={2} dot={{ r: 2 }} />
                              </RechartsLineChart>
                            ) : currentLevel.chart.type === 'bar' ? (
                              <RechartsBarChart data={currentLevel.chart.data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#86868b' }} stroke="#d2d2d7" />
                                <YAxis tick={{ fontSize: 9, fill: '#86868b' }} stroke="#d2d2d7" />
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #d2d2d7', borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }} />
                                <Bar dataKey="value" fill={data?.changeDirection === 'up' ? '#34C759' : '#FF3B30'} radius={[3, 3, 0, 0]} />
                              </RechartsBarChart>
                            ) : (
                              <RechartsPieChart>
                                <Pie 
                                  data={currentLevel.chart.data} 
                                  cx="50%" 
                                  cy="50%" 
                                  innerRadius={isExpanded ? 40 : 25} 
                                  outerRadius={isExpanded ? 70 : 45} 
                                  dataKey="value" 
                                  paddingAngle={2}
                                >
                                  {currentLevel.chart.data.map((_: any, i: number) => (
                                    <Cell key={`cell-${i}`} fill={['#34C759', '#007AFF', '#FF9500', '#FF3B30', '#AF52DE'][i % 5]} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #d2d2d7', borderRadius: '8px', fontSize: '10px', padding: '4px 8px' }} />
                              </RechartsPieChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    
                    {/* 子因子列表 */}
                    {currentLevel.factors.length > 0 && (
                      <div>
                        <h5 className="text-[11px] font-medium text-[#86868b] mb-1.5 px-1">
                          细分维度 {currentLevel.factors.some(f => f.drillDownable) && '(可继续下钻)'}
                        </h5>
                        <div className="space-y-1">
                          {currentLevel.factors.map((factor, idx) => (
                            <FactorCard
                              key={idx}
                              factor={factor}
                              styles={styles}
                              onDrillInto={handleDrillInto}
                              compact={!isExpanded}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : data ? (
                  /* 根层级视图 */
                  <motion.div
                    key="root"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 space-y-3"
                  >
                    {/* 总结 */}
                    {data.summary && (
                      <div className="p-2.5 bg-[#F5F5F7] rounded-lg">
                        <p className="text-[12px] text-[#1d1d1f] leading-relaxed">{data.summary}</p>
                      </div>
                    )}
                    
                    {/* 影响因素 */}
                    <div>
                      <h5 className="text-[11px] font-medium text-[#86868b] mb-1.5 px-1">
                        影响因素 ({data.factors.length}个)
                      </h5>
                      <div className="space-y-1">
                        {data.factors.map((factor, idx) => (
                          <FactorCard
                            key={idx}
                            factor={factor}
                            styles={styles}
                            onDrillInto={handleDrillInto}
                            compact={!isExpanded}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* 关键因素 - 仅展开时显示详细描述 */}
                    {data.topFactors.length > 0 && isExpanded && (
                      <div>
                        <h5 className="text-[11px] font-medium text-[#86868b] mb-1.5 px-1">关键因素</h5>
                        <div className="space-y-1">
                          {data.topFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-[#F5F5F7] rounded-lg">
                              <div className="w-4 h-4 rounded-full bg-[#1d1d1f] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[9px] font-semibold text-white">{idx + 1}</span>
                              </div>
                              <p className="text-[11px] text-[#1d1d1f] flex-1 leading-relaxed">{factor}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-6 h-6 text-[#86868b] mb-2" />
                    <p className="text-[11px] text-[#86868b]">暂无归因数据</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// 因子卡片组件
interface FactorCardProps {
  factor: AttributionData['factors'][0];
  styles: ReturnType<typeof getPanelStyle>;
  onDrillInto: (factor: AttributionData['factors'][0]) => void;
  compact?: boolean;
}

const FactorCard: React.FC<FactorCardProps> = ({ factor, styles, onDrillInto, compact }) => {
  const [isHovered, setIsHovered] = useState(false);
  const canDrillDown = factor.drillDownable !== false;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => canDrillDown && onDrillInto(factor)}
      className={clsx(
        'p-2.5 rounded-xl border border-[#d2d2d7]/30 transition-all bg-white',
        canDrillDown && 'cursor-pointer hover:bg-[#F5F5F7] hover:border-[#007AFF]/30',
        !canDrillDown && 'cursor-default'
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', styles.iconBg)}>
            {getDimensionIcon(factor.icon)}
          </div>
          <span className="text-[12px] font-medium text-[#1d1d1f] truncate">{factor.dimension}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={clsx('text-[12px] font-semibold tabular-nums', factor.contribution > 0 ? styles.positiveColor : styles.negativeColor)}>
            {factor.contribution > 0 ? '+' : ''}{factor.contribution.toLocaleString()}
          </span>
          {canDrillDown && (
            <ChevronRight className={clsx('w-3.5 h-3.5 transition-all', isHovered ? 'text-[#007AFF] translate-x-0.5' : 'text-[#86868b]')} />
          )}
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-[#E5E5EA] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.abs(factor.ratio) * 100}%` }}
            transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
            className={clsx('h-full rounded-full', factor.contribution > 0 ? styles.positiveBg : styles.negativeBg)}
          />
        </div>
        <span className="text-[10px] text-[#86868b] tabular-nums min-w-[32px] text-right">
          {(Math.abs(factor.ratio) * 100).toFixed(1)}%
        </span>
      </div>
      
      {/* 描述 - 仅在非紧凑模式显示 */}
      {!compact && factor.description && (
        <p className="mt-1.5 text-[10px] text-[#86868b] leading-relaxed">{factor.description}</p>
      )}
    </motion.div>
  );
};

// 生成模拟归因数据
export function generateMockAttributionData(
  metric: string,
  changeValue: number,
  changeDirection: 'up' | 'down',
  changeType: '同比' | '环比',
  timeRangeLabel?: string
): AttributionData {
  return {
    metric,
    changeValue,
    changeDirection,
    changeType,
    timeRangeLabel,
    factors: [
      { dimension: '华东区', contribution: changeDirection === 'up' ? 120000 : -80000, ratio: 0.45, description: '华东区门店扩张，销售额显著提升', drillDownable: true, icon: 'region' },
      { dimension: '线上渠道', contribution: changeDirection === 'up' ? 80000 : -50000, ratio: 0.30, description: '线上促销活动带动销售增长', drillDownable: true, icon: 'channel' },
      { dimension: '产品A', contribution: changeDirection === 'up' ? 40000 : -30000, ratio: 0.15, description: '产品A新品上市，市场反响良好', drillDownable: true, icon: 'product' },
      { dimension: '其他因素', contribution: changeDirection === 'up' ? 30000 : -20000, ratio: 0.10, description: '季节性因素及其他综合影响', drillDownable: false, icon: 'other' },
    ],
    topFactors: [
      changeDirection === 'up' ? '华东区门店扩张是主要增长驱动' : '华东区门店关闭导致销售额下降',
      changeDirection === 'up' ? '线上促销活动效果显著' : '线上渠道流量下滑',
    ],
    summary: changeDirection === 'up'
      ? `整体${changeType}增长${changeValue.toFixed(1)}%，主要得益于华东区门店扩张和线上渠道促销活动的双重推动。`
      : `整体${changeType}下降${changeValue.toFixed(1)}%，主要受华东区门店关闭和线上渠道流量下滑影响。`
  };
}
