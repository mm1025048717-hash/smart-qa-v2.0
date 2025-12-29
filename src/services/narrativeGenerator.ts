/**
 * 叙事生成器 - 覆盖所有测试用例
 * 每个测试问题对应唯一的响应
 */

import { ContentBlock, Message } from '../types';
import { L1_SCENARIOS, B } from './testCaseData';
import { 
  L2_TREND_SCENARIOS, 
  L2_COMPOSITION_SCENARIOS, 
  L2_COMPARE_SCENARIOS 
} from './testCaseDataL2';
import {
  L2_QUADRANT_SCENARIOS,
  L2_GEO_SCENARIOS,
  L2_RANKING_SCENARIOS,
  L2_ANOMALY_SCENARIOS,
  L2_ATTRIBUTION_SCENARIOS,
  L2_PREDICTION_SCENARIOS,
} from './testCaseDataL2More';
import {
  L3_SCENARIOS,
  NARRATIVE_SCENARIOS,
  EDGE_SCENARIOS,
} from './testCaseDataL3Edge';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// ============================================
// 合并所有场景
// ============================================
const ALL_SCENARIOS: Record<string, () => ContentBlock[]> = {
  ...L1_SCENARIOS,
  ...L2_TREND_SCENARIOS,
  ...L2_COMPOSITION_SCENARIOS,
  ...L2_COMPARE_SCENARIOS,
  ...L2_QUADRANT_SCENARIOS,
  ...L2_GEO_SCENARIOS,
  ...L2_RANKING_SCENARIOS,
  ...L2_ANOMALY_SCENARIOS,
  ...L2_ATTRIBUTION_SCENARIOS,
  ...L2_PREDICTION_SCENARIOS,
  ...L3_SCENARIOS,
  ...NARRATIVE_SCENARIOS,
  ...EDGE_SCENARIOS,
};

