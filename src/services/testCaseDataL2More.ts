/**
 * L2层级更多测试用例 - 排名、双指标、地域、异常、归因、预测
 */

import { ContentBlock } from '../types';
import { B } from './testCaseData';

// ============================================
// L2 双指标评估 & 排名
// ============================================
export const L2_QUADRANT_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L2-13: 分析产品健康度 - 四象限分析
  'L2-13': () => [
    B.visualizer([
      { id: 'ds_213', type: 'datasource', label: '数据源', value: '产品表', removable: false },
      { id: 'gb_213', type: 'groupby', label: '按', value: '产品 分析' },
      { id: 'dt_213', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_213', type: 'filter', label: '指标', value: '销售额,利润率' },
    ]),
    B.heading(' 产品健康度四象限分析'),
    B.text('基于销售额和利润率两个维度，对产品进行分类：'),
    B.scatterChart({
      data: [
        { name: '旗舰A', x: 850, y: 32, category: '明星' },
        { name: '旗舰B', x: 720, y: 28, category: '明星' },
        { name: '标准C', x: 450, y: 18, category: '金牛' },
        { name: '标准D', x: 380, y: 22, category: '金牛' },
        { name: '入门E', x: 180, y: 8, category: '问题' },
        { name: '入门F', x: 120, y: 5, category: '瘦狗' },
        { name: '配件G', x: 280, y: 35, category: '明星' },
      ],
      xKey: 'x',
      yKey: 'y',
      xLabel: '销售额（万）',
      yLabel: '利润率（%）',
      title: '产品四象限分布',
      quadrants: [
        { label: '明星产品', position: 'top-right' },
        { label: '金牛产品', position: 'bottom-right' },
        { label: '问题产品', position: 'top-left' },
        { label: '瘦狗产品', position: 'bottom-left' },
      ],
      summary: [
        { label: '分析产品数', value: '7', unit: '个' },
        { label: '明星产品', value: '3', unit: '个', highlight: true },
        { label: '平均利润率', value: '22.9', unit: '%' },
      ],
    }),
    B.text('**四象限解读**：\n\n**明星产品**（高销售额+高利润）：旗舰A、旗舰B、配件G\n**金牛产品**（高销售额+低利润）：标准C、标准D\n**问题产品**（低销售额+高利润）：暂无\n**瘦狗产品**（低销售额+低利润）：入门E、入门F'),
    B.insight('建议', '入门系列利润率过低，建议优化成本结构或调整定价策略。', 'warning'),
    B.actions([
      { id: '1', label: '明星产品详情', query: '分析明星产品增长策略', icon: 'search' },
      { id: '2', label: '优化建议', query: '瘦狗产品优化建议', icon: 'bar' },
    ]),
  ],

  // L2-14: 销售额和利润率的关系 - 需业务阈值配置
  'L2-14': () => [
    B.visualizer([
      { id: 'ds_214', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_214', type: 'groupby', label: '按', value: '地区 散点' },
      { id: 'dt_214', type: 'date', label: '日期', value: '2024年' },
      { id: 'ft_214', type: 'filter', label: '指标', value: '销售额vs利润率' },
    ]),
    B.heading('💹 销售额与利润率关系分析'),
    B.scatterChart({
      data: [
        { name: '华东', sales: 1250, margin: 22.5 },
        { name: '华南', sales: 980, margin: 24.8 },
        { name: '华北', sales: 720, margin: 21.2 },
        { name: '华中', sales: 510, margin: 26.1 },
        { name: '西南', sales: 250, margin: 28.5 },
        { name: '东北', sales: 146, margin: 19.8 },
      ],
      xKey: 'sales',
      yKey: 'margin',
      xLabel: '销售额（万）',
      yLabel: '利润率（%）',
      title: '地区销售额vs利润率',
      trendLine: true,
      summary: [
        { label: '总销售额', value: '3,856', unit: '万元', highlight: true },
        { label: '平均利润率', value: '23.8', unit: '%' },
        { label: '相关系数', value: '-0.42', unit: '' },
      ],
    }),
    B.text('**相关性分析**：\n\n销售额与利润率呈现**负相关**趋势（r=-0.42）\n\n• **西南**：销售额最低但利润率最高（28.5%）\n• **华东**：销售额最高但利润率中等（22.5%）\n• 可能原因：高销售额地区竞争激烈，需更多促销投入'),
    B.insight('发现', '规模效应未体现，大区反而利润率偏低，需优化运营效率。', 'warning'),
    B.actions([
      { id: '1', label: '成本分析', query: '各地区成本结构对比', icon: 'pie' },
      { id: '2', label: '效率优化', query: '华东区运营效率分析', icon: 'search' },
    ]),
  ],

  // L2-15: 同时看客单价和复购率 - 散点图分析
  'L2-15': () => [
    B.heading('客单价与复购率关系'),
    B.scatterChart({
      data: [
        { name: '会员A', avgOrder: 580, repurchase: 4.2 },
        { name: '会员B', avgOrder: 420, repurchase: 3.8 },
        { name: '普通C', avgOrder: 280, repurchase: 1.5 },
        { name: '普通D', avgOrder: 320, repurchase: 2.1 },
        { name: '新客E', avgOrder: 180, repurchase: 0.8 },
        { name: '新客F', avgOrder: 220, repurchase: 1.2 },
      ],
      xKey: 'avgOrder',
      yKey: 'repurchase',
      xLabel: '客单价（元）',
      yLabel: '复购率（次/年）',
      title: '客单价vs复购率',
      trendLine: true,
      summary: [
        { label: '用户总数', value: '14.3', unit: '万人', highlight: true },
        { label: '平均客单价', value: '333', unit: '元' },
        { label: '平均复购率', value: '2.27', unit: '次/年' },
      ],
    }),
    B.text('**用户分层洞察**：\n\n客单价与复购率呈现**强正相关**（r=0.87）\n\n• **高价值会员**：客单价500+，年均复购4次以上\n• **普通用户**：客单价280-320，年均复购1.5-2次\n• **新客**：客单价180-220，复购率低于1次'),
    B.kpiGroup([
      { id: 'vip', label: 'VIP会员数', value: 12500, trend: { value: 15, direction: 'up' } },
      { id: 'normal', label: '普通会员', value: 85000, trend: { value: 8, direction: 'up' } },
      { id: 'new', label: '新客数', value: 45000, trend: { value: 22, direction: 'up' } },
    ]),
    B.insight('策略', '重点提升新客向普通会员的转化，设置首单优惠券激励复购。', 'success'),
    B.actions([
      { id: '1', label: '会员分析', query: 'VIP会员消费特征', icon: 'search' },
      { id: '2', label: '转化策略', query: '新客转化路径分析', icon: 'bar' },
    ]),
  ],
};

// ============================================
// L2 地域分布
// ============================================
export const L2_GEO_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L2-16: 各省份销售分布 - 地图可视化
  'L2-16': () => [
    B.heading('🗺️ 全国省份销售分布'),
    B.text('地图热力展示各省份销售密度：'),
    B.mapChart({
      type: 'china',
      data: [
        { province: '广东', value: 580 },
        { province: '江苏', value: 450 },
        { province: '浙江', value: 420 },
        { province: '山东', value: 310 },
        { province: '河南', value: 280 },
        { province: '四川', value: 250 },
        { province: '湖北', value: 230 },
        { province: '北京', value: 220 },
        { province: '上海', value: 210 },
        { province: '河北', value: 180 },
      ],
      title: '省份销售热力图（万元）',
      summary: [
        { label: '覆盖省份', value: '31', unit: '个' },
        { label: '全国总计', value: '3,130', unit: '万元', highlight: true },
      ],
    }),
    B.barChart({
      data: [
        { province: '广东', value: 580 },
        { province: '江苏', value: 450 },
        { province: '浙江', value: 420 },
        { province: '山东', value: 310 },
        { province: '河南', value: 280 },
      ],
      xKey: 'province',
      yKey: 'value',
      title: 'TOP5省份销售额（万元）',
      summary: [
        { label: 'TOP5合计', value: '2,040', unit: '万元', highlight: true },
        { label: '占全国比例', value: '65.2', unit: '%' },
      ],
    }),
    B.text('**区域特征**：\n\n• **沿海经济带**：广东+江苏+浙江贡献 **37.6%**\n• **中部崛起**：河南+湖北增速超20%\n• **西部潜力**：四川市场快速增长'),
    B.actions([
      { id: '1', label: '广东详情', query: '广东省城市销售分布', icon: 'map' },
      { id: '2', label: '增速排名', query: '各省份销售增速排名', icon: 'bar' },
    ]),
  ],

  // L2-17: 用户地域分布情况 - 支持省/市下钻
  'L2-17': () => [
    B.heading('用户地域分布'),
    B.mapChart({
      type: 'china',
      data: [
        { province: '广东', value: 125000 },
        { province: '江苏', value: 98000 },
        { province: '浙江', value: 89000 },
        { province: '北京', value: 78000 },
        { province: '上海', value: 72000 },
        { province: '四川', value: 65000 },
        { province: '山东', value: 58000 },
        { province: '河南', value: 52000 },
      ],
      title: '用户地域分布',
      metric: '用户数',
      summary: [
        { label: '用户总数', value: '85.6', unit: '万人', highlight: true },
        { label: 'TOP3占比', value: '36.4', unit: '%' },
      ],
    }),
    B.kpiGroup([
      { id: 'total', label: '注册用户总数', value: 856000 },
      { id: 'top3', label: 'TOP3省份占比', value: '36.4%' },
      { id: 'coverage', label: '覆盖省份', value: '31个' },
    ]),
    B.text('**用户分布特征**：\n\n1. **广东省** 用户最多（12.5万），占比14.6%\n2. 长三角（江浙沪）合计占比30.2%\n3. 一线城市用户活跃度更高'),
    B.actions([
      { id: '1', label: '下钻广东', query: '广东省各城市用户分布', icon: 'map' },
      { id: '2', label: '用户画像', query: '各地区用户画像对比', icon: 'bar' },
    ]),
  ],

  // L2-18: 各城市订单量热力图
  'L2-18': () => [
    B.heading('城市订单热力分布'),
    B.mapChart({
      type: 'china-city',
      data: [
        { city: '上海', value: 18500, lat: 31.23, lng: 121.47 },
        { city: '北京', value: 16800, lat: 39.90, lng: 116.40 },
        { city: '深圳', value: 15200, lat: 22.54, lng: 114.06 },
        { city: '广州', value: 14100, lat: 23.13, lng: 113.26 },
        { city: '杭州', value: 12800, lat: 30.27, lng: 120.15 },
        { city: '成都', value: 9500, lat: 30.57, lng: 104.07 },
        { city: '重庆', value: 8900, lat: 29.56, lng: 106.55 },
        { city: '南京', value: 8200, lat: 32.06, lng: 118.80 },
      ],
      title: '城市订单热力图',
      heatmap: true,
      summary: [
        { label: '覆盖城市', value: '8', unit: '个', highlight: true },
        { label: '订单总量', value: '104,000', unit: '单' },
      ],
    }),
    B.barChart({
      data: [
        { city: '上海', orders: 18500 },
        { city: '北京', orders: 16800 },
        { city: '深圳', orders: 15200 },
        { city: '广州', orders: 14100 },
        { city: '杭州', orders: 12800 },
      ],
      xKey: 'city',
      yKey: 'orders',
      title: 'TOP5城市订单量',
      summary: [
        { label: 'TOP5合计', value: '77,400', unit: '单', highlight: true },
        { label: '占总量比', value: '74.4', unit: '%' },
      ],
    }),
    B.text('**热力分析**：\n\n• **一线城市** 订单集中度高，TOP4贡献51.6%订单\n• **新一线城市** 增速快，杭州、成都年增长超30%\n• **区域中心** 辐射效应明显'),
    B.actions([
      { id: '1', label: '上海详情', query: '上海各区订单分布', icon: 'map' },
      { id: '2', label: '增长城市', query: '订单增长最快城市TOP10', icon: 'bar' },
    ]),
  ],
};

