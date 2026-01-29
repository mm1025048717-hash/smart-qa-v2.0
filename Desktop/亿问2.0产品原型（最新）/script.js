let currentSourceType = null;
let processingInterval = null;
let activeFlow = null; 
let lastExcelName = 'Marketing Data.xlsx';
let dictionaryFileName = null;
let currentLang = 'zh';
let currentOnboardingStep = 1;
let selectedDatabase = null; // 存储选择的数据库

const translations = {
    en: {
        dashboard: 'Dashboard',
        bi_modeling: 'BI Modeling',
        select_source: 'Select Source',
        databases: 'Databases',
        smart_chat: 'Smart Chat',
        home: 'Home',
        start_new_modeling: 'Start New Modeling',
        connect_db: 'Connect Database',
        connect_db_desc: 'MySQL, ClickHouse, PostgreSQL',
        connect: 'Connect',
        upload_excel: 'Upload Excel',
        upload_excel_desc: 'Import to internal Doris engine',
        upload: 'Upload',
        nlp: 'Natural Language',
        nlp_desc: 'Describe requirements to generate model',
        describe: 'Describe',
        select_mode: 'Choose your AI partner',
        science_name: 'Alisa (Science)',
        science_tagline: 'Precision SQL-native agent',
        science_desc: 'Ready out-of-the-box. SQL-first, precise and reliable.',
        science_ready: 'Science model ready (base)',
        science_default_hint: 'Alisa (Science) is always online. Enable Nora if you need LLM semantics.',
        default_on: 'Always On',
        optional_addon: 'Optional Add-on',
        enable_nora: 'Enable Nora',
        disable_nora: 'Disable Nora',
        liberal_name: 'Nora (Liberal Arts)',
        liberal_tagline: 'LLM semantic reasoning & deep insights',
        liberal_desc: 'LLM-powered semantic reasoning. Needs simple configuration.',
        db_connections: 'Database Connections',
        refresh: 'Refresh',
        add_new: 'Add New',
        id: 'ID',
        source_name: 'Source Name',
        type: 'Type',
        status: 'Status',
        tables: 'Tables',
        model_status: 'Model Status',
        actions: 'Actions',
        connected: 'Connected',
        not_configured: 'Not Configured',
        edit: 'Edit',
        select_tables: 'Select Tables',
        conversations: 'Conversations',
        new_chat: 'New Chat',
        sales_q3: 'Sales Analysis Q3',
        just_now: 'Just now',
        yesterday: 'Yesterday',
        model_ready: 'Model Ready (SemanticDB)',
        data_agent_report: 'DataAgent Report',
        exit: 'Exit',
        sales_bar: 'Sales Bar Chart',
        traffic_trend: 'Traffic Trend',
        intel_attribution: 'Intelligent Attribution',
        ai_insights: 'AI Insights',
        deep_think: 'Deep Dive',
        follow_mode: 'Follow-up',
        hello_ai: 'Hello, I am your Intelligent Data Assistant.<br>Supported by <b>Alisa (Science Model)</b> and <b>Nora (Liberal Arts Model)</b>.',
        type_question: 'Type your question here...',
        config: 'Configuration',
        cancel: 'Cancel',
        confirm: 'Confirm',
        select: 'Select',
        generate: 'Generate',
        adjust: 'Adjust',
        search_tables: 'Search tables...',
        optional_dict: '(Optional) Upload Data Dictionary',
        upload_file: 'Upload File',
        no_file: 'No file chosen',
        table_name: 'Table Name',
        rows_est: 'Rows (Est)',
        last_updated: 'Last Updated',
        preview: 'Preview',
        ready_generate: 'Ready to Generate',
        ready_desc: '2 tables selected. Click below to start Semantic Modeling.',
        gen_schema: 'Generate Schema',
        processing: 'Processing...',
        semantic_generated: 'SemanticDB Model Generated. Please review.',
        field: 'Field',
        desc: 'Description',
        lock: 'Lock',
        model_saved: 'SemanticDB Model Saved!',
        can_ask: 'You can now ask questions about your data.',
        go_chat: 'Go to Smart Chat',
        close: 'Close',
        confirm_save: 'Confirm & Save',
        data_preview: 'Data Preview',
        agent_report: 'DataAgent Analysis Report',
        export_pdf: 'Export PDF',
        upload_excel_title: 'Upload Excel/CSV',
        upload_excel_label: 'Upload Data File (Excel/CSV)',
        upload_hint: 'File will be automatically loaded into internal Doris engine.',
        template: 'Template',
        mapping: 'Mapping',
        recommend: 'Recommended columns: Order ID, Store, Amount, Date.',
        nlp_title: 'Natural Language Modeling',
        nlp_label: 'Business Requirement Description',
        nlp_placeholder: 'Describe your business needs, e.g.:\n1. Analyze electric vehicle sales\n2. Focus on store rankings\n3. Trend of different models...',
        quick_fill: 'Quick Fill:',
        sales_analysis: 'Sales Analysis',
        user_profile: 'User Profile',
        add_db_title: 'Add Database Connection',
        db_type: 'Database Type',
        host: 'Host',
        port: 'Port',
        username: 'Username',
        password: 'Password',
        saving: 'Saving...',
        searching: 'Searching...',
        generating: 'Generating...',
        test_conn: 'Test Connection',
        back: 'Back',
        conn_success: 'Connection Successful!',
        conn_fail: 'Connection Failed',
        connecting: 'Connecting...',
        test_modal_title: 'LLM Test Console',
        test_modal_desc: 'Interact with the configured model to validate responses.',
        test_modal_placeholder: 'Ask a quick question to the model...',
        test_modal_agent: 'LLM Agent',
        test_modal_user: 'You'
    },
    zh: {
        dashboard: '仪表盘',
        bi_modeling: '业务建模',
        select_source: '选择数据源',
        databases: '数据库管理',
        smart_chat: '智能问答',
        home: '首页',
        start_new_modeling: '开始新的建模',
        connect_db: '连接数据库',
        connect_db_desc: '支持 MySQL, ClickHouse, PostgreSQL',
        connect: '去连接',
        upload_excel: '上传 Excel',
        upload_excel_desc: '一键导入内置 Doris 引擎',
        upload: '去上传',
        nlp: '自然语言建模',
        nlp_desc: '描述需求，自动生成数据模型',
        describe: '去描述',
        select_mode: '选择您的智能配置',
        science_name: 'Alisa（理科生）',
        science_tagline: '精准 SQL · 结构化执行',
        science_desc: '精准、快速，基于结构化 SQL 逻辑。',
        science_ready: '理科生模型已就绪 (基础版)',
        science_default_hint: 'Alisa（理科生）默认在线，您可按需启用文科生 Nora。',
        default_on: '默认启用',
        optional_addon: '可选增强',
        enable_nora: '启用 Nora',
        disable_nora: '关闭 Nora',
        liberal_name: 'Nora（文科生）',
        liberal_tagline: 'LLM 语义 · 深度洞察',
        liberal_desc: '叠加 LLM 大模型能力，支持模糊语义与深度洞察。',
        db_connections: '已连接数据库',
        refresh: '刷新',
        add_new: '新建连接',
        id: 'ID',
        source_name: '数据源名称',
        type: '类型',
        status: '状态',
        tables: '表数量',
        model_status: '模型状态',
        actions: '操作',
        connected: '已连接',
        not_configured: '未配置',
        edit: '配置',
        select_tables: '选择表',
        conversations: '对话列表',
        new_chat: '新对话',
        sales_q3: 'Q3 销售数据分析',
        just_now: '刚刚',
        yesterday: '昨天',
        model_ready: '模型已就绪 (SemanticDB)',
        data_agent_report: '生成 DataAgent 报告',
        exit: '退出',
        sales_bar: '销售柱状图',
        traffic_trend: '客流趋势',
        intel_attribution: '智能归因',
        ai_insights: 'AI 洞察',
        deep_think: '深度思考',
        follow_mode: '开启追问',
        hello_ai: '你好，我是您的智能数据助手。<br>由 <b>Alisa (理科生模型)</b> 和 <b>Nora (文科生模型)</b> 提供支持。',
        type_question: '在此输入您的问题...',
        config: '配置详情',
        cancel: '取消',
        confirm: '确认',
        select: '选择',
        generate: '生成',
        adjust: '调整',
        search_tables: '搜索表名...',
        optional_dict: '(选填) 上传数据字典',
        upload_file: '上传文件',
        no_file: '未选择文件',
        table_name: '表名',
        rows_est: '行数 (预估)',
        last_updated: '更新时间',
        preview: '预览',
        ready_generate: '准备就绪',
        ready_desc: '已选择 2 张表。点击下方按钮开始语义建模。',
        gen_schema: '一键生成 Schema',
        processing: '正在处理...',
        semantic_generated: 'SemanticDB 模型已生成，请复核。',
        field: '字段名',
        desc: '描述',
        lock: '锁定',
        model_saved: 'SemanticDB 模型保存成功！',
        can_ask: '现在您可以直接对数据进行提问了。',
        go_chat: '进入智能问答',
        close: '关闭',
        confirm_save: '确认并保存',
        data_preview: '数据预览',
        agent_report: 'DataAgent 分析报告',
        export_pdf: '导出 PDF',
        upload_excel_title: '上传 Excel/CSV',
        upload_excel_label: '上传数据文件 (Excel/CSV)',
        upload_hint: '文件将自动加载至内置 Doris 引擎。',
        template: '下载模板',
        mapping: '字段映射',
        recommend: '建议包含字段：订单号、门店、金额、日期。',
        nlp_title: '自然语言建模',
        nlp_label: '业务需求描述',
        nlp_placeholder: '请输入您的业务需求，例如：\n1. 我需要分析两轮电动车的销售情况\n2. 关注门店的销售额排名\n3. 想要了解不同车型的销量趋势...',
        quick_fill: '快速填充：',
        sales_analysis: '销售分析',
        user_profile: '用户画像',
        add_db_title: '添加数据库连接',
        db_type: '数据库类型',
        host: '主机地址',
        port: '端口',
        username: '用户名',
        password: '密码',
        saving: '保存中...',
        searching: '搜索中...',
        generating: '生成中...',
        test_conn: '测试连接',
        back: '上一步',
        conn_success: '连接成功！',
        conn_fail: '连接失败，请检查 API Key',
        connecting: '正在连接...',
        test_modal_title: 'LLM 测试链接',
        test_modal_desc: '与模型交互以确认响应效果。',
        test_modal_placeholder: '请输入测试问题...',
        test_modal_agent: 'LLM 助手',
        test_modal_user: '我'
    }
};

const personaProfiles = {
    science: {
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=320&h=320&q=80',
        zh: {
            name: '理科生 · Alisa',
            desc: '结构化 SQL · 极速响应',
            tag: '默认在线',
            toast: '已切换至理科生 · Alisa'
        },
        en: {
            name: 'Alisa · Science',
            desc: 'SQL-native · Fast response',
            tag: 'Always on',
            toast: 'Switched to Alisa (Science)'
        }
    },
    liberal: {
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=320&h=320&q=80',
        zh: {
            name: '文科生 · Nora',
            desc: '自然语言洞察 · 叙事表达',
            tag: '一键切换',
            toast: '已切换至文科生 · Nora'
        },
        en: {
            name: 'Nora · Liberal Arts',
            desc: 'Semantic insights · Narrative ready',
            tag: 'Tap to switch',
            toast: 'Switched to Nora (Liberal Arts)'
        }
    }
};

const personaStageContent = {
    science: {
        zh: {
            brief: '结构化分析默认在线，可随时切换至文科生模式。',
            welcome: '你好，我是理科生 Alisa，告诉我想看的指标，我帮你快速定位字段与图表。',
            placeholder: '试试输入：近 7 天 GMV Top 5 门店',
            suggestions: ['本月销售额达成情况', '今天有什么数据异常吗', '给我一个业务概览', '最近有什么值得关注的趋势']
        },
        en: {
            brief: 'Science agent stays online for SQL-first KPI analysis.',
            welcome: 'Hi, I am Alisa. Share the KPI and I will generate SQL & charts instantly.',
            placeholder: 'Try: GMV top 5 stores in East China last 7 days',
            suggestions: ['Sales achievement this month', 'Any data anomalies today?', 'Give me a business overview', 'Recent trends worth attention']
        }
    },
    liberal: {
        zh: {
            brief: '文科生善于自然语言对话，更适合策略复盘与叙事表达。',
            welcome: '你好，我是文科生 Nora，更擅长用自然语言把复杂业务讲清楚。需要我写一段复盘吗？',
            placeholder: '试试输入：请用三段话总结本周女装 GMV 表现',
            suggestions: ['本月销售额达成情况', '今天有什么数据异常吗', '给我一个业务概览', '最近有什么值得关注的趋势']
        },
        en: {
            brief: 'Liberal-arts agent excels at narratives and strategy reviews.',
            welcome: 'Hi, I am Nora. Tell me the business question and I will craft a narrative insight for you.',
            placeholder: 'Try: Summarize this week female apparel GMV in 3 bullet points',
            suggestions: ['Sales achievement this month', 'Any data anomalies today?', 'Give me a business overview', 'Recent trends worth attention']
        }
    }
};

let currentPersona = 'science';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();
    initOnboarding();
    renderPersonaStage(currentPersona, true);
    renderEmployeeList();
    renderChatHeader();
    initDashboardCharts();
});

// Dashboard Charts
function initDashboardCharts() {
    renderMainChart();
    renderDonutChart();
}

function renderMainChart(retryCount = 0) {
    const canvas = document.getElementById('dashboard-main-chart');
    if (!canvas) return;
    
    // Check if visible
    if (canvas.offsetWidth === 0 && retryCount < 5) {
        setTimeout(() => renderMainChart(retryCount + 1), 100);
        return;
    }

    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = 300;
    ctx.scale(2, 2);
    
    const data = [65, 78, 52, 91, 68, 85, 73, 96, 82, 88, 75, 94];
    const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const maxVal = Math.max(...data) * 1.2;
    const chartW = w / 2 - 60;
    const chartH = h / 2 - 50;
    const barW = chartW / data.length - 16; // More spacing
    
    ctx.clearRect(0, 0, w, h);
    
    // Grid lines (dashed)
    ctx.strokeStyle = '#E5E5EA'; // Lighter, Apple gray
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 4; i++) {
        const y = 20 + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(chartW + 40, y);
        ctx.stroke();
    }
    ctx.setLineDash([]); // Reset
    
    // Bars
    data.forEach((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = 50 + i * (barW + 16);
        const y = 20 + chartH - barH;
        
        // Bar gradient (Apple Blue)
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, '#007AFF');
        grad.addColorStop(1, 'rgba(0, 122, 255, 0.6)');
        ctx.fillStyle = grad;
        
        // Rounded rect (top corners only)
        const r = 4;
        ctx.beginPath();
        ctx.moveTo(x, y + barH);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, y + barH);
        ctx.closePath();
        ctx.fill();
        
        // Hover effect simulation (highlight max value)
        if (val === Math.max(...data)) {
            ctx.shadowColor = 'rgba(0, 122, 255, 0.4)';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // Label
        ctx.fillStyle = '#8E8E93'; // SF Text Gray
        ctx.font = '500 11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barW / 2, chartH + 40);
    });
    
    // Y axis labels
    ctx.fillStyle = '#8E8E93';
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxVal - (maxVal / 4) * i);
        ctx.fillText(val, 35, 24 + (chartH / 4) * i);
    }
}

function renderDonutChart(retryCount = 0) {
    const canvas = document.getElementById('dashboard-donut-chart');
    if (!canvas) return;
    
    if (canvas.offsetWidth === 0 && retryCount < 5) {
        setTimeout(() => renderDonutChart(retryCount + 1), 100);
        return;
    }

    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);
    
    const cx = size / 2;
    const cy = size / 2;
    const radius = 70;
    const thickness = 20;
    
    const segments = [
        { value: 65, color: '#007AFF' }, // Apple Blue
        { value: 35, color: '#E5E5EA' }  // Light Gray for remaining
    ];
    
    let startAngle = -Math.PI / 2;
    const total = segments.reduce((a, s) => a + s.value, 0);
    
    segments.forEach(seg => {
        const angle = (seg.value / total) * Math.PI * 2;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
        ctx.strokeStyle = seg.color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round'; // Round caps for smoother look
        ctx.stroke();
        
        startAngle += angle;
    });
    
    // Center text
    ctx.fillStyle = '#1D1D1F';
    ctx.font = '700 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('65%', cx, cy - 8);
    
    ctx.fillStyle = '#8E8E93';
    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Alisa Usage', cx, cy + 14);
}

document.addEventListener('click', (event) => {
    if (!agentPaletteOpen) return;
    const palette = document.getElementById('agent-command-palette');
    if (!palette) return;
    const input = document.getElementById('chat-input');
    if (palette.contains(event.target)) return;
    if (input && event.target === input) return;
    if (typeof closeAgentPalette === 'function') {
        closeAgentPalette();
    }
});

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'zh' : 'en';
    updateLanguage();
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[currentLang][key];
            } else {
                // Handle HTML content carefully
                if (el.children.length > 0 && !['upload_hint', 'hello_ai'].includes(key)) {
                     // Simple text node update if possible, otherwise re-render might be needed
                     // For this prototype, we assume mostly text nodes or we use innerHTML for specific keys
                }
                el.innerHTML = translations[currentLang][key];
            }
        }
    });
    
    // Update dynamic buttons text if needed
    const langBtn = document.getElementById('lang-switch-btn');
    if(langBtn) langBtn.innerHTML = currentLang === 'en' ? '<i class="fas fa-language"></i> 中文' : '<i class="fas fa-language"></i> EN';
    
    refreshPersonaContent();
    renderPersonaStage(currentPersona, false);
    renderChatHeader();
}

function switchView(view) {
    if (typeof closeAgentPalette === 'function') {
        closeAgentPalette();
    }
    document.querySelectorAll('.page-body').forEach(el => {
        el.classList.add('hidden');
        el.style.removeProperty('opacity'); // Clear inline opacity
    });
    
    document.querySelectorAll('.menu-link').forEach(el => el.classList.remove('active'));
    document.body.classList.remove('chat-fullscreen');
    document.body.classList.remove('chat-mode');

    if (view === 'dashboard') {
        const el = document.getElementById('view-dashboard');
        el.classList.remove('hidden');
        document.getElementById('nav-dashboard').classList.add('active');
        updateBreadcrumb('dashboard');
        setTimeout(() => initDashboardCharts(), 150);
    } else if (view === 'source') {
        const el = document.getElementById('view-source');
        el.classList.remove('hidden');
        document.getElementById('nav-source').classList.add('active');
        updateBreadcrumb('select_source');
    } else if (view === 'db') {
        const el = document.getElementById('view-db');
        el.classList.remove('hidden');
        document.getElementById('nav-db').classList.add('active');
        updateBreadcrumb('db_connections');
    } else if (view === 'chat') {
        const el = document.getElementById('view-chat');
        el.classList.remove('hidden');
        document.getElementById('nav-chat').classList.add('active');
        document.body.classList.add('chat-mode');
        renderChatHeader();
    } else if (view === 'employees') {
        const el = document.getElementById('view-employees');
        if (el) el.classList.remove('hidden');
        const nav = document.getElementById('nav-employees');
        if (nav) nav.classList.add('active');
        renderEmployeeList();
    }
}

function updateBreadcrumb(key) {
    const titleEl = document.getElementById('page-title');
    if(titleEl && translations[currentLang][key]) {
        titleEl.textContent = translations[currentLang][key];
        titleEl.setAttribute('data-i18n', key);
    }
}

function getPersonaCopy(key, field) {
    if (isEmployeeKey(key)) {
        const emp = getEmployeeByKey(key);
        if (!emp) return '';
        if (field === 'name') return emp.nickname;
        if (field === 'desc') return emp.position || '';
        return emp[field] || '';
    }
    const persona = personaProfiles[key];
    if (!persona) return '';
    const pack = persona[currentLang] || persona.zh;
    return pack[field] || '';
}

function getPersonaAvatarHTML(key) {
    if (isEmployeeKey(key)) {
        const emp = getEmployeeByKey(key);
        if (emp) return `<img src="${emp.avatar}" alt="${emp.nickname}">`;
        return '<i class="fas fa-user"></i>';
    }
    const persona = personaProfiles[key];
    if (!persona) return '<i class="fas fa-robot"></i>';
    const label = getPersonaCopy(key, 'name') || 'AI';
    return `<img src="${persona.avatar}" alt="${label}">`;
}

function refreshPersonaContent() {
    Object.entries(personaProfiles).forEach(([key, profile]) => {
        const langPack = profile[currentLang] || profile.zh;
        const nameEl = document.getElementById(`persona-${key}-name`);
        const descEl = document.getElementById(`persona-${key}-desc`);
        if (nameEl) nameEl.textContent = langPack.name;
        if (descEl) descEl.textContent = langPack.desc;
    });
    const toggle = document.getElementById('persona-toggle');
    if (toggle) toggle.setAttribute('data-active', currentPersona);
    document.querySelectorAll('.persona-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.persona === currentPersona);
    });
}

function switchPersona(key) {
    const isEmployee = isEmployeeKey(key);
    if (!personaProfiles[key] && !isEmployee) return;
    currentPersona = key;
    refreshPersonaContent();
    renderPersonaStage(key, true);
    renderChatHeader();
    const name = isEmployee ? (getEmployeeByKey(key)?.nickname || 'AI') : (getPersonaCopy(key, 'name') || 'AI');
    const toastText = currentLang === 'en' ? `Switched to ${name}` : `已切换至 ${name}`;
    showToast(toastText, 'info');
}

