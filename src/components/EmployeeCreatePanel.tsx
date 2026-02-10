/**
 * 员工创建面板 - 双栏布局：左侧引导输入，右侧配置表单
 * 极简苹果风，无图标无阴影；首次打开时聚光灯深入引导名称/描述/指令/创建
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DataPageSpotlight } from './DataPageSpotlight';

const CREATE_EMPLOYEE_SPOTLIGHT_KEY = 'yiwen_create_employee_spotlight_done';

const CREATE_EMPLOYEE_SPOTLIGHT_STEPS = [
  { target: '[data-tour="create-prompt"]', title: '自然语言描述', description: '在这里用一句话描述你需要的专家，例如「销售归因分析师」或「财务报表自动生成」。' },
  { target: '[data-tour="create-name"]', title: '名称', description: '为数字员工起一个易识别的名称，如「销售归因分析师」。必填。' },
  { target: '[data-tour="create-description"]', title: '描述', description: '简要说明这名专家的用途与能力，方便后续选用。必填。' },
  { target: '[data-tour="create-instructions"]', title: '指令（可选）', description: '可补充更细的行为指令，如回答风格、优先使用的数据源等。' },
  { target: '[data-tour="create-submit"]', title: '创建', description: '填好名称和描述后点击「创建」，即可在「我的专家」中使用你的数字员工。' },
];

export interface DraftEmployee {
  name: string;
  description: string;
  instructions: string;
}

const NAME_MAX = 50;
const DESC_MAX = 500;
const INSTR_MAX = 5000;

interface EmployeeCreatePanelProps {
  onClose: () => void;
  onCreate: (draft: DraftEmployee) => void;
}

export function EmployeeCreatePanel({ onClose, onCreate }: EmployeeCreatePanelProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prompt, setPrompt] = useState('');
  const [configTab, setConfigTab] = useState<'preview' | 'config'>('config');
  const [showCreateSpotlight, setShowCreateSpotlight] = useState(false);

  const canCreate = name.trim().length > 0 && description.trim().length > 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(CREATE_EMPLOYEE_SPOTLIGHT_KEY) !== 'true') {
      const t = setTimeout(() => setShowCreateSpotlight(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <DataPageSpotlight
        storageKey={CREATE_EMPLOYEE_SPOTLIGHT_KEY}
        steps={CREATE_EMPLOYEE_SPOTLIGHT_STEPS}
        forceShow={showCreateSpotlight}
        onComplete={() => setShowCreateSpotlight(false)}
      />
      {/* 顶栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA] flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="text-[13px] text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          返回
        </button>
        <h2 className="text-[15px] font-semibold text-[#1D1D1F]">
          创建数字员工
        </h2>
        <div className="w-12" />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* 左侧：引导与输入 */}
        <div className="w-full lg:w-[50%] flex flex-col border-r border-[#E5E5EA] p-6 overflow-y-auto">
          <p className="text-[15px] text-[#1D1D1F] leading-relaxed mb-4">
            嗨！我会帮你创建一个新的数据分析助手。你可以用自然语言描述需求，例如：
          </p>
          <p className="text-[14px] text-[#86868B] leading-relaxed mb-6">
            「创建一个帮助做销售归因分析的数据分析师」或「创建一个专注财务报表自动生成的员工」。
          </p>
          <p className="text-[14px] text-[#1D1D1F] font-medium mb-3">
            你想要做什么？
          </p>
          <textarea
            data-tour="create-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="告诉我你需要什么专家"
            className="w-full min-h-[120px] px-4 py-3 text-[15px] text-[#1D1D1F] placeholder:text-[#8E8E93] bg-[#F9F9FB] border border-[#E5E5EA] rounded-xl resize-none focus:outline-none focus:border-[#007AFF]/40 transition-colors"
            rows={4}
          />
          <p className="mt-4 text-[12px] text-[#86868B]">
            填写右侧配置后点击「创建」即可生成你的数字员工。
          </p>
        </div>

        {/* 右侧：配置表单 */}
        <div className="w-full lg:w-[50%] flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-[#E5E5EA] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[18px] font-semibold text-[#86868B]">
                {name.trim().slice(0, 1) || '新'}
              </div>
              <div>
                <div className="text-[15px] font-semibold text-[#1D1D1F]">
                  {name.trim() || '新员工'}
                </div>
                <div className="text-[12px] text-[#86868B]">草稿</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfigTab('preview')}
                className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                  configTab === 'preview' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                预览
              </button>
              <button
                type="button"
                onClick={() => setConfigTab('config')}
                className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                  configTab === 'config' ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'
                }`}
              >
                配置
              </button>
              <button
                type="button"
                data-tour="create-submit"
                onClick={handleCreate}
                disabled={!canCreate}
                className="px-4 py-2 text-[13px] font-medium text-white bg-[#007AFF] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>

          <div className="p-6 flex-1">
            {configTab === 'preview' ? (
              <div className="text-[14px] text-[#86868B]">
                {name.trim() || description.trim() ? (
                  <div className="space-y-3">
                    <p><span className="text-[#1D1D1F] font-medium">名称</span> {name.trim() || '—'}</p>
                    <p><span className="text-[#1D1D1F] font-medium">描述</span> {description.trim() || '—'}</p>
                    {instructions.trim() && (
                      <p><span className="text-[#1D1D1F] font-medium">指令</span> {instructions.trim().slice(0, 200)}{instructions.trim().length > 200 ? '…' : ''}</p>
                    )}
                  </div>
                ) : (
                  <p>请完成右侧配置以预览你的数字员工。</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">
                    名称 <span className="text-[#007AFF]">*</span>
                  </label>
                  <input
                    data-tour="create-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
                    placeholder="例如：销售归因分析师"
                    className="w-full px-4 py-3 text-[15px] text-[#1D1D1F] placeholder:text-[#8E8E93] bg-white border border-[#E5E5EA] rounded-xl focus:outline-none focus:border-[#007AFF]/40 transition-colors"
                  />
                  <p className="mt-1 text-[12px] text-[#86868B]">{name.length}/{NAME_MAX}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">
                    描述 <span className="text-[#007AFF]">*</span>
                  </label>
                  <textarea
                    data-tour="create-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
                    placeholder="简单描述这个专家的用途"
                    className="w-full min-h-[100px] px-4 py-3 text-[15px] text-[#1D1D1F] placeholder:text-[#8E8E93] bg-white border border-[#E5E5EA] rounded-xl resize-none focus:outline-none focus:border-[#007AFF]/40 transition-colors"
                  />
                  <p className="mt-1 text-[12px] text-[#86868B]">{description.length}/{DESC_MAX}</p>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1D1D1F] mb-2">
                    指令
                  </label>
                  <textarea
                    data-tour="create-instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value.slice(0, INSTR_MAX))}
                    placeholder="提供关于该专家行为方式的详细指令（可选）"
                    className="w-full min-h-[160px] px-4 py-3 text-[15px] text-[#1D1D1F] placeholder:text-[#8E8E93] bg-white border border-[#E5E5EA] rounded-xl resize-none focus:outline-none focus:border-[#007AFF]/40 transition-colors"
                  />
                  <p className="mt-1 text-[12px] text-[#86868B]">{instructions.length}/{INSTR_MAX}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default EmployeeCreatePanel;
