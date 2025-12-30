
/**
 * Indicator Platform Logic
 * Handles state management, CRUD operations, and UI rendering for the indicator platform.
 */

// --- State Management ---
const store = {
    atomic: [
        { id: 1, name: "支付金额", code: "atomic_pay_amt", table: "fact_orders", field: "amount", agg: "SUM", status: "online", owner: "Admin" },
        { id: 2, name: "支付订单数", code: "atomic_pay_cnt", table: "fact_orders", field: "order_id", agg: "COUNT", status: "online", owner: "Admin" },
        { id: 3, name: "访问用户数", code: "atomic_uv", table: "log_visits", field: "user_id", agg: "COUNT_DISTINCT", status: "online", owner: "Li" },
    ],
    derived: [
        { id: 101, name: "近7天支付GMV", atomCode: "atomic_pay_amt", period: "近7天", dims: ["门店", "渠道"], status: "online" },
        { id: 102, name: "昨日客单价", atomCode: "atomic_pay_amt", period: "近1天", dims: ["门店"], status: "draft" },
    ],
    composite: [
         { id: 201, name: "ROI", expr: "atomic_pay_amt / atomic_cost", dims: ["渠道", "活动"], status: "online" }
    ],
    dimensions: [
        { id: 1, name: "时间维度", code: "dim_date", type: "common", table: "dim_date" },
        { id: 2, name: "门店维度", code: "dim_store", type: "business", table: "dim_store_info" },
        { id: 3, name: "商品类目", code: "dim_category", type: "business", table: "dim_prod_cat" },
        { id: 4, name: "用户等级", code: "dim_user_level", type: "business", table: "dim_user_profile" },
        { id: 5, name: "渠道", code: "dim_channel", type: "business", table: "dim_channel_info" },
    ],
    apis: [
        { id: 1, path: "/api/v1/metrics/gmv_7d", method: "GET", desc: "获取近7天GMV趋势" },
        { id: 2, path: "/api/v1/metrics/user_retention", method: "POST", desc: "用户留存率查询" }
    ],
    models: [
        { id: 1, name: "fact_orders", type: "事实表", rows: "12.5M", updated: "2023-11-26", status: "active" },
        { id: 2, name: "fact_payments", type: "事实表", rows: "11.2M", updated: "2023-11-26", status: "active" },
        { id: 3, name: "dim_users", type: "维度表", rows: "450K", updated: "2023-11-25", status: "active" },
        { id: 4, name: "dim_store", type: "维度表", rows: "1.2K", updated: "2023-11-20", status: "active" }
    ]
};

// ID Generator
const generateId = () => Math.floor(Math.random() * 10000);

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderAtomicList();
    renderDerivedList();
    renderCompositeList();
    renderDimensions();
    renderModelList();
    renderApiList();
    renderLineageOverview();
});

// --- Tab Switching ---
function switchTab(tabId) {
    // Update Sidebar UI
    document.querySelectorAll('.menu-link').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) activeNav.classList.add('active');

    // Update View
    document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
    const view = document.getElementById(`view-${tabId}`);
    if (view) {
        view.classList.remove('hidden');
    }
}

// --- Rendering ---

function updateStats() {
    const total = store.atomic.length + store.derived.length + store.composite.length;
    document.getElementById('stat-total-indicators').innerText = total.toLocaleString();
}

function renderAtomicList(filterText = '', filterStatus = '') {
    const tbody = document.getElementById('atomic-list');
    const list = store.atomic.filter(item => {
        const matchText = !filterText || item.name.includes(filterText) || item.code.includes(filterText);
        const matchStatus = !filterStatus || item.status === filterStatus;
        return matchText && matchStatus;
    });

    tbody.innerHTML = list.length ? list.map(item => `
        <tr>
            <td><b>${item.name}</b></td>
            <td><span class="code-badge">${item.code}</span></td>
            <td>${item.agg}(${item.table}.${item.field})</td>
            <td>销售域模型</td>
            <td>${getStatusBadge(item.status)}</td>
            <td>${item.owner}</td>
            <td>
                <button class="p-button p-button-text p-button-sm" onclick="editIndicator('atomic', ${item.id})">编辑</button>
                ${renderStatusActionBtn('atomic', item.id, item.status)}
            </td>
        </tr>
    `).join('') : '<tr><td colspan="7" style="text-align:center; color:#999;">无数据</td></tr>';
}

