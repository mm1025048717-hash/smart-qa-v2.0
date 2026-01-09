import React from 'react';
import { motion } from 'framer-motion';
import { List, ClipboardList, Download } from 'lucide-react';

export function FloatingButtons({ onToggleFusionLog, onToggleScenarios, onExport }) {
  const buttons = [
    { id: 'log', icon: <List size={20} />, label: '融合记录', action: onToggleFusionLog },
    { id: 'scenarios', icon: <ClipboardList size={20} />, label: '场景模板', action: onToggleScenarios },
    { id: 'export', icon: <Download size={20} />, label: '导出为Markdown', action: onExport },
  ];

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
      {buttons.map((btn, index) => (
        <motion.div
          key={btn.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="group relative"
        >
          <button
            onClick={btn.action}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
          >
            {btn.icon}
          </button>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {btn.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}


