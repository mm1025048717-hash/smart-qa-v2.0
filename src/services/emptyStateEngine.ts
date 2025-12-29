/**
 * 空状态判断引擎
 * 根据查询结果和上下文，判断空数据的原因并返回对应的显示方案
 */

export type EmptyStateReason = 
  | 'no-data'              // 完全无数据
  | 'query-error'          // 查询条件错误
  | 'connection-failed'    // 数据源连接失败
  | 'permission-denied'    // 权限不足
  | 'data-format-error';   // 数据格式错误

export interface EmptyStateConfig {
  reason: EmptyStateReason;
  message: string;
  suggestions: string[];
  showActions: boolean;
  actionButtons?: {
    primary?: { label: string; action: 'modify-query' | 'refresh' | 'contact-admin' | 'check-connection' };
    secondary?: { label: string; action: 'modify-query' | 'refresh' | 'contact-admin' | 'check-connection' };
  };
  icon?: 'info' | 'warning' | 'error' | 'lock';
}

/**
 * 判断空数据的原因
 */
export function determineEmptyStateReason(
  _data: any,
  queryContext?: {
    timeRange?: { start?: Date; end?: Date };
    filters?: any;
    error?: { type?: string; message?: string };
  }
): EmptyStateConfig {
  // 检查是否有错误信息
  if (queryContext?.error) {
    const errorType = queryContext.error.type?.toLowerCase() || '';
    const errorMessage = queryContext.error.message?.toLowerCase() || '';
    
    // 连接失败
    if (errorType.includes('connection') || errorType.includes('network') || 
        errorMessage.includes('连接') || errorMessage.includes('network')) {
      return {
        reason: 'connection-failed',
        message: '数据源连接失败',
        suggestions: [
          '检查网络连接是否正常',
          '确认数据源服务是否运行',
          '联系技术支持'
        ],
        showActions: true,
        actionButtons: {
          primary: { label: '重试连接', action: 'refresh' },
          secondary: { label: '检查连接', action: 'check-connection' }
        },
        icon: 'error'
      };
    }
    
    // 权限不足
    if (errorType.includes('permission') || errorType.includes('unauthorized') ||
        errorMessage.includes('权限') || errorMessage.includes('permission')) {
      return {
        reason: 'permission-denied',
        message: '暂无数据访问权限',
        suggestions: [
          '联系管理员申请数据访问权限',
          '检查当前账号权限设置',
          '查看权限说明文档'
        ],
        showActions: true,
        actionButtons: {
          primary: { label: '联系管理员', action: 'contact-admin' },
          secondary: { label: '查看权限说明', action: 'modify-query' }
        },
        icon: 'lock'
      };
    }
    
    // 数据格式错误
    if (errorType.includes('format') || errorType.includes('parse') ||
        errorMessage.includes('格式') || errorMessage.includes('format')) {
      return {
        reason: 'data-format-error',
        message: '数据格式错误',
        suggestions: [
          '检查数据源格式是否正确',
          '联系管理员确认数据格式',
          '尝试刷新数据'
        ],
        showActions: true,
        actionButtons: {
          primary: { label: '刷新数据', action: 'refresh' },
          secondary: { label: '检查连接', action: 'check-connection' }
        },
        icon: 'error'
      };
    }
  }
  
  // 检查查询条件是否可能有问题
  if (queryContext?.timeRange) {
    const { start, end } = queryContext.timeRange;
    if (start && end) {
      // 检查时间范围是否在未来
      const now = new Date();
      if (start > now || end > now) {
        return {
          reason: 'query-error',
          message: '查询条件可能有误',
          suggestions: [
            `时间范围：${start.toLocaleDateString('zh-CN')} 至 ${end.toLocaleDateString('zh-CN')}`,
            '请选择有效的时间范围',
            '建议使用默认时间范围'
          ],
          showActions: true,
          actionButtons: {
            primary: { label: '修正查询条件', action: 'modify-query' },
            secondary: { label: '使用默认时间范围', action: 'modify-query' }
          },
          icon: 'warning'
        };
      }
      
      // 检查时间范围是否过于久远
      const yearsDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (yearsDiff > 10) {
        return {
          reason: 'query-error',
          message: '查询时间范围过大',
          suggestions: [
            '建议缩小查询时间范围',
            '时间范围过大可能导致查询超时',
            '建议查询最近1-2年的数据'
          ],
          showActions: true,
          actionButtons: {
            primary: { label: '修正查询条件', action: 'modify-query' },
            secondary: { label: '刷新数据', action: 'refresh' }
          },
          icon: 'warning'
        };
      }
    }
  }
  
  // 默认：完全无数据
  return {
    reason: 'no-data',
    message: '暂无数据',
    suggestions: [
      '调整查询时间范围',
      '检查数据源连接',
      '联系管理员确认数据权限'
    ],
    showActions: true,
    actionButtons: {
      primary: { label: '修改查询条件', action: 'modify-query' },
      secondary: { label: '刷新数据', action: 'refresh' }
    },
    icon: 'info'
  };
}

