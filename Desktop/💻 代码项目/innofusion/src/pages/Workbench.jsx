import React, { useState, useEffect, useRef } from 'react';
import { Rocket, FolderPlus, Layers, Library, Settings, ArrowRight, Sparkles, LayoutGrid, MoreHorizontal, Clock, Plus, Upload, Search, List, Grid, CheckCircle, LogOut } from 'lucide-react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { setFlag } from '../utils/storage';
import useAuthStore from '../stores/auth.store';
import api from '../services/api';

/**
 * 产品工作台（Dashboard）
 * - 轻量级蓝白风格
 * - 入口按钮：进入实验室（画布）、新建/继续
 * - 快捷区：模板/资料库（占位）
 */
export default function Workbench() {
  const [activeNav, setActiveNav] = useState('首页');
  const goLab = (projectId = null) => {
    const hash = projectId ? `#/lab?id=${projectId}` : '#/lab';
    window.location.hash = hash;
  };
  const newProject = () => {
    // This will now be handled inside the canvas, creating a new project via API
    goLab();
  };
  const continueLast = () => {
    // This logic might need to be smarter, e.g., fetching the actual last modified project
    goLab();
  };
  const useTemplates = () => { setFlag('bfl:openTemplates'); goLab(); };
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.hash = '#/home';
  };

  const navItems = [
    { id: '首页', label: '首页', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: '总览', label: '总览', icon: <Rocket className="w-4 h-4" /> },
    { id: '项目', label: '项目', icon: <FolderPlus className="w-4 h-4" /> },
    { id: '模板', label: '模板', icon: <Layers className="w-4 h-4" /> },
    { id: '资料库', label: '资料库', icon: <Library className="w-4 h-4" /> },
  ];

  const bottomNavItems = [
    { id: '设置', label: '设置', icon: <Settings className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeNav) {
      case '首页':
        return <HomeView goLab={goLab} newProject={newProject} continueLast={continueLast} useTemplates={useTemplates} />;
      case '总览':
        return <OverviewView />;
      case '项目':
        return <ProjectsView goLab={goLab} />;
      case '模板':
        return <TemplatesView useTemplates={useTemplates} />;
      case '资料库':
        return <LibraryView />;
      case '设置':
        return <SettingsView />;
      default:
        return <PlaceholderView pageName={activeNav} />;
    }
  };

  return (
    <div className="w-full h-full flex bg-bfl-surface">
      {/* 侧边栏 */}
      <aside className="w-60 h-full border-r border-bfl-border bg-white flex flex-col">
        <a href="#/home" className="h-16 px-5 flex items-center gap-2 border-b border-bfl-border hover:bg-gray-50 transition-colors">
          <img src="/bubble-icon.svg" alt="logo" className="w-7 h-7 rounded" />
          <div className="text-base font-semibold text-bfl-text">innofusion 工作台</div>
        </a>
        <LayoutGroup>
          <nav className="flex-1 px-3 py-4 space-y-2">
            {navItems.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
              />
            ))}
            <div className="h-px bg-bfl-border my-2" />
            {bottomNavItems.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
              />
            ))}
          </nav>
        </LayoutGroup>
        <div className="mt-auto p-4 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-bfl-text-dim hover:bg-bfl-surface-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">登出</span>
          </button>
          <div className="text-xs text-bfl-text-dim">v1.0</div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 h-full overflow-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNav}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// 占位视图
function PlaceholderView({ pageName }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-bfl-text-dim">
      <h1 className="text-2xl font-semibold">{pageName}</h1>
      <p className="mt-2 text-base">此页面正在设计中，敬请期待。</p>
    </div>
  )
}

