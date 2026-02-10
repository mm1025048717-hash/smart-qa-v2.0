/**
 * 数据源配置页 - PRD F.2.4 Lazy Load A
 * 建立连接：接入 Doris/MySQL，支持 SSH 隧道
 */

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import { DataPageSpotlight } from '../components/DataPageSpotlight';

interface DataConnection {
  id: string;
  name: string;
  type: 'doris' | 'mysql';
  host: string;
  port: number;
  database: string;
  sshTunnel: boolean;
  status: 'connected' | 'disconnected' | 'error';
  updatedAt: string;
}

const MOCK_CONNECTIONS: DataConnection[] = [
  {
    id: '1',
    name: '生产 Doris',
    type: 'doris',
    host: 'doris.example.com',
    port: 9030,
    database: 'bi_warehouse',
    sshTunnel: true,
    status: 'connected',
    updatedAt: '2025-02-05 14:30',
  },
  {
    id: '2',
    name: 'MySQL 业务库',
    type: 'mysql',
    host: '192.168.1.100',
    port: 3306,
    database: 'biz_db',
    sshTunnel: false,
    status: 'connected',
    updatedAt: '2025-02-04 09:00',
  },
];

export default function DataSourceConfigPage() {
  const [connections, setConnections] = useState<DataConnection[]>(MOCK_CONNECTIONS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'mysql' as 'doris' | 'mysql',
    host: '',
    port: 3306,
    database: '',
    user: '',
    password: '',
    sshTunnel: false,
    sshHost: '',
    sshPort: 22,
    sshUser: '',
  });

  const goBack = () => {
    window.history.pushState({}, '', '?page=main');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.host.trim()) return;
    const newConn: DataConnection = {
      id: String(Date.now()),
      name: form.name,
      type: form.type,
      host: form.host,
      port: form.port,
      database: form.database || 'default',
      sshTunnel: form.sshTunnel,
      status: 'connected',
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    setConnections((prev) => [newConn, ...prev]);
    setShowForm(false);
    setForm({ name: '', type: 'mysql', host: '', port: 3306, database: '', user: '', password: '', sshTunnel: false, sshHost: '', sshPort: 22, sshUser: '' });
  };

  const removeConnection = (id: string) => {
    if (confirm('确定要删除该数据源连接吗？')) {
      setConnections((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const storageKey = 'yiwen_spotlight_datasource_v2';
  // 第一次进入时自动显示引导（由 DataPageSpotlight 内部处理）

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <DataPageSpotlight
        storageKey={storageKey}
        steps={[
          {
            target: '[data-tour="datasource-intro"]',
            title: '数据源管理',
            description: '第一步：建立连接。接入 Doris / MySQL 等数据库，支持 SSH 隧道安全连接。下方表格为已配置连接。',
          },
          {
            target: '[data-tour="datasource-new-connection"]',
            title: '新建连接',
            description: '点击此处添加新数据源。填写主机、端口、数据库名与凭证即可完成接入。',
          },
          {
            target: '[data-tour="datasource-table"]',
            title: '连接列表',
            description: '这里展示所有已配置的数据源连接。可以查看连接状态、SSH 隧道配置，点击删除按钮可移除连接。',
          },
        ]}
      />
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-[#4E5969] hover:text-[#1664FF] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>
            <h1 className="text-xl font-semibold text-[#1D1D1F]">数据源管理</h1>
          </div>
          <button
            data-tour="datasource-new-connection"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0051D5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建连接
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-6">
        <p className="text-[#86909C] text-sm mb-6" data-tour="datasource-intro">
          第一步：建立连接。接入 Doris / MySQL，支持 SSH 隧道。
        </p>

        {/* 连接列表 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden" data-tour="datasource-table">
          <table className="w-full">
            <thead className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">名称</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">类型</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">主机</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">数据库</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">SSH 隧道</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-[#86909C]">状态</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-[#86909C]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {connections.map((c) => (
                <tr key={c.id} className="hover:bg-[#F7F8FA]/50">
                  <td className="px-5 py-3">
                    <span className="font-medium text-[#1D1D1F]">{c.name}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-[#4E5969]">{c.type === 'doris' ? 'Doris' : 'MySQL'}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#4E5969]">{c.host}:{c.port}</td>
                  <td className="px-5 py-3 text-sm text-[#4E5969]">{c.database}</td>
                  <td className="px-5 py-3">
                    {c.sshTunnel ? (
                      <span className="text-xs text-[#00B42A]">已开启</span>
                    ) : (
                      <span className="text-xs text-[#86909C]">未使用</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {c.status === 'connected' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#00B42A]">
                        <CheckCircle className="w-3.5 h-3.5" /> 已连接
                      </span>
                    ) : (
                      <span className="text-xs text-[#F53F3F]">未连接</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => removeConnection(c.id)}
                      className="p-2 text-[#86909C] hover:text-[#F53F3F] hover:bg-[#FFECE8] rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 新建连接弹窗 */}
        {showForm && (
          <>
            <DataPageSpotlight
              storageKey="yiwen_spotlight_datasource_newconn_v2"
              steps={[
                { target: '[data-tour="new-conn-name"]', title: '连接名称', description: '为连接起一个易识别的名称，如「生产 Doris」「MySQL 业务库」，便于后续识别和管理。' },
                { target: '[data-tour="new-conn-type"]', title: '数据库类型', description: '选择数据库类型。目前支持 MySQL 和 Doris，后续将支持更多数据源。' },
                { target: '[data-tour="new-conn-host"]', title: '主机与端口', description: '填写数据库主机地址和端口。MySQL 默认 3306，Doris 常用 9030。' },
                { target: '[data-tour="new-conn-database"]', title: '数据库名', description: '填写要连接的数据库名称，Agent 将基于此数据库执行查询。' },
                { target: '[data-tour="new-conn-credentials"]', title: '认证凭证', description: '填写数据库用户名和密码。建议使用只读账号以保证安全。' },
                { target: '[data-tour="new-conn-ssh"]', title: 'SSH 隧道', description: '如数据库在内网，可开启 SSH 隧道通过跳板机安全连接。填写跳板机地址和 SSH 凭证。' },
                { target: '[data-tour="new-conn-save"]', title: '保存连接', description: '填写完成后点击保存，系统会自动测试连接。连接成功后 Agent 即可基于该数据源回答查询。' },
              ]}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
              <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-semibold text-[#1D1D1F]">新建连接</h2>
                  <p className="text-sm text-[#86909C] mt-1">接入 Doris/MySQL，支持 SSH 隧道</p>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                  <div data-tour="new-conn-name">
                    <label className="block text-sm font-medium text-[#4E5969] mb-1">连接名称</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="如：生产 Doris"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-[#007AFF] outline-none"
                    />
                  </div>
                  <div data-tour="new-conn-type">
                    <label className="block text-sm font-medium text-[#4E5969] mb-1">类型</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'doris' | 'mysql' }))}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                    >
                      <option value="mysql">MySQL</option>
                      <option value="doris">Doris</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4" data-tour="new-conn-host">
                    <div>
                      <label className="block text-sm font-medium text-[#4E5969] mb-1">主机</label>
                      <input
                        type="text"
                        value={form.host}
                        onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                        placeholder="hostname 或 IP"
                        className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4E5969] mb-1">端口</label>
                      <input
                        type="number"
                        value={form.port}
                        onChange={(e) => setForm((f) => ({ ...f, port: Number(e.target.value) || 3306 }))}
                        className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                      />
                    </div>
                  </div>
                <div data-tour="new-conn-database">
                  <label className="block text-sm font-medium text-[#4E5969] mb-1">数据库名</label>
                  <input
                    type="text"
                    value={form.database}
                    onChange={(e) => setForm((f) => ({ ...f, database: e.target.value }))}
                    placeholder="可选"
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4" data-tour="new-conn-credentials">
                  <div>
                    <label className="block text-sm font-medium text-[#4E5969] mb-1">用户名</label>
                    <input
                      type="text"
                      value={form.user}
                      onChange={(e) => setForm((f) => ({ ...f, user: e.target.value }))}
                      placeholder="可选（原型)"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4E5969] mb-1">密码</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="可选（原型)"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer" data-tour="new-conn-ssh">
                  <input
                    type="checkbox"
                    checked={form.sshTunnel}
                    onChange={(e) => setForm((f) => ({ ...f, sshTunnel: e.target.checked }))}
                    className="rounded border-[#E5E7EB] text-[#007AFF] focus:ring-[#007AFF]"
                  />
                  <span className="text-sm text-[#4E5969]">使用 SSH 隧道</span>
                </label>
                {form.sshTunnel && (
                  <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-[#E5E7EB]">
                    <div>
                      <label className="block text-sm text-[#86909C] mb-1">SSH 主机</label>
                      <input
                        type="text"
                        value={form.sshHost}
                        onChange={(e) => setForm((f) => ({ ...f, sshHost: e.target.value }))}
                        placeholder="跳板机地址"
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007AFF]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#86909C] mb-1">SSH 端口</label>
                      <input
                        type="number"
                        value={form.sshPort}
                        onChange={(e) => setForm((f) => ({ ...f, sshPort: Number(e.target.value) || 22 }))}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#007AFF]"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4" data-tour="new-conn-save">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 text-[#4E5969] hover:bg-[#F2F3F5] rounded-xl text-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0051D5]"
                  >
                    保存连接
                  </button>
                </div>
              </form>
            </div>
          </div>
          </>
        )}
      </main>
    </div>
  );
}