function renderDerivedList(filterText = '', filterStatus = '') {
    const tbody = document.getElementById('derived-list');
    const list = store.derived.filter(item => {
         const matchText = !filterText || item.name.includes(filterText);
         const matchStatus = !filterStatus || item.status === filterStatus;
         return matchText && matchStatus;
    });

    tbody.innerHTML = list.length ? list.map(item => {
        const atom = store.atomic.find(a => a.code === item.atomCode);
        const atomName = atom ? atom.name : item.atomCode;
        return `
        <tr>
            <td><b>${item.name}</b></td>
            <td><span class="link-text">${atomName}</span></td>
            <td>${item.period}</td>
            <td>-</td>
            <td>${item.dims.join(', ')}</td>
            <td>${getStatusBadge(item.status)}</td>
            <td>
                <button class="p-button p-button-text p-button-sm" onclick="editIndicator('derived', ${item.id})">编辑</button>
                ${renderStatusActionBtn('derived', item.id, item.status)}
                <button class="p-button p-button-text p-button-sm p-button-danger" onclick="deleteItem('derived', ${item.id})">删除</button>
            </td>
        </tr>
    `}).join('') : '<tr><td colspan="7" style="text-align:center; color:#999;">无数据</td></tr>';
}

function renderCompositeList(filterText = '') {
    const tbody = document.getElementById('composite-list');
    const list = store.composite.filter(item => !filterText || item.name.includes(filterText));

    tbody.innerHTML = list.length ? list.map(item => `
        <tr>
            <td><b>${item.name}</b></td>
            <td><code style="font-size:12px; background:#f0f0f0; padding:2px 4px; border-radius:4px;">${item.expr}</code></td>
            <td>${item.dims.join(', ')}</td>
            <td>${getStatusBadge(item.status)}</td>
            <td>
                <button class="p-button p-button-text p-button-sm" onclick="editIndicator('composite', ${item.id})">编辑</button>
                ${renderStatusActionBtn('composite', item.id, item.status)}
                <button class="p-button p-button-text p-button-sm p-button-danger" onclick="deleteItem('composite', ${item.id})">删除</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align:center; color:#999;">无数据</td></tr>';
}

function renderModelList(filterText = '', filterType = '') {
    const tbody = document.getElementById('model-list');
    const list = store.models.filter(item => {
        const matchText = !filterText || item.name.includes(filterText);
        const matchType = !filterType || item.type === filterType;
        return matchText && matchType;
    });
    
    tbody.innerHTML = list.length ? list.map(item => `
        <tr>
            <td><b>${item.name}</b></td>
            <td><span class="p-tag ${item.type === '事实表' ? 'p-tag-info' : 'p-tag-warning'}" style="background:${item.type==='事实表'?'#Eef2ff':'#fffbeb'}; color:${item.type==='事实表'?'#4338ca':'#b45309'}">${item.type}</span></td>
            <td>${item.rows}</td>
            <td id="model-updated-${item.id}">${item.updated}</td>
            <td><span class="p-tag p-tag-success">正常</span></td>
            <td>
                <button class="p-button p-button-text p-button-sm" onclick="showLineage('${item.name}')">血缘</button>
                <button class="p-button p-button-text p-button-sm" onclick="previewTable('${item.name}')">预览</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center; color:#999;">无数据</td></tr>';
}

// 概览页：指标血缘地图（单指标视角）
function renderLineageOverview(selectedId) {
    const container = document.getElementById('lineage-map');
    if (!container) return;

    const derivedList = store.derived;
    if (!derivedList.length) {
        container.innerHTML = '<div style="text-align:center; color:#9ca3af;">暂无派生指标，可在下方「派生指标管理」中创建后查看血缘。</div>';
        return;
    }

    const active = derivedList.find(d => d.id === Number(selectedId)) || derivedList[0];
    const atom = store.atomic.find(a => a.code === active.atomCode);
    const tableName = atom ? atom.table : 'N/A';
    const atomLabel = atom ? `${atom.name} (原子)` : active.atomCode;

    container.innerHTML = `
        <div style="width:100%; max-width:720px; margin:0 auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div style="font-size:14px; color:#4b5563;">
                    当前指标：<b>${active.name}</b>
                </div>
                <select class="lineage-select" onchange="handleLineageSelect(this.value)">
                    ${derivedList.map(d => `<option value="${d.id}" ${d.id === active.id ? 'selected' : ''}>${d.name}</option>`).join('')}
                </select>
            </div>
            <div style="position: relative; width: 100%; height: 220px; margin: 0 auto;">
                <div style="position: absolute; top: 80px; left: 40px; background: #E5F2FF; padding: 10px 20px; border-radius: 8px; border: 1px solid #007AFF; color: #007AFF;">${tableName}</div>
                <div style="position: absolute; top: 140px; left: 260px; background: #E4F9EC; padding: 10px 20px; border-radius: 8px; border: 1px solid #34C759; color: #34C759;">${atomLabel}</div>
                <div style="position: absolute; top: 80px; left: 480px; background: #FFF8E1; padding: 10px 20px; border-radius: 8px; border: 1px solid #FF9500; color: #FF9500;">${active.name} (派生)</div>
                <svg style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events: none;">
                    <path d="M160 105 C 210 105, 220 160, 270 160" fill="none" stroke="#ccc" stroke-width="2" />
                    <path d="M380 160 C 430 160, 440 105, 490 105" fill="none" stroke="#ccc" stroke-width="2" />
                </svg>
            </div>
            <p style="margin-top: 12px; font-size:12px; color:#9ca3af;">一次仅展示单个指标的关键血缘，适配上百个指标的场景。可在下方列表中继续查看和维护更多指标。</p>
        </div>
    `;
}

function handleLineageSelect(id) {
    renderLineageOverview(Number(id));
}

function renderDimensions(filterText = '') {
    const grid = document.getElementById('dimension-grid');
    const list = store.dimensions.filter(item => !filterText || item.name.includes(filterText) || item.code.includes(filterText));
    
    grid.innerHTML = list.length ? list.map(item => `
        <div class="source-card-item" style="align-items: flex-start; text-align: left;">
            <div class="source-icon ${item.type === 'common' ? 'blue' : 'purple'}" style="width: 48px; height: 48px; font-size: 20px; margin-bottom: 12px;">
                <i class="fas fa-${item.type === 'common' ? 'clock' : 'tag'}"></i>
            </div>
            <div class="source-item-title">${item.name}</div>
            <div class="source-item-desc" style="margin-bottom: 12px;">编码: ${item.code}</div>
            <div style="margin-top: auto; width: 100%; display: flex; gap: 8px;">
                <button class="p-button p-button-outlined p-button-sm" style="flex:1; justify-content: center;" onclick="viewDimensionValues('${item.name}')">查看值</button>
                <button class="p-button p-button-text p-button-sm" style="width: 32px; justify-content: center;" onclick="deleteItem('dimensions', ${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('') : '<div style="text-align:center; color:#999; width:100%; grid-column: 1 / -1;">无数据</div>';
}

function renderApiList() {
    const container = document.getElementById('api-list');
    container.innerHTML = store.apis.map(api => `
        <div class="api-card">
            <i class="far fa-copy api-copy" title="复制 URL" onclick="copyToClipboard('${api.path}')"></i>
            <div><span class="api-method">${api.method}</span> <span class="api-path">${api.path}</span></div>
            <div style="margin-top: 8px; color: #aaa;">${api.desc}</div>
        </div>
    `).join('');
}

// --- Helpers ---

function getStatusBadge(status) {
    if (status === 'online') return `<span class="p-tag p-tag-success"><span class="status-badge-dot status-online"></span>已上线</span>`;
    if (status === 'draft') return `<span class="p-tag p-tag-warning"><span class="status-badge-dot status-draft"></span>草稿</span>`;
    if (status === 'offline') return `<span class="p-tag" style="background:#eee; color:#666;"><span class="status-badge-dot status-offline"></span>已下线</span>`;
    return status;
}

function renderStatusActionBtn(type, id, status) {
    if (status === 'online') {
        return `<button class="p-button p-button-text p-button-sm p-button-danger" onclick="updateStatus('${type}', ${id}, 'offline')">下线</button>`;
    } else {
        return `<button class="p-button p-button-text p-button-sm" onclick="updateStatus('${type}', ${id}, 'online')">上线</button>`;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('API 路径已复制');
    });
}

// --- Filtering ---

function filterList(type, text) {
    if (type === 'atomic') renderAtomicList(text, document.querySelector('#view-atomic select').value);
    if (type === 'derived') renderDerivedList(text, document.querySelector('#view-derived select').value);
    if (type === 'composite') renderCompositeList(text);
}

function filterListStatus(type, status) {
    if (type === 'atomic') renderAtomicList(document.querySelector('#view-atomic input').value, status);
    if (type === 'derived') renderDerivedList(document.querySelector('#view-derived input').value, status);
}

function filterDimensions(text) {
    renderDimensions(text);
}

function filterModels(text) {
    renderModelList(text, document.querySelector('#view-models select').value);
}

function filterModelsType(type) {
    renderModelList(document.querySelector('#view-models input').value, type);
}


// --- Actions (Create / Edit / Delete / Status) ---

function deleteItem(type, id) {
    if (!confirm('确定要删除吗？')) return;
    store[type] = store[type].filter(item => item.id !== id);
    refreshAll();
}

function updateStatus(type, id, newStatus) {
    const item = store[type].find(i => i.id === id);
    if (item) {
        item.status = newStatus;
        refreshAll();
    }
}

function refreshAll() {
    updateStats();
    renderAtomicList();
    renderDerivedList();
    renderCompositeList();
    renderDimensions();
    renderModelList();
}

// --- Models Actions ---

function syncMetadata(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> 同步中...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // Update times mock
        const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
        store.models.forEach(m => {
             document.getElementById(`model-updated-${m.id}`).innerText = now;
             m.updated = now;
        });
        
        alert('元数据同步完成');
    }, 1500);
}

function previewTable(tableName) {
    const modal = document.getElementById('preview-modal');
    document.getElementById('preview-title').innerText = `数据预览 - ${tableName}`;
    
    // Mock Data based on table name
    let headers = [];
    let rows = [];
    
    if (tableName === 'dim_store') {
        headers = ['store_id', 'store_name', 'city', 'manager'];
        rows = [
            ['101', '旗舰店-上海', 'Shanghai', 'Zhang'],
            ['102', '旗舰店-北京', 'Beijing', 'Wang'],
            ['103', '广州天河店', 'Guangzhou', 'Li']
        ];
    } else if (tableName === 'fact_orders') {
        headers = ['order_id', 'user_id', 'amount', 'status', 'created_at'];
        rows = [
            ['ORD-2023-001', 'U8821', '299.00', 'PAID', '2023-11-26 10:00:00'],
            ['ORD-2023-002', 'U9932', '1250.50', 'PAID', '2023-11-26 10:05:23'],
            ['ORD-2023-003', 'U7711', '89.90', 'PENDING', '2023-11-26 10:12:45']
        ];
    } else {
        headers = ['id', 'col_1', 'col_2', 'created_at'];
        rows = [
            ['1', 'Test Data A', 'Value 1', '2023-01-01'],
            ['2', 'Test Data B', 'Value 2', '2023-01-02']
        ];
    }
    
    const thead = document.getElementById('preview-thead');
    thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    
    const tbody = document.getElementById('preview-tbody');
    tbody.innerHTML = rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
    
    openModal('preview-modal');
}

function viewDimensionValues(dimName) {
     const modal = document.getElementById('preview-modal');
    document.getElementById('preview-title').innerText = `维度值预览 - ${dimName}`;
    document.getElementById('preview-subtitle').innerText = "Distinct Values (Top 20)";
    
    let headers = ['value_code', 'value_label'];
    let rows = [];
    
    if (dimName.includes('门店')) {
        rows = [['SH01', '上海旗舰店'], ['BJ01', '北京三里屯店'], ['SZ02', '深圳万象城店']];
    } else if (dimName.includes('渠道')) {
        rows = [['APP', '官方APP'], ['MINI', '微信小程序'], ['WEB', '桌面官网']];
    } else {
        rows = [['01', 'Default Value 1'], ['02', 'Default Value 2']];
    }
    
    const thead = document.getElementById('preview-thead');
    thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    
    const tbody = document.getElementById('preview-tbody');
    tbody.innerHTML = rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
    
    openModal('preview-modal');
}

function showLineage(tableName) {
    const container = document.getElementById('lineage-container');
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 14px; color: #666; margin-bottom: 20px;">Current Table: <b>${tableName}</b></div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 40px;">
                <div style="padding: 10px 20px; background: #eef2ff; border: 1px solid #007AFF; border-radius: 8px; color: #007AFF;">Sources</div>
                <i class="fas fa-arrow-right" style="color: #ccc;"></i>
                <div style="padding: 10px 20px; background: #fff; border: 2px solid #007AFF; border-radius: 8px; font-weight: bold;">${tableName}</div>
                <i class="fas fa-arrow-right" style="color: #ccc;"></i>
                <div style="padding: 10px 20px; background: #f0fdf4; border: 1px solid #34C759; border-radius: 8px; color: #34C759;">Downstream Indicators</div>
            </div>
             <p style="margin-top: 40px; color: #999; font-size: 12px;">(Visual Map Placeholder)</p>
        </div>
    `;
    openModal('lineage-modal');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.classList.remove('active');
        modal.style.opacity = '';
    }, 300);
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('active');
}