// ============================================
// L2 排名排序
// ============================================
export const L2_RANKING_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L2-19: TOP10销售城市
  'L2-19': () => [
    B.heading('🏆 TOP10销售城市排名'),
    B.barChart({
      data: [
        { city: '上海', value: 520, growth: 18 },
        { city: '北京', value: 480, growth: 15 },
        { city: '深圳', value: 450, growth: 22 },
        { city: '广州', value: 410, growth: 16 },
        { city: '杭州', value: 380, growth: 28 },
        { city: '成都', value: 320, growth: 32 },
        { city: '重庆', value: 300, growth: 25 },
        { city: '苏州', value: 290, growth: 20 },
        { city: '武汉', value: 270, growth: 18 },
        { city: '南京', value: 250, growth: 21 },
      ],
      xKey: 'city',
      yKey: 'value',
      title: '城市销售额排名（万元）',
      horizontal: true,
      summary: [
        { label: 'TOP10合计', value: '3,670', unit: '万元', highlight: true },
        { label: '占比', value: '88.4', unit: '%' },
        { label: '平均增速', value: '+21.5', unit: '%' },
      ],
    }),
    B.text('**排名解读**：\n\n**上海** 以520万领跑，持续保持第一\n**北京** 480万紧随其后\n**深圳** 450万，增速最快（+22%）\n\n**高增长城市**：成都（+32%）、杭州（+28%）、重庆（+25%）'),
    B.kpi({
      id: 'top10',
      label: 'TOP10城市贡献',
      value: '88.4%',
      trend: { value: 2.1, direction: 'up', label: '占比提升' },
    }),
    B.actions([
      { id: '1', label: '成都详情', query: '分析成都高增长原因', icon: 'search' },
      { id: '2', label: '潜力城市', query: '发掘高潜力城市', icon: 'map' },
    ]),
  ],

  // L2-20: 销量最低的5个产品
  'L2-20': () => [
    B.heading(' 销量最低产品 Top5'),
    B.barChart({
      data: [
        { product: '老款配件A', value: 12, stock: 850 },
        { product: '过季款B', value: 15, stock: 620 },
        { product: '滞销型号C', value: 18, stock: 1200 },
        { product: '停产预备D', value: 23, stock: 380 },
        { product: '换代产品E', value: 28, stock: 450 },
      ],
      xKey: 'product',
      yKey: 'value',
      title: '低销量产品（月销量/件）',
      color: '#ef4444',
      summary: [
        { label: '滞销产品数', value: '5', unit: '个' },
        { label: '月总销量', value: '96', unit: '件' },
        { label: '库存积压', value: '3,500', unit: '件', highlight: true },
      ],
    }),
    B.text('**问题产品分析**：\n\n 这5个SKU月销量均低于30件，需要重点关注：\n\n• **老款配件A**：月销仅12件，库存850件，预计消化周期71个月\n• **滞销型号C**：库存积压最严重（1200件）\n• **换代产品E**：受新品影响，建议清仓'),
    B.insight('建议', '建议启动清仓促销，对库存超6个月的产品进行降价处理，释放资金。', 'warning'),
    B.actions([
      { id: '1', label: '清仓方案', query: '制定滞销品清仓策略', icon: 'search' },
      { id: '2', label: '库存预警', query: '查看库存预警完整列表', icon: 'bar' },
    ]),
  ],

  // L2-21: 各门店业绩排名
  'L2-21': () => [
    B.heading('门店业绩排名'),
    B.barChart({
      data: [
        { store: '旗舰店-淮海路', value: 185, target: 180, rate: 102.8 },
        { store: '旗舰店-南京路', value: 172, target: 175, rate: 98.3 },
        { store: '标准店-徐汇', value: 128, target: 120, rate: 106.7 },
        { store: '标准店-浦东', value: 115, target: 125, rate: 92.0 },
        { store: '社区店-虹口', value: 68, target: 70, rate: 97.1 },
      ],
      xKey: 'store',
      yKey: 'value',
      title: '门店月销售额（万元）',
      summary: [
        { label: '门店总数', value: '5', unit: '家' },
        { label: '总销售额', value: '668', unit: '万元', highlight: true },
        { label: '达标率', value: '60', unit: '%' },
      ],
    }),
    B.text('**门店绩效分析**：\n\n**达标门店**（3家）：\n• 淮海路旗舰店：102.8%达成率\n• 徐汇标准店：106.7%达成率（最佳）\n• 虹口社区店：97.1%达成率\n\n**未达标门店**（2家）：\n• 南京路旗舰店：98.3%（差2.9万）\n• 浦东标准店：92.0%（差10万）'),
    B.insight('关注', '浦东标准店连续2月未达标，需分析原因并制定改进方案。', 'warning'),
    B.actions([
      { id: '1', label: '浦东分析', query: '分析浦东店未达标原因', icon: 'search' },
      { id: '2', label: '对标分析', query: '高绩效门店成功经验', icon: 'bar' },
    ]),
  ],
};