// ============================================
// 中文问题 → 场景ID 映射（包含所有追问按钮）
// ============================================
const QUERY_TO_SCENARIO: Record<string, string> = {
  // ========== L1 基础查询 ==========
  '今年销售额是多少': 'L1-01',
  '今年销售额是多少？': 'L1-01',
  '本月订单量有多少': 'L1-02',
  '本月订单量有多少？': 'L1-02',
  '当前库存数值': 'L1-03',
  '当前库存数值？': 'L1-03',
  '销售额和订单量': 'L1-04',
  '销售额和订单量？': 'L1-04',
  '看一下营收以及利润': 'L1-05',
  '看一下营收以及利润？': 'L1-05',
  '日活还有月活数据': 'L1-06',
  '日活还有月活数据？': 'L1-06',
  '12月份的销售额环比': 'L1-07',
  '12月份的销售额环比？': 'L1-07',
  '12月的销售额环比': 'L1-07',
  '12月的销售额环比？': 'L1-07',
  
  // L1追问按钮
  '查看各月明细': 'L2-02',
  '各渠道订单量占比': 'L2-07',
  '本月客单价变化': 'L2-04',
  '查看库存预警SKU详情': 'L1-03',
  '分析库存周转效率': 'L1-03',
  '客单价变化趋势': 'L2-04',
  '成本结构分析': 'L2-27',
  '分析成本构成': 'L2-27',
  '利润率月度变化': 'L2-05',
  '分析用户留存率': 'L1-06',
  '新增用户变化': 'L1-06',
  
  // ========== L2 趋势分析 ==========
  '近3个月销售额趋势': 'L2-01',
  '近三个月销售额趋势': 'L2-01',
  '近3个月销售额趋势？': 'L2-01',
  '今年销售额变化情况': 'L2-02',
  '今年销售额变化情况？': 'L2-02',
  '最近一周订单量波动': 'L2-03',
  '最近一周订单量波动大吗': 'L2-03',
  '最近一周订单量波动大吗？': 'L2-03',
  '本月销售额比上月如何': 'L2-04',
  '本月销售额比上月如何？': 'L2-04',
  '对比去年和今年营收': 'L2-05',
  '对比一下去年和今年的营收': 'L2-05',
  'Q3销售额同比增长情况': 'L2-06',
  'Q3销售额同比增长情况？': 'L2-06',
  
  // 趋势追问
  '预测下月趋势': 'L2-28',
  '季度分析': 'L2-06',
  '地区拆解': 'L2-10',
  '分析增长来源': 'L2-25',
  '查看Q4详情': 'L2-06',
  'Q4销售额详细分析': 'L2-06',
  '查看同比': 'L2-05',
  '分析原因': 'L2-25',
  '各季度销售对比': 'L2-06',
  '分析Q3增长驱动因素': 'L2-06',
  
  // ========== L2 构成分析 ==========
  '销售渠道占比分析': 'L2-07',
  '各渠道销售额占比是多少？': 'L2-07',
  '各渠道销售额占比': 'L2-07',
  '各品类销售额构成': 'L2-08',
  '各品类销售额构成是怎样的？': 'L2-08',
  '各品类销售额分布情况': 'L2-08',
  '用户年龄分布比例': 'L2-09',
  
  // 构成追问
  '渠道趋势': 'L2-07',
  '各渠道销售额月度趋势': 'L2-07',
  '渠道效率': 'L2-12',
  '品类趋势': 'L2-08',
  '各品类月度销售趋势': 'L2-08',
  '爆品分析': 'L2-19',
  'TOP10热销产品': 'L2-19',
  '用户消费分析': 'L2-09',
  '高价值用户特征分析': 'L2-15',
  '各年龄段用户增长趋势': 'L2-09',
  
  // ========== L2 维度对比 ==========
  '各地区销售额对比': 'L2-10',
  '各城市销售额排名': 'L2-10',
  '分地区看销量情况': 'L2-10',
  '分产品线看销量': 'L2-11',
  '分产品线看销量排名': 'L2-11',
  '各渠道转化率哪个最好': 'L2-12',
  '各渠道转化率哪个最好？': 'L2-12',
  '各渠道转化率对比': 'L2-12',
  
  // 维度追问
  '分析差异': 'L2-10',
  '分析各地区销售差异原因': 'L2-10',
  '产品趋势': 'L2-11',
  '各产品线月度销量趋势': 'L2-11',
  '利润分析': 'L2-27',
  '各产品线利润贡献': 'L2-27',
  '转化漏斗': 'L2-26',
  '各渠道转化漏斗分析': 'L2-26',
  '流量分析': 'L2-07',
  '各渠道流量来源': 'L2-07',
  
  // ========== L2 双指标评估 ==========
  '分析产品健康度': 'L2-13',
  '分析一下产品健康度': 'L2-13',
  '销售额和利润率的关系': 'L2-14',
  '销售额和利润率有什么关系？': 'L2-14',
  '同时看客单价和复购率': 'L2-15',
  
  // 双指标追问
  '明星产品详情': 'L2-13',
  '分析明星产品增长策略': 'L2-13',
  '优化建议': 'L2-20',
  '瘦狗产品优化建议': 'L2-20',
  '成本分析': 'L2-27',
  '各地区成本结构对比': 'L2-27',
  '效率优化': 'L2-14',
  '华东区运营效率分析': 'L3-01',
  '会员分析': 'L2-15',
  'VIP会员消费特征': 'L2-15',
  '转化策略': 'L2-26',
  '新客转化路径分析': 'L2-26',
  
  // ========== L2 地域分布 ==========
  '各省份销售分布': 'L2-16',
  '查看各省份销售分布': 'L2-16',
  '用户地域分布情况': 'L2-17',
  '各城市订单量热力图': 'L2-18',
  
  // 地域追问
  '广东详情': 'L2-16',
  '广东省城市销售分布': 'L2-16',
  '增速排名': 'L2-19',
  '各省份销售增速排名': 'L2-19',
  '下钻广东': 'L2-16',
  '广东省各城市用户分布': 'L2-16',
  '用户画像': 'L2-09',
  '各地区用户画像对比': 'L2-09',
  '上海详情': 'L2-18',
  '上海各区订单分布': 'L2-18',
  '增长城市': 'L2-19',
  '订单增长最快城市TOP10': 'L2-19',
  
  // ========== L2 排名 ==========
  'TOP10销售城市': 'L2-19',
  '列出TOP10销售城市': 'L2-19',
  '销量最低的5个产品': 'L2-20',
  '销量最低的5个产品是哪些？': 'L2-20',
  '各门店业绩排名': 'L2-21',
  
  // 排名追问
  '成都详情': 'L2-19',
  '分析成都高增长原因': 'L2-19',
  '潜力城市': 'L2-19',
  '发掘高潜力城市': 'L2-19',
  '清仓方案': 'L2-20',
  '制定滞销品清仓策略': 'L2-20',
  '库存预警': 'L1-03',
  '查看库存预警完整列表': 'L1-03',
  '浦东分析': 'L2-21',
  '分析浦东店未达标原因': 'L2-21',
  '对标分析': 'L2-21',
  '高绩效门店成功经验': 'L2-21',
  
  // ========== L2 异常检测 ==========
  '找出异常交易数据': 'L2-22',
  '昨天订单量突降原因': 'L2-23',
  '昨天订单量突降原因是什么？': 'L2-23',
  '检测销售额不正常的区域': 'L2-24',
  '帮我检测销售额不正常的区域': 'L2-24',
  
  // 异常追问
  '查看详情': 'L2-22',
  '异常订单详细信息': 'L2-22',
  '历史对比': 'L2-22',
  '历史异常订单趋势': 'L2-22',
  '检查系统': 'L2-23',
  '检查14点后系统状态': 'L2-23',
  '支付排查': 'L2-23',
  '检查支付通道状态': 'L2-23',
  '东北分析': 'L2-24',
  '深入分析东北区下降原因': 'L2-24',
  '竞品调研': 'L2-24',
  '东北区竞品动态': 'L2-24',
  
  // ========== 归因分析专区（定制化预设答案） ==========
  // ATTR-01: 为什么销售额下降了？
  '为什么销售额下降了': 'ATTR-01',
  '为什么销售额下降了？': 'ATTR-01',
  '销售额为什么下降': 'ATTR-01',
  '销售额下降原因': 'ATTR-01',
  
  // ATTR-02: 分析销售额增长原因
  '分析销售额增长原因': 'ATTR-02',
  '销售额增长原因': 'ATTR-02',
  '销售额为什么增长': 'ATTR-02',
  '增长原因分析': 'ATTR-02',
  
  // ATTR-03: 为什么11月销售额下降了？
  '为什么11月销售额下降了': 'ATTR-03',
  '为什么11月销售额下降了？': 'ATTR-03',
  '11月销售额下降原因': 'ATTR-03',
  '11月销售下降原因': 'ATTR-03',
  
  // ATTR-04: 利润下滑的影响因素有哪些？
  '利润下滑的影响因素有哪些': 'ATTR-04',
  '利润下滑的影响因素有哪些？': 'ATTR-04',
  '利润下滑影响因素': 'ATTR-04',
  '利润下滑原因': 'ATTR-04',
  
  // ATTR-05: 分析转化率偏低的原因
  '分析转化率偏低的原因': 'ATTR-05',
  '转化率偏低原因': 'ATTR-05',
  '转化率低原因': 'ATTR-05',
  '为什么转化率低': 'ATTR-05',
  
  // ATTR-09: 华东区销售下降的原因
  '华东区销售下降的原因': 'ATTR-09',
  '华东区销售下降原因': 'ATTR-09',
  '华东销售下降原因': 'ATTR-09',
  '华东区下降原因': 'ATTR-09',
  
  // ATTR-10: 线上渠道增长的驱动因素
  '线上渠道增长的驱动因素': 'ATTR-10',
  '线上渠道增长驱动因素': 'ATTR-10',
  '线上增长原因': 'ATTR-10',
  '线上渠道增长原因': 'ATTR-10',
  
  // ATTR-11: 产品A销量下滑原因分析
  '产品A销量下滑原因分析': 'ATTR-11',
  '产品A销量下滑原因': 'ATTR-11',
  '产品A下滑原因': 'ATTR-11',
  '产品销量下滑原因': 'ATTR-11',
  
  // ATTR-12: 详细分析华东区下降原因
  '详细分析华东区下降原因': 'ATTR-12',
  '华东区下降详细分析': 'ATTR-12',
  '深入分析华东区下降': 'ATTR-12',
  
  // ========== L2 原因分析（旧版兼容） ==========
  '为什么销售额下降': 'ATTR-01',
  '利润下滑的影响因素': 'ATTR-04',
  
  // 原因追问
  '流量下滑': 'L2-25',
  '分析流量下滑原因': 'L2-25',
  '详情页分析': 'L2-26',
  '商品详情页优化建议': 'L2-26',
  '支付优化': 'L2-26',
  '支付环节优化方案': 'L2-26',
  '促销分析': 'L2-27',
  '优化促销策略建议': 'L2-27',
  '成本控制': 'L2-27',
  '物流成本优化方案': 'L2-27',
  
  // ========== L2 预测 ==========
  '预测下月销售额': 'L2-28',
  '未来一周订单趋势预测': 'L2-29',
  '预计Q4能完成多少营收': 'L2-30',
  '预计Q4能完成多少营收？': 'L2-30',
  
  // 预测追问
  '调整参数': 'L2-28',
  '使用不同参数预测': 'L2-28',
  '预测依据': 'L2-28',
  '查看预测模型详情': 'L2-28',
  '备货建议': 'L2-29',
  '根据预测生成备货建议': 'L2-29',
  '运力规划': 'L2-29',
  '物流运力规划建议': 'L2-29',
  '风险评估': 'L2-30',
  'Q4达成风险因素': 'L2-30',
  '调整目标': 'L2-30',
  '是否需要调整Q4目标': 'L2-30',
  
  // ========== L3 下钻 ==========
  '详细看看华东区数据': 'L3-01',
  '展开说说杭州的情况': 'L3-02',
  '具体到各门店分析': 'L3-03',
  
  // ========== 表格下钻示例 ==========
  '表格下钻示例': 'table-drilldown-example',
  '显示表格下钻': 'table-drilldown-example',
  '表格行下钻': 'table-drilldown-example',
  '各地区销售额对比表格': 'table-drilldown-example',
  
  // ========== 工作流执行 ==========
  '工作流执行': 'workflow-execution-example',
  '工作流执行示例': 'workflow-execution-example',
  '显示工作流': 'workflow-execution-example',
  '销售数据分析工作流': 'workflow-execution-example',
  
  // 下钻追问
  '看杭州详情': 'L3-02',
  '华东区增长驱动因素': 'L3-01',
  '门店分析': 'L3-03',
  '杭州用户画像分析': 'L2-09',
  '武林店分析': 'L3-03',
  '分析武林广场店未达标原因': 'L3-03',
  '最佳实践': 'L3-03',
  '下沙店成功经验分享': 'L3-03',
  
  // ========== 叙事故事 ==========
  '今年销售额是多少（故事版）': 'S-01',
  '讲讲今年销售额的情况': 'S-01',
  '近三个月销售额趋势怎么样': 'S-02',
  '近三个月销售额趋势怎么样？': 'S-02',
  // S-03: 叙事版归因报告（与 ATTR-03 内容不同）
  '详细分析11月销售下降原因': 'S-03',
  '昨天订单量是不是有问题': 'S-04',
  '昨天订单量是不是有问题？': 'S-04',
  '全面分析今年销售情况': 'P-01',
  '销售额下降了': 'G-01',
  '今年业务怎么样': 'E2E-01',
  
  // 叙事追问
  '查看地区分布': 'L2-10',
  '分析渠道构成': 'L2-07',
  '对比去年同期': 'L2-05',
  '各渠道销售趋势': 'L2-07',
  '下钻华东区': 'L3-01',
  '线上各平台表现对比': 'L2-07',
  '历史11月表现规律': 'L2-05',
  '查看系统日志': 'L2-23',
  '检查支付数据': 'L2-23',
  '支付环节异常排查': 'L2-23',
  '历史同日订单表现': 'L2-22',
  '地区分析': 'L2-10',
  '产品分析': 'L2-08',
  '各品类利润率分析': 'L2-27',
  '查看问题详情': 'L2-24',
  '分析东北区下降原因': 'L2-24',
  
  // 智能引导追问
  '本月销售额下降原因分析': 'L2-25',
  '本周销售额下降原因分析': 'L2-25',
  '昨天销售额下降原因分析': 'L2-23',
  '销售额环比分析': 'L2-04',
  '销售额同比分析': 'L2-05',
  '销售额目标达成分析': 'L2-30',
  '销售额下降影响哪些区域': 'L2-10',
  '如何提升销售额': 'E-05',
  
  // ========== 边界条件 ==========
  '2030年销售额趋势': 'E-01',
  '火星地区销售分布': 'E-02',
  '销售': 'E-03',
  '看看数据': 'E-04',
  '帮我分析一下': 'E-05',
  '分析2024年Q1-Q3各地区各产品线销售额同比环比变化趋势并找出异常': 'E-06',
  
  // 边界追问
  '查看2024年数据': 'L1-01',
  '预测下月销售': 'L2-28',
  '近3年销售额趋势': 'L2-05',
  '分析华北区8月下降原因': 'L2-24',
  '导出Q1-Q3分析报告': 'E-06',
  
  // ========== 补充追问映射 ==========
  // 注意：以下查询如果已在上面定义，则不会重复添加
  // 更多追问
  '本月销售额是多少': 'L1-04',
  '查看近3个月趋势': 'L2-01',
  '分析周三订单下降原因': 'L2-23',
};

