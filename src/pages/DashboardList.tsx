import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  MessageSquare, 
  Star, 
  MoreVertical,
  BarChart3,
  Circle,
  Clock,
  Trash2,
  Copy,
  Share2,
  X
} from 'lucide-react';
import { dashboardService, Dashboard } from '../services/dashboardService';
import clsx from 'clsx';

const DashboardList = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMineOnly, setShowMineOnly] = useState(true);
  const [selectedDashboards, setSelectedDashboards] = useState<Set<string>>(new Set());
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardShortName, setNewDashboardShortName] = useState('');
  const [newDashboardTags, setNewDashboardTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);
  const [showSelectDashboardModal, setShowSelectDashboardModal] = useState(false);

  useEffect(() => {
    // 初始化示例数据（如果为空）
    const allDashboards = dashboardService.getDashboards();
    if (allDashboards.length === 0) {
      // 创建几个示例看板
      dashboardService.createDashboard('业务主题', '销售', ['销售', '业务']);
      dashboardService.createDashboard('销售业绩分析', '销售', ['销售', '分析']);
      dashboardService.createDashboard('数据分析报表', '分析', ['分析', '报表']);
      setDashboards(dashboardService.getDashboards());
    } else {
      setDashboards(allDashboards);
    }

    // 检查是否有添加看板的数据
    const params = new URLSearchParams(window.location.search);
    const shouldAdd = params.get('add') === 'true';
    if (shouldAdd) {
      const storedData = sessionStorage.getItem('addToDashboardData');
      if (storedData) {
        setShowSelectDashboardModal(true);
        // 清理 URL 参数，避免刷新时重复触发
        const newUrl = window.location.pathname + '?page=dashboard-list';
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  // 过滤看板
  const filteredDashboards = useMemo(() => {
    let result = dashboards;
    
    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.shortName?.toLowerCase().includes(query) ||
        d.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // 只显示我的（暂时简化，实际应该根据用户ID过滤）
    if (showMineOnly) {
      // 这里可以根据实际用户ID过滤
      // result = result.filter(d => d.createdBy === currentUserId);
    }
    
    return result;
  }, [dashboards, searchQuery, showMineOnly]);

  // 获取发布状态
  const getPublishStatus = (dashboard: Dashboard) => {
    // 简化逻辑：根据更新时间判断
    const daysSinceUpdate = (Date.now() - dashboard.updatedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 1) {
      return { label: '已保存未发布', status: 'saved', icon: Clock, color: 'text-blue-500' };
    }
    // 这里可以根据实际业务逻辑判断
    return { label: '未发布', status: 'unpublished', icon: Circle, color: 'text-gray-400' };
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '/');
  };

  // 创建新看板
  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) {
      alert('请输入看板名称');
      return;
    }
    
    const newDashboard = dashboardService.createDashboard(
      newDashboardName,
      newDashboardShortName || undefined,
      newDashboardTags.length > 0 ? newDashboardTags : undefined
    );
    
    setDashboards(dashboardService.getDashboards());
    setShowCreateModal(false);
    setNewDashboardName('');
    setNewDashboardShortName('');
    setNewDashboardTags([]);
    setTagInput('');
    
    // 如果是从添加流程来的，保留 sessionStorage 数据并跳转到新看板
    const storedData = sessionStorage.getItem('addToDashboardData');
    if (storedData) {
      setShowSelectDashboardModal(false);
      window.location.href = `?page=dashboard&id=${newDashboard.id}&add=true`;
    } else {
      window.location.href = `?page=dashboard&id=${newDashboard.id}`;
    }
  };

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !newDashboardTags.includes(tagInput.trim())) {
      setNewDashboardTags([...newDashboardTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setNewDashboardTags(newDashboardTags.filter(t => t !== tag));
  };

  // 进入看板
  const handleEnterDashboard = (dashboardId: string) => {
    dashboardService.setCurrentDashboard(dashboardId);
    
    // 如果是从添加流程来的，保留 sessionStorage 数据
    const storedData = sessionStorage.getItem('addToDashboardData');
    if (storedData) {
      // 跳转到看板页面，看板页面会自动打开添加模态框
      window.location.href = `?page=dashboard&id=${dashboardId}&add=true`;
    } else {
      window.location.href = `?page=dashboard&id=${dashboardId}`;
    }
  };

  // 选择看板并添加内容
  const handleSelectDashboardForAdd = (dashboardId: string) => {
    dashboardService.setCurrentDashboard(dashboardId);
    setShowSelectDashboardModal(false);
    // 跳转到看板页面，看板页面会自动打开添加模态框
    window.location.href = `?page=dashboard&id=${dashboardId}&add=true`;
  };

  // 删除看板
  const handleDeleteDashboard = (dashboardId: string) => {
    if (confirm('确定要删除这个看板吗？')) {
      dashboardService.deleteDashboard(dashboardId);
      setDashboards(dashboardService.getDashboards());
      setShowMoreMenu(null);
    }
  };

  // 复制看板
  const handleCopyDashboard = (dashboardId: string) => {
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      dashboardService.createDashboard(
        `${dashboard.name} (副本)`,
        dashboard.shortName,
        dashboard.tags
      );
      // 复制看板项
      dashboard.items.forEach(item => {
        dashboardService.addItem(item);
      });
      setDashboards(dashboardService.getDashboards());
      setShowMoreMenu(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-[#111827]">看板管理</h1>
            <button
              onClick={() => {
                // 使用 pushState 更新 URL，不刷新页面
                window.history.pushState({}, '', '?page=main');
                // 手动触发 popstate 事件，让 App.tsx 监听到 URL 变化
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-sm text-gray-600 hover:text-[#0055FF] transition-colors cursor-pointer"
            >
              返回 SmartQA
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* 搜索和操作栏 */}
        <div className="mb-6 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索仪表板"
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>筛选</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0055FF] text-white rounded-lg hover:bg-[#0044CC] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>新建仪表板</span>
              </button>
            </div>

            {/* 显示选项 */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showMineOnly}
                onChange={(e) => setShowMineOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#0055FF] focus:ring-[#0055FF]"
              />
              <span>仪表板示我的</span>
            </label>
          </div>
        </div>

        {/* 看板列表表格 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#0055FF] focus:ring-[#0055FF]"
                    checked={selectedDashboards.size === filteredDashboards.length && filteredDashboards.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDashboards(new Set(filteredDashboards.map(d => d.id)));
                      } else {
                        setSelectedDashboards(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">名称</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">发布状态</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">创建者</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">修改人</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">修改时间</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDashboards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {searchQuery ? '没有找到匹配的看板' : '暂无看板，点击"新建仪表板"创建'}
                  </td>
                </tr>
              ) : (
                filteredDashboards.map((dashboard) => {
                  const status = getPublishStatus(dashboard);
                  const StatusIcon = status.icon;
                  const isSelected = selectedDashboards.has(dashboard.id);
                  const isHovered = hoveredRow === dashboard.id;
                  const showMenu = showMoreMenu === dashboard.id;

                  return (
                    <tr
                      key={dashboard.id}
                      className={clsx(
                        "transition-colors",
                        isHovered && "bg-blue-50/30",
                        isSelected && "bg-blue-50"
                      )}
                      onMouseEnter={() => setHoveredRow(dashboard.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSelected = new Set(selectedDashboards);
                            if (e.target.checked) {
                              newSelected.add(dashboard.id);
                            } else {
                              newSelected.delete(dashboard.id);
                            }
                            setSelectedDashboards(newSelected);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-[#0055FF] focus:ring-[#0055FF]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <button
                            onClick={() => handleEnterDashboard(dashboard.id)}
                            className="text-left hover:text-[#0055FF] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{dashboard.name}</span>
                              {dashboard.shortName && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                  {dashboard.shortName}
                                </span>
                              )}
                              {dashboard.tags && dashboard.tags.length > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-blue-50 text-[#0055FF] rounded">
                                  {dashboard.tags[0]}
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={clsx("w-4 h-4", status.color)} />
                          <span className="text-sm text-gray-700">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">aliyun7029316171</td>
                      <td className="px-4 py-3 text-sm text-gray-600">aliyun7029316171</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatTime(dashboard.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 relative">
                          <button
                            onClick={() => handleEnterDashboard(dashboard.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="查看"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="评论"
                          >
                            <MessageSquare className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="收藏"
                          >
                            <Star className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowMoreMenu(showMenu ? null : dashboard.id)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="更多"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            {showMenu && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                                <button
                                  onClick={() => {
                                    handleCopyDashboard(dashboard.id);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  复制
                                </button>
                                <button
                                  onClick={() => {
                                    // 分享功能
                                    navigator.clipboard.writeText(`${window.location.origin}?page=dashboard&id=${dashboard.id}`);
                                    alert('分享链接已复制到剪贴板');
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Share2 className="w-4 h-4" />
                                  分享
                                </button>
                                <button
                                  onClick={() => handleDeleteDashboard(dashboard.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  删除
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 创建看板模态框 */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#111827]">新建仪表板</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">看板名称 *</label>
                <input
                  type="text"
                  value={newDashboardName}
                  onChange={(e) => setNewDashboardName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                  placeholder="请输入看板名称"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">简称</label>
                <input
                  type="text"
                  value={newDashboardShortName}
                  onChange={(e) => setNewDashboardShortName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                  placeholder="可选，用于简短标识"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">标签</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0055FF] focus:border-transparent outline-none"
                    placeholder="输入标签后按回车添加"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-[#0055FF] text-white rounded-xl hover:bg-[#0044CC] transition-colors font-medium"
                  >
                    添加
                  </button>
                </div>
                {newDashboardTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newDashboardTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-[#0055FF] rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateDashboard}
                  className="px-6 py-2 bg-[#0055FF] hover:bg-[#0044CC] text-white rounded-xl transition-colors font-bold"
                >
                  创建看板
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 选择看板对话框 */}
      <AnimatePresence>
        {showSelectDashboardModal && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSelectDashboardModal(false);
                // 取消添加，清除 sessionStorage
                sessionStorage.removeItem('addToDashboardData');
                // 清理 URL 参数
                const newUrl = window.location.pathname + '?page=dashboard-list';
                window.history.replaceState({}, '', newUrl);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[8px] z-[9998]"
            />
            
            {/* 对话框 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* 标题栏 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA]">
                  <h3 className="text-[18px] font-semibold text-[#1d1d1f]">
                    选择看板
                  </h3>
                  <button
                    onClick={() => {
                      setShowSelectDashboardModal(false);
                      sessionStorage.removeItem('addToDashboardData');
                      const newUrl = window.location.pathname + '?page=dashboard-list';
                      window.history.replaceState({}, '', newUrl);
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-[#F5F5F7] flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-[#86868b]" />
                  </button>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <p className="text-[14px] text-[#1d1d1f] mb-4">
                    请选择要添加内容的看板：
                  </p>
                  
                  {/* 看板列表 */}
                  <div className="space-y-2">
                    {filteredDashboards.length === 0 ? (
                      <div className="text-center py-8 text-[#86868b]">
                        暂无看板，请先创建看板
                      </div>
                    ) : (
                      filteredDashboards.map((dashboard) => {
                        const status = getPublishStatus(dashboard);
                        const StatusIcon = status.icon;
                        
                        return (
                          <button
                            key={dashboard.id}
                            onClick={() => handleSelectDashboardForAdd(dashboard.id)}
                            className="w-full text-left px-4 py-3 rounded-xl border border-[#E5E5EA] hover:border-[#007AFF] hover:bg-[#F5F9FF] transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <BarChart3 className="w-5 h-5 text-[#86868b] group-hover:text-[#007AFF] transition-colors" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-[#1d1d1f] group-hover:text-[#007AFF] transition-colors">
                                    {dashboard.name}
                                  </span>
                                  {dashboard.shortName && (
                                    <span className="px-2 py-0.5 text-xs bg-[#F5F5F7] text-[#86868b] rounded">
                                      {dashboard.shortName}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#86868b]">
                                  <div className="flex items-center gap-1">
                                    <StatusIcon className={clsx("w-3 h-3", status.color)} />
                                    <span>{status.label}</span>
                                  </div>
                                  <span>{formatTime(dashboard.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-2 h-2 rounded-full bg-[#007AFF]"></div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                  
                  {/* 创建新看板按钮 */}
                  <div className="mt-4 pt-4 border-t border-[#E5E5EA]">
                    <button
                      onClick={() => {
                        setShowSelectDashboardModal(false);
                        setShowCreateModal(true);
                      }}
                      className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-[#E5E5EA] hover:border-[#007AFF] hover:bg-[#F5F9FF] transition-all flex items-center justify-center gap-2 text-[#007AFF] font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>创建新看板</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 点击外部关闭更多菜单 */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMoreMenu(null)}
        />
      )}
    </div>
  );
};

export default DashboardList;