// --- Drawer Logic (Generic) ---

function openIndicatorDrawer(type) {
    const drawer = document.getElementById('indicator-drawer');
    const title = document.getElementById('drawer-title');
    
    // Reset Form
    document.getElementById('edit-indicator-id').value = '';
    document.getElementById('current-indicator-type').value = type;
    document.getElementById('input-name').value = '';
    document.getElementById('input-code').value = '';
    document.getElementById('input-desc').value = '';
    
    // Show/Hide specific fields
    document.querySelectorAll('.type-fields').forEach(el => el.classList.add('hidden'));
    document.getElementById(`fields-${type}`).classList.remove('hidden');

    // Populate dynamic dropdowns
    if (type === 'derived' || type === 'composite') {
        populateDerivedDropdowns(type);
    }

    if (type === 'atomic') title.innerText = "新建原子指标";
    if (type === 'derived') title.innerText = "新建派生指标";
    if (type === 'composite') title.innerText = "新建复合指标";

    openDrawer('indicator-drawer');
}

function editIndicator(type, id) {
    openIndicatorDrawer(type);
    const item = store[type].find(i => i.id === id);
    if (!item) return;

    document.getElementById('drawer-title').innerText = `编辑${type === 'atomic'?'原子':type==='derived'?'派生':'复合'}指标`;
    document.getElementById('edit-indicator-id').value = item.id;
    document.getElementById('input-name').value = item.name;
    // Assuming code exists on all or we handle derived differently
    if (item.code) document.getElementById('input-code').value = item.code;
    
    // Fill specific fields
    if (type === 'atomic') {
        document.getElementById('input-atomic-table').value = item.table;
        document.getElementById('input-atomic-field').value = item.field;
        document.getElementById('input-atomic-agg').value = item.agg;
    } else if (type === 'derived') {
        document.getElementById('input-derived-atom').value = item.atomCode;
        document.getElementById('input-derived-period').value = item.period;
        // Check checkboxes for dims
        item.dims.forEach(dimName => {
            const cb = document.querySelector(`input[name="dim-check"][value="${dimName}"]`);
            if (cb) cb.checked = true;
        });
    } else if (type === 'composite') {
        document.getElementById('input-composite-expr').value = item.expr;
        item.dims.forEach(dimName => {
            const cb = document.querySelector(`input[name="dim-check-comp"][value="${dimName}"]`);
            if (cb) cb.checked = true;
        });
    }
}

