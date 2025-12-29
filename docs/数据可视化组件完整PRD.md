# 数据可视化组件系统 PRD

**版本**: v1.0  
**日期**: 2024年12月  
**作者**: 产品团队  
**状态**: 待评审

---

## 目录

1. [文档概述](#1-文档概述)
2. [产品定位](#2-产品定位)
3. [组件架构](#3-组件架构)
4. [组件详细规范](#4-组件详细规范)
5. [交互设计规范](#5-交互设计规范)
6. [技术规范](#6-技术规范)
7. [验收标准](#7-验收标准)
8. [附录](#8-附录)

---

## 1. 文档概述

### 1.1 文档目的

本文档旨在定义智能数据分析平台中所有数据可视化组件的功能需求、交互规范和技术实现标准，确保开发团队能够按照统一的设计语言和交互标准构建组件系统。

### 1.2 适用范围

- **目标用户**: 数据分析师、业务分析师、决策者
- **使用场景**: 数据查询、分析报告、实时监控、业务洞察
- **平台**: Web端（桌面优先，移动端适配）

### 1.3 设计原则

1. **一致性**: 统一的视觉语言和交互模式
2. **可访问性**: 符合WCAG 2.1 AA标准
3. **性能优先**: 支持大数据量渲染和实时更新
4. **可扩展性**: 组件可独立使用，支持组合和定制
5. **响应式**: 适配不同屏幕尺寸

---

## 2. 产品定位

### 2.1 产品愿景

构建一套完整、专业、易用的数据可视化组件系统，帮助用户快速理解数据、发现洞察、做出决策。

### 2.2 核心价值

- **快速理解**: 通过直观的图表和指标卡片快速理解数据
- **深度分析**: 支持下钻、筛选、对比等深度分析能力
- **智能推荐**: AI驱动的图表类型推荐和洞察生成
- **协作分享**: 支持报告生成、分享和协作

---

## 3. 组件架构

### 3.1 组件分类

```
数据可视化组件系统
├── 指标展示类
│   ├── PrimaryKPICard
│   ├── SecondaryKPICard
│   └── KPIGroup
├── 图表展示类
│   ├── ChartContainer
│   ├── LineChartComponent
│   ├── BarChartComponent
│   ├── PieChartComponent
│   ├── ScatterChartComponent
│   ├── FunnelChartComponent
│   ├── BoxPlotComponent
│   ├── MapChartComponent
│   ├── QuadrantChartComponent
│   └── SmartChart
├── 数据交互类
│   ├── DataVisualizer
│   ├── DrillDownPanel
│   └── DrillDownButton
├── 内容展示类
│   ├── NarrativeText
│   ├── MarkdownRenderer
│   ├── ThoughtChain
│   ├── ReportTitle
│   ├── SectionTitle
│   ├── QuoteParagraph
│   ├── StructuredListItem
│   ├── DataPreviewCard
│   ├── HighlightBlock
│   └── AnalystQuote
├── 交互操作类
│   ├── ActionButtonGroup
│   ├── QuickQuestions
│   ├── ChoiceSelector
│   ├── RatingSelector
│   ├── ConfirmBox
│   ├── ProgressSteps
│   └── SwitchAgentButton
├── 辅助组件类
│   ├── SuggestionList
│   ├── HighlightMetric
│   └── Divider
└── 页面级组件
    ├── ScenarioPanel
    └── WelcomePage
```

### 3.2 组件依赖关系

```
SmartChart (依赖所有图表组件)
  └── ChartContainer
      ├── LineChartComponent
      ├── BarChartComponent
      └── ...

DataVisualizer (独立)
  └── 可组合使用各种图表组件

ThoughtChain (独立)
  └── 可嵌入到任何内容区域

DrillDownPanel (独立)
  └── 可显示任何内容类型
```

---

## 4. 组件详细规范

### 4.1 指标展示类

#### 4.1.1 PrimaryKPICard - 主KPI卡片

**功能描述**: 展示最重要的单一指标，支持趋势、对比和明细信息。

**原型图**:
```
┌─────────────────────────────────────────┐
│  2024年度销售额                         │
│  ─────────────────────────────────────  │
│                                         │
│  ¥ 38,560,000                          │
│  元                                     │
│                                         │
│  ↗ +19.8%  同比增长                    │
│                                         │
│  Q1: 823万  Q2: 945万  Q3: 1028万     │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface PrimaryKPICardProps {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  prefix?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
    label?: string;
  };
  subMetrics?: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  isPrimary?: boolean;
  loading?: boolean;
  error?: string | null;
  onClick?: () => void;
}
```

**交互规范**:
- 点击卡片可触发下钻操作
- 趋势箭头颜色：上升(绿色)、下降(红色)、持平(灰色)
- 加载状态显示骨架屏
- 错误状态显示错误提示和重试按钮

**视觉规范**:
- 卡片尺寸: 最小宽度280px，高度自适应
- 字体: 标题14px/Medium，数值24px/Bold，单位12px/Regular
- 颜色: 背景白色，边框#E5E5EA，主数值#1d1d1f
- 圆角: 12px
- 阴影: 0 1px 3px rgba(0,0,0,0.1)

---

#### 4.1.2 SecondaryKPICard - 次级KPI卡片

**功能描述**: 展示次要指标，样式更简洁，用于并排展示多个指标。

**原型图**:
```
┌──────────────────┐  ┌──────────────────┐
│ 本月订单量       │  │ 当前库存         │
│                  │  │                  │
│  12,345         │  │  8,920           │
│  单              │  │  SKU             │
│                  │  │                  │
│  ↗ +5.2%        │  │  → 持平          │
└──────────────────┘  └──────────────────┘
```

**Props接口**:
```typescript
interface SecondaryKPICardProps {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
  };
  compact?: boolean; // 紧凑模式
}
```

**交互规范**:
- 支持点击下钻
- 紧凑模式隐藏子指标

---

#### 4.1.3 KPIGroup - KPI卡片组

**功能描述**: 将多个KPI卡片组合展示，支持横向、纵向和网格布局。

**原型图**:
```
┌─────────────────────────────────────────┐
│  [PrimaryKPICard]  [SecondaryKPICard]  │
│  [SecondaryKPICard] [SecondaryKPICard]  │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface KPIGroupProps {
  items: Array<PrimaryKPICardProps | SecondaryKPICardProps>;
  layout?: 'horizontal' | 'vertical' | 'grid';
  columns?: number; // 网格布局列数
  gap?: number; // 间距
}
```

**交互规范**:
- 响应式布局：桌面端横向，移动端纵向
- 网格布局自动计算列数（默认2-3列）

---

### 4.2 图表展示类

#### 4.2.1 ChartContainer - 图表容器

**功能描述**: 图表的外层容器，提供标题、操作按钮、筛选器等。

**原型图**:
```
┌─────────────────────────────────────────┐
│  近3个月销售额趋势          [筛选] [导出]│
│  ─────────────────────────────────────  │
│                                         │
│         [图表内容区域]                 │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  actions?: Array<{
    id: string;
    label: string;
    icon?: string;
    onClick: () => void;
  }>;
  filters?: FilterCondition[];
  onFilterChange?: (filters: FilterCondition[]) => void;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}
```

**交互规范**:
- 操作按钮支持下拉菜单
- 筛选器支持多条件组合
- 空状态显示占位图和提示文字
- 错误状态显示错误信息和重试按钮

---

#### 4.2.2 LineChartComponent - 折线图

**功能描述**: 展示时间序列数据的趋势变化。

**原型图**:
```
┌─────────────────────────────────────────┐
│  销售额(万元)                           │
│    │                                    │
│ 40 │     ●───●                          │
│    │   ●       ●                        │
│ 30 │ ●           ●───●                  │
│    │                                    │
│ 20 │                                    │
│    └────────────────────────────────────│
│     1月  2月  3月  4月  5月  6月        │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface LineChartProps {
  data: Array<{
    x: string | number;
    y: number;
    label?: string;
  }>;
  config?: {
    xKey?: string;
    yKey?: string;
    series?: Array<{
      name: string;
      dataKey: string;
      color?: string;
    }>;
    showLegend?: boolean;
    showTooltip?: boolean;
    height?: number;
  };
  onDrillDown?: (dataPoint: any) => void;
}
```

**交互规范**:
- 鼠标悬停显示数据点详情
- 点击数据点触发下钻
- 支持多系列对比
- 支持缩放和平移（大数据量时）

---

#### 4.2.3 BarChartComponent - 柱状图

**功能描述**: 展示分类数据的对比。

**原型图**:
```
┌─────────────────────────────────────────┐
│  销售额(万元)                           │
│    │                                    │
│ 40 │  ████                              │
│    │  ████                              │
│ 30 │  ████  ████                        │
│    │  ████  ████                        │
│ 20 │  ████  ████  ████                 │
│    │  ████  ████  ████                 │
│    └────────────────────────────────────│
│     华东  华南  华北  西南              │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface BarChartProps {
  data: Array<{
    category: string;
    value: number;
    [key: string]: any;
  }>;
  config?: {
    orientation?: 'vertical' | 'horizontal';
    stacked?: boolean;
    showLegend?: boolean;
    colors?: string[];
    height?: number;
  };
  onDrillDown?: (dataPoint: any) => void;
}
```

**交互规范**:
- 支持横向和纵向展示
- 支持堆叠和分组模式
- 点击柱子触发下钻

---

#### 4.2.4 PieChartComponent - 饼图

**功能描述**: 展示数据的占比关系。

**原型图**:
```
┌─────────────────────────────────────────┐
│                                         │
│        ┌─────┐                         │
│       ╱  35% ╲                          │
│      │  华东  │                         │
│       ╲     ╱                          │
│        └─────┘                         │
│                                         │
│  华东: 35%  ████████                   │
│  华南: 28%  ██████                     │
│  华北: 22%  █████                      │
│  西南: 15%  ███                        │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage?: number;
    color?: string;
  }>;
  config?: {
    showLegend?: boolean;
    showPercentage?: boolean;
    innerRadius?: number; // 环形图
    height?: number;
  };
  onDrillDown?: (segment: any) => void;
}
```

**交互规范**:
- 点击扇形触发下钻
- 鼠标悬停高亮扇形和显示详情
- 支持环形图（甜甜圈图）

---

#### 4.2.5 ScatterChartComponent - 散点图

**功能描述**: 展示两个变量之间的关系，用于相关性分析。

**原型图**:
```
┌─────────────────────────────────────────┐
│  销售额 vs 利润率                        │
│    │                                    │
│ 30 │        ●                           │
│    │     ●      ●                       │
│ 20 │  ●     ●        ●                  │
│    │     ●      ●                       │
│ 10 │  ●                                 │
│    └────────────────────────────────────│
│     0    20    40    60    80           │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ScatterChartProps {
  data: Array<{
    x: number;
    y: number;
    label?: string;
    size?: number;
    color?: string;
  }>;
  config?: {
    xLabel?: string;
    yLabel?: string;
    showTrendLine?: boolean;
    height?: number;
  };
  onDrillDown?: (point: any) => void;
}
```

---

#### 4.2.6 FunnelChartComponent - 漏斗图

**功能描述**: 展示转化流程，识别流失环节。

**原型图**:
```
┌─────────────────────────────────────────┐
│  用户转化漏斗                           │
│                                         │
│  ┌─────────────────────┐  10,000       │
│  │   访问用户          │               │
│  └─────────────────────┘               │
│         ↓                               │
│  ┌───────────────┐      5,000          │
│  │  注册用户     │                     │
│  └───────────────┘                     │
│         ↓                               │
│  ┌───────────┐          2,000           │
│  │ 付费用户  │                         │
│  └───────────┘                         │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface FunnelChartProps {
  data: Array<{
    stage: string;
    value: number;
    conversionRate?: number;
  }>;
  config?: {
    showConversionRate?: boolean;
    height?: number;
  };
  onDrillDown?: (stage: any) => void;
}
```

---

#### 4.2.7 BoxPlotComponent - 箱线图

**功能描述**: 展示数据分布和异常值。

**原型图**:
```
┌─────────────────────────────────────────┐
│  销售额分布                             │
│    │                                    │
│ 40 │     ┌─┐                           │
│    │  ───│ │───                        │
│ 30 │     │ │                           │
│    │  ───│ │───                        │
│ 20 │     └─┘                           │
│    │      ●                            │
│    └────────────────────────────────────│
│     华东  华南  华北  西南              │
└─────────────────────────────────────────┘
```

---

#### 4.2.8 MapChartComponent - 地图图表

**功能描述**: 在地图上展示地理数据分布。

**原型图**:
```
┌─────────────────────────────────────────┐
│  全国销售分布                           │
│                                         │
│    ┌─────────┐                         │
│    │  北京   │  ● 1200万               │
│    └─────────┘                         │
│         │                               │
│    ┌─────────┐                         │
│    │  上海   │  ● 1500万               │
│    └─────────┘                         │
│                                         │
│  图例: ● 销售额                         │
└─────────────────────────────────────────┘
```

---

#### 4.2.9 QuadrantChartComponent - 象限图

**功能描述**: 四象限分析，用于产品定位、用户分群等。

**原型图**:
```
┌─────────────────────────────────────────┐
│  产品定位分析                           │
│                                         │
│  高增长                                 │
│    │                                    │
│    │  ●明星产品                         │
│    │                                    │
│  ──┼────────────────                   │
│    │  ●瘦狗产品  ●金牛产品              │
│    │                                    │
│  低增长                                 │
│    低份额        高份额                 │
└─────────────────────────────────────────┘
```

---

#### 4.2.10 SmartChart - 智能图表

**功能描述**: AI驱动的图表组件，根据数据自动选择最佳图表类型。

**原型图**:
```
┌─────────────────────────────────────────┐
│  AI智能分析                             │
│  ─────────────────────────────────────  │
│                                         │
│  [根据数据特征自动渲染的图表]          │
│                                         │
│  推荐类型: 折线图 (置信度: 95%)        │
│  [切换为柱状图] [切换为饼图]           │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface SmartChartProps {
  chartData: {
    type?: string; // 可选：指定图表类型
    data: any;
    config?: any;
  };
  onDrillDown?: (dataPoint: any) => void;
  onTypeChange?: (type: string) => void; // 用户手动切换类型
  loading?: boolean;
}
```

**交互规范**:
- 自动识别数据特征并推荐图表类型
- 支持用户手动切换图表类型
- 显示AI推荐理由和置信度

---

### 4.3 数据交互类

#### 4.3.1 DataVisualizer - 数据可视化器

**功能描述**: 提供数据筛选、分组、排序等交互功能。

**原型图**:
```
┌─────────────────────────────────────────┐
│  数据源: [销售流水 ▼]                  │
│  按: [产品 分组 ▼]                      │
│  产品: [不为空 ▼]                       │
│  日期: [2024年 ▼]                       │
│                                         │
│  [应用筛选] [重置] [保存] [导出] [更多]│
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface DataVisualizerProps {
  conditions: FilterCondition[];
  onChange: (conditions: FilterCondition[]) => void;
  onApply: (conditions: FilterCondition[]) => void;
  actions?: {
    showActions?: boolean;
    layout?: 'horizontal' | 'vertical';
    onSave?: () => void;
    onExport?: () => void;
    onShare?: () => void;
    moreActions?: Array<{
      id: string;
      label: string;
      danger?: boolean;
      onClick: () => void;
    }>;
  };
}
```

**交互规范**:
- 筛选条件支持下拉选择、日期选择、数值范围
- 条件之间支持AND/OR逻辑
- 操作按钮支持水平/垂直布局

---

#### 4.3.2 DrillDownPanel - 下钻面板

**功能描述**: 右侧滑入面板，显示下钻详情。

**原型图**:
```
┌─────────────────────────────────────────┐
│  🔍 销售详情                    [×]     │
│  ─────────────────────────────────────  │
│                                         │
│  华东地区                               │
│  销售额：¥1,350万                        │
│  同比增长：+25.3%                       │
│                                         │
│  [下钻到城市]                           │
│  [导出数据]                             │
│  [添加到看板]                           │
│                                         │
│  [← 返回上级]                           │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface DrillDownPanelProps {
  isOpen: boolean;
  data: {
    title: string;
    details: Array<{
      label: string;
      value: string;
    }>;
    actions?: Array<{
      id: string;
      label: string;
      icon?: string;
      onClick: () => void;
    }>;
  };
  onClose: () => void;
  onBack?: () => void;
}
```

**交互规范**:
- 从右侧滑入动画
- 支持遮罩层点击关闭
- 支持返回上级操作

---

### 4.4 内容展示类

#### 4.4.1 NarrativeText - 叙述文本组件

**功能描述**: 展示AI生成的叙述性文本，支持流式输出和格式化。

**原型图**:
```
┌─────────────────────────────────────────┐
│  根据数据查询，为您展示今年的销售额    │
│  情况：                                 │
│                                         │
│  2024年度销售额达到 38,560,000 元，    │
│  同比增长 19.8%，表现优异。            │
│                                         │
│  分季度来看：                           │
│  • Q1: 823万                           │
│  • Q2: 945万                           │
│  • Q3: 1028万                          │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface NarrativeTextProps {
  content: string;
  isStreaming?: boolean;
  onInteraction?: (query: string) => void;
  onAgentSwitch?: (agentName: string) => void;
}
```

**交互规范**:
- 支持流式输出动画
- 支持Markdown格式
- 支持@提及Agent切换

---

#### 4.4.2 ReportTitle - 报告标题

**功能描述**: 报告页面的主标题，支持副标题和元信息。

**原型图**:
```
┌─────────────────────────────────────────┐
│                                         │
│      2024年度销售数据分析报告           │
│                                         │
│      2024年1月 - 12月                   │
│                                         │
│      生成时间: 2024-12-20 14:30        │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ReportTitleProps {
  title: string;
  subtitle?: string;
  metadata?: Array<{
    label: string;
    value: string;
  }>;
  icon?: string;
}
```

---

#### 4.4.3 SectionTitle - 章节标题

**功能描述**: 报告章节标题，支持编号和描述。

**原型图**:
```
┌─────────────────────────────────────────┐
│  1. 销售概览                            │
│  ─────────────────────────────────────  │
│  本章节展示2024年度整体销售情况...     │
└─────────────────────────────────────────┘
```

---

#### 4.4.4 QuoteParagraph - 引用段落

**功能描述**: 展示重要观点或引用，带引号样式。

**原型图**:
```
┌─────────────────────────────────────────┐
│  "本季度销售额增长主要得益于华东地区   │
│   的强劲表现，同比增长25.3%，远超      │
│   行业平均水平。"                       │
│                                         │
│                    — 数据分析师         │
└─────────────────────────────────────────┘
```

---

#### 4.4.5 StructuredListItem - 结构化列表项

**功能描述**: 结构化的列表项，支持图标、标题、描述、操作。

**原型图**:
```
┌─────────────────────────────────────────┐
│  📊 销售额分析                          │
│     2024年度销售额达到38,560,000元     │
│     [查看详情 →]                        │
└─────────────────────────────────────────┘
```

---

#### 4.4.6 DataPreviewCard / DataPreviewCardLight - 数据预览卡片

**功能描述**: 数据预览卡片，展示关键指标摘要。

**原型图**:
```
┌─────────────────────────────────────────┐
│  销售数据预览                           │
│  ─────────────────────────────────────  │
│                                         │
│  总销售额: ¥38,560,000                 │
│  同比增长: +19.8%                      │
│  订单数量: 12,345                      │
│                                         │
│  [查看完整报告 →]                      │
└─────────────────────────────────────────┘
```

---

#### 4.4.7 HighlightBlock - 高亮块

**功能描述**: 高亮显示重要信息或洞察。

**原型图**:
```
┌─────────────────────────────────────────┐
│  💡 关键洞察                            │
│                                         │
│  华东地区销售额占比35%，是最大的        │
│  销售区域，建议重点关注该区域的        │
│  市场拓展机会。                         │
└─────────────────────────────────────────┘
```

---

#### 4.4.8 AnalystQuote - 分析师引用

**功能描述**: 展示分析师的观点和引用。

**原型图**:
```
┌─────────────────────────────────────────┐
│  👤 数据分析师                          │
│                                         │
│  "基于当前数据趋势，预计下季度销售      │
│   额将继续保持增长态势，建议加大       │
│   对高增长区域的投入。"                 │
└─────────────────────────────────────────┘
```

---

#### 4.4.9 ThoughtChain - 思维链组件

**功能描述**: 展示AI的思考过程，多步骤推理链。

**原型图**:
```
┌─────────────────────────────────────────┐
│  🔄 思考过程                    [展开▼] │
│  ─────────────────────────────────────  │
│                                         │
│  ✓ 1. 理解问题                          │
│    分析用户查询意图...                  │
│                                         │
│  ⏳ 2. 数据查询                          │
│    正在查询销售数据...                  │
│                                         │
│  ○ 3. 数据分析                          │
│                                         │
│  ○ 4. 生成报告                          │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ThoughtChainProps {
  items: Array<{
    key: string;
    title: string;
    description?: string;
    status: 'loading' | 'success' | 'error' | 'pending';
    blink?: boolean; // 闪烁提示
  }>;
  expanded?: boolean;
  onToggle?: () => void;
}
```

**交互规范**:
- 支持展开/收起
- 实时更新步骤状态
- loading状态显示动画

---

### 4.5 交互操作类

#### 4.5.1 ActionButtonGroup - 操作按钮组

**功能描述**: 一组操作按钮，支持主次按钮和更多菜单。

**原型图**:
```
┌─────────────────────────────────────────┐
│  [保存] [导出] [分享] [更多 ▼]         │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ActionButtonGroupProps {
  actions: Array<{
    id: string;
    label: string;
    icon?: string;
    primary?: boolean;
    danger?: boolean;
    onClick: () => void;
  }>;
  layout?: 'horizontal' | 'vertical';
  moreActions?: Array<{
    id: string;
    label: string;
    danger?: boolean;
  }>;
}
```

---

#### 4.5.2 RatingSelector - 评分选择器

**功能描述**: 用户对答案进行评分。

**原型图**:
```
┌─────────────────────────────────────────┐
│  对答案的评分                    [收起▼]│
│  ─────────────────────────────────────  │
│                                         │
│  内容满意度：                           │
│  ★★★★★                                │
│                                         │
│  [已提交] ✓ 感谢您的评分！              │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface RatingSelectorProps {
  messageId: string;
  onRating?: (rating: {
    stars?: number;
  }) => void;
  initialRating?: {
    stars?: number;
  };
  collapsible?: boolean;
}
```

---

#### 4.5.3 QuickQuestions - 快速问题组件

**功能描述**: 展示推荐问题，帮助用户快速开始。

**原型图**:
```
┌─────────────────────────────────────────┐
│  推荐问题：                             │
│                                         │
│  [今年销售额是多少？]                  │
│  [各地区销售对比]                       │
│  [用户行为分析]                         │
│  [异常数据检测]                         │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface QuickQuestionsProps {
  questions: Array<{
    id: string;
    text: string;
    category?: string;
  }>;
  onSelect: (question: string) => void;
  maxDisplay?: number;
}
```

---

#### 4.5.4 ChoiceSelector - 选择器

**功能描述**: 单选或多选组件，支持多种样式。

**原型图**:
```
┌─────────────────────────────────────────┐
│  选择分析维度：                         │
│                                         │
│  ( ) 按地区                             │
│  (●) 按产品                             │
│  ( ) 按时间                             │
│                                         │
│  或                                     │
│                                         │
│  [ ] 按地区                             │
│  [✓] 按产品                             │
│  [✓] 按时间                             │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ChoiceSelectorProps {
  options: Array<{
    id: string;
    label: string;
    value: any;
    disabled?: boolean;
  }>;
  type: 'radio' | 'checkbox';
  value: any | any[];
  onChange: (value: any | any[]) => void;
  layout?: 'vertical' | 'horizontal';
}
```

---

#### 4.5.5 ConfirmBox - 确认框

**功能描述**: 危险操作的确认对话框。

**原型图**:
```
┌─────────────────────────────────────────┐
│  🚫 危险操作                            │
│                                         │
│  确定要删除此报告吗？此操作不可逆。     │
│  所有相关数据将被永久删除。             │
│                                         │
│  请输入"DELETE"确认：                   │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [取消]              [删除]             │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ConfirmBoxProps {
  title: string;
  message: string;
  confirmText?: string; // 需要输入的确认文字
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}
```

---

#### 4.5.6 ProgressSteps - 进度步骤

**功能描述**: 展示多步骤流程的进度。

**原型图**:
```
┌─────────────────────────────────────────┐
│  ○─────○─────●─────○─────○             │
│  1     2     3     4     5              │
│  已完成 已完成 进行中 等待  等待        │
└─────────────────────────────────────────┘
```

**垂直布局**:
```
┌─────────────────────────────────────────┐
│  ○  1. 数据提取                         │
│  │     已完成                           │
│  │                                     │
│  ○  2. 数据清洗                         │
│  │     已完成                           │
│  │                                     │
│  ●  3. 数据分析                         │
│  │     进行中...                        │
│  │                                     │
│  ○  4. 报告生成                         │
│  │     等待                             │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ProgressStepsProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'active' | 'pending' | 'error';
    duration?: number; // 执行时长（秒）
  }>;
  orientation?: 'horizontal' | 'vertical';
  showDuration?: boolean;
}
```

---

#### 4.5.7 WorkflowExecution - 工作流执行组件

**功能描述**: 展示工作流的执行状态和进度。

**原型图**:
```
┌─────────────────────────────────────────┐
│  🔄 销售数据分析工作流                  │
│  状态：运行中 (65%)                     │
│  已运行：2分30秒 / 预计4分钟            │
│  ─────────────────────────────────────  │
│                                         │
│  📊 步骤执行状态                        │
│                                         │
│  ✓ 1. 数据提取                15秒     │
│  ✓ 2. 数据清洗                45秒     │
│  ⏳ 3. 数据分析               运行中    │
│     ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ 65%      │
│     [查看日志]                         │
│                                         │
│  ○ 4. 报告生成                等待     │
│  ○ 5. 结果分发                等待     │
│                                         │
│  [⏸️ 暂停] [⏹️ 停止] [📥 导出]         │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface WorkflowExecutionProps {
  id: string;
  title: string;
  status: 'running' | 'paused' | 'completed' | 'stopped' | 'failed';
  progress: number; // 总体进度 0-100
  elapsedTime: number; // 已运行时间（秒）
  estimatedTime: number; // 预计总时间（秒）
  steps: Array<{
    id: string;
    name: string;
    status: 'completed' | 'running' | 'pending' | 'failed';
    duration?: number;
    progress?: number; // 步骤进度 0-100
    logs?: string[];
  }>;
  onPause?: () => void;
  onStop?: () => void;
  onExport?: () => void;
  onViewLogs?: (stepId: string) => void;
}
```

**交互规范**:
- 运行中的步骤显示旋转动画图标
- 进度条实时更新
- 支持查看步骤日志
- 暂停/继续切换
- 停止操作需要确认

---

#### 4.5.8 SwitchAgentButton - 切换Agent按钮

**功能描述**: 切换当前AI Agent。

**原型图**:
```
┌─────────────────────────────────────────┐
│  当前: 数据分析师                       │
│  [切换到销售顾问] [切换到财务分析师]    │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface SwitchAgentButtonProps {
  currentAgent: {
    id: string;
    name: string;
    avatar?: string;
  };
  availableAgents: Array<{
    id: string;
    name: string;
    avatar?: string;
    description?: string;
  }>;
  onSwitch: (agentId: string) => void;
}
```

---

#### 4.5.7 SwitchAgentButton - 切换Agent按钮

**功能描述**: 切换当前AI Agent。

**原型图**:
```
┌─────────────────────────────────────────┐
│  当前: 数据分析师                       │
│  [切换到销售顾问] [切换到财务分析师]    │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface SwitchAgentButtonProps {
  currentAgent: {
    id: string;
    name: string;
    avatar?: string;
  };
  availableAgents: Array<{
    id: string;
    name: string;
    avatar?: string;
    description?: string;
  }>;
  onSwitch: (agentId: string) => void;
}
```

**Props接口**:
```typescript
interface ProgressStepsProps {
  steps: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'active' | 'pending' | 'error';
  }>;
  orientation?: 'horizontal' | 'vertical';
}
```

---

### 4.6 页面级组件

#### 4.6.1 ScenarioPanel - 业务场景面板

**功能描述**: 展示可用的业务场景，支持搜索和筛选。

**原型图**:
```
┌─────────────────────────────────────────┐
│  业务场景                    [×]        │
│  ─────────────────────────────────────  │
│                                         │
│  [搜索场景...]                          │
│                                         │
│  销售分析                               │
│  • 销售概览分析                         │
│  • 地区销售对比                         │
│  • 产品销售排名                         │
│                                         │
│  用户分析                               │
│  • 用户行为分析                         │
│  • 用户留存分析                         │
│                                         │
│  [开始场景]                             │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface ScenarioPanelProps {
  scenarios: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    icon?: string;
  }>;
  onStart: (scenarioId: string) => void;
  onClose: () => void;
  searchable?: boolean;
}
```

---

#### 4.6.2 WelcomePage - 欢迎页面

**功能描述**: 应用启动时的欢迎页面，展示快速入口和推荐问题。

**原型图**:
```
┌─────────────────────────────────────────┐
│                                         │
│           欢迎使用智能数据分析          │
│                                         │
│  让AI帮你快速理解数据，发现洞察         │
│                                         │
│  [快速开始]                             │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  推荐问题：                             │
│                                         │
│  📊 今年销售额是多少？                 │
│  📈 各地区销售对比                      │
│  👥 用户行为分析                        │
│  ⚠️  异常数据检测                       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [查看全部场景] [查看历史对话]          │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface WelcomePageProps {
  userName?: string;
  recommendedQuestions?: Array<{
    id: string;
    text: string;
    category: string;
    icon?: string;
  }>;
  onQuestionSelect: (question: string) => void;
  onScenarioOpen: () => void;
  onHistoryOpen: () => void;
}
```

---

### 4.7 辅助组件类

#### 4.7.1 SuggestionList - 建议列表

**功能描述**: 展示操作建议或推荐内容。

**原型图**:
```
┌─────────────────────────────────────────┐
│  建议操作：                             │
│                                         │
│  → 查看各月明细                          │
│  → 各渠道订单量占比                     │
│  → 本月客单价变化                       │
└─────────────────────────────────────────┘
```

---

#### 4.7.2 HighlightMetric - 高亮指标

**功能描述**: 在文本中高亮显示关键指标。

**原型图**:
```
┌─────────────────────────────────────────┐
│  2024年度销售额达到                    │
│  [38,560,000元] (高亮显示)             │
│  ，同比增长19.8%。                      │
└─────────────────────────────────────────┘
```

---

#### 4.7.3 Divider - 分割线

**功能描述**: 分隔内容区域的视觉元素。

**原型图**:
```
┌─────────────────────────────────────────┐
│  内容区域1                              │
│  ─────────────────────────────────────  │
│  内容区域2                              │
└─────────────────────────────────────────┘
```

**Props接口**:
```typescript
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  dashed?: boolean;
  text?: string; // 带文字的分割线
}
```

---

## 5. 交互设计规范

### 5.1 动画规范

- **进入动画**: fadeIn + slideUp，时长200ms
- **退出动画**: fadeOut + slideDown，时长150ms
- **悬停效果**: scale(1.02)，时长150ms
- **加载动画**: 骨架屏 + 脉冲效果

### 5.2 响应式断点

- **移动端**: < 768px
- **平板**: 768px - 1024px
- **桌面**: > 1024px

### 5.3 无障碍规范

- 所有交互元素支持键盘导航
- 图标按钮提供aria-label
- 颜色对比度符合WCAG AA标准
- 支持屏幕阅读器

---

## 6. 技术规范

### 6.1 技术栈

- **框架**: React 18+
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图表**: Recharts / ECharts
- **类型**: TypeScript

### 6.2 性能要求

- 首屏渲染时间 < 1s
- 图表渲染时间 < 500ms（1000数据点内）
- 组件更新响应时间 < 100ms
- 支持虚拟滚动（列表>100项）

### 6.3 数据格式

```typescript
// KPI数据格式
interface KPIData {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: TrendData;
}

// 图表数据格式
interface ChartData {
  type: 'line' | 'bar' | 'pie' | ...;
  data: Array<Record<string, any>>;
  config?: ChartConfig;
}
```

---

## 7. 验收标准

### 7.1 功能验收

- [ ] 所有组件按规范实现
- [ ] 交互行为符合设计
- [ ] 响应式布局正常
- [ ] 无障碍功能完整

### 7.2 性能验收

- [ ] 首屏加载时间达标
- [ ] 大数据量渲染流畅
- [ ] 无内存泄漏

### 7.3 兼容性验收

- [ ] Chrome/Firefox/Safari/Edge最新版
- [ ] 移动端Safari/Chrome
- [ ] 屏幕阅读器兼容

---

## 8. 附录

### 8.1 设计资源

- Figma设计稿链接
- 图标库链接
- 颜色规范文档

### 8.2 参考文档

- Material Design Guidelines
- Apple Human Interface Guidelines
- Ant Design组件库

### 8.3 组件使用示例

#### 示例1: KPI卡片组合使用

```typescript
import { PrimaryKPICard, KPIGroup } from './components/KPICard';

const KPIDashboard = () => {
  const kpiData = [
    {
      id: 'sales',
      label: '2024年度销售额',
      value: 38560000,
      prefix: '¥',
      unit: '元',
      trend: { value: 19.8, direction: 'up', label: '同比增长' },
      subMetrics: [
        { label: 'Q1', value: '823万' },
        { label: 'Q2', value: '945万' },
      ],
    },
    // ...更多KPI
  ];

  return <KPIGroup items={kpiData} layout="grid" columns={3} />;
};
```

#### 示例2: 图表容器使用

```typescript
import { ChartContainer } from './components/ChartContainer';
import { LineChartComponent } from './components/Charts';

const SalesTrendChart = () => {
  const chartData = [
    { x: '1月', y: 823 },
    { x: '2月', y: 945 },
    // ...
  ];

  return (
    <ChartContainer
      title="近3个月销售额趋势"
      actions={[
        { id: 'export', label: '导出', onClick: handleExport },
        { id: 'share', label: '分享', onClick: handleShare },
      ]}
    >
      <LineChartComponent data={chartData} />
    </ChartContainer>
  );
};
```

#### 示例3: 下钻面板使用

```typescript
import { DrillDownPanel } from './components/DrillDownPanel';

const handleDrillDown = (rowData: any) => {
  setDrillDownData({
    title: rowData.region,
    details: [
      { label: '销售额', value: rowData.sales },
      { label: '增长率', value: rowData.growth },
    ],
    actions: [
      { id: 'city', label: '下钻到城市', onClick: () => {} },
      { id: 'export', label: '导出数据', onClick: () => {} },
    ],
  });
  setIsDrillDownOpen(true);
};
```

### 8.4 设计系统规范

#### 颜色规范

```
主色系:
- Primary: #007AFF (蓝色)
- Success: #34C759 (绿色)
- Warning: #FF9500 (橙色)
- Danger: #FF3B30 (红色)

中性色:
- Text Primary: #1d1d1f
- Text Secondary: #86868b
- Border: #E5E5EA
- Background: #F5F5F7
```

#### 字体规范

```
标题:
- H1: 24px / Bold
- H2: 20px / Semibold
- H3: 18px / Semibold

正文:
- Body Large: 16px / Regular
- Body: 14px / Regular
- Body Small: 12px / Regular

数值:
- Large: 32px / Bold
- Medium: 24px / Bold
- Small: 18px / Semibold
```

#### 间距规范

```
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px
```

#### 圆角规范

```
- Small: 4px
- Medium: 8px
- Large: 12px
- XLarge: 16px
```

### 8.5 更新日志

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2024-12 | 初始版本，包含所有组件规范 | 产品团队 |

---

## 9. 术语表

- **KPI**: Key Performance Indicator，关键绩效指标
- **Agent**: AI智能体，负责特定领域的分析
- **下钻**: Drill Down，从汇总数据深入到明细数据
- **思维链**: Thought Chain，AI的推理过程展示
- **工作流**: Workflow，多步骤的自动化流程
- **场景**: Scenario，预设的业务分析场景

---

## 10. 参考资源

### 10.1 设计工具

- Figma设计稿: [链接]
- 图标库: Lucide Icons
- 字体: SF Pro / Inter

### 10.2 技术文档

- React官方文档: https://react.dev
- Tailwind CSS文档: https://tailwindcss.com
- Framer Motion文档: https://www.framer.com/motion
- Recharts文档: https://recharts.org

### 10.3 设计规范参考

- Material Design: https://material.io/design
- Apple HIG: https://developer.apple.com/design
- Ant Design: https://ant.design

---

**文档结束**

---

**审批记录**

| 角色 | 姓名 | 日期 | 意见 | 签名 |
|------|------|------|------|------|
| 产品经理 | | | | |
| 技术负责人 | | | | |
| UI设计师 | | | | |
| 测试负责人 | | | | |

