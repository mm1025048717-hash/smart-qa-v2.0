/**
 * 数据源配置页 - PRD F.2.4 Lazy Load A
 * 建立连接：接入 Doris/MySQL，支持 SSH 隧道
 */

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
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
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#007AFF] text-white rounded-xl text-sm font-medium hover:bg-[#0051D5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建连接
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-6">
        <p className="text-[#86909C] text-sm mb-6">
          第一步：建立连接。接入 Doris / MySQL，支持 SSH 隧道。
        </p>

        {/* 连接列表 */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
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
                <div>
                  <label className="block text-sm font-medium text-[#4E5969] mb-1">连接名称</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="如：生产 Doris"
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] focus:border-[#007AFF] outline-none"
                  />
                </div>
                <div>
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
                <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-[#4E5969] mb-1">数据库名</label>
                  <input
                    type="text"
                    value={form.database}
                    onChange={(e) => setForm((f) => ({ ...f, database: e.target.value }))}
                    placeholder="可选"
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#007AFF] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                <label className="flex items-center gap-2 cursor-pointer">
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
                <div className="flex justify-end gap-3 pt-4">
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
        )}
      </main>
    </div>
  );
}
