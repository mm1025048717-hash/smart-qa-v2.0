// DataAgent 语音服务 - WebSocket 客户端
// 连接 Pipecat 后端，实现语音输入/输出

export interface VoiceServiceConfig {
  wsUrl?: string;
  agentId?: string;
  onTranscript?: (text: string) => void;
  onAudioData?: (audio: ArrayBuffer) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export class VoiceService {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private isRecording = false;
  private isMuted = false;
  private gainNode: GainNode | null = null;
  private config: VoiceServiceConfig;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 2; // 减少到2次，避免过多尝试
  private lastErrorTime = 0;
  private errorThrottleMs = 10000; // 增加到10秒，减少错误频率
  private shouldRetry = true; // 是否应该重试连接
  private audioQueue: AudioBuffer[] = []; // 音频播放队列
  private isPlaying = false; // 是否正在播放
  private nextPlayTime = 0; // 下一个音频块的播放时间
  private recordingAudioContext: AudioContext | null = null; // 录音专用的 AudioContext
  private scriptProcessor: ScriptProcessorNode | null = null; // ScriptProcessorNode 引用
  private audioSource: MediaStreamAudioSourceNode | null = null; // 音频源引用

  constructor(config: VoiceServiceConfig = {}) {
    this.config = {
      wsUrl: config.wsUrl || 'ws://localhost:8765',
      agentId: config.agentId || 'alisa',
      ...config,
    };
  }

  // 重置连接状态（允许重新尝试连接）
  resetConnectionState(): void {
    this.connectionAttempts = 0;
    this.shouldRetry = true;
    this.lastErrorTime = 0;
  }

  // 初始化 AudioContext（在用户交互时调用）
  private initAudioContext(): void {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      console.log('[VoiceService] Creating AudioContext');
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;
      this.gainNode.connect(this.audioContext.destination);
      
      // 如果 AudioContext 处于 suspended 状态，尝试 resume（需要在用户交互后）
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('[VoiceService] AudioContext resumed, state:', this.audioContext?.state);
        }).catch((error) => {
          console.warn('[VoiceService] Failed to resume AudioContext:', error);
        });
      }
      console.log('[VoiceService] AudioContext created, state:', this.audioContext.state);
    }
  }

  // 连接到 WebSocket 服务器
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果已经达到最大尝试次数，检查是否应该重试
      if (this.connectionAttempts >= this.maxConnectionAttempts && !this.shouldRetry) {
        const err = new Error(
          `语音服务不可用。请启动语音服务后重试。\n` +
          `运行: voice-backend\\启动服务.bat 或 一键启动语音服务.bat`
        );
        reject(err);
        return;
      }

      try {
        const wsUrl = this.config.wsUrl || 'ws://localhost:8765';
        this.connectionAttempts++;
        
        // 只在首次连接时记录日志
        if (this.connectionAttempts === 1) {
          console.log(`[VoiceService] Connecting to ${wsUrl}...`);
        }

        // 如果已经有 WebSocket 连接，先关闭
        if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
          this.ws.close();
        }

        this.ws = new WebSocket(wsUrl);
        // 设置 binaryType 为 'arraybuffer' 以接收音频数据
        this.ws.binaryType = 'arraybuffer';

        // 设置连接超时（10秒）
        const timeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            const err = new Error(`WebSocket connection timeout: ${wsUrl}`);
            // 节流错误日志
            this.logErrorOnce(err.message);
            // 只在首次超时时调用 onError
            if (this.connectionAttempts === 1) {
              this.config.onError?.(err);
            }
            reject(err);
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          // 连接成功，重置所有状态
          this.connectionAttempts = 0;
          this.lastErrorTime = 0;
          this.shouldRetry = true;
          console.log('[VoiceService] WebSocket connected');
          // 预先初始化 AudioContext（在用户交互后）
          this.initAudioContext();
          this.config.onConnected?.();
          resolve();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          // 达到最大尝试次数后，停止自动重试
          if (this.connectionAttempts >= this.maxConnectionAttempts) {
            this.shouldRetry = false;
          }
          // 完全静默处理错误，不输出到控制台
          const err = new Error('语音服务不可用');
          // 只在首次错误时调用 onError，避免重复触发
          if (this.connectionAttempts === 1) {
            this.config.onError?.(err);
          }
          reject(err);
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          // 只在正常关闭时记录日志
          if (event.code === 1000 || event.code === 1001) {
            console.log('[VoiceService] WebSocket disconnected', event.code, event.reason);
          }
          this.config.onDisconnected?.();
          // 如果不是正常关闭，不在这里重连，让用户手动触发
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
      } catch (error) {
        console.error('[VoiceService] Connection exception:', error);
        reject(error);
      }
    });
  }

  // 节流错误日志，避免重复输出
  private logErrorOnce(message: string) {
    const now = Date.now();
    if (now - this.lastErrorTime > this.errorThrottleMs) {
      // 使用 console.debug 而不是 console.warn，减少控制台噪音
      // 只在开发环境显示详细错误
      if (import.meta.env.DEV) {
        console.debug('[VoiceService]', message);
      }
      this.lastErrorTime = now;
    }
  }

  // 处理 WebSocket 消息
  private handleMessage(event: MessageEvent) {
    if (event.data instanceof ArrayBuffer) {
      // 检查是否是 WAV 格式（以 "RIFF" 开头）
      const dataView = new DataView(event.data);
      const isWav = event.data.byteLength >= 4 && 
                    String.fromCharCode(dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2), dataView.getUint8(3)) === 'RIFF';
      
      if (isWav) {
        // WAV 音频数据，直接播放
        console.log('[VoiceService] Received WAV audio data:', event.data.byteLength, 'bytes');
        this.config.onAudioData?.(event.data);
        this.playAudio(event.data);
      } else {
        // 尝试解析为 JSON 文本消息（转录结果等）
        try {
          const text = new TextDecoder().decode(event.data);
          const data = JSON.parse(text);
          if (data.type === 'transcript') {
            this.config.onTranscript?.(data.text);
          } else if (import.meta.env.DEV) {
            // 只在开发环境记录其他文本消息
            console.log('[VoiceService] Received text message:', data);
          }
        } catch (e) {
          // 不是文本，可能是 Protobuf 编码的非音频帧（metrics, RTVI 等）
          // 这些帧不需要处理，静默忽略
          if (import.meta.env.DEV) {
            // 只在开发环境记录，使用 debug 级别
            console.debug('[VoiceService] Ignoring non-audio binary frame (likely Protobuf)', event.data.byteLength, 'bytes');
          }
        }
      }
    } else if (typeof event.data === 'string') {
      // 文本数据（转录结果等）
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'transcript') {
          this.config.onTranscript?.(data.text);
        } else if (import.meta.env.DEV) {
          console.log('[VoiceService] Received text message:', data);
        }
      } catch (e) {
        // 普通文本消息
        this.config.onTranscript?.(event.data);
      }
    } else if (event.data instanceof Blob) {
      // 处理 Blob 类型的音频数据
      event.data.arrayBuffer().then((buffer) => {
        console.log('[VoiceService] Received audio blob:', buffer.byteLength, 'bytes');
        this.config.onAudioData?.(buffer);
        this.playAudio(buffer);
      });
    } else if (import.meta.env.DEV) {
      // 只在开发环境记录未知消息类型
      console.debug('[VoiceService] Unknown message type:', typeof event.data);
    }
  }

  // 播放音频
  private async playAudio(audioData: ArrayBuffer) {
    if (this.isMuted) {
      console.log('[VoiceService] Audio muted, skipping playback');
      return;
    }

    if (!audioData || audioData.byteLength === 0) {
      console.warn('[VoiceService] Empty audio data, skipping');
      return;
    }

    try {
      // 确保 AudioContext 已创建且处于运行状态
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.initAudioContext();
      }

      // 如果 AudioContext 被暂停，尝试恢复它（需要在用户交互后）
      if (this.audioContext && this.audioContext.state === 'suspended') {
        console.log('[VoiceService] Resuming suspended AudioContext');
        try {
          await this.audioContext.resume();
          console.log('[VoiceService] AudioContext resumed, state:', this.audioContext.state);
        } catch (error) {
          console.warn('[VoiceService] Failed to resume AudioContext (may need user interaction):', error);
          // 如果恢复失败，仍然尝试解码（可能会失败，但不阻塞）
        }
      }

      if (!this.audioContext || this.audioContext.state === 'closed') {
        console.warn('[VoiceService] AudioContext not available, skipping audio playback');
        return;
      }

      // 解码 WAV 音频数据
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0));
      console.log('[VoiceService] Audio decoded:', {
        channels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate,
        duration: audioBuffer.duration.toFixed(2) + 's',
        length: audioBuffer.length
      });
      
      // 将音频缓冲添加到队列
      this.audioQueue.push(audioBuffer);
      console.log('[VoiceService] Audio buffer added to queue, queue length:', this.audioQueue.length);
      
      // 如果当前没有播放，开始播放队列
      if (!this.isPlaying) {
        this.playAudioQueue();
      }
    } catch (error) {
      console.error('[VoiceService] Error processing audio:', error);
      if (error instanceof Error) {
        console.error('[VoiceService] Error details:', {
          name: error.name,
          message: error.message
        });
      }
    }
  }

  // 播放音频队列
  private playAudioQueue() {
    if (this.isPlaying || this.audioQueue.length === 0 || !this.audioContext || this.audioContext.state === 'closed') {
      return;
    }

    this.isPlaying = true;
    this.playNextAudioBuffer();
  }

  // 播放下一个音频缓冲
  private playNextAudioBuffer() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.isPlaying = false;
      this.audioQueue = [];
      this.nextPlayTime = 0;
      console.warn('[VoiceService] AudioContext closed, clearing queue');
      return;
    }

    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.nextPlayTime = 0;
      console.log('[VoiceService] Audio queue playback completed');
      return;
    }

    const audioBuffer = this.audioQueue.shift();
    if (!audioBuffer) {
      this.playNextAudioBuffer();
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode!);

      // 计算播放时间，确保连续播放
      const currentTime = this.audioContext.currentTime;
      const startTime = Math.max(currentTime, this.nextPlayTime);

      source.onended = () => {
        // 当前音频播放完成，播放下一个
        this.playNextAudioBuffer();
      };

      source.onerror = (error) => {
        console.error('[VoiceService] Audio source error:', error);
        // 即使出错也继续播放下一个
        this.playNextAudioBuffer();
      };

      source.start(startTime);
      this.nextPlayTime = startTime + audioBuffer.duration;
      console.log('[VoiceService] Playing audio buffer, duration:', audioBuffer.duration.toFixed(2), 's');
    } catch (error) {
      console.error('[VoiceService] Error playing audio from queue:', error);
      // 出错时继续播放下一个
      this.playNextAudioBuffer();
    }
  }

  // 设置静音状态
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : 1;
    }
  }

  // 获取静音状态
  getMuted(): boolean {
    return this.isMuted;
  }

  // 开始录音
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.warn('[VoiceService] Already recording');
      return;
    }

    try {
      // 在用户交互时初始化 AudioContext（解锁音频播放）
      await this.initAudioContext();
      
      // 请求麦克风权限
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.isRecording = true;

      // 创建录音专用的 AudioContext（与播放用的分开）
      this.recordingAudioContext = new AudioContext({ sampleRate: 16000 });
      this.audioSource = this.recordingAudioContext.createMediaStreamSource(this.mediaStream);
      this.scriptProcessor = this.recordingAudioContext.createScriptProcessor(4096, 1, 1);

      let audioChunkCount = 0;
      this.scriptProcessor.onaudioprocess = (e) => {
        if (this.isRecording && this.ws?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          
          // 转换为 PCM 16-bit
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // 发送音频数据到服务器
          try {
            this.ws?.send(pcmData.buffer);
            audioChunkCount++;
            // 每100个chunk记录一次日志（避免日志过多）
            if (audioChunkCount % 100 === 0) {
              console.log(`[VoiceService] Sent ${audioChunkCount} audio chunks`);
            }
          } catch (error) {
            console.error('[VoiceService] Error sending audio data:', error);
          }
        }
      };

      this.audioSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.recordingAudioContext.destination);

      console.log('[VoiceService] Recording started, AudioContext sampleRate:', this.recordingAudioContext.sampleRate);
    } catch (error) {
      console.error('[VoiceService] Error starting recording:', error);
      this.isRecording = false;
      // 清理资源
      this.cleanupRecording();
      throw error;
    }
  }

  // 清理录音资源
  private cleanupRecording(): void {
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
        this.scriptProcessor = null;
      } catch (e) {
        console.warn('[VoiceService] Error disconnecting script processor:', e);
      }
    }

    if (this.audioSource) {
      try {
        this.audioSource.disconnect();
        this.audioSource = null;
      } catch (e) {
        console.warn('[VoiceService] Error disconnecting audio source:', e);
      }
    }

    if (this.recordingAudioContext) {
      try {
        if (this.recordingAudioContext.state !== 'closed') {
          this.recordingAudioContext.close();
        }
        this.recordingAudioContext = null;
      } catch (e) {
        console.warn('[VoiceService] Error closing recording AudioContext:', e);
      }
    }
  }

  // 停止录音
  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;

    // 清理录音相关的音频处理节点
    this.cleanupRecording();

    // 停止媒体流
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop();
        console.log('[VoiceService] Stopped media track:', track.kind, track.label);
      });
      this.mediaStream = null;
    }

    console.log('[VoiceService] Recording stopped');
  }

  // 断开连接
  disconnect(): void {
    this.stopRecording();

    // 清空音频队列
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextPlayTime = 0;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // 只关闭播放用的 AudioContext，录音用的已经在 stopRecording 中关闭
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
      this.gainNode = null;
    }
  }

  // 检查是否已连接
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // 检查是否正在录音
  getIsRecording(): boolean {
    return this.isRecording;
  }
}


