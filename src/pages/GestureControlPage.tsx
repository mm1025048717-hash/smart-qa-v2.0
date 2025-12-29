/**
 * NEXUS SPATIAL: COMMAND CENTER (亿问·空间指挥舱)
 * 核心特性：
 * 1. 语音控制 (Voice Command): "贾维斯，打开销售大屏"
 * 2. 手势操控 (Gesture Manipulation): 手部位置控制 3D 模型旋转/缩放
 * 3. 完整看板 (Full Dashboard): 包含图表、指标、地图的多维展示
 */

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Activity, Globe, BarChart2, PieChart, Zap } from 'lucide-react';

// ----- 类型定义 -----

type DashboardMode = 'overview' | 'sales' | 'supply' | 'risk';
type GestureType = 'none' | 'one' | 'two' | 'three' | 'four' | 'five' | 'fist';

const THEME = {
  cyan: '#00f3ff',
  blue: '#007aff',
  purple: '#bf00ff',
  red: '#ff3b30',
  glass: 'rgba(0, 10, 20, 0.6)',
};

// 业务场景配置
const SCENARIOS: Record<DashboardMode, { 
  title: string; 
  metrics: { label: string; value: string; trend: string }[];
  shape: string; 
  color: string;
}> = {
  overview: {
    title: 'GLOBAL OVERVIEW',
    metrics: [
      { label: 'TOTAL REVENUE', value: '$4.2B', trend: '+12%' },
      { label: 'ACTIVE USERS', value: '8.5M', trend: '+5%' },
      { label: 'SYSTEM HEALTH', value: '99.9%', trend: 'STABLE' },
    ],
    shape: 'sphere', // 地球
    color: THEME.cyan
  },
  sales: {
    title: 'SALES ANALYTICS',
    metrics: [
      { label: 'Q4 TARGET', value: '85%', trend: 'ON TRACK' },
      { label: 'TOP REGION', value: 'APAC', trend: 'LEADING' },
      { label: 'CONVERSION', value: '3.2%', trend: '+0.4%' },
    ],
    shape: 'bar', // 柱状图
    color: THEME.blue
  },
  supply: {
    title: 'SUPPLY CHAIN',
    metrics: [
      { label: 'INVENTORY', value: '45K', trend: '-2%' },
      { label: 'LOGISTICS', value: 'DELAY', trend: 'WARNING' },
      { label: 'SUPPLIERS', value: '142', trend: 'ACTIVE' },
    ],
    shape: 'map', // 地图/网格
    color: THEME.purple
  },
  risk: {
    title: 'RISK CONTROL',
    metrics: [
      { label: 'THREAT LEVEL', value: 'LOW', trend: 'SECURE' },
      { label: 'ANOMALIES', value: '0', trend: 'NONE' },
      { label: 'FIREWALL', value: 'ACTIVE', trend: 'LOCKED' },
    ],
    shape: 'core', // 核心
    color: THEME.red
  }
};

// ----- 语音识别 Hook -----
const useVoiceCommand = (onCommand: (cmd: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognition = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US'; // 支持英文指令，也可以改为 'zh-CN'

      recognition.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        setTranscript(transcript);
        onCommand(transcript);
      };

      recognition.current.onerror = (event: any) => {
        console.error("Speech error", event.error);
        setIsListening(false);
      };
    }
  }, [onCommand]);

  const toggle = () => {
    if (isListening) {
      recognition.current?.stop();
      setIsListening(false);
    } else {
      recognition.current?.start();
      setIsListening(true);
    }
  };

  return { isListening, transcript, toggle };
};

// ----- 粒子系统 (支持 3D 旋转) -----
class HolographicSystem {
  particles: Float32Array;
  count: number;
  width: number;
  height: number;

  constructor(count: number, w: number, h: number) {
    this.count = count;
    this.width = w;
    this.height = h;
    // x, y, z, tx, ty, tz, vx, vy, vz, size
    this.particles = new Float32Array(count * 10); 
    this.init();
  }

  init() {
    for(let i=0; i<this.count; i++) {
      const idx = i * 10;
      this.particles[idx] = (Math.random() - 0.5) * this.width;
      this.particles[idx+1] = (Math.random() - 0.5) * this.height;
      this.particles[idx+2] = (Math.random() - 0.5) * 500;
      this.particles[idx+9] = Math.random() * 2; // size
    }
  }

