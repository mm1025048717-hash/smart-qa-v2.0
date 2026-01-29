/**
 * KPI卡片展示页面
 * 展示各种场景下的KPI卡片呈现方式和设计变体
 * 提供完整的代码示例，可直接同步到产品中使用
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PrimaryKPICard, SecondaryKPICard, KPIGroup } from '../components/KPICard';
import { Copy, Check, Code, Eye, Download, MessageSquare } from 'lucide-react';
import { KPIData, ContentBlock } from '../types';

interface Scenario {
  id: string;
  name: string;
  description: string;
  category: '基础场景' | '数据展示' | '空状态' | '交互场景' | '组合场景' | '预警场景' | '优秀表现' | '特殊场景' | '行业场景' | '数据格式';
  kpiData: KPIData;
  code: string;
  useCase: string;
  exampleQuery?: string; // 示例问题，用于查看问答效果
}

const scenarios: Scenario[] = [
  // ========== 基础场景 ==========
  {
    id: 'basic',
    name: '基础KPI卡片',
    description: '最简单的KPI展示，只显示指标名称和数值',
    category: '基础场景',
    kpiData: {
      id: 'basic-sales',
      label: '销售额',
      value: 12500000,
      prefix: '¥',
      unit: '元',
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'sales',
    label: '销售额',
    value: 12500000,
    prefix: '¥',
    unit: '元',
  }}
/>`,
    useCase: '适用于简单的数值展示场景，如"本月销售额是多少"',
    exampleQuery: '本月销售额是多少',
  },
  {
    id: 'with-trend',
    name: '带趋势的KPI卡片',
    description: '显示数值的同时展示同比增长或环比增长趋势',
    category: '基础场景',
    kpiData: {
      id: 'sales-trend',
      label: '近3个月销售额',
      value: 25000000,
      prefix: '¥',
      unit: '万元',
      trend: {
        value: 15.2,
        direction: 'up',
        label: '环比增长',
        mom: 15.2, // 环比
        yoy: 19.8, // 同比
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'sales-trend',
    label: '近3个月销售额',
    value: 25000000,
    prefix: '¥',
    unit: '万元',
    trend: {
      value: 15.2,
      direction: 'up',
      mom: 15.2, // 环比增长
      yoy: 19.8, // 同比增长
    },
  }}
  onAttributionClick={(data) => {
    // 点击"归因"按钮时的回调
    console.log('归因分析:', data);
  }}
/>`,
    useCase: '适用于需要展示变化趋势的场景，如"近3个月销售额如何"',
    exampleQuery: '近3个月销售额如何',
  },
  {
    id: 'with-submetrics',
    name: '带子指标的KPI卡片',
    description: '主指标下方展示多个子指标，如季度分解',
    category: '基础场景',
    kpiData: {
      id: 'sales-submetrics',
      label: '2024年销售额',
      value: 38560000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 19.8,
        direction: 'up',
        label: '较2023年增长',
      },
      subMetrics: [
        { label: 'Q1', value: '850万' },
        { label: 'Q2', value: '920万' },
        { label: 'Q3', value: '980万' },
        { label: 'Q4', value: '1106万' },
      ],
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'sales-submetrics',
    label: '2024年销售额',
    value: 38560000,
    prefix: '¥',
    unit: '元',
    trend: {
      value: 19.8,
      direction: 'up',
      label: '较2023年增长',
    },
    subMetrics: [
      { label: 'Q1', value: '850万' },
      { label: 'Q2', value: '920万' },
      { label: 'Q3', value: '980万' },
      { label: 'Q4', value: '1106万' },
    ],
  }}
  showQuarterlyBreakdown={true}
  timeRange={{
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31'),
  }}
/>`,
    useCase: '适用于需要展示详细分解的场景，如"今年销售额是多少，各季度如何"',
    exampleQuery: '今年销售额是多少，各季度如何',
  },
  
  // ========== 数据展示场景 ==========
  {
    id: 'single-day',
    name: '单日数据场景',
    description: '查询单日数据时，不展示季度分解和同比',
    category: '数据展示',
    kpiData: {
      id: 'single-day-sales',
      label: '2024年12月1日销售额',
      value: 125000,
      prefix: '¥',
      unit: '元',
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'single-day-sales',
    label: '2024年12月1日销售额',
    value: 125000,
    prefix: '¥',
    unit: '元',
  }}
  timeRange={{
    start: new Date('2024-12-01'),
    end: new Date('2024-12-01'),
  }}
/>`,
    useCase: '适用于查询单日数据的场景，如"查询2024年12月1日的销售额"',
    exampleQuery: '查询2024年12月1日的销售额',
  },
  {
    id: 'short-range',
    name: '短期数据场景',
    description: '查询短期数据（少于7天）时，不展示季度分解',
    category: '数据展示',
    kpiData: {
      id: 'short-range-sales',
      label: '最近3天销售额',
      value: 385000,
      prefix: '¥',
      unit: '元',
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'short-range-sales',
    label: '最近3天销售额',
    value: 385000,
    prefix: '¥',
    unit: '元',
  }}
  timeRange={{
    start: new Date('2024-12-26'),
    end: new Date('2024-12-28'),
  }}
/>`,
    useCase: '适用于查询短期数据的场景，如"查询最近3天的销售额"',
    exampleQuery: '查询最近3天的销售额',
  },
  
  // ========== 空状态场景 ==========
  {
    id: 'no-data',
    name: '无数据场景',
    description: '查询结果为空时，显示友好的空状态提示',
    category: '空状态',
    kpiData: {
      id: 'no-data-sales',
      label: '2030年销售额',
      value: 0,
      prefix: '¥',
      unit: '元',
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'no-data-sales',
    label: '2030年销售额',
    value: 0,
    prefix: '¥',
    unit: '元',
  }}
  queryContext={{
    timeRange: {
      start: new Date('2030-01-01'),
      end: new Date('2030-12-31'),
    },
    error: {
      type: 'no-data',
      message: '暂无数据',
    },
  }}
  onActionClick={(action) => {
    if (action === 'modify-query') {
      // 修改查询条件
    }
  }}
/>`,
    useCase: '适用于查询未来日期或不存在的场景，如"查询2030年的销售额"',
    exampleQuery: '查询2030年的销售额',
  },
  {
    id: 'connection-error',
    name: '连接失败场景',
    description: '数据源连接失败时，显示错误提示和重试选项',
    category: '空状态',
    kpiData: {
      id: 'error-sales',
      label: '销售额',
      value: 0,
      prefix: '¥',
      unit: '元',
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'error-sales',
    label: '销售额',
    value: 0,
    prefix: '¥',
    unit: '元',
  }}
  queryContext={{
    error: {
      type: 'connection',
      message: '数据源连接失败',
    },
  }}
  onActionClick={(action) => {
    if (action === 'refresh') {
      // 重试连接
    } else if (action === 'check-connection') {
      // 检查连接
    }
  }}
/>`,
    useCase: '适用于数据源连接失败的场景，如"如果数据源连接失败了会显示什么？"',
    exampleQuery: '如果数据源连接失败了会显示什么',
  },
  {
    id: 'permission-denied',
    name: '权限不足场景',
    description: '用户没有权限查看数据时，显示权限提示',
    category: '空状态',
    kpiData: {
      id: 'permission-sales',
      label: '销售额',
      value: 0,
      prefix: '¥',
      unit: '元',
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'permission-sales',
    label: '销售额',
    value: 0,
    prefix: '¥',
    unit: '元',
  }}
  queryContext={{
    error: {
      type: 'permission',
      message: '暂无数据访问权限',
    },
  }}
  onActionClick={(action) => {
    if (action === 'contact-admin') {
      // 联系管理员
    }
  }}
/>`,
    useCase: '适用于权限不足的场景，如"如果没有权限查看数据会显示什么？"',
    exampleQuery: '如果没有权限查看数据会显示什么',
  },
  
  // ========== 交互场景 ==========
  {
    id: 'with-attribution',
    name: '带归因分析入口',
    description: '显示"归因"按钮，点击后可进行归因分析',
    category: '交互场景',
    kpiData: {
      id: 'attribution-sales',
      label: '12月份销售额',
      value: 8800000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: -5.2,
        direction: 'down',
        label: '环比下降',
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'attribution-sales',
    label: '12月份销售额',
    value: 8800000,
    prefix: '¥',
    unit: '元',
    trend: {
      value: -5.2,
      direction: 'down',
      label: '环比下降',
    },
  }}
  onAttributionClick={(data) => {
    // data 包含: metric, changeValue, changeDirection, changeType
    console.log('归因分析:', data);
    // 打开归因分析面板
  }}
/>`,
    useCase: '适用于需要归因分析的场景，如"12月份的销售额环比？"',
    exampleQuery: '12月份的销售额环比',
  },
  {
    id: 'with-add-button',
    name: '带添加到看板按钮',
    description: '显示"添加"按钮，可将KPI卡片添加到数据看板',
    category: '交互场景',
    kpiData: {
      id: 'addable-sales',
      label: '销售额',
      value: 12500000,
      prefix: '¥',
      unit: '元',
    },
    code: `import { PrimaryKPICard } from './components/KPICard';
import { ContentBlock } from './types';

const blockData: ContentBlock = {
  id: 'kpi-sales',
  type: 'kpi',
  data: {
    id: 'addable-sales',
    label: '销售额',
    value: 12500000,
    prefix: '¥',
    unit: '元',
  },
};

<PrimaryKPICard 
  data={blockData.data as KPIData}
  blockData={blockData}
  onAddToDashboard={(block) => {
    // 添加到看板
    console.log('添加到看板:', block);
  }}
/>`,
    useCase: '适用于需要添加到看板的场景，用户可以将KPI卡片固定到数据看板',
    exampleQuery: '本月销售额是多少',
  },
  
  // ========== 预警场景 ==========
  {
    id: 'warning-low',
    name: '预警场景 - 数值过低',
    description: '当数值低于预警阈值时，显示红色渐变背景和白色文字',
    category: '预警场景',
    kpiData: {
      id: 'warning-sales',
      label: '本月销售额',
      value: 5000000, // 低于预警阈值
      prefix: '¥',
      unit: '元',
      trend: {
        value: -15.2,
        direction: 'down',
        mom: -15.2,
        yoy: -8.5,
      },
      alertRule: {
        warningThreshold: 8000000, // 低于800万触发预警
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'warning-sales',
    label: '本月销售额',
    value: 5000000,
    prefix: '¥',
    unit: '元',
    trend: {
      value: -15.2,
      direction: 'down',
      mom: -15.2, // 环比下降
      yoy: -8.5,  // 同比下降
    },
    alertRule: {
      warningThreshold: 8000000, // 低于800万触发预警
    },
  }}
/>`,
    useCase: '适用于需要预警的场景，当数值低于设定阈值时自动显示预警样式',
    exampleQuery: '本月销售额是多少',
  },
  
  // ========== 优秀表现场景 ==========
  {
    id: 'excellent-high',
    name: '优秀表现 - 数值优秀',
    description: '当数值超过优秀阈值时，显示苹果风格的柔和绿色渐变背景，突出优秀表现',
    category: '优秀表现',
    kpiData: {
      id: 'excellent-sales',
      label: '本月销售额',
      value: 15000000, // 超过优秀阈值
      prefix: '¥',
      unit: '元',
      trend: {
        value: 25.8,
        direction: 'up',
        mom: 25.8,
        yoy: 32.5,
      },
      alertRule: {
        excellentThreshold: 12000000, // 超过1200万显示优秀样式
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'excellent-sales',
    label: '本月销售额',
    value: 15000000,
    prefix: '¥',
    unit: '元',
    trend: {
      value: 25.8,
      direction: 'up',
      mom: 25.8, // 环比大幅增长
      yoy: 32.5, // 同比大幅增长
    },
    alertRule: {
      excellentThreshold: 12000000, // 超过1200万显示优秀样式
    },
  }}
/>`,
    useCase: '适用于需要突出优秀表现的场景，当数值超过设定阈值时自动显示优秀样式',
    exampleQuery: '本月销售额是多少',
  },
  {
    id: 'with-yoy-mom',
    name: '环比同比展示',
    description: '同时展示环比和同比数据，放在数值下方',
    category: '基础场景',
    kpiData: {
      id: 'yoy-mom-sales',
      label: '近3个月销售额',
      value: 25000000,
      prefix: '¥',
      unit: '万元',
      trend: {
        value: 15.2,
        direction: 'up',
        mom: 15.2, // 环比增长
        yoy: 19.8, // 同比增长
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'yoy-mom-sales',
    label: '近3个月销售额',
    value: 25000000,
    prefix: '¥',
    unit: '万元',
    trend: {
      mom: 15.2, // 环比增长，会自动显示在数值下方
      yoy: 19.8, // 同比增长，会自动显示在数值下方
    },
  }}
/>`,
    useCase: '适用于需要同时展示环比和同比的场景，数据会自动显示在数值下方',
    exampleQuery: '近3个月销售额如何',
  },
  
  // ========== 特殊场景 ==========
  {
    id: 'with-target',
    name: '带目标值的KPI卡片',
    description: '显示当前值和目标值，展示完成进度',
    category: '特殊场景',
    kpiData: {
      id: 'target-sales',
      label: '本月销售额目标',
      value: 12000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 85,
        direction: 'up',
        label: '完成度',
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'target-sales',
    label: '本月销售额目标',
    value: 12000000,
    prefix: '¥',
    unit: '元',
    trend: {
      value: 85,
      direction: 'up',
      label: '完成度',
    },
    subMetrics: [
      { label: '目标', value: '1400万' },
      { label: '完成', value: '1200万' },
      { label: '进度', value: '85%' },
      { label: '剩余', value: '200万' },
    ],
  }}
/>`,
    useCase: '适用于需要展示目标完成情况的场景，如"本月销售额目标完成情况"',
    exampleQuery: '本月销售额目标完成情况',
  },
  {
    id: 'percentage-value',
    name: '百分比类型KPI卡片',
    description: '展示百分比类型的指标，如转化率、增长率等',
    category: '数据格式',
    kpiData: {
      id: 'conversion-rate',
      label: '转化率',
      value: 3.2,
      unit: '%',
      trend: {
        value: 0.5,
        direction: 'up',
        mom: 0.5,
        yoy: 1.2,
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'conversion-rate',
    label: '转化率',
    value: 3.2,
    unit: '%',
    trend: {
      value: 0.5,
      direction: 'up',
      mom: 0.5,  // 环比
      yoy: 1.2,  // 同比
    },
  }}
/>`,
    useCase: '适用于百分比类型的指标，如"转化率是多少"、"增长率如何"',
    exampleQuery: '转化率是多少',
  },
  {
    id: 'large-number',
    name: '大数值KPI卡片',
    description: '展示大数值，自动格式化（万、亿）',
    category: '数据格式',
    kpiData: {
      id: 'total-sales',
      label: '累计销售额',
      value: 3856000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 19.8,
        direction: 'up',
        mom: 2.5,
        yoy: 19.8,
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'total-sales',
    label: '累计销售额',
    value: 3856000000, // 会自动格式化为"38.56亿"
    prefix: '¥',
    unit: '元',
    trend: {
      mom: 2.5,
      yoy: 19.8,
    },
  }}
/>`,
    useCase: '适用于大数值展示，系统会自动格式化为"万"或"亿"单位',
    exampleQuery: '累计销售额是多少',
  },
  {
    id: 'negative-trend',
    name: '下降趋势KPI卡片',
    description: '展示下降趋势，使用红色箭头和文字',
    category: '基础场景',
    kpiData: {
      id: 'declining-sales',
      label: '11月销售额',
      value: 8200000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: -8.5,
        direction: 'down',
        mom: -8.5,
        yoy: -5.2,
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'declining-sales',
    label: '11月销售额',
    value: 8200000,
    prefix: '¥',
    unit: '元',
    trend: {
      value: -8.5,
      direction: 'down',
      mom: -8.5,  // 环比下降
      yoy: -5.2,  // 同比下降
    },
  }}
  onAttributionClick={(data) => {
    // 点击归因分析，查看下降原因
    console.log('归因分析:', data);
  }}
/>`,
    useCase: '适用于展示下降趋势的场景，如"11月销售额下降了"',
    exampleQuery: '11月销售额下降了',
  },
  {
    id: 'flat-trend',
    name: '持平趋势KPI卡片',
    description: '展示持平或小幅波动的趋势',
    category: '基础场景',
    kpiData: {
      id: 'stable-sales',
      label: '本月销售额',
      value: 10000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 0.2,
        direction: 'flat',
        mom: 0.2,
        yoy: 0.5,
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'stable-sales',
    label: '本月销售额',
    value: 10000000,
    prefix: '¥',
    unit: '元',
    trend: {
      value: 0.2,
      direction: 'flat',
      mom: 0.2,  // 环比基本持平
      yoy: 0.5,  // 同比基本持平
    },
  }}
/>`,
    useCase: '适用于展示持平或小幅波动的场景，如"本月销售额基本持平"',
    exampleQuery: '本月销售额基本持平',
  },
  
  // ========== 行业场景 ==========
  {
    id: 'ecommerce-gmv',
    name: '电商GMV场景',
    description: '电商行业常用的GMV（成交总额）指标',
    category: '行业场景',
    kpiData: {
      id: 'gmv',
      label: 'GMV成交总额',
      value: 125000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 28.5,
        direction: 'up',
        mom: 28.5,
        yoy: 35.2,
      },
      subMetrics: [
        { label: '订单数', value: '12.5万' },
        { label: '客单价', value: '¥100' },
        { label: '转化率', value: '3.2%' },
        { label: '复购率', value: '45%' },
      ],
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'gmv',
    label: 'GMV成交总额',
    value: 125000000,
    prefix: '¥',
    unit: '元',
    trend: {
      mom: 28.5,
      yoy: 35.2,
    },
    subMetrics: [
      { label: '订单数', value: '12.5万' },
      { label: '客单价', value: '¥100' },
      { label: '转化率', value: '3.2%' },
      { label: '复购率', value: '45%' },
    ],
  }}
  showQuarterlyBreakdown={true}
/>`,
    useCase: '适用于电商行业，展示GMV及相关核心指标',
    exampleQuery: 'GMV成交总额是多少',
  },
  {
    id: 'finance-revenue',
    name: '财务营收场景',
    description: '财务部门常用的营收和利润指标',
    category: '行业场景',
    kpiData: {
      id: 'revenue-profit',
      label: '营业收入',
      value: 50000000,
      prefix: '¥',
      unit: '元',
      trend: {
        value: 15.8,
        direction: 'up',
        mom: 15.8,
        yoy: 22.3,
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'revenue-profit',
    label: '营业收入',
    value: 50000000,
    prefix: '¥',
    unit: '元',
    trend: {
      mom: 15.8,
      yoy: 22.3,
    },
  }}
  onAttributionClick={(data) => {
    // 财务分析
    console.log('营收归因:', data);
  }}
/>`,
    useCase: '适用于财务部门，展示营业收入、利润等财务指标',
    exampleQuery: '营业收入是多少',
  },
  {
    id: 'marketing-roi',
    name: '营销ROI场景',
    description: '营销部门常用的ROI（投资回报率）指标',
    category: '行业场景',
    kpiData: {
      id: 'roi',
      label: '营销ROI',
      value: 3.5,
      unit: '倍',
      trend: {
        value: 0.8,
        direction: 'up',
        mom: 0.8,
        yoy: 1.2,
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'roi',
    label: '营销ROI',
    value: 3.5,
    unit: '倍',
    trend: {
      mom: 0.8,
      yoy: 1.2,
    },
  }}
/>`,
    useCase: '适用于营销部门，展示ROI、转化率等营销效果指标',
    exampleQuery: '营销ROI是多少',
  },
  {
    id: 'hr-attendance',
    name: 'HR考勤场景',
    description: '人力资源部门常用的考勤和绩效指标',
    category: '行业场景',
    kpiData: {
      id: 'attendance-rate',
      label: '出勤率',
      value: 96.5,
      unit: '%',
      trend: {
        value: 1.2,
        direction: 'up',
        mom: 1.2,
        yoy: 2.5,
      },
    },
    code: `import { PrimaryKPICard } from './components/KPICard';

<PrimaryKPICard 
  data={{
    id: 'attendance-rate',
    label: '出勤率',
    value: 96.5,
    unit: '%',
    trend: {
      mom: 1.2,
      yoy: 2.5,
    },
  }}
/>`,
    useCase: '适用于HR部门，展示出勤率、绩效等人员指标',
    exampleQuery: '出勤率是多少',
  },
  
  // ========== 组合场景 ==========
  {
    id: 'kpi-group',
    name: 'KPI卡片组',
    description: '多个KPI卡片并排展示，适用于多指标对比',
    category: '组合场景',
    kpiData: {
      id: 'group-sales',
      label: '销售额',
      value: 12500000,
      prefix: '¥',
      unit: '元',
    },
    code: `import { KPIGroup } from './components/KPICard';

<KPIGroup 
  items={[
    {
      id: 'sales',
      label: '销售额',
      value: 12500000,
      prefix: '¥',
      unit: '元',
      trend: { 
        value: 15.2, 
        direction: 'up', 
        mom: 15.2,  // 环比
        yoy: 19.8,  // 同比
      },
    },
    {
      id: 'orders',
      label: '订单量',
      value: 12500,
      unit: '单',
      trend: { 
        value: 8.5, 
        direction: 'up',
        mom: 8.5,   // 环比
        yoy: 12.3,  // 同比
      },
    },
    {
      id: 'profit',
      label: '利润',
      value: 2500000,
      prefix: '¥',
      unit: '元',
      trend: { 
        value: -2.1, 
        direction: 'down',
        mom: -2.1,  // 环比
        yoy: -5.3,  // 同比
      },
    },
    {
      id: 'conversion',
      label: '转化率',
      value: 3.2,
      unit: '%',
      trend: { 
        value: 0.5, 
        direction: 'up',
        mom: 0.5,   // 环比
        yoy: 1.2,   // 同比
      },
    },
  ]}
/>`,
    useCase: '适用于多指标查询的场景，如"帮我看看销售额和订单量"',
    exampleQuery: '帮我看看销售额和订单量',
  },
];

const categories = ['基础场景', '数据展示', '空状态', '交互场景', '组合场景', '预警场景', '优秀表现', '特殊场景', '行业场景', '数据格式'] as const;

export default function KPICardShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<Record<string, 'preview' | 'code'>>({});

  const filteredScenarios = selectedCategory === 'all' 
    ? scenarios 
    : scenarios.filter(s => s.category === selectedCategory);

  const handleCopyCode = (code: string, scenarioId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(scenarioId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportAll = () => {
    const allCode = scenarios.map(s => 
      `// ${s.name} - ${s.description}\n${s.code}\n`
    ).join('\n\n');
    
    const blob = new Blob([allCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kpi-card-scenarios.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">KPI卡片设计展示</h1>
              <p className="text-sm text-gray-600 mt-1">
                展示各种场景下的KPI卡片呈现方式和完整代码示例
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportAll}
                className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:bg-[#0051D5] transition-colors"
              >
                <Download className="w-4 h-4" />
                导出所有代码
              </button>
              <button
                onClick={() => {
                  window.history.pushState({}, '', '?page=main');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="px-4 py-2 text-gray-600 hover:text-[#007AFF] transition-colors"
              >
                返回 SmartQA
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* 分类筛选 */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedCategory('all');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#007AFF] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            全部场景 ({scenarios.length})
          </button>
          {categories.map(category => {
            const count = scenarios.filter(s => s.category === category).length;
            return (
              <button
                key={category}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedCategory(category);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#007AFF] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {/* 场景列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredScenarios.map(scenario => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative"
            >
              {/* 场景头部 */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-[#007AFF]/10 text-[#007AFF] rounded">
                        {scenario.category}
                      </span>
                      <h3 className="text-lg font-semibold text-[#111827]">
                        {scenario.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {scenario.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>适用场景：</strong>{scenario.useCase}
                    </p>
                  </div>
                </div>
              </div>

              {/* 预览/代码切换 */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setViewModes(prev => ({ ...prev, [scenario.id]: 'preview' }));
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                      (viewModes[scenario.id] || 'preview') === 'preview'
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    预览
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setViewModes(prev => ({ ...prev, [scenario.id]: 'code' }));
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                      (viewModes[scenario.id] || 'preview') === 'code'
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    代码
                  </button>
                  {scenario.exampleQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // 跳转到主界面并传递问题参数，使用场景ID确保匹配正确的响应
                        const query = encodeURIComponent(scenario.exampleQuery!);
                        // 使用场景ID作为questionId参数，确保匹配到正确的场景响应
                        const scenarioId = `showcase-${scenario.id}`;
                        window.location.href = `?page=main&query=${query}&scenario=${scenarioId}`;
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer bg-green-500 hover:bg-green-600 text-white"
                      title="查看问答效果"
                    >
                      <MessageSquare className="w-4 h-4" />
                      查看问答效果
                    </button>
                  )}
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-6 bg-gray-50">
                {(viewModes[scenario.id] || 'preview') === 'preview' ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    {scenario.id === 'kpi-group' ? (
                      <KPIGroup 
                        items={[
                          {
                            id: 'sales',
                            label: '销售额',
                            value: 12500000,
                            prefix: '¥',
                            unit: '元',
                            trend: { 
                              value: 15.2, 
                              direction: 'up', 
                              mom: 15.2,  // 环比
                              yoy: 19.8,  // 同比
                            },
                          },
                          {
                            id: 'orders',
                            label: '订单量',
                            value: 12500,
                            unit: '单',
                            trend: { 
                              value: 8.5, 
                              direction: 'up',
                              mom: 8.5,   // 环比
                              yoy: 12.3,  // 同比
                            },
                          },
                          {
                            id: 'profit',
                            label: '利润',
                            value: 2500000,
                            prefix: '¥',
                            unit: '元',
                            trend: { 
                              value: -2.1, 
                              direction: 'down',
                              mom: -2.1,  // 环比
                              yoy: -5.3,  // 同比
                            },
                          },
                          {
                            id: 'conversion',
                            label: '转化率',
                            value: 3.2,
                            unit: '%',
                            trend: { 
                              value: 0.5, 
                              direction: 'up',
                              mom: 0.5,   // 环比
                              yoy: 1.2,   // 同比
                            },
                          },
                        ]}
                      />
                    ) : (
                      <PrimaryKPICard 
                        data={scenario.kpiData}
                        queryContext={scenario.id.includes('error') || scenario.id.includes('permission') || scenario.id.includes('no-data')
                          ? {
                              error: scenario.id === 'connection-error' 
                                ? { type: 'connection', message: '数据源连接失败' }
                                : scenario.id === 'permission-denied'
                                ? { type: 'permission', message: '暂无数据访问权限' }
                                : { type: 'no-data', message: '暂无数据' },
                            }
                          : scenario.id === 'single-day'
                          ? {
                              timeRange: {
                                start: new Date('2024-12-01'),
                                end: new Date('2024-12-01'),
                              },
                            }
                          : scenario.id === 'short-range'
                          ? {
                              timeRange: {
                                start: new Date('2024-12-26'),
                                end: new Date('2024-12-28'),
                              },
                            }
                          : scenario.id === 'with-submetrics'
                          ? {
                              timeRange: {
                                start: new Date('2024-01-01'),
                                end: new Date('2024-12-31'),
                              },
                            }
                          : undefined
                        }
                        timeRange={scenario.id === 'single-day'
                          ? {
                              start: new Date('2024-12-01'),
                              end: new Date('2024-12-01'),
                            }
                          : scenario.id === 'short-range'
                          ? {
                              start: new Date('2024-12-26'),
                              end: new Date('2024-12-28'),
                            }
                          : scenario.id === 'with-submetrics'
                          ? {
                              start: new Date('2024-01-01'),
                              end: new Date('2024-12-31'),
                            }
                          : undefined
                        }
                        showQuarterlyBreakdown={scenario.id === 'with-submetrics'}
                        onAttributionClick={scenario.id === 'with-attribution' || scenario.id === 'with-trend' || scenario.id === 'with-yoy-mom' || scenario.id === 'warning-low' || scenario.id === 'excellent-high'
                          ? (data) => {
                              console.log('归因分析:', data);
                            }
                          : undefined
                        }
                        blockData={scenario.id === 'with-add-button'
                          ? {
                              id: `kpi-${scenario.id}`,
                              type: 'kpi',
                              data: scenario.kpiData,
                            } as ContentBlock
                          : undefined
                        }
                        onAddToDashboard={scenario.id === 'with-add-button'
                          ? (block) => {
                              console.log('添加到看板:', block);
                            }
                          : undefined
                        }
                        onActionClick={(action) => {
                          console.log('操作:', action);
                        }}
                        queryContext={scenario.id.includes('error') || scenario.id.includes('permission') || scenario.id.includes('no-data')
                          ? {
                              error: scenario.id === 'connection-error' 
                                ? { type: 'connection', message: '数据源连接失败' }
                                : scenario.id === 'permission-denied'
                                ? { type: 'permission', message: '暂无数据访问权限' }
                                : { type: 'no-data', message: '暂无数据' },
                            }
                          : undefined
                        }
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <pre className="bg-[#1e1e1e] text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{scenario.code}</code>
                    </pre>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopyCode(scenario.code, scenario.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer z-10"
                      title="复制代码"
                    >
                      {copiedCode === scenario.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#111827] mb-4">使用说明</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">1. 基础使用</h3>
              <p className="text-sm">
                所有KPI卡片组件都从 <code className="bg-gray-100 px-1 rounded">src/components/KPICard.tsx</code> 导入。
                根据不同的场景选择合适的组件和配置。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. 组件类型</h3>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li><strong>PrimaryKPICard</strong>：主KPI卡片，用于展示主要指标</li>
                <li><strong>SecondaryKPICard</strong>：次要KPI卡片，用于KPI组中</li>
                <li><strong>KPIGroup</strong>：KPI卡片组，用于多指标并排展示</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. 数据格式</h3>
              <p className="text-sm">
                KPI数据需要符合 <code className="bg-gray-100 px-1 rounded">KPIData</code> 类型定义，
                包含 <code className="bg-gray-100 px-1 rounded">id</code>、<code className="bg-gray-100 px-1 rounded">label</code>、<code className="bg-gray-100 px-1 rounded">value</code> 等字段。
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">4. 同步到产品</h3>
              <p className="text-sm">
                点击"代码"标签查看完整代码示例，点击复制按钮复制代码，
                或点击"导出所有代码"按钮导出所有场景的代码文件。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