// ============================================
// 模糊匹配规则 - 按优先级排序
// ============================================
interface MatchRule {
  keywords: string[];
  scenarioId: string;
  priority: number;
  mustIncludeAll?: boolean; // 是否必须包含所有关键词
}

const FUZZY_RULES: MatchRule[] = [
  // 最高优先级 - 特定场景（必须精确匹配多个关键词）
  { keywords: ['华东', '详细'], scenarioId: 'L3-01', priority: 15, mustIncludeAll: true },
  { keywords: ['杭州'], scenarioId: 'L3-02', priority: 15 },
  { keywords: ['门店', '具体'], scenarioId: 'L3-03', priority: 15, mustIncludeAll: true },
  { keywords: ['门店', '排名'], scenarioId: 'L2-21', priority: 14, mustIncludeAll: true },
  { keywords: ['门店', '业绩'], scenarioId: 'L2-21', priority: 14, mustIncludeAll: true },
  
  // 高优先级 - 异常和归因（指向 ATTR-xx 定制化场景）
  { keywords: ['异常', '订单'], scenarioId: 'S-04', priority: 12, mustIncludeAll: true },
  { keywords: ['问题', '订单'], scenarioId: 'S-04', priority: 12, mustIncludeAll: true },
  { keywords: ['异常', '交易'], scenarioId: 'L2-22', priority: 12, mustIncludeAll: true },
  { keywords: ['异常', '区域'], scenarioId: 'L2-24', priority: 12, mustIncludeAll: true },
  { keywords: ['为什么', '销售额', '下降'], scenarioId: 'ATTR-01', priority: 13, mustIncludeAll: true },
  { keywords: ['销售额', '下降', '原因'], scenarioId: 'ATTR-01', priority: 13, mustIncludeAll: true },
  { keywords: ['销售额', '增长', '原因'], scenarioId: 'ATTR-02', priority: 13, mustIncludeAll: true },
  { keywords: ['11月', '销售额', '下降'], scenarioId: 'ATTR-03', priority: 13, mustIncludeAll: true },
  { keywords: ['利润', '下滑', '因素'], scenarioId: 'ATTR-04', priority: 13, mustIncludeAll: true },
  { keywords: ['利润', '下滑', '原因'], scenarioId: 'ATTR-04', priority: 13, mustIncludeAll: true },
  { keywords: ['转化率', '偏低', '原因'], scenarioId: 'ATTR-05', priority: 13, mustIncludeAll: true },
  { keywords: ['华东', '销售', '下降'], scenarioId: 'ATTR-09', priority: 13, mustIncludeAll: true },
  { keywords: ['线上', '渠道', '增长'], scenarioId: 'ATTR-10', priority: 13, mustIncludeAll: true },
  { keywords: ['产品', '销量', '下滑'], scenarioId: 'ATTR-11', priority: 13, mustIncludeAll: true },
  { keywords: ['华东区', '下降', '详细'], scenarioId: 'ATTR-12', priority: 13, mustIncludeAll: true },
  // 兜底归因规则
  { keywords: ['为什么', '下降'], scenarioId: 'ATTR-01', priority: 11, mustIncludeAll: true },
  { keywords: ['下降', '原因'], scenarioId: 'ATTR-01', priority: 11, mustIncludeAll: true },
  { keywords: ['转化率', '偏低'], scenarioId: 'ATTR-05', priority: 11, mustIncludeAll: true },
  { keywords: ['利润', '下滑'], scenarioId: 'ATTR-04', priority: 11, mustIncludeAll: true },
  
  // 预测相关
  { keywords: ['预测', '销售额'], scenarioId: 'L2-28', priority: 10, mustIncludeAll: true },
  { keywords: ['预测', '订单'], scenarioId: 'L2-29', priority: 10, mustIncludeAll: true },
  { keywords: ['预计', 'Q4'], scenarioId: 'L2-30', priority: 10, mustIncludeAll: true },
  { keywords: ['预测'], scenarioId: 'L2-28', priority: 8 },
  
  // 排名相关
  { keywords: ['TOP', '城市'], scenarioId: 'L2-19', priority: 9, mustIncludeAll: true },
  { keywords: ['最低', '产品'], scenarioId: 'L2-20', priority: 9, mustIncludeAll: true },
  { keywords: ['排名'], scenarioId: 'L2-19', priority: 7 },
  
  // 地域相关
  { keywords: ['省份', '分布'], scenarioId: 'L2-16', priority: 8, mustIncludeAll: true },
  { keywords: ['城市', '热力'], scenarioId: 'L2-18', priority: 8, mustIncludeAll: true },
  { keywords: ['地域', '分布'], scenarioId: 'L2-17', priority: 8, mustIncludeAll: true },
  { keywords: ['地区', '对比'], scenarioId: 'L2-10', priority: 7, mustIncludeAll: true },
  
  // 构成分析
  { keywords: ['渠道', '占比'], scenarioId: 'L2-07', priority: 7, mustIncludeAll: true },
  { keywords: ['渠道', '构成'], scenarioId: 'L2-07', priority: 7, mustIncludeAll: true },
  { keywords: ['品类', '构成'], scenarioId: 'L2-08', priority: 7, mustIncludeAll: true },
  { keywords: ['年龄', '分布'], scenarioId: 'L2-09', priority: 7, mustIncludeAll: true },
  
  // 趋势分析
  { keywords: ['12月', '销售额', '环比'], scenarioId: 'L1-07', priority: 9, mustIncludeAll: true },
  { keywords: ['12月份', '销售额', '环比'], scenarioId: 'L1-07', priority: 9, mustIncludeAll: true },
  { keywords: ['趋势', '月'], scenarioId: 'L2-01', priority: 6 },
  { keywords: ['趋势', '周'], scenarioId: 'L2-03', priority: 6 },
  { keywords: ['变化情况'], scenarioId: 'L2-02', priority: 6 },
  { keywords: ['同比', '增长'], scenarioId: 'L2-06', priority: 6 },
  { keywords: ['环比'], scenarioId: 'L2-04', priority: 6 },
  { keywords: ['对比', '去年'], scenarioId: 'L2-05', priority: 6 },
  
  // 双指标
  { keywords: ['健康度'], scenarioId: 'L2-13', priority: 6 },
  { keywords: ['客单价', '复购'], scenarioId: 'L2-15', priority: 6, mustIncludeAll: true },
  { keywords: ['转化率', '对比'], scenarioId: 'L2-12', priority: 6, mustIncludeAll: true },
  
  // 中等优先级 - 通用分析类
  { keywords: ['趋势'], scenarioId: 'L2-01', priority: 4 },
  { keywords: ['地区'], scenarioId: 'L2-10', priority: 4 },
  { keywords: ['渠道'], scenarioId: 'L2-07', priority: 4 },
  { keywords: ['转化'], scenarioId: 'L2-26', priority: 4 },
  { keywords: ['利润'], scenarioId: 'L1-05', priority: 4 },
  { keywords: ['营收'], scenarioId: 'L1-05', priority: 4 },
  // ⚠️ 移除单字"产品"匹配，避免误判模糊意图
  // 产品相关必须结合分析类关键词（必须包含分析类关键词，不能只有"产品"）
  { keywords: ['产品', '分析'], scenarioId: 'L2-08', priority: 5, mustIncludeAll: false }, // 必须包含"分析"
  { keywords: ['产品', '占比'], scenarioId: 'L2-08', priority: 5, mustIncludeAll: false }, // 必须包含"占比"
  { keywords: ['产品', '对比'], scenarioId: 'L2-08', priority: 5, mustIncludeAll: false }, // 必须包含"对比"
  { keywords: ['产品', '趋势'], scenarioId: 'L2-08', priority: 5, mustIncludeAll: false }, // 必须包含"趋势"
  { keywords: ['品类', '分析'], scenarioId: 'L2-08', priority: 5, mustIncludeAll: false }, // 必须包含"分析"
  { keywords: ['品类', '占比'], scenarioId: 'L2-08', priority: 5, mustIncludeAll: false }, // 必须包含"占比"
  // 注意：单字"产品"不会匹配，因为上面的规则要求必须同时包含"产品"和"分析"等关键词
  
  // 低优先级 - 基础查询
  { keywords: ['销售额', '今年'], scenarioId: 'L1-01', priority: 3, mustIncludeAll: true },
  { keywords: ['销售额', '是多少'], scenarioId: 'L1-01', priority: 3, mustIncludeAll: true },
  { keywords: ['订单量', '本月'], scenarioId: 'L1-02', priority: 3, mustIncludeAll: true },
  { keywords: ['库存'], scenarioId: 'L1-03', priority: 3 },
  { keywords: ['日活'], scenarioId: 'L1-06', priority: 3 },
  { keywords: ['月活'], scenarioId: 'L1-06', priority: 3 },
  
  // 最低优先级 - 兜底
  { keywords: ['分析'], scenarioId: 'E-05', priority: 1 },
  { keywords: ['看看'], scenarioId: 'E-04', priority: 1 },
  { keywords: ['数据'], scenarioId: 'E-04', priority: 1 },
];