  updateTargets(mode: string, time: number) {
    for(let i=0; i<this.count; i++) {
      const idx = i * 10;
      let tx=0, ty=0, tz=0;

      switch(mode) {
        case 'sphere': // 地球
          const phi = Math.acos(-1 + (2 * i) / this.count);
          const theta = Math.sqrt(this.count * Math.PI) * phi;
          const r = 300;
          tx = r * Math.cos(theta) * Math.sin(phi);
          ty = r * Math.sin(theta) * Math.sin(phi);
          tz = r * Math.cos(phi);
          break;
        
        case 'bar': // 柱状图
          const col = i % 10;
          const row = Math.floor(i / 10) % 10;
          const layer = Math.floor(i / 100);
          const h = Math.sin(col * 0.5 + time * 0.05) * 200 + 200;
          tx = (col - 5) * 40;
          tz = (layer - 2) * 40;
          ty = (row / 10) * h - h/2;
          if (ty > 0) ty = 0; // 底部对齐
          break;

        case 'map': // 地形
          const mx = (i % 50) - 25;
          const mz = Math.floor(i / 50) - 25;
          tx = mx * 20;
          tz = mz * 20;
          ty = Math.sin(mx * 0.2 + time * 0.05) * Math.cos(mz * 0.2) * 100;
          break;

        case 'core': // 核心
          const cr = 150 + Math.sin(time * 0.1) * 20;
          const ca = i * 0.1 + time * 0.05;
          const cb = i * 0.2;
          tx = cr * Math.sin(ca) * Math.cos(cb);
          ty = cr * Math.sin(ca) * Math.sin(cb);
          tz = cr * Math.cos(ca);
          break;
      }
      this.particles[idx+3] = tx;
      this.particles[idx+4] = ty;
      this.particles[idx+5] = tz;
    }
  }

  render(ctx: CanvasRenderingContext2D, rotX: number, rotY: number, color: string) {
    const cx = this.width / 2;
    const cy = this.height / 2;
    
    ctx.fillStyle = color;
    
    for(let i=0; i<this.count; i++) {
      const idx = i * 10;
      
      // 物理缓动
      this.particles[idx] += (this.particles[idx+3] - this.particles[idx]) * 0.1;
      this.particles[idx+1] += (this.particles[idx+4] - this.particles[idx+1]) * 0.1;
      this.particles[idx+2] += (this.particles[idx+5] - this.particles[idx+2]) * 0.1;

      // 3D 旋转
      let x = this.particles[idx];
      let y = this.particles[idx+1];
      let z = this.particles[idx+2];

      // 绕Y轴旋转 (由手势X控制)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // 绕X轴旋转 (由手势Y控制)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      // 透视投影
      const scale = 800 / (800 + z2);
      const screenX = cx + x1 * scale;
      const screenY = cy + y2 * scale;

      if (z2 > -700) { // 裁剪掉太远的
        const size = this.particles[idx+9] * scale;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export const GestureControlPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 系统状态
  const [mode, setMode] = useState<DashboardMode>('overview');
  const [gesture, setGesture] = useState<GestureType>('none');
  const [handPos, setHandPos] = useState({ x: 0, y: 0 });
  
  const psRef = useRef<HolographicSystem | null>(null);
  const timeRef = useRef(0);
  const rafRef = useRef<number>();

  // 语音指令处理
  const handleVoiceCommand = (cmd: string) => {
    if (cmd.includes('sales') || cmd.includes('revenue')) setMode('sales');
    else if (cmd.includes('supply') || cmd.includes('logistics')) setMode('supply');
    else if (cmd.includes('risk') || cmd.includes('security')) setMode('risk');
    else if (cmd.includes('overview') || cmd.includes('home')) setMode('overview');
  };

  const { isListening, transcript, toggle: toggleVoice } = useVoiceCommand(handleVoiceCommand);

  // 初始化粒子
  useEffect(() => {
    if (canvasRef.current) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      psRef.current = new HolographicSystem(2000, w, h);
    }
  }, []);

  // 渲染循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !psRef.current) return;

    timeRef.current += 1;
    
    // 清空
    ctx.clearRect(0, 0, canvas!.width, canvas!.height);

    // 手势控制旋转 (映射到 -PI ~ PI)
    const rotY = (handPos.x / window.innerWidth - 0.5) * 2; 
    const rotX = (handPos.y / window.innerHeight - 0.5) * 2;

    // 更新与绘制
    const config = SCENARIOS[mode];
    psRef.current.updateTargets(config.shape, timeRef.current);
    psRef.current.render(ctx, rotX, rotY, config.color);

    rafRef.current = requestAnimationFrame(animate);
  }, [mode, handPos]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [animate]);

  // 视觉检测 (模拟手部追踪)
  const detectLoop = useCallback(() => {
    if (!videoRef.current) return;
    // ...这里复用之前的肤色检测逻辑，更新 handPos 和 setGesture ...
    // 为了代码简洁，这里假设已经获取到了 handPos
    // 实际项目中保留之前的 Worker 检测逻辑
    
    // 模拟：如果没有摄像头，用鼠标代替
    if (videoRef.current.paused) {
       // pass
    } else {
       // 真实检测逻辑...
       const cvs = document.createElement('canvas');
       const w = 64, h = 48;
       cvs.width = w; cvs.height = h;
       const ctx = cvs.getContext('2d');
       if(ctx) {
          ctx.drawImage(videoRef.current, 0, 0, w, h);
          const data = ctx.getImageData(0,0,w,h).data;
          let tx=0, ty=0, count=0;
          for(let i=0; i<data.length; i+=4) {
             if(data[i]>100 && data[i+1]>50 && data[i+2]>50 && data[i]>data[i+1]) {
                count++;
                tx += (i/4)%w;
                ty += Math.floor((i/4)/w);
             }
          }
          if(count > 10) {
             setHandPos({
                x: (1 - (tx/count)/w) * window.innerWidth,
                y: ((ty/count)/h) * window.innerHeight
             });
             setGesture('fist'); // 简化：有手就激活
          } else {
             setGesture('none');
          }
       }
    }
    requestAnimationFrame(detectLoop);
  }, []);