// ============================================
// L2 异常检测
// ============================================
export const L2_ANOMALY_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L2-22: 找出异常交易数据 - 箱线图
  'L2-22': () => [
    B.visualizer([
      { id: 'ds_222', type: 'datasource', label: '数据源', value: '订单表', removable: false },
      { id: 'gb_222', type: 'groupby', label: '按', value: '订单ID 检测' },
      { id: 'dt_222', type: 'date', label: '日期', value: '最近7天' },
      { id: 'ft_222', type: 'filter', label: '异常类型', value: '金额异常' },
    ]),
    B.heading('异常交易检测'),
    B.boxPlot({
      data: {
        min: 85,
        q1: 180,
        median: 268,
        q3: 420,
        max: 580,
        outliers: [1850, 2200, 3500, 45, 52],
      },
      title: '订单金额分布（元）',
      summary: [
        { label: '订单总数', value: '11,528', unit: '笔', highlight: true },
        { label: '异常订单', value: '5', unit: '笔' },
        { label: '中位数', value: '268', unit: '元' },
      ],
    }),
    B.text('**异常检测结果**：\n\n共发现 **5笔异常交易**：\n\n **高额异常**（3笔）：\n• 订单#A8821：¥3,500（正常均值10倍+）\n• 订单#A8756：¥2,200\n• 订单#A8692：¥1,850\n\n **低额异常**（2笔）：\n• 订单#A8834：¥45（疑似测试订单）\n• 订单#A8812：¥52'),
    B.barChart({
      data: [
        { type: '正常订单', count: 11523 },
        { type: '高额异常', count: 3 },
        { type: '低额异常', count: 2 },
      ],
      xKey: 'type',
      yKey: 'count',
      title: '订单分类统计',
      summary: [
        { label: '异常率', value: '0.04', unit: '%' },
        { label: '需审核', value: '5', unit: '笔', highlight: true },
      ],
    }),
    B.actions([
      { id: '1', label: '查看详情', query: '异常订单详细信息', icon: 'search' },
      { id: '2', label: '历史对比', query: '历史异常订单趋势', icon: 'trend' },
    ]),
  ],

  // L2-23: 昨天订单量突降原因 - 异常点归因
  'L2-23': () => [
    B.visualizer([
      { id: 'ds_223', type: 'datasource', label: '数据源', value: '订单表', removable: false },
      { id: 'gb_223', type: 'groupby', label: '按', value: '小时 分析' },
      { id: 'dt_223', type: 'date', label: '日期', value: '昨天' },
      { id: 'ft_223', type: 'filter', label: '异常类型', value: '订单突降' },
    ]),
    B.heading(' 昨日订单异常分析'),
    B.kpi({
      id: 'yesterday',
      label: '昨日订单量',
      value: 850,
      unit: '单',
      trend: { value: 28.5, direction: 'down', label: '环比前日' },
    }),
    B.lineChart({
      data: [
        { date: '12/1', value: 1150, baseline: 1100 },
        { date: '12/2', value: 1220, baseline: 1120 },
        { date: '12/3', value: 1180, baseline: 1150 },
        { date: '12/4', value: 850, baseline: 1180, anomaly: true },
      ],
      xKey: 'date',
      yKeys: [
        { key: 'value', name: '实际订单', color: '#ef4444' },
        { key: 'baseline', name: '预期值', color: '#94a3b8', dashArray: '5,5' },
      ],
      title: '近4日订单趋势',
      annotations: [{ date: '12/4', label: '异常点' }],
      summary: [
        { label: '近4日总订单', value: '4,400', unit: '单' },
        { label: '异常缺口', value: '-330', unit: '单', highlight: true },
        { label: '异常影响', value: '-28.5', unit: '%' },
      ],
    }),
    B.text('**异常定位**：\n\n异常时段：**14:00-18:00**\n• 该时段通常贡献35%订单\n• 昨日仅贡献18%\n• 缺口约 **280单**'),
    B.barChart({
      data: [
        { hour: '10-12', normal: 180, actual: 175 },
        { hour: '12-14', normal: 220, actual: 210 },
        { hour: '14-16', normal: 250, actual: 95 },
        { hour: '16-18', normal: 230, actual: 85 },
        { hour: '18-20', normal: 180, actual: 165 },
      ],
      xKey: 'hour',
      yKey: 'actual',
      title: '各时段订单对比',
      summary: [
        { label: '异常时段', value: '14:00-18:00', unit: '', highlight: true },
        { label: '订单缺口', value: '-300', unit: '单' },
        { label: '损失金额', value: '~8万', unit: '元' },
      ],
    }),
    B.insight('可能原因', '14:00-18:00时段断崖式下跌，疑似支付系统故障或服务器异常。', 'danger'),
    B.actions([
      { id: '1', label: '检查系统', query: '检查14点后系统状态', icon: 'search' },
      { id: '2', label: '支付排查', query: '检查支付通道状态', icon: 'bar' },
    ]),
  ],

  // L2-24: 检测销售额不正常的区域 - 高亮异常值
  'L2-24': () => [
    B.heading('🚨 区域销售异常检测'),
    B.barChart({
      data: [
        { region: '华东', value: 1250, status: 'normal' },
        { region: '华南', value: 980, status: 'normal' },
        { region: '华北', value: 720, status: 'normal' },
        { region: '华中', value: 510, status: 'normal' },
        { region: '西南', value: 250, status: 'warning' },
        { region: '东北', value: 146, status: 'danger' },
      ],
      xKey: 'region',
      yKey: 'value',
      title: '区域销售额（万元）',
      colorByStatus: true,
      summary: [
        { label: '全国总计', value: '3,856', unit: '万元', highlight: true },
        { label: '异常地区', value: '2', unit: '个' },
        { label: '需关注', value: '东北', unit: '' },
      ],
    }),
    B.text('**异常检测结果**：\n\n🔴 **东北地区**（严重异常）：\n• 销售额146万，同比下降 **32%**\n• 偏离度超过2个标准差\n• 需立即关注\n\n🟡 **西南地区**（轻度异常）：\n• 销售额250万，环比下降 **15%**\n• 可能受区域活动影响'),
    B.insight('诊断', '东北区域下降主要受当地经济环境和竞品冲击影响，建议启动专项调研。', 'danger'),
    B.actions([
      { id: '1', label: '东北分析', query: '深入分析东北区下降原因', icon: 'search' },
      { id: '2', label: '竞品调研', query: '东北区竞品动态', icon: 'bar' },
    ]),
  ],
};

