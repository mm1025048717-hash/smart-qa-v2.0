import React, { useState } from 'react';
import { Plus, Download, Settings, Search, Eye, EyeOff, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n.jsx';

/**
 * 控制栏组件
 */
export function ControlBar({ 
  onAddBubble, 
  onExport,
  onSearch,
  showHistory,
  onToggleHistory,
  performanceMode,
  onTogglePerformance
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { t } = useI18n();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleAddBubble = () => {
    const text = prompt(t('control.addPrompt'));
    if (text && text.trim()) {
      onAddBubble(text.trim());
    }
  };

  return (
    <motion.div 
      className="bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-bfl-border"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={handleAddBubble}
          className="p-2 rounded-full hover:bg-bfl-surface-2 transition-colors group"
          title={t('toolbar.addBubble')}
        >
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>

        <AnimatePresence>
          {showSearch ? (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              onSubmit={handleSearch}
              className="flex items-center"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('control.searchPlaceholder')}
                className="bg-white border border-bfl-border text-bfl-text px-3 py-1 rounded-full text-sm outline-none focus:ring-2 focus:ring-bfl-primary"
                autoFocus
                onBlur={() => {
                  if (!searchQuery) setShowSearch(false);
                }}
              />
            </motion.form>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-full hover:bg-bfl-surface-2 transition-colors group"
              title={t('control.search')}
            >
              <Search className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </button>
          )}
        </AnimatePresence>

        <div className="w-px h-6 bg-bfl-border mx-1" />

        <button
          onClick={onToggleHistory}
          className={`p-2 rounded-full transition-colors group ${
            showHistory ? 'bg-bfl-surface-2' : 'hover:bg-bfl-surface-2'
          }`}
          title={showHistory ? t('toolbar.hideHistory') : t('toolbar.showHistory')}
        >
          <History className={`w-5 h-5 ${
            showHistory ? 'text-bfl-text' : 'text-bfl-text'
          }`} />
        </button>

        <button
          onClick={onExport}
          className="p-2 rounded-full hover:bg-bfl-surface-2 transition-colors group"
          title={t('control.exportJson')}
        >
          <Download className="w-5 h-5 text-gray-400 group-hover:text-white" />
        </button>

        <button
          onClick={onTogglePerformance}
          className="p-2 rounded-full hover:bg-bfl-surface-2 transition-colors group"
          title={performanceMode ? t('toolbar.lowPerfOff') : t('toolbar.lowPerfOn')}
        >
          {performanceMode ? (
            <EyeOff className="w-5 h-5 text-orange-400" />
          ) : (
            <Eye className="w-5 h-5 text-gray-400 group-hover:text-white" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
