import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, Upload, X, Download, Trash2 } from 'lucide-react';
import { generateLocalSummary } from '../utils/summary';

export function BubbleDetailPanel({ bubble, open, onClose, onUploadFiles, onRemoveAttachment }) {
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const MAX = 20 * 1024 * 1024; // 20MB 限制
    const list = Array.from(files).filter(f => {
      if (f.size > MAX) {
        alert(`文件超出 20MB 限制：${f.name}`);
        return false;
      }
      return true;
    });
    const items = await Promise.all(list.map(async (f) => {
      const url = URL.createObjectURL(f);
      let textPreview = '';
      if ((f.type || '').startsWith('text') || /json|xml|html/.test(f.type)) {
        try {
          const reader = new FileReader();
          const content = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsText(f.slice(0, 128 * 1024)); // 预览最多128KB
          });
          textPreview = String(content || '').slice(0, 8000);
        } catch {}
      }
      return {
        id: `${bubble.id}-att-${Date.now()}-${f.name}`,
        name: f.name,
        type: f.type || 'application/octet-stream',
        size: f.size || 0,
        url,
        textPreview,
      };
    }));
    onUploadFiles(bubble.id, items);
  };

  return (
    <AnimatePresence>
      {open && bubble && (
        <motion.div
          drag
          dragMomentum={false}
          className="absolute left-2 md:left-28 top-20 z-30 bg-white border border-bfl-border rounded-xl shadow-lg md:w-[360px] w-[92vw] max-w-[92vw] cursor-move"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-bfl-border">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-bfl-text-dim" />
              <h3 className="text-sm font-semibold text-bfl-text">{bubble.text}</h3>
            </div>
            <button className="text-bfl-text-dim" onClick={onClose}>×</button>
          </div>

          <div
            className="m-4 p-4 border-2 border-dashed border-bfl-border rounded-lg text-center text-sm text-bfl-text-dim bg-bfl-surface-2"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          >
            拖拽文件到此处，或
            <button
              className="ml-1 underline text-bfl-primary"
              onClick={() => inputRef.current?.click()}
            >
              点击上传
            </button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* 左右布局：左侧摘要，右侧附件 */}
          <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            <div>
              <div className="text-xs text-bfl-text-dim mb-2">自动摘要</div>
              <div className="text-sm whitespace-pre-line bg-bfl-surface-2 border border-bfl-border rounded-lg p-3">
                {generateLocalSummary(
                  bubble.text,
                  (bubble.attachments || []).map(a => a.name),
                  (bubble.attachments || []).map(a => a.textPreview || '')
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-[38vh] overflow-auto custom-scrollbar">
            {(bubble.attachments || []).length === 0 ? (
              <div className="text-xs text-bfl-text-dim">暂无附件</div>
            ) : (
              bubble.attachments.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 border border-bfl-border rounded-lg bg-white">
                  <div className="min-w-0">
                    <div className="text-sm text-bfl-text truncate">{a.name}</div>
                    <div className="text-xs text-bfl-text-dim">{(a.size/1024).toFixed(1)} KB · {a.type || '文件'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={a.url} download={a.name} className="p-1 rounded hover:bg-bfl-surface-2" title="下载">
                      <Download className="w-4 h-4 text-bfl-text-dim" />
                    </a>
                    <button onClick={() => onRemoveAttachment(bubble.id, a.id)} className="p-1 rounded hover:bg-bfl-surface-2" title="移除">
                      <Trash2 className="w-4 h-4 text-bfl-text-dim" />
                    </button>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