// ============================================
// L2 原因分析 - 归因分析专区
// ============================================
export const L2_ATTRIBUTION_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // ========== ATTR-01: 为什么销售额下降了？ ==========
  'ATTR-01': () => [
    B.visualizer([
      { id: 'ds_a01', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_a01', type: 'groupby', label: '按', value: '多维度归因' },
      { id: 'dt_a01', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_a01', type: 'filter', label: '分析', value: '下降归因' },
    ]),
    B.heading('🔍 销售额下降原因归因分析'),
    B.kpi({
      id: 'sales_drop',
      label: '本月销售额',
      value: 3200000,
      prefix: '¥',
      trend: { value: 12.5, direction: 'down', label: '环比下降' },
      hideAttribution: true, // 直接问归因的场景，不显示归因按钮
    }),
    B.text('销售额环比下降 **12.5%**（约46万），以下是归因分析结果：'),
    B.pieChart({
      data: [
        { name: '促销活动减少', value: 35 },
        { name: '华东区异常', value: 28 },
        { name: '线上流量下滑', value: 22 },
        { name: '新品延迟上市', value: 15 },
      ],
      title: '下降原因归因占比',
      summary: [
        { label: '主因', value: '促销减少', unit: '35%', highlight: true },
        { label: '影响金额', value: '-46', unit: '万元' },
      ],
    }),
    B.barChart({
      data: [
        { factor: '促销活动减少', impact: -16.1, contribution: 35 },
        { factor: '华东区异常', impact: -12.9, contribution: 28 },
        { factor: '线上流量下滑', impact: -10.1, contribution: 22 },
        { factor: '新品延迟上市', impact: -6.9, contribution: 15 },
      ],
      xKey: 'factor',
      yKey: 'impact',
      title: '各因素影响金额（万元）',
      color: '#ef4444',
      summary: [
        { label: '总下降金额', value: '-46', unit: '万元', highlight: true },
        { label: '可优化空间', value: '~30', unit: '万元' },
      ],
    }),
    B.insight('归因结论', '促销活动减少是主要原因（35%），建议下月增加2-3场促销活动。华东区需专项排查。', 'warning'),
    B.actions([
      { id: '1', label: '华东区详情', query: '华东区销售下降的原因', icon: 'search' },
      { id: '2', label: '优化促销', query: '优化促销策略建议', icon: 'trend' },
    ]),
  ],

  // ========== ATTR-02: 分析销售额增长原因 ==========
  'ATTR-02': () => [
    B.visualizer([
      { id: 'ds_a02', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_a02', type: 'groupby', label: '按', value: '多维度归因' },
      { id: 'dt_a02', type: 'date', label: '日期', value: '本季度' },
      { id: 'ft_a02', type: 'filter', label: '分析', value: '增长归因' },
    ]),
    B.heading('📈 销售额增长原因归因分析'),
    B.kpi({
      id: 'sales_growth',
      label: '本季度销售额',
      value: 10560000,
      prefix: '¥',
      trend: { value: 18.5, direction: 'up', label: '同比增长' },
      hideAttribution: true,
    }),
    B.text('销售额同比增长 **18.5%**（约165万），以下是增长驱动因素拆解：'),
    B.pieChart({
      data: [
        { name: '线上渠道扩张', value: 42 },
        { name: '新品爆发', value: 28 },
        { name: '华东区增长', value: 18 },
        { name: '会员复购提升', value: 12 },
      ],
      title: '增长驱动因素占比',
      summary: [
        { label: '主驱动', value: '线上渠道', unit: '42%', highlight: true },
        { label: '增长金额', value: '+165', unit: '万元' },
      ],
    }),
    B.barChart({
      data: [
        { factor: '线上渠道扩张', impact: 69.3, growth: 35 },
        { factor: '新品爆发', impact: 46.2, growth: 28 },
        { factor: '华东区增长', impact: 29.7, growth: 22 },
        { factor: '会员复购提升', impact: 19.8, growth: 15 },
      ],
      xKey: 'factor',
      yKey: 'impact',
      title: '各因素贡献金额（万元）',
      color: '#10b981',
      summary: [
        { label: '总增长金额', value: '+165', unit: '万元', highlight: true },
        { label: '线上贡献', value: '+69.3', unit: '万元' },
      ],
    }),
    B.insight('增长洞察', '线上渠道是最大增长引擎（42%），抖音渠道增速最快达85%。建议持续加大线上投入。', 'success'),
    B.actions([
      { id: '1', label: '线上渠道详情', query: '线上渠道增长的驱动因素', icon: 'search' },
      { id: '2', label: '新品分析', query: '新品销售表现分析', icon: 'bar' },
    ]),
  ],

  // ========== ATTR-03: 为什么11月销售额下降了？ ==========
  'ATTR-03': () => [
    B.visualizer([
      { id: 'ds_a03', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_a03', type: 'groupby', label: '按', value: '时间+维度归因' },
      { id: 'dt_a03', type: 'date', label: '日期', value: '2024年11月' },
      { id: 'ft_a03', type: 'filter', label: '分析', value: '月度归因' },
    ]),
    B.heading('🔍 11月销售额下降归因分析'),
    B.kpiGroup([
      { id: 'nov_sales', label: '11月销售额', value: 3200000, prefix: '¥', trend: { value: 8.6, direction: 'down', label: '环比' }, hideAttribution: true },
      { id: 'oct_sales', label: '10月销售额', value: 3500000, prefix: '¥' },
      { id: 'gap', label: '差距', value: '-30万', trend: { value: 8.6, direction: 'down' }, hideAttribution: true },
    ]),
    B.text('11月销售额较10月下降 **8.6%**（约30万），深入分析如下：'),
    B.lineChart({
      data: [
        { week: '11月W1', value: 85, baseline: 90 },
        { week: '11月W2', value: 78, baseline: 88 },
        { week: '11月W3', value: 75, baseline: 87 },
        { week: '11月W4', value: 82, baseline: 85 },
      ],
      xKey: 'week',
      yKeys: [
        { key: 'value', name: '实际', color: '#ef4444' },
        { key: 'baseline', name: '预期', color: '#94a3b8' },
      ],
      title: '11月周销售趋势（万元）',
      summary: [
        { label: '最大缺口周', value: 'W2-W3', unit: '', highlight: true },
        { label: '周均缺口', value: '-7.5', unit: '万元' },
      ],
    }),
    B.pieChart({
      data: [
        { name: '双11透支效应', value: 45 },
        { name: '线下客流减少', value: 25 },
        { name: '竞品促销分流', value: 20 },
        { name: '天气因素', value: 10 },
      ],
      title: '下降原因归因',
      summary: [
        { label: '主因', value: '双11透支', unit: '45%', highlight: true },
        { label: '次因', value: '线下客流', unit: '25%' },
      ],
    }),
    B.insight('核心发现', '双11大促提前透支了约13.5万消费力，是11月下降的主要原因。建议12月避免过度促销。', 'warning'),
    B.actions([
      { id: '1', label: '双11复盘', query: '双11促销效果分析', icon: 'search' },
      { id: '2', label: '12月预测', query: '预测12月销售额', icon: 'trend' },
    ]),
  ],

  // ========== ATTR-04: 利润下滑的影响因素有哪些？ ==========
  'ATTR-04': () => [
    B.visualizer([
      { id: 'ds_a04', type: 'datasource', label: '数据源', value: '财务流水', removable: false },
      { id: 'gb_a04', type: 'groupby', label: '按', value: '成本因素分解' },
      { id: 'dt_a04', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_a04', type: 'filter', label: '分析', value: '利润归因' },
    ]),
    B.heading('💰 利润下滑影响因素分析'),
    B.kpiGroup([
      { id: 'profit', label: '本月净利润', value: 680000, prefix: '¥', trend: { value: 22, direction: 'down', label: '环比' }, hideAttribution: true },
      { id: 'margin', label: '利润率', value: '18.5%', trend: { value: 3.2, direction: 'down' }, hideAttribution: true },
      { id: 'drop', label: '利润下降', value: '-19.2万', trend: { value: 22, direction: 'down' }, hideAttribution: true },
    ]),
    B.text('本月利润环比下降 **22%**（约19.2万），以下是因素权重分析：'),
    B.barChart({
      data: [
        { factor: '促销折扣加深', impact: -8.6, weight: 45 },
        { factor: '物流成本上涨', impact: -4.8, weight: 25 },
        { factor: '退货率上升', impact: -3.1, weight: 16 },
        { factor: '人工成本增加', impact: -2.7, weight: 14 },
      ],
      xKey: 'factor',
      yKey: 'impact',
      title: '各因素影响金额（万元）',
      color: '#ef4444',
      summary: [
        { label: '利润下降总额', value: '-19.2', unit: '万元', highlight: true },
        { label: '主因占比', value: '45', unit: '%' },
      ],
    }),
    B.pieChart({
      data: [
        { name: '促销折扣加深', value: 45 },
        { name: '物流成本上涨', value: 25 },
        { name: '退货率上升', value: 16 },
        { name: '人工成本增加', value: 14 },
      ],
      title: '因素权重占比',
      summary: [
        { label: '最大因素', value: '促销折扣', unit: '45%', highlight: true },
        { label: '可控因素', value: '促销+退货', unit: '61%' },
      ],
    }),
    B.insight('优化建议', '促销折扣（45%）和退货率（16%）是可控因素，优化后可挽回约11万利润。', 'warning'),
    B.actions([
      { id: '1', label: '优化促销', query: '优化促销策略建议', icon: 'search' },
      { id: '2', label: '降低退货', query: '降低退货率方案', icon: 'bar' },
    ]),
  ],

  // ========== ATTR-05: 分析转化率偏低的原因 ==========
  'ATTR-05': () => [
    B.visualizer([
      { id: 'ds_a05', type: 'datasource', label: '数据源', value: '用户行为表', removable: false },
      { id: 'gb_a05', type: 'groupby', label: '按', value: '漏斗环节' },
      { id: 'dt_a05', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_a05', type: 'filter', label: '分析', value: '转化归因' },
    ]),
    B.heading('🎯 转化率偏低原因分析'),
    B.kpi({
      id: 'cvr',
      label: '整体转化率',
      value: '2.1%',
      trend: { value: 0.8, direction: 'down', label: '环比下降' },
      hideAttribution: true,
    }),
    B.funnelChart({
      data: [
        { stage: '访问', value: 120000, rate: '100%' },
        { stage: '浏览商品', value: 72000, rate: '60%' },
        { stage: '加购', value: 14400, rate: '20%' },
        { stage: '结算', value: 4320, rate: '30%' },
        { stage: '支付成功', value: 2520, rate: '58.3%' },
      ],
      title: '转化漏斗各环节',
      summary: [
        { label: '最大流失', value: '浏览→加购', unit: '80%流失', highlight: true },
        { label: '整体转化', value: '2.1', unit: '%' },
      ],
    }),
    B.barChart({
      data: [
        { stage: '访问→浏览', lossRate: 40, benchmark: 30 },
        { stage: '浏览→加购', lossRate: 80, benchmark: 65 },
        { stage: '加购→结算', lossRate: 70, benchmark: 55 },
        { stage: '结算→支付', lossRate: 41.7, benchmark: 35 },
      ],
      xKey: 'stage',
      yKey: 'lossRate',
      title: '各环节流失率 vs 行业基准（%）',
      color: '#ef4444',
      summary: [
        { label: '最大差距', value: '浏览→加购', unit: '+15%', highlight: true },
        { label: '优化潜力', value: '+0.6', unit: '%转化' },
      ],
    }),
    B.insight('问题定位', '**浏览→加购**环节流失率80%，高于行业基准15%。主要原因：详情页停留仅18秒，价格对比功能缺失。', 'danger'),
    B.actions([
      { id: '1', label: '优化详情页', query: '商品详情页优化建议', icon: 'search' },
      { id: '2', label: '支付优化', query: '支付环节优化方案', icon: 'bar' },
    ]),
  ],

  // ========== ATTR-09: 华东区销售下降的原因 ==========
  'ATTR-09': () => [
    B.visualizer([
      { id: 'ds_a09', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_a09', type: 'groupby', label: '按', value: '地区下钻归因' },
      { id: 'dt_a09', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_a09', type: 'filter', label: '地区', value: '华东' },
    ]),
    B.heading('🗺️ 华东区销售下降归因分析'),
    B.kpiGroup([
      { id: 'huadong', label: '华东区销售额', value: 1050000, prefix: '¥', trend: { value: 18, direction: 'down', label: '环比' }, hideAttribution: true },
      { id: 'share', label: '占比', value: '28.5%', trend: { value: 2.3, direction: 'down' }, hideAttribution: true },
      { id: 'gap', label: '缺口', value: '-23万' },
    ]),
    B.text('华东区销售额环比下降 **18%**，拆解到城市级别：'),
    B.barChart({
      data: [
        { city: '上海', decline: -12, contribution: 48 },
        { city: '杭州', decline: -8, contribution: 22 },
        { city: '南京', decline: -5, contribution: 18 },
        { city: '苏州', decline: -3, contribution: 12 },
      ],
      xKey: 'city',
      yKey: 'decline',
      title: '华东各城市下降幅度（万元）',
      color: '#ef4444',
      summary: [
        { label: '主要拖累', value: '上海', unit: '-12万', highlight: true },
        { label: '华东总降幅', value: '-23', unit: '万元' },
      ],
    }),
    B.pieChart({
      data: [
        { name: '上海门店装修', value: 35 },
        { name: '竞品开店分流', value: 28 },
        { name: '促销力度不足', value: 22 },
        { name: '天气影响', value: 15 },
      ],
      title: '下降原因归因',
      summary: [
        { label: '主因', value: '门店装修', unit: '35%', highlight: true },
        { label: '可控因素', value: '促销', unit: '22%' },
      ],
    }),
    B.insight('关键发现', '上海3家门店装修停业是主因（35%），预计下月恢复。建议对杭州加大促销力度对冲竞品分流。', 'warning'),
    B.actions([
      { id: '1', label: '上海详情', query: '上海各门店销售详情', icon: 'search' },
      { id: '2', label: '竞品分析', query: '华东区竞品动态', icon: 'bar' },
    ]),
  ],

  // ========== ATTR-10: 线上渠道增长的驱动因素 ==========
  'ATTR-10': () => [
    B.visualizer([
      { id: 'ds_a10', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_a10', type: 'groupby', label: '按', value: '渠道下钻' },
      { id: 'dt_a10', type: 'date', label: '日期', value: '本季度' },
      { id: 'ft_a10', type: 'filter', label: '渠道', value: '线上' },
    ]),
    B.heading('📱 线上渠道增长驱动因素分析'),
    B.kpiGroup([
      { id: 'online', label: '线上销售额', value: 4200000, prefix: '¥', trend: { value: 42, direction: 'up', label: '同比' }, hideAttribution: true },
      { id: 'share', label: '线上占比', value: '45%', trend: { value: 8, direction: 'up' }, hideAttribution: true },
      { id: 'growth', label: '增长额', value: '+125万' },
    ]),
    B.text('线上渠道同比增长 **42%**（+125万），以下是各平台贡献拆解：'),
    B.barChart({
      data: [
        { platform: '抖音', growth: 52, contribution: 38 },
        { platform: '天猫', growth: 28, contribution: 32 },
        { platform: '京东', growth: 18, contribution: 18 },
        { platform: '小程序', growth: 15, contribution: 12 },
      ],
      xKey: 'platform',
      yKey: 'growth',
      title: '各平台增长贡献（万元）',
      color: '#10b981',
      summary: [
        { label: '最大贡献', value: '抖音', unit: '+52万', highlight: true },
        { label: '总增长', value: '+125', unit: '万元' },
      ],
    }),
    B.pieChart({
      data: [
        { name: '直播带货', value: 45 },
        { name: '搜索流量增加', value: 25 },
        { name: '站内活动', value: 18 },
        { name: '私域转化', value: 12 },
      ],
      title: '增长驱动因素',
      summary: [
        { label: '主驱动', value: '直播带货', unit: '45%', highlight: true },
        { label: '自然流量', value: '25', unit: '%' },
      ],
    }),
    B.insight('增长洞察', '抖音直播是最大增长引擎（38%），场均GMV达8.5万。建议增加直播场次，目标周3场。', 'success'),
    B.actions([
      { id: '1', label: '抖音详情', query: '抖音渠道运营分析', icon: 'search' },
      { id: '2', label: '直播复盘', query: '直播带货效果分析', icon: 'trend' },
    ]),
  ],

  // ========== ATTR-11: 产品A销量下滑原因分析 ==========
  'ATTR-11': () => [
    B.visualizer([
      { id: 'ds_a11', type: 'datasource', label: '数据源', value: '产品销售表', removable: false },
      { id: 'gb_a11', type: 'groupby', label: '按', value: '产品归因' },
      { id: 'dt_a11', type: 'date', label: '日期', value: '近3个月' },
      { id: 'ft_a11', type: 'filter', label: '产品', value: '产品A' },
    ]),
    B.heading('📦 产品A销量下滑归因分析'),
    B.kpiGroup([
      { id: 'prodA', label: '产品A本月销量', value: 2850, unit: '件', trend: { value: 25, direction: 'down', label: '环比' }, hideAttribution: true },
      { id: 'rank', label: '排名变化', value: '#3→#7', trend: { value: 4, direction: 'down' }, hideAttribution: true },
      { id: 'gap', label: '销量缺口', value: '-950件' },
    ]),
    B.text('产品A销量环比下降 **25%**（-950件），排名从第3降至第7：'),
    B.lineChart({
      data: [
        { month: '9月', value: 4200 },
        { month: '10月', value: 3800 },
        { month: '11月', value: 2850 },
      ],
      xKey: 'month',
      yKeys: [{ key: 'value', name: '销量', color: '#ef4444' }],
      title: '产品A近3月销量趋势',
      summary: [
        { label: '3月累计下降', value: '-32%', unit: '', highlight: true },
        { label: '月均下降', value: '-16', unit: '%' },
      ],
    }),
    B.pieChart({
      data: [
        { name: '新品替代效应', value: 42 },
        { name: '价格竞争力下降', value: 28 },
        { name: '库存断货', value: 18 },
        { name: '用户口碑下滑', value: 12 },
      ],
      title: '下滑原因归因',
      summary: [
        { label: '主因', value: '新品替代', unit: '42%', highlight: true },
        { label: '价格因素', value: '28', unit: '%' },
      ],
    }),
    B.insight('问题诊断', '产品A遭遇新品（产品X）替代，42%用户转购新品。建议：1）降价促销清库存 2）考虑产品升级迭代', 'warning'),
    B.actions([
      { id: '1', label: '新品对比', query: '产品A与新品X对比', icon: 'search' },
      { id: '2', label: '清仓方案', query: '产品A清仓策略', icon: 'bar' },
    ]),
  ],

  // ========== ATTR-12: 详细分析华东区下降原因 ==========
  'ATTR-12': () => [
    B.visualizer([
      { id: 'ds_a12', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_a12', type: 'groupby', label: '按', value: '城市→门店下钻' },
      { id: 'dt_a12', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_a12', type: 'filter', label: '地区', value: '华东区详细' },
    ]),
    B.heading('🔬 华东区下降原因深度分析'),
    B.kpi({
      id: 'huadong_detail',
      label: '华东区总销售额',
      value: 1050000,
      prefix: '¥',
      trend: { value: 18, direction: 'down', label: '环比下降' },
      hideAttribution: true,
    }),
    B.text('以下是华东区销售下降的**三层归因分析**：'),
    B.section('第一层：城市分布'),
    B.barChart({
      data: [
        { city: '上海', decline: -12, share: 52 },
        { city: '杭州', decline: -5.5, share: 24 },
        { city: '南京', decline: -3.2, share: 14 },
        { city: '其他', decline: -2.3, share: 10 },
      ],
      xKey: 'city',
      yKey: 'decline',
      title: '城市级下降金额（万元）',
      color: '#ef4444',
      summary: [
        { label: '最大降幅城市', value: '上海', unit: '-12万', highlight: true },
      ],
    }),
    B.section('第二层：上海门店拆解'),
    B.barChart({
      data: [
        { store: '淮海路旗舰店', status: '装修停业', impact: -5.2 },
        { store: '南京路店', status: '正常', impact: -2.8 },
        { store: '徐汇店', status: '装修停业', impact: -2.5 },
        { store: '浦东店', status: '正常', impact: -1.5 },
      ],
      xKey: 'store',
      yKey: 'impact',
      title: '上海各门店影响（万元）',
      color: '#f97316',
      summary: [
        { label: '装修门店', value: '2家', unit: '', highlight: true },
        { label: '装修影响', value: '-7.7', unit: '万元' },
      ],
    }),
    B.section('第三层：根因分析'),
    B.pieChart({
      data: [
        { name: '门店装修停业', value: 45 },
        { name: '竞品新店分流', value: 25 },
        { name: '促销力度不足', value: 20 },
        { name: '天气+节假日', value: 10 },
      ],
      title: '根因权重分布',
      summary: [
        { label: '可控因素', value: '促销', unit: '20%' },
        { label: '不可控因素', value: '装修+天气', unit: '55%' },
      ],
    }),
    B.insight('综合结论', '华东区下降主因是上海2家门店装修（45%），属短期因素。预计装修完成后（下月）可恢复增长8-10%。', 'warning'),
    B.actions([
      { id: '1', label: '装修进度', query: '门店装修进度查询', icon: 'search' },
      { id: '2', label: '恢复预测', query: '华东区下月销售预测', icon: 'trend' },
    ]),
  ],

  // L2-25: 为什么销售额下降 - 归因叙事
  'L2-25': () => [
    B.visualizer([
      { id: 'ds_225', type: 'datasource', label: '数据源', value: '销售流水', removable: false },
      { id: 'gb_225', type: 'groupby', label: '按', value: '因素 归因' },
      { id: 'dt_225', type: 'date', label: '日期', value: '本月' },
      { id: 'ft_225', type: 'filter', label: '分析类型', value: '下降归因' },
    ]),
    B.heading('🔍 销售额下降归因分析'),
    B.kpi({
      id: 'decline',
      label: '本月销售额',
      value: 3500000,
      prefix: '¥',
      trend: { value: 15, direction: 'down', label: '环比下降' },
    }),
    B.text('**多维度拆解分析**：'),
    B.section('维度一：时间分布'),
    B.lineChart({
      data: [
        { week: '第1周', value: 920 },
        { week: '第2周', value: 880 },
        { week: '第3周', value: 850 },
        { week: '第4周', value: 850 },
      ],
      xKey: 'week',
      yKeys: [{ key: 'value', name: '销售额', color: '#ef4444' }],
      title: '周销售趋势（万元）',
      summary: [
        { label: '月销售额', value: '3,500', unit: '万元', highlight: true },
        { label: '周均下降', value: '-2.3', unit: '%' },
      ],
    }),
    B.text('下降始于第2周，与双11大促结束时间吻合。'),
    B.section('维度二：地区贡献'),
    B.barChart({
      data: [
        { region: '华东', decline: -25 },
        { region: '华南', decline: -12 },
        { region: '华北', decline: -8 },
        { region: '其他', decline: -3 },
      ],
      xKey: 'region',
      yKey: 'decline',
      title: '各地区下降幅度（%）',
      color: '#ef4444',
      summary: [
        { label: '最大跌幅', value: '华东', unit: '-25%', highlight: true },
        { label: '平均跌幅', value: '-12', unit: '%' },
      ],
    }),
    B.text('**华东区下降最严重**（-25%），是主要拖累因素。'),
    B.section('归因总结'),
    B.pieChart({
      data: [
        { name: '促销透支', value: 45 },
        { name: '华东异常', value: 30 },
        { name: '流量下滑', value: 25 },
      ],
      title: '下降归因权重',
      summary: [
        { label: '主因', value: '促销透支', unit: '45%', highlight: true },
        { label: '下降总额', value: '-525', unit: '万元' },
      ],
    }),
    B.actions([
      { id: '1', label: '华东详情', query: '详细看看华东区数据', icon: 'search' },
      { id: '2', label: '流量分析', query: '分析流量下滑原因', icon: 'trend' },
    ]),
  ],

  // L2-26: 分析转化率偏低的原因 - 漏斗诊断
  'L2-26': () => [
    B.heading(' 转化率诊断分析'),
    B.kpi({
      id: 'cvr',
      label: '整体转化率',
      value: '2.8%',
      trend: { value: 0.5, direction: 'down', label: '环比下降' },
    }),
    B.funnelChart({
      data: [
        { stage: '访问', value: 100000, rate: '100%' },
        { stage: '浏览商品', value: 65000, rate: '65%' },
        { stage: '加购', value: 18000, rate: '27.7%' },
        { stage: '结算', value: 5500, rate: '30.6%' },
        { stage: '支付成功', value: 2800, rate: '50.9%' },
      ],
      title: '转化漏斗分析',
      summary: [
        { label: '总访问量', value: '10万', unit: '次', highlight: true },
        { label: '最终转化率', value: '2.8', unit: '%' },
        { label: '最大流失环节', value: '浏览→加购', unit: '' },
      ],
    }),
    B.text('**关键流失环节**：\n\n🔴 **浏览→加购**：流失率 **72.3%**（最大瓶颈）\n• 商品详情页停留时间短（平均23秒）\n• 价格敏感用户占比高\n\n🟡 **结算→支付**：流失率 **49.1%**\n• 支付失败率偏高（12%）\n• 优惠券使用受限投诉多'),
    B.insight('优化建议', '优先优化商品详情页，增加用户评价和对比功能，预计可提升加购率15%。'),
    B.actions([
      { id: '1', label: '详情页分析', query: '商品详情页优化建议', icon: 'search' },
      { id: '2', label: '支付优化', query: '支付环节优化方案', icon: 'bar' },
    ]),
  ],

  // L2-27: 利润下滑的影响因素 - 权重展示
  'L2-27': () => [
    B.heading('💰 利润下滑因素分析'),
    B.kpi({
      id: 'profit',
      label: '本月净利润',
      value: 6800000,
      prefix: '¥',
      trend: { value: 18, direction: 'down', label: '环比下降' },
    }),
    B.text('利润环比下降 **18%**（约150万），我们来拆解影响因素：'),
    B.barChart({
      data: [
        { factor: '促销折扣加大', impact: -85, weight: 57 },
        { factor: '物流成本上升', impact: -35, weight: 23 },
        { factor: '退货率提高', impact: -20, weight: 13 },
        { factor: '其他', impact: -10, weight: 7 },
      ],
      xKey: 'factor',
      yKey: 'impact',
      title: '利润影响因素（万元）',
      color: '#ef4444',
      summary: [
        { label: '利润下降额', value: '-150', unit: '万元', highlight: true },
        { label: '主因', value: '促销折扣', unit: '57%' },
      ],
    }),
    B.pieChart({
      data: [
        { name: '促销折扣', value: 57 },
        { name: '物流成本', value: 23 },
        { name: '退货成本', value: 13 },
        { name: '其他', value: 7 },
      ],
      title: '因素权重占比',
      summary: [
        { label: '最大因素', value: '促销折扣', unit: '57%', highlight: true },
        { label: '可优化空间', value: '~80', unit: '万元' },
      ],
    }),
    B.text('**核心发现**：\n\n1. **促销折扣** 是最大影响因素（57%），双11平均折扣达7折\n2. **物流成本** 受旺季附加费影响上涨15%\n3. **退货率** 从5%上升到8%，主要是冲动消费退货'),
    B.actions([
      { id: '1', label: '促销分析', query: '优化促销策略建议', icon: 'search' },
      { id: '2', label: '成本控制', query: '物流成本优化方案', icon: 'bar' },
    ]),
  ],
};

// ============================================
// L2 预测请求
// ============================================
export const L2_PREDICTION_SCENARIOS: Record<string, () => ContentBlock[]> = {
  // L2-28: 预测下月销售额 - 置信区间
  'L2-28': () => [
    B.heading('🔮 下月销售额预测'),
    B.kpi({
      id: 'predict',
      label: '预测销售额',
      value: 3650000,
      prefix: '¥',
      trend: { value: 4.3, direction: 'up', label: '预计环比' },
    }),
    B.lineChart({
      data: [
        { month: '10月', actual: 360 },
        { month: '11月', actual: 350 },
        { month: '12月', actual: 350 },
        { month: '1月', predicted: 365, upper: 385, lower: 345 },
      ],
      xKey: 'month',
      yKeys: [
        { key: 'actual', name: '实际值', color: '#3b82f6' },
        { key: 'predicted', name: '预测值', color: '#10b981' },
      ],
      title: '销售额预测（万元）',
      showConfidenceInterval: true,
      summary: [
        { label: '预测值', value: '365', unit: '万元', highlight: true },
        { label: '置信区间', value: '345-385', unit: '万元' },
        { label: '置信度', value: '90', unit: '%' },
      ],
    }),
    B.text('**预测说明**：\n\n **预测值**：365万元\n **置信区间**：345-385万元（90%置信度）\n\n**主要影响因素**：\n• 春节促销预期（+8%）\n• 季节性波动（-3%）\n• 去年同期基数（参考+15%）'),
    B.insight('风险提示', '若春节促销力度不及预期，销售额可能落在区间下限。'),
    B.actions([
      { id: '1', label: '调整参数', query: '使用不同参数预测', icon: 'bar' },
      { id: '2', label: '预测依据', query: '查看预测模型详情', icon: 'search' },
    ]),
  ],

  // L2-29: 未来一周订单趋势预测
  'L2-29': () => [
    B.heading('📅 未来一周订单预测'),
    B.lineChart({
      data: [
        { day: '今天', actual: 1150 },
        { day: '明天', predicted: 1180, upper: 1250, lower: 1110 },
        { day: '后天', predicted: 1200, upper: 1280, lower: 1120 },
        { day: 'Day4', predicted: 1220, upper: 1310, lower: 1130 },
        { day: 'Day5', predicted: 1350, upper: 1450, lower: 1250 },
        { day: '周六', predicted: 1520, upper: 1650, lower: 1390 },
        { day: '周日', predicted: 1480, upper: 1600, lower: 1360 },
      ],
      xKey: 'day',
      yKeys: [
        { key: 'actual', name: '实际', color: '#3b82f6' },
        { key: 'predicted', name: '预测', color: '#10b981' },
      ],
      title: '订单量预测',
      showConfidenceInterval: true,
      summary: [
        { label: '周总预测', value: '9,100', unit: '单', highlight: true },
        { label: '日均预测', value: '1,300', unit: '单' },
        { label: '峰值(周六)', value: '1,520', unit: '单' },
      ],
    }),
    B.kpiGroup([
      { id: 'total', label: '预计周订单', value: 9100, unit: '单' },
      { id: 'peak', label: '预计峰值', value: 1520, unit: '单' },
      { id: 'avg', label: '日均订单', value: 1300, unit: '单' },
    ]),
    B.text('**预测特征**：\n\n• 工作日稳定在1150-1220单\n• 周五开始上升，周六达峰值\n• 周末订单预计占全周36%'),
    B.actions([
      { id: '1', label: '备货建议', query: '根据预测生成备货建议', icon: 'bar' },
      { id: '2', label: '运力规划', query: '物流运力规划建议', icon: 'search' },
    ]),
  ],

  // L2-30: 预计Q4能完成多少营收
  'L2-30': () => [
    B.heading('Q4营收预测'),
    B.kpiGroup([
      { id: 'target', label: 'Q4目标', value: 10500000, prefix: '¥' },
      { id: 'predict', label: '预计达成', value: 10680000, prefix: '¥' },
      { id: 'rate', label: '预计达成率', value: '101.7%', trend: { value: 1.7, direction: 'up' } },
    ]),
    B.barChart({
      data: [
        { month: '10月', actual: 360, target: 345 },
        { month: '11月', actual: 350, target: 350 },
        { month: '12月', predicted: 358, target: 355 },
      ],
      xKey: 'month',
      yKey: 'actual',
      title: 'Q4月度达成（万元）',
    }),
    B.text('**预测结论**：\n\n✅ 预计Q4营收 **1068万**，超额完成目标 **1.7%**\n\n**达成信心度**：⭐⭐⭐⭐（80%）\n\n**关键假设**：\n• 12月双12促销按计划执行\n• 无重大系统故障或供应链问题\n• 宏观环境保持稳定'),
    B.insight('建议', '当前进度良好，建议12月适度控制促销力度，优化利润表现。', 'success'),
    B.actions([
      { id: '1', label: '风险评估', query: 'Q4达成风险因素', icon: 'search' },
      { id: '2', label: '调整目标', query: '是否需要调整Q4目标', icon: 'bar' },
    ]),
  ],
};


