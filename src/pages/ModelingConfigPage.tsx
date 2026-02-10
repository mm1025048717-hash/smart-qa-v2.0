/**
 * 业务建模配置页 - PRD F.2.4 Lazy Load B
 * 模型列表、语义类型与同义词、动态 SQL
 */

import { useState } from 'react';
import { ArrowLeft, ChevronRight, Table, Tag } from 'lucide-react';
import { DataPageSpotlight } from '../components/DataPageSpotlight';

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

  const storageKey = 'yiwen_spotlight_modeling_v2';
  // 第一次进入时自动显示引导（由 DataPageSpotlight 内部处理）

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <DataPageSpotlight
        storageKey={storageKey}
        steps={[
          {
            target: '[data-tour="modeling-intro"]',
            title: '业务建模',
            description: '模型列表管理所有向 Agent 暴露的表结构。这里定义 AI 能「看到」哪些数据表，是数据查询的基础。',
          },
          {
            target: '[data-tour="modeling-first-card"]',
            title: '模型卡片',
            description: '每个卡片代表一个数据模型（表）。点击卡片进入详情，可配置字段的语义类型与同义词。',
          },
          {
            target: '[data-tour="modeling-dynamic-sql"]',
            title: '动态 SQL 开关',
            description: '开启后 AI 可自由组合该表字段生成复杂查询；关闭则仅能查询预定义的指标，更可控但灵活性降低。',
          },
        ]}
      />
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
        <p className="text-[#86909C] text-sm mb-6" data-tour="modeling-intro">
          模型列表管理所有向 Agent 暴露的表结构。进入详情可为字段配置语义类型与同义词，开启动态 SQL 允许 AI 自由组合字段。
        </p>

        {!detailModel ? (
          /* 模型列表 */
          <div className="space-y-3">
            {models.map((m, idx) => (
              <div
                key={m.id}
                data-tour={idx === 0 ? 'modeling-first-card' : undefined}
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
                  <label className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()} data-tour={idx === 0 ? 'modeling-dynamic-sql' : undefined}>
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
          <>
            <DataPageSpotlight
              storageKey={`yiwen_spotlight_modeling_detail_v2_${detailModel.id}`}
              steps={[
                { target: '[data-tour="model-detail-header"]', title: '模型详情', description: '这是模型的详情页面。可以在这里配置字段的语义类型和同义词，让 AI 更好地理解业务术语。' },
                { target: '[data-tour="model-detail-dynamic-sql"]', title: '动态 SQL', description: '在详情页也可以控制动态 SQL 开关。开启后 AI 可自由组合字段；关闭后仅能查预置指标。' },
                { target: '[data-tour="model-field-table"]', title: '字段列表', description: '这里列出模型的所有字段。每个字段可配置语义类型（如金额、时间、维度）和同义词（业务黑话）。' },
                { target: '[data-tour="model-field-semantic"]', title: '语义类型', description: '点击语义类型可修改。正确的语义类型帮助 AI 理解字段含义，如「金额」会自动处理货币格式。' },
                { target: '[data-tour="model-field-synonym"]', title: '同义词配置', description: '点击「编辑同义词」可添加业务术语。如 amount 字段添加「销售额」「GMV」，用户问这些词 AI 都能理解。' },
              ]}
            />
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between" data-tour="model-detail-header">
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
                <label className="flex items-center gap-2" data-tour="model-detail-dynamic-sql">
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
              <table className="w-full" data-tour="model-field-table">
                <thead className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">字段名</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">语义类型</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">同义词</th>
                    <th className="px-5 py-3 w-20" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {detailModel.fields.map((f, fIdx) => (
                    <tr key={f.id} className="hover:bg-[#F7F8FA]/50">
                      <td className="px-5 py-3 font-mono text-sm text-[#1D1D1F]">{f.name}</td>
                      <td className="px-5 py-3" data-tour={fIdx === 0 ? 'model-field-semantic' : undefined}>
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
                      <td className="px-5 py-3" data-tour={fIdx === 0 ? 'model-field-synonym' : undefined}>
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
          </>
        )}
      </main>
    </div>
  );
}
