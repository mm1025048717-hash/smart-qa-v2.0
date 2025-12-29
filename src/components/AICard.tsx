import { DashboardItem } from '../services/dashboardService';
import { ContentBlock } from '../types';
import { PrimaryKPICard, KPIGroup } from './KPICard';
import { SmartChart } from './Charts';
import { 
  MetricsPreviewCard, 
  RegionCards 
} from './StoryComponents';
import { 
  QnACard, 
  NavCard, 
  CommandCard, 
  WebCard, 
  TextCard, 
  EmptyCard 
} from './FunctionalCards';
import { Trash2, Maximize2, GripVertical, Edit2, Code, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface AICardProps {
  item: DashboardItem;
  onRemove: (id: string) => void;
  onExplore: (item: DashboardItem) => void;
  onEditBlock?: (itemId: string, blockId: string, block: ContentBlock) => void;
  onEditTitle?: (itemId: string, title: string) => void;
  onViewSQL?: (itemId: string) => void;
  onAddToDashboard?: (block: ContentBlock) => void;
  isEditMode?: boolean;
  viewPreferences?: {
    showTitle?: boolean;
    showDataSource?: boolean;
  };
}

export const AICard = ({ 
  item, 
  onRemove, 
  onExplore, 
  onEditBlock, 
  onEditTitle, 
  onViewSQL,
  onAddToDashboard,
  isEditMode = false, 
  viewPreferences = { showTitle: true, showDataSource: false } 
}: AICardProps) => {
  
  const handleEditBlock = (block: ContentBlock) => {
    if (onEditBlock) {
      onEditBlock(item.id, block.id, block);
    }
  };

  // 渲染单个内容块
  const renderContentBlock = (block: ContentBlock) => {
    if (!block || !block.type) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          无效的内容块
        </div>
      );
    }

    try {
      switch (block.type) {
        case 'kpi':
          if (!block.data) return null;
          return <div className="h-full flex items-center"><div className="w-full"><PrimaryKPICard data={block.data as any} blockData={block} onAddToDashboard={onAddToDashboard} /></div></div>;
        
        case 'kpi-group':
          if (!block.data || !Array.isArray(block.data)) return null;
          return <div className="h-full flex items-center"><div className="w-full"><KPIGroup items={block.data as any[]} blockData={block} onAddToDashboard={onAddToDashboard} /></div></div>;
        
        case 'line-chart':
        case 'bar-chart':
        case 'pie-chart':
        case 'year-comparison':
          if (!block.data) return null;
          // 不传 title，避免和卡片标题重复
          const chartData = { ...block.data as any, type: block.type };
          delete chartData.title;
          return <div className="h-full"><SmartChart chartData={chartData} blockData={block} onAddToDashboard={onAddToDashboard} /></div>;
        
        case 'metrics-preview':
          if (!block.data) return null;
          return <MetricsPreviewCard {...block.data as any} />;
        
        case 'region-cards':
          if (!block.data) return null;
          return <RegionCards items={Array.isArray(block.data) ? block.data : [block.data]} delay={0} />;
        
        case 'text':
          return <TextCard data={block.data as string} />;
        
        case 'navigation-bar':
          return <NavCard data={block.data as any} />;
        
        case 'command-card':
          return <CommandCard data={block.data as any} />;
        
        case 'qna':
          return <QnACard data={block.data as any} />;
          
        case 'iframe':
        case 'web':
          return <WebCard data={block.data as any} />;
          
        case 'empty':
          return <EmptyCard />;
        
        case 'rich-text':
          // 暂时使用 TextCard 兼容
          return <TextCard data={typeof block.data === 'string' ? block.data : JSON.stringify(block.data)} />;
          return (
            <div 
              className="text-sm leading-relaxed p-4 rounded-lg border prose prose-sm max-w-none"
              style={{
                backgroundColor: block.style?.backgroundColor || '#FFFFFF',
                borderColor: block.style?.borderColor || '#E5E7EB',
                color: block.style?.textColor || '#111827',
                fontSize: block.style?.fontSize || '14px',
                padding: block.style?.padding || '16px',
                borderRadius: block.style?.borderRadius || '12px',
                lineHeight: block.style?.lineHeight || '1.7',
              }}
            >
              {content.split('\n').map((line: string, i: number) => (
                <p key={i} className="mb-2 last:mb-0">{line || '\u00A0'}</p>
              ))}
            </div>
          );
        
        default:
          // 未知类型 - 显示调试信息
          return (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-xs">
              <div className="font-mono">类型: {block.type}</div>
              <div className="font-mono truncate">数据: {JSON.stringify(block.data).slice(0, 100)}...</div>
            </div>
          );
      }
    } catch (error) {
      console.error('渲染内容块失败:', block, error);
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          渲染失败: {(error as Error).message}
        </div>
      );
    }
  };

  // 检查是否有有效内容
  const hasValidContent = item.content && Array.isArray(item.content) && item.content.length > 0;

  return (
    <div
      className={clsx(
        "group relative flex flex-col transition-all duration-300 h-full",
        "w-full min-w-0 bg-white rounded-xl",
        isEditMode 
          ? "border-[#1664FF] border-2" 
          : "border-transparent"
      )}
    >
      {/* 顶栏标题 */}
      <div 
      className={clsx(
        "px-4 py-3 flex items-center justify-between flex-shrink-0 z-20 border-b",
        isEditMode ? "bg-[#F5F9FF] border-[#E8F0FF]" : "bg-white border-[#E8F0FF]/50"
      )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {viewPreferences.showTitle !== false && (
            <h3 className="font-semibold text-[14px] text-[#1D2129] truncate">
              {item.title || '数据卡片'}
            </h3>
          )}
        </div>
      
        {/* 工具栏：仅在悬停或编辑模式显示 */}
        <div className={clsx(
          "ai-card-toolbar flex items-center gap-1 transition-opacity",
          isEditMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {onEditTitle && (
            <button 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEditTitle(item.id, item.title); }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#1664FF] hover:bg-gray-50 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onExplore(item); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#1664FF] hover:bg-gray-50 transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {isEditMode && (
            <button 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-h-0 p-4 relative overflow-auto">
        {hasValidContent ? (
          <div className="h-full w-full">
            {item.content.map((block, index) => (
              <div 
                key={block.id || `block-${index}`} 
                className="relative group/block h-full w-full"
              >
                {renderContentBlock(block)}
                
                {isEditMode && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditBlock(block); }}
                    className="absolute top-2 right-2 opacity-0 group-hover/block:opacity-100 transition-opacity p-1.5 bg-white border border-[#E8F0FF] rounded-lg shadow-sm z-10 hover:border-[#1664FF]/30"
                  >
                    <Edit2 className="w-3 h-3 text-[#86909C] hover:text-[#1664FF]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#86909C] border border-dashed border-[#E8F0FF] rounded-xl bg-[#F5F9FF]/30">
            <p className="text-xs">无数据展示</p>
          </div>
        )}
      </div>

      {/* 隐藏式摘要 - 只有非常精简的商用样式 */}
      {item.summary && viewPreferences.showDataSource && (
        <div className="px-4 py-2 border-t border-gray-50 flex-shrink-0">
          <p className="text-[10px] text-gray-400 leading-normal">
            {item.summary}
          </p>
        </div>
      )}
    </div>
  );
};