function populateDerivedDropdowns(type) {
    // 1. Atom List
    if (type === 'derived') {
        const atomSelect = document.getElementById('input-derived-atom');
        atomSelect.innerHTML = store.atomic.map(a => `<option value="${a.code}">${a.name} (${a.code})</option>`).join('');
    }

    // 2. Dims List (Checkboxes)
    const dimContainer = document.getElementById(type === 'derived' ? 'input-derived-dims' : 'input-composite-dims');
    const checkName = type === 'derived' ? 'dim-check' : 'dim-check-comp';
    
    dimContainer.innerHTML = store.dimensions.map(d => `
        <label style="display:inline-flex; align-items:center; cursor:pointer;">
            <input type="checkbox" name="${checkName}" value="${d.name}" style="margin-right:6px;"> ${d.name}
        </label>
    `).join('');
}

function openDimensionDrawer() {
    openDrawer('dimension-drawer');
}

function openDrawer(id) {
    const drawer = document.getElementById(id);
    drawer.classList.add('active');
    setTimeout(() => {
        drawer.querySelector('.drawer-panel').style.transform = 'translateX(0)';
    }, 10);
}

function closeDrawer(id) {
    const drawer = document.getElementById(id);
    drawer.querySelector('.drawer-panel').style.transform = 'translateX(100%)';
    setTimeout(() => {
        drawer.classList.remove('active');
    }, 300);
}

