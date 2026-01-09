import React from 'react';
import { Plus, Trash2, Edit3, Shuffle, Save, Search, Eye, EyeOff, History, Star, Database } from 'lucide-react';
import { useI18n } from '../i18n.jsx';

export function LeftToolbar({ 
  onAdd, 
  onShuffle, 
  onDeleteSelected, 
  onSaveLayout,
  onSearch,
  showHistory,
  onToggleHistory,
  performanceMode,
  onTogglePerformance,
  onToggleFavorites,
  onOpenKnowledge
}) {
  const { t } = useI18n();
  const btn = 'w-10 h-10 flex items-center justify-center rounded-xl border border-bfl-border bg-white hover:bg-bfl-surface-2';
  const icon = 'w-5 h-5 text-bfl-text-dim';
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 p-2 bg-white/70 backdrop-blur rounded-2xl border border-bfl-border shadow-sm">
      <button className={btn} title={t('toolbar.addBubble')} onClick={onAdd}><Plus className={icon} /></button>
      <button className={btn} title={t('toolbar.searchBubble')} onClick={() => {
        const q = prompt(t('toolbar.searchPrompt'));
        if (q && q.trim()) onSearch?.(q.trim());
      }}><Search className={icon} /></button>
      <button className={btn} title={t('toolbar.randomize')} onClick={onShuffle}><Shuffle className={icon} /></button>
      <div className="w-10 h-px bg-bfl-border mx-auto" />
      <button className={btn} title={t('toolbar.deleteSelected')} onClick={onDeleteSelected}><Trash2 className={icon} /></button>
      <button className={btn} title={t('toolbar.saveLayout')} onClick={onSaveLayout}><Save className={icon} /></button>
      <button className={btn} title={t('toolbar.favorites','我的收藏')} onClick={onToggleFavorites}><Star className={icon} /></button>
      <button className={btn} title={t('toolbar.knowledge','添加行业数据/知识库') } onClick={onOpenKnowledge}><Database className={icon} /></button>
      <div className="w-10 h-px bg-bfl-border mx-auto" />
      <button className={`${btn} ${showHistory ? 'bg-bfl-surface-2' : ''}`} title={showHistory ? t('toolbar.hideHistory') : t('toolbar.showHistory')} onClick={onToggleHistory}>
        <History className={icon} />
      </button>
      <button className={btn} title={performanceMode ? t('toolbar.lowPerfOff') : t('toolbar.lowPerfOn')} onClick={onTogglePerformance}>
        {performanceMode ? <EyeOff className={icon} /> : <Eye className={icon} />}
      </button>
    </div>
  );
}


