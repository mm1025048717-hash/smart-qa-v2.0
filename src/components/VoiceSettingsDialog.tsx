// 语音设置对话框组件
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Gauge, Info } from 'lucide-react';

interface VoiceSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialSpeed?: number;
  initialVolume?: number;
  onSpeedChange?: (speed: number) => void;
  onVolumeChange?: (volume: number) => void;
}

export function VoiceSettingsDialog({
  isOpen,
  onClose,
  initialSpeed = 1.0,
  initialVolume = 1.0,
  onSpeedChange,
  onVolumeChange,
}: VoiceSettingsDialogProps) {
  const [speed, setSpeed] = useState(initialSpeed);
  const [volume, setVolume] = useState(initialVolume);

  useEffect(() => {
    if (isOpen) {
      setSpeed(initialSpeed);
      setVolume(initialVolume);
    }
  }, [isOpen, initialSpeed, initialVolume]);

  const handleSpeedChange = (value: number) => {
    setSpeed(value);
    onSpeedChange?.(value);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    onVolumeChange?.(value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[8px] z-[9998]"
          />
          
          {/* 对话框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* 标题栏 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5EA]">
                <h3 className="text-[18px] font-semibold text-[#1d1d1f]">
                  语音设置
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-[#F5F5F7] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-[#86868b]" />
                </button>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* 语速设置 */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className="w-5 h-5 text-[#007AFF]" />
                    <label className="text-[15px] font-medium text-[#1d1d1f]">
                      语速
                    </label>
                    <span className="text-[13px] text-[#86868b] ml-auto">
                      {speed.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.1"
                    value={speed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#E5E5EA] rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
                    style={{
                      background: `linear-gradient(to right, #007AFF 0%, #007AFF ${((speed - 0.6) / 0.9) * 100}%, #E5E5EA ${((speed - 0.6) / 0.9) * 100}%, #E5E5EA 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[11px] text-[#86868b] mt-1">
                    <span>较慢 (0.6x)</span>
                    <span>正常 (1.0x)</span>
                    <span>较快 (1.5x)</span>
                  </div>
                </div>

                {/* 音量设置 */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Volume2 className="w-5 h-5 text-[#007AFF]" />
                    <label className="text-[15px] font-medium text-[#1d1d1f]">
                      音量
                    </label>
                    <span className="text-[13px] text-[#86868b] ml-auto">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#E5E5EA] rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
                    style={{
                      background: `linear-gradient(to right, #007AFF 0%, #007AFF ${((volume - 0.5) / 1.5) * 100}%, #E5E5EA ${((volume - 0.5) / 1.5) * 100}%, #E5E5EA 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[11px] text-[#86868b] mt-1">
                    <span>较小 (50%)</span>
                    <span>正常 (100%)</span>
                    <span>较大 (200%)</span>
                  </div>
                </div>

                {/* 提示信息 */}
                <div className="bg-[#F5F9FF] border border-[#E8F0FF] rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#007AFF] mt-0.5 flex-shrink-0" />
                    <div className="text-[12px] text-[#4E5969] leading-relaxed">
                      <p className="font-medium mb-1">💡 提示</p>
                      <p className="text-[#6B7280]">
                        这些设置需要重启语音服务才能生效。当前使用的是 Cartesia TTS (Sonic-3 模型)。
                      </p>
                      <p className="text-[#6B7280] mt-2">
                        如需修改后端配置，请编辑 <code className="text-[#007AFF] bg-white px-1 py-0.5 rounded">voice-backend/voice_bot.py</code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="px-6 py-4 border-t border-[#E5E5EA] flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-[15px] font-medium text-[#007AFF] hover:bg-[#F5F5F7] rounded-lg transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