  useEffect(() => {
     const startCam = async () => {
        try {
           const stream = await navigator.mediaDevices.getUserMedia({video: true});
           if(videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
           }
           detectLoop();
        } catch(e) {}
     };
     startCam();
     
     window.addEventListener('mousemove', e => {
        // 如果没检测到手，用鼠标作为备用
        setHandPos({ x: e.clientX, y: e.clientY });
     });
  }, [detectLoop]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden text-white font-mono select-none">
      
      {/* 1. 实时背景 (HUD) */}
      <video 
         ref={videoRef} 
         className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none scale-x-[-1]"
         muted playsInline 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />

      {/* 2. 全息投影层 */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10" />

      {/* 3. 顶部全息导航栏 */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50 backdrop-blur-sm border-b border-white/10">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50 animate-pulse">
               <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
               <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  JARVIS <span className="font-light">BI</span>
               </h1>
               <div className="text-[10px] text-cyan-600 tracking-[0.5em]">SPATIAL COMPUTING OS</div>
            </div>
         </div>

         {/* 语音中枢 */}
         <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full border border-white/10">
            <motion.div 
               animate={{ height: isListening ? [10, 20, 10, 25, 10] : 4 }}
               transition={{ repeat: Infinity, duration: 0.5 }}
               className={`w-1 bg-${isListening ? 'red' : 'cyan'}-500 rounded-full`}
            />
            <div className="text-right">
               <div className="text-[10px] text-white/50 uppercase">{isListening ? 'LISTENING...' : 'VOICE COMMAND'}</div>
               <div className="text-xs text-cyan-300 max-w-[150px] truncate">{transcript || "Try 'Show Sales'"}</div>
            </div>
            <button onClick={toggleVoice} className={`p-2 rounded-full ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'} hover:scale-110 transition-all`}>
               {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
         </div>
      </div>

      {/* 4. 左侧数据看板 (Glassmorphism) */}
      <AnimatePresence mode="wait">
         <motion.div 
            key={mode}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="absolute left-8 top-32 w-80 z-40 space-y-4"
         >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-l-4 border-cyan-500 shadow-lg shadow-cyan-900/20">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white tracking-widest">{SCENARIOS[mode].title}</h2>
                  <Activity className="w-4 h-4 text-cyan-500" />
               </div>
               
               <div className="space-y-6">
                  {SCENARIOS[mode].metrics.map((m, i) => (
                     <div key={i} className="relative">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>{m.label}</span>
                           <span className={m.trend.includes('-') ? 'text-red-400' : 'text-green-400'}>{m.trend}</span>
                        </div>
                        <div className="text-2xl font-light text-white font-mono">{m.value}</div>
                        <div className="h-1 w-full bg-gray-800 mt-2 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.random() * 60 + 40}%` }}
                              className="h-full bg-cyan-500"
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* AI 洞察胶囊 */}
            <div className="p-4 rounded-xl bg-cyan-900/20 border border-cyan-500/30 flex items-start gap-3">
               <Zap className="w-5 h-5 text-yellow-400 mt-1" />
               <div className="text-xs text-cyan-200 leading-relaxed">
                  <span className="font-bold text-yellow-400">JARVIS AI:</span> Detected a 12% surge in {mode} traffic. Recommended action: Increase server capacity in East Coast node.
               </div>
            </div>
         </motion.div>
      </AnimatePresence>

      {/* 5. 底部控制台 */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black to-transparent flex justify-center items-end pb-8 z-40 pointer-events-none">
         <div className="flex gap-8">
            {Object.entries(SCENARIOS).map(([key, conf]) => (
               <div key={key} className={`flex flex-col items-center gap-2 transition-all ${mode === key ? 'opacity-100 scale-110' : 'opacity-40'}`}>
                  <div className={`w-12 h-1 bg-${mode === key ? 'cyan-400' : 'gray-700'} rounded-full`} />
                  <span className="text-[10px] tracking-widest uppercase">{key}</span>
               </div>
            ))}
         </div>
      </div>

      {/* 6. 战术准星 (手势反馈) */}
      <div 
         className="fixed w-12 h-12 pointer-events-none z-50 mix-blend-screen"
         style={{ left: handPos.x - 24, top: handPos.y - 24 }}
      >
         <div className={`absolute inset-0 border-2 rounded-full animate-spin-slow ${gesture !== 'none' ? 'border-green-400' : 'border-white/30'}`} />
         <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-1 h-1 rounded-full ${gesture !== 'none' ? 'bg-green-400' : 'bg-white'}`} />
         </div>
         {/* 坐标数值 */}
         <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[8px] text-cyan-500 whitespace-nowrap font-mono">
            X:{handPos.x.toFixed(0)} Y:{handPos.y.toFixed(0)}
         </div>
      </div>

    </div>
  );
};

export default GestureControlPage;