function renderPersonaStage(key, resetChat = false) {
    let pack = null;
    const employee = getEmployeeByKey(key);
    if (employee) {
        pack = {
            brief: employee.desc || (currentLang === 'en' ? 'Digital employee ready to assist.' : '数字员工已就绪，随时为您服务。'),
            welcome: currentLang === 'en'
                ? `Hello, I am ${employee.nickname}. How can I assist you today?`
                : `你好，我是${employee.nickname}，有什么可以帮你的？`,
            placeholder: currentLang === 'en' ? `Ask ${employee.nickname} something...` : `向 ${employee.nickname} 提问...`
        };
    } else {
        pack = personaStageContent[key]?.[currentLang] || personaStageContent[key]?.zh;
    }
    if (!pack) return;

    const input = document.getElementById('chat-input');
    if (input && pack.placeholder) input.placeholder = pack.placeholder;

    if (resetChat) {
        // Show profile section and hide messages section
        const profileSection = document.getElementById('chat-profile-section');
        const messagesContainer = document.getElementById('chat-messages-container');
        if (profileSection) profileSection.classList.remove('hidden');
        if (messagesContainer) messagesContainer.classList.add('hidden');
        
        const chatMsgs = document.getElementById('chat-messages');
        if (chatMsgs) {
            chatMsgs.innerHTML = '';
        }
    }
}

function openConfigDrawer(type) {
    currentSourceType = type;
    
    // Excel建模和自然语言建模需要先选择数据库
    if (type === 'excel' || type === 'nodata') {
        openDbSelectionDrawer(type);
        return;
    }
    
    const drawer = document.getElementById('config-drawer');
    const formContent = document.getElementById('drawer-form-content');
    const title = document.getElementById('config-drawer-title');
    const t = translations[currentLang];
    
    let html = '';
    if (type === 'database') {
        title.textContent = t.add_db_title;
        html = `
             <div class="field">
                <label>${t.db_type}</label>
                <select class="p-inputtext">
                    <option>MySQL</option>
                    <option>PostgreSQL</option>
                    <option>ClickHouse</option>
                    <option>Oracle</option>
                </select>
            </div>
             <div class="field">
                <label>${t.host} <span style="color:red">*</span></label>
                <input type="text" class="p-inputtext" placeholder="127.0.0.1">
            </div>
            <div class="field">
                <label>${t.port} <span style="color:red">*</span></label>
                <input type="text" class="p-inputtext" placeholder="3306">
            </div>
             <div class="field">
                <label>${t.username} <span style="color:red">*</span></label>
                <input type="text" class="p-inputtext" placeholder="root">
            </div>
             <div class="field">
                <label>${t.password} <span style="color:red">*</span></label>
                <input type="password" class="p-inputtext" placeholder="******">
            </div>
        `;
    }
    
    formContent.innerHTML = html;
    drawer.classList.add('active');
}

// 打开数据库选择drawer
function openDbSelectionDrawer(nextAction) {
    const drawer = document.getElementById('db-selection-drawer');
    const listContainer = document.getElementById('db-selection-list');
    const t = translations[currentLang];
    
    // 模拟数据库列表（实际应从API获取）
    const databases = [
        { id: 1, name: 'MySQL - Production', type: 'MySQL', status: 'connected', tables: 12 },
        { id: 2, name: 'ClickHouse - Logs', type: 'ClickHouse', status: 'connected', tables: 5 }
    ];
    
    let html = '';
    databases.forEach(db => {
        const isConnected = db.status === 'connected';
        html += `
            <div class="db-selection-item ${isConnected ? '' : 'disabled'}" onclick="${isConnected ? `selectDatabase('${db.name}', '${nextAction}')` : ''}" style="padding: 16px 24px; border-bottom: 1px solid rgba(0,0,0,0.06); cursor: ${isConnected ? 'pointer' : 'not-allowed'}; transition: background 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 15px; font-weight: 400; color: #1d1d1f; margin-bottom: 4px; letter-spacing: -0.2px;">${db.name}</div>
                        <div style="font-size: 13px; font-weight: 300; color: #86868b; letter-spacing: -0.1px;">${db.type} · ${db.tables} 张表</div>
                    </div>
                    ${isConnected ? '<div style="font-size: 12px; color: #007AFF; font-weight: 400;">已连接</div>' : '<div style="font-size: 12px; color: #86868b;">未连接</div>'}
                </div>
            </div>
        `;
    });
    
    // 添加新建连接选项
    html += `
        <div class="db-selection-item" onclick="closeDrawer('db-selection-drawer'); openConfigDrawer('database');" style="padding: 16px 24px; border-bottom: none; cursor: pointer; transition: background 0.2s;">
            <div style="font-size: 15px; font-weight: 400; color: #007AFF; letter-spacing: -0.2px;">+ 新建数据库连接</div>
        </div>
    `;
    
    listContainer.innerHTML = html;
    drawer.classList.add('active');
}

// 选择数据库后的处理
function selectDatabase(dbName, nextAction) {
    selectedDatabase = dbName;
    closeDrawer('db-selection-drawer');
    
    // 延迟一点打开配置drawer，让动画更流畅
    setTimeout(() => {
        if (nextAction === 'excel') {
            openExcelUploadDrawer();
        } else if (nextAction === 'nodata') {
            openNlpDrawer();
        }
    }, 200);
}

// 打开Excel上传drawer
function openExcelUploadDrawer() {
    currentSourceType = 'excel';
    const drawer = document.getElementById('config-drawer');
    const formContent = document.getElementById('drawer-form-content');
    const title = document.getElementById('config-drawer-title');
    const t = translations[currentLang];
    
    title.textContent = '上传 Excel';
    formContent.innerHTML = `
        <div style="margin-bottom: 8px; font-size: 13px; font-weight: 300; color: #86868b; letter-spacing: -0.1px;">目标数据库：${selectedDatabase}</div>
        <div class="field" style="background: transparent; padding: 0; margin-bottom: 24px;">
            <label style="font-size: 14px; font-weight: 400; color: #1d1d1f; margin-bottom: 12px; display: block; letter-spacing: -0.1px;">选择文件</label>
            <div style="position: relative;">
                <input type="file" class="excel-file-input" id="excel-file-input" accept=".xlsx,.xls,.csv" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; z-index: 2;" onchange="handleFileSelect(event)">
                <div class="excel-upload-area" id="excel-upload-area">
                    <div class="excel-upload-text">点击或拖拽文件到此处</div>
                    <div class="excel-upload-hint">支持 .xlsx, .xls, .csv 格式</div>
                </div>
            </div>
            <div style="display: flex; gap: 16px; margin-top: 16px;">
                <button class="p-button-text-link" type="button" onclick="handleMockAction('${t.template}')" style="font-size: 14px; font-weight: 400; color: #007AFF; padding: 0; background: none; border: none; cursor: pointer; letter-spacing: -0.1px;">${t.template}</button>
                <span style="color: #d1d1d6;">|</span>
                <button class="p-button-text-link" type="button" onclick="handleMockAction('${t.mapping}')" style="font-size: 14px; font-weight: 400; color: #007AFF; padding: 0; background: none; border: none; cursor: pointer; letter-spacing: -0.1px;">${t.mapping}</button>
            </div>
        </div>
        <div class="excel-recommend-box">
            <div style="font-size: 13px; font-weight: 300; color: #86868b; line-height: 1.6; letter-spacing: -0.1px;">${t.recommend}</div>
        </div>
    `;
    drawer.classList.add('active');
}

// 打开NLP drawer
function openNlpDrawer() {
    currentSourceType = 'nodata';
    const drawer = document.getElementById('config-drawer');
    const formContent = document.getElementById('drawer-form-content');
    const title = document.getElementById('config-drawer-title');
    const t = translations[currentLang];
    
    title.textContent = t.nlp_title;
    formContent.innerHTML = `
        <div style="margin-bottom: 16px; font-size: 13px; font-weight: 300; color: #86868b; letter-spacing: -0.1px;">目标数据库：${selectedDatabase}</div>
        <div class="field" style="background: transparent; padding: 0;">
            <label style="font-size: 14px; font-weight: 400; color: #1d1d1f; margin-bottom: 12px; display: block; letter-spacing: -0.1px;">${t.nlp_label}</label>
            <textarea class="nlp-textarea" id="req-text" rows="6" placeholder="${t.nlp_placeholder}" style="width: 100%; padding: 12px 16px; border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; font-size: 14px; font-weight: 300; color: #1d1d1f; background: #F5F5F7; resize: vertical; font-family: inherit; letter-spacing: -0.1px; line-height: 1.5;"></textarea>
            <div style="margin-top: 16px; display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 13px; font-weight: 300; color: #86868b; letter-spacing: -0.1px;">${t.quick_fill}</span>
                <span class="nlp-tag" onclick="fillReq('sales')" style="padding: 4px 12px; border-radius: 6px; background: rgba(0,122,255,0.1); color: #007AFF; font-size: 13px; font-weight: 400; cursor: pointer; transition: all 0.2s;">${t.sales_analysis}</span>
                <span class="nlp-tag" onclick="fillReq('user')" style="padding: 4px 12px; border-radius: 6px; background: rgba(0,122,255,0.1); color: #007AFF; font-size: 13px; font-weight: 400; cursor: pointer; transition: all 0.2s;">${t.user_profile}</span>
            </div>
        </div>
    `;
    drawer.classList.add('active');
}

// 处理文件选择
function handleFileSelect(event) {
    const fileInput = event.target;
    const uploadArea = document.getElementById('excel-upload-area');
    if (fileInput.files && fileInput.files[0]) {
        const fileName = fileInput.files[0].name;
        uploadArea.innerHTML = `
            <div class="excel-upload-text" style="color: #007AFF;">${fileName}</div>
            <div class="excel-upload-hint">点击重新选择</div>
        `;
    }
}

function fillReq(type) {
    const map = {
        'sales': currentLang === 'en' ? 
            'I need a sales analysis model focusing on:\n1. Daily sales and order volume by store\n2. Top 10 selling products\n3. Customer repurchase rate' : 
            '我需要建立一个销售分析模型，主要关注：\n1. 各门店的每日销售额和订单量\n2. 不同产品的销量排名前十\n3. 客户的复购率分析',
        'user': currentLang === 'en' ? 
            'Help me build a user profile model including:\n1. User age and gender distribution\n2. Heatmap of users by region\n3. VIP user behavior analysis' :
            '请帮我构建用户画像分析模型，包含：\n1. 用户的年龄、性别分布\n2. 不同地区的用户数量热力图\n3. 高价值用户（VIP）的消费行为特征'
    };
    const textarea = document.getElementById('req-text');
    if (textarea) textarea.value = map[type];
}

function handleConfigConfirm() {
    if (currentSourceType === 'database') {
        showToast(currentLang === 'en' ? "Connecting to database..." : "正在连接数据库...", "loading");
        setTimeout(() => {
            showToast(currentLang === 'en' ? "Connected successfully!" : "连接成功！", "success");
            closeDrawer('config-drawer');
            switchView('db');
        }, 1000);
    } else if (currentSourceType === 'excel') {
        const fileInput = document.getElementById('excel-file-input');
        lastExcelName = fileInput?.files?.[0]?.name || 'Marketing_Data.xlsx';
        closeDrawer('config-drawer');
        startExcelIngestion(lastExcelName);
    } else if (currentSourceType === 'nodata') {
        closeDrawer('config-drawer');
        startNlpSchemaGeneration();
    } else {
        closeDrawer('config-drawer');
    }
}

function openTableSelectionDrawer(dbName) {
    const drawer = document.getElementById('table-selection-drawer');
    const t = translations[currentLang];
    document.getElementById('table-selection-title').textContent = `${t.select_tables} - ${dbName}`;
    drawer.classList.add('active');
    resetTableSelectionStages();
}

function resetTableSelectionStages() {
    document.getElementById('stage-table-list').classList.remove('hidden');
    document.getElementById('stage-process-logs').classList.add('hidden');
    document.getElementById('stage-schema-adjust').classList.add('hidden');
    document.getElementById('stage-success-info').classList.add('hidden');
    
    document.getElementById('drawer-footer-bar').classList.remove('hidden');
    document.getElementById('btn-save-schema').classList.add('hidden');
    
    // 重置步骤条到「步骤 1：选择」
    updateGenStep(1);
    
    dictionaryFileName = null;
    const label = document.getElementById('dictionary-file-label');
    if(label) label.textContent = translations[currentLang].no_file;
}

function updateGenStep(stepNum) {
     document.getElementById('gen-steps').classList.remove('hidden');
     document.querySelectorAll('.step').forEach((el, index) => {
        if (index + 1 <= stepNum) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

function closeDrawer(id) {
    document.getElementById(id).classList.remove('active');
    if (processingInterval) clearInterval(processingInterval);
}

function startSchemaGeneration() {
    activeFlow = 'database';
    document.getElementById('stage-table-list').classList.add('hidden');
    document.getElementById('stage-process-logs').classList.remove('hidden');
    document.getElementById('drawer-footer-bar').classList.add('hidden'); 
    
    updateGenStep(2);

    const logs = document.getElementById('agent-logs');
    logs.innerHTML = '';
    
    const stepsEn = [
        { msg: "Validating table structure...", desc: "Checking dim_users, fact_orders..." },
        { msg: "Data Sampling", desc: "Reading top 1000 rows for feature analysis..." },
        { msg: "Semantic Understanding (Alisa)", desc: "Alisa is inferring field meanings..." },
        { msg: "Industry Agent", desc: "Matching industry pattern [Retail/E-commerce]" },
        { msg: "Building Semantic Model", desc: "Generating relationships and metrics..." },
        { msg: "Generation Complete", desc: "Ready for manual review..." }
    ];

    const stepsZh = [
        { msg: "验证表结构与权限...", desc: "正在检查 dim_users, fact_orders..." },
        { msg: "数据采样 (Sample)", desc: "读取前 1000 行数据进行特征分析..." },
        { msg: "语义理解层 (Alisa)", desc: "Alisa 正在推断字段业务含义..." },
        { msg: "行业判断 Agent", desc: "识别数据特征... 匹配为 [零售/电商行业]" },
        { msg: "构建语义模型 (SemanticDB)", desc: "自动生成关联关系与计算指标..." },
        { msg: "生成完成", desc: "准备进入人工确认..." }
    ];

    const steps = currentLang === 'en' ? stepsEn : stepsZh;

    if (dictionaryFileName) {
        steps.splice(2, 0, { 
            msg: currentLang === 'en' ? "Parsing Dictionary" : "解析数据字典", 
            desc: currentLang === 'en' ? `Reading ${dictionaryFileName}...` : `读取 ${dictionaryFileName}...` 
        });
    }
    
    let i = 0;
    processingInterval = setInterval(() => {
        if (i >= steps.length) {
            clearInterval(processingInterval);
            setTimeout(showSchemaAdjustment, 800);
            return;
        }
        const step = steps[i];
        const div = document.createElement('div');
        div.className = 'log-item completed'; // Mark as completed for visual check
        div.innerHTML = `
            <div class="log-icon"><i class="fas fa-check"></i></div>
            <div class="log-content">
                <div class="log-title">${step.msg}</div>
                <div class="log-desc">${step.desc}</div>
            </div>
        `;
        logs.appendChild(div);
        document.getElementById('process-status-text').textContent = step.msg;
        
        // Auto scroll
        const container = document.querySelector('.drawer-body');
        if(container) container.scrollTop = container.scrollHeight;
        
        i++;
    }, 1000);
}

function startNlpSchemaGeneration() {
    activeFlow = 'nodata';
    const drawer = document.getElementById('table-selection-drawer');
    document.getElementById('table-selection-title').textContent = currentLang === 'en' ? 'Smart Modeling...' : '智能建模生成中...';
    drawer.classList.add('active');

    resetTableSelectionStages();
    document.getElementById('stage-table-list').classList.add('hidden');
    document.getElementById('stage-process-logs').classList.remove('hidden');
    document.getElementById('drawer-footer-bar').classList.add('hidden');

    updateGenStep(2);
    const logs = document.getElementById('agent-logs');
    logs.innerHTML = '';

    const stepsEn = [
        { msg: "Analyzing Requirements...", desc: "Extracting key entities: Stores, Orders, Products...", icon: "fas fa-search" },
        { msg: "Building Concept Model", desc: "ER Graph: Store -> Order -> Product", icon: "fas fa-project-diagram" },
        { msg: "Generating Virtual Schema", desc: "Creating tables: dim_store, fact_sales", icon: "fas fa-database" },
        { msg: "Generating Semantic Layer", desc: "Defining metrics: Sales(sum), Count(count)...", icon: "fas fa-layer-group" },
        { msg: "Model Verified", desc: "Preparing view...", icon: "fas fa-check-circle" }
    ];
    const stepsZh = [
        { msg: "正在分析业务需求...", desc: "提取关键实体：门店、订单、产品...", icon: "fas fa-search" },
        { msg: "构建概念模型 (ER图)", desc: "识别关系：门店 -(拥有)-> 订单 -(包含)-> 产品", icon: "fas fa-project-diagram" },
        { msg: "生成虚拟数据结构", desc: "创建表结构：dim_store, fact_sales, dim_product", icon: "fas fa-database" },
        { msg: "生成语义层 (SemanticDB)", desc: "定义指标：销售额(sum), 订单量(count)...", icon: "fas fa-layer-group" },
        { msg: "模型校验通过", desc: "准备展示模型结构...", icon: "fas fa-check-circle" }
    ];
    const steps = currentLang === 'en' ? stepsEn : stepsZh;
    
    let i = 0;
    processingInterval = setInterval(() => {
        if (i >= steps.length) {
            clearInterval(processingInterval);
            setTimeout(showSchemaAdjustment, 800);
            return;
        }
        const step = steps[i];
        const div = document.createElement('div');
        div.className = 'log-item completed';
        div.innerHTML = `
             <div class="log-icon"><i class="${step.icon}"></i></div>
            <div class="log-content">
                <div class="log-title">${step.msg}</div>
                <div class="log-desc">${step.desc}</div>
            </div>
        `;
        logs.appendChild(div);
        document.getElementById('process-status-text').textContent = step.msg;
        
        // Auto scroll
        const container = document.querySelector('.drawer-body');
        if(container) container.scrollTop = container.scrollHeight;

        i++;
    }, 1200);
}

function startExcelIngestion(fileName) {
    activeFlow = 'excel';
    const drawer = document.getElementById('table-selection-drawer');
    document.getElementById('table-selection-title').textContent = currentLang === 'en' ? `Importing ${fileName}...` : `正在导入 ${fileName}...`;
    drawer.classList.add('active');

    resetTableSelectionStages();
    document.getElementById('stage-table-list').classList.add('hidden');
    document.getElementById('stage-process-logs').classList.remove('hidden');
    document.getElementById('drawer-footer-bar').classList.add('hidden');

    updateGenStep(2);
    const logs = document.getElementById('agent-logs');
    logs.innerHTML = '';

    const stepsEn = [
        { msg: "Uploading to Doris", desc: `Uploading ${fileName}...`, icon: "fas fa-cloud-upload-alt" },
        { msg: "Data Validation", desc: "Checking nulls, formats...", icon: "fas fa-check-double" },
        { msg: "Field Mapping", desc: "Mapping: OrderID, Store, Amount...", icon: "fas fa-project-diagram" },
        { msg: "Writing Table", desc: "Creating excel_orders (50k rows)...", icon: "fas fa-table" },
        { msg: "Building Semantic Model", desc: "Auto-generating metrics...", icon: "fas fa-brain" }
    ];
    const stepsZh = [
        { msg: "上传文件至 Doris", desc: `正在上传 ${fileName}...`, icon: "fas fa-cloud-upload-alt" },
        { msg: "执行数据校验", desc: "检查空值、日期格式、金额字段...", icon: "fas fa-check-double" },
        { msg: "字段映射", desc: "匹配列名：订单号、门店、金额、时间...", icon: "fas fa-project-diagram" },
        { msg: "写入 Doris 表", desc: "创建表 excel_orders 并导入 50,000 行数据...", icon: "fas fa-table" },
        { msg: "生成语义模型 (SemanticDB)", desc: "定义指标：销售额(sum)、平均客单价(avg)...", icon: "fas fa-brain" }
    ];
    const steps = currentLang === 'en' ? stepsEn : stepsZh;

    let i = 0;
    processingInterval = setInterval(() => {
        if (i >= steps.length) {
            clearInterval(processingInterval);
            setTimeout(showSchemaAdjustment, 800);
            return;
        }
        const step = steps[i];
        const div = document.createElement('div');
        div.className = 'log-item completed';
        div.innerHTML = `
             <div class="log-icon"><i class="${step.icon}"></i></div>
            <div class="log-content">
                <div class="log-title">${step.msg}</div>
                <div class="log-desc">${step.desc}</div>
            </div>
        `;
        logs.appendChild(div);
        document.getElementById('process-status-text').textContent = step.msg;
        
        // Auto scroll
        const container = document.querySelector('.drawer-body');
        if(container) container.scrollTop = container.scrollHeight;

        i++;
    }, 1100);
}

function showSchemaAdjustment() {
    document.getElementById('stage-process-logs').classList.add('hidden');
    document.getElementById('stage-schema-adjust').classList.remove('hidden');
    document.getElementById('drawer-footer-bar').classList.remove('hidden');
    document.getElementById('btn-save-schema').classList.remove('hidden');
    
    updateGenStep(3);
    populateSchemaTable();
}

function populateSchemaTable() {
    const t = translations[currentLang];
    const tbody = document.getElementById('schema-tbody');
    // Dynamic header update
    const thead = document.querySelector('#stage-schema-adjust thead tr');
    if(thead) thead.innerHTML = `<th>${t.field}</th><th>${t.type}</th><th>${t.desc}</th><th>${t.lock}</th>`;

    tbody.innerHTML = `
        <tr>
            <td><input type="text" class="p-inputtext" value="order_id" readonly></td>
            <td><span class="p-tag p-tag-info">String</span></td>
            <td><input type="text" class="p-inputtext" value="${currentLang === 'en'?'Order Unique ID':'订单唯一标识'}"></td>
            <td><i class="fas fa-lock" style="color:#ccc"></i></td>
        </tr>
        <tr>
            <td><input type="text" class="p-inputtext" value="amount" readonly></td>
            <td><span class="p-tag p-tag-success">Decimal</span></td>
            <td><input type="text" class="p-inputtext" value="${currentLang === 'en'?'Transaction Amount':'交易金额'}"></td>
            <td><i class="fas fa-lock" style="color:#ccc"></i></td>
        </tr>
        <tr>
            <td><input type="text" class="p-inputtext" value="store_name" readonly></td>
            <td><span class="p-tag p-tag-info">String</span></td>
            <td><input type="text" class="p-inputtext" value="${currentLang === 'en'?'Store Name':'门店名称'}"></td>
            <td><i class="fas fa-lock" style="color:#ccc"></i></td>
        </tr>
    `;
}

function confirmSchema() {
    const btn = document.getElementById('btn-save-schema');
    const originalText = btn.textContent;
    btn.textContent = translations[currentLang].saving;
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        
        document.getElementById('stage-schema-adjust').classList.add('hidden');
        document.getElementById('stage-success-info').classList.remove('hidden');
        document.getElementById('drawer-footer-bar').classList.add('hidden');
        document.getElementById('gen-steps').classList.add('hidden');

        showToast(translations[currentLang].model_saved);
        
        if (activeFlow === 'nodata') addNlpModelRow();
        else if (activeFlow === 'excel') addExcelModelRow(lastExcelName);
        else updateDbStatus();

        activeFlow = null;
    }, 1000);
}

function updateDbStatus() {
    const statusCell = document.getElementById('status-mysql');
    if(statusCell) statusCell.innerHTML = `<span class="p-tag p-tag-success">${currentLang==='en'?'Ready':'已就绪'} (v1.0)</span>`;
}

function addNlpModelRow() {
    const tbody = document.querySelector('#view-db tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${tbody.children.length + 1}</td>
        <td>
             <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-brain" style="color: var(--primary-color);"></i>
                <b>SmartModel - Sales</b>
            </div>
        </td>
        <td>Virtual</td>
        <td><span class="p-tag p-tag-success">${currentLang==='en'?'Online':'在线'}</span></td>
        <td>3</td>
        <td><span class="p-tag p-tag-success">${currentLang==='en'?'Ready':'已就绪'}</span></td>
        <td>
             <button class="p-button p-button-text" onclick="goToChat()">Chat</button>
             <button class="p-button p-button-text p-button-danger">Delete</button>
        </td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);
}

function addExcelModelRow(name) {
    const tbody = document.querySelector('#view-db tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${tbody.children.length + 1}</td>
        <td>
             <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-file-excel" style="color: #059669;"></i>
                <b>Excel - ${name}</b>
            </div>
        </td>
        <td>Doris</td>
        <td><span class="p-tag p-tag-success">${currentLang==='en'?'Synced':'已同步'}</span></td>
        <td>1</td>
        <td><span class="p-tag p-tag-success">${currentLang==='en'?'Ready':'已就绪'}</span></td>
        <td>
             <button class="p-button p-button-text" onclick="goToChat()">Chat</button>
             <button class="p-button p-button-text p-button-danger">Delete</button>
        </td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);
}

function goToChat() {
    closeDrawer('table-selection-drawer');
    closeDrawer('config-drawer');
    switchView('chat');
    
    setTimeout(() => {
        renderPersonaStage(currentPersona, true);
    }, 500);
}

function handleChatEnter(e) {
    if (agentPaletteOpen) {
        if (e.key === 'Escape') {
            e.preventDefault();
            if (typeof closeAgentPalette === 'function') {
                closeAgentPalette();
            }
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            return;
        }
        if (!['Shift', 'Control', 'Alt'].includes(e.key)) {
            if (typeof closeAgentPalette === 'function') {
                closeAgentPalette();
            }
        }
    }

    if (e.key === '/' && !agentPaletteOpen && !e.shiftKey && !e.altKey && !e.ctrlKey) {
        e.preventDefault();
        if (typeof openAgentPalette === 'function') {
            openAgentPalette();
        }
        return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChat();
    }
}

function sendChat() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    // Hide profile section and show messages section when first message is sent
    const profileSection = document.getElementById('chat-profile-section');
    const messagesContainer = document.getElementById('chat-messages-container');
    if (profileSection && !profileSection.classList.contains('hidden')) {
        profileSection.classList.add('hidden');
    }
    if (messagesContainer && messagesContainer.classList.contains('hidden')) {
        messagesContainer.classList.remove('hidden');
    }
    
    const personaKey = currentPersona;
    const chatMsgs = document.getElementById('chat-messages');
    
    // Get agent avatar for user message
    const agents = getChatAgents();
    const currentAgent = agents.find(a => a.id === personaKey);
    const agentAvatar = currentAgent ? `<img src="${currentAgent.avatar}" alt="${currentAgent.name}">` : '';
    
    // User message
    const uDiv = document.createElement('div');
    uDiv.className = 'chat-message-row user';
    const formatted = text.replace(/\n/g, '<br>');
    uDiv.innerHTML = `
        <div class="message-bubble">${formatted}</div>
        <div class="message-avatar">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #007AFF; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 400;">U</div>
        </div>
    `;
    chatMsgs.appendChild(uDiv);
    input.value = '';
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    
    // Detect if this is a complex query (contains both data + analysis keywords)
    const isComplexQuery = detectComplexQuery(text);
    
    if (isComplexQuery) {
        runOpusThinkingFlow(text, personaKey, chatMsgs);
    } else {
        runSimpleFlow(text, personaKey, chatMsgs);
    }
}

