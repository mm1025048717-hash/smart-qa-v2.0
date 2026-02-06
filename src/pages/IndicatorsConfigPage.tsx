/**
 * 指标管理配置页 - PRD F.2.4 Lazy Load C
 * 口径统一：毛利、客单价等计算公式
 */

import { useState } from 'react';
import { ArrowLeft, Plus, Calculator, Edit2, Trash2 } from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  shortName?: string;
  formula: string;
  description: string;
  dataSource: string;
  updatedAt: string;
}

const MOCK_METRICS: Metric[] = [
  {
    id: '1',
    name: '毛利',
    shortName: '毛利',
    formula: 'SUM(收入) - SUM(成本)',
    description: '收入减去成本，不含税费',
    dataSource: 'sales_orders',
    updatedAt: '2025-02-05 14:30',
  },
  {
    id: '2',
    name: '客单价',
    shortName: '客单价',
    formula: 'SUM(订单金额) / COUNT(DISTINCT 用户ID)',
    description: '平均每用户消费金额',
    dataSource: 'sales_orders',
    updatedAt: '2025-02-04 09:00',
  },
  {
    id: '3',
    name: 'GMV',
    shortName: 'GMV',
    formula: 'SUM(订单金额)',
    description: '商品交易总额',
    dataSource: 'sales_orders',
    updatedAt: '2025-02-03 16:00',
  },
];

export default function IndicatorsConfigPage() {
  const [metrics, setMetrics] = useState<Metric[]>(MOCK_METRICS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    formula: '',
    description: '',
    dataSource: 'sales_orders',
  });

  const goBack = () => {
    window.history.pushState({}, '', '?page=main');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.formula.trim()) return;
    const now = new Date().toLocaleString('zh-CN');
    if (editingId) {
      setMetrics((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, ...form, updatedAt: now }
            : m
        )
      );
      setEditingId(null);
    } else {
      setMetrics((prev) => [
        { ...form, id: String(Date.now()), updatedAt: now },
        ...prev,
      ]);
    }
    setShowForm(false);
    setForm({ name: '', shortName: '', formula: '', description: '', dataSource: 'sales_orders' });
  };

  const startEdit = (m: Metric) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      shortName: m.shortName ?? '',
      formula: m.formula,
      description: m.description,
      dataSource: m.dataSource,
    });
    setShowForm(true);
  };

  const removeMetric = (id: string) => {
    if (confirm('确定要删除该指标吗？')) {
      setMetrics((prev) => prev.filter((m) => m.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setShowForm(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-[#4E5969] hover:text-[#1664FF] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>
            <h1 className="text-xl font-semibold text-[#1D1D1F]">指标管理</h1>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ name: '', shortName: '', formula: '', description: '', dataSource: 'sales_orders' });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0051D5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建指标
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-6">
        <p className="text-[#86909C] text-sm mb-6">
          口径统一。在这里定义「毛利」「客单价」等计算公式，AI 就不会乱算。
        </p>

        <div className="space-y-4">
          {metrics.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#E8F3FF] flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5 text-[#007AFF]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-[#1D1D1F]">{m.name}</h3>
                  <p className="mt-1 text-sm font-mono text-[#007AFF] bg-[#E8F3FF]/50 px-2 py-1 rounded inline-block">
                    {m.formula}
                  </p>
                  {m.description && (
                    <p className="mt-2 text-sm text-[#86909C]">{m.description}</p>
                  )}
                  <p className="mt-1 text-xs text-[#86909C]">数据源: {m.dataSource} · 更新于 {m.updatedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEdit(m)}
                  className="p-2 text-[#86909C] hover:text-[#007AFF] hover:bg-[#E8F3FF] rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeMetric(m.id)}
                  className="p-2 text-[#86909C] hover:text-[#F53F3F] hover:bg-[#FFECE8] rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 新建/编辑指标弹窗 */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setShowForm(false); setEditingId(null); }}>
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-semibold text-[#1D1D1F]">{editingId ? '编辑指标' : '新建指标'}</h2>
                <p className="text-sm text-[#86909C] mt-1">定义名称与计算公式，保证 AI 口径一致</p>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4E5969] mb-1">指标名称</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="如：毛利"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4E5969] mb-1">简称</label>
                    <input
                      type="text"
                      value={form.shortName}
                      onChange={(e) => setForm((f) => ({ ...f, shortName: e.target.value }))}
                      placeholder="可选"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4E5969] mb-1">计算公式</label>
                  <input
                    type="text"
                    value={form.formula}
                    onChange={(e) => setForm((f) => ({ ...f, formula: e.target.value }))}
                    placeholder="如：SUM(收入) - SUM(成本)"
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl font-mono text-sm focus:ring-2 focus:ring-[#007AFF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4E5969] mb-1">口径说明</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="可选，便于团队理解"
                    rows={2}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4E5969] mb-1">数据源表</label>
                  <input
                    type="text"
                    value={form.dataSource}
                    onChange={(e) => setForm((f) => ({ ...f, dataSource: e.target.value }))}
                    placeholder="如：sales_orders"
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="px-4 py-2.5 text-[#4E5969] hover:bg-[#F2F3F5] rounded-xl text-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0051D5]"
                  >
                    {editingId ? '保存' : '新建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
