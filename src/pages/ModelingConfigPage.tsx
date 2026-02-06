/**
 * 业务建模配置页 - PRD F.2.4 Lazy Load B
 * 模型列表、语义类型与同义词、动态 SQL
 */

import { useState } from 'react';
import { ArrowLeft, ChevronRight, Table, Tag } from 'lucide-react';

interface ModelField {
  id: string;
  name: string;
  semanticType: 'string' | 'number' | 'amount' | 'date' | 'dimension' | 'metric';
  synonyms: string[];
}

interface DataModel {
  id: string;
  name: string;
  tableName: string;
  description: string;
  dynamicSql: boolean;
  fields: ModelField[];
  updatedAt: string;
}

const SEMANTIC_TYPES = [
  { value: 'string', label: '文本' },
  { value: 'number', label: '数值' },
  { value: 'amount', label: '金额' },
  { value: 'date', label: '时间' },
  { value: 'dimension', label: '维度' },
  { value: 'metric', label: '指标' },
];

const MOCK_MODELS: DataModel[] = [
  {
    id: '1',
    name: '销售订单',
    tableName: 'sales_orders',
    description: '订单主表，含金额、时间、地区等',
    dynamicSql: true,
    updatedAt: '2025-02-05 14:30',
    fields: [
      { id: 'f1', name: 'order_id', semanticType: 'string', synonyms: ['订单号', '单号'] },
      { id: 'f2', name: 'amount', semanticType: 'amount', synonyms: ['金额', '销售额', 'GMV'] },
      { id: 'f3', name: 'order_date', semanticType: 'date', synonyms: ['下单日期', '日期'] },
      { id: 'f4', name: 'region', semanticType: 'dimension', synonyms: ['地区', '区域'] },
    ],
  },
  {
    id: '2',
    name: '商品主数据',
    tableName: 'products',
    description: '商品信息表',
    dynamicSql: false,
    updatedAt: '2025-02-04 09:00',
    fields: [
      { id: 'f5', name: 'product_id', semanticType: 'string', synonyms: ['商品ID'] },
      { id: 'f6', name: 'price', semanticType: 'amount', synonyms: ['单价', '价格'] },
    ],
  },
];

export default function ModelingConfigPage() {
  const [models, setModels] = useState<DataModel[]>(MOCK_MODELS);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ modelId: string; fieldId: string } | null>(null);

  const goBack = () => {
    window.history.pushState({}, '', '?page=main');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const toggleDynamicSql = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, dynamicSql: !m.dynamicSql } : m))
    );
  };

  const updateField = (modelId: string, fieldId: string, patch: Partial<ModelField>) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id !== modelId) return m;
        return {
          ...m,
          fields: m.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
        };
      })
    );
    setEditingField(null);
  };

  const detailModel = detailId ? models.find((m) => m.id === detailId) : null;

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
            <h1 className="text-xl font-semibold text-[#1D1D1F]">业务建模</h1>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-6">
        <p className="text-[#86909C] text-sm mb-6">
          模型列表管理所有向 Agent 暴露的表结构。进入详情可为字段配置语义类型与同义词，开启动态 SQL 允许 AI 自由组合字段。
        </p>

        {!detailModel ? (
          /* 模型列表 */
          <div className="space-y-3">
            {models.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex items-center justify-between hover:border-[#007AFF]/40 transition-colors cursor-pointer"
                onClick={() => setDetailId(m.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3FF] flex items-center justify-center">
                    <Table className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1D1D1F]">{m.name}</h3>
                    <p className="text-sm text-[#86909C]">{m.tableName} · {m.fields.length} 个字段</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm text-[#4E5969]">动态 SQL</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={m.dynamicSql}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDynamicSql(m.id);
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${m.dynamicSql ? 'bg-[#007AFF]' : 'bg-[#E5E7EB]'}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${m.dynamicSql ? 'left-6' : 'left-1'}`}
                      />
                    </button>
                  </label>
                  <ChevronRight className="w-5 h-5 text-[#86909C]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 详情：语义增强 */
          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDetailId(null)}
                  className="p-2 -ml-2 text-[#4E5969] hover:bg-[#F2F3F5] rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-[#1D1D1F]">{detailModel.name}</h2>
                  <p className="text-sm text-[#86909C]">{detailModel.tableName}</p>
                </div>
              </div>
              <label className="flex items-center gap-2">
                <span className="text-sm text-[#4E5969]">动态 SQL</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={detailModel.dynamicSql}
                  onClick={() => toggleDynamicSql(detailModel.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${detailModel.dynamicSql ? 'bg-[#007AFF]' : 'bg-[#E5E7EB]'}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${detailModel.dynamicSql ? 'left-6' : 'left-1'}`}
                  />
                </button>
              </label>
            </div>
            <p className="px-5 py-2 text-sm text-[#86909C] bg-[#F7F8FA]">
              为字段配置语义类型与同义词，AI 才能听懂业务黑话。
            </p>
            <table className="w-full">
              <thead className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">字段名</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">语义类型</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">同义词</th>
                  <th className="px-5 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {detailModel.fields.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F7F8FA]/50">
                    <td className="px-5 py-3 font-mono text-sm text-[#1D1D1F]">{f.name}</td>
                    <td className="px-5 py-3">
                      {editingField?.modelId === detailModel.id && editingField?.fieldId === f.id ? (
                        <select
                          autoFocus
                          value={f.semanticType}
                          onChange={(e) =>
                            updateField(detailModel.id, f.id, {
                              semanticType: e.target.value as ModelField['semanticType'],
                            })
                          }
                          onBlur={() => setEditingField(null)}
                          className="border border-[#E5E7EB] rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-[#007AFF] outline-none"
                        >
                          {SEMANTIC_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-sm text-[#4E5969] cursor-pointer hover:text-[#007AFF]"
                          onClick={() => setEditingField({ modelId: detailModel.id, fieldId: f.id })}
                        >
                          {SEMANTIC_TYPES.find((t) => t.value === f.semanticType)?.label ?? f.semanticType}
                          <Tag className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-[#4E5969]">
                        {f.synonyms.length ? f.synonyms.join('、') : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setEditingField({ modelId: detailModel.id, fieldId: f.id })}
                        className="text-xs text-[#007AFF] hover:underline"
                      >
                        编辑同义词
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