// 设置视图
function SettingsView() {
  const [activeTab, setActiveTab] = useState('个人资料');
  const tabs = ['个人资料', '账户安全', '偏好设置', '账单信息'];

  const renderTabContent = () => {
    switch(activeTab) {
      case '个人资料':
        return <ProfileSettings />;
      case '账户安全':
        return <SecuritySettings />;
      case '偏好设置':
        return <PreferencesSettings />;
      case '账单信息':
        return <BillingSettings />;
      default:
        return <div className="p-4 text-center text-bfl-text-dim">功能正在开发中...</div>;
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-bfl-text mb-4">设置</h1>
      <div className="flex border-b border-bfl-border mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-base font-medium transition-colors relative ${activeTab === tab ? 'text-bfl-primary' : 'text-bfl-text-dim hover:text-bfl-text'}`}
          >
            {tab}
            {activeTab === tab && <motion.div layoutId="settings-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-bfl-primary" />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div className="card p-8 max-w-3xl">
      <h2 className="text-xl font-semibold mb-5">个人资料</h2>
      <div className="flex items-center gap-5 mb-8">
        <img src="https://i.pravatar.cc/80" alt="avatar" className="w-24 h-24 rounded-full" />
        <div>
          <motion.button 
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            更换头像
          </motion.button>
          <p className="text-sm text-bfl-text-dim mt-2">支持 JPG, PNG, GIF, 不超过 5MB</p>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <label className="text-base font-medium">昵称</label>
          <input type="text" defaultValue="陈宣任" className="mt-2 w-full text-base border border-bfl-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-bfl-primary" />
        </div>
        <div>
          <label className="text-base font-medium">邮箱</label>
          <input type="email" defaultValue="chen.xuanren@example.com" className="mt-2 w-full text-base border border-bfl-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-bfl-primary" />
        </div>
        <div className="pt-5">
          <motion.button 
            className="px-5 py-2.5 text-base rounded-lg bg-bfl-primary text-white font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            保存更改
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-8">
      <div className="card p-8 max-w-3xl">
        <h2 className="text-xl font-semibold mb-5">修改密码</h2>
        <div className="space-y-5">
          <div>
            <label className="text-base font-medium">当前密码</label>
            <input type="password" placeholder="请输入当前密码" className="mt-2 w-full text-base border border-bfl-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-bfl-primary" />
          </div>
          <div>
            <label className="text-base font-medium">新密码</label>
            <input type="password" placeholder="请输入新密码" className="mt-2 w-full text-base border border-bfl-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-bfl-primary" />
          </div>
          <div>
            <label className="text-base font-medium">确认新密码</label>
            <input type="password" placeholder="请再次输入新密码" className="mt-2 w-full text-base border border-bfl-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-bfl-primary" />
          </div>
          <div className="pt-5">
            <motion.button className="px-5 py-2.5 text-base rounded-lg bg-bfl-primary text-white font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>更新密码</motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreferencesSettings() {
  const [theme, setTheme] = useState('system');
  return (
    <div className="card p-8 max-w-3xl">
      <h2 className="text-xl font-semibold mb-5">偏好设置</h2>
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium">语言</label>
          <select className="mt-2 w-full text-base border border-bfl-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-bfl-primary bg-white">
            <option>中文 (简体)</option>
            <option>English</option>
          </select>
        </div>
        <div>
          <label className="text-base font-medium">主题</label>
          <div className="mt-2 flex gap-4">
            <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-lg border ${theme==='light' ? 'border-bfl-primary ring-1 ring-bfl-primary' : 'border-bfl-border'}`}>浅色</button>
            <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-lg border ${theme==='dark' ? 'border-bfl-primary ring-1 ring-bfl-primary' : 'border-bfl-border'}`}>深色</button>
            <button onClick={() => setTheme('system')} className={`px-4 py-2 rounded-lg border ${theme==='system' ? 'border-bfl-primary ring-1 ring-bfl-primary' : 'border-bfl-border'}`}>跟随系统</button>
          </div>
        </div>
        <div>
          <label className="text-base font-medium">邮件通知</label>
          <div className="mt-2 space-y-3">
            <div className="flex items-center justify-between"><p>产品更新</p><Switch on /></div>
            <div className="flex items-center justify-between"><p>活动通知</p><Switch on /></div>
            <div className="flex items-center justify-between"><p>每周简报</p><Switch /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BillingSettings() {
  const plans = [
    { name: '个人版', price: '¥29/月', features: ['无限项目', '基础AI融合', '导出为Markdown'], current: false },
    { name: '团队版', price: '¥99/月', features: ['个人版所有功能', '团队协作', '共享资料库'], current: true },
    { name: '企业版', price: '联系我们', features: ['团队版所有功能', '私有化部署', '定制化支持'], current: false },
  ];
  return (
    <div>
      <div className="card p-8 mb-6">
        <h2 className="text-xl font-semibold mb-2">当前套餐</h2>
        <p className="text-4xl font-bold">¥99 <span className="text-base font-normal text-bfl-text-dim">/月</span></p>
        <p className="text-sm text-bfl-text-dim mt-1">您的团队版套餐将于 2024年8月20日 到期。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((p, i) => (
          <div key={i} className={`card p-6 flex flex-col ${p.current ? 'border-bfl-primary ring-1 ring-bfl-primary' : ''}`}>
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-2xl font-bold mt-2">{p.price}</p>
            <ul className="text-sm text-bfl-text-dim space-y-2 mt-4 flex-1">
              {p.features.map((f, fi) => <li key={fi} className="flex items-start gap-2"><CheckCircle size={14} className="mt-0.5 text-green-500" /><span>{f}</span></li>)}
            </ul>
            <button className={`w-full mt-6 py-2 rounded-lg font-medium ${p.current ? 'bg-bfl-surface-2' : 'bg-bfl-primary text-white'}`}>{p.current ? '当前套餐' : '升级'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

const Switch = ({ on }) => {
  const [isOn, setIsOn] = useState(on);
  return (
    <button onClick={() => setIsOn(!isOn)} className={`w-10 h-6 rounded-full flex items-center transition-colors ${isOn ? 'bg-bfl-primary' : 'bg-gray-300'}`}>
      <motion.div layout className="w-5 h-5 bg-white rounded-full shadow" />
    </button>
  )
}


// 资料库视图
function LibraryView() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  const files = [
    { name: '品牌Logo.svg', type: 'SVG', size: '15 KB', modified: '2小时前' },
    { name: '产品介绍.docx', type: 'DOCX', size: '1.2 MB', modified: '昨天' },
    { name: '市场调研报告.pdf', type: 'PDF', size: '5.8 MB', modified: '3天前' },
    { name: '宣传视频.mp4', type: 'MP4', size: '128 MB', modified: '上周' },
    { name: '官网设计稿.fig', type: 'FIG', size: '23 MB', modified: '2024-07-15' },
    { name: '用户访谈录音', type: 'Folder', size: '3 items', modified: '2024-07-12' },
  ];

  return (
    <div>
      {/* 顶部标题 */}
      <h1 className="text-2xl font-semibold text-bfl-text mb-2">资料库</h1>
      <p className="text-base text-bfl-text-dim mb-6">管理和复用您的所有创意资产</p>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bfl-text-dim" />
            <input type="text" placeholder="搜索文件..." className="pl-10 pr-4 py-2.5 w-72 text-base border border-bfl-border rounded-lg focus:outline-none focus:ring-1 focus:ring-bfl-primary" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={`p-2.5 rounded-md ${viewMode === 'list' ? 'bg-bfl-surface-2' : 'hover:bg-bfl-surface-2'}`} onClick={() => setViewMode('list')}><List size={18} /></button>
          <button className={`p-2.5 rounded-md ${viewMode === 'grid' ? 'bg-bfl-surface-2' : 'hover:bg-bfl-surface-2'}`} onClick={() => setViewMode('grid')}><Grid size={18} /></button>
          <motion.button 
            className="px-4 py-2.5 text-base rounded-lg bg-bfl-primary text-white flex items-center gap-2 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload size={16} /> 上传文件
          </motion.button>
        </div>
      </div>

      {/* 文件列表 - 表头 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2.5 text-sm font-medium text-bfl-text-dim border-b border-bfl-border">
        <div className="col-span-6">名称</div>
        <div className="col-span-2">类型</div>
        <div className="col-span-2">大小</div>
        <div className="col-span-2">修改日期</div>
      </div>
      
      {/* 文件列表 - 内容 */}
      <div className="divide-y divide-bfl-border">
        {files.map((file, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-bfl-surface-2 transition-colors">
            <div className="col-span-6 text-base font-medium text-bfl-text">{file.name}</div>
            <div className="col-span-2 text-sm text-bfl-text-dim">{file.type}</div>
            <div className="col-span-2 text-sm text-bfl-text-dim">{file.size}</div>
            <div className="col-span-2 text-sm text-bfl-text-dim">{file.modified}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


// 模板视图
function TemplatesView({ useTemplates }) {
  const [activeCategory, setActiveCategory] = useState('全部');
  
  const categories = ['全部', '市场营销', '产品设计', '内容创作', '个人效率'];
  
  const templates = [
    { name: '月度营销报告', desc: '快速生成包含关键指标、渠道分析和总结的月度报告。', uses: '1.2k', category: '市场营销', featured: true },
    { name: '产品发布计划', desc: '涵盖从市场调研到上线推广全流程的标准化模板。', uses: '890', category: '产品设计' },
    { name: '社交媒体内容日历', desc: '规划您未来一个月的社交媒体帖子，保持内容连贯性。', uses: '2.5k', category: '内容创作' },
    { name: '竞品分析画布', desc: '通过多个维度，系统地分析和对比竞争对手。', uses: '630', category: '市场营销' },
    { name: '用户画像构建', desc: '深入挖掘您的目标用户，定义清晰的用户画像。', uses: '1.8k', category: '产品设计', featured: true },
    { name: '博客文章生成器', desc: '输入关键词，快速生成结构完整、内容丰富的博客文章。', uses: '3.1k', category: '内容创作' },
  ];
  
  const filteredTemplates = activeCategory === '全部' ? templates : templates.filter(t => t.category === activeCategory);
  const featuredTemplate = templates.find(t => t.featured);

  return (
    <div>
      {/* 顶部标题 */}
      <h1 className="text-2xl font-semibold text-bfl-text mb-2">模板库</h1>
      <p className="text-base text-bfl-text-dim mb-6">从精心设计的模板开始，快速启动您的创意项目</p>
      
      {/* 推荐模板 */}
      {featuredTemplate && (
        <div className="mb-8 p-5 rounded-xl bg-bfl-primary-light flex items-center gap-5">
          <div className="w-14 h-14 bg-bfl-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-bfl-text text-base">本周推荐：{featuredTemplate.name}</h2>
            <p className="text-sm text-bfl-text-dim mt-1">{featuredTemplate.desc}</p>
          </div>
          <motion.button 
            onClick={useTemplates} 
            className="ml-auto px-4 py-2 text-sm rounded-lg bg-white hover:bg-bfl-surface-2 border border-bfl-border shadow-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            使用模板
          </motion.button>
        </div>
      )}

      {/* 分类筛选 */}
      <div className="flex items-center gap-3 mb-5 border-b border-bfl-border">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-2.5 text-base font-medium transition-colors relative ${activeCategory === cat ? 'text-bfl-primary' : 'text-bfl-text-dim hover:text-bfl-text'}`}
          >
            {cat}
            {activeCategory === cat && <motion.div layoutId="template-cat-indicator" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-bfl-primary" />}
          </button>
        ))}
      </div>
      
      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((t, i) => (
          <motion.div 
            key={i} 
            className="card p-5 flex flex-col justify-between"
            whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <div>
              <h3 className="font-semibold text-bfl-text text-base">{t.name}</h3>
              <p className="text-sm text-bfl-text-dim mt-2 line-clamp-2 h-10">{t.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-5">
              <span className="text-sm text-bfl-text-dim">{t.uses} 次使用</span>
              <motion.button 
                onClick={useTemplates} 
                className="px-4 py-2 text-sm rounded-lg bg-bfl-primary hover:bg-bfl-primary-500 text-white font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                使用模板
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}


// 总览视图
function OverviewView() {
  const kpis = [
    { title: '进行中的项目', value: '12', change: '+2', changeType: 'increase' },
    { title: '本周新增灵感', value: '89', change: '+15', changeType: 'increase' },
    { title: '已完成的融合', value: '45', change: '-3', changeType: 'decrease' },
    { title: '团队成员', value: '5', change: '+1', changeType: 'increase' },
  ];

  const activities = [
    { user: '张三', action: '新建了项目', target: 'AI 产品营销方案', time: '2小时前' },
    { user: '李四', action: '融合了灵感', target: '环保包装 × 科技感', time: '5小时前' },
    { user: '王五', action: '评论了', target: '用户问候流程设计', time: '昨天' },
    { user: '张三', action: '完成了项目', target: 'Q2季度社交媒体计划', time: '3天前' },
  ];

  const recentProjects = ['官网改版灵感收集', '新功能头脑风暴', '竞品分析报告'];
  const favTemplates = ['月度营销报告', '产品发布计划', '社交媒体内容日历'];

  return (
    <div>
      {/* 顶部标题 */}
      <h1 className="text-2xl font-semibold text-bfl-text mb-6">总览</h1>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i} 
            className="kpi-card"
            whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <div className="text-base text-bfl-text-dim">{kpi.title}</div>
            <div className="text-4xl font-bold text-bfl-text mt-1">{kpi.value}</div>
            <div className={`text-sm mt-1 ${kpi.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
              {kpi.change} vs 上周
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 最近动态 */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-base font-medium text-bfl-text mb-4">最近动态</h2>
          <div className="space-y-4">
            {activities.map((act, i) => (
              <div key={i} className="flex items-center text-sm">
                <span className="font-semibold text-bfl-text mr-1.5">{act.user}</span>
                <span className="text-bfl-text-dim mr-1.5">{act.action}</span>
                <a href="#" className="text-bfl-primary hover:underline truncate mr-2">{act.target}</a>
                <span className="ml-auto text-bfl-text-dim flex-shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 快速访问 */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-base font-medium text-bfl-text mb-4">最近查看</h2>
            <div className="space-y-3">
              {recentProjects.map((p, i) => (
                <a href="#" key={i} className="block text-sm text-bfl-primary hover:underline">{p}</a>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="text-base font-medium text-bfl-text mb-4">收藏的模板</h2>
            <div className="space-y-3">
              {favTemplates.map((t, i) => (
                <a href="#" key={i} className="block text-sm text-bfl-primary hover:underline">{t}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// 首页视图
function HomeView({ goLab, newProject, continueLast, useTemplates }) {
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/projects');
        setRecentProjects(data.slice(0, 3)); // Show latest 3
      } catch (error) {
        console.error('Failed to fetch projects', error);
        // On error, ensure recentProjects remains an array
        setRecentProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);
  
  return (
    <>
      {/* 顶部操作条 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-bfl-text">首页</h1>
          <p className="text-base text-bfl-text-dim mt-1">欢迎回来，开始您的创意融合之旅</p>
        </div>
        <motion.button
          onClick={goLab}
          className="px-5 py-2.5 rounded-lg bg-bfl-primary text-white flex items-center gap-2 font-medium"
          whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(60, 80, 255, 0.2)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Sparkles className="w-5 h-5" /> 进入实验室
        </motion.button>
      </div>

      {/* 快捷动作 */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard title="新建项目" desc="打开实验室从空白开始" onClick={newProject} />
        <ActionCard title="继续上次" desc="载入上次的画布状态" onClick={continueLast} />
        <ActionCard title="使用模板" desc="从常用模板快速开始" onClick={useTemplates} />
      </section>

      {/* 分区：最近项目（占位） */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-bfl-text">最近项目</h2>
          <button
            onClick={() => setActiveNav('项目')}
            className="text-sm text-bfl-primary hover:text-bfl-primary-600 transition-colors group flex items-center gap-1"
          >
            全部项目
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-1 group-hover:translate-x-0" />
          </button>
        </div>
        {loading ? (
          <p className="text-bfl-text-dim">Loading projects...</p>
        ) : recentProjects && recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentProjects.map((project) => (
              <motion.div
                key={project._id}
                className="card p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => goLab(project._id)}
                whileHover={{ y: -4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="font-medium text-bfl-text">{project.name}</div>
                <div className="text-sm text-bfl-text-dim mt-1.5">
                  上次修改: {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-bfl-text-dim">
            <p>No recent projects.</p>
            <p className="text-sm mt-1">
              {token ? "Create a new project to get started!" : "Log in to see your projects."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}

// 项目视图
function ProjectsView({ goLab }) {
  const fakeProjects = [
    { name: 'AI产品营销方案', lastModified: '2 小时前' },
    { name: '用户问候流程设计', lastModified: '昨天' },
    { name: 'Q3季度社交媒体计划', lastModified: '3 天前' },
    { name: '官网改版灵感收集', lastModified: '上周' },
    { name: '新功能头脑风暴', lastModified: '2024-07-15' },
    { name: '竞品分析报告', lastModified: '2024-07-12' },
  ];
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      {/* 顶部操作条 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-bfl-text">所有项目</h1>
          <p className="text-sm text-bfl-text-dim mt-1">管理您的所有创意项目</p>
        </div>
        <button onClick={goLab} className="px-4 py-2 rounded-xl bg-bfl-primary hover:bg-bfl-primary-500 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> 新建项目
        </button>
      </div>

      {/* 项目列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fakeProjects.map((p, i) => (
          <motion.div 
            key={i} 
            className="card p-0 flex flex-col group"
            whileHover={{ y: -5, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="aspect-[16/9] bg-bfl-surface-2 rounded-t-xl flex items-center justify-center cursor-pointer relative overflow-hidden" onClick={goLab}>
              <span className="text-xs text-bfl-text-dim z-10">项目预览图</span>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ArrowRight size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="p-4 flex items-start justify-between">
              <div>
                <a href="#/lab" className="font-medium text-bfl-text hover:text-bfl-primary transition-colors">{p.name}</a>
                <div className="text-sm text-bfl-text-dim mt-1 flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>{p.lastModified}</span>
                </div>
              </div>
              <div className="relative" ref={menuOpenFor === i ? menuRef : null}>
                <button 
                  onClick={() => setMenuOpenFor(menuOpenFor === i ? null : i)}
                  className="p-1.5 rounded-md hover:bg-bfl-surface-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal size={18} className="text-bfl-text-dim" />
                </button>
                <AnimatePresence>
                  {menuOpenFor === i && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-bfl-border z-30 overflow-hidden"
                    >
                      <button className="w-full text-left text-base px-3 py-2.5 hover:bg-bfl-surface-2">重命名</button>
                      <button className="w-full text-left text-base px-3 py-2.5 hover:bg-bfl-surface-2">复制</button>
                      <button className="w-full text-left text-base px-3 py-2.5 hover:bg-bfl-surface-2 text-red-500">删除</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm relative transition-colors ${active ? 'text-bfl-text' : 'text-bfl-text-dim'}`}
      whileHover={{ backgroundColor: '#F3F4F6' }}
    >
      {active && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute left-0 top-2 bottom-2 w-1 bg-bfl-primary rounded-r-full"
        />
      )}
      <div className={`transition-colors ${active ? 'text-bfl-primary' : ''}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
}

function ActionCard({ title, desc, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="kpi-card items-start text-left group"
      whileHover={{ y: -4, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center justify-between w-full">
        <div>
          <div className="font-medium text-bfl-text text-lg">{title}</div>
          <div className="text-sm text-bfl-text-dim mt-1">{desc}</div>
        </div>
        <motion.div
          className="transform transition-transform"
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          whileHover={{ x: 5 }}
        >
          <ArrowRight className="w-5 h-5 text-bfl-text-dim" />
        </motion.div>
      </div>
    </motion.button>
  );
}


