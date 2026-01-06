// 贾维斯风格语音对话界面
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, VolumeX, Settings, ArrowLeft } from 'lucide-react';
import { VoiceService, VoiceServiceConfig } from '../services/voiceService';
import { ALL_AGENTS as AGENTS, getAgentById } from '../services/agents/index';
import { Message } from '../types';
import { VoiceSettingsDialog } from '../components/VoiceSettingsDialog';

interface VoiceMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTranscribing?: boolean; // 是否正在转录
}

export function VoiceChatPage({ 
  onClose, 
  initialAgentId = 'alisa' 
}: { 
  onClose: () => void;
  initialAgentId?: string;
}) {
  const [currentAgentId, setCurrentAgentId] = useState(initialAgentId);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0); // 音频电平，用于波形动画
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const voiceServiceRef = useRef<VoiceService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryTimerRef = useRef<number | null>(null);
  const currentAgent = getAgentById(currentAgentId);

  // 添加消息
  const addMessage = useCallback((text: string, isUser: boolean) => {
    const newMessage: VoiceMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // 初始化语音服务
  useEffect(() => {
    const config: VoiceServiceConfig = {
      wsUrl: import.meta.env.VITE_VOICE_WS_URL || 'ws://localhost:8765',
      agentId: currentAgentId,
      onTranscript: (text) => {
        setCurrentTranscript(text);
        // 如果转录完成（有完整句子），添加到消息列表
        if (text && text.trim() && !text.endsWith('...') && text.length > 3) {
          addMessage(text, true);
          setCurrentTranscript('');
        }
      },
      onAudioData: (audio) => {
        // 音频播放由 VoiceService 内部处理，静音状态由 setMuted 控制
      },
      onError: (error) => {
        // 只在首次错误时记录，避免重复日志
        if (!isConnected && !connectionError) {
          setConnectionError('语音服务未启动');
          setIsRetrying(true);
          // 自动重试连接（每8秒尝试一次，减少频率）
          if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
          }
          retryTimerRef.current = window.setTimeout(() => {
            if (voiceServiceRef.current && !isConnected) {
              voiceServiceRef.current.resetConnectionState();
              voiceServiceRef.current.connect().catch(() => {
                // 静默处理，继续重试
              });
            }
          }, 8000);
        }
      },
      onConnected: () => {
        setIsConnected(true);
        setConnectionError(null);
        setIsRetrying(false);
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
        console.log('[VoiceChat] Connected to voice service');
        // 同步静音状态（确保未静音）
        if (voiceServiceRef.current) {
          voiceServiceRef.current.setMuted(isMuted);
          // 确保 AudioContext 可以播放（需要用户交互后）
          console.log('[VoiceChat] Audio will be enabled after user interaction');
        }
      },
      onDisconnected: () => {
        setIsConnected(false);
        setIsRecording(false);
      },
    };

    voiceServiceRef.current = new VoiceService(config);

    // 自动连接
    const connectTimer = setTimeout(() => {
      voiceServiceRef.current?.connect().catch((error) => {
        console.warn('[VoiceChat] Connection failed:', error);
      });
    }, 500);

    return () => {
      clearTimeout(connectTimer);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      voiceServiceRef.current?.disconnect();
      // AudioContext 的清理在音频分析的 useEffect 中处理
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentAgentId, addMessage]);

  // 同步静音状态到 VoiceService
  useEffect(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.setMuted(isMuted);
    }
  }, [isMuted]);

  // 音频电平分析（用于波形动画）
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (isRecording) {
      const startAudioAnalysis = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(stream);
          
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.8;
          source.connect(analyser);
          
          audioContextRef.current = audioContext;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          
          const updateAudioLevel = () => {
            if (analyserRef.current && isRecording) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setAudioLevel(Math.min(1, average / 100)); // 归一化到 0-1，调整敏感度
              animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            } else {
              setAudioLevel(0);
            }
          };
          
          updateAudioLevel();
        } catch (error) {
          console.error('[VoiceChat] Audio analysis error:', error);
          setAudioLevel(0);
        }
      };

      startAudioAnalysis();
    } else {
      setAudioLevel(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // 安全地关闭 AudioContext
      if (audioContextRef.current) {
        try {
          if (audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
          }
        } catch (error) {
          // 忽略关闭错误
        }
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    };
  }, [isRecording]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscript]);

  const handleToggleRecording = async () => {
    if (!voiceServiceRef.current) return;

    // 确保 AudioContext 可以播放（需要用户交互）
    // 通过用户点击来激活音频播放
    try {
      // 创建一个临时的 AudioContext 来激活音频播放权限
      const tempContext = new AudioContext();
      if (tempContext.state === 'suspended') {
        await tempContext.resume();
      }
      await tempContext.close();
    } catch (error) {
      console.warn('[VoiceChat] Audio activation:', error);
    }

    if (!isConnected) {
      try {
        voiceServiceRef.current.resetConnectionState();
        await voiceServiceRef.current.connect();
      } catch (error) {
        const errorMsg = '无法连接到语音服务\n\n' +
          '请按以下步骤操作：\n' +
          '1. 运行: 一键启动语音服务.bat\n' +
          '2. 或运行: voice-backend\\启动服务.bat\n' +
          '3. 等待看到 "WebSocket server ready" 消息\n' +
          '4. 刷新浏览器页面（F5）\n' +
          '5. 再次点击麦克风按钮';
        alert(errorMsg);
        return;
      }
    }

    if (isRecording) {
      voiceServiceRef.current.stopRecording();
      setIsRecording(false);
      // 如果有当前转录文本，添加到消息
      if (currentTranscript.trim()) {
        addMessage(currentTranscript, true);
        setCurrentTranscript('');
      }
    } else {
      try {
        await voiceServiceRef.current.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('[VoiceChat] Error starting recording:', error);
        if (error instanceof Error && error.name === 'NotAllowedError') {
          alert('需要麦克风权限才能使用语音输入。');
        }
      }
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    voiceServiceRef.current?.setMuted(newMuted);
    console.log('[VoiceChat] Mute toggled:', newMuted);
  };

  const handleAgentChange = async (agentId: string) => {
    setCurrentAgentId(agentId);
    // 重新连接语音服务
    if (voiceServiceRef.current) {
      try {
        // 先断开连接
        voiceServiceRef.current.disconnect();
        // 等待断开完成后再连接
        await new Promise(resolve => setTimeout(resolve, 300));
        // 重新连接，静默处理错误（避免在切换时显示错误）
        await voiceServiceRef.current.connect();
      } catch (error) {
        // 静默处理连接错误，不输出到控制台（切换代理时的连接失败是正常的）
        console.debug('[VoiceChat] Reconnection during agent change:', error);
      }
    }
  };

  // 生成波形条的高度
  const getWaveBarHeight = (index: number, total: number) => {
    if (!isRecording || audioLevel === 0) {
      return 4; // 最小高度
    }
    const baseHeight = 20;
    const variation = Math.sin((Date.now() / 100) + (index * 0.5)) * audioLevel * 30;
    return Math.max(4, baseHeight + variation);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#FAFBFC] via-white to-[#FAFBFC] z-50 flex flex-col">
      {/* 顶部栏 - 极致简约，苹果风格 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-2xl border-b border-[#E5E7EB]/30">
        <button
          onClick={onClose}
          className="p-2 -ml-1 hover:bg-[#F5F5F7] active:bg-[#E8E8ED] rounded-full transition-all duration-150"
          title="返回"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-[#3A3A3C]" />
        </button>

        {/* 数字员工选择 - 苹果风格分段控件，更精致 */}
        <div className="flex items-center gap-0.5 bg-[#F5F5F7] p-0.5 rounded-[10px]">
          {AGENTS.slice(0, 5).map((agent) => (
            <button
              key={agent.id}
              onClick={() => handleAgentChange(agent.id)}
              className={`px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-all duration-150 ${
                currentAgentId === agent.id
                  ? 'bg-white text-[#000000] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                  : 'text-[#8E8E93] hover:text-[#000000]'
              }`}
            >
              {agent.name}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="p-2 -mr-1 hover:bg-[#F5F5F7] active:bg-[#E8E8ED] rounded-full transition-all duration-150"
        >
          <X className="w-[18px] h-[18px] text-[#3A3A3C]" />
        </button>
      </div>

      {/* 主内容区 - 调整位置，确保完整显示 */}
      <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-8 relative overflow-y-auto">
        {/* 数字员工头像和状态 - 苹果级别精致设计 */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 20 }}
          animate={{ 
            scale: 1,
            opacity: 1,
            y: 0
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.4 }
          }}
          className="relative mb-10"
        >
          {/* 头像 - 超大尺寸，极致阴影 */}
          <div className="relative">
            <div className="w-44 h-44 rounded-full overflow-hidden shadow-[0_25px_80px_-12px_rgba(0,0,0,0.25)] ring-[0.5px] ring-[#E5E7EB]/60">
              {currentAgent?.avatar ? (
                <img
                  src={currentAgent.avatar}
                  alt={currentAgent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#007AFF] via-[#0051D5] to-[#007AFF] flex items-center justify-center">
                  <span className="text-6xl font-medium text-white tracking-tight">
                    {currentAgent?.name?.[0] || 'A'}
                  </span>
                </div>
              )}
            </div>
            
            {/* 连接状态指示器 - 更精致 */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className={`absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full border-[3.5px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-500 ${
                isConnected ? 'bg-[#34C759]' : 'bg-[#C7C7CC]'
              }`} 
            />
            
            {/* 录音时的脉冲动画 - 苹果风格柔和动画 */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-[1.5px] border-[#007AFF]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1]
                }}
              />
            )}
          </div>

          {/* 员工信息 - 完美排版，精致字体 */}
          <div className="mt-6 text-center space-y-1.5">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-[34px] font-semibold text-[#000000] tracking-[-0.5px] leading-tight"
            >
              {currentAgent?.name || 'Alisa'}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-[#8E8E93] text-[15px] font-normal leading-relaxed"
            >
              {currentAgent?.title || '核心算法·自然语言理解'}
            </motion.p>
          </div>
        </motion.div>

        {/* 语音波形动画 - 苹果级别精致动画 */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-[2px] mb-8 h-16"
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-[2.5px] bg-[#007AFF] rounded-full"
                animate={{
                  height: getWaveBarHeight(i, 28),
                }}
                transition={{
                  duration: 0.12,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1]
                }}
              />
            ))}
          </motion.div>
        )}

        {/* 当前转录文本 - 苹果级别精致卡片 */}
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 px-7 py-5 bg-white rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E5E7EB]/40 max-w-lg"
          >
            <p className="text-[#000000] text-[17px] leading-[1.5] font-normal tracking-[-0.2px]">{currentTranscript}</p>
            <div className="flex items-center gap-2 mt-4">
              <motion.div 
                className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[#8E8E93] text-[13px] font-normal">正在识别...</span>
            </div>
          </motion.div>
        )}

        {/* 对话历史 - 只在有消息时显示 */}
        {messages.length > 0 && (
          <div className="w-full max-w-2xl px-4 mb-6 min-h-0">
            <div className="space-y-3">
            {messages.length === 0 && !currentTranscript && !connectionError && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-[#8E8E93] py-8"
              >
                <p className="text-[17px] font-normal tracking-[-0.2px]">准备好开始语音对话</p>
              </motion.div>
            )}
            
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[78%] px-4 py-3 rounded-[18px] ${
                    message.isUser
                      ? 'bg-[#007AFF] text-white shadow-[0_2px_12px_rgba(0,122,255,0.3)]'
                      : 'bg-white text-[#000000] border border-[#E5E7EB]/60 shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <p className="text-[15px] leading-[1.5] font-normal tracking-[-0.2px]">{message.text}</p>
                  <span className={`text-[11px] mt-2 block ${
                    message.isUser ? 'text-white/75' : 'text-[#8E8E93]'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        )}

        {/* 底部控制栏 - 苹果级别精致设计 */}
        <div className="w-full max-w-2xl px-4 pb-8 pt-4">
          <div className="flex items-center justify-center gap-6">
            {/* 静音按钮 - 精致设计 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleMute}
              disabled={!isConnected}
              className={`p-4 rounded-full transition-all duration-150 ${
                isMuted
                  ? 'bg-[#F5F5F7] text-[#8E8E93]'
                  : 'bg-white text-[#007AFF] hover:bg-[#F5F5F7] border border-[#E5E7EB]/40'
              } ${!isConnected ? 'opacity-35 cursor-not-allowed' : ''} shadow-[0_2px_10px_rgba(0,0,0,0.08)]`}
              title={isMuted ? '取消静音' : '静音'}
            >
              {isMuted ? (
                <VolumeX className="w-[20px] h-[20px]" />
              ) : (
                <Volume2 className="w-[20px] h-[20px]" />
              )}
            </motion.button>

            {/* 主录音按钮 - 超大尺寸，极致阴影 */}
            <motion.button
              whileHover={isConnected && !isRecording ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleRecording}
              disabled={!isConnected}
              className={`
                w-28 h-28 rounded-full
                flex items-center justify-center
                transition-all duration-200
                ${
                  isRecording
                    ? 'bg-[#FF3B30] text-white shadow-[0_12px_40px_rgba(255,59,48,0.45)]'
                    : isConnected
                    ? 'bg-[#007AFF] text-white shadow-[0_12px_40px_rgba(0,122,255,0.35)]'
                    : 'bg-[#C7C7CC] text-white shadow-[0_6px_20px_rgba(0,0,0,0.12)] cursor-not-allowed'
                }
              `}
              title={isRecording ? '停止录音' : isConnected ? '开始录音' : '等待连接...'}
            >
              {isRecording ? (
                <MicOff className="w-12 h-12" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </motion.button>

            {/* 设置按钮 - 精致设计 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSettingsOpen(true)}
              className="p-4 rounded-full bg-white text-[#8E8E93] hover:bg-[#F5F5F7] hover:text-[#007AFF] transition-all duration-150 border border-[#E5E7EB]/40 shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
              title="设置"
            >
              <Settings className="w-[20px] h-[20px]" />
            </motion.button>
          </div>

          {/* 状态提示 - 简化设计 */}
          <div className="mt-4 text-center">
            {!isConnected && connectionError && (
              <motion.div 
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="px-5 py-3 bg-[#FFF5F5] border border-[#FFE5E5] rounded-[14px] max-w-sm mx-auto"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[#8E8E93] text-[12px] font-normal">正在连接...</p>
                </div>
                <p className="text-[#D70015] text-[12px] font-medium">
                  语音服务未启动
                </p>
              </motion.div>
            )}
            {isConnected && !isRecording && !connectionError && (
              <p className="text-[#8E8E93] text-[12px] font-normal">
                点击麦克风开始说话
              </p>
            )}
            {isRecording && (
              <p className="text-[#007AFF] text-[12px] font-medium">
                正在录音中...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 语音设置对话框 */}
      <VoiceSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSpeed={1.0}
        initialVolume={1.0}
      />
    </div>
  );
}