function detectComplexQuery(text) {
    const dataKeywords = ['销售', 'GMV', '收入', '客流', '毛利', '转化', '趋势', '数据', '指标', 'sales', 'revenue'];
    const analysisKeywords = ['为什么', '原因', '分析', '竞品', '对比', '关系', '影响', '策略', 'why', 'reason', 'compare'];
    
    const hasData = dataKeywords.some(k => text.toLowerCase().includes(k.toLowerCase()));
    const hasAnalysis = analysisKeywords.some(k => text.toLowerCase().includes(k.toLowerCase()));
    
    return hasData && hasAnalysis;
}

function runSimpleFlow(text, personaKey, chatMsgs) {
    // 获取agent头像
    const agents = getChatAgents();
    const agent = agents.find(a => a.id === personaKey);
    const avatarHTML = agent ? `<img src="${agent.avatar}" alt="${agent.name}">` : '';
    
    // 显示思考中的状态
    const tDiv = document.createElement('div');
    tDiv.className = 'chat-message-row thinking';
    tDiv.innerHTML = `
        <div class="message-avatar">${avatarHTML}</div>
        <div class="message-bubble" style="color:#86868b; font-size:13px;">
            <i class="fas fa-circle-notch fa-spin"></i> 正在分析...
        </div>
    `;
    chatMsgs.appendChild(tDiv);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    
    // 检查是否是AI员工
    let model = 'deepseek-chat';
    let systemPrompt = null;
    let temperature = 0.7;
    let conversationId = null;
    
    if (isEmployeeKey(personaKey)) {
        const employee = getEmployeeByKey(personaKey);
        if (employee) {
            // 使用AI员工的配置
            model = employee.model || 'deepseek-chat';
            systemPrompt = employee.prompt || null;
            temperature = employee.temperature !== undefined ? employee.temperature : 0.7;
            // 每个员工使用独立的对话历史
            conversationId = `employee-${employee.id}`;
        }
    } else {
        // 根据persona选择模型：science使用deepseek-chat，liberal使用deepseek-reasoner
        model = personaKey === 'science' ? 'deepseek-chat' : 'deepseek-reasoner';
        conversationId = `persona-${personaKey}`;
    }
    
    // 调用DeepSeek API
    callDeepSeekAPI(text, model, conversationId, systemPrompt, temperature).then(result => {
        tDiv.remove(); // 移除思考中的提示
        
        if (result.success) {
            // 创建助手回复
            const agents = getChatAgents();
            const agent = agents.find(a => a.id === personaKey);
            const avatarHTML = agent ? `<img src="${agent.avatar}" alt="${agent.name}">` : '';
            
            const aDiv = document.createElement('div');
            aDiv.className = 'chat-message-row';
            const formattedResponse = result.message.replace(/\n/g, '<br>');
            aDiv.innerHTML = `
                <div class="message-avatar">${avatarHTML}</div>
                <div class="message-bubble">${formattedResponse}</div>
            `;
            chatMsgs.appendChild(aDiv);
        } else {
            // 显示错误消息
            const agents = getChatAgents();
            const agent = agents.find(a => a.id === personaKey);
            const avatarHTML = agent ? `<img src="${agent.avatar}" alt="${agent.name}">` : '';
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message-row';
            errorDiv.innerHTML = `
                <div class="message-avatar">${avatarHTML}</div>
                <div class="message-bubble" style="color: #ef4444;">
                    <i class="fas fa-exclamation-circle"></i> 错误：${result.error || '未知错误'}
                </div>
            `;
            chatMsgs.appendChild(errorDiv);
        }
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }).catch(error => {
        tDiv.remove();
        const agents = getChatAgents();
        const agent = agents.find(a => a.id === personaKey);
        const avatarHTML = agent ? `<img src="${agent.avatar}" alt="${agent.name}">` : '';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-message-row';
        errorDiv.innerHTML = `
            <div class="message-avatar">${avatarHTML}</div>
            <div class="message-bubble" style="color: #ef4444;">
                <i class="fas fa-exclamation-circle"></i> 错误：${error.message || '网络错误，请稍后重试'}
            </div>
        `;
        chatMsgs.appendChild(errorDiv);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    });
}

function runOpusThinkingFlow(text, personaKey, chatMsgs) {
    // Full Technical Demonstration Flow:
    // Phase 1: Architecture Preparation & Tool Definitions
    // Phase 2: Code Generation by Opus 4.5
    // Phase 3: Parallel Execution in Sandbox
    // Phase 4: Insight Synthesis
    
    let currentPhaseDiv = null;
    let startTime = Date.now();
    
    // ======== PHASE 1: Architecture & Tool Definitions ========
    setTimeout(() => {
        currentPhaseDiv = document.createElement('div');
        currentPhaseDiv.className = 'chat-message-row';
        currentPhaseDiv.id = 'opus-arch-phase';
        currentPhaseDiv.innerHTML = `
            <div class="message-avatar">${getPersonaAvatarHTML(personaKey)}</div>
            <div class="opus-arch-card">
                <div class="arch-header">
                    <div class="arch-icon"><i class="fas fa-microchip"></i></div>
                    <div class="arch-title">
                        <h4>第一阶段：架构准备</h4>
                        <span>Infrastructure Initialization</span>
                    </div>
                    <div class="arch-badge">LIVE</div>
                </div>
                
                <div class="arch-diagram">
                    <div class="arch-layer">
                        <div class="arch-layer-icon frontend"><i class="fas fa-desktop"></i></div>
                        <div class="arch-layer-info">
                            <div class="arch-layer-name">Frontend · 接收用户请求</div>
                            <div class="arch-layer-desc">解析自然语言指令，路由到 Opus 4.5</div>
                        </div>
                        <div class="arch-layer-status"><i class="fas fa-check"></i> Ready</div>
                    </div>
                    <div class="arch-layer">
                        <div class="arch-layer-icon backend"><i class="fas fa-server"></i></div>
                        <div class="arch-layer-info">
                            <div class="arch-layer-name">Backend · 调用 Claude API</div>
                            <div class="arch-layer-desc">claude-opus-4-5-20251101 · High Effort Mode</div>
                        </div>
                        <div class="arch-layer-status"><i class="fas fa-check"></i> Connected</div>
                    </div>
                    <div class="arch-layer">
                        <div class="arch-layer-icon sandbox"><i class="fas fa-cube"></i></div>
                        <div class="arch-layer-info">
                            <div class="arch-layer-name">Sandbox · 代码执行环境</div>
                            <div class="arch-layer-desc">Docker 隔离容器 · Python 3.11 Runtime</div>
                        </div>
                        <div class="arch-layer-status"><i class="fas fa-check"></i> Standby</div>
                    </div>
                </div>
                
                <div class="tool-defs">
                    <div class="tool-defs-header">
                        <div class="tool-defs-title">第二阶段：工具定义 (Tool Definitions)</div>
                        <div class="tool-defs-badge">allowed_callers: code_execution</div>
                    </div>
                    <div class="tool-items">
                        <div class="tool-item">
                            <div class="tool-item-icon code"><i class="fas fa-play"></i></div>
                            <div class="tool-item-info">
                                <div class="tool-item-name">code_runner</div>
                                <div class="tool-item-desc">Python 脚本执行引擎 · 沙盒隔离</div>
                            </div>
                            <div class="tool-item-tag">Core</div>
                        </div>
                        <div class="tool-item">
                            <div class="tool-item-icon sql"><i class="fas fa-database"></i></div>
                            <div class="tool-item-info">
                                <div class="tool-item-name">fetch_bi_data(metric, time_range)</div>
                                <div class="tool-item-desc">执行结构化数据查询 · SQL</div>
                            </div>
                            <div class="tool-item-tag">BI</div>
                        </div>
                        <div class="tool-item">
                            <div class="tool-item-icon rag"><i class="fas fa-brain"></i></div>
                            <div class="tool-item-info">
                                <div class="tool-item-name">search_knowledge_base(query)</div>
                                <div class="tool-item-desc">语义检索非结构化文档 · RAG</div>
                            </div>
                            <div class="tool-item-tag">RAG</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        chatMsgs.appendChild(currentPhaseDiv);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
        
        // ======== PHASE 2: Code Generation (after 2.5s) ========
        setTimeout(() => {
            // Smooth fade out before transition
            const archCard = currentPhaseDiv.querySelector('.opus-arch-card');
            if (archCard) archCard.classList.add('fading-out');
            
            setTimeout(() => {
                currentPhaseDiv.remove();
            
            currentPhaseDiv = document.createElement('div');
            currentPhaseDiv.className = 'chat-message-row';
            currentPhaseDiv.id = 'opus-codegen-phase';
            
            const pythonCode = generateOpusPythonCode(text);
            const codeLines = pythonCode.split('\n');
            const lineNumbers = codeLines.map((_, i) => `<span>${i + 1}</span>`).join('');
            const highlightedCode = highlightPythonSyntax(pythonCode);
            
            currentPhaseDiv.innerHTML = `
                <div class="message-avatar">${getPersonaAvatarHTML(personaKey)}</div>
                <div class="opus-codegen-card">
                    <div class="codegen-header">
                        <div class="codegen-left">
                            <div class="codegen-icon"><i class="fas fa-code"></i></div>
                            <div class="codegen-title">
                                <h4>第三阶段：代码生成</h4>
                                <span>Opus 4.5 Programmatic Tool Calling</span>
                            </div>
                        </div>
                        <div class="codegen-status typing">
                            <i class="fas fa-circle"></i>
                            <span>Generating...</span>
                        </div>
                    </div>
                    <div class="codegen-body">
                        <div class="code-block-wrapper">
                            <div class="code-line-numbers" id="typing-line-numbers"></div>
                            <pre class="code-content"><code id="typing-code-target"></code></pre>
                        </div>
                    </div>
                    <div class="codegen-footer">
                        <div class="codegen-meta">
                            <span><i class="fas fa-file-code"></i> sandbox_script.py</span>
                            <span><i class="fas fa-code-branch"></i> ThreadPoolExecutor</span>
                            <span class="typing-time"><i class="fas fa-clock"></i> <span id="typing-elapsed">0</span>ms</span>
                        </div>
                        <button class="codegen-action" onclick="copyCodeToClipboard(this)">
                            <i class="fas fa-copy"></i> 复制
                        </button>
                    </div>
                </div>
            `;
            chatMsgs.appendChild(currentPhaseDiv);
            chatMsgs.scrollTop = chatMsgs.scrollHeight;
            
            // Start typewriter effect
            typewriterEffect(pythonCode, currentPhaseDiv, chatMsgs);
            
            // ======== PHASE 3: Parallel Execution (after typewriter completes ~4.5s) ========
            setTimeout(() => {
                // Smooth fade out before transition
                const codegenCard = currentPhaseDiv.querySelector('.opus-codegen-card');
                if (codegenCard) codegenCard.classList.add('fading-out');
                
                setTimeout(() => {
                    currentPhaseDiv.remove();
                    runParallelExecutionPhase(text, personaKey, chatMsgs, startTime);
                }, 400);
            }, 4500);
            
        }, 400); // Wait for fade out animation
        }, 2800); // Increased for smoother transition
        
    }, 400);
}

// Generate the Python code that Opus 4.5 would produce
function generateOpusPythonCode(userQuery) {
    return `import concurrent.futures
import json

def task_sales():
    """获取销售数据 (BI 数据仓库)"""
    return fetch_bi_data(
        metric="revenue",
        time_range="2025-Q1-Q4"
    )

def task_rag():
    """检索竞品情报 (知识库)"""
    return search_knowledge_base(
        query="竞品A 2025年市场策略 促销活动"
    )

def main():
    results = {}
    
    # 并行执行双轨任务
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_sales = executor.submit(task_sales)
        future_rag = executor.submit(task_rag)
        
        # 获取结果
        results["quantitative"] = future_sales.result()
        results["qualitative"] = future_rag.result()
    
    # 输出聚合结果
    print(json.dumps(results, ensure_ascii=False))

if __name__ == "__main__":
    main()`;
}

// Python syntax highlighting
function highlightPythonSyntax(code) {
    // Keywords
    code = code.replace(/\b(import|from|def|return|with|as|if|else|for|in|try|except|class|and|or|not|True|False|None)\b/g, 
        '<span class="keyword">$1</span>');
    
    // Built-in functions
    code = code.replace(/\b(print|len|range|str|int|float|list|dict|tuple|set)\b(?=\()/g, 
        '<span class="function">$1</span>');
    
    // User-defined functions (after def)
    code = code.replace(/def\s+(\w+)/g, 
        'def <span class="function">$1</span>');
    
    // Strings
    code = code.replace(/(["'])((?:\\.|[^\\])*?)\1/g, 
        '<span class="string">$1$2$1</span>');
    
    // Triple-quoted strings / docstrings
    code = code.replace(/("""[\s\S]*?""")/g, 
        '<span class="string">$1</span>');
    
    // Comments
    code = code.replace(/(#.*$)/gm, 
        '<span class="comment">$1</span>');
    
    // Numbers
    code = code.replace(/\b(\d+\.?\d*)\b/g, 
        '<span class="number">$1</span>');
    
    return code;
}

// Typewriter effect for code generation
function typewriterEffect(code, container, chatMsgs) {
    const codeTarget = container.querySelector('#typing-code-target');
    const lineNumbersTarget = container.querySelector('#typing-line-numbers');
    const elapsedEl = container.querySelector('#typing-elapsed');
    const statusEl = container.querySelector('.codegen-status');
    
    if (!codeTarget) return;
    
    const lines = code.split('\n');
    let currentLine = 0;
    let currentChar = 0;
    let displayedCode = '';
    const startTime = Date.now();
    
    // Update elapsed time
    const timeInterval = setInterval(() => {
        if (elapsedEl) {
            elapsedEl.textContent = Date.now() - startTime;
        }
    }, 50);
    
    function updateLineNumbers() {
        const count = (displayedCode.match(/\n/g) || []).length + 1;
        let nums = '';
        for (let i = 1; i <= count; i++) {
            nums += `<span>${i}</span>`;
        }
        if (lineNumbersTarget) lineNumbersTarget.innerHTML = nums;
    }
    
    function typeNextChar() {
        if (currentLine >= lines.length) {
            // Typing complete
            clearInterval(timeInterval);
            if (statusEl) {
                statusEl.classList.remove('typing');
                statusEl.innerHTML = '<i class="fas fa-check-circle"></i><span>Generated</span>';
            }
            // Remove cursor
            codeTarget.classList.remove('typing-cursor');
            return;
        }
        
        const line = lines[currentLine];
        
        if (currentChar < line.length) {
            // Add next character
            displayedCode += line[currentChar];
            currentChar++;
        } else {
            // Move to next line
            displayedCode += '\n';
            currentLine++;
            currentChar = 0;
        }
        
        // Apply syntax highlighting to displayed code
        codeTarget.innerHTML = highlightPythonSyntax(displayedCode);
        codeTarget.classList.add('typing-cursor');
        updateLineNumbers();
        
        // Scroll to keep code visible
        const codeBody = container.querySelector('.codegen-body');
        if (codeBody) codeBody.scrollTop = codeBody.scrollHeight;
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
        
        // Variable speed - faster for spaces/common chars, slower for new lines
        let delay = 12; // Base speed
        if (displayedCode.endsWith('\n')) {
            delay = 80; // Pause at line breaks
        } else if (displayedCode.endsWith(' ') || displayedCode.endsWith('(') || displayedCode.endsWith(')')) {
            delay = 8; // Faster for spaces and brackets
        }
        
        setTimeout(typeNextChar, delay);
    }
    
    // Start typing after a brief delay
    setTimeout(typeNextChar, 300);
}

// Copy code to clipboard
function copyCodeToClipboard(btn) {
    const codeBlock = btn.closest('.opus-codegen-card').querySelector('code');
    const code = codeBlock.textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> 复制';
        }, 2000);
    });
}

// Phase 3: Parallel Execution with real-time metrics
function runParallelExecutionPhase(text, personaKey, chatMsgs, startTime) {
    const parallelDiv = document.createElement('div');
    parallelDiv.className = 'chat-message-row';
    parallelDiv.id = 'opus-parallel-phase';
    
    parallelDiv.innerHTML = `
        <div class="message-avatar">${getPersonaAvatarHTML(personaKey)}</div>
        <div class="opus-parallel-card">
            <div class="parallel-header">
                <div class="parallel-header-left">
                    <div class="parallel-icon"><i class="fas fa-sync-alt"></i></div>
                    <div class="parallel-title">
                        <h4>第四阶段：并行执行</h4>
                        <span>Sandbox Running · ThreadPoolExecutor</span>
                    </div>
                </div>
                <div class="parallel-timer">
                    <div class="timer-value" id="exec-timer">0.0s</div>
                    <div class="timer-label">执行耗时</div>
                </div>
            </div>
            
            <div class="parallel-exec-tracks">
                <div class="exec-track sql-track">
                    <div class="exec-track-icon"><i class="fas fa-database"></i></div>
                    <div class="exec-track-content">
                        <div class="exec-track-header">
                            <div class="exec-track-name">fetch_bi_data() · 数据层</div>
                            <div class="exec-track-time" id="sql-time">0ms</div>
                        </div>
                        <div class="exec-track-progress">
                            <div class="exec-track-bar" id="sql-progress" style="width: 0%"></div>
                        </div>
                        <div class="exec-track-status" id="sql-status">
                            <i class="fas fa-circle-notch fa-spin"></i>
                            <span>正在连接数据仓库...</span>
                        </div>
                    </div>
                    <div class="exec-track-result" id="sql-result">
                        <div class="result-badge pending">执行中</div>
                    </div>
                </div>
                
                <div class="exec-track rag-track">
                    <div class="exec-track-icon"><i class="fas fa-brain"></i></div>
                    <div class="exec-track-content">
                        <div class="exec-track-header">
                            <div class="exec-track-name">search_knowledge_base() · 情报层</div>
                            <div class="exec-track-time" id="rag-time">0ms</div>
                        </div>
                        <div class="exec-track-progress">
                            <div class="exec-track-bar" id="rag-progress" style="width: 0%"></div>
                        </div>
                        <div class="exec-track-status" id="rag-status">
                            <i class="fas fa-circle-notch fa-spin"></i>
                            <span>正在检索向量数据库...</span>
                        </div>
                    </div>
                    <div class="exec-track-result" id="rag-result">
                        <div class="result-badge pending">执行中</div>
                    </div>
                </div>
            </div>
            
            <div class="sandbox-banner">
                <i class="fas fa-shield-alt"></i>
                <div class="sandbox-banner-text">
                    <div class="sandbox-banner-title">沙盒环境隔离执行</div>
                    <div class="sandbox-banner-desc">Python 脚本在 Docker 容器中安全运行，工具调用通过 RPC 代理转发</div>
                </div>
            </div>
            
            <div class="dev-mode-toggle" onclick="toggleDevMode(this)">
                <i class="fas fa-terminal"></i>
                <span>开发者模式 · 查看执行日志</span>
            </div>
            
            <div class="exec-log-panel hidden" id="exec-log-panel">
                <div class="log-line"><span class="log-time">00:00.000</span><span class="log-level info">[INFO]</span><span class="log-msg">Sandbox container started</span></div>
                <div class="log-line"><span class="log-time">00:00.012</span><span class="log-level info">[INFO]</span><span class="log-msg">Loading script: sandbox_script.py</span></div>
                <div class="log-line"><span class="log-time">00:00.025</span><span class="log-level info">[INFO]</span><span class="log-msg">ThreadPoolExecutor initialized (max_workers=2)</span></div>
            </div>
        </div>
    `;
    
    chatMsgs.appendChild(parallelDiv);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    
    // Animate the parallel execution
    let elapsed = 0;
    const timerInterval = setInterval(() => {
        elapsed += 100;
        const timerEl = parallelDiv.querySelector('#exec-timer');
        if (timerEl) timerEl.textContent = (elapsed / 1000).toFixed(1) + 's';
    }, 100);
    
    // Simulate SQL execution
    animateTrackProgress('sql', parallelDiv, 1800, () => {
        updateTrackComplete('sql', parallelDiv, '156ms', '查询完成 · 返回 4 条记录');
        addLogEntry(parallelDiv, (elapsed/1000).toFixed(3), 'success', 'fetch_bi_data() completed: 4 rows returned');
    });
    
    // Simulate RAG execution (slightly faster)
    animateTrackProgress('rag', parallelDiv, 1400, () => {
        updateTrackComplete('rag', parallelDiv, '89ms', '检索完成 · 匹配 12 篇文档');
        addLogEntry(parallelDiv, (elapsed/1000).toFixed(3), 'success', 'search_knowledge_base() completed: 12 docs found');
    });
    
    // Complete and show insight
    setTimeout(() => {
        clearInterval(timerInterval);
        addLogEntry(parallelDiv, (elapsed/1000).toFixed(3), 'success', 'All tasks completed. Aggregating results...');
        
        // Smooth fade out before showing insight
        setTimeout(() => {
            const parallelCard = parallelDiv.querySelector('.opus-parallel-card');
            if (parallelCard) parallelCard.classList.add('fading-out');
            
            setTimeout(() => {
                parallelDiv.remove();
                const insightDiv = buildOpusInsightResponse(text, personaKey);
                chatMsgs.appendChild(insightDiv);
                chatMsgs.scrollTop = chatMsgs.scrollHeight;
            }, 400);
        }, 600);
    }, 2400);
}

function animateTrackProgress(trackId, container, duration, onComplete) {
    const progressBar = container.querySelector(`#${trackId}-progress`);
    const timeEl = container.querySelector(`#${trackId}-time`);
    let progress = 0;
    const startTime = Date.now();
    
    const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(100, (elapsed / duration) * 100);
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (timeEl) timeEl.textContent = Math.round(elapsed) + 'ms';
        
        if (progress < 100) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) onComplete();
        }
    };
    
    requestAnimationFrame(animate);
}

