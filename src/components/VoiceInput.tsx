// 语音输入组件 - 集成到 DataAgent 对话中

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { VoiceService, VoiceServiceConfig } from '../services/voiceService';

interface VoiceInputProps {
  agentId?: string;
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export function VoiceInput({
  agentId = 'alisa',
  onTranscript,
  onError,
  disabled = false,
}: VoiceInputProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const voiceServiceRef = useRef<VoiceService | null>(null);

  useEffect(() => {
    // 初始化语音服务
    const config: VoiceServiceConfig = {
      wsUrl: import.meta.env.VITE_VOICE_WS_URL || 'ws://localhost:8765',
      agentId,
      onTranscript: (text) => {
        setTranscript(text);
        onTranscript?.(text);
      },
      onAudioData: (_audio) => {
        // 音频播放由 VoiceService 内部处理
        // isMuted 状态在 VoiceService 内部处理
      },
      onError: (error) => {
        // 静默处理连接失败，避免重复错误日志
        // UI 会通过 isConnected 状态显示连接状态
        if (!isConnected) {
          // 只在首次连接失败时记录一次
          console.warn('[VoiceInput] Voice service not available. Run: voice-backend\\启动服务.bat');
        }
        onError?.(error);
      },
      onConnected: () => {
        setIsConnected(true);
        console.log('[VoiceInput] Connected to voice service');
      },
      onDisconnected: () => {
        setIsConnected(false);
        setIsRecording(false);
      },
    };

    voiceServiceRef.current = new VoiceService(config);

    // 不自动连接，只在用户点击按钮时连接
    // 这样可以避免页面加载时产生大量错误日志
    // 如果需要自动连接，可以取消下面的注释并定义 connectTimer
    // const connectTimer = setTimeout(() => {
    //   voiceServiceRef.current?.connect().catch((error) => {
    //     // 静默处理，不输出错误
    //   });
    // }, 1000);

    // 清理：只在组件真正卸载时断开连接
    return () => {
      // 如果启用了自动连接，取消下面的注释
      // clearTimeout(connectTimer);
      // 注意：不要在这里断开连接，让连接保持活跃
      // voiceServiceRef.current?.disconnect();
    };
  }, [agentId]); // 只依赖 agentId，避免频繁重新创建

  const handleToggleRecording = async () => {
    if (!voiceServiceRef.current) return;

    // 如果未连接，尝试重新连接
    if (!isConnected) {
      try {
        console.log('[VoiceInput] Attempting to connect to voice service...');
        // 重置连接状态，允许重新尝试
        voiceServiceRef.current.resetConnectionState();
        await voiceServiceRef.current.connect();
        // 连接成功后继续
      } catch (error) {
        console.error('[VoiceInput] Failed to connect to voice service:', error);
        // 显示友好的错误提示
        const errorMessage = '无法连接到语音服务\n\n' +
          '请按以下步骤操作：\n' +
          '1. 运行: 一键启动语音服务.bat\n' +
          '2. 或运行: voice-backend\\启动服务.bat\n' +
          '3. 等待看到 "WebSocket server ready" 消息\n' +
          '4. 刷新浏览器页面（F5）\n' +
          '5. 再次点击语音按钮';
        alert(errorMessage);
        onError?.(error as Error);
        return;
      }
    }

    if (isRecording) {
      voiceServiceRef.current.stopRecording();
      setIsRecording(false);
    } else {
      try {
        await voiceServiceRef.current.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('[VoiceInput] Error starting recording:', error);
        // 处理麦克风权限错误
        if (error instanceof Error && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
          alert('需要麦克风权限才能使用语音输入。\n\n请在浏览器地址栏左侧点击权限图标，允许麦克风访问。');
        } else {
          onError?.(error as Error);
        }
      }
    }
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    voiceServiceRef.current?.setMuted(newMuted);
    console.log('[VoiceInput] Mute toggled:', newMuted);
  };

  return (
    <div className="flex items-center gap-2">
      {/* 连接状态指示器 */}
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`}
        title={
          isConnected 
            ? '已连接到语音服务' 
            : '未连接 - 请确保语音服务已启动 (ws://localhost:8765)'
        }
      />

      {/* 录音按钮 */}
      <button
        onClick={handleToggleRecording}
        disabled={disabled || isRecording}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full
          transition-all duration-200
          ${
            isRecording
              ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
              : isConnected
              ? 'bg-[#1664FF] text-white hover:bg-[#0E52D9]'
              : 'bg-gray-400 text-white hover:bg-gray-500'
          }
          ${disabled || isRecording ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={
          isRecording 
            ? '停止录音' 
            : isConnected 
            ? '开始录音' 
            : '点击连接语音服务'
        }
      >
        {isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* 静音按钮 */}
      <button
        onClick={handleToggleMute}
        disabled={disabled || !isConnected}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full
          transition-all duration-200
          ${
            isMuted
              ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
              : 'bg-[#E8F0FF] text-[#1664FF] hover:bg-[#C2E0FF]'
          }
          ${disabled || !isConnected ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isMuted ? '取消静音' : '静音'}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* 转录文本显示 */}
      {transcript && (
        <div className="flex-1 px-3 py-2 bg-white rounded-lg border border-[#E8F0FF] text-sm text-[#1D2129]">
          {transcript}
        </div>
      )}
    </div>
  );
}


