import { DashboardItem } from './dashboardService';
import { ContentBlock } from '../types';

/**
 * 完整的看板示例数据
 * 参考企业级 BI 看板设计
 */
export const createCompleteDashboardExample = (): DashboardItem[] => {
  const now = Date.now();
  
  return [
    // 1. 核心 KPI 指标卡片
    {
      id: `dashboard_${now}_1`,
      title: '核心业务指标',
      content: [
        {
          id: `block_${now}_1_1`,
          type: 'kpi-group',
          data: [
            {
              id: 'kpi_sales',
              label: '老客户复购销售金额',
              value: 44748634.10,
              unit: '',
              prefix: '¥',
              trend: { value: 15.2, direction: 'up', label: '同比' }
            },
            {
              id: 'kpi_cost',
              label: '实施成本(K)',
              value: 5184480.00,
              unit: '',
              prefix: '',
              trend: { value: 3.5, direction: 'down', label: '环比' }
            },
            {
              id: 'kpi_payment',
              label: '采购成本本月付款金额',
              value: 14126045.00,
              unit: '',
              prefix: '¥',
              trend: { value: 8.7, direction: 'up', label: '环比' }
            },
            {
              id: 'kpi_profit',
              label: '项目利润率',
              value: 0.41,
              unit: '',
              prefix: '',
              trend: { value: 2.1, direction: 'up', label: '环比' }
            }
          ]
        }
      ] as ContentBlock[],
      timestamp: now,
      agentName: 'ALISA',
      agentId: 'alisa',
      summary: '核心KPI一览：销售额稳步增长，利润率保持健康水平',
      tags: ['核心指标', 'KPI']
    },
    
    // 2. 销售趋势折线图
    {
      id: `dashboard_${now}_2`,
      title: '老客户复购销售金额 vs 实施成本趋势',
      content: [
        {
          id: `block_${now}_2_1`,
          type: 'line-chart',
          data: {
            title: '老客户复购销售金额 vs 实施成本(K)',
            xKey: 'month',
            yKeys: [
              { key: 'sales', name: '老客户复购销售金额', color: '#3B82F6' },
              { key: 'cost', name: '实施成本(K)', color: '#10B981' }
            ],
            data: [
              { month: '201901', sales: 1200, cost: 350 },
              { month: '201902', sales: 1350, cost: 380 },
              { month: '201903', sales: 1500, cost: 420 },
              { month: '201904', sales: 1680, cost: 450 },
              { month: '201905', sales: 1420, cost: 400 },
              { month: '201906', sales: 1580, cost: 430 },
              { month: '201907', sales: 1750, cost: 480 },
              { month: '201908', sales: 1900, cost: 520 },
              { month: '201909', sales: 630, cost: 423 },
              { month: '201910', sales: 2100, cost: 580 },
              { month: '201911', sales: 2250, cost: 620 },
              { month: '201912', sales: 2400, cost: 680 },
              { month: '201913', sales: 2550, cost: 720 }
            ]
          }
        }
      ] as ContentBlock[],
      timestamp: now - 1000,
      agentName: 'ALISA',
      agentId: 'alisa',
      summary: '销售额与成本呈现同步增长趋势，成本控制良好',
      tags: ['趋势分析', '折线图']
    },
    
    // 3. 区域分布柱状图
    {
      id: `dashboard_${now}_3`,
      title: '归属战区-在职状态分布',
      content: [
        {
          id: `block_${now}_3_1`,
          type: 'bar-chart',
          data: {
            title: '归属战区-在职状态分布',
            xKey: 'region',
            yKey: 'count',
            data: [
              { region: '京津区', count: 1000 },
              { region: '西南区', count: 850 },
              { region: '上海区', count: 720 }
            ],
            color: '#3B82F6'
          }
        }
      ] as ContentBlock[],
      timestamp: now - 2000,
      agentName: 'ALISA',
      agentId: 'alisa',
      summary: '京津区人员最多，西南区次之',
      tags: ['区域分布', '柱状图']
    },
    
    // 4. 职级分布饼图
    {
      id: `dashboard_${now}_4`,
      title: '职级分布',
      content: [
        {
          id: `block_${now}_4_1`,
          type: 'pie-chart',
          data: {
            title: '职级分布',
            data: [
              { name: 'm3-1', value: 35 },
              { name: 'p1-2', value: 25 },
              { name: 'p2-3', value: 20 },
              { name: '其他', value: 20 }
            ]
          }
        }
      ] as ContentBlock[],
      timestamp: now - 3000,
      agentName: 'ALISA',
      agentId: 'alisa',
      summary: 'm3-1 职级占比最高，达35%',
      tags: ['职级分析', '饼图']
    },
    
    // 5. 各地区销售额对比
    {
      id: `dashboard_${now}_5`,
      title: '各地区销售额对比',
      content: [
        {
          id: `block_${now}_5_1`,
          type: 'text',
          data: '地区销售对比：华东区以¥1542万领跑，同比增长22.5%，占总销售额40%。华南区¥1028万位居第二，华北区¥771万稳步增长。各地区均实现正增长。'
        },
        {
          id: `block_${now}_5_2`,
          type: 'kpi-group',
          data: [
            {
              id: 'region_east',
              label: '华东区',
              value: 1542,
              unit: '万元',
              prefix: '¥',
              trend: { value: 22.5, direction: 'up', label: '同比' }
            },
            {
              id: 'region_south',
              label: '华南区',
              value: 1028,
              unit: '万元',
              prefix: '¥',
              trend: { value: 18, direction: 'up', label: '同比' }
            },
            {
              id: 'region_north',
              label: '华北区',
              value: 771,
              unit: '万元',
              prefix: '¥',
              trend: { value: 15.8, direction: 'up', label: '同比' }
            },
            {
              id: 'region_other',
              label: '其他',
              value: 515,
              unit: '万元',
              prefix: '¥',
              trend: { value: 12.3, direction: 'up', label: '同比' }
            }
          ]
        },
        {
          id: `block_${now}_5_3`,
          type: 'bar-chart',
          data: {
            title: '各地区销售额对比',
            xKey: 'region',
            yKey: 'sales',
            data: [
              { region: '华东区', sales: 1542 },
              { region: '华南区', sales: 1028 },
              { region: '华北区', sales: 771 },
              { region: '西南区', sales: 515 },
              { region: '其他', sales: 286 }
            ],
            color: '#3B82F6'
          }
        }
      ] as ContentBlock[],
      timestamp: now - 4000,
      agentName: 'ALISA',
      agentId: 'alisa',
      summary: '华东区销售额领先，各地区均实现正增长',
      tags: ['地区分析', '销售额']
    },
    
    // 6. 本月销售额 (拆分)
    {
      id: `dashboard_${now}_6_1`,
      title: '本月销售额',
      content: [
        {
          id: `block_${now}_6_1`,
          type: 'kpi',
          data: {
            id: 'monthly_sales',
            label: '本月销售额',
            value: 350,
            unit: '万',
            prefix: '¥',
            trend: { value: 12.3, direction: 'up', label: '环比' }
          }
        }
      ] as ContentBlock[],
      timestamp: now - 5000,
      agentName: 'ALISA',
      agentId: 'alisa',
      tags: ['KPI']
    },
    // 7. 本月订单 (拆分)
    {
      id: `dashboard_${now}_6_2`,
      title: '本月订单',
      content: [
        {
          id: `block_${now}_6_2`,
          type: 'kpi',
          data: {
            id: 'monthly_orders',
            label: '本月订单',
            value: 1.2,
            unit: '万',
            prefix: '',
            trend: { value: 8.5, direction: 'up', label: '环比' }
          }
        }
      ] as ContentBlock[],
      timestamp: now - 5000,
      agentName: 'ALISA',
      agentId: 'alisa',
      tags: ['KPI']
    },
    // 8. 活跃用户 (拆分)
    {
      id: `dashboard_${now}_6_3`,
      title: '活跃用户',
      content: [
        {
          id: `block_${now}_6_3`,
          type: 'kpi',
          data: {
            id: 'active_users',
            label: '活跃用户',
            value: 5,
            unit: '万',
            prefix: '',
            trend: { value: 5.6, direction: 'up', label: '环比' }
          }
        }
      ] as ContentBlock[],
      timestamp: now - 5000,
      agentName: 'ALISA',
      agentId: 'alisa',
      tags: ['KPI']
    },
    
    // 7. 职级-归属战区分布（多系列柱状图，用折线图模拟）
    {
      id: `dashboard_${now}_7`,
      title: '职级-归属战区分布',
      content: [
        {
          id: `block_${now}_7_1`,
          type: 'bar-chart',
          data: {
            title: '职级-归属战区分布',
            xKey: 'level',
            yKey: 'total',
            data: [
              { level: 'm3-1', total: 1000 },
              { level: 'p1-2', total: 750 },
              { level: 'p2-3', total: 600 },
              { level: '其他', total: 450 }
            ],
            color: '#3B82F6'
          }
        }
      ] as ContentBlock[],
      timestamp: now - 6000,
      agentName: 'ALISA',
      agentId: 'alisa',
      summary: '不同职级在各战区的分布情况',
      tags: ['职级分析', '区域分布']
    },
    
    // 8. 导航栏卡片
    {
      id: `dashboard_${now}_8`,
      title: '快速导航',
      content: [
        {
          id: `block_${now}_8_1`,
          type: 'navigation-bar',
          data: {
            buttons: [
              { name: '销售分析', link: '#sales', backgroundColor: '#3B82F6', textColor: '#FFFFFF' },
              { name: '成本分析', link: '#cost', backgroundColor: '#10B981', textColor: '#FFFFFF' },
              { name: '利润分析', link: '#profit', backgroundColor: '#F59E0B', textColor: '#FFFFFF' },
              { name: '人员分析', link: '#hr', backgroundColor: '#8B5CF6', textColor: '#FFFFFF' }
            ]
          }
        }
      ] as ContentBlock[],
      timestamp: now - 7000,
      agentName: 'ALISA',
      agentId: 'alisa',
      summary: '快速跳转到各分析模块',
      tags: ['导航', '快捷入口']
    }
  ];
};