// --- Saving Logic ---

function saveIndicator() {
    const id = document.getElementById('edit-indicator-id').value;
    const type = document.getElementById('current-indicator-type').value;
    const name = document.getElementById('input-name').value;
    
    if (!name) {
        alert('请输入指标名称');
        return;
    }

    let newItem = {
        id: id ? parseInt(id) : generateId(),
        name: name,
        status: 'online', // Default
        owner: 'Admin' // Default
    };

    if (type === 'atomic') {
        newItem.code = document.getElementById('input-code').value;
        newItem.table = document.getElementById('input-atomic-table').value;
        newItem.field = document.getElementById('input-atomic-field').value;
        newItem.agg = document.getElementById('input-atomic-agg').value;
    } else if (type === 'derived') {
        newItem.atomCode = document.getElementById('input-derived-atom').value;
        newItem.period = document.getElementById('input-derived-period').value;
        newItem.dims = Array.from(document.querySelectorAll('input[name="dim-check"]:checked')).map(cb => cb.value);
    } else if (type === 'composite') {
        newItem.expr = document.getElementById('input-composite-expr').value;
        newItem.dims = Array.from(document.querySelectorAll('input[name="dim-check-comp"]:checked')).map(cb => cb.value);
    }

    // Update or Add
    if (id) {
        const index = store[type].findIndex(i => i.id == id);
        if (index !== -1) {
            store[type][index] = { ...store[type][index], ...newItem };
        }
    } else {
        store[type].push(newItem);
    }

    closeDrawer('indicator-drawer');
    refreshAll();
}

function saveDimension() {
    const name = document.getElementById('dim-name').value;
    const code = document.getElementById('dim-code').value;
    const type = document.getElementById('dim-type').value;
    const table = document.getElementById('dim-table').value;

    if (!name || !code) {
        alert("请填写完整信息");
        return;
    }

    store.dimensions.push({
        id: generateId(),
        name, code, type, table
    });

    closeDrawer('dimension-drawer');
    renderDimensions();
}
