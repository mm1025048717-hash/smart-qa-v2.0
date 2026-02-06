import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, ContentBlock } from './types';
import type { BusinessScenario } from './types/workflow';
import { Sidebar } from './components/Sidebar';
import { ChatInput } from './components/ChatInput';
import { MessageBubble } from './components/MessageBubble';
import { TestScenarioPanel } from './components/TestScenarioPanel';
import { ScenarioPanel } from './components/ScenarioPanel';
import { SimpleInputPage } from './components/SimpleInputPage';
import { InlineGuidePanel } from './components/InlineGuidePanel';
import { FloatingGuideAssistant } from './components/FloatingGuideAssistant';
// 移除 QueryConfirmationDialog 导入，改为在对话中展示
import { MobileTestPage } from './pages/MobileTestPage';
import { GestureControlPage } from './pages/GestureControlPage';
import { AttributionDemoPage } from './pages/AttributionDemoPage';
import AIDashboard from './pages/AIDashboard';
import DashboardList from './pages/DashboardList';
import { VoiceChatPage } from './pages/VoiceChatPage';
import KPICardShowcase from './pages/KPICardShowcase';
import PRDPage from './pages/PRDPage';
import DataSourceConfigPage from './pages/DataSourceConfigPage';
import ModelingConfigPage from './pages/ModelingConfigPage';
import IndicatorsConfigPage from './pages/IndicatorsConfigPage';
import { 
  createUserMessage,
  generateNarrativeResponse,
  createSystemMessage,
  hasMatchedScenario,
} from './services/narrativeGenerator';
import { RefreshCw, Smartphone, Workflow, LayoutDashboard, BarChart3 } from 'lucide-react';
import { ALL_AGENTS as AGENTS, getAgentById, getAgentByName } from './services/agents/index';
import { setAimaSystemPrompt } from './services/deepseekApi';
// 预加载爱玛系统提示词
import { getAimaSystemPrompt } from './services/agents/aima/aimaAgents';

// 在应用启动时设置爱玛系统提示词函数
setAimaSystemPrompt(getAimaSystemPrompt);
import { detectAgentSwitch } from './services/agentSwitchDetector';
import { detectIntent, isVagueIntent } from './services/intentEngine';
import { chatCompletionStream, ChatMessage, classifyIntentLLM, LLMIntentResult } from './services/deepseekApi';
import { getScenarioById } from './services/businessScenarios';
import { shouldEnableWebSearch } from './services/webSearchDetector';
import { parseRealtimeContent } from './utils/realtimeParser';
import { loadUserMemory, learnFromQuery, generateMemoryPrompt, UserMemory } from './services/userMemory';
import { usePresetResponse } from './hooks/usePresetResponse';
import { useEffect } from 'react';

// 上下文管理
interface ConversationContext {
  lastTopic?: string;
  lastMetric?: string;
  lastDimension?: string;
  drillPath: string[];
}