function fuzzyMatch(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  let bestMatch: { scenarioId: string; score: number } | null = null;
  
  // ⚠️ 先检查是否为模糊意图（单字词），如果是则不进行模糊匹配
  const vagueSingleWords = ['产品', '品类', '商品', '销售', '数据', '看看', '分析', '订单', '用户', '客户', '渠道', '地区', '区域'];
  const isVagueSingleWord = vagueSingleWords.some(word => lowerQuery.trim() === word.toLowerCase());
  if (isVagueSingleWord) {
    return null; // 模糊单字词不匹配任何场景，让系统反问
  }
  
  for (const rule of FUZZY_RULES) {
    if (rule.mustIncludeAll) {
      // 必须包含所有关键词
      const allMatched = rule.keywords.every(kw => lowerQuery.includes(kw));
      if (allMatched) {
        const score = rule.priority * rule.keywords.length * 2; // 完全匹配给更高分
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { scenarioId: rule.scenarioId, score };
        }
      }
    } else {
      // ⚠️ 对于 mustIncludeAll: false 的规则，要求至少匹配2个关键词（避免单字匹配）
      // 这样"产品"不会匹配"产品+分析"规则，只有"产品分析"才会匹配
      const matchCount = rule.keywords.filter(kw => lowerQuery.includes(kw)).length;
      if (matchCount >= 2 || (matchCount === 1 && rule.keywords.length === 1)) {
        // 如果规则只有一个关键词，匹配1个即可；如果有多个关键词，至少匹配2个
        const score = rule.priority * matchCount;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { scenarioId: rule.scenarioId, score };
        }
      }
    }
  }
  
  return bestMatch?.scenarioId || null;
}

