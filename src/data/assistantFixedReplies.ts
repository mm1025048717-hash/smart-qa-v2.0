/**
 * 小助手固定回复配置 - 底部快捷按钮的文案与行为
 * 在此设定「固定回复」：可增删改条目，type 为 fill 时填入输入框，为 action 时执行对应操作
 */

export type FixedReplyActionId = 'help_doc' | 'screenshot' | 'ticket' | 'guide';

export type FixedReplyIconId = 'zap' | 'book' | 'file' | 'camera' | 'headset' | 'sparkles';

export interface FixedReplyItem {
  id: string;
  label: string;
  icon: FixedReplyIconId;
  /** fill：将 phrase 填入输入框，用户可编辑后发送；action：直接执行操作 */
  type: 'fill' | 'action';
  /** type 为 fill 时使用的固定文案 */
  phrase?: string;
  /** type 为 action 时的操作标识，由组件内部映射到具体回调 */
  action?: FixedReplyActionId;
}

/** 默认固定回复列表 - 可在此增删改 */
export const ASSISTANT_FIXED_REPLIES: FixedReplyItem[] = [
  { id: 'deep-search', label: '深度检索', icon: 'zap', type: 'fill', phrase: '如何配置数据源？' },
  { id: 'user-manual', label: '用户手册', icon: 'book', type: 'fill', phrase: '用户手册里有哪些功能？' },
  { id: 'help-doc', label: '帮助文档', icon: 'file', type: 'action', action: 'help_doc' },
  { id: 'screenshot', label: '截图上报', icon: 'camera', type: 'action', action: 'screenshot' },
  { id: 'ticket', label: '转人工', icon: 'headset', type: 'action', action: 'ticket' },
  { id: 'guide', label: '重新引导', icon: 'sparkles', type: 'action', action: 'guide' },
];