function App() {
  // 所有 hooks 必须在任何条件 return 之前声明
  const [messages, setMessages] = useState<Message[]>([]);
  /** CXO 引导首问后，在对话区内展示追问暗示并自动发送一次追问 */
  const [pendingTourFollowUp, setPendingTourFollowUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // 是否正在联网搜索
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [testPanelOpen, setTestPanelOpen] = useState(true);
  const [context, setContext] = useState<ConversationContext>({ drillPath: [] });
  // 移除多度确认对话框相关状态，改为在对话中展示
  const [userMemory, setUserMemory] = useState<UserMemory>(() => loadUserMemory());
  const abortControllerRef = useRef<AbortController | null>(null);
  // 业务场景相关状态
  const [scenarioPanelOpen, setScenarioPanelOpen] = useState(false);
  const [, setActiveScenario] = useState<BusinessScenario | null>(null);
  type PageType = 'main' | 'mobile' | 'gesture' | 'attribution' | 'dashboard' | 'dashboard-list' | 'voice-chat' | 'kpi-showcase' | 'prd' | 'datasource' | 'modeling' | 'indicators';
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    // 初始化时检查URL参数
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const dashboardId = params.get('id');
    const addAction = params.get('add'); // 检查是否是添加操作
    if (page === 'mobile') return 'mobile';
    if (page === 'gesture') return 'gesture';
    if (page === 'attribution') return 'attribution';
    if (page === 'dashboard-list') return 'dashboard-list';
    if (page === 'dashboard') {
      // 如果有 id 参数或 add 参数，进入具体看板；否则进入列表页
      // add=true 表示从问答页面添加卡片过来
      return (dashboardId || addAction) ? 'dashboard' : 'dashboard-list';
    }
    if (page === 'kpi-showcase') return 'kpi-showcase';
    if (page === 'prd') return 'prd';
    if (page === 'datasource') return 'datasource';
    if (page === 'modeling') return 'modeling';
    if (page === 'indicators') return 'indicators';
    return 'main';
  });

  // 监听 URL 变化，更新 currentPage
  useEffect(() => {
    const updatePageFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      const dashboardId = params.get('id');
      const addAction = params.get('add');
      
      let newPage: PageType = 'main';
      
      if (page === 'mobile') newPage = 'mobile';
      else if (page === 'gesture') newPage = 'gesture';
      else if (page === 'attribution') newPage = 'attribution';
      else if (page === 'dashboard-list') newPage = 'dashboard-list';
      else if (page === 'dashboard') {
        newPage = (dashboardId || addAction) ? 'dashboard' : 'dashboard-list';
      } else if (page === 'voice-chat') newPage = 'voice-chat';
      else if (page === 'kpi-showcase') newPage = 'kpi-showcase';
      else if (page === 'prd') newPage = 'prd';
      else if (page === 'datasource') newPage = 'datasource';
      else if (page === 'modeling') newPage = 'modeling';
      else if (page === 'indicators') newPage = 'indicators';
      
      setCurrentPage(prevPage => {
        if (prevPage !== newPage) {
          return newPage;
        }
        return prevPage;
      });
    };

    // 初始检查
    updatePageFromURL();

    // 监听 popstate 事件（浏览器前进/后退）
    window.addEventListener('popstate', updatePageFromURL);
    
    // 监听 hashchange 事件（如果使用 hash 路由）
    window.addEventListener('hashchange', updatePageFromURL);

    return () => {
      window.removeEventListener('popstate', updatePageFromURL);
      window.removeEventListener('hashchange', updatePageFromURL);
    };
  }, [currentPage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentAgentId, setCurrentAgentId] = useState<string>(AGENTS[0].id);
  const currentAgent = getAgentById(currentAgentId);

  // 处理外部跳转进来的查询（如看板点击探索、KPI展示页面）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('query');
    const scenarioParam = params.get('scenario'); // KPI展示场景的场景ID
    if (queryParam) {
      // 延迟一会等 Agent 加载和页面切换完成
      const timer = setTimeout(() => {
        // 如果有scenario参数，将其作为questionId传递，确保匹配到正确的场景响应
        const questionId = scenarioParam || undefined;
        handleSend(decodeURIComponent(queryParam), false, false, questionId);
        // 清理 URL，防止刷新重复触发
        const newUrl = window.location.pathname + (window.location.search.includes('page=') ? `?page=${params.get('page')}` : '');
        window.history.replaceState({}, '', newUrl || '/');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentPage]); // 当页面切换时也检查

  // 监听添加到看板事件（主页面）
  useEffect(() => {
    const handleAddToDashboard = (e: any) => {
      console.log('[App] 收到添加到看板事件:', e.detail);
      // 将数据存储到 sessionStorage 并跳转到看板列表页面
      // 用户在选择看板后，会跳转到看板页面并自动打开配置模态框
      const dataToStore = JSON.stringify(e.detail);
      console.log('[App] 存储数据到 sessionStorage:', dataToStore);
      sessionStorage.setItem('addToDashboardData', dataToStore);
      // 跳转到看板列表页面，让用户选择看板
      window.location.href = `?page=dashboard-list&add=true`;
    };
    
    window.addEventListener('open-add-to-dashboard', handleAddToDashboard as any);
    
    return () => {
      window.removeEventListener('open-add-to-dashboard', handleAddToDashboard as any);
    };
  }, []);
  
  // 预设响应系统 - 完全贴合《智能问答系统显示规则》
  const presetResponse = usePresetResponse();

  // 切换 Agent - 新员工主动打招呼
  const handleAgentChange = async (newAgentId: string) => {
    if (newAgentId !== currentAgentId) {
      const newAgent = getAgentById(newAgentId);
      setCurrentAgentId(newAgentId);
      
      // 新员工主动打招呼
      const greetingMessageId = `msg_${Date.now()}_greeting`;
      const greetingBlockId = `block_greeting`;
      const greetingMessage: Message = {
        id: greetingMessageId,
        role: 'assistant',
        content: [{
          id: greetingBlockId,
          type: 'text',
          data: '',
        }],
        timestamp: new Date(),
        agentId: newAgentId,
        status: 'streaming',
      };
      setMessages(prev => [...prev, greetingMessage]);

      // 调用 DeepSeek 生成个性化招呼
      const greetingPrompt = `用户刚叫你过来帮忙。请用你独特的性格和说话方式打个招呼（2-3句话），要有温度、有个性，让用户感受到你的专业和热情。

要求：
1. 展现你的性格特点（可以傲娇/热情/温柔/幽默等）
2. 简单说明你能帮什么忙
3. 主动问问用户需要什么帮助
4. 不要使用emoji
5. 不要太正式，像朋友聊天一样`;
      
      let greetingContent = '';
      await chatCompletionStream(
        [{ role: 'user', content: greetingPrompt }],
        newAgentId,
        newAgent.name,
        newAgent.title,
        (chunk: string) => {
          greetingContent += chunk;
          setMessages(prev => prev.map(m => 
            m.id === greetingMessageId 
              ? { ...m, content: [{ id: greetingBlockId, type: 'text' as const, data: greetingContent }] }
              : m
          ));
        },
        () => {
          setMessages(prev => prev.map(m => 
            m.id === greetingMessageId ? { ...m, status: 'complete' as const } : m
          ));
        },
        () => {
          // 错误时使用默认招呼
          setMessages(prev => prev.map(m => 
            m.id === greetingMessageId 
              ? { ...m, content: [{ id: greetingBlockId, type: 'text' as const, data: `你好，我是${newAgent.name}，${newAgent.title}。有什么可以帮你的？` }], status: 'complete' as const }
              : m
          ));
        }
      );
    }
  };

  // 通过名字切换 Agent（用于同事推荐）
  const handleAgentSwitchByName = async (agentName: string) => {
    const agent = getAgentByName(agentName);
    if (agent && agent.id !== currentAgentId) {
      await handleAgentChange(agent.id);
    }
  };

  // 滚动到底部（仅在用户发送消息时调用）
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 滚动到核心数据（KPI 或主要图表）
  const scrollToCoreData = (messageId: string) => {
    setTimeout(() => {
      // 查找包含核心数据的消息
      const coreDataElement = document.querySelector(`[data-message-id="${messageId}"] [data-core-data="true"]`);
      if (coreDataElement) {
        coreDataElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // 如果没有找到核心数据，滚动到底部
        scrollToBottom();
      }
    }, 300);
  };

  // 停止输出
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
    
    // 标记当前正在输出的消息为完成状态
    setMessages(prev => prev.map(m => 
      m.status === 'streaming' ? { ...m, status: 'complete' as const } : m
    ));
  };

  // 构建对话历史（用于多轮对话，包含跨员工记忆）
  const buildChatHistory = (currentMessages: Message[]): ChatMessage[] => {
    // 支持无限上下文与多轮对话：保留所有消息历史，不限制数量
    // DeepSeek支持32K tokens上下文窗口，足够支持大量对话
    // 确保上下文完整，不会因为历史截断而丢失重要信息
    const filteredMessages = currentMessages.filter(m => m.role === 'user' || m.role === 'assistant');
    
    return filteredMessages
      .map(m => {
        let content = typeof m.content === 'string' 
          ? m.content 
          : m.content?.map(b => (b.data as string) || '').join('\n') || '';
        
        // 清理可能暴露AI身份的内容，保持角色一致性
        content = content
          .replace(/我是DeepSeek/gi, `我是${currentAgent.name}`)
          .replace(/我是AI助手/gi, `我是${currentAgent.name}`)
          .replace(/由深度求索公司创造/gi, '')
          .replace(/我是一个AI/gi, `我是${currentAgent.name}`)
          .replace(/我是语言模型/gi, `我是${currentAgent.name}`)
          .replace(/作为AI/gi, `作为${currentAgent.name}`)
          .replace(/作为AI助手/gi, `作为${currentAgent.name}`);
        
        // 如果是其他员工的回复，标注是谁说的
        if (m.role === 'assistant' && m.agentId && m.agentId !== currentAgentId) {
          const otherAgent = getAgentById(m.agentId);
          return {
            role: 'assistant' as const,
            content: `[${otherAgent.name}说]: ${content}`
          };
        }
        
        return {
          role: m.role as 'user' | 'assistant',
          content
        };
      });
  };

  // 检测是否是工作流/场景调用意图
  const isWorkflowIntent = (text: string): boolean => {
    const workflowKeywords = [
      '调用工作流', '启动工作流', '运行工作流', '执行工作流',
      '启动场景', '运行场景', '执行场景', '打开场景',
      '业务场景', '场景分析', '协作分析', '多Agent',
      '让多个员工', '协同工作', '自动化分析'
    ];
    return workflowKeywords.some(keyword => text.includes(keyword));
  };

  // 🔥 增强版：检测切换 Agent 的意图 - 使用强大的意图识别引擎
  const detectAgentSwitchIntent = (text: string): { 
    agentId: string | null; 
    confidence: number;
    reason: string;
    matchType: string | null;
  } => {
    const result = detectAgentSwitch(text, currentAgentId);
    
    // 调试日志
    console.log('🎯 Agent切换意图识别:', {
      query: text,
      shouldSwitch: result.shouldSwitch,
      targetAgent: result.targetAgent?.name,
      confidence: result.confidence,
      matchType: result.matchType,
      reason: result.reason,
    });
    
    if (result.shouldSwitch && result.confidence > 0.5) {
      return {
        agentId: result.targetAgentId,
        confidence: result.confidence,
        reason: result.reason,
        matchType: result.matchType,
      };
    }
    
    return {
      agentId: null,
      confidence: 0,
      reason: result.reason,
      matchType: null,
    };
  };

  // 处理发送消息
  const handleSend = async (query: string, forceWebSearch?: boolean, skipPresetResponse?: boolean, questionId?: string) => {
    if (!query.trim() || isLoading) return;

    // 先添加用户消息
    const userMessage = createUserMessage(query, currentAgentId);
    setMessages(prev => [...prev, userMessage]);

    // 完全禁用查询确认对话框，所有对话直接调用大模型
    // 用户明确要求使用大模型进行自然对话，不再显示确认对话框
    // skipConfirmation 已移除，因为整个确认逻辑块已被禁用
    
    if (false) { // 禁用整个确认逻辑块
      try {
        const { 
          parseQueryDimensions, 
          needsConfirmation,
          needsMetricConfirmation,
          needsEmployeeConfirmation,
          getAmbiguousMetricOptions,
          getAmbiguousEmployeeOptions
        } = await import('./services/queryParser');
        
        // 优先检查模糊指标确认（销售额税前/税后）
        if (needsMetricConfirmation(query)) {
          const options = getAmbiguousMetricOptions();
          const confirmationMessage: Message = {
            id: `ambiguous-metric-${Date.now()}`,
            role: 'assistant',
            content: [
              {
                id: `ambiguous-metric-block-${Date.now()}`,
                type: 'ambiguous-selection',
                data: {
                  type: 'metric',
                  originalQuery: query,
                  options: options,
                  promptText: '系统中有销售额（税前）和销售额（税后）两个指标，您想查询哪一个？',
                },
              },
            ],
            timestamp: new Date(),
            status: 'complete',
            agentId: currentAgentId,
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
          return;
        }
        
        // 检查同名员工确认（多个张三）
        if (needsEmployeeConfirmation(query)) {
          const employeeMatch = query.match(/(张三|李四|王五|赵六)/);
          const employeeName = employeeMatch?.[1];
          if (employeeName) {
            // employeeName 在 if 检查后已确保不为 undefined
            const options = getAmbiguousEmployeeOptions(employeeName as string);
            if (options.length > 0) {
              const confirmationMessage: Message = {
                id: `ambiguous-employee-${Date.now()}`,
                role: 'assistant',
                content: [
                  {
                    id: `ambiguous-employee-block-${Date.now()}`,
                    type: 'ambiguous-selection',
                    data: {
                      type: 'employee',
                      originalQuery: query,
                      options: options,
                      promptText: `公司中有多个${employeeName}，您想查询哪一个？`,
                    },
                  },
                ],
                timestamp: new Date(),
                status: 'complete',
                agentId: currentAgentId,
              };
              
              setMessages(prev => [...prev, confirmationMessage]);
              return;
            }
          }
        }
        
        // 检查多度确认（原有逻辑）
        if (needsConfirmation(query)) {
          const dimensions = parseQueryDimensions(query);
          
          // 生成一个包含多度确认的 AI 回复消息
          const confirmationMessage: Message = {
            id: `confirmation-${Date.now()}`,
            role: 'assistant',
            content: [
              {
                id: `confirmation-block-${Date.now()}`,
                type: 'query-confirmation',
                data: {
                  originalQuery: query,
                  dimensions: dimensions,
                },
              },
            ],
            timestamp: new Date(),
            status: 'complete',
            agentId: currentAgentId,
          };
          
          setMessages(prev => [...prev, confirmationMessage]);
          return;
        }
      } catch (e) {
        console.warn('Failed to check query confirmation:', e);
      }
    } else {
      // 检查是否是模糊选择确认后的查询（销售额税前/税后或同名员工）
      const ambiguousSelectionStr = sessionStorage.getItem('ambiguousSelection');
      if (ambiguousSelectionStr) {
        try {
          const { generateAmbiguousFixedResponse } = await import('./services/queryParser');
          const ambiguousSelection = JSON.parse(ambiguousSelectionStr);
          const fixedBlocks = generateAmbiguousFixedResponse(
            ambiguousSelection.type,
            ambiguousSelection.selectedValues,
            ambiguousSelection.originalQuery
          );
          
          // 生成固定回复消息
          const fixedResponseMessage: Message = {
            id: `fixed-response-${Date.now()}`,
            role: 'assistant',
            content: fixedBlocks,
            timestamp: new Date(),
            status: 'complete',
            agentId: currentAgentId,
          };
          
          setMessages(prev => [...prev, fixedResponseMessage]);
          
          // 清除标记和数据
          sessionStorage.removeItem('skipQueryConfirmation');
          sessionStorage.removeItem('ambiguousSelection');
          return;
        } catch (e) {
          console.warn('Failed to generate ambiguous fixed response:', e);
          sessionStorage.removeItem('skipQueryConfirmation');
          sessionStorage.removeItem('ambiguousSelection');
        }
      }
      
      // 如果是多度确认后的查询，生成固定回复，不调用大模型
      const confirmedDimensionsStr = sessionStorage.getItem('confirmedDimensions');
      if (confirmedDimensionsStr) {
        try {
          const { generateFixedResponse } = await import('./services/queryParser');
          const confirmedDimensions = JSON.parse(confirmedDimensionsStr);
          const fixedBlocks = generateFixedResponse(confirmedDimensions);
          
          // 生成固定回复消息
          const fixedResponseMessage: Message = {
            id: `fixed-response-${Date.now()}`,
            role: 'assistant',
            content: fixedBlocks,
            timestamp: new Date(),
            status: 'complete',
            agentId: currentAgentId,
          };
          
          setMessages(prev => [...prev, fixedResponseMessage]);
          
          // 清除标记和维度数据
          sessionStorage.removeItem('skipQueryConfirmation');
          sessionStorage.removeItem('confirmedDimensions');
          return;
        } catch (e) {
          console.warn('Failed to generate fixed response:', e);
          // 如果生成固定回复失败，清除标记，继续原有逻辑
          sessionStorage.removeItem('skipQueryConfirmation');
          sessionStorage.removeItem('confirmedDimensions');
        }
      } else {
        // 如果没有维度数据，清除标记，继续原有逻辑
        sessionStorage.removeItem('skipQueryConfirmation');
      }
    }

    // 继续原有的发送逻辑
    await handleSendInternal(query, forceWebSearch, skipPresetResponse, questionId);
  };

  // 内部发送消息处理（原有逻辑）
  const handleSendInternal = async (query: string, forceWebSearch?: boolean, skipPresetResponse?: boolean, questionId?: string) => {
    if (!query.trim() || isLoading) return;

    // 🔥 优先检测切换 Agent 意图（使用增强版意图识别引擎）
    const switchResult = detectAgentSwitchIntent(query);
    if (switchResult.agentId && switchResult.agentId !== currentAgentId) {
      // 注意：用户消息已在 handleSend 中添加，这里不需要重复添加
      
      // 高置信度直接切换
      if (switchResult.confidence > 0.7) {
        await handleAgentChange(switchResult.agentId);
        return;
      }
      
      // 中等置信度：显示确认消息后切换
      if (switchResult.confidence > 0.5) {
        const targetAgent = getAgentById(switchResult.agentId);
        const confirmMessage: Message = {
          id: `msg_${Date.now()}_confirm`,
          role: 'assistant',
          content: [{
            id: `block_confirm`,
            type: 'text',
            data: `好的，我帮你找 **${targetAgent.name}**（${targetAgent.title}）来帮忙~`,
          }],
          timestamp: new Date(),
          agentId: currentAgentId,
          status: 'complete',
        };
        setMessages((prev) => [...prev, confirmMessage]);
        
        // 延迟后切换
        setTimeout(async () => {
          await handleAgentChange(switchResult.agentId!);
        }, 500);
        return;
      }
    }

    // 检测工作流调用意图
    if (isWorkflowIntent(query)) {
      // 注意：用户消息已在 handleSend 中添加，这里不需要重复添加
      
      // 添加引导消息
      setTimeout(() => {
        const guideMessage: Message = {
          id: `msg_${Date.now()}_workflow`,
          role: 'assistant',
          content: [
            {
              id: `block_${Date.now()}_text`,
              type: 'text',
              data: '好的，我来帮你启动业务场景工作流。\n\n业务场景可以让多个数字员工协作完成复杂的分析任务。请选择你需要的场景：',
            },
            {
              id: `block_${Date.now()}_actions`,
              type: 'action-buttons',
              data: [
                { id: 'scenario_sales', label: '销售概览分析', query: '@@OPEN_SCENARIO@@sales_overview' },
                { id: 'scenario_anomaly', label: '异常诊断分析', query: '@@OPEN_SCENARIO@@anomaly_diagnosis' },
                { id: 'scenario_user', label: '用户行为分析', query: '@@OPEN_SCENARIO@@user_analysis' },
                { id: 'scenario_forecast', label: '销售预测规划', query: '@@OPEN_SCENARIO@@forecast_planning' },
                { id: 'scenario_all', label: '查看全部场景', query: '@@OPEN_SCENARIO_PANEL@@' },
              ],
            },
          ],
          timestamp: new Date(),
          agentId: currentAgentId,
        };
        setMessages((prev) => [...prev, guideMessage]);
      }, 300);
      return;
    }

    // 处理场景快捷入口 - 直接在对话中执行
    if (query.startsWith('@@OPEN_SCENARIO@@')) {
      const scenarioId = query.replace('@@OPEN_SCENARIO@@', 'scenario_');
      const scenario = getScenarioById(scenarioId);
      if (scenario) {
        handleScenarioStart(scenario);
      }
      return;
    }

    if (query === '@@OPEN_SCENARIO_PANEL@@') {
      // 在对话中显示所有场景列表
      const allScenariosMessage: Message = {
        id: `msg_${Date.now()}_scenarios`,
        role: 'assistant',
        content: [
          {
            id: `block_${Date.now()}_title`,
            type: 'heading',
            data: '全部业务场景',
          },
          {
            id: `block_${Date.now()}_text`,
            type: 'text',
            data: '以下是所有可用的业务场景，点击即可启动：',
          },
          {
            id: `block_${Date.now()}_actions`,
            type: 'action-buttons',
            data: [
              { id: 's1', label: '销售概览分析', query: '@@OPEN_SCENARIO@@sales_overview' },
              { id: 's2', label: '异常诊断分析', query: '@@OPEN_SCENARIO@@anomaly_diagnosis' },
              { id: 's3', label: '用户行为分析', query: '@@OPEN_SCENARIO@@user_analysis' },
              { id: 's4', label: '销售预测规划', query: '@@OPEN_SCENARIO@@forecast_planning' },
              { id: 's5', label: '运营实时监控', query: '@@OPEN_SCENARIO@@operation_monitor' },
              { id: 's6', label: '财务报表分析', query: '@@OPEN_SCENARIO@@financial_report' },
            ],
          },
        ],
        timestamp: new Date(),
        agentId: currentAgentId,
      };
      setMessages(prev => [...prev, allScenariosMessage]);
      return;
    }

    // 注意：用户消息已在 handleSend 中添加，这里不需要重复添加
    
    // 先让大模型做意图分类，再辅以规则抽取实体
    let llmIntent: LLMIntentResult | null = null;
    try {
      llmIntent = await classifyIntentLLM(query);
      console.log('🧠 LLM intent result:', llmIntent);
    } catch (e) {
      console.warn('LLM intent classify failed, fallback to rule intent', e);
    }

    const ruleIntent = detectIntent(query);
    let intentResult = ruleIntent;
    
    // 🔥 强制标志：确保知识库查询一定走大模型（必须在函数作用域顶层声明）
    let FORCE_KNOWLEDGE_QUERY = false;

    if (llmIntent && llmIntent.confidence >= 0.65) {
      if (llmIntent.intent === 'knowledge') {
        intentResult = {
          ...ruleIntent,
          type: 'knowledge_query',
          confidence: Math.max(ruleIntent.confidence || 0, llmIntent.confidence),
        };
      } else if (llmIntent.intent === 'analysis') {
        intentResult = {
          ...ruleIntent,
          confidence: Math.max(ruleIntent.confidence || 0.75, llmIntent.confidence),
        };
      } else if (llmIntent.intent === 'workflow') {
        // 前面已有工作流检测，这里只提升置信度用于后续分支
        intentResult = {
          ...ruleIntent,
          confidence: Math.max(ruleIntent.confidence || 0.7, llmIntent.confidence),
        };
      } else if (llmIntent.intent === 'chitchat') {
        intentResult = {
          ...ruleIntent,
          confidence: Math.max(ruleIntent.confidence || 0.5, llmIntent.confidence),
        };
      }
    }

    // ⚠️ 精准识别知识库查询 - 只识别明确的知识库查询意图，避免误判
    // 注意：不要因为提到"产品"就判断为知识库查询，要结合上下文
    const knowledgePatterns = [
      // 明确的知识库查询模式（必须包含查询类动词）
      /^(介绍|了解|想了解|想看看|什么是|是什么).*产品/i,
      /产品.*介绍/i,
      /介绍.*产品$/i,
      /了解.*data.*agent/i,
      /了解.*亿问/i,
      /了解.*Data.*Agent/i,
      // 明确的产品信息查询
      /产品.*是什么$/i,
      /什么是.*产品$/i,
      /产品.*功能/i,
      /产品.*特性/i,
      /产品.*优势/i,
      /产品.*特点/i,
      // 知识库相关
      /知识库/i,
      /产品文档/i,
      /使用说明/i,
      /如何使用/i,
      /怎么用/i,
    ];
    
    // 排除数据分析意图（如果包含数据分析关键词，不是知识库查询）
    const analysisKeywords = ['分析', '占比', '对比', '趋势', '排名', '销量', '销售额', '订单量', '品类分析'];
    const hasAnalysisIntent = analysisKeywords.some(keyword => query.includes(keyword));
    
    const isKnowledgeQuery = 
      (intentResult.type === 'knowledge_query' || 
       llmIntent?.intent === 'knowledge') &&
      !hasAnalysisIntent && // 排除数据分析意图
      knowledgePatterns.some(pattern => pattern.test(query));
    
    if (isKnowledgeQuery) {
      FORCE_KNOWLEDGE_QUERY = true;
      intentResult = {
        ...intentResult,
        type: 'knowledge_query',
        confidence: 0.95, // 强制高置信度，确保不会被拦截
      };
      console.log('📚 强制识别为知识库查询，必须调用大模型', {
        query,
        ruleIntent: ruleIntent.type,
        llmIntent: llmIntent?.intent,
        matched: true,
        FORCE_KNOWLEDGE_QUERY: true
      });
    } else {
      console.log('🔍 意图识别结果', {
        query,
        ruleIntent: ruleIntent.type,
        llmIntent: llmIntent?.intent,
        isKnowledgeQuery: false
      });
    }

    const combinedConfidence = Math.max(intentResult.confidence || 0, llmIntent?.confidence || 0);

    // ⚠️ 优先检查模糊意图：如果问题太模糊，必须先反问
    // ⚠️ 知识库查询必须走大模型，不能被反问逻辑拦截！
    // ⚠️ 爱玛员工必须走大模型，让LLM生成个性化回复，不被反问逻辑拦截！
    // 若意图置信度较低或问题模糊，先反问再继续（避免直接输出分析/介绍）
    // 但是知识库查询和爱玛员工例外，直接走大模型
    const isAimaAgent = currentAgentId.startsWith('aima-');
    const isVague = isVagueIntent(query);
    if ((isVague || combinedConfidence < 0.6) && intentResult.type !== 'knowledge_query' && !FORCE_KNOWLEDGE_QUERY && !isAimaAgent) {
      // 根据问题内容智能生成反问选项
      let clarifyText = '我需要再确认一下，您想了解哪类信息？请选择一个方向，或告诉我更具体的需求：';
      let clarifyChoices = [];
      
      // 如果提到"产品"，提供产品相关的选项
      if (query.includes('产品') || query.includes('品类') || query.includes('商品')) {
        clarifyText = '关于产品，您想了解什么？请选择：';
        clarifyChoices = [
          { id: 'c_prod_intro', label: '产品介绍 / 功能特色', value: '介绍一下产品' },
          { id: 'c_prod_analysis', label: '产品数据分析', value: '产品品类分析' },
          { id: 'c_prod_compare', label: '各产品对比', value: '各产品销售额对比' },
          { id: 'c_prod_share', label: '产品占比', value: '产品品类占比' },
        ];
      } else if (query.includes('销售') || query.includes('数据')) {
        clarifyText = '关于销售数据，您想了解什么？请选择：';
        clarifyChoices = [
          { id: 'c_sales_overview', label: '销售概览', value: '看销售概览' },
          { id: 'c_sales_trend', label: '销售趋势', value: '近3个月销售趋势' },
          { id: 'c_sales_compare', label: '销售对比', value: '各地区销售额对比' },
          { id: 'c_sales_anomaly', label: '异常诊断', value: '帮我诊断异常原因' },
        ];
      } else {
        // 通用选项
        clarifyText = '我需要再确认一下，您想了解哪类信息？请选择一个方向，或告诉我更具体的需求：';
        clarifyChoices = [
        { id: 'c_prod_intro', label: '产品介绍 / 功能特色', value: '介绍一下产品' },
        { id: 'c_comp', label: '与竞品的对比', value: '与竞品的对比' },
        { id: 'c_sales_overview', label: '销售/运营数据概览', value: '看销售概览' },
        { id: 'c_channel_compare', label: '按地区/渠道/品类对比', value: '按渠道对比分析' },
        { id: 'c_anomaly', label: '异常诊断 / 原因分析', value: '帮我诊断异常原因' },
      ];
      }
      const clarifyMessage = createSystemMessage([
        { id: `clarify_text_${Date.now()}`, type: 'text', data: clarifyText },
        { id: `clarify_choices_${Date.now()}`, type: 'choices', data: { options: clarifyChoices } as any } as any,
      ], currentAgentId);
      setMessages((prev) => [...prev, clarifyMessage]);
      setIsLoading(false);
      return;
    }

    if (intentResult.type === 'knowledge_query') {
      // 知识库查询必须走大模型，让AI根据知识库内容生成个性化回答
      console.log('📚 知识库查询确认，准备调用大模型生成回答', {
        query,
        confidence: intentResult.confidence,
        willCallLLM: true
      });
      // 继续执行后续的大模型调用流程，不要提前返回
    }

    // 用户发送消息后滚动到底部
    setTimeout(() => scrollToBottom(), 100);

    // 学习用户偏好
    const updatedMemory = learnFromQuery(userMemory, query);
    setUserMemory(updatedMemory);

    setIsLoading(true);

    // 【规则匹配系统】优先检查是否匹配《智能问答系统显示规则》中的规则
    // 完全贴合文档规则，使用预设响应，不依赖大模型
    // ⚠️ 爱玛员工不走预设响应，必须走大模型生成个性化回复
    if (presetResponse.hasPreset(query) && intentResult.type !== 'knowledge_query' && !FORCE_KNOWLEDGE_QUERY && !isVague && !isAimaAgent) {
      console.log('📋 [规则匹配] 使用预设响应', { query, intentType: intentResult.type });
      // 模拟短暂延迟
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      
      const assistantMessageId = `msg_${Date.now()}_assistant`;
      const presetMessage = presetResponse.getPresetResponse(query, assistantMessageId);
      
      if (presetMessage) {
        // 添加 agentId
        presetMessage.agentId = currentAgentId;
        setMessages((prev) => [...prev, presetMessage]);
        updateContext(query);
        setIsLoading(false);
        return;
      }
    }

    // 【测试用例精确匹配】所有测试用例都使用固定回复，不调用大模型
    // 如果 skipPresetResponse 为 false（从测试用例面板点击），优先使用预设响应
    // ⚠️ 用户要求：110个测试用例都不要调用大模型，采用固定回复
    if (!skipPresetResponse && hasMatchedScenario(query)) {
      console.log('📋 匹配到测试用例，使用预设响应（固定回复，不调用大模型）', { query, questionId, intentType: intentResult.type });
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      // 传递问题ID以确保每个问题都有独特的回复
      const narrativePresetResponse = generateNarrativeResponse(query, questionId);
      const systemMessage = createSystemMessage(narrativePresetResponse, currentAgentId);
      setMessages((prev) => [...prev, systemMessage]);
      updateContext(query);
      setIsLoading(false);
      return;
    } else if (skipPresetResponse) {
      console.log('🤖 非测试用例面板问题，继续走大模型', { query });
    }

    // 【已禁用】不再自动触发工作流，所有问题都先经过大模型理解
    // const workflowExecuted = await detectAndExecuteWorkflow(query);
    // if (workflowExecuted) {
    //   setIsLoading(false);
    //   return;
    // }

    // 所有问题都经过 AI 理解和回答
    const assistantMessageId = `msg_${Date.now()}_assistant`;
    const blockId = `block_${Date.now()}`;
    
    // 【重要】在创建消息之前就判断是否需要联网搜索，以便显示正确的提示
    // 根据用户查询意图判断是否需要联网搜索（在意图识别之前）
    // 如果外部传入 forceWebSearch，优先使用外部参数
    const shouldEnableSearch = forceWebSearch !== undefined ? forceWebSearch : shouldEnableWebSearch(query);
    
    // 如果启用联网搜索，立即设置搜索状态
    if (shouldEnableSearch) {
      setIsSearching(true);
    }
    
    // 创建消息时根据是否需要搜索显示不同的提示，避免空白气泡
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: [{
        id: `${blockId}_thinking`,
        type: 'text',
        data: shouldEnableSearch ? '正在搜索网页，请稍候...' : '正在分析您的问题，请稍候...',
      }],
      timestamp: new Date(),
      agentId: currentAgentId,
      status: 'streaming',
    };
    
    setMessages((prev) => [...prev, assistantMessage]);

    // 构建对话历史
    const chatHistory = buildChatHistory(messages);
    chatHistory.push({ role: 'user', content: query });

    // 流式调用 DeepSeek API（带用户记忆）
    let fullContent = '';
    const memoryPrompt = generateMemoryPrompt(updatedMemory);
    
    // 创建 AbortController 用于停止输出
    abortControllerRef.current = new AbortController();
    setIsStreaming(true);
    
    // 确认知识库查询会调用大模型
    if (intentResult.type === 'knowledge_query') {
      console.log('🚀 开始调用大模型API - 知识库查询', {
        query,
        agentId: currentAgentId,
        agentName: currentAgent.name,
        willCallAPI: true
      });
    }
    
    // 使用更稳定的节流机制：基于时间的节流，避免频繁更新
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 500; // 增加到500ms，进一步减少更新频率
    let updateTimer: ReturnType<typeof setTimeout> | null = null;
    let lastContentLength = 0;
    
    // 稳定的更新函数 - 优化以减少闪烁
    const stableUpdate = (currentLength: number) => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime;
      const contentGrowth = currentLength - lastContentLength;
      
      // 如果内容增长很小（<30字符），延长更新间隔，减少闪烁
      const effectiveInterval = contentGrowth < 30 ? UPDATE_INTERVAL * 2.5 : UPDATE_INTERVAL;
      
      // 最小更新间隔：至少500ms，避免过于频繁的更新导致闪烁
      const minInterval = 500;
      const finalInterval = Math.max(effectiveInterval, minInterval);
      
      if (timeSinceLastUpdate >= finalInterval) {
        // 立即更新
        lastUpdateTime = now;
        lastContentLength = currentLength;
        if (updateTimer) {
          clearTimeout(updateTimer);
          updateTimer = null;
        }
        return true;
      } else {
        // 延迟更新
        if (!updateTimer) {
          updateTimer = setTimeout(() => {
            lastUpdateTime = Date.now();
            lastContentLength = currentLength;
            updateTimer = null;
          }, finalInterval - timeSinceLastUpdate);
        }
        return false;
      }
    };
    
    // 🔥 最终检查：如果是知识库查询但没有调用大模型，报错！
    if (FORCE_KNOWLEDGE_QUERY && intentResult.type !== 'knowledge_query') {
      console.error('❌ 严重错误：知识库查询被错误识别！', {
        query,
        FORCE_KNOWLEDGE_QUERY,
        intentResultType: intentResult.type
      });
      // 强制修正
      intentResult.type = 'knowledge_query';
      intentResult.confidence = 0.95;
    }
    
    console.log('🔥 调用chatCompletionStream - 大模型API调用', {
      query,
      intentType: intentResult.type,
      isKnowledgeQuery: intentResult.type === 'knowledge_query',
      FORCE_KNOWLEDGE_QUERY,
      chatHistoryLength: chatHistory.length,
      agentId: currentAgentId,
      agentName: currentAgent.name,
      WILL_CALL_LLM: true
    });
    
    // 🔥 断言：知识库查询必须调用大模型
    if (FORCE_KNOWLEDGE_QUERY || intentResult.type === 'knowledge_query') {
      console.log('✅ 知识库查询确认：即将调用大模型API', { query });
    }
    
    await chatCompletionStream(
      chatHistory,
      currentAgentId,
      currentAgent.name,
      currentAgent.title,
      // onChunk - 使用稳定的节流机制，避免界面跳动
      (chunk: string) => {
        fullContent += chunk;
        
        // 使用稳定的时间节流：每300ms最多更新一次（加快更新频率，提高响应速度）
        let shouldUpdate = stableUpdate(fullContent.length);
        
        // 优化：检测choices格式，如果检测到choices立即更新（确保choices完整渲染）
        const hasChoices = fullContent.includes('[choices:') || 
                          fullContent.includes('choices:') ||
                          fullContent.match(/\[choices[^\]]*\]/i);
        
        // 如果检测到choices，立即更新（不等待节流），确保choices完整渲染
        if (hasChoices && !shouldUpdate) {
          // 强制更新，确保choices能完整渲染
          // 直接检查是否有有效的choices格式
          const hasValidChoices = /\[choices:[^\]]+\]/.test(fullContent);
          if (hasValidChoices) {
            // 有有效的choices，立即更新
            shouldUpdate = true;
          }
        }
        
        // 如果内容很少且不应该更新，跳过更新（避免频繁小更新导致跳动）
        // 但如果有choices，即使内容少也要更新
        if (!shouldUpdate && fullContent.length < 300 && !hasChoices) {
          return;
        }
        
        // 内容增长很小且不在更新窗口内，跳过（避免频繁小更新导致闪烁）
        // 但如果有choices，即使增长小也要更新
        const contentGrowth = fullContent.length - lastContentLength;
        if (!shouldUpdate && contentGrowth < 50 && !hasChoices) {
          return;
        }
        
        // 即使内容很少，也要检查并解析思维链（确保早期就能显示）
        // 先尝试解析思维链，如果检测到就立即显示
        let earlyCleanedContent = fullContent;
        const earlyParsed = parseRealtimeContent(fullContent);
        
        // 检查是否有思维链
        const hasThoughtChain = earlyParsed.blocks && earlyParsed.blocks.some(b => b.type === 'thought-chain');
        
        // 如果检测到思维链，立即处理并显示（不等待节流）
        // 但不要直接返回，让后续内容也能正常解析和显示
        if (hasThoughtChain && !shouldUpdate && fullContent.length < 200) {
          const thoughtChainBlock = earlyParsed.blocks.find(b => b.type === 'thought-chain');
          if (thoughtChainBlock && Array.isArray(thoughtChainBlock.data)) {
            const thoughtChainItems = thoughtChainBlock.data;
            const validItems = thoughtChainItems.filter((item: any) => {
              if (!item || typeof item !== 'object') return false;
              if (!item.key || typeof item.key !== 'string' || item.key.trim() === '') return false;
              if (item.title === undefined || item.title === null) return false;
              if (typeof item.title === 'string' && item.title.trim() === '') return false;
              return true;
            });
            
            if (validItems.length > 0) {
              // 确保第一个步骤显示为 loading 状态（动态展示）
              const dynamicItems = validItems.map((item: any, idx: number) => {
                if (idx === 0 && (!item.status || item.status === 'loading')) {
                  // 第一个步骤（理解问题）立即显示并开始执行
                  return { ...item, status: 'loading', blink: true };
                }
                return item;
              });
              
              // 清理思维链代码，避免显示为文本
              earlyCleanedContent = earlyParsed.text || earlyCleanedContent;
              earlyCleanedContent = earlyCleanedContent.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
              earlyCleanedContent = earlyCleanedContent.replace(/\[thought-chain:[^\]]*\]/gi, '');
              
              // 立即更新消息，显示思维链（替换"正在思考"提示）
              const contentToShow: any[] = [];
              // 思维链始终在最前面
              contentToShow.push({
                id: `${blockId}_thought-chain`,
                type: 'thought-chain' as const,
                data: dynamicItems,
              });
              // 其他内容在思维链后面
              if (earlyCleanedContent.trim().length > 0) {
                contentToShow.push({
                  id: `${blockId}_text_early`,
                  type: 'text' as const,
                  data: earlyCleanedContent,
                });
              }
              
              // 立即更新消息，替换"正在思考"提示
              setMessages((prev) => 
                prev.map(m => 
                  m.id === assistantMessageId 
                    ? {
                        ...m,
                        content: contentToShow,
                      }
                    : m
                )
              );
              // 早期内容时直接返回，避免重复处理
              return;
            }
          }
        }
        
        // 如果没有思维链，使用原来的逻辑
        // 使用更激进的正则匹配思维链（包括不完整的情况）
        earlyCleanedContent = earlyCleanedContent.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
        earlyCleanedContent = earlyCleanedContent.replace(/\[thought-chain:[^\]]*\]/gi, '');
        
        if (!shouldUpdate && fullContent.length < 200) {
          // 内容还很少时，只有在有实际内容时才更新（避免空白气泡）
          // 如果earlyCleanedContent为空，保持"正在思考"提示，不更新
          if (earlyCleanedContent.trim().length > 0) {
          setMessages((prev) => 
            prev.map(m => 
              m.id === assistantMessageId 
                ? {
                    ...m,
                    content: [{
                      id: blockId,
                      type: 'text' as const,
                      data: earlyCleanedContent,
                    }],
                  }
                : m
            )
          );
          }
          // 如果earlyCleanedContent为空，不更新消息，保持"正在思考"提示
          return;
        }
        
        // 快速清理（减少处理时间）- 使用更高效的正则
        // 先清理思维链代码（必须在解析前清理，避免显示为文本）
        let cleanedContent = fullContent
          .replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '')
          .replace(/\[thought-chain:[^\]]*\]/gi, '')
          .replace(/\[thought-chain[^\]]*/gi, '')
          .replace(/\[([^\]]+?)说\]:\s*/g, '')
          .replace(/\[([^\]]+?)说\]/g, '')
          .replace(/我是(DeepSeek|AI助手|语言模型)/gi, `我是${currentAgent.name}`)
          .replace(/由深度求索公司创造/gi, '')
          .replace(/作为AI(助手)?/gi, `作为${currentAgent.name}`)
          .replace(/纯文本模型/gi, '')
          .replace(/AI助手/gi, currentAgent.name);
        
        // 实时解析图表和表格（解析会再次提取思维链，但不会显示代码）
        const parsed = parseRealtimeContent(fullContent); // 使用原始内容解析，确保能提取思维链
        const contentBlocks: any[] = [];
        
        // 简化处理：直接使用 parsed.blocks
        if (parsed.blocks && parsed.blocks.length > 0) {
          // 先收集所有块，然后处理思维链（需要知道后面的内容）
          const seenHashes = new Set<string>();
          const allBlocks = parsed.blocks.map((block, index) => {
            // 生成内容哈希用于去重
            const contentHash = block.type === 'text' 
              ? `text_${((block as any).text || '').substring(0, 50)}`
              : `${block.type}_${JSON.stringify(block.data).substring(0, 100)}`;
            
            return { block, index, contentHash };
          }).filter((item) => {
            // 去重
            if (seenHashes.has(item.contentHash)) {
              return false;
            }
            seenHashes.add(item.contentHash);
            return true;
          });
          
          allBlocks.forEach(({ block, index }) => {
            if (block.type === 'text') {
              let textContent = (block as any).text || '';
              // 检查是否包含交互组件（choice、actions等），这些必须保留
              const hasInteractiveComponents = /\[choices:|\[actions:|\[rating:|\[switch:|\[query:/.test(textContent) || 
                /\[[^\]]+\|[^\]]+\]/.test(textContent); // 简单格式 [选项1|选项2]
              
              // 更激进地清理思维链代码（包括不完整的情况）
              // 但不要清理交互组件标记
              textContent = textContent.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
              textContent = textContent.replace(/\[thought-chain:[^\]]*\]/gi, '');
              // 清理可能残留的思维链片段
              textContent = textContent.replace(/\[thought-chain[^\]]*/gi, '');
              
              // 如果包含交互组件，必须保留（即使 trim 后为空）
              // 或者有实际文本内容
              if (hasInteractiveComponents || textContent.trim()) {
                contentBlocks.push({
                  id: `${blockId}_text_${index}`,
                  type: 'text',
                  data: textContent,
                });
              }
            } else if (block.type === 'chart' && block.data?.data?.length > 0) {
              contentBlocks.push({
                id: `${blockId}_chart_${index}`,
                type: 'chart',
                data: block.data,
              });
            } else if (block.type === 'table' && block.data?.headers && block.data?.rows?.length > 0) {
              contentBlocks.push({
                id: `${blockId}_table_${index}`,
                type: 'table',
                data: block.data,
              });
            } else if (block.type === 'kpi' && block.data?.label) {
              contentBlocks.push({
                id: `${blockId}_kpi_${index}`,
                type: 'kpi',
                data: block.data,
              });
            } else if (block.type === 'gantt' && block.data?.data?.length > 0) {
              contentBlocks.push({
                id: `${blockId}_gantt_${index}`,
                type: 'gantt',
                data: block.data,
              });
            } else if (block.type === 'thought-chain' && Array.isArray(block.data)) {
              // 处理思维链：只在有有效内容时才渲染，避免空白气泡，并支持动态更新
              const thoughtChainItems = block.data;
              
              // 严格验证数据有效性：确保有有效的 items 才渲染（避免空白框）
              if (thoughtChainItems && thoughtChainItems.length > 0) {
                // 进一步验证每个 item 是否有必要的字段（更严格的验证）
                const validItems = thoughtChainItems.filter((item: any) => {
                  if (!item || typeof item !== 'object') return false;
                  if (!item.key || typeof item.key !== 'string' || item.key.trim() === '') return false;
                  if (item.title === undefined || item.title === null) return false;
                  // title 可以是字符串或 ReactNode，但至少要有内容
                  if (typeof item.title === 'string' && item.title.trim() === '') return false;
                  return true;
                });
                
                // 只有当有有效的 items 时才添加到 contentBlocks（避免空白框）
                if (validItems.length > 0) {
                  // 检查思维链后面是否有实际内容输出（说明前面的步骤已完成）
                  const blocksAfterThoughtChain = allBlocks.filter(({ index: bi }) => bi > index);
                  
                  // 检查是否有图表、表格等实际输出（说明分析步骤已完成）
                  const hasChartsOrTables = blocksAfterThoughtChain.some(({ block: b }) => 
                    b.type === 'chart' || b.type === 'table' || b.type === 'kpi' || b.type === 'gantt'
                  );
                  
                  // 检查是否有有意义的文本内容（长度>30字符，说明有实际输出）
                  const hasMeaningfulText = blocksAfterThoughtChain.some(({ block: b }) => {
                    if (b.type === 'text') {
                      const text = (b as any).text || '';
                      return text.trim().length > 30;
                    }
                    return false;
                  });
                  
                  // 动态状态更新逻辑：实时更新思维链状态，与渲染过程同步
                  // 核心思路：在流式输出过程中，保守地更新状态，只有在流式输出完成时才标记所有步骤为完成
                  
                  // 1. 检查思维链后面是否有实际内容输出（图表、表格、文本等）
                  // 2. 在流式输出过程中，根据输出进度逐步完成步骤（保守策略）
                  // 3. 只有在流式输出完成时（onComplete），才将所有步骤标记为完成
                  
                  // 统计已完成步骤的数量（用于判断当前应该执行到哪一步）
                  // 注意：在流式输出过程中，不应该立即将所有步骤标记为完成
                  let completedStepsCount = 0;
                  
                  // 在流式输出过程中，使用更保守的策略
                  // 即使检测到图表/表格，也不立即标记所有步骤为完成
                  // 因为图表可能还在渲染中，流式输出还没完成
                  
                  if (hasMeaningfulText) {
                    // 有文本输出，说明至少理解问题步骤已完成
                    // 根据文本长度判断完成程度
                    const textBlocks = blocksAfterThoughtChain.filter(({ block: b }) => b.type === 'text');
                    const totalTextLength = textBlocks.reduce((sum, { block: b }) => {
                      const text = (b as any).text || '';
                      return sum + text.trim().length;
                    }, 0);
                    
                    // 如果文本长度足够，说明理解问题步骤已完成
                    if (totalTextLength > 50) {
                      completedStepsCount = 1; // 至少完成第1个步骤（理解问题）
                    }
                    
                    // 如果文本很长，可能查询数据步骤也完成了
                    if (totalTextLength > 200) {
                      completedStepsCount = Math.min(validItems.length - 1, 2); // 完成前2个步骤
                    }
                  }
                  
                  // 如果检测到图表/表格，说明查询数据步骤可能已完成
                  // 但在流式输出过程中，不应该立即标记所有步骤为完成
                  // 只标记查询数据步骤（通常是第2个步骤）为完成
                  if (hasChartsOrTables) {
                    // 在流式输出过程中，只标记查询数据步骤为完成
                    // 异常检测和生成报告步骤保持 loading，直到流式输出完成
                    completedStepsCount = Math.min(validItems.length - 1, 2); // 最多完成前2个步骤
                  }
                  
                  // 动态更新每个 item 的状态（从第一个开始逐步完成）
                  // 在流式输出过程中，强制确保后续步骤保持 loading 状态
                  const updatedItems = validItems.map((item: any, idx: number) => {
                    const currentStatus = item.status || 'loading';
                    
                    // 如果当前步骤索引小于已完成步骤数，标记为 success
                    if (idx < completedStepsCount) {
                      if (currentStatus === 'loading') {
                        return { ...item, status: 'success', blink: false };
                      }
                      // 如果已经是 success，保持 success
                      return item;
                    }
                      
                    // 如果当前步骤是下一个要执行的步骤（idx === completedStepsCount）
                    if (idx === completedStepsCount) {
                      // 当前步骤正在执行，强制设置为 loading 并显示 blink 效果
                      return { ...item, status: 'loading', blink: true };
                      }
                      
                    // 如果当前步骤还在等待中（idx > completedStepsCount）
                    // 强制设置为 loading 状态，即使初始状态是 success
                    if (idx > completedStepsCount) {
                      // 等待中的步骤，强制保持 loading 状态，不显示 blink
                      return { ...item, status: 'loading', blink: false };
                    }
                    
                    // 其他情况保持原样
                    return item;
                  });
                  
                  // 使用唯一 ID，确保每次更新都能正确替换（支持动态更新）
                  const thoughtChainId = `${blockId}_thought-chain`;
                  
                  // 查找是否已存在思维链块，如果存在则更新，否则添加
                  const existingIndex = contentBlocks.findIndex(b => b.id === thoughtChainId);
                  
                  // 检查数据是否真正变化，避免重复渲染
                  let shouldUpdate = true;
                  if (existingIndex >= 0) {
                    const existingItems = (contentBlocks[existingIndex].data as any[]) || [];
                    // 比较关键字段：key, title, status, description
                    const itemsChanged = updatedItems.length !== existingItems.length ||
                      updatedItems.some((item, idx) => {
                        const existing = existingItems[idx];
                        if (!existing) return true;
                        return item.key !== existing.key ||
                          String(item.title) !== String(existing.title) ||
                          item.status !== existing.status ||
                          String(item.description || '') !== String(existing.description || '') ||
                          item.blink !== existing.blink;
                      });
                    shouldUpdate = itemsChanged;
                  }
                  
                  if (shouldUpdate) {
                    if (existingIndex >= 0) {
                      // 更新现有的思维链块（动态更新）
                      contentBlocks[existingIndex] = {
                        id: thoughtChainId,
                        type: 'thought-chain',
                        data: updatedItems,
                      };
                    } else {
                      // 添加新的思维链块
                  contentBlocks.push({
                        id: thoughtChainId,
                    type: 'thought-chain',
                    data: updatedItems,
                  });
                    }
                  }
                } // 关闭 validItems.length > 0 的 if
              } // 关闭 thoughtChainItems.length > 0 的 if
            }
          });
          
          // 确保思维链始终在最前面（重新排序）
          // 只有在有内容时才排序，避免清空数组导致内容丢失
          if (contentBlocks.length > 0) {
            const thoughtChainBlocks = contentBlocks.filter(b => b.type === 'thought-chain');
            const otherBlocks = contentBlocks.filter(b => b.type !== 'thought-chain');
            // 重新组合：思维链在前，其他内容在后
            contentBlocks.length = 0;
            contentBlocks.push(...thoughtChainBlocks, ...otherBlocks);
          }
        }
        
        // 如果没有解析到块，使用纯文本（但需要先清理思维链标记）
        // 确保思维链代码不会显示为文本
        let finalText = parsed.text || cleanedContent;
        
        // 更激进地清理思维链标记（包括不完整的情况）
        // 多次清理，确保完全移除
        finalText = finalText.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
        finalText = finalText.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, ''); // 再次清理
        finalText = finalText.replace(/\[thought-chain:[^\]]*\]/gi, '');
        finalText = finalText.replace(/\[thought-chain:[^\]]*\]/gi, ''); // 再次清理
        // 清理可能残留的思维链片段（包括换行的情况）
        finalText = finalText.replace(/\[thought-chain[^\]]*/gi, '');
        finalText = finalText.replace(/\[thought-chain[^\]]*/gi, ''); // 再次清理
        // 清理可能的多行思维链代码
        finalText = finalText.replace(/\[thought-chain:[\s\S]*?\]/gi, '');
        finalText = finalText.replace(/\[thought-chain:[\s\S]*?\]/gi, ''); // 再次清理
        
        if (contentBlocks.length === 0 && finalText.trim()) {
          contentBlocks.push({
            id: `${blockId}_text`,
            type: 'text',
            data: finalText,
          });
        } else if (contentBlocks.length > 0 && finalText.trim()) {
          // 如果有其他块，但还有剩余文本，也添加文本块（但已清理思维链）
          const hasTextBlock = contentBlocks.some(b => b.type === 'text');
          if (!hasTextBlock) {
            contentBlocks.push({
              id: `${blockId}_text_remaining`,
              type: 'text',
              data: finalText,
            });
          }
        }
        
        // 稳定的更新消息（避免频繁更新导致界面跳动）
        // 确保思维链代码不会显示为文本
        let finalContent = contentBlocks.length > 0 
          ? contentBlocks 
          : (finalText.trim() ? [{
              id: blockId,
              type: 'text' as const,
              data: finalText,
            }] : []);
        
        // 最终确保思维链始终在最前面（再次排序，确保顺序正确）
        if (Array.isArray(finalContent) && finalContent.length > 0) {
          const thoughtChainBlocks = finalContent.filter((b: any) => b.type === 'thought-chain');
          const otherBlocks = finalContent.filter((b: any) => b.type !== 'thought-chain');
          
          // 检查是否有实际有效内容
          // 1. 有其他内容块（图表、表格、文本等）
          // 2. 或者有有效的思维链
          const hasOtherContent = otherBlocks.length > 0;
          const hasValidThoughtChain = thoughtChainBlocks.length > 0 && thoughtChainBlocks.some((b: any) => {
            // 检查思维链是否有有效数据
            if (b.data && Array.isArray(b.data) && b.data.length > 0) {
              return b.data.some((item: any) => 
                item && item.key && item.title && 
                (typeof item.title === 'string' ? item.title.trim() !== '' : true)
              );
            }
            return false;
          });
          
          // 重新组合：思维链在前，其他内容在后（使用稳定的引用，避免重新创建数组）
          finalContent = [...thoughtChainBlocks, ...otherBlocks];
          
          // 如果有实际有效内容，稳定更新消息（替换"正在思考"提示）
          if (hasOtherContent || hasValidThoughtChain) {
            // 使用函数式更新，确保基于最新状态
            setMessages((prev) => {
              const existingMessage = prev.find(m => m.id === assistantMessageId);
              if (!existingMessage) return prev;
              
              // 比较内容是否真正变化，避免不必要的更新
              const existingContent = existingMessage.content;
              if (Array.isArray(existingContent) && Array.isArray(finalContent)) {
                // 如果内容块数量不同，需要更新
                if (existingContent.length !== finalContent.length) {
                  // 内容块数量变化，需要更新
                } else {
                  // 内容块数量相同，比较每个块的内容
                  const contentChanged = finalContent.some((block, idx) => {
                    const existingBlock = existingContent[idx];
                    if (!existingBlock || block.type !== existingBlock.type || block.id !== existingBlock.id) {
                      return true; // 类型或ID不同，需要更新
                    }
                    
                    // 对于思维链，比较数据
                    if (block.type === 'thought-chain' && existingBlock.type === 'thought-chain') {
                      const blockData = block.data as any[];
                      const existingData = existingBlock.data as any[];
                      if (blockData.length !== existingData.length) return true;
                      return blockData.some((item, i) => {
                        const existingItem = existingData[i];
                        return !existingItem || 
                          item.key !== existingItem.key ||
                          item.status !== existingItem.status ||
                          String(item.description || '') !== String(existingItem.description || '');
                      });
                    }
                    
                    // 对于文本块，比较内容（特别是包含交互组件的文本）
                    if (block.type === 'text' && existingBlock.type === 'text') {
                      const blockText = String(block.data || '');
                      const existingText = String(existingBlock.data || '');
                      // 如果包含交互组件标记，必须比较完整内容
                      const hasInteractive = /\[choices:|\[actions:|\[rating:|\[switch:|\[query:/.test(blockText) || 
                        /\[[^\]]+\|[^\]]+\]/.test(blockText);
                      if (hasInteractive) {
                        return blockText !== existingText; // 包含交互组件，必须完整比较
                      }
                      // 普通文本，比较主要部分（避免频繁更新）
                      return blockText.length > existingText.length + 10 || // 文本明显增加
                        blockText.substring(0, Math.min(blockText.length, 100)) !== 
                        existingText.substring(0, Math.min(existingText.length, 100)); // 前100字符不同
                    }
                    
                    // 对于图表和表格类型，使用更精确的比较，避免不必要的重新渲染
                    const chartTypes = ['chart', 'table', 'kpi', 'kpi-group', 'gantt', 'line-chart', 'bar-chart', 'pie-chart', 'scatter-chart', 'funnel-chart', 'box-plot', 'map-chart', 'quadrant-chart'];
                    if (chartTypes.includes(block.type) && chartTypes.includes(existingBlock.type)) {
                      const blockData = block.data as any;
                      const existingData = existingBlock.data as any;
                      
                      // 如果引用相同，不需要更新
                      if (blockData === existingData) {
                        return false;
                      }
                      
                      // 对于图表类型，比较关键字段
                      if (block.type === 'chart' || block.type.includes('-chart')) {
                        // 比较图表类型
                        if (blockData?.type !== existingData?.type) {
                          return true;
                        }
                        
                        // 比较数据数组的长度和关键内容
                        if (blockData?.data && existingData?.data) {
                          if (Array.isArray(blockData.data) && Array.isArray(existingData.data)) {
                            if (blockData.data.length !== existingData.data.length) {
                              return true;
                            }
                            // 如果长度相同，比较前几个数据点
                            const compareLength = Math.min(blockData.data.length, 5);
                            for (let i = 0; i < compareLength; i++) {
                              if (JSON.stringify(blockData.data[i]) !== JSON.stringify(existingData.data[i])) {
                                return true;
                              }
                            }
                            // 如果前几个数据点相同，且长度相同，认为数据没有变化
                            return false;
                          }
                        }
                      }
                      
                      // 对于表格类型，比较 headers 和 rows
                      if (block.type === 'table') {
                        // 比较 headers
                        if (JSON.stringify(blockData?.headers) !== JSON.stringify(existingData?.headers)) {
                          return true;
                        }
                        
                        // 比较 rows 的长度和前几行
                        if (blockData?.rows && existingData?.rows) {
                          if (blockData.rows.length !== existingData.rows.length) {
                            return true;
                          }
                          // 比较前几行，如果相同则认为数据没有变化
                          const compareLength = Math.min(blockData.rows.length, 3);
                          for (let i = 0; i < compareLength; i++) {
                            if (JSON.stringify(blockData.rows[i]) !== JSON.stringify(existingData.rows[i])) {
                              return true;
                            }
                          }
                          // 如果前几行相同，且长度相同，认为数据没有变化
                          return false;
                        }
                      }
                      
                      // 对于其他图表类型（KPI等），使用完整比较
                      return JSON.stringify(blockData) !== JSON.stringify(existingData);
                    }
                    
                    // 其他类型，比较数据
                    return JSON.stringify(block.data) !== JSON.stringify(existingBlock.data);
                  });
                  
                  if (!contentChanged) return prev; // 内容没有变化，不更新
                }
              }
              
              return prev.map(m => 
            m.id === assistantMessageId 
              ? {
                  ...m,
                  content: finalContent,
                }
              : m
              );
            });
          }
          // 如果没有实际内容，保持"正在思考"提示，不更新
          return;
        }
        
        // 如果有文本内容，也稳定更新（替换"正在思考"提示）
        // 检查是否包含交互组件（choice、actions等），这些必须保留
        const hasInteractiveInText = /\[choices:|\[actions:|\[rating:|\[switch:|\[query:/.test(finalText) || 
          /\[[^\]]+\|[^\]]+\]/.test(finalText);
        
        if (finalText.trim() || hasInteractiveInText) {
          setMessages((prev) => {
            const existingMessage = prev.find(m => m.id === assistantMessageId);
            if (!existingMessage) return prev;
            
            // 检查文本是否变化
            const existingContent = existingMessage.content;
            if (Array.isArray(existingContent) && existingContent.length === 1) {
              const existingBlock = existingContent[0];
              if (existingBlock && existingBlock.type === 'text') {
                const existingText = String(existingBlock.data || '');
                // 如果包含交互组件，必须完整比较
                if (hasInteractiveInText) {
                  if (existingText === finalText) return prev; // 文本没有变化，不更新
                } else {
                  // 普通文本，比较主要部分（避免频繁更新）
                  if (existingText === finalText || 
                      (existingText.length > 0 && finalText.length <= existingText.length + 5)) {
                    return prev; // 文本没有明显变化，不更新
                  }
                }
              }
            }
            
            return prev.map(m => 
              m.id === assistantMessageId 
                ? {
                    ...m,
                    content: [{
                      id: blockId,
                      type: 'text' as const,
                      data: finalText,
                    }],
                  }
                : m
            );
          });
        }
      },
      // onComplete - 流式输出完成时，确保所有思维链步骤都更新为 success
      () => {
        setIsStreaming(false);
        setIsSearching(false);
        abortControllerRef.current = null;
        
        // 流式输出完成时，更新所有思维链的 loading 状态为 success
        setMessages((prev) => 
          prev.map(m => {
            if (m.id === assistantMessageId) {
              if (Array.isArray(m.content)) {
                // 更新思维链状态
                const updatedContent = m.content.map((block: any) => {
                  if (block.type === 'thought-chain' && Array.isArray(block.data)) {
                    // 将所有 loading 状态改为 success
                    const updatedItems = block.data.map((item: any) => {
                      if (item.status === 'loading') {
                        return { ...item, status: 'success', blink: false };
                      }
                      return item;
                    });
                    return { ...block, data: updatedItems };
                  }
                  return block;
                });
                
                return {
                  ...m,
                  content: updatedContent,
                  status: 'complete' as const,
                };
              }
              return { ...m, status: 'complete' as const };
            }
            return m;
          })
        );
        
        // 【已禁用】不再自动触发预设场景，让大模型完全自主理解和回复
        // const queryTrigger = extractQueryTrigger(fullContent);
        // if (queryTrigger && hasMatchedScenario(queryTrigger)) {
        //   const visualResponse = generateNarrativeResponse(queryTrigger);
        //   const visualMessage = createSystemMessage(visualResponse, currentAgentId);
        //   setMessages((prev) => [...prev, visualMessage]);
        // }
        
        updateContext(query);
        setIsLoading(false);
        
        // 自动滚动到核心数据（KPI 或主要图表）
        scrollToCoreData(assistantMessageId);
      },
      // onError
      (error: Error) => {
        setIsStreaming(false);
        setIsSearching(false); // 搜索失败，关闭搜索提示
        abortControllerRef.current = null;
        
        console.error('DeepSeek API Error:', error);
        setMessages((prev) => 
          prev.map(m => 
            m.id === assistantMessageId 
              ? {
                  ...m,
                  status: 'error' as const,
                  content: [{
                    id: blockId,
                    type: 'text' as const,
                    data: `抱歉，出现了错误：${error.message}`,
                  }],
                }
              : m
          )
        );
        setIsLoading(false);
      },
      memoryPrompt,  // 传入用户记忆
      shouldEnableSearch,  // 传入联网搜索开关
      abortControllerRef.current?.signal  // 传入AbortSignal用于取消请求
    );
  };

  // 更新上下文
  const updateContext = (query: string) => {
    const newContext = { ...context };
    if (query.includes('销售额')) newContext.lastMetric = 'sales';
    if (query.includes('订单')) newContext.lastMetric = 'orders';
    if (query.includes('地区') || query.includes('华东')) newContext.lastDimension = 'region';
    if (query.includes('渠道')) newContext.lastDimension = 'channel';
    if (query.includes('详细') || query.includes('下钻') || query.includes('展开')) {
      newContext.drillPath.push(query);
    }
    setContext(newContext);
  };

  // 处理追问按钮点击
  const handleActionSelect = (query: string) => {
    handleSend(query);
  };

  // 在当前消息中追加内容（用于下钻操作）
  const handleAppendContent = (messageId: string, blocks: ContentBlock[]) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: [...(Array.isArray(m.content) ? m.content : []), ...blocks],
            }
          : m
      )
    );
  };

  // 新对话
  const handleNewChat = () => {
    setMessages([]);
    setContext({ drillPath: [] });
  };

  // 【已禁用】智能识别业务场景并执行工作流
  // 此功能已被禁用，所有问题都先经过大模型理解
  // const detectAndExecuteWorkflow = async (userQuery: string): Promise<boolean> => {
  //   // 场景关键词映射
  //   const scenarioKeywords: Record<string, string[]> = {
  //     'scenario_sales_overview': ['销售', '营收', '业绩', '收入', 'GMV', '销量', '卖了多少'],
  //     'scenario_anomaly_diagnosis': ['异常', '下降', '问题', '为什么', '怎么回事', '出了什么', '不正常'],
  //     'scenario_user_analysis': ['用户', '留存', '活跃', '日活', '月活', 'DAU', 'MAU', '转化'],
  //     'scenario_forecast_planning': ['预测', '预估', '未来', '下个月', '下季度', '趋势', '会怎样'],
  //   };

  //   // 检测用户意图
  //   let matchedScenarioId: string | null = null;
  //   let maxMatches = 0;
    
  //   for (const [scenarioId, keywords] of Object.entries(scenarioKeywords)) {
  //     const matches = keywords.filter(kw => userQuery.includes(kw)).length;
  //     if (matches > maxMatches) {
  //       maxMatches = matches;
  //       matchedScenarioId = scenarioId;
  //     }
  //   }

  //   // 如果匹配到场景且匹配度足够高，自动执行工作流
  //   if (matchedScenarioId && maxMatches >= 1) {
  //     const scenario = getScenarioById(matchedScenarioId);
  //     if (scenario) {
  //       await executeIntelligentWorkflow(scenario, userQuery);
  //       return true;
  //     }
  //   }
  //   return false;
  // };

  // 执行智能工作流 - 多 Agent 协作会议模式
  const executeIntelligentWorkflow = async (scenario: BusinessScenario, userQuery: string) => {
    setActiveScenario(scenario);
    
    // 获取参与的 Agent 列表
    const participantAgents = scenario.requiredAgents.map(ra => getAgentById(ra.agentId));
    const leadAgent = participantAgents[0];
    
    // Agent 角色分配
    const agentRoles: Record<string, string> = {
      'alisa': '会议主席，负责协调流程和总结',
      'nora': '业务分析师，负责语义解读和洞察',
      'metrics-pro': '数据分析师，负责指标计算和数据呈现',
      'attributor': '归因专家，负责问题定位和根因分析',
      'predictor': '预测分析师，负责趋势预测和建议',
      'viz-master': '可视化专家，负责图表呈现',
      'growth-hacker': '增长分析师，负责增长策略',
      'report-lisa': '报表专家，负责数据汇总',
    };

    // 1. 会议开场 - 主持人介绍
    const openingMessageId = `msg_${Date.now()}_opening`;
    const openingBlockId = `block_opening`;
    const openingMessage: Message = {
      id: openingMessageId,
      role: 'assistant',
      content: [{
        id: openingBlockId,
        type: 'text',
        data: '',
      }],
      timestamp: new Date(),
      agentId: leadAgent.id,
      status: 'streaming',
    };
    setMessages(prev => [...prev, openingMessage]);

    const openingPrompt = `你是${leadAgent.name}，作为本次「${scenario.name}」分析会议的主持人。

用户问题：「${userQuery}」

请用专业但亲切的语气开场（约80字）：
1. 简要说明会议目标
2. 介绍参会的团队成员及其角色：${participantAgents.map(a => `${a.name}(${agentRoles[a.id] || a.title})`).join('、')}
3. 宣布会议开始

不要使用emoji，用**加粗**标注重点。`;

    let openingContent = '';
    await chatCompletionStream(
      [{ role: 'user', content: openingPrompt }],
      leadAgent.id, leadAgent.name, leadAgent.title,
      (chunk) => {
        openingContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === openingMessageId 
            ? { ...m, content: [{ id: openingBlockId, type: 'text' as const, data: openingContent }] }
            : m
        ));
      },
      () => setMessages(prev => prev.map(m => m.id === openingMessageId ? { ...m, status: 'complete' as const } : m)),
      () => {}
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. 数据呈现 - 展示可视化图表
    const visualQueries: Record<string, string[]> = {
      'scenario_sales_overview': ['今年销售额是多少', '近3个月销售额趋势'],
      'scenario_anomaly_diagnosis': ['为什么11月销售额下降了'],
      'scenario_user_analysis': ['日活还有月活数据', '各渠道转化率哪个最好'],
      'scenario_forecast_planning': ['预测下月销售额'],
      'scenario_operation_monitor': ['本月订单量有多少'],
      'scenario_financial_report': ['看一下营收以及利润'],
    };

    const queries = visualQueries[scenario.id] || ['今年销售额是多少'];
    for (const query of queries) {
      if (hasMatchedScenario(query)) {
        const visualResponse = generateNarrativeResponse(query);
        const dataAgent = participantAgents.find(a => a.id === 'metrics-pro' || a.id === 'viz-master') || participantAgents[1] || leadAgent;
        const visualMessage = createSystemMessage(visualResponse, dataAgent.id);
        setMessages(prev => [...prev, visualMessage]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // 3. 各 Agent 依次发言分析
    for (let i = 1; i < Math.min(participantAgents.length, 3); i++) {
      const agent = participantAgents[i];
      const role = agentRoles[agent.id] || agent.title;
      
      const agentMessageId = `msg_${Date.now()}_agent_${i}`;
      const agentBlockId = `block_agent_${i}`;
      const agentMessage: Message = {
        id: agentMessageId,
        role: 'assistant',
        content: [{ id: agentBlockId, type: 'text', data: '' }],
        timestamp: new Date(),
        agentId: agent.id,
        status: 'streaming',
      };
      setMessages(prev => [...prev, agentMessage]);

      const agentPrompt = `你是${agent.name}，${role}。

在「${scenario.name}」分析会议中，针对用户问题「${userQuery}」，请从你的专业角度给出分析（约150字）：

1. 你的专业观点和发现（包含具体数据）
2. 你注意到的关键问题或机会
3. 你的建议

请用专业的语气，像在会议中发言一样自然。用**加粗**标注关键数据和结论。不要使用emoji。`;

      let agentContent = '';
      await chatCompletionStream(
        [{ role: 'user', content: agentPrompt }],
        agent.id, agent.name, agent.title,
        (chunk) => {
          agentContent += chunk;
          setMessages(prev => prev.map(m => 
            m.id === agentMessageId 
              ? { ...m, content: [{ id: agentBlockId, type: 'text' as const, data: agentContent }] }
              : m
          ));
        },
        () => setMessages(prev => prev.map(m => m.id === agentMessageId ? { ...m, status: 'complete' as const } : m)),
        () => {}
      );

      await new Promise(resolve => setTimeout(resolve, 400));
    }

    // 4. 会议总结 - 主持人总结
    const summaryMessageId = `msg_${Date.now()}_summary`;
    const summaryBlockId = `block_summary`;
    const summaryMessage: Message = {
      id: summaryMessageId,
      role: 'assistant',
      content: [{ id: summaryBlockId, type: 'text', data: '' }],
      timestamp: new Date(),
      agentId: leadAgent.id,
      status: 'streaming',
    };
    setMessages(prev => [...prev, summaryMessage]);

    const summaryPrompt = `你是${leadAgent.name}，作为会议主持人，请总结本次「${scenario.name}」分析会议（约200字）：

用户原始问题：「${userQuery}」

请包含：
1. **核心结论**：本次分析的主要发现（2-3点，包含具体数据）
2. **行动建议**：基于分析结果的具体可执行建议（2-3条）
3. **后续跟进**：建议用户可以继续深入了解的方向

用专业简洁的语气总结，用**加粗**标注重点。不要使用emoji。`;

    let summaryContent = '';
    await chatCompletionStream(
      [{ role: 'user', content: summaryPrompt }],
      leadAgent.id, leadAgent.name, leadAgent.title,
      (chunk) => {
        summaryContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === summaryMessageId 
            ? { ...m, content: [{ id: summaryBlockId, type: 'text' as const, data: summaryContent }] }
            : m
        ));
      },
      () => setMessages(prev => prev.map(m => m.id === summaryMessageId ? { ...m, status: 'complete' as const } : m)),
      () => {}
    );
  };

  // 启动业务场景（手动触发）
  const handleScenarioStart = async (scenario: BusinessScenario) => {
    setScenarioPanelOpen(false);
    await executeIntelligentWorkflow(scenario, scenario.keyQuestions[0] || scenario.name);
  };


  // 筛选条件到查询的映射表
  const FILTER_QUERY_MAP: Record<string, Record<string, string>> = {
    // 数据源映射
    datasource: {
      '销售流水': '今年销售额是多少',
      '订单表': '本月订单量有多少',
      '用户表': '日活还有月活数据',
      '库存表': '当前库存数值',
      '财务流水': '看一下营收以及利润',
      '门店销售': '各门店业绩排名',
      '用户行为表': '日活还有月活数据',
      '产品表': '分产品线看销量',
    },
    // 分组方式映射
    groupby: {
      '产品 分组': '分产品线看销量',
      '时间 按日': '最近一周订单量波动',
      '时间 按周': '最近一周订单量波动',
      '时间 按月': '近3个月销售额趋势',
      '渠道 分组': '销售渠道占比分析',
      '地区 分组': '各地区销售额对比',
      '品类 分组': '各品类销售额构成',
      '城市 下钻': '详细看看华东区数据',
      '门店 排名': '各门店业绩排名',
      '季度 分组': '看一下营收以及利润',
      '年份 同比': '对比去年和今年营收',
    },
    // 日期范围映射
    date: {
      '今天': '本月订单量有多少',
      '昨天': '昨天订单量是不是有问题',
      '本周': '最近一周订单量波动',
      '本月': '本月订单量有多少',
      '上月': '本月销售额比上月如何',
      '近7天': '最近一周订单量波动',
      '近30天': '近3个月销售额趋势',
      '近3个月': '近3个月销售额趋势',
      '2024年': '今年销售额是多少',
      '2023年': '对比去年和今年营收',
      'Q1': '看一下营收以及利润',
      'Q2': '看一下营收以及利润',
      'Q3': 'Q3销售额同比增长情况',
      'Q4': '看一下营收以及利润',
    },
    // 筛选条件映射（地区、状态等）
    filter: {
      '华东': '详细看看华东区数据',
      '华南': '各地区销售额对比',
      '华北': '各地区销售额对比',
      '线上': '销售渠道占比分析',
      '线下': '销售渠道占比分析',
      '已完成': '本月订单量有多少',
      '不为空': '今年销售额是多少',
      '包含': '今年销售额是多少',
      '等于': '今年销售额是多少',
      '为空': '找出异常交易数据',
      '活跃': '日活还有月活数据',
    },
  };

  // 处理筛选条件变化 - 就地更新当前消息的数据
  const handleFilterChange = (messageId: string, conditions: any[], changedType?: string, changedValue?: string) => {
    let query = '';
    
    // 以被更改的条件类型为准来决定查询
    if (changedType && changedValue) {
      const typeMap = FILTER_QUERY_MAP[changedType as keyof typeof FILTER_QUERY_MAP];
      if (typeMap && typeMap[changedValue]) {
        query = typeMap[changedValue];
      }
    }
    
    // 如果没有匹配到，使用默认优先级
    if (!query) {
      const datasource = conditions.find(c => c.type === 'datasource')?.value || '';
      const date = conditions.find(c => c.type === 'date')?.value || '';
      const groupby = conditions.find(c => c.type === 'groupby')?.value || '';
      
      if (groupby && FILTER_QUERY_MAP.groupby[groupby]) {
        query = FILTER_QUERY_MAP.groupby[groupby];
      } else if (date && FILTER_QUERY_MAP.date[date]) {
        query = FILTER_QUERY_MAP.date[date];
      } else if (datasource && FILTER_QUERY_MAP.datasource[datasource]) {
        query = FILTER_QUERY_MAP.datasource[datasource];
      } else {
        query = '今年销售额是多少';
      }
    }
    
    console.log('筛选条件变更:', { changedType, changedValue }, '→ 查询:', query);
    
    // 生成新的数据内容
    const newContent = generateNarrativeResponse(query);
    
    // 就地更新消息内容，保留新的筛选条件
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.role === 'assistant') {
        // 确保第一个 block 是带有新条件的 visualizer
        const hasVisualizer = newContent[0]?.type === 'visualizer';
        const updatedContent = hasVisualizer 
          ? [{ ...newContent[0], data: conditions }, ...newContent.slice(1)]
          : [{ id: 'filter-' + Date.now(), type: 'visualizer' as const, data: conditions }, ...newContent];
        
        return { ...msg, content: updatedContent };
      }
      return msg;
    }));
  };

  const hasMessages = messages.length > 0;

  // 路由：移动端测试页面
  if (currentPage === 'mobile') {
    return <MobileTestPage />;
  }

  // 路由：手势控制页面
  if (currentPage === 'gesture') {
    return <GestureControlPage />;
  }

  // 路由：归因分析演示页面
  if (currentPage === 'attribution') {
    return <AttributionDemoPage />;
  }

  // 路由：看板列表页
  if (currentPage === 'dashboard-list') {
    return <DashboardList />;
  }

  // 路由：AI 自动化看板（具体看板编辑页）
  if (currentPage === 'dashboard') {
    return <AIDashboard />;
  }

  // 路由：语音对话页面
  if (currentPage === 'voice-chat') {
    return (
      <VoiceChatPage
        initialAgentId={currentAgentId}
        onClose={() => {
          window.history.pushState({}, '', '?page=main');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      />
    );
  }

  // 路由：KPI卡片展示页面
  if (currentPage === 'kpi-showcase') {
    return <KPICardShowcase />;
  }

  // 路由：PRD文档页面
  if (currentPage === 'prd') {
    return <PRDPage />;
  }

  // 路由：数据开发配置页（PRD F.2.4 Lazy 真实进入配置）
  if (currentPage === 'datasource') return <DataSourceConfigPage />;
  if (currentPage === 'modeling') return <ModelingConfigPage />;
  if (currentPage === 'indicators') return <IndicatorsConfigPage />;

  // 主页面渲染 - 根据是否有消息决定显示简约输入界面还是问答界面
  return (
    <AnimatePresence mode="wait">
      {!hasMessages ? (
        // 简约输入界面 - 完全独立（包含大输入框）
        <motion.div
          key="simple-input"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <SimpleInputPage 
            onQuestionSubmit={(question, options) => {
              if (options?.fromTourDemo) setPendingTourFollowUp(true);
              if (options?.agentId && options.agentId !== currentAgentId) {
                handleAgentChange(options.agentId).then(() => {
                  setTimeout(() => handleSend(question, options?.enableWebSearch), 300);
                });
              } else {
                handleSend(question, options?.enableWebSearch);
              }
            }}
            agent={currentAgent}
            onAgentChange={handleAgentChange}
            currentAgentId={currentAgentId}
            onNavigateToConfig={(page) => {
              window.history.pushState({}, '', `?page=${page}`);
              setCurrentPage(page);
            }}
          />
          {/* 浮动引导助手已移至 SimpleInputPage 内部，支持角色选择后自动引导 */}
        </motion.div>
      ) : (
        // 问答界面 - 完整功能
        <motion.div
          key="chat-interface"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-screen bg-white font-sans"
        >
          {/* 左侧边栏 */}
          <Sidebar 
            onNewChat={handleNewChat}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* 主内容区 */}
          <main className="flex-1 flex flex-col min-w-0 relative">
            {/* 顶部导航栏 */}
            <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-[#E8F0FF] flex items-center justify-between px-8 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <span className="text-[#1D2129] font-semibold tracking-tight">
                  AI 数据分析
                </span>
                <div className="hidden md:flex items-center gap-2 pl-4 ml-1 border-l border-[#E8F0FF]">
                  {currentAgent.avatar ? (
                    <img 
                      src={currentAgent.avatar} 
                      alt={currentAgent.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#E8F0FF] text-[#1664FF] flex items-center justify-center text-xs font-semibold">
                      {currentAgent.name.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col leading-tight">
                    <span className="text-[11px] text-[#86909C]">当前数字员工</span>
                    <span className="text-[12px] text-[#1D2129]">
                      {currentAgent.name} · {currentAgent.title}
                    </span>
                  </div>
                </div>
                {hasMessages && (
                  <span className="px-2.5 py-0.5 bg-[#E8F0FF] text-[#1664FF] text-xs font-medium rounded-full">
                    {messages.filter(m => m.role === 'user').length} 轮对话
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScenarioPanelOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#1664FF] rounded-lg hover:bg-[#0E52D9] transition-all"
                >
                  <Workflow className="w-4 h-4" />
                  <span>业务场景</span>
                </button>
                <a
                  href="?page=gesture"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#4E5969] hover:text-[#1664FF] hover:bg-[#E8F0FF] rounded-lg transition-colors"
                >
                  <span>🖐</span>
                  <span>手势控制</span>
                </a>
                <a
                  href="?page=dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#4E5969] hover:text-[#1664FF] hover:bg-[#E8F0FF] rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>AI 看板</span>
                </a>
                <a
                  href="?page=mobile"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#4E5969] hover:text-[#1664FF] hover:bg-[#E8F0FF] rounded-lg transition-colors"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>移动端测试</span>
                </a>
                <a
                  href="?page=kpi-showcase"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#4E5969] hover:text-[#1664FF] hover:bg-[#E8F0FF] rounded-lg transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>KPI卡片展示</span>
                </a>
                {hasMessages && (
                  <button
                    onClick={handleNewChat}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#4E5969] hover:text-[#1664FF] hover:bg-[#E8F0FF] rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>新对话</span>
                  </button>
                )}
              </div>
            </header>

            {/* 对话区域 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 消息区 + 输入框 */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* 消息滚动区 */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                  <div className="max-w-4xl mx-auto px-6 py-4 pb-4">
                    {messages.length === 0 ? (
                      // 没有消息时显示内联引导面板
                      <InlineGuidePanel
                        onQuestionSelect={(question, recommendedAgentId) => {
                          if (recommendedAgentId && recommendedAgentId !== currentAgentId) {
                            handleAgentChange(recommendedAgentId).then(() => {
                              setTimeout(() => handleSend(question), 300);
                            });
                          } else {
                            handleSend(question);
                          }
                        }}
                        currentAgentId={currentAgentId}
                      />
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        {messages.map((message) => (
                          <MessageBubble 
                            key={message.id} 
                            message={message}
                            onActionSelect={handleActionSelect}
                            onFilterChange={(conditions, changedType, changedValue) => handleFilterChange(message.id, conditions, changedType, changedValue)}
                            onAgentSwitch={handleAgentSwitchByName}
                            isSearching={isSearching && message.status === 'streaming'}
                            onAppendContent={(blocks) => handleAppendContent(message.id, blocks)}
                          />
                        ))}
                        <div ref={messagesEndRef} />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 输入区域 - 固定在底部；CXO 引导追问演示暗示 */}
                {pendingTourFollowUp && (
                  <div className="flex-shrink-0 px-6 pt-3 pb-1 bg-gradient-to-b from-transparent to-white/80">
                    <p className="text-[13px] text-[#1664FF] text-center">
                      <strong>已引导您进入数据分析页面。</strong>在此可进行追问：稍后将自动填入示例追问并按下发送，您也可直接输入其他问题。
                    </p>
                  </div>
                )}
                <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-[#E8F0FF]">
                  <ChatInput 
                    onSend={handleSend} 
                    disabled={isLoading}
                    placeholder={`向 ${currentAgent.name} 提问...`}
                    agents={AGENTS}
                    currentAgent={currentAgent}
                    onAgentChange={handleAgentChange}
                    isStreaming={isStreaming}
                    onStop={handleStopStreaming}
                    demoFollowUp={pendingTourFollowUp ? { phrase: '为什么下降了？', delayMs: 2500 } : undefined}
                    onDemoComplete={() => setPendingTourFollowUp(false)}
                  />
                </div>
              </div>

              {/* 右侧测试面板 */}
              <TestScenarioPanel
                isOpen={testPanelOpen}
                onToggle={() => setTestPanelOpen(!testPanelOpen)}
                onQuestionSelect={(question, options) => handleSend(question, options?.forceWebSearch, false, options?.questionId)}
              />
            </div>
          </main>

              {/* 多度确认交互已改为在对话中展示，不再需要对话框 */}

              {/* 业务场景面板 */}
          <ScenarioPanel
            isOpen={scenarioPanelOpen}
            onClose={() => setScenarioPanelOpen(false)}
            onScenarioStart={handleScenarioStart}
          />

          {/* 浮动引导助手 - 左上角 */}
          <FloatingGuideAssistant
            onQuestionSelect={(question) => handleSend(question)}
            agentName={currentAgent.name}
            agentAvatar={currentAgent.avatar}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
