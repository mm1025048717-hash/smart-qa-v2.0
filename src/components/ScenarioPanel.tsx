// ============================================
// 业务场景面板 - 展示和启动业务场景
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import type { BusinessScenario } from '../types/workflow';
import { BUSINESS_SCENARIOS, getScenariosByCategory, searchScenarios } from '../services/businessScenarios';
import { getAgentById } from '../services/agents';

interface ScenarioPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioStart: (scenario: BusinessScenario, question?: string) => void;
}


const CATEGORY_LABELS: Record<string, string> = {
  sales_analysis: '销售分析',
  anomaly_diagnosis: '异常诊断',
  user_analysis: '用户分析',
  forecast_planning: '预测规划',
  operation_monitor: '运营监控',
  financial_report: '财务报表',
  market_insight: '市场洞察',
  custom: '自定义',
};

export const ScenarioPanel = ({ isOpen, onClose, onScenarioStart }: ScenarioPanelProps) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScenario, setSelectedScenario] = useState<BusinessScenario | null>(null);

  // 过滤场景
  const filteredScenarios = (() => {
    let scenarios = BUSINESS_SCENARIOS;

    // 按分类过滤
    if (selectedCategory !== 'all') {
      scenarios = getScenariosByCategory(selectedCategory as BusinessScenario['category']);
    }

    // 按关键词搜索
    if (searchKeyword.trim()) {
      scenarios = searchScenarios(searchKeyword);
    }

    return scenarios;
  })();

  // 获取所有分类
  const categories = Array.from(new Set(BUSINESS_SCENARIOS.map(s => s.category)));

  const handleScenarioClick = (scenario: BusinessScenario) => {
    setSelectedScenario(scenario);
  };

  const handleStartScenario = () => {
    if (selectedScenario) {
      onScenarioStart(selectedScenario);
      onClose();
      setSelectedScenario(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* 头部 - Apple 风格 */}
          <div className="px-6 py-5 border-b border-[#d2d2d7] flex items-center justify-between bg-[#fbfbfd]">
            <div>
              <h2 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">业务场景</h2>
              <p className="text-sm text-[#86868b] mt-0.5">选择场景，让多个 AI 员工协作完成分析</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-[#86868b]" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* 左侧：场景列表 */}
            <div className="w-1/2 border-r border-slate-200 flex flex-col">
              {/* 搜索和筛选 */}
              <div className="p-4 border-b border-slate-200 space-y-3">
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜索业务场景..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* 分类筛选 */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                    onClick={() => setSelectedCategory('all')}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      selectedCategory === 'all'
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                    )}
                  >
                    全部
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                        selectedCategory === category
                          ? 'bg-[#007AFF] text-white'
                          : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                      )}
                    >
                      {CATEGORY_LABELS[category]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 场景列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredScenarios.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>没有找到匹配的场景</p>
                  </div>
                ) : (
                  filteredScenarios.map((scenario) => (
                    <motion.div
                      key={scenario.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleScenarioClick(scenario)}
                      className={clsx(
                        'p-4 rounded-2xl cursor-pointer transition-all border',
                        selectedScenario?.id === scenario.id
                          ? 'border-[#007AFF] bg-[#007AFF]/5 shadow-sm'
                          : 'border-[#d2d2d7] bg-white hover:border-[#007AFF]/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h3 className="font-semibold text-[#1d1d1f]">{scenario.name}</h3>
                            <span className="px-2 py-0.5 bg-[#F5F5F7] text-[#86868b] text-[11px] rounded-full">
                              {CATEGORY_LABELS[scenario.category]}
                            </span>
                          </div>
                          <p className="text-sm text-[#86868b] mb-2.5 line-clamp-2">
                            {scenario.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#86868b]">
                            <span>{scenario.requiredAgents.length} 个员工</span>
                            <span>{scenario.expectedOutputs.length} 个产出</span>
                          </div>
                        </div>
                        <ChevronRight className={clsx(
                          'w-5 h-5 transition-colors',
                          selectedScenario?.id === scenario.id ? 'text-[#007AFF]' : 'text-[#d2d2d7]'
                        )} />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* 右侧：场景详情 */}
            <div className="w-1/2 flex flex-col bg-[#F5F5F7]">
              {selectedScenario ? (
                <div className="flex-1 overflow-y-auto p-6">
                  {/* 场景头部 */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                      {selectedScenario.name}
                    </h3>
                    <p className="text-[#86868b] mb-4">{selectedScenario.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedScenario.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-white border border-[#d2d2d7] rounded-full text-xs text-[#1d1d1f]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 核心问题 */}
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-[#86868b] uppercase tracking-wider mb-3">
                      核心问题
                    </h4>
                    <div className="space-y-2">
                      {selectedScenario.keyQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 bg-white rounded-xl text-sm text-[#1d1d1f] border border-[#d2d2d7]"
                        >
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 参与员工 */}
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-[#86868b] uppercase tracking-wider mb-3">
                      参与员工
                    </h4>
                    <div className="space-y-2">
                      {selectedScenario.requiredAgents.map((ra, idx) => {
                        const agent = getAgentById(ra.agentId);
                        return (
                        <div
                          key={idx}
                          className="px-4 py-3 bg-white rounded-xl border border-[#d2d2d7]"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-[#1d1d1f]">{agent.name}</span>
                            <span className={clsx(
                              'px-2 py-0.5 text-[11px] rounded-full',
                              ra.role === 'primary'
                                ? 'bg-[#007AFF]/10 text-[#007AFF]'
                                : 'bg-[#F5F5F7] text-[#86868b]'
                            )}>
                              {ra.role === 'primary' ? '主要' : '辅助'}
                            </span>
                          </div>
                          <ul className="text-xs text-[#86868b] space-y-1">
                            {ra.responsibilities.map((resp, i) => (
                              <li key={i}>· {resp}</li>
                            ))}
                          </ul>
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 预期产出 */}
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-[#86868b] uppercase tracking-wider mb-3">
                      预期产出
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedScenario.expectedOutputs.map((output, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 bg-white rounded-xl border border-[#d2d2d7]"
                        >
                          <div className="text-sm font-medium text-[#1d1d1f] mb-1">
                            {output.name}
                          </div>
                          <div className="text-xs text-[#86868b] line-clamp-2">
                            {output.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 适用场景 */}
                  <div>
                    <h4 className="text-sm font-medium text-[#86868b] uppercase tracking-wider mb-3">
                      适用场景
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedScenario.useCases.map((useCase, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-white rounded-full text-sm text-[#1d1d1f] border border-[#d2d2d7]"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E8E8ED] flex items-center justify-center">
                      <ChevronRight className="w-8 h-8 text-[#86868b]" />
                    </div>
                    <p className="text-[#86868b]">选择一个场景查看详情</p>
                  </div>
                </div>
              )}

              {/* 底部操作栏 */}
              {selectedScenario && (
                <div className="p-5 border-t border-[#d2d2d7] bg-white">
                  <button
                    onClick={handleStartScenario}
                    className="w-full px-4 py-3.5 bg-[#007AFF] text-white rounded-xl font-medium hover:bg-[#0066CC] transition-colors"
                  >
                    启动场景
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScenarioPanel;


