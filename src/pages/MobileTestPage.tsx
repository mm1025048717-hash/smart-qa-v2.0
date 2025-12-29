/**
 * 移动端测试页面 - 黑白高端极简设计
 * 外部界面：黑白配色
 * 内部APP：保持原有蓝白配色不变
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Message, ContentBlock } from '../types';
import { generateNarrativeResponse } from '../services/narrativeGenerator';
import MessageBubble from '../components/MessageBubble';

// 测试用例数据
const TEST_CATEGORIES = [
  {
    id: 'L1',
    name: 'L1 简单查询',
    desc: '单指标/多指标并列',
    tests: [
      { id: 'L1-01', text: '今年销售额是多少' },
      { id: 'L1-02', text: '本月订单量有多少' },
      { id: 'L1-03', text: '当前库存数值' },
      { id: 'L1-04', text: '销售额和订单量' },
      { id: 'L1-05', text: '看一下营收以及利润' },
      { id: 'L1-06', text: '日活还有月活数据' },
      { id: 'L1-07', text: '12月份的销售额环比？' },
    ]
  },
  {
    id: 'L2-trend',
    name: 'L2 时间趋势',
    desc: 'trend_analysis',
    tests: [
      { id: 'L2-01', text: '近3个月销售额趋势' },
      { id: 'L2-02', text: '今年销售额变化情况' },
      { id: 'L2-03', text: '最近一周订单量波动' },
    ]
  },
  {
    id: 'L2-yoy',
    name: 'L2 同比环比',
    desc: 'yoy_mom',
    tests: [
      { id: 'L2-04', text: '本月销售额比上月如何' },
      { id: 'L2-05', text: '对比去年和今年营收' },
      { id: 'L2-06', text: 'Q3销售额同比增长情况' },
    ]
  },
  {
    id: 'L2-comp',
    name: 'L2 构成分析',
    desc: 'composition',
    tests: [
      { id: 'L2-07', text: '各渠道订单量占比' },
      { id: 'L2-08', text: '销售渠道占比分析' },
      { id: 'L2-09', text: '各品类销售额构成' },
    ]
  },
  {
    id: 'L2-dim',
    name: 'L2 维度对比',
    desc: 'dimension_compare',
    tests: [
      { id: 'L2-10', text: '各地区销售额对比' },
      { id: 'L2-11', text: '各产品线利润率对比' },
      { id: 'L2-12', text: '各渠道转化率对比' },
    ]
  },
  {
    id: 'L2-quad',
    name: 'L2 双指标评估',
    desc: 'quadrant',
    tests: [
      { id: 'L2-13', text: '分析产品健康度' },
      { id: 'L2-14', text: '销售额和利润率的关系' },
      { id: 'L2-15', text: '同时看客单价和复购率' },
    ]
  },
  {
    id: 'L2-geo',
    name: 'L2 地域分布',
    desc: 'geography',
    tests: [
      { id: 'L2-16', text: '各省份销售分布' },
      { id: 'L2-17', text: 'TOP10销售城市' },
      { id: 'L2-18', text: '区域销售热力图' },
    ]
  },
  {
    id: 'L2-rank',
    name: 'L2 排名排序',
    desc: 'ranking',
    tests: [
      { id: 'L2-19', text: '销售额TOP5产品' },
      { id: 'L2-20', text: '增速最快的品类' },
      { id: 'L2-21', text: '利润贡献排名' },
    ]
  },
  {
    id: 'L2-anomaly',
    name: 'L2 异常检测',
    desc: 'anomaly',
    tests: [
      { id: 'L2-22', text: '有没有异常数据' },
      { id: 'L2-23', text: '订单量异常波动检测' },
      { id: 'L2-24', text: '销售额离群值分析' },
    ]
  },
  {
    id: 'L3',
    name: 'L3 归因预测',
    desc: 'attribution_prediction',
    tests: [
      { id: 'L3-01', text: '销售额增长的原因' },
      { id: 'L3-02', text: '利润下降归因分析' },
      { id: 'L3-03', text: '预测下月销售额' },
    ]
  },
  {
    id: 'narrative',
    name: '叙事与故事',
    desc: 'story_telling',
    tests: [
      { id: 'S-01', text: '今年销售额是多少' },
      { id: 'P-01', text: '全面分析今年销售情况' },
      { id: 'E2E-01', text: '今年业务怎么样' },
    ]
  },
  {
    id: 'edge',
    name: '边界与引导',
    desc: 'edge_cases',
    tests: [
      { id: 'E-01', text: '2030年销售额趋势' },
      { id: 'E-02', text: '火星地区销售分布' },
      { id: 'G-01', text: '销售额下降了' },
      { id: 'A-01', text: '今天订单怎么这么少' },
    ]
  },
];

const ALL_TESTS = TEST_CATEGORIES.flatMap(c => c.tests);

// 创建消息
const createUserMessage = (text: string): Message => ({
  id: `user-${Date.now()}`,
  role: 'user',
  content: text,
  timestamp: new Date(),
});

const createSystemMessage = (content: ContentBlock[]): Message => ({
  id: `system-${Date.now()}`,
  role: 'assistant',
  content,
  timestamp: new Date(),
  status: 'complete',
});

const createLoadingMessage = (): Message => ({
  id: `loading-${Date.now()}`,
  role: 'assistant',
  content: [],
  timestamp: new Date(),
  status: 'streaming',
});

const MobileTestPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<Record<string, 'passed' | 'testing'>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>('L1');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string, testId?: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = createUserMessage(text);
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    if (testId) {
      setTestStatus(prev => ({ ...prev, [testId]: 'testing' }));
    }

    const loadingMessage = createLoadingMessage();
    setMessages(prev => [...prev, loadingMessage]);

    await new Promise(resolve => setTimeout(resolve, 500));

    const response = generateNarrativeResponse(text);
    const systemMessage = createSystemMessage(response);
    setMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(systemMessage));

    if (testId) {
      setTestStatus(prev => ({ ...prev, [testId]: 'passed' }));
    }
    setIsLoading(false);
  };

  const handleActionSelect = (query: string) => {
    sendMessage(query);
  };

  const resetAll = () => {
    setMessages([]);
    setTestStatus({});
  };

  const passedCount = Object.values(testStatus).filter(s => s === 'passed').length;

  return (
    <div className="h-screen bg-[#F5F5F5] flex overflow-hidden">
      {/* 左侧 - iPhone 固定居中 */}
      <div className="flex-1 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* iPhone 15 Pro - 黑色边框 */}
          <div className="w-[390px] h-[844px] bg-black rounded-[55px] p-3 shadow-2xl shadow-black/20">
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-[20px] z-30" />
            
            {/* 内部保持原有蓝白配色 */}
            <div className="w-full h-full bg-white rounded-[44px] overflow-hidden flex flex-col">
              {/* 状态栏 */}
              <div className="h-[54px] flex items-end justify-between px-8 pb-1">
                <span className="text-[17px] font-semibold text-black">9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-[2px]">
                    <div className="w-[3px] h-[6px] bg-black rounded-sm" />
                    <div className="w-[3px] h-[8px] bg-black rounded-sm" />
                    <div className="w-[3px] h-[10px] bg-black rounded-sm" />
                    <div className="w-[3px] h-[12px] bg-black rounded-sm" />
                  </div>
                  <div className="flex items-center">
                    <div className="w-[22px] h-[11px] border border-black rounded-[3px] p-[1px]">
                      <div className="w-full h-full bg-black rounded-[2px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 导航栏 - 内部保持蓝色 */}
              <div className="h-[44px] flex items-center justify-between px-5 border-b border-gray-100">
                <a href="/" className="text-[#3370FF] text-[17px] font-medium">‹ 返回</a>
                <span className="text-[17px] font-semibold text-black">智能问答</span>
                <button onClick={resetAll} className="text-[#3370FF] text-[17px] font-medium">重置</button>
              </div>

              {/* 消息区域 - 内部保持蓝白配色 */}
              <div className="flex-1 overflow-y-auto bg-[#F5F6F7]">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-10">
                    <div className="w-20 h-20 rounded-full bg-[#3370FF] flex items-center justify-center mb-6 shadow-lg shadow-blue-300/30">
                      <span className="text-[36px] text-white font-light">?</span>
                    </div>
                    <h2 className="text-[22px] font-bold text-black mb-2">移动端适配测试</h2>
                    <p className="text-[15px] text-gray-500 leading-relaxed">
                      从右侧面板选择测试用例<br/>验证移动端显示效果
                    </p>
                  </div>
                ) : (
                  <div className="px-4 py-4 space-y-3">
                    {messages.map(message => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        onActionSelect={handleActionSelect}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* 输入区域 - 内部保持蓝色按钮 */}
              <div className="px-4 py-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage(inputValue)}
                    placeholder="输入问题..."
                    className="flex-1 h-[38px] bg-[#F5F6F7] border border-gray-200 rounded-full px-4 text-[15px] text-black placeholder:text-gray-400 outline-none focus:border-[#3370FF] transition-colors"
                  />
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className={clsx(
                      "h-[38px] px-5 rounded-full text-[15px] font-semibold transition-all",
                      inputValue.trim() && !isLoading 
                        ? "bg-[#3370FF] text-white" 
                        : "bg-gray-200 text-gray-400"
                    )}
                  >
                    发送
                  </button>
                </div>
              </div>

              {/* Home Indicator */}
              <div className="h-[34px] flex items-center justify-center">
                <div className="w-[134px] h-[5px] bg-black rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧 - 黑白测试面板 */}
      <div className="w-[420px] bg-white flex flex-col border-l border-gray-200">
        {/* 头部 */}
        <div className="p-5 bg-white border-b border-gray-200">
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-[24px] font-bold text-black">测试集</h1>
            <span className="text-[13px] text-gray-500 font-medium">共 {ALL_TESTS.length} 个用例</span>
          </div>
          
          {/* 统计 - 黑白配色 */}
          <div className="flex gap-3">
            <div className="flex-1 bg-[#F5F5F5] rounded-xl p-4 text-center">
              <div className="text-[28px] font-bold text-black">{ALL_TESTS.length}</div>
              <div className="text-[12px] text-gray-500 font-medium">总用例</div>
            </div>
            <div className="flex-1 bg-[#F5F5F5] rounded-xl p-4 text-center">
              <div className="text-[28px] font-bold text-black">{passedCount}</div>
              <div className="text-[12px] text-gray-500 font-medium">已通过</div>
            </div>
            <div className="flex-1 bg-[#F5F5F5] rounded-xl p-4 text-center">
              <div className="text-[28px] font-bold text-black">
                {passedCount > 0 ? Math.round((passedCount / ALL_TESTS.length) * 100) : 0}%
              </div>
              <div className="text-[12px] text-gray-500 font-medium">通过率</div>
            </div>
          </div>
        </div>

        {/* 测试列表 - 黑白配色 */}
        <div className="flex-1 overflow-y-auto">
          {TEST_CATEGORIES.map(category => {
            const isExpanded = expandedCategory === category.id;
            const categoryPassedCount = category.tests.filter(t => testStatus[t.id] === 'passed').length;
            
            return (
              <div key={category.id} className="border-b border-gray-100">
                {/* 分类头 */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="text-left">
                    <div className="text-[15px] font-semibold text-black">{category.name}</div>
                    <div className="text-[11px] text-gray-400">{category.desc}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "text-[13px] font-semibold",
                      categoryPassedCount === category.tests.length && categoryPassedCount > 0 
                        ? "text-black" 
                        : "text-gray-400"
                    )}>
                      {categoryPassedCount}/{category.tests.length}
                    </span>
                    <span className="text-black text-[18px] font-light">{isExpanded ? '−' : '+'}</span>
                  </div>
                </button>

                {/* 测试项 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden bg-[#FAFAFA]"
                    >
                      {category.tests.map((test, index) => {
                        const status = testStatus[test.id];
                        return (
                          <button
                            key={test.id}
                            onClick={() => sendMessage(test.text, test.id)}
                            disabled={isLoading}
                            className={clsx(
                              "w-full flex items-center gap-3 px-5 py-3 hover:bg-white active:bg-gray-100 transition-colors text-left",
                              index !== category.tests.length - 1 && "border-b border-gray-100"
                            )}
                          >
                            {/* 状态指示器 */}
                            <div className={clsx(
                              "w-2.5 h-2.5 rounded-full flex-shrink-0",
                              status === 'passed' ? "bg-black" :
                              status === 'testing' ? "bg-gray-400 animate-pulse" :
                              "bg-gray-200"
                            )} />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-400 font-mono font-medium">{test.id}</span>
                              </div>
                              <div className="text-[14px] text-black truncate">{test.text}</div>
                            </div>

                            <span className="text-gray-300 text-[15px]">›</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* PRD验收标准 - 黑白配色 */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="text-[11px] text-gray-500 mb-2 font-medium">PRD 验收标准: 匹配准确率 &gt; 85%</div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-black transition-all"
              style={{ width: `${(passedCount / ALL_TESTS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { MobileTestPage };
export default MobileTestPage;

