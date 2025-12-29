import { ContentBlock } from '../types';

export interface DashboardItem {
  id: string;
  title: string;
  shortName?: string; // 简称
  content: ContentBlock[];
  timestamp: number;
  agentName: string;
  agentId?: string;
  summary?: string;
  tags?: string[];
  layout?: {
    w: number;
    h: number;
    x: number;
    y: number;
  };
}

export interface Dashboard {
  id: string;
  name: string; // 看板名称
  shortName?: string; // 简称
  tags?: string[]; // 标签
  items: DashboardItem[];
  createdAt: number;
  updatedAt: number;
  settings?: {
    comment?: string; // 注释
    notifications?: {
      enabled: boolean;
      content?: string;
      users?: string[];
      userGroups?: string[];
      roles?: string[];
      schedule?: {
        type: 'daily' | 'hourly' | 'custom';
        time?: string;
      };
      platforms?: ('email' | 'dingtalk' | 'feishu' | 'wechat')[];
    };
    cache?: {
      enabled: boolean;
      refreshSchedule?: {
        type: 'year' | 'month' | 'week' | 'day' | 'hour';
        time?: string;
      };
    };
    advanced?: {
      name?: string;
      isCore?: boolean; // 核心看板
      backgroundImage?: string;
      backgroundColor?: string;
      refreshFrequency?: number;
      disableLLM?: boolean;
      disableDrillDown?: boolean;
      showQuestionExplanation?: boolean;
      themeMode?: 'light' | 'dark';
    };
    globalFilters?: {
      dimensions: string[];
      defaultValues?: Record<string, any>;
    };
    permissions?: {
      users?: string[];
      roles?: string[];
      userGroups?: string[];
    };
  };
}

const STORAGE_KEY = 'smart_qa_dashboard_v2';
const DASHBOARDS_KEY = 'smart_qa_dashboards_v1';
const CURRENT_DASHBOARD_KEY = 'smart_qa_current_dashboard';