function updateTrackComplete(trackId, container, time, message) {
    const statusEl = container.querySelector(`#${trackId}-status`);
    const resultEl = container.querySelector(`#${trackId}-result`);
    const timeEl = container.querySelector(`#${trackId}-time`);
    const trackEl = container.querySelector(`.${trackId}-track`);
    
    // Add subtle highlight animation
    if (trackEl) {
        trackEl.style.transition = 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        trackEl.style.background = trackId === 'sql' 
            ? 'rgba(0, 122, 255, 0.08)' 
            : 'rgba(175, 82, 222, 0.08)';
    }
    
    if (statusEl) {
        statusEl.style.transition = 'all 0.3s ease';
        statusEl.className = 'exec-track-status complete';
        statusEl.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    }
    if (resultEl) {
        resultEl.style.transition = 'all 0.3s ease';
        resultEl.innerHTML = `
            <div class="result-badge success">完成</div>
            <div class="result-count">${time}</div>
        `;
    }
    if (timeEl) timeEl.textContent = time;
}

function addLogEntry(container, time, level, message) {
    const logPanel = container.querySelector('#exec-log-panel');
    if (logPanel) {
        const logLine = document.createElement('div');
        logLine.className = 'log-line';
        logLine.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-level ${level}">[${level.toUpperCase()}]</span>
            <span class="log-msg">${message}</span>
        `;
        logPanel.appendChild(logLine);
        logPanel.scrollTop = logPanel.scrollHeight;
    }
}

function toggleDevMode(btn) {
    btn.classList.toggle('active');
    const logPanel = btn.nextElementSibling;
    if (logPanel) {
        logPanel.classList.toggle('hidden');
    }
}

function buildOpusInsightResponse(text, personaKey) {
    const div = document.createElement('div');
    div.className = 'chat-message-row';
    
    // Generate mock data based on query
    const salesData = {
        q1: 2850, q2: 3120, q3: 2680, q4: 3450,
        change: -14.1,
        annotation: { quarter: 'Q3', event: '竞品 A 发起 5 折促销' }
    };
    
    div.innerHTML = `
        <div class="message-avatar">${getPersonaAvatarHTML(personaKey)}</div>
        <div class="opus-insight-card">
            <div class="insight-header">
                <div class="insight-badge">
                    <i class="fas fa-sparkles"></i>
                    <span>深度洞察</span>
                </div>
                <div class="insight-meta">
                    <span><i class="fas fa-database"></i> SQL + RAG 融合分析</span>
                    <span><i class="fas fa-clock"></i> 2.1s</span>
                </div>
            </div>
            
            <div class="insight-conclusion">
                <h4>核心结论</h4>
                <p><strong>2025年销售额受竞品冲击明显，Q3环比下滑 ${Math.abs(salesData.change)}%。</strong></p>
                <p>通过对销售数据与市场情报的交叉分析，发现销售额下滑的时间点与竞品 A 的促销活动时间高度重合，两者相关性极高（r=0.89）。</p>
            </div>
            
            <div class="insight-grid">
                <div class="insight-panel data-panel">
                    <div class="panel-label"><i class="fas fa-chart-bar"></i> 定量数据 · SQL</div>
                    <div class="insight-chart">
                        <canvas id="insight-chart-${Date.now()}" height="140"></canvas>
                    </div>
                    <div class="chart-annotation">
                        <div class="annotation-marker"></div>
                        <div class="annotation-text">
                            <strong>Q3 异常点</strong>
                            <span>销售额环比下降 ${Math.abs(salesData.change)}%</span>
                        </div>
                    </div>
                </div>
                <div class="insight-panel intel-panel">
                    <div class="panel-label"><i class="fas fa-newspaper"></i> 市场情报 · RAG</div>
                    <div class="intel-sources">
                        <div class="intel-item">
                            <div class="intel-badge">竞品动态</div>
                            <div class="intel-title">竞品 A 宣布 Q3 全线产品 5 折促销</div>
                            <div class="intel-meta">来源：行业新闻库 · 2025-07-15</div>
                        </div>
                        <div class="intel-item">
                            <div class="intel-badge">市场分析</div>
                            <div class="intel-title">竞品 A 市场份额 Q3 提升 8.2%</div>
                            <div class="intel-meta">来源：市场调研报告 · 2025-10-01</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="insight-followup">
                <div class="followup-label"><i class="fas fa-comments"></i> 推荐追问</div>
                <div class="followup-chips">
                    <button class="followup-chip" onclick="sendQuickPrompt('竞品降价是否直接导致了Q3销售下滑？')">
                        <i class="fas fa-arrow-right"></i> 竞品降价是否直接导致了Q3销售下滑？
                    </button>
                    <button class="followup-chip" onclick="sendQuickPrompt('Q4销售回升的主要驱动因素是什么？')">
                        <i class="fas fa-arrow-right"></i> Q4销售回升的主要驱动因素是什么？
                    </button>
                </div>
            </div>
            
            <div class="insight-code-toggle">
                <button class="code-toggle-btn" onclick="toggleInsightCode(this)">
                    <i class="fas fa-code"></i> 查看执行脚本
                </button>
                <div class="insight-code-block hidden">
                    <pre><code>import concurrent.futures
import json

def task_sales():
    return get_sales_metric(year=2025, metric_type="revenue")

def task_rag():
    return query_competitor_kb("Competitor A 2025 strategy")

with concurrent.futures.ThreadPoolExecutor() as executor:
    future_sales = executor.submit(task_sales)
    future_rag = executor.submit(task_rag)
    
    results = {
        "quantitative": future_sales.result(),
        "qualitative": future_rag.result()
    }
    
print(json.dumps(results, ensure_ascii=False))</code></pre>
                </div>
            </div>
        </div>
    `;
    
    // Render chart after DOM insertion
    setTimeout(() => {
        const canvas = div.querySelector('canvas');
        if (canvas) renderInsightChart(canvas, salesData);
    }, 100);
    
    return div;
}

function renderInsightChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = 140 * 2;
    ctx.scale(2, 2);
    
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const values = [data.q1, data.q2, data.q3, data.q4];
    const maxVal = Math.max(...values) * 1.2;
    const chartW = w / 2 - 40;
    const chartH = h / 2 - 40;
    const barW = chartW / 4 - 20;
    
    ctx.clearRect(0, 0, w, h);
    
    // Bars
    values.forEach((val, i) => {
        const barH = (val / maxVal) * chartH;
        const x = 30 + i * (barW + 20);
        const y = 15 + chartH - barH;
        
        // Highlight Q3 (anomaly)
        if (i === 2) {
            ctx.fillStyle = '#FF3B30';
        } else {
            ctx.fillStyle = '#007AFF';
        }
        
        // Rounded top
        const r = 4;
        ctx.beginPath();
        ctx.moveTo(x, y + barH);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, y + barH);
        ctx.closePath();
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#1D1D1F';
        ctx.font = '500 11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(quarters[i], x + barW / 2, chartH + 30);
        
        // Value on top
        ctx.fillStyle = '#86868B';
        ctx.font = '500 10px -apple-system, sans-serif';
        ctx.fillText(`¥${(val/1000).toFixed(1)}k`, x + barW / 2, y - 5);
    });
}

function toggleInsightCode(btn) {
    const codeBlock = btn.nextElementSibling;
    codeBlock.classList.toggle('hidden');
    btn.innerHTML = codeBlock.classList.contains('hidden') 
        ? '<i class="fas fa-code"></i> 查看执行脚本'
        : '<i class="fas fa-code"></i> 收起脚本';
}

function handleDashboardChatEnter(e) {
    if (e.key === 'Enter') sendDashboardChat();
}

function sendDashboardChat() {
    const input = document.getElementById('dashboard-chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    const chatMsgs = document.getElementById('dashboard-chat-messages');
    
    // 用户消息
    const uDiv = document.createElement('div');
    uDiv.className = 'chat-message-row user';
    uDiv.innerHTML = `
        <div class="message-bubble">${text}</div>
        <div class="message-avatar"><i class="fas fa-user"></i></div>
    `;
    chatMsgs.appendChild(uDiv);
    
    input.value = '';
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    
    // 显示思考中的状态
    const tDiv = document.createElement('div');
    tDiv.className = 'chat-message-row thinking';
    tDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-bubble" style="color:#999; font-size:12px;">
            <i class="fas fa-circle-notch fa-spin"></i> ${currentLang === 'en' ? 'Analyzing intent...' : '正在分析意图...'}
        </div>
    `;
    chatMsgs.appendChild(tDiv);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
    
    // 调用DeepSeek API（仪表盘使用science模型）
    callDeepSeekAPI(text, 'deepseek-chat').then(result => {
        tDiv.remove(); // 移除思考中的提示
        
        if (result.success) {
            // 创建助手回复
            const aDiv = document.createElement('div');
            aDiv.className = 'chat-message-row';
            const formattedResponse = result.message.replace(/\n/g, '<br>');
            aDiv.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-bubble">${formattedResponse}</div>
            `;
            chatMsgs.appendChild(aDiv);
        } else {
            // 显示错误消息
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message-row';
            errorDiv.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-bubble" style="color: #ef4444;">
                    <i class="fas fa-exclamation-circle"></i> 错误：${result.error || '未知错误'}
                </div>
            `;
            chatMsgs.appendChild(errorDiv);
        }
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    }).catch(error => {
        tDiv.remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-message-row';
        errorDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-bubble" style="color: #ef4444;">
                <i class="fas fa-exclamation-circle"></i> 错误：${error.message || '网络错误，请稍后重试'}
            </div>
        `;
        chatMsgs.appendChild(errorDiv);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
    });
}

function sendDashboardQuickPrompt(text) {
    const input = document.getElementById('dashboard-chat-input');
    input.value = text;
    sendDashboardChat();
}

function addAiMessage(html, personaKey) {
    const chatMsgs = document.getElementById('chat-messages');
    if (!chatMsgs) return;
    
    // Get agent avatar
    const agents = getChatAgents();
    const agent = agents.find(a => a.id === (personaKey || currentPersona));
    const avatarHTML = agent ? `<img src="${agent.avatar}" alt="${agent.name}">` : '';
    
    const div = document.createElement('div');
    div.className = 'chat-message-row';
    div.innerHTML = `
        <div class="message-avatar">${avatarHTML}</div>
        <div class="message-bubble">${html}</div>
    `;
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function buildChatResponse(text, personaKey = currentPersona) {
    const lower = text.toLowerCase();
    const div = document.createElement('div');
    div.className = 'chat-message-row';
    const personaHeader = `<div class="message-header" style="margin-bottom:8px; font-weight:600">${getPersonaCopy(personaKey, 'name') || 'Smart Agent'}</div>`;
    
    let content = '';
    if (lower.includes('bar') || lower.includes('sales') || lower.includes('销售')) {
        content = `
            ${personaHeader}
            <p>${currentLang==='en' ? `Sales Bar Chart for <b>"${text}"</b>:` : `为您生成 <b>"${text}"</b> 的销售柱状图：`}</p>
            <div class="chart-card">
                <div class="chart">
                    <div class="bar" style="height:80%"><span>Beijing ¥124k</span></div>
                    <div class="bar" style="height:70%"><span>Shanghai ¥113k</span></div>
                    <div class="bar" style="height:60%"><span>Shenzhen ¥98k</span></div>
                    <div class="bar" style="height:45%"><span>Hangzhou ¥72k</span></div>
                    <div class="bar" style="height:35%"><span>Guangzhou ¥56k</span></div>
                </div>
            </div>
            <div class="sql-preview">
                SELECT store, SUM(amount) FROM sales GROUP BY store LIMIT 5;
            </div>
        `;
    } else if (lower.includes('trend') || lower.includes('traffic') || lower.includes('趋势')) {
         content = `
            ${personaHeader}
             <p>${currentLang==='en' ? `Traffic Trend for <b>"${text}"</b>:` : `<b>"${text}"</b> 的客流趋势如下：`}</p>
             <div class="chart-card">
                 <div class="line-chart">
                    <canvas id="mock-line-chart" width="400" height="150"></canvas>
                 </div>
             </div>
        `;
        setTimeout(renderMockLineChart, 50);
    } else if (lower.includes('why') || lower.includes('attribution') || lower.includes('原因') || lower.includes('为什么')) {
        const attributionCard = typeof generateAttributionCard === 'function' ? generateAttributionCard() : '';
        const insightCard = typeof generateInsightCard === 'function' ? generateInsightCard() : '';
        content = `
             ${personaHeader}
             ${attributionCard}
             ${insightCard}
        `;
    } else if (lower.includes('insight') || lower.includes('洞察')) {
        const insightCard = typeof generateInsightCard === 'function' ? generateInsightCard() : '';
        content = `
             ${personaHeader}
             ${insightCard}
        `;
    } else {
        content = `
             ${personaHeader}
             <p>${currentLang==='en' ? `Received: <b>"${text}"</b>` : `收到问题：<b>"${text}"</b>`}</p>
             <p>${currentLang==='en' ? 'Top 3 Stores by Sales:' : '销售额排名前三的门店：'}</p>
             <ol style="padding-left:20px;">
                <li>${currentLang==='en'?'Beijing Joy City':'北京朝阳大悦城'} (¥124k)</li>
                <li>${currentLang==='en'?'Shanghai Sanlitun':'上海三里屯'} (¥112k)</li>
                <li>${currentLang==='en'?'Shenzhen Lujiazui':'深圳陆家嘴'} (¥98k)</li>
             </ol>
        `;
    }

    div.innerHTML = `
        <div class="message-avatar">${getPersonaAvatarHTML(personaKey)}</div>
        <div class="message-bubble">${content}</div>
    `;
    return div;
}

function renderMockLineChart() {
    const canvas = document.getElementById('mock-line-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const points = [120, 140, 110, 150, 170, 160, 190];
    const step = canvas.width / (points.length - 1);
    points.forEach((val, idx) => {
        const x = idx * step;
        const y = canvas.height - (val - 90);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.stroke();
}

function sendQuickPrompt(text) {
    document.getElementById('chat-input').value = text;
    sendChat();
}

function switchChat(el) {
    document.querySelectorAll('.chat-list-item').forEach(item => item.classList.remove('active'));
    if (el.classList.contains('chat-list-item')) {
        el.classList.add('active');
    }
    
    // Show messages container and hide profile section
    const profileSection = document.getElementById('chat-profile-section');
    const messagesContainer = document.getElementById('chat-messages-container');
    if (profileSection) profileSection.classList.add('hidden');
    if (messagesContainer) messagesContainer.classList.remove('hidden');
    
    const msgs = document.getElementById('chat-messages');
    if (msgs) {
        msgs.innerHTML = '';
        const t = translations[currentLang];
        addAiMessage(`${currentLang==='en'?'Switched to: ':'已切换至：'}${el.children[0].textContent}`, currentPersona);
    }
}

function startNewChat() {
    document.querySelectorAll('.chat-list-item').forEach(item => item.classList.remove('active'));
    // 清除API对话历史
    if (typeof clearConversationHistory === 'function') {
        // 获取当前对话ID
        let conversationId = null;
        if (isEmployeeKey(currentPersona)) {
            const employee = getEmployeeByKey(currentPersona);
            if (employee) {
                conversationId = `employee-${employee.id}`;
            }
        } else {
            conversationId = `persona-${currentPersona}`;
        }
        clearConversationHistory(conversationId).then(() => {
            if (typeof generateConversationId === 'function') {
                generateConversationId();
            }
        });
    } else if (typeof clearConversation === 'function') {
        clearConversation();
    }
    renderPersonaStage(currentPersona, true);
}

function handleMockAction(name) {
    showToast(`${currentLang==='en'?'Feature':'功能'} [${name}] ${currentLang==='en'?'coming soon!':'即将上线'}`, 'info');
}

function refreshDbList(btn) {
    const icon = btn.querySelector('i');
    icon.classList.add('fa-spin');
    setTimeout(() => {
        icon.classList.remove('fa-spin');
        showToast(currentLang==='en'?"Database list refreshed.":"数据库列表已刷新");
    }, 800);
}

function showToast(message, type='success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'check-circle';
    let color = '#10B981';
    if (type === 'loading') { icon = 'spinner fa-spin'; color = '#3B82F6'; }
    if (type === 'info') { icon = 'info-circle'; color = '#3B82F6'; }
    
    toast.innerHTML = `<i class="fas fa-${icon}" style="color:${color}; font-size:20px;"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function triggerDictionaryUpload() {
    document.getElementById('dictionary-file-input').click();
}

function handleDictionaryFileChange(input) {
    const file = input.files[0];
    dictionaryFileName = file ? file.name : null;
    document.getElementById('dictionary-file-label').textContent = file ? file.name : translations[currentLang].no_file;
    if (file) showToast(`${currentLang==='en'?'Uploaded':'已上传'}: ${file.name}`);
}

/* ===========================================================
   2.0 Feature: Agent Creator Wizard
   =========================================================== */

let agentCreatorState = {
    step: 1,
    method: 'mindmap',
    domains: new Set(['门店经营']),
    skills: new Set(['SQL 查询']),
    parsedNodes: []
};

function openAgentCreator() {
    agentCreatorState = {
        step: 1,
        method: 'mindmap',
        domains: new Set(['门店经营']),
        skills: new Set(['SQL 查询']),
        parsedNodes: []
    };
    const drawer = document.getElementById('agent-creator-drawer');
    if (!drawer) return;
    drawer.classList.add('active');
    setTimeout(() => {
        drawer.querySelector('.drawer-panel').style.transform = 'translateX(0)';
    }, 10);
    updateAgentCreatorView();
}

function closeAgentCreator() {
    const drawer = document.getElementById('agent-creator-drawer');
    if (!drawer) return;
    drawer.querySelector('.drawer-panel').style.transform = 'translateX(100%)';
    setTimeout(() => drawer.classList.remove('active'), 300);
}

function updateAgentCreatorView() {
    const { step, method } = agentCreatorState;
    document.querySelectorAll('.creator-step').forEach((el, idx) => {
        el.classList.remove('active', 'completed');
        if (idx + 1 < step) el.classList.add('completed');
        if (idx + 1 === step) el.classList.add('active');
    });
    document.querySelectorAll('.agent-stage').forEach((stage, idx) => {
        stage.classList.toggle('hidden', idx + 1 !== step);
    });

    document.getElementById('agent-prev-btn')?.classList.toggle('hidden', step === 1);
    const nextBtn = document.getElementById('agent-next-btn');
    if (nextBtn) nextBtn.textContent = step === 4 ? '完成并发布' : '下一步';

    document.querySelectorAll('.creator-method-card').forEach(card => {
        card.classList.toggle('active', card.id === `creator-card-${method}`);
    });
    document.getElementById('mindmap-upload-panel')?.classList.toggle('hidden', method !== 'mindmap');
    document.getElementById('chat-blueprint-panel')?.classList.toggle('hidden', method !== 'chat');
    document.getElementById('template-panel')?.classList.toggle('hidden', method !== 'template');

    renderAgentParsedNodes();
    renderAgentSkills();
    renderAgentDomains();
}

function nextAgentStep() {
    if (agentCreatorState.step === 1 && !agentCreatorState.parsedNodes.length) {
        simulateAgentParsing();
    }

    if (agentCreatorState.step < 4) {
        agentCreatorState.step += 1;
        updateAgentCreatorView();
    } else {
        showToast('数字员工创建成功，已进入测试阶段');
        closeAgentCreator();
    }
}

function prevAgentStep() {
    if (agentCreatorState.step > 1) {
        agentCreatorState.step -= 1;
        updateAgentCreatorView();
    }
}

function selectAgentCreationMethod(method) {
    agentCreatorState.method = method;
    updateAgentCreatorView();
}

function handleMindmapUpload(event) {
    const file = event.target.files[0];
    document.getElementById('mindmap-file-label').textContent = file ? file.name : '未选择文件';
    if (file) {
        showToast(`已上传：${file.name}`, 'info');
        simulateAgentParsing();
    }
}

function applyAgentTemplate(key) {
    const mapping = {
        store_inspector: '门店巡检：对比 GMV/客流 → 触发巡检报告 → 输出建议。',
        marketing_insight: '营销洞察：活动复盘 → 渠道 GMV → ROI → 建议动作。',
        supply_chain: '供应链监控：库存周转 → 缺货预警 → 采购建议。'
    };
    document.getElementById('chat-blueprint-input').value = mapping[key] || '';
    agentCreatorState.method = 'template';
    updateAgentCreatorView();
    simulateAgentParsing();
}

function simulateAgentParsing(showToastMsg) {
    agentCreatorState.parsedNodes = [
        { tag: '指标', text: '近7天 GMV / 客流 / 转化率' },
        { tag: '流程', text: '连续下滑 2 周 → 触发巡检 → 输出 PPT 报告' },
        { tag: '维度', text: '区域 / 门店类型 / 渠道' },
        { tag: '洞察', text: '定位客流下滑与库存缺口的关系' }
    ];
    if (showToastMsg) showToast('已重新解析最新内容');
    renderAgentParsedNodes();
    agentCreatorState.step = Math.max(agentCreatorState.step, 2);
    updateAgentCreatorView();
}

function renderAgentParsedNodes() {
    const container = document.getElementById('agent-parse-results');
    if (!container) return;
    if (!agentCreatorState.parsedNodes.length) {
        container.innerHTML = '<p style="color:#94a3b8;font-size:13px;">请上传思维导图或描述业务逻辑，AI 将自动解析。</p>';
        return;
    }
    container.innerHTML = agentCreatorState.parsedNodes.map(node => `
        <div class="parse-card">
            <div class="parse-tag"><i class="fas fa-tag"></i>${node.tag}</div>
            <p>${node.text}</p>
        </div>
    `).join('');
}

function openBlueprintEditor() {
    showToast('解析结果编辑功能即将上线', 'info');
}

function renderAgentDomains() {
    const domains = ['门店经营', '营销活动', '供应链'];
    const container = document.getElementById('agent-domain-tags');
    if (!container) return;
    container.innerHTML = domains.map(name => `
        <button type="button" class="domain-chip ${agentCreatorState.domains.has(name) ? 'active' : ''}"
            onclick="toggleDomain(this, '${name}')">${name}</button>
    `).join('');
}

function toggleDomain(btn, domain) {
    if (agentCreatorState.domains.has(domain)) agentCreatorState.domains.delete(domain);
    else agentCreatorState.domains.add(domain);
    renderAgentDomains();
}

function renderAgentSkills() {
    document.querySelectorAll('.skill-card').forEach(card => {
        const skill = card.getAttribute('data-skill');
        card.classList.toggle('active', agentCreatorState.skills.has(skill));
    });
}

function toggleAgentSkill(card, label) {
    const skill = card.getAttribute('data-skill');
    if (agentCreatorState.skills.has(skill)) agentCreatorState.skills.delete(skill);
    else agentCreatorState.skills.add(skill);
    renderAgentSkills();
}

function runAgentTest() {
    const input = document.getElementById('agent-test-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        showToast('请输入测试问题', 'info');
        return;
    }
    showToast(`测试运行：“${text}”`, 'info');
    input.value = '';
}


function searchTables() {
    showToast(translations[currentLang].searching, 'loading');
}

function previewTable(name) {
    const modal = document.getElementById('data-preview-modal');
    document.getElementById('preview-table-name').textContent = name;
    
    const tbody = document.getElementById('preview-table-body');
    const thead = document.getElementById('preview-table-head');
    
    thead.innerHTML = '<tr><th>ID</th><th>Name</th><th>Value</th><th>Date</th></tr>';
    tbody.innerHTML = `
        <tr><td>1</td><td>Item A</td><td>100</td><td>2023-01-01</td></tr>
        <tr><td>2</td><td>Item B</td><td>200</td><td>2023-01-02</td></tr>
        <tr><td>3</td><td>Item C</td><td>300</td><td>2023-01-03</td></tr>
    `;
    
    modal.classList.add('active');
}

function togglePreviewModal(show) {
    const modal = document.getElementById('data-preview-modal');
    if(show) modal.classList.add('active');
    else modal.classList.remove('active');
}

function startDataAgentReport() {
    const btn = document.getElementById('btn-data-agent');
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${translations[currentLang].generating}`;
    showToast(currentLang==='en'?'DataAgent analyzing...':'DataAgent 正在分析...', 'loading');
    
    setTimeout(() => {
        btn.innerHTML = `<i class="fas fa-chart-pie"></i> ${translations[currentLang].data_agent_report}`;
        const report = currentLang === 'en' ? {
             title: 'Weekly Store Performance',
             date: new Date().toLocaleString(),
             summary: 'Shanghai store traffic is up 15%. High value customers contribute 38% of sales.',
             metrics: [
                 { title: 'Total Sales', value: '$3.42M', trend: '+12%' },
                 { title: 'Avg Ticket', value: '$428', trend: '+4%' },
                 { title: 'Footfall', value: '58,320', trend: '+8%' },
                 { title: 'Conversion', value: '21.4%', trend: '+1.2%' }
             ]
        } : {
             title: '周度门店经营分析',
             date: new Date().toLocaleString('zh-CN'),
             summary: '上海门店客流增长 15%。高价值客户贡献了 38% 的销售额，建议继续加大 VIP 运营投入。',
             metrics: [
                 { title: '总销售额', value: '¥342万', trend: '+12%' },
                 { title: '平均客单价', value: '¥428', trend: '+4%' },
                 { title: '客流量', value: '58,320', trend: '+8%' },
                 { title: '转化率', value: '21.4%', trend: '+1.2%' }
             ]
        };
        renderDataAgentReport(report);
        toggleDataAgentModal(true);
        showToast(currentLang==='en'?'Report Generated!':'报告已生成！');
    }, 1500);
}

function renderDataAgentReport(report) {
    const body = document.getElementById('agent-report-body');
    document.getElementById('agent-report-date').textContent = report.date;
    body.innerHTML = `
        <div style="margin-bottom:24px; padding:16px; background:#F9FAFB; border-radius:8px; line-height:1.6">
            <strong>${currentLang==='en'?'Executive Summary':'摘要'}:</strong><br>${report.summary}
        </div>
        <div class="agent-report-grid">
            ${report.metrics.map(m => `
                <div class="metric-box">
                    <div class="metric-label">${m.title}</div>
                    <div class="metric-val">${m.value}</div>
                    <div style="color:#10B981; font-size:13px;">${m.trend}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function toggleDataAgentModal(show) {
    const modal = document.getElementById('data-agent-modal');
    if(show) modal.classList.add('active');
    else modal.classList.remove('active');
}

// ==========================================
// Onboarding Flow Logic
// ==========================================

let llmEnabled = true; // 默认启用大模型


function testLLMConnection() {
    const btn = document.getElementById('btn-test-conn');
    const statusDiv = document.getElementById('conn-status');
    const nextBtn = document.getElementById('btn-config-next');
    const modelSelect = document.getElementById('llm-model-select');
    
    // UI Loading State
    btn.disabled = true;
    statusDiv.className = 'conn-status'; // reset
    statusDiv.classList.remove('hidden');
    statusDiv.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${translations[currentLang].connecting}`;
    
    // Simulate API Call
    setTimeout(() => {
        // Mock success for demo (unless API Key is empty)
        const apiKey = document.getElementById('llm-api-key').value;
        
        if (apiKey.length > 0) {
            statusDiv.className = 'conn-status success';
            statusDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${translations[currentLang].conn_success}`;
            nextBtn.disabled = false;
            nextBtn.classList.remove('disabled');
            btn.disabled = false;
            openLlmTestModal(modelSelect?.value || 'LLM');
        } else {
            statusDiv.className = 'conn-status error';
            statusDiv.innerHTML = `<i class="fas fa-times-circle"></i> ${translations[currentLang].conn_fail}`;
            btn.disabled = false;
        }
    }, 1500);
}

function prepareLiberalConfigStep() {
    const nextBtn = document.getElementById('btn-config-next');
    const statusDiv = document.getElementById('conn-status');
    const testBtn = document.getElementById('btn-test-conn');
    const apiInput = document.getElementById('llm-api-key');
    
    if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled');
    }
    if (statusDiv) {
        statusDiv.className = 'conn-status hidden';
        statusDiv.innerHTML = '';
    }
    if (testBtn) testBtn.disabled = false;
    if (apiInput) apiInput.value = '';
}

function toggleLLMEnable() {
    const switchEl = document.getElementById('llm-enable-switch');
    const warningBox = document.getElementById('llm-warning-box');
    if (!switchEl) return;
    
    llmEnabled = switchEl.checked;
    
    // 显示/隐藏警告提示
    if (warningBox) {
        if (llmEnabled) {
            warningBox.style.display = 'none';
        } else {
            warningBox.style.display = 'flex';
        }
    }
}

function openLlmTestModal(modelName) {
    const modal = document.getElementById('llm-test-modal');
    const title = document.getElementById('llm-test-title');
    const desc = document.getElementById('llm-test-desc');
    const input = document.getElementById('llm-test-input');
    const conversation = document.getElementById('llm-test-conversation');
    
    if (title) title.textContent = `${translations[currentLang].test_modal_title} · ${modelName}`;
    if (desc) desc.textContent = translations[currentLang].test_modal_desc;
    if (input) {
        input.placeholder = translations[currentLang].test_modal_placeholder;
        input.value = '';
    }
    if (conversation) {
        conversation.innerHTML = '';
        const intro = currentLang === 'en'
            ? `Hi! ${modelName} is ready. Ask anything to verify latency and semantics.`
            : `Hi! ${modelName} 已准备就绪，可以输入任意问题进行测试。`;
        appendLlmTestMessage('agent', translations[currentLang].test_modal_agent, intro);
    }
    
    if (modal) modal.classList.add('active');
}

function toggleLlmTestModal(show) {
    const modal = document.getElementById('llm-test-modal');
    if (!modal) return;
    if (show) modal.classList.add('active');
    else modal.classList.remove('active');
}

function appendLlmTestMessage(role, label, text) {
    const conversation = document.getElementById('llm-test-conversation');
    if (!conversation) return;
    const wrapper = document.createElement('div');
    wrapper.className = `llm-test-message ${role === 'user' ? 'user' : ''}`;
    wrapper.innerHTML = `
        <div class="avatar">${role === 'user' ? translations[currentLang].test_modal_user : 'AI'}</div>
        <div class="bubble">
            <div style="font-weight:600; margin-bottom:4px; font-size:13px;">${label}</div>
            <div>${text}</div>
        </div>
    `;
    conversation.appendChild(wrapper);
    conversation.scrollTop = conversation.scrollHeight;
}

function sendLlmTestMessage() {
    const input = document.getElementById('llm-test-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    appendLlmTestMessage('user', translations[currentLang].test_modal_user, text);
    input.value = '';
    
    setTimeout(() => {
        const response = currentLang === 'en'
            ? `LLM has understood "${text}". It would now draft SQL / insights accordingly.`
            : `LLM 已理解 “${text}”，正在模拟生成 SQL / 洞察。`;
        appendLlmTestMessage('agent', translations[currentLang].test_modal_agent, response);
    }, 800);
}

function handleLlmTestEnter(e) {
    if (e.key === 'Enter') {
        sendLlmTestMessage();
    }
}

function initOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    void overlay.offsetWidth;
    overlay.classList.add('active');

    setTimeout(() => {
        const robot = document.getElementById('robot-wrapper');
        if (robot) robot.classList.add('awake');

        const container = document.getElementById('onboarding-container');
        if (container) container.classList.add('active');
    }, 500);

    setOnboardingStep(1);
    
    // 初始化LLM开关状态
    initLLMToggle();
}

function initLLMToggle() {
    const switchEl = document.getElementById('llm-enable-switch');
    if (switchEl) {
        switchEl.checked = llmEnabled;
        toggleLLMEnable(); // 同步显示警告框
    }
}

function onboardingNext(stepInfo) {
    // stepInfo can be the step number
    
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    
    // Determine next ID
    let nextId = 'step-welcome';
    if (stepInfo === 2) nextId = 'step-mode';
    if (stepInfo === 3) nextId = 'step-config';
    if (stepInfo === 4) nextId = 'step-finish';
    
    // Show next step
    const target = document.getElementById(nextId);
    if (target) {
        target.classList.add('active');
        
        // 如果进入配置步骤，初始化LLM开关
        if (stepInfo === 2) {
            setTimeout(() => initLLMToggle(), 100);
        }
        
        // If entering finish step, trigger success animation or toast
        if (stepInfo === 4) {
            // Optional: confetti or sound
        }
    }

    setOnboardingStep(stepInfo);
}

function handleModeConfirm() {
    if (llmEnabled) {
        prepareLiberalConfigStep();
        onboardingNext(3);
    } else {
        // 如果不启用大模型，直接跳到完成步骤
        onboardingNext(4);
    }
}

function setOnboardingStep(step) {
    currentOnboardingStep = step;
    document.querySelectorAll('.progress-pill').forEach(pill => {
        const pillStep = Number(pill.dataset.step);
        if (pillStep <= step) pill.classList.add('active');
        else pill.classList.remove('active');
    });
}

function closeOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    // Fade out
    overlay.style.opacity = '0';
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        
        // Show a welcome toast
        showToast(translations[currentLang].hello_ai, 'info');
        
        // Optional: Highlight "Select Data Source" to guide user
        // document.getElementById('view-source').classList.add('highlight-guide'); 
    }, 500);
}

// ==========================================
// AI Employee Management
// ==========================================

const avatarOptions = [
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=120&h=120&q=60',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=120&h=120&q=60',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&w=120&h=120&q=60',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&w=120&h=120&q=60',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&w=120&h=120&q=60',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&w=120&h=120&q=60'
];

let employees = [
    { 
        id: 1,
        username: 'avery',
        nickname: 'Avery',
        avatar: avatarOptions[0],
        position: '表单助理',
        model: 'deepseek-chat',
        enabled: true,
        welcome: '你好，我是表单助理 Avery，可以帮你快速整理报表与指标。',
        quickPrompts: ['本周营收结构', '输出门店表单给我', '生成销售日报'],
        knowledgeIds: ['kb-retail-playbook'],
        temperature: 0.7,
        skills: { sql: true, chart: true, report: false },
        allowedSchemas: ['sales_mart', 'inventory_dim']
    },
    { 
        id: 2,
        username: 'nathan',
        nickname: 'Nathan',
        avatar: avatarOptions[1],
        position: '前端工程师',
        model: 'deepseek-chat',
        enabled: false,
        welcome: 'Hi，我是 Nathan，可以陪你梳理前端需求和页面结构。',
        quickPrompts: ['生成一个折线图组件', '解释这个接口如何调用'],
        knowledgeIds: [],
        temperature: 0.5,
        skills: { sql: true, chart: false, report: false },
        allowedSchemas: []
    },
    { 
        id: 3,
        username: 'viz',
        nickname: 'Viz',
        avatar: avatarOptions[2],
        position: '洞察分析师',
        model: 'deepseek-chat',
        enabled: true,
        welcome: '我是 Viz，让我来帮你挖掘数据背后的故事吧。',
        quickPrompts: ['近 7 天 GMV Top 5', '解释南区客流下滑', '给我一份复盘提纲'],
        knowledgeIds: ['kb-retail-playbook','kb-sales-faq'],
        temperature: 0.8,
        skills: { sql: true, chart: true, report: true },
        allowedSchemas: ['sales_mart', 'user_behavior']
    }
];

const MAX_EMPLOYEES = 5;

const workflowTemplates = [
    {
        id: 'gmv_playbook',
        name: 'GMV 增长剧本',
        desc: '用户输入 → LLM 洞察 → 知识库校验 → 报告输出',
        nodes: [
            { type: 'start', x: 80, y: 60 },
            { type: 'llm', x: 360, y: 40 },
            { type: 'knowledge', x: 360, y: 200 },
            { type: 'code', x: 640, y: 120 },
            { type: 'end', x: 900, y: 120 }
        ]
    },
    {
        id: 'qa_guardrail',
        name: '问答拦截流程',
        desc: '关键词检测 + 审核机制，保证输出安全',
        nodes: [
            { type: 'start', x: 80, y: 120 },
            { type: 'code', x: 320, y: 80 },
            { type: 'llm', x: 560, y: 40 },
            { type: 'knowledge', x: 560, y: 200 },
            { type: 'end', x: 820, y: 120 }
        ]
    },
    {
        id: 'weekly_report',
        name: '周报自动汇总',
        desc: '定时触发 → SQL 拿数 → LLM 总结 → 邮件下发',
        nodes: [
            { type: 'start', x: 80, y: 40 },
            { type: 'code', x: 320, y: 40 },
            { type: 'llm', x: 560, y: 40 },
            { type: 'knowledge', x: 560, y: 200 },
            { type: 'end', x: 820, y: 40 }
        ]
    }
];

let editingEmployeeId = null;
let selectedAvatar = avatarOptions[0];
let agentPaletteOpen = false;
const EMP_PREFIX = 'emp-';

// ==========================================
// Knowledge Library (RAG) Mock Data
// ==========================================

const defaultKnowledgeLibrary = [
    {
        id: 'kb-retail-playbook',
        name: '零售运营 Playbook',
        summary: '包含 GMV 增长策略、活动 SOP 与门店巡检 checklist',
        owner: '零售运营组',
        fileCount: 6,
        size: '8.4MB',
        tags: ['GMV', '运营策略'],
        status: 'ready',
        updatedAt: Date.now() - 1000 * 60 * 60 * 3,
        files: [
            { name: 'GMV_增长策略.pdf', size: '1.8MB', type: 'PDF' },
            { name: '活动SOP.docx', size: '950KB', type: 'Word' },
            { name: '门店巡检清单.xlsx', size: '640KB', type: 'Excel' }
        ]
    },
    {
        id: 'kb-sales-faq',
        name: '销售 FAQ 知识库',
        summary: '汇总一线销售常见问题与标准回答，含最新折扣政策',
        owner: '销售赋能',
        fileCount: 12,
        size: '4.9MB',
        tags: ['FAQ', '客服'],
        status: 'ready',
        updatedAt: Date.now() - 1000 * 60 * 60 * 24,
        files: [
            { name: '销售FAQ_v3.pdf', size: '2.1MB', type: 'PDF' },
            { name: '折扣政策_2024.docx', size: '720KB', type: 'Word' }
        ]
    },
    {
        id: 'kb-finance',
        name: '财务报表规范',
        summary: '对接财务部的指标口径、字段说明及审计要求',
        owner: '财务共享中心',
        fileCount: 3,
        size: '2.1MB',
        tags: ['财务', '口径'],
        status: 'syncing',
        updatedAt: Date.now() - 1000 * 60 * 15,
        files: [
            { name: '指标口径说明.pdf', size: '1.1MB', type: 'PDF' }
        ]
    }
];

let knowledgeLibrary = [...defaultKnowledgeLibrary];
let knowledgeActivities = [
    {
        id: 'act-1',
        action: '系统初始化',
        detail: '已导入零售运营 Playbook',
        target: '零售运营 Playbook',
        timestamp: Date.now() - 1000 * 60 * 60 * 6
    },
    {
        id: 'act-2',
        action: '同步知识库',
        detail: '销售 FAQ 知识库已完成同步',
        target: '销售 FAQ 知识库',
        timestamp: Date.now() - 1000 * 60 * 25
    }
];
let editingKnowledgeSet = new Set();
let knowledgeSearchKeyword = '';
let currentPreviewKnowledgeId = null;

function makeEmployeeKey(id) {
    return `${EMP_PREFIX}${id}`;
}

function isEmployeeKey(key) {
    return typeof key === 'string' && key.startsWith(EMP_PREFIX);
}

function getEmployeeByKey(key) {
    if (!isEmployeeKey(key)) return null;
    const id = Number(key.slice(EMP_PREFIX.length));
    return employees.find(e => e.id === id);
}

function parseQuickPrompts(raw) {
    return raw
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
}

function formatQuickPrompts(list) {
    if (!Array.isArray(list) || !list.length) return '';
    return list.join('\n');
}

function getKnowledgeById(id) {
    return knowledgeLibrary.find(kb => kb.id === id);
}

function renderKnowledgePanels() {
    renderLinkedKnowledgeList();
    renderKnowledgeLibraryList(knowledgeSearchKeyword);
    renderKnowledgeActivityList();
}

function renderLinkedKnowledgeList() {
    const container = document.getElementById('linked-knowledge-list');
    const countEl = document.getElementById('knowledge-linked-count');
    if (!container) return;

    if (!editingKnowledgeSet.size) {
        container.innerHTML = `
            <div class="knowledge-empty">
                暂无关联知识库，可从右侧仓库选择或上传文档。
            </div>`;
    } else {
        container.innerHTML = Array.from(editingKnowledgeSet).map(id => {
            const kb = getKnowledgeById(id);
            if (!kb) return '';
            return `
        <div class="knowledge-card">
                    <div class="knowledge-card-info">
                        <h4>${kb.name}</h4>
                        <p>${kb.summary || '未填写简介'}</p>
                        <div class="knowledge-meta">
                            <span><i class="fas fa-file"></i> ${kb.fileCount} 文件</span>
                            <span>${kb.size}</span>
                            <span>${formatKnowledgeTime(kb.updatedAt)}</span>
                        </div>
                        <div class="knowledge-tags">
                            ${(kb.tags || []).map(tag => `<span class="knowledge-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="knowledge-card-actions">
                        <span class="knowledge-status ${kb.status}">${formatKnowledgeStatus(kb.status)}</span>
                <button type="button" class="p-button p-button-outlined" onclick="previewKnowledge('${kb.id}')"><i class="fas fa-eye"></i> 预览</button>
                <button type="button" class="p-button p-button-text" onclick="unlinkKnowledge('${kb.id}')"><i class="fas fa-unlink"></i> 取消关联</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (countEl) {
        countEl.textContent = `${editingKnowledgeSet.size} 个知识源`;
    }
}

function renderKnowledgeLibraryList(keyword = '') {
    const container = document.getElementById('knowledge-library-list');
    const searchInput = document.querySelector('.knowledge-search input');
    if (!container) return;

    knowledgeSearchKeyword = keyword?.toLowerCase?.() || '';
    if (searchInput && searchInput.value !== keyword) {
        searchInput.value = keyword;
    }

    const filtered = knowledgeLibrary.filter(kb => {
        if (!knowledgeSearchKeyword) return true;
        return (
            kb.name.toLowerCase().includes(knowledgeSearchKeyword) ||
            (kb.summary || '').toLowerCase().includes(knowledgeSearchKeyword)
        );
    });

    if (!filtered.length) {
        container.innerHTML = `<div class="knowledge-empty">没有匹配的知识库，试试其它关键词。</div>`;
        return;
    }

    container.innerHTML = filtered.map(kb => {
        const linked = editingKnowledgeSet.has(kb.id);
        const disabled = kb.status !== 'ready';
        return `
            <div class="library-card">
                <h4>${kb.name}</h4>
                <p>${kb.summary || '暂无描述'}</p>
                <div class="library-meta">
                    <span>${kb.fileCount} 文件</span>
                    <span>${kb.size}</span>
                    <span>${formatKnowledgeTime(kb.updatedAt)}</span>
                </div>
                <div class="knowledge-tags">
                    ${(kb.tags || []).map(tag => `<span class="knowledge-tag">${tag}</span>`).join('')}
                </div>
                <button type="button" class="p-button ${linked ? 'p-button-outlined' : ''}" ${disabled ? 'disabled' : ''} onclick="toggleKnowledgeSelection('${kb.id}')">
                    ${linked ? '<i class="fas fa-check"></i> 已关联' : '<i class="fas fa-link"></i> 关联'}
                </button>
            </div>
        `;
    }).join('');
}

function renderKnowledgeActivityList() {
    const container = document.getElementById('knowledge-activity-list');
    if (!container) return;
    if (!knowledgeActivities.length) {
        container.innerHTML = `<div class="knowledge-empty">暂无动态</div>`;
        return;
    }
    container.innerHTML = knowledgeActivities
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 6)
        .map(item => `
            <div class="knowledge-activity-item">
                <div>
                    <div style="font-weight:600;">${item.action}</div>
                    <div style="font-size:12px; color:#64748b;">${item.detail}</div>
                </div>
                <div style="font-size:12px; color:#94a3b8;">${formatKnowledgeTime(item.timestamp)}</div>
            </div>
        `).join('');
}

function triggerKnowledgeUpload() {
    const input = document.getElementById('knowledge-file-input');
    if (input) input.click();
}

function handleKnowledgeFileChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
        const id = `kb-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
        const kb = {
            id,
            name: file.name.replace(/\.[^.]+$/, ''),
            summary: '用户上传的业务资料',
            owner: '自定义上传',
            fileCount: 1,
            size: formatFileSize(file.size),
            tags: ['上传'],
            status: 'syncing',
            updatedAt: Date.now()
        };
        knowledgeLibrary.unshift(kb);
        logKnowledgeActivity('上传文档', `${file.name} 已上传，开始解析`, kb.name);
        setTimeout(() => {
            kb.status = 'ready';
            kb.updatedAt = Date.now();
            logKnowledgeActivity('解析完成', `${kb.name} 可用于 RAG`, kb.name);
            renderKnowledgeLibraryList(knowledgeSearchKeyword);
        }, 1500 + Math.random() * 1500);
    });
    event.target.value = '';
    renderKnowledgeLibraryList(knowledgeSearchKeyword);
}

function refreshKnowledgeLibrary() {
    showToast('刷新知识库中...', 'loading');
    setTimeout(() => {
        const id = `kb-auto-${Date.now()}`;
        knowledgeLibrary.unshift({
            id,
            name: '行业白皮书 ' + new Date().getDate(),
            summary: '系统自动同步的行业洞察白皮书，包含近季度趋势。',
            owner: '行业研究院',
            fileCount: 5,
            size: '6.1MB',
            tags: ['行业', '趋势'],
            status: 'ready',
            updatedAt: Date.now()
        });
        logKnowledgeActivity('同步知识库', '已同步最新行业白皮书', '行业白皮书');
        renderKnowledgeLibraryList(knowledgeSearchKeyword);
        showToast('知识库列表已更新');
    }, 1200);
}

function filterKnowledgeLibrary(keyword = '') {
    renderKnowledgeLibraryList(keyword);
}

function toggleKnowledgeSelection(id) {
    const kb = getKnowledgeById(id);
    if (!kb) return;
    if (kb.status !== 'ready') {
        showToast('知识库同步中，稍后再试', 'info');
        return;
    }
    if (editingKnowledgeSet.has(id)) {
        editingKnowledgeSet.delete(id);
        logKnowledgeActivity('取消关联', `已从员工移除 ${kb.name}`, kb.name);
    } else {
        editingKnowledgeSet.add(id);
        logKnowledgeActivity('关联知识库', `已关联 ${kb.name}`, kb.name);
    }
    renderKnowledgePanels();
}

function unlinkKnowledge(id) {
    if (editingKnowledgeSet.has(id)) {
        const kb = getKnowledgeById(id);
        editingKnowledgeSet.delete(id);
        logKnowledgeActivity('取消关联', `${kb?.name || '知识库'} 已移除`, kb?.name);
        renderKnowledgePanels();
    }
}

function previewKnowledge(id) {
    const kb = getKnowledgeById(id);
    if (!kb) return;
    currentPreviewKnowledgeId = id;
    const modal = document.getElementById('knowledge-preview-modal');
    const title = document.getElementById('knowledge-preview-title');
    const meta = document.getElementById('knowledge-preview-meta');
    const body = document.getElementById('knowledge-preview-body');
    if (!modal || !title || !meta || !body) return;

    title.textContent = kb.name;
    meta.textContent = `${kb.fileCount} 个文件 · ${kb.size} · ${formatKnowledgeTime(kb.updatedAt)}`;

    const files = kb.files && kb.files.length ? kb.files : [
        { name: `${kb.name} - 摘要.pdf`, size: kb.size, type: 'PDF' }
    ];

    body.innerHTML = `
        <div style="line-height:1.6; margin-bottom:16px;">
            <h4 style="margin:0 0 8px 0;">简介</h4>
            <p style="margin:0;">${kb.summary || '暂无介绍'}</p>
        </div>
        <div style="line-height:1.6;">
            <h4 style="margin:0 0 8px 0;">文件列表</h4>
            <div>
                ${files.map(file => `
                    <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #edf2f7;">
                        <div>
                            <div style="font-weight:600;">${file.name}</div>
                            <div style="font-size:12px; color:#94a3b8;">${file.type || '文件'} · ${file.size || '--'}</div>
                        </div>
                        <button type="button" class="p-button p-button-text" onclick="downloadKnowledgeFile('${file.name}')">
                            <i class="fas fa-download"></i> 下载
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function toggleKnowledgePreview(show) {
    const modal = document.getElementById('knowledge-preview-modal');
    if (!modal) return;
    if (show) {
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
        currentPreviewKnowledgeId = null;
    }
}

function downloadKnowledgeFiles() {
    if (!currentPreviewKnowledgeId) return;
    const kb = getKnowledgeById(currentPreviewKnowledgeId);
    showToast(`已开始下载「${kb?.name || '知识库'}」全部文件`, 'info');
}

function downloadKnowledgeFile(name) {
    showToast(`已下载 ${name}`, 'info');
}

function logKnowledgeActivity(action, detail, target) {
    knowledgeActivities.unshift({
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
        action,
        detail,
        target,
        timestamp: Date.now()
    });
    renderKnowledgeActivityList();
}

function formatKnowledgeTime(time) {
    const date = new Date(time);
    return date.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
}

function formatFileSize(bytes = 0) {
    if (!bytes) return '未知大小';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function formatKnowledgeStatus(status) {
    switch (status) {
        case 'ready':
            return '可用';
        case 'syncing':
            return '同步中';
        case 'warning':
            return '需关注';
        default:
            return status || '未知';
    }
}


function renderEmployeeList(keyword = '') {
    updateQuotaDisplay();
    
    const tbody = document.getElementById('employee-table-body');
    if (!tbody) return;

    const filtered = employees.filter(emp => {
        const term = keyword.trim().toLowerCase();
        if (!term) return true;
        return (
            emp.username.toLowerCase().includes(term) ||
            emp.nickname.toLowerCase().includes(term) ||
            (emp.position || '').toLowerCase().includes(term)
        );
    });

    tbody.innerHTML = filtered.map(emp => `
        <tr>
            <td>
                <div class="emp-profile-cell">
                    <div class="emp-avatar-wrapper">
                        <img src="${emp.avatar}" alt="${emp.nickname}">
                    </div>
                    <div class="emp-profile-info">
                        <span class="emp-name">${emp.nickname}</span>
                        <span class="emp-role">${emp.position || 'AI Assistant'}</span>
                    </div>
                </div>
            </td>
            <td><span style="font-family: monospace; color: var(--text-secondary); background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">@${emp.username}</span></td>
            <td><span class="p-tag p-tag-info" style="font-weight: 500;">${emp.model || 'DeepSeek'}</span></td>
            <td>
                <div class="form-check form-switch" style="transform: scale(0.8); transform-origin: left center;">
                    <label class="switch">
                        <input type="checkbox" ${emp.enabled ? 'checked' : ''} onchange="toggleEmployeeStatus(${emp.id})">
                        <span class="slider round"></span>
                    </label>
                </div>
            </td>
            <td style="text-align: right;">
                <button class="p-button p-button-text" onclick="openEmployeeBuilder(${emp.id})" style="color:var(--text-secondary); width: 32px; height: 32px; padding: 0;" title="编辑"><i class="fas fa-cog"></i></button>
                <button class="p-button p-button-text" onclick="deleteEmployee(${emp.id})" style="color:#f43f5e; width: 32px; height: 32px; padding: 0;" title="删除"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');

    renderChatHeader();
}

function updateQuotaDisplay() {
    const el = document.getElementById('quota-info-text');
    if (!el) return;
    
    const current = employees.length;
    const remaining = Math.max(0, MAX_EMPLOYEES - current);
    
    if (currentLang === 'en') {
        el.textContent = `Current: ${current} / ${MAX_EMPLOYEES}. Remaining: ${remaining}.`;
    } else {
        el.textContent = `当前已启用 ${current} 个员工，剩余配额 ${remaining} 个`;
    }
}

function filterEmployees(value) {
    renderEmployeeList(value);
}

function toggleEmployeeStatus(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    // Check Quota before Enabling
    if (!emp.enabled) {
        const currentEnabled = employees.filter(e => e.enabled).length;
        if (currentEnabled >= MAX_EMPLOYEES) {
            showToast(`配额已满 (${MAX_EMPLOYEES})，无法启用新员工`, 'warning');
            // Re-render to revert the toggle visually if it was clicked
            renderEmployeeList(); 
            return;
        }
    }

    emp.enabled = !emp.enabled;
    showToast(`${emp.nickname} ${emp.enabled ? '已启用' : '已停用'}`, 'info');
    renderChatHeader();
    updateQuotaDisplay(); // Ensure quota display updates
}

function deleteEmployee(id) {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    if (!confirm(`确定删除 ${emp.nickname} 吗？`)) return;
    employees = employees.filter(e => e.id !== id);
    renderEmployeeList();
    showToast('员工已删除', 'info');
}

// ==========================================
// Skill Library Logic
// ==========================================

const skillRegistry = [
    {
        id: 'feishu_bot',
        category: 'office',
        name: '飞书通知',
        desc: '将分析结果或异常告警推送到飞书群组。',
        icon: 'fab fa-weixin', // using weixin as placeholder for feishu
        color: '#3370ff'
    },
    {
        id: 'email_sender',
        category: 'office',
        name: '邮件发送',
        desc: '生成并通过 SMTP 发送 PDF/Excel 报表邮件。',
        icon: 'fas fa-envelope',
        color: '#ea4335'
    },
    {
        id: 'api_connector',
        category: 'dev',
        name: 'API 连接器',
        desc: '通用 HTTP 请求工具，用于获取外部业务数据。',
        icon: 'fas fa-plug',
        color: '#8b5cf6'
    },
    {
        id: 'scheduler',
        category: 'office',
        name: '定时任务',
        desc: '允许该员工按计划周期性执行分析任务。',
        icon: 'fas fa-clock',
        color: '#10b981'
    },
    {
        id: 'knowledge_graph',
        category: 'external',
        name: '企业图谱',
        desc: '连接企业知识图谱 (Neo4j)，查询实体关系。',
        icon: 'fas fa-project-diagram',
        color: '#f59e0b'
    },
    {
        id: 'image_gen',
        category: 'external',
        name: '图像生成',
        desc: '调用 DALL-E 或 Midjourney 生成配图。',
        icon: 'fas fa-image',
        color: '#ec4899'
    }
];

function openSkillLibrary() {
    const modal = document.getElementById('skill-library-modal');
    renderSkillLibrary('all');
    modal.classList.add('active');
}

function filterSkillCat(cat, el) {
    document.querySelectorAll('.skill-cat-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    renderSkillLibrary(cat);
}

function renderSkillLibrary(cat) {
    const grid = document.getElementById('skill-lib-grid');
    if (!grid) return;
    
    if (cat === 'workflow') {
        grid.innerHTML = workflowTemplates.map(tpl => `
            <div class="skill-lib-card workflow-template-card">
                <div class="skill-lib-icon" style="background: rgba(37,99,235,0.1); color: #1d4ed8;">
                    <i class="fas fa-diagram-project"></i>
                </div>
                <div class="skill-lib-content">
                    <div class="skill-lib-name">${tpl.name}</div>
                    <div class="skill-lib-desc">${tpl.desc}</div>
                </div>
                <button class="p-button" style="padding: 6px 16px; font-size: 13px; border-radius: 20px; height: 32px;"
                    onclick="useWorkflowTemplate('${tpl.id}', 'skill-center')">
                    <i class="fas fa-play-circle"></i> 使用模板
                </button>
            </div>
        `).join('');
        return;
    }
    
    const filtered = cat === 'all' ? skillRegistry : skillRegistry.filter(s => s.category === cat);
    
    // Get currently added skills to disable button
    const currentTools = getCurrentlyEditingTools();

    grid.innerHTML = filtered.map(skill => {
        const isAdded = currentTools.has(skill.id);
        return `
        <div class="skill-lib-card">
            <div class="skill-lib-icon" style="background: ${skill.color}15; color: ${skill.color};">
                <i class="${skill.icon}"></i>
            </div>
            <div class="skill-lib-content">
                <div class="skill-lib-name">${skill.name}</div>
                <div class="skill-lib-desc">${skill.desc}</div>
            </div>
            <button class="p-button ${isAdded ? 'p-button-outlined' : 'p-button-primary'}" 
                style="padding: 6px 16px; font-size: 13px; border-radius: 20px; height: 32px; white-space: nowrap;" 
                onclick="addToolSkill('${skill.id}')" 
                ${isAdded ? 'disabled' : ''}>
                ${isAdded ? '<i class="fas fa-check"></i> 已添加' : '<i class="fas fa-plus"></i> 添加'}
            </button>
        </div>
    `}).join('');
}

// Helper to get tools from current UI state
function getCurrentlyEditingTools() {
    const tools = new Set();
    document.querySelectorAll('.dynamic-skill-input').forEach(el => {
        if(el.checked) tools.add(el.dataset.toolId);
    });
    return tools;
}

function addToolSkill(skillId) {
    const skill = skillRegistry.find(s => s.id === skillId);
    if (!skill) return;
    
    const list = document.getElementById('emp-skill-list');
    
    // Check if exists
    if (document.querySelector(`.dynamic-skill-input[data-tool-id="${skillId}"]`)) return;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `skill-${skillId}`;
    input.className = 'skill-card-checkbox dynamic-skill-input';
    input.dataset.toolId = skillId;
    input.checked = true;

    const label = document.createElement('label');
    label.className = 'skill-card dynamic-skill-label';
    label.htmlFor = `skill-${skillId}`;
    label.innerHTML = `
        <div class="skill-card-header">
            <span class="skill-card-title">
                <i class="${skill.icon}" style="color: ${skill.color}; margin-right: 6px;"></i>
                ${skill.name}
            </span>
            <div class="skill-check-icon"><i class="fas fa-check"></i></div>
        </div>
        <div class="skill-card-desc">${skill.desc}</div>
        <div class="skill-card-remove" onclick="removeToolSkill('${skillId}', event)">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    // Inline styles for remove button
    const removeBtn = label.querySelector('.skill-card-remove');
    removeBtn.style.cssText = 'position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: #9ca3af; border-radius: 50%; transition: all 0.2s; z-index: 5;';
    removeBtn.onmouseover = function() { this.style.background = '#fee2e2'; this.style.color = '#ef4444'; };
    removeBtn.onmouseout = function() { this.style.background = 'transparent'; this.style.color = '#9ca3af'; };

    list.appendChild(input);
    list.appendChild(label);
    
    showToast(`已添加技能: ${skill.name}`);
    
    renderSkillLibrary(document.querySelector('.skill-cat-item.active')?.innerText === '全部技能' ? 'all' : 'office'); 
}

function removeToolSkill(skillId, event) {
    if(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const input = document.getElementById(`skill-${skillId}`);
    const label = document.querySelector(`label[for="skill-${skillId}"]`);
    
    if(input) input.remove();
    if(label) label.remove();
}

// Modified saveEmployee/openEmployeeBuilder to handle tools
// ... (Will update in next step)

// ==========================================
// Workflow Canvas & Connection Logic
// ==========================================

let draggedNodeType = null;
let nodeIdCounter = 1;
let canvasScale = 1;

// Connection State
let connections = []; // { id, from, to } (using node IDs)
let isConnecting = false;
let tempConnection = null;
let connectionSource = null; // { nodeId, type, element }

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    const type = ev.currentTarget?.dataset?.type || ev.target?.dataset?.type;
    if (!type) return;
    draggedNodeType = type;
    ev.dataTransfer.effectAllowed = 'copy';
    ev.dataTransfer.setData("text", type);
}

function drop(ev) {
    ev.preventDefault();
    const type = ev.dataTransfer.getData("text");
    if (!type) return;

    const canvas = document.getElementById('workflow-canvas');
    const rect = canvas.getBoundingClientRect();
    
    const x = ev.clientX - rect.left - 140; // Center offset
    const y = ev.clientY - rect.top - 40;

    createNode(type, x, y);
}

function createNode(type, x, y) {
    const canvas = document.getElementById('workflow-canvas');
    const id = `node-${nodeIdCounter++}`;
    
    const node = document.createElement('div');
    node.className = 'flow-node';
    node.id = id;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    
    // Dragging logic for node on canvas
    node.onmousedown = dragMouseDown;

    let icon = 'fas fa-cube';
    let color = '#64748b';
    let title = 'Node';
    let inputs = '';

    switch(type) {
        case 'start': 
            icon = 'fas fa-play'; color = '#3b82f6'; title = 'Start'; 
            inputs = `<div class="node-input-field">User Input (String)</div>`;
            break;
        case 'end': 
            icon = 'fas fa-stop'; color = '#ef4444'; title = 'End'; 
            inputs = `<div class="node-input-field">Final Output</div>`;
            break;
        case 'llm': 
            icon = 'fas fa-robot'; color = '#8b5cf6'; title = 'LLM'; 
            inputs = `
                <div class="node-input-field" contenteditable>System Prompt...</div>
                <div style="font-size:10px;margin-top:4px;color:#999">Model: GPT-4</div>
            `;
            break;
        case 'code':
            icon = 'fas fa-code'; color = '#10b981'; title = 'Code';
            inputs = `<div class="node-input-field" style="font-family:monospace;color:#d63384">return input + 1;</div>`;
            break;
        case 'knowledge':
            icon = 'fas fa-book'; color = '#f59e0b'; title = 'Knowledge';
            inputs = `<div class="node-input-field">Query: {{input}}</div>`;
            break;
    }

    node.innerHTML = `
        <div class="node-header">
            <div class="node-icon" style="background:${color}"><i class="${icon}"></i></div>
            <div class="node-title">${title}</div>
            <i class="fas fa-ellipsis-h" style="color:#ccc;cursor:pointer"></i>
        </div>
        <div class="node-body">
            ${inputs}
        </div>
        ${type !== 'start' ? `<div class="node-handle input" data-node="${id}" data-type="input"></div>` : ''}
        ${type !== 'end' ? `<div class="node-handle output" data-node="${id}" data-type="output"></div>` : ''}
    `;

    canvas.appendChild(node);

    // Attach listeners to handles
    const handles = node.querySelectorAll('.node-handle');
    handles.forEach(handle => {
        handle.onmousedown = handleConnectionStart;
    });
}

function dragMouseDown(e) {
    if (e.target.classList.contains('node-input-field')) return; // Allow text selection
    if (e.target.classList.contains('node-handle')) return; // Let handle listener take over

    e.preventDefault();
    let pos3 = e.clientX;
    let pos4 = e.clientY;
    const elmnt = e.currentTarget;

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;

    function elementDrag(e) {
        e.preventDefault();
        let pos1 = pos3 - e.clientX;
        let pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        
        // Update connections attached to this node
        updateConnections();
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Connection Logic
function handleConnectionStart(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const handle = e.target;
    const type = handle.dataset.type;
    const nodeId = handle.dataset.node;

    // Only start from output for now (simplification)
    if (type !== 'output') return;

    isConnecting = true;
    connectionSource = { nodeId, type, element: handle };

    // Create temp SVG line
    const svgLayer = document.getElementById('flow-connections-layer');
    tempConnection = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempConnection.setAttribute("stroke", "#3B82F6");
    tempConnection.setAttribute("stroke-width", "2");
    tempConnection.setAttribute("fill", "none");
    tempConnection.setAttribute("stroke-dasharray", "5,5");
    svgLayer.appendChild(tempConnection);

    document.addEventListener('mousemove', updateTempConnection);
    document.addEventListener('mouseup', endConnectionDrag);
}

function updateTempConnection(e) {
    if (!isConnecting || !connectionSource) return;
    
    const canvas = document.getElementById('workflow-canvas');
    const rect = canvas.getBoundingClientRect();
    
    // Source position
    const sourceRect = connectionSource.element.getBoundingClientRect();
    const x1 = sourceRect.left + sourceRect.width / 2 - rect.left;
    const y1 = sourceRect.top + sourceRect.height / 2 - rect.top;

    // Mouse position
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;

    // Draw Bezier
    const d = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;
    tempConnection.setAttribute("d", d);
}

function endConnectionDrag(e) {
    document.removeEventListener('mousemove', updateTempConnection);
    document.removeEventListener('mouseup', endConnectionDrag);

    if (tempConnection) {
        tempConnection.remove();
        tempConnection = null;
    }

    // Check if dropped on a valid target handle
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains('node-handle') && target.dataset.type === 'input') {
        const targetNodeId = target.dataset.node;
        
        // Prevent self-connection
        if (targetNodeId === connectionSource.nodeId) return;

        // Create permanent connection
        createConnection(connectionSource.nodeId, targetNodeId);
    }

    isConnecting = false;
    connectionSource = null;
}

function createConnection(fromId, toId) {
    // Avoid duplicates
    if (connections.some(c => c.from === fromId && c.to === toId)) return;

    connections.push({ id: 'conn-' + Date.now(), from: fromId, to: toId });
    renderConnections();
}

function renderConnections() {
    const svgLayer = document.getElementById('flow-connections-layer');
    // Clear existing lines (except temp if any, but temp is removed by now)
    svgLayer.innerHTML = '';

    connections.forEach(conn => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", "connection-line");
        path.setAttribute("id", conn.id);
        path.setAttribute("stroke", "#CBD5E1");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        
        // Calculate path
        const d = getPathData(conn.from, conn.to);
        if (d) {
            path.setAttribute("d", d);
            svgLayer.appendChild(path);
        }
    });
}

function updateConnections() {
    connections.forEach(conn => {
        const path = document.getElementById(conn.id);
        if (path) {
            const d = getPathData(conn.from, conn.to);
            if (d) path.setAttribute("d", d);
        }
    });
}

function getPathData(fromId, toId) {
    const fromNode = document.getElementById(fromId);
    const toNode = document.getElementById(toId);
    if (!fromNode || !toNode) return null;

    const canvas = document.getElementById('workflow-canvas');
    const rect = canvas.getBoundingClientRect();

    const outHandle = fromNode.querySelector('.node-handle.output');
    const inHandle = toNode.querySelector('.node-handle.input');
    if (!outHandle || !inHandle) return null;

    const outRect = outHandle.getBoundingClientRect();
    const inRect = inHandle.getBoundingClientRect();

    const x1 = outRect.left + outRect.width / 2 - rect.left;
    const y1 = outRect.top + outRect.height / 2 - rect.top;
    const x2 = inRect.left + inRect.width / 2 - rect.left;
    const y2 = inRect.top + inRect.height / 2 - rect.top;

    return `M ${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 80} ${y2}, ${x2} ${y2}`;
}


function runWorkflowTest() {
    showToast('工作流试运行启动...', 'info');
    setTimeout(() => {
        showToast('节点 [Start] 执行成功', 'success');
    }, 500);
    setTimeout(() => {
        showToast('节点 [LLM] 生成内容中...', 'loading');
    }, 1500);
    setTimeout(() => {
        showToast('工作流执行完毕，输出已生成', 'success');
    }, 3000);
}

function zoomCanvas(delta) {
    // Simplified zoom simulation
    showToast(`Canvas Zoom: ${(1 + delta).toFixed(1)}x`);
}

function createNewWorkflow() {
    openWorkflowEditor();
}

function openWorkflowEditor(templateNodes = null, templateName = '') {
    // 1. Close the current drawer
    closeDrawer('employee-builder-drawer');
    
    // 2. Switch to workflow view
    // Use switchView logic but specifically for workflow which might need special handling
    document.querySelectorAll('.page-body').forEach(el => el.classList.add('hidden'));
    const workflowView = document.getElementById('view-workflow-editor');
    workflowView.classList.remove('hidden');
    
    // 3. Initialize template / existing workflow
    let nodesToLoad = [];
    if (templateNodes && templateNodes.length) {
        nodesToLoad = templateNodes;
        if (templateName) {
            showToast(`已加载 "${templateName}" 模板`, 'info');
        }
    } else {
        const emp = employees.find(e => e.id === editingEmployeeId);
        if (emp) {
            showToast(`正在为 ${emp.nickname} 配置工作流`);
            nodesToLoad = emp.workflowNodes || [];
        } else {
            showToast('配置新工作流');
        }
    }

    loadWorkflowNodes(nodesToLoad);
}

function exitWorkflowEditor() {
    // Return to Employee List
    switchView('employees');
    
    // Re-open the builder for the employee we were editing
    if (editingEmployeeId !== null) {
        openEmployeeBuilder(editingEmployeeId);
        switchEmployeeTab('workflow');
    } else {
        // If it was a new employee, reopening builder might lose unsaved data unless we saved it temporarily.
        // For prototype simplicity, we just reopen builder.
        openEmployeeBuilder();
        switchEmployeeTab('workflow');
    }
}

function saveWorkflow() {
    showToast('工作流已保存', 'success');
    // In a real app, we would serialize the nodes and connections from the canvas
    // and save them to the employee object.
}

function loadWorkflowNodes(nodes) {
    const canvas = document.getElementById('workflow-canvas');
    // Clear dynamic nodes (keep toolbar and svg)
    const dynamicNodes = canvas.querySelectorAll('.flow-node');
    dynamicNodes.forEach(n => n.remove());
    
    if (!nodes || nodes.length === 0) {
        // Add default Start node if empty
        createNode('start', 50, 50);
    } else {
        nodes.forEach(n => createNode(n.type, n.x, n.y));
    }
}

function useWorkflowTemplate(templateId, source = 'workflow-tab') {
    const tpl = workflowTemplates.find(t => t.id === templateId);
    if (!tpl) {
        showToast('模板不存在', 'warning');
        return;
    }
    if (source === 'skill-center') {
        closeDrawer('skill-library-modal');
    }
    openWorkflowEditor(tpl.nodes, tpl.name);
}

// ==========================================
// Agent Templates
// ==========================================

const agentTemplates = [
    {
        id: 'retail_expert',
        name: '零售运营专家',
        desc: '专精于人货场分析，内置 GMV、连带率、售罄率等核心指标体系。',
        icon: 'fas fa-store',
        color: '#f59e0b',
        config: {
            nickname: 'RetailBot',
            position: '运营专家',
            model: 'deepseek-chat',
            temperature: 0.5,
            skills: { sql: true, chart: true, report: true },
            prompt: '你是一位拥有10年经验的零售运营总监。你熟悉人、货、场模型，能够深入分析GMV、客单价、连带率等指标。在回答时，请优先关注同比/环比变化，并给出具体的运营建议。',
            welcome: '我是零售运营专家。请问今天要复盘哪个大区的业绩？',
            quickPrompts: ['本周全渠道GMV复盘', 'Top 20 滞销商品清单', '华东区客流转化分析'],
            allowedSchemas: ['sales_mart']
        }
    },
    {
        id: 'finance_analyst',
        name: '财务审计助手',
        desc: '严格遵循会计准则，擅长报表核对、成本分析与异常监控。',
        icon: 'fas fa-calculator',
        color: '#10b981',
        config: {
            nickname: 'FinanceAI',
            position: '财务分析师',
            model: 'deepseek-reasoner',
            temperature: 0.2,
            skills: { sql: true, chart: true, report: true },
            prompt: '你是财务审计助手。你的回答必须严谨、准确，任何数据必须精确到小数点后两位。你关注成本、利润率、现金流等核心财务指标。',
            welcome: '财务数据已同步。请问需要核查哪张报表？',
            quickPrompts: ['生成上月利润表', '各部门费用支出对比', '异常报销记录筛查'],
            allowedSchemas: ['finance_core']
        }
    },
    {
        id: 'hr_partner',
        name: '招聘与人效助手',
        desc: '分析招聘漏斗、人效比与员工满意度，优化组织效能。',
        icon: 'fas fa-users',
        color: '#ec4899',
        config: {
            nickname: 'HR Helper',
            position: 'HRBP',
            model: 'deepseek-chat',
            temperature: 0.7,
            skills: { sql: true, chart: true, report: false },
            prompt: '你是人力资源业务伙伴。你关注人才招聘、员工保留率和人效分析。请用亲和的语气交流。',
            welcome: '你好，我是 HR 助手。关于招聘进度或人效分析，随时问我。',
            quickPrompts: ['各部门招聘达成率', '近半年离职率趋势', '人均产出分析'],
            allowedSchemas: ['hr_data']
        }
    },
    {
        id: 'sql_dev',
        name: 'SQL 开发辅助',
        desc: '辅助生成复杂 SQL 查询，优化慢查询，解释字段含义。',
        icon: 'fas fa-code',
        color: '#3b82f6',
        config: {
            nickname: 'DevMate',
            position: '数据工程师',
            model: 'deepseek-chat',
            temperature: 0.1,
            skills: { sql: true, chart: false, report: false },
            prompt: '你是专业的 SQL 开发工程师。你只输出标准、高效的 SQL 代码。',
            welcome: 'SQL 开发模式已就绪。请描述你的取数逻辑。',
            quickPrompts: ['查询近7天活跃用户SQL', '解释这个复杂的Join逻辑', '优化这条慢查询'],
            allowedSchemas: []
        }
    }
];

function openTemplateLibrary() {
    const modal = document.getElementById('template-library-modal');
    const grid = document.getElementById('template-grid');
    if (!grid) return;
    
    grid.innerHTML = agentTemplates.map(tpl => `
        <div class="template-card" onclick="useTemplate('${tpl.id}')" style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 48px; height: 48px; background: ${tpl.color}15; color: ${tpl.color}; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                    <i class="${tpl.icon}"></i>
                </div>
                <div>
                    <div style="font-weight: 600; font-size: 15px; color: #1f2937;">${tpl.name}</div>
                    <div style="font-size: 12px; color: #6b7280;">${tpl.config.nickname}</div>
                </div>
            </div>
            <div style="font-size: 13px; color: #4b5563; line-height: 1.5; flex: 1;">
                ${tpl.desc}
            </div>
            <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: #9ca3af;">${tpl.config.skills.report ? '含深度报告' : '标准能力'}</span>
                <button class="p-button p-button-text" style="padding: 4px 8px; font-size: 13px;">使用模板 <i class="fas fa-arrow-right"></i></button>
            </div>
        </div>
    `).join('');
    
    modal.classList.add('active');
}

function useTemplate(tplId) {
    const tpl = agentTemplates.find(t => t.id === tplId);
    if (!tpl) return;
    
    closeDrawer('template-library-modal');
    
    // Open Builder with Pre-filled Data
    openEmployeeBuilder(null, tpl.config);
}

// Modified openEmployeeBuilder to accept template config
function openEmployeeBuilder(empId = null, templateConfig = null) {
    // Check Quota for new employees
    if (!empId && employees.length >= MAX_EMPLOYEES) {
        showToast(currentLang === 'en' ? 'Max employee quota reached!' : '员工数量已达上限 (5人)，请先删除旧员工。', 'warning');
        return;
    }

    editingEmployeeId = empId;
    const drawer = document.getElementById('employee-builder-drawer');
    const title = document.getElementById('employee-builder-title');
    const username = document.getElementById('emp-username');
    const nickname = document.getElementById('emp-nickname');
    const position = document.getElementById('emp-position');
    const desc = document.getElementById('emp-desc');
    const enabled = document.getElementById('emp-enabled');
    const model = document.getElementById('emp-llm-service');
    const prompt = document.getElementById('emp-prompt');
    const welcome = document.getElementById('emp-welcome');
    const quickPromptsEl = document.getElementById('emp-quick-prompts');

    // Skill Inputs
    const tempSlider = document.getElementById('emp-temp');
    const tempVal = document.getElementById('temp-val');
    const skillSql = document.getElementById('skill-sql');
    const skillChart = document.getElementById('skill-chart');
    const skillReport = document.getElementById('skill-report');
    const skillPython = document.getElementById('skill-python');
    const skillInternet = document.getElementById('skill-internet');

    if (empId) {
        const emp = employees.find(e => e.id === empId);
        if (emp) {
            title.textContent = '编辑 AI 员工';
            username.value = emp.username;
            nickname.value = emp.nickname;
            position.value = emp.position || '';
            desc.value = emp.desc || '';
            enabled.checked = emp.enabled;
            model.value = emp.model || 'deepseek-chat';
            prompt.value = emp.prompt || '';
            welcome.value = emp.welcome || '';
            quickPromptsEl.value = formatQuickPrompts(emp.quickPrompts);
            selectedAvatar = emp.avatar;
            editingKnowledgeSet = new Set(emp.knowledgeIds || []);

            // Load Soul & Skills
            tempSlider.value = emp.temperature !== undefined ? emp.temperature : 0.7;
            tempVal.innerText = tempSlider.value;
            
            const skills = emp.skills || { sql: true, chart: true, report: false };
            skillSql.checked = !!skills.sql;
            skillChart.checked = !!skills.chart;
            skillReport.checked = !!skills.report;
            skillPython.checked = !!skills.python;
            skillInternet.checked = !!skills.internet;
            
            // Load Tools
            renderEmployeeTools(emp.tools || []);

            // Load Data Scopes
            renderDataScopeSelection(emp.allowedSchemas || []);
        }
    } else {
        title.textContent = '新建 AI 员工';
        
        // Defaults or Template
        const config = templateConfig || {};
        
        username.value = ''; // User still needs to set unique ID
        nickname.value = config.nickname || '';
        position.value = config.position || '';
        desc.value = '';
        enabled.checked = true;
        model.value = config.model || 'deepseek-chat';
        prompt.value = config.prompt || '';
        welcome.value = config.welcome || '';
        quickPromptsEl.value = config.quickPrompts ? formatQuickPrompts(config.quickPrompts) : '';
        
        selectedAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
        editingKnowledgeSet = new Set();
        
        tempSlider.value = config.temperature !== undefined ? config.temperature : 0.7;
        tempVal.innerText = tempSlider.value;
        
        const skills = config.skills || { sql: true, chart: true, report: false };
        skillSql.checked = !!skills.sql;
        skillChart.checked = !!skills.chart;
        skillReport.checked = !!skills.report;
        skillPython.checked = !!skills.python;
        skillInternet.checked = !!skills.internet;
        
        // Load Template Tools
        renderEmployeeTools(config.tools || []);
        
        renderDataScopeSelection(config.allowedSchemas || []);
        
        if (templateConfig) {
             showToast('已加载模板配置，请完善基本信息');
        }
    }

    renderAvatarSelection();
    renderKnowledgePanels();
    renderWorkflowSkillList();
    
    // Reset Sandbox
    resetSandbox();
    
    switchEmployeeTab('basic');
    drawer.classList.add('active');
}

// ==========================================
// Sandbox Logic
// ==========================================

function resetSandbox() {
    const stage = document.getElementById('sandbox-chat-stage');
    if (!stage) return;
    
    stage.innerHTML = `
        <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
            -- 调试会话已就绪 --
        </div>
    `;
    
    // Simulate Welcome
    setTimeout(() => {
        const welcome = document.getElementById('emp-welcome').value || '你好，我是 AI 员工。';
        addSandboxMessage(welcome, 'ai');
    }, 500);
}

function sendSandboxMessage() {
    const input = document.getElementById('sandbox-input');
    const text = input.value.trim();
    if (!text) return;
    
    addSandboxMessage(text, 'user');
    input.value = '';
    
    // Simulate thinking and response based on configuration
    const temp = document.getElementById('emp-temp').value;
    const nickname = document.getElementById('emp-nickname').value || 'AI';
    
    // Mock API Delay
    const thinkingId = addSandboxMessage('Thinking...', 'thinking');
    
    setTimeout(() => {
        // Remove thinking bubble
        const thinkingEl = document.getElementById(thinkingId);
        if (thinkingEl) thinkingEl.remove();
        
        // Generate response based on current skills
        let response = ``;
        let debugInfo = null;
        const intent = text.includes('搜索') ? 'Internet Search' : (text.includes('分析') ? 'Deep Analysis' : 'Data Query');
        let generatedDSL = '';
        let dataSource = '';

        const hasSql = document.getElementById('skill-sql').checked;
        const hasChart = document.getElementById('skill-chart').checked;
        const hasPython = document.getElementById('skill-python').checked;
        const hasInternet = document.getElementById('skill-internet').checked;
        
        // Check Data Scope (Permission Interception)
        const allowedSchemas = [];
        document.querySelectorAll('#data-scope-list input[type="checkbox"]:checked').forEach(cb => {
            allowedSchemas.push(cb.value);
        });
        
        // Simple keyword interception logic
        let permissionDenied = false;
        if ((text.includes('薪资') || text.includes('人力')) && !allowedSchemas.includes('hr_data')) {
             permissionDenied = true;
             response = `[${nickname}]: 抱歉，我没有访问人力资源 (HR) 数据的权限。请联系管理员授权 'hr_data' 数据域。`;
             debugInfo = {
                 intent: 'Data Query (HR)',
                 dsl: 'BLOCK_BY_POLICY',
                 source: 'hr_data (UNAUTHORIZED)'
             };
        } else {
            // Normal Response Generation
            response = `[${nickname}]: `;
            
            if (hasInternet && (text.includes('搜索') || text.includes('新闻'))) {
                response += `我已在网络上为您找到相关信息... (模拟搜索结果)`;
                generatedDSL = 'Search("Query")';
                dataSource = 'Bing API';
            } else {
                response += `我收到了你的消息 "${text}"。`;
                
                if (hasSql && (text.includes('销售') || text.includes('GMV'))) {
                    response += `<br><br><i>(Skill: SQL Generation Active)</i><br>Executing SQL: <code>SELECT sum(amount) FROM sales_mart...</code>`;
                    generatedDSL = 'SELECT * FROM sales_mart...';
                    dataSource = 'sales_mart';
                } else if (hasPython && text.includes('预测')) {
                    response += `<br><br><i>(Skill: Python Active)</i><br>Running Python script for prediction...`;
                    generatedDSL = 'model.predict(df)';
                    dataSource = 'Python Runtime';
                }

                if (hasChart && (text.includes('图表') || text.includes('趋势'))) {
                    response += `<br><br><i>(Skill: Chart Generation Active)</i><br>[Rendering Line Chart...]`;
                }
            }
            
            if (!debugInfo) {
                debugInfo = {
                    intent: intent,
                    dsl: generatedDSL || 'N/A',
                    source: dataSource || 'N/A'
                };
            }
        }
        
        response += `<br><br><span style="color:#999; font-size:11px;">(Temperature: ${temp})</span>`;
        
        addSandboxMessage(response, 'ai', debugInfo);
        
        // Auto scroll
        const stage = document.getElementById('sandbox-chat-stage');
        stage.scrollTop = stage.scrollHeight;
        
    }, 1000 + Math.random() * 1000);
}

function addSandboxMessage(html, type, debugInfo = null) {
    const stage = document.getElementById('sandbox-chat-stage');
    const div = document.createElement('div');
    const id = 'msg-' + Date.now();
    div.id = id;
    div.style.display = 'flex';
    div.style.marginBottom = '16px';
    div.style.flexDirection = 'column'; // Allow vertical stacking for debug info
    
    let contentHtml = '';
    
    if (type === 'user') {
        div.style.alignItems = 'flex-end';
        contentHtml = `
            <div style="display: flex; justify-content: flex-end; align-items: flex-start;">
                <div style="background: #3b82f6; color: #fff; padding: 10px 16px; border-radius: 12px; border-bottom-right-radius: 2px; max-width: 80%;">
                    ${html}
                </div>
                <div style="width: 28px; height: 28px; background: #eee; border-radius: 50%; margin-left: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
                    <i class="fas fa-user"></i>
                </div>
            </div>
        `;
    } else if (type === 'ai') {
        div.style.alignItems = 'flex-start';
        const avatarUrl = selectedAvatar;
        
        // Build Debug Info HTML if available
        let debugHtml = '';
        if (debugInfo) {
            const debugId = id + '-debug';
            debugHtml = `
                <div style="margin-top: 8px; width: 100%; max-width: 80%; margin-left: 36px;">
                    <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 8px; font-size: 11px; color: #854d0e; cursor: pointer;" onclick="document.getElementById('${debugId}').classList.toggle('hidden')">
                        <i class="fas fa-bug"></i> [Debug Info] 点击展开 trace
                    </div>
                    <div id="${debugId}" class="hidden" style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 8px; font-family: monospace; font-size: 11px; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px;">
                        <div style="margin-bottom: 4px;"><strong>Intent:</strong> ${debugInfo.intent}</div>
                        <div style="margin-bottom: 4px;"><strong>DSL:</strong> ${debugInfo.dsl}</div>
                        <div><strong>Data Source:</strong> ${debugInfo.source}</div>
                    </div>
                </div>
            `;
        }

        contentHtml = `
            <div style="display: flex; align-items: flex-start; width: 100%;">
                 <div style="width: 28px; height: 28px; border-radius: 50%; margin-right: 8px; overflow: hidden; border: 1px solid #eee; flex-shrink: 0;">
                    <img src="${avatarUrl}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="background: #fff; border: 1px solid #eee; padding: 10px 16px; border-radius: 12px; border-top-left-radius: 2px; max-width: 80%; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    ${html}
                </div>
            </div>
            ${debugHtml}
        `;
    } else if (type === 'thinking') {
        div.style.alignItems = 'flex-start';
         contentHtml = `
            <div style="display: flex; align-items: flex-start;">
                 <div style="width: 28px; height: 28px; border-radius: 50%; margin-right: 8px; overflow: hidden; border: 1px solid #eee; background: #f3f4f6; flex-shrink: 0;">
                   <i class="fas fa-robot" style="color: #ccc; padding: 6px;"></i>
                </div>
                <div style="color: #999; font-size: 12px; padding: 6px;">
                    <i class="fas fa-circle-notch fa-spin"></i> ${html}
                </div>
            </div>
        `;
    }
    
    div.innerHTML = contentHtml;
    stage.appendChild(div);
    stage.scrollTop = stage.scrollHeight;
    return id;
}

// Mock Data Models for Scope Selection
const availableSchemas = [
    { id: 'sales_mart', name: '销售数据集市 (Sales Mart)', type: 'virtual' },
    { id: 'inventory_dim', name: '库存明细表 (Inventory)', type: 'doris' },
    { id: 'user_behavior', name: '用户行为日志 (User Logs)', type: 'clickhouse' },
    { id: 'finance_core', name: '财务核心数据 (Finance)', type: 'mysql' },
    { id: 'hr_data', name: '人力资源档案 (HR)', type: 'postgresql' }
];

function renderDataScopeSelection(selectedIds = []) {
    const container = document.getElementById('data-scope-list');
    if (!container) return;
    
    const selectedSet = new Set(selectedIds);
    
    container.innerHTML = availableSchemas.map(schema => `
        <div class="scope-item">
            <input type="checkbox" id="scope-${schema.id}" value="${schema.id}" ${selectedSet.has(schema.id) ? 'checked' : ''}>
            <label for="scope-${schema.id}">
                <div>${schema.name}</div>
                <div>Type: ${schema.type}</div>
            </label>
        </div>
    `).join('');
}

function renderEmployeeTools(toolIds) {
    // Clear existing dynamic tools
    document.querySelectorAll('.dynamic-skill-input').forEach(el => el.remove());
    document.querySelectorAll('.dynamic-skill-label').forEach(el => el.remove());
    
    // Add tools
    toolIds.forEach(id => {
        const skill = skillRegistry.find(s => s.id === id);
        if(skill) addToolSkill(id);
    });
}

function renderWorkflowSkillList() {
    const grid = document.getElementById('workflow-skill-grid');
    if (!grid) return;
    grid.innerHTML = workflowTemplates.map(tpl => `
        <div class="workflow-skill-card">
            <h4>${tpl.name}</h4>
            <p>${tpl.desc}</p>
            <button class="p-button p-button-outlined" type="button" onclick="useWorkflowTemplate('${tpl.id}', 'skills-tab')">
                <i class="fas fa-diagram-project"></i> 装配
            </button>
        </div>
    `).join('');
}

function renderAvatarSelection() {
    const grid = document.getElementById('avatar-grid');
    if (!grid) return;
    grid.innerHTML = avatarOptions.map(url => `
        <div class="avatar-option ${url === selectedAvatar ? 'selected' : ''}" onclick="selectAvatar('${url}')">
            <img src="${url}" alt="avatar">
        </div>
    `).join('');
}

function selectAvatar(url) {
    selectedAvatar = url;
    renderAvatarSelection();
}

function saveEmployee() {
    try {
        const usernameInput = document.getElementById('emp-username');
        const nicknameInput = document.getElementById('emp-nickname');
        
        if (!usernameInput || !nicknameInput) {
            console.error('Required inputs not found in DOM');
            return;
        }

        const username = usernameInput.value.trim();
        const nickname = nicknameInput.value.trim();
        
        // Basic Info
        const position = document.getElementById('emp-position')?.value.trim() || '';
        const desc = document.getElementById('emp-desc')?.value.trim() || '';
        const enabled = document.getElementById('emp-enabled')?.checked || false;
        const model = document.getElementById('emp-llm-service')?.value || 'deepseek-chat';
        const prompt = document.getElementById('emp-prompt')?.value.trim() || '';
        const welcome = document.getElementById('emp-welcome')?.value.trim() || '';
        const quickPromptsEl = document.getElementById('emp-quick-prompts');
        const quickPrompts = quickPromptsEl ? parseQuickPrompts(quickPromptsEl.value) : [];
        const knowledgeIds = Array.from(editingKnowledgeSet);

        if (!username || !nickname) {
            showToast('请填写用户名和昵称', 'info');
            // Highlight empty fields
            if(!username) usernameInput.style.borderColor = 'red';
            if(!nickname) nicknameInput.style.borderColor = 'red';
            // Reset highlight after 2s
            setTimeout(() => {
                usernameInput.style.borderColor = '';
                nicknameInput.style.borderColor = '';
            }, 2000);
            return;
        }
        
        // Read New Fields with Safety Checks
        const tempSlider = document.getElementById('emp-temp');
        const temperature = tempSlider ? parseFloat(tempSlider.value) : 0.7;
        
        const skillSql = document.getElementById('skill-sql');
        const skillChart = document.getElementById('skill-chart');
        const skillReport = document.getElementById('skill-report');
        const skillPython = document.getElementById('skill-python');
        const skillInternet = document.getElementById('skill-internet');

        const skills = {
            sql: skillSql ? skillSql.checked : false,
            chart: skillChart ? skillChart.checked : false,
            report: skillReport ? skillReport.checked : false,
            python: skillPython ? skillPython.checked : false,
            internet: skillInternet ? skillInternet.checked : false
        };
        
        const tools = Array.from(getCurrentlyEditingTools());
        
        const allowedSchemas = [];
        document.querySelectorAll('#data-scope-list input[type="checkbox"]:checked').forEach(cb => {
            allowedSchemas.push(cb.value);
        });

        if (editingEmployeeId) {
            const emp = employees.find(e => e.id === editingEmployeeId);
            if (emp) {
                emp.username = username;
                emp.nickname = nickname;
                emp.position = position;
                emp.desc = desc;
                emp.enabled = enabled;
                emp.model = model;
                emp.prompt = prompt;
                emp.avatar = selectedAvatar;
                emp.welcome = welcome;
                emp.quickPrompts = quickPrompts;
                emp.knowledgeIds = knowledgeIds;
                
                // Save new fields
                emp.temperature = temperature;
                emp.skills = skills;
                emp.tools = tools;
                emp.allowedSchemas = allowedSchemas;
            }
            showToast('员工信息已更新');
        } else {
            const newId = Math.max(0, ...employees.map(e => e.id)) + 1;
            employees.unshift({
                id: newId,
                username,
                nickname,
                position,
                desc,
                enabled,
                model,
                prompt,
                avatar: selectedAvatar,
                welcome,
                quickPrompts,
                knowledgeIds,
                temperature,
                skills,
                tools,
                allowedSchemas
            });
            showToast('新员工已创建');
        }

        renderEmployeeList();
        closeDrawer('employee-builder-drawer');
        
    } catch (error) {
        console.error('Error saving employee:', error);
        showToast('保存失败: ' + error.message, 'error');
    }
}

function switchEmployeeTab(tabName) {
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
    const target = document.getElementById(`emp-tab-${tabName}`);
    if (target) target.classList.remove('hidden');
}

function getChatAgents() {
    const personaAgents = ['science', 'liberal'].map(key => {
        const pack = personaStageContent[key]?.[currentLang] || personaStageContent[key]?.zh || {};
        const persona = personaProfiles[key];
        const personaPack = persona?.[currentLang] || persona?.zh || {};
        // Extract name from "理科生 · Alisa" format to just "Alisa"
        const fullName = getPersonaCopy(key, 'name') || key;
        const name = fullName.includes(' · ') ? fullName.split(' · ')[1] : fullName;
        return {
            id: key,
            type: 'persona',
            name: name || key,
            avatar: personaProfiles[key]?.avatar,
            desc: personaPack.desc || pack.brief || '',
            quickPrompts: pack.suggestions || [],
            welcome: pack.welcome
        };
    });
    const employeeAgents = employees
        .filter(emp => emp.enabled)
        .map(emp => ({
            id: makeEmployeeKey(emp.id),
            type: 'employee',
            name: emp.nickname,
            avatar: emp.avatar,
            desc: [emp.position, emp.model].filter(Boolean).join(' · '),
            quickPrompts: emp.quickPrompts || [],
            welcome: emp.welcome
        }));
    return personaAgents.concat(employeeAgents);
}

function renderChatHeader() {
    const agents = getChatAgents();
    if (!agents.length) return;

    let activeChanged = false;
    if (!agents.some(agent => agent.id === currentPersona)) {
        currentPersona = 'science';
        activeChanged = true;
    }

    const activeAgent = agents.find(agent => agent.id === currentPersona);
    if (activeAgent) {
        renderActiveAgentProfile(activeAgent);
        renderAgentQuickPrompts(activeAgent);
        if (activeChanged) {
            renderPersonaStage(currentPersona, true);
        }
    }
}

function renderActiveAgentProfile(agent) {
    if (!agent) return;
    
    // Update top header
    const topAvatar = document.getElementById('current-employee-avatar');
    const topName = document.getElementById('current-employee-name');
    if (topAvatar) topAvatar.src = agent.avatar;
    if (topName) topName.textContent = agent.name;
    
    // Update profile section
    const profileAvatar = document.getElementById('agent-profile-avatar');
    const profileName = document.getElementById('agent-profile-name');
    const profileDesc = document.getElementById('agent-profile-desc');
    if (profileAvatar) profileAvatar.src = agent.avatar;
    if (profileName) profileName.textContent = agent.name;
    if (profileDesc) profileDesc.textContent = agent.desc || (currentLang === 'en' ? 'Ready to assist.' : '随时为您服务。');
    
    // Update chat input avatar
    const inputAvatar = document.getElementById('chat-input-avatar');
    const chatInput = document.getElementById('chat-input');
    if (inputAvatar) inputAvatar.src = agent.avatar;
    if (chatInput) {
        const placeholder = currentLang === 'en' ? `Ask ${agent.name} a question...` : `向 ${agent.name} 提问...`;
        chatInput.placeholder = placeholder;
    }
}

function renderAgentQuickPrompts(agent) {
    const container = document.getElementById('agent-quick-prompts');
    if (!container) return;
    if (!agent || !agent.quickPrompts || !agent.quickPrompts.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = agent.quickPrompts.map(prompt => {
        // Use JSON.stringify to safely escape the prompt
        const safe = JSON.stringify(prompt);
        // Escape HTML entities in the display text
        const displayText = String(prompt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<button type="button" class="agent-quick-prompt-btn" onclick="sendQuickPrompt(${safe})">${displayText}</button>`;
    }).join('');
}

function openAgentPalette() {
    const palette = document.getElementById('agent-command-palette');
    if (!palette) return;
    const agents = getChatAgents();
    if (!agents.length) return;

    palette.innerHTML = `
        <div class="agent-palette-header">
            <span>${currentLang === 'en' ? 'Switch Agent' : '切换 AI 员工'}</span>
        </div>
        ${agents.map(agent => {
            let tags = [];
            let role = '';
            if (agent.type === 'persona') {
                if (agent.id === 'science') {
                    tags = ['最快', '最准'];
                    role = '核心员工';
                } else if (agent.id === 'liberal') {
                    tags = ['思考型'];
                }
            } else {
                // For employees, you can add tags based on employee properties
                role = agent.desc.split(' · ')[0] || '';
            }
            
            // Escape special characters for onclick attribute
            const safeId = String(agent.id).replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeName = String(agent.name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeDesc = String(agent.desc || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeAvatar = String(agent.avatar || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safeRole = String(role || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            
            return `
            <button type="button" class="palette-item ${agent.id === currentPersona ? 'active' : ''}" onclick="selectAgentFromPalette('${safeId}')">
                <img src="${safeAvatar}" alt="${safeName}">
                <div class="item-meta">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <div class="name">${safeName}</div>
                        ${tags.map(tag => `<span class="item-tag">${tag.replace(/'/g, "\\'").replace(/"/g, '&quot;')}</span>`).join('')}
                    </div>
                    ${role ? `<div style="font-size: 12px; font-weight: 300; color: #86868b; margin-bottom: 2px;">${safeRole}</div>` : ''}
                    <div class="desc">${safeDesc}</div>
                </div>
            </button>
        `;
        }).join('')}
    `;

    palette.classList.add('visible');
    agentPaletteOpen = true;
}

function closeAgentPalette() {
    const palette = document.getElementById('agent-command-palette');
    if (!palette) return;
    palette.classList.remove('visible');
    agentPaletteOpen = false;

    const btn = document.getElementById('agent-toggle-btn');
    if (btn) btn.classList.remove('active');
}

function selectAgentFromPalette(key) {
    closeAgentPalette();
    switchPersona(key);
    const agents = getChatAgents();
    const target = agents.find(a => a.id === key);
    if (target) {
        showToast(`${currentLang === 'en' ? 'Switched to' : '已切换至'} ${target.name}`);
    }
}

function toggleAgentPaletteFromButton() {
    if (agentPaletteOpen) {
        closeAgentPalette();
    } else {
        openAgentPalette();
    }
}

// ==========================================
// Employee Creation Shortcuts (MindMap / NLP)
// ==========================================

function triggerMindMapUpload() {
    const input = document.getElementById('mindmap-upload-input');
    if(input) input.click();
}

function handleMindMapUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        showToast('info', `正在解析思维导图 ${file.name}...`);
        
        setTimeout(() => {
            showToast('success', '解析成功！已根据思维导图生成数字员工配置');
            
            // Fill with mock data
            const nameInput = document.getElementById('emp-username');
            if(nameInput) nameInput.value = 'mindmap_agent';
            
            const nickInput = document.getElementById('emp-nickname');
            if(nickInput) nickInput.value = '思维导图助手';
            
            const posInput = document.getElementById('emp-position');
            if(posInput) posInput.value = '结构化分析师';
            
            const descInput = document.getElementById('emp-desc');
            if(descInput) descInput.value = '基于导入的思维导图结构生成的专业分析助手。';
            
            const welcomeInput = document.getElementById('emp-welcome');
            if(welcomeInput) welcomeInput.value = '你好，我已经理解了您的思维导图结构，随时准备协助分析。';
            
            const promptInput = document.getElementById('emp-quick-prompts');
            if(promptInput) promptInput.value = '分析导图中的核心分支\n生成结构化总结报告';
            
            // Switch to first avatar as default
            // Trying to find avatar options. Assuming they are divs with class 'avatar-option' inside #avatar-grid
            // If populated by JS, we need to wait or assume they are there.
            const avatarOptions = document.querySelectorAll('#avatar-grid .avatar-option');
            if(avatarOptions.length > 0) {
                avatarOptions[0].click();
            }
            
        }, 1500);
    }
}

function toggleNLPCreation() {
    const panel = document.getElementById('nlp-creation-panel');
    if (!panel) return;
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        const input = document.getElementById('nlp-creation-input');
        if(input) input.focus();
    } else {
        panel.classList.add('hidden');
    }
}

function generateEmployeeFromNLP() {
    const inputEl = document.getElementById('nlp-creation-input');
    if (!inputEl) return;
    
    const inputVal = inputEl.value;
    if (!inputVal.trim()) {
        showToast('error', '请先输入描述内容');
        return;
    }
    
    const btn = document.querySelector('#nlp-creation-panel button');
    let originalContent = '';
    if(btn) {
        originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
        btn.disabled = true;
    }
    
    // Simulate AI generation
    setTimeout(() => {
        if(btn) {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
        toggleNLPCreation(); // Close panel
        
        showToast('success', 'AI 已生成员工配置');
        
        // Mock parsing logic based on keywords
        let role = '通用助手';
        if (inputVal.includes('分析师')) role = '数据分析师';
        if (inputVal.includes('销售')) role = '销售助理';
        if (inputVal.includes('客服')) role = '智能客服';
        
        const nameInput = document.getElementById('emp-username');
        if(nameInput) nameInput.value = 'ai_generated_agent';
        
        const nickInput = document.getElementById('emp-nickname');
        if(nickInput) nickInput.value = role + ' (AI)';
        
        const posInput = document.getElementById('emp-position');
        if(posInput) posInput.value = role;
        
        const descInput = document.getElementById('emp-desc');
        if(descInput) descInput.value = inputVal;
        
        const welcomeInput = document.getElementById('emp-welcome');
        if(welcomeInput) welcomeInput.value = `你好，我是您的${role}。我已根据您的描述准备就绪。`;
        
        const promptInput = document.getElementById('emp-quick-prompts');
        if(promptInput) promptInput.value = '生成日报\n分析当前趋势\n给出优化建议';
        
        // Select a random avatar
        const avatarOptions = document.querySelectorAll('#avatar-grid .avatar-option');
        if(avatarOptions.length > 0) {
            const rand = Math.floor(Math.random() * avatarOptions.length);
            avatarOptions[rand].click();
        }
        
    }, 2000);
}