// ============================================
// 主入口
// ============================================

// 检查查询是否匹配预设场景（不包含兜底场景）
export function hasMatchedScenario(query: string): boolean {
  // 1. 精确匹配场景ID
  if (ALL_SCENARIOS[query]) {
    return true;
  }
  
  // 2. 精确匹配中文问题
  if (QUERY_TO_SCENARIO[query]) {
    return true;
  }
  
  // 3. 模糊匹配（排除兜底规则）
  const fuzzyScenarioId = fuzzyMatch(query);
  if (fuzzyScenarioId && !['E-04', 'E-05'].includes(fuzzyScenarioId)) {
    return true;
  }
  
  return false;
}

export function generateNarrativeResponse(query: string): ContentBlock[] {
  // 1. 精确匹配场景ID (如 L1-01, S-04 等)
  if (ALL_SCENARIOS[query]) {
    return ALL_SCENARIOS[query]();
  }
  
  // 2. 精确匹配中文问题
  if (QUERY_TO_SCENARIO[query]) {
    const scenarioId = QUERY_TO_SCENARIO[query];
    if (ALL_SCENARIOS[scenarioId]) {
      return ALL_SCENARIOS[scenarioId]();
    }
  }
  
  // 3. 模糊匹配
  const fuzzyScenarioId = fuzzyMatch(query);
  if (fuzzyScenarioId && ALL_SCENARIOS[fuzzyScenarioId]) {
    return ALL_SCENARIOS[fuzzyScenarioId]();
  }
  
  // 4. 默认返回引导页
  return ALL_SCENARIOS['E-04']();
}

// ============================================
// Helper Functions
// ============================================
export function createUserMessage(content: string, agentId?: string): Message {
  return { 
    id: generateId(), 
    role: 'user', 
    content, 
    timestamp: new Date(), 
    status: 'complete',
    agentId,
  };
}

export function createSystemMessage(content: ContentBlock[], agentId?: string): Message {
  return { 
    id: generateId(), 
    role: 'assistant', 
    content, 
    timestamp: new Date(), 
    status: 'complete',
    agentId,
  };
}

export function createLoadingMessage(agentId?: string): Message {
  return { 
    id: generateId(), 
    role: 'assistant', 
    content: [], 
    timestamp: new Date(), 
    status: 'streaming',
    agentId,
  };
}

// 导出构建器供其他模块使用
export { B };