export const dashboardService = {
  // 获取所有看板项（兼容旧版本，优先从当前看板获取）
  getItems(): DashboardItem[] {
    const currentDashboardId = this.getCurrentDashboardId();
    if (currentDashboardId) {
      // 从当前看板获取项
      const dashboard = this.getCurrentDashboard();
      if (dashboard) {
        return dashboard.items;
      }
    }
    // 向后兼容：从旧的全局存储获取
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse dashboard data', e);
      return [];
    }
  },

  // 添加项到看板
  addItem(itemOrBlocks: DashboardItem | ContentBlock[], agentName?: string, agentId?: string): DashboardItem {
    let newItem: DashboardItem;
    
    if (Array.isArray(itemOrBlocks)) {
      // 提取标题
      const headingBlock = itemOrBlocks.find(b => b.type === 'heading' || b.type === 'section');
      const title = headingBlock ? 
        (typeof headingBlock.data === 'string' ? headingBlock.data : '数据洞察') : 
        '未命名数据项';

      newItem = {
        id: `dash_${Date.now()}`,
        title: title.replace(/[🔍📈💹💰🗺️🏆📊📦]/g, '').trim(),
        content: itemOrBlocks,
        timestamp: Date.now(),
        agentName: agentName || 'Assistant',
        agentId,
        summary: this.generateAutoSummary(itemOrBlocks),
        tags: this.extractTags(itemOrBlocks),
      };
    } else {
      newItem = itemOrBlocks;
    }

    // 检查是否有当前看板ID
    const currentDashboardId = this.getCurrentDashboardId();
    if (currentDashboardId) {
      // 添加到当前看板
      const dashboards = this.getDashboards();
      const dashboard = dashboards.find(d => d.id === currentDashboardId);
      if (dashboard) {
        // 检查是否已存在，避免重复添加
        if (!dashboard.items.some(existingItem => existingItem.id === newItem.id)) {
          dashboard.items = [newItem, ...dashboard.items];
          dashboard.updatedAt = Date.now();
          localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
        }
      }
    } else {
      // 没有当前看板，使用旧的全局存储方式（向后兼容）
      const items = this.getItems();
      if (!items.some(existingItem => existingItem.id === newItem.id)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...items]));
      }
    }
    
    return newItem;
  },

  // 删除看板项
  removeItem(id: string) {
    const currentDashboardId = this.getCurrentDashboardId();
    if (currentDashboardId) {
      // 从当前看板删除
      const dashboards = this.getDashboards();
      const dashboard = dashboards.find(d => d.id === currentDashboardId);
      if (dashboard) {
        dashboard.items = dashboard.items.filter(item => item.id !== id);
        dashboard.updatedAt = Date.now();
        localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
      }
    } else {
      // 使用旧的全局存储方式（向后兼容）
      const items = this.getItems().filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  },

  // 更新项顺序
  updateItems(items: DashboardItem[]) {
    const currentDashboardId = this.getCurrentDashboardId();
    if (currentDashboardId) {
      // 更新当前看板的项
      const dashboards = this.getDashboards();
      const dashboard = dashboards.find(d => d.id === currentDashboardId);
      if (dashboard) {
        dashboard.items = items;
        dashboard.updatedAt = Date.now();
        localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
      }
    } else {
      // 使用旧的全局存储方式（向后兼容）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  },

  // 自动生成摘要（模拟 AI）
  generateAutoSummary(blocks: ContentBlock[]): string {
    const textBlocks = blocks.filter(b => b.type === 'text');
    if (textBlocks.length > 0) {
      const combinedText = textBlocks.map(b => b.data).join(' ');
      return combinedText.substring(0, 100) + (combinedText.length > 100 ? '...' : '');
    }
    return '该卡片包含 KPI 指标和图表深度分析。';
  },

  // 提取标签
  extractTags(blocks: ContentBlock[]): string[] {
    const tags = new Set<string>();
    blocks.forEach(b => {
      if (b.type === 'kpi' || b.type === 'kpi-group') tags.add('指标');
      if (b.type.includes('chart')) tags.add('可视化');
      if (b.type === 'table') tags.add('明细');
      if (b.type === 'visualizer') tags.add('自动化查询');
    });
    return Array.from(tags);
  },

  // ========== 看板管理功能 ==========
  
  // 获取所有看板
  getDashboards(): Dashboard[] {
    try {
      const data = localStorage.getItem(DASHBOARDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse dashboards data', e);
      return [];
    }
  },

  // 创建新看板
  createDashboard(name: string, shortName?: string, tags?: string[]): Dashboard {
    const dashboards = this.getDashboards();
    const newDashboard: Dashboard = {
      id: `dashboard_${Date.now()}`,
      name,
      shortName,
      tags: tags || [],
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dashboards.push(newDashboard);
    localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
    this.setCurrentDashboard(newDashboard.id);
    return newDashboard;
  },

  // 获取当前看板ID
  getCurrentDashboardId(): string | null {
    return localStorage.getItem(CURRENT_DASHBOARD_KEY);
  },

  // 设置当前看板
  setCurrentDashboard(dashboardId: string) {
    localStorage.setItem(CURRENT_DASHBOARD_KEY, dashboardId);
  },

  // 获取当前看板
  getCurrentDashboard(): Dashboard | null {
    const id = this.getCurrentDashboardId();
    if (!id) return null;
    const dashboards = this.getDashboards();
    return dashboards.find(d => d.id === id) || null;
  },

  // 更新看板设置
  updateDashboardSettings(dashboardId: string, settings: Partial<Dashboard['settings']>) {
    const dashboards = this.getDashboards();
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      dashboard.settings = { ...dashboard.settings, ...settings };
      dashboard.updatedAt = Date.now();
      localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
    }
  },

  // 更新看板名称等信息
  updateDashboard(dashboardId: string, updates: Partial<Pick<Dashboard, 'name' | 'shortName' | 'tags'>>) {
    const dashboards = this.getDashboards();
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      Object.assign(dashboard, updates);
      dashboard.updatedAt = Date.now();
      localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
    }
  },

  // 删除看板
  deleteDashboard(dashboardId: string) {
    const dashboards = this.getDashboards().filter(d => d.id !== dashboardId);
    localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
    if (this.getCurrentDashboardId() === dashboardId) {
      localStorage.removeItem(CURRENT_DASHBOARD_KEY);
    }
  },

  // 复制看板
  duplicateDashboard(dashboardId: string, newName: string): Dashboard {
    const dashboards = this.getDashboards();
    const source = dashboards.find(d => d.id === dashboardId);
    if (!source) throw new Error('Dashboard not found');
    
    const newDashboard: Dashboard = {
      ...source,
      id: `dashboard_${Date.now()}`,
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dashboards.push(newDashboard);
    localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
    return newDashboard;
  }
};