/**
 * 初始化示例看板（如果看板为空）
 * @param dashboardId 可选，指定要初始化的看板ID
 */
export const initializeExampleDashboard = (dashboardId?: string): DashboardItem[] => {
  const STORAGE_KEY = 'smart_qa_dashboard_v2';
  const DASHBOARDS_KEY = 'smart_qa_dashboards_v1';
  
  try {
    const exampleItems = createCompleteDashboardExample();
    console.log('[initializeExampleDashboard] 创建示例数据:', exampleItems.length, '项');
    
    // 如果指定了看板ID，更新该看板的items
    if (dashboardId) {
      const dashboardsData = localStorage.getItem(DASHBOARDS_KEY);
      const dashboards = dashboardsData ? JSON.parse(dashboardsData) : [];
      const dashboardIndex = dashboards.findIndex((d: any) => d.id === dashboardId);
      
      console.log('[initializeExampleDashboard] 查找看板:', dashboardId, '索引:', dashboardIndex);
      
      if (dashboardIndex !== -1) {
        dashboards[dashboardIndex].items = exampleItems;
        dashboards[dashboardIndex].updatedAt = Date.now();
        localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
        console.log('[initializeExampleDashboard] 已更新看板数据');
        return exampleItems;
      }
    }
    
    // 向后兼容：使用旧的全局存储
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exampleItems));
    console.log('[initializeExampleDashboard] 已保存到全局存储');
    return exampleItems;
  } catch (e) {
    console.error('[initializeExampleDashboard] 失败:', e);
    return [];
  }
};
