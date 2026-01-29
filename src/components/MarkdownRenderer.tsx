/**
 * Markdown 渲染器 - 顶级美学设计
 * 支持表格、列表、加粗、引用、代码块、实时图表、可点击的员工名字等
 */

import React, { useContext, createContext } from 'react';
import clsx from 'clsx';
// 移除图标导入，不再使用图标
import { LineChartComponent, BarChartComponent, PieChartComponent } from './Charts';

// 员工名字列表 - 用于点击切换功能
const AGENT_NAMES = [
  'Alisa', 'alisa', 'Nora', 'nora', '归因哥', '可视化小王', '小王',
  'Emily', 'emily', 'Lisa', 'lisa', '预测君', 'Kevin', 'kevin',
  '运营小美', '小美', '数据卫士', '福尔摩斯', '水晶球大师', 'Excel忍者',
  '焦虑分析师', 'Chill哥', 'MC数据', '时光旅人', '数据大厨', '数据八卦王',
  '百胜专家', '百胜', // 添加百胜专家相关名称
];

// 创建 Context 传递 onAgentSwitch 回调
const AgentSwitchContext = createContext<((name: string) => void) | undefined>(undefined);

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onAgentSwitch?: (agentName: string) => void;
}

// 解析并渲染Markdown表格
const parseTable = (content: string): { headers: string[]; rows: string[][] } | null => {
  const lines = content.trim().split('\n');
  if (lines.length < 3) return null;
  
  const headerLine = lines[0];
  const separatorLine = lines[1];
  
  if (!headerLine.includes('|') || !separatorLine.match(/^\|?[\s\-:|]+\|?$/)) {
    return null;
  }
  
  const parseRow = (line: string) => 
    line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
  
  const headers = parseRow(headerLine);
  const rows = lines.slice(2).map(parseRow).filter(row => row.length > 0);
  
  return { headers, rows };
};

// 表格组件 - 蓝白配色，专业简洁
const TableRenderer = ({ headers, rows }: { headers: string[]; rows: string[][] }) => {
  return (
    <div className="overflow-x-auto rounded-lg my-4 border border-[#E5E5EA]">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="bg-[#1a73e8] text-white">
            {headers.map((header, i) => (
              <th 
                key={i} 
                className="px-5 py-3 text-left font-medium first:rounded-tl-lg last:rounded-tr-lg"
              >
                {renderInlineMarkdown(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8E8ED]">
          {rows.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'} hover:bg-[#EFF6FF] transition-colors duration-150`}
            >
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className="px-5 py-3 text-[#374151] leading-relaxed"
                >
                  {renderInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 可点击的员工名字组件 - 点击可切换到对应员工
const AgentNameChip = ({ name }: { name: string }) => {
  const onAgentSwitch = useContext(AgentSwitchContext);
  
  if (!onAgentSwitch) {
    // 没有回调时，只显示普通加粗文本
    return <strong className="font-semibold text-[#1d1d1f]">{name}</strong>;
  }
  
  return (
    <button
      onClick={() => onAgentSwitch(name)}
      className="inline-flex items-center px-2 py-0.5 bg-[#E8F3FF] text-[#007AFF] text-[13px] font-semibold rounded hover:bg-[#007AFF] hover:text-white transition-all cursor-pointer border-0 align-middle mx-0.5"
      title={`点击切换到 ${name}`}
    >
      {name}
    </button>
  );
};

// 渲染内联Markdown（粗体、百分比、员工名字等）
const renderInlineMarkdown = (text: string | unknown): React.ReactNode => {
  // 确保 text 是字符串，处理可能的对象
  let textStr: string;
  if (typeof text === 'string') {
    textStr = text;
  } else if (text && typeof text === 'object') {
    textStr = JSON.stringify(text);
  } else {
    textStr = String(text || '');
  }
  
  // 清理 [object Object] 字符串
  const cleanedText = textStr.replace(/\[object Object\]/g, '').trim();
  if (!cleanedText) return null;
  
  // 处理加粗、换行和标题格式
  // 保留**加粗**格式用于渲染，但不在文本中显示**符号
  let cleaned = cleanedText.replace(/<br\s*\/?>/gi, '\n'); // 将 <br> 转换为换行
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, ''); // 移除Markdown标题格式（####, ###等）
  cleaned = cleaned.replace(/^#{1,6}\s*\*\*/gm, ''); // 移除带**的标题格式
  // 移除单独成行的 ** 符号（整行只有**或**前后只有空白）
  cleaned = cleaned.replace(/^\s*\*\*\s*$/gm, ''); // 移除单独成行的**
  
  // 直接渲染清理后的文本（加粗会在renderAllInlineElements中处理）
  return renderAllInlineElements(cleaned, 0);
};

// 统一处理所有内联元素：链接 -> 百分比 -> 员工名字（避免递归）
const renderAllInlineElements = (text: string, baseKey: number): React.ReactNode => {
  const elements: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  
  // 找到所有需要特殊处理的元素位置
  const matches: Array<{ 
    type: 'bold' | 'highlight' | 'link' | 'percent' | 'agent'; 
    index: number; 
    endIndex: number; 
    data: any;
  }> = [];
  
  // 0. 查找加粗文本 **文本**
  const boldPattern = /\*\*([^*]+)\*\*/g;
  let boldMatch: RegExpExecArray | null;
  while ((boldMatch = boldPattern.exec(remaining)) !== null) {
    matches.push({
      type: 'bold',
      index: boldMatch.index,
      endIndex: boldMatch.index + boldMatch[0].length,
      data: { text: boldMatch[1] }
    });
  }
  
  // 1. 查找重点标注 【】或「」
  const highlightPattern = /[【「]([^】」]+)[」】]/g;
  let highlightMatch: RegExpExecArray | null;
  while ((highlightMatch = highlightPattern.exec(remaining)) !== null) {
    // 检查是否在加粗内部
    const inBold = matches.some(m => m.type === 'bold' && highlightMatch!.index >= m.index && highlightMatch!.index < m.endIndex);
    if (!inBold) {
      matches.push({
        type: 'highlight',
        index: highlightMatch.index,
        endIndex: highlightMatch.index + highlightMatch[0].length,
        data: { text: highlightMatch[1] }
      });
    }
  }
  
  // 2. 查找所有链接 [文本](URL)
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkPattern.exec(remaining)) !== null) {
    matches.push({
      type: 'link',
      index: linkMatch.index,
      endIndex: linkMatch.index + linkMatch[0].length,
      data: { text: linkMatch[1], url: linkMatch[2] }
    });
  }
  
  // 3. 查找所有百分比（不在其他元素内的）
  const percentPattern = /([~+-]?\d+\.?\d*%)/g;
  let percentMatch: RegExpExecArray | null;
  while ((percentMatch = percentPattern.exec(remaining)) !== null) {
    // 检查是否在其他元素内部
    const inOther = matches.some(m => percentMatch!.index >= m.index && percentMatch!.index < m.endIndex);
    if (!inOther) {
      matches.push({
        type: 'percent',
        index: percentMatch.index,
        endIndex: percentMatch.index + percentMatch[0].length,
        data: { value: percentMatch[1] }
      });
    }
  }
  
  // 4. 查找员工名字 - 可点击切换
  const sortedAgentNames = [...AGENT_NAMES].sort((a, b) => b.length - a.length);
  const agentPattern = new RegExp(`(${sortedAgentNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  let agentMatch: RegExpExecArray | null;
  agentPattern.lastIndex = 0;
  while ((agentMatch = agentPattern.exec(remaining)) !== null) {
    const match = agentMatch;
    const inOther = matches.some(m => match.index >= m.index && match.index < m.endIndex);
    if (!inOther) {
      const agentEndIndex = match.index + match[0].length;
      const overlaps = matches.some(m => 
        m.type === 'agent' && 
        ((match.index >= m.index && match.index < m.endIndex) ||
         (m.index >= match.index && m.index < agentEndIndex))
      );
      if (!overlaps) {
        matches.push({
          type: 'agent',
          index: match.index,
          endIndex: agentEndIndex,
          data: { name: match[1] }
        });
      }
    }
  }
  
  // 按位置排序
  matches.sort((a, b) => a.index - b.index);
  
  // 渲染所有元素
  let lastIndex = 0;
  for (const match of matches) {
    // 添加匹配前的普通文本
    if (match.index > lastIndex) {
      let plainText = remaining.slice(lastIndex, match.index);
      // 移除单独的 ** 符号（但保留成对的 **text**）
      // 先标记所有成对的 **text**，然后移除剩余的单独 **
      plainText = plainText.replace(/\*\*([^*]+)\*\*/g, (_, content) => {
        // 保留成对的，用占位符标记
        return `__BOLD_START__${content}__BOLD_END__`;
      });
      // 移除所有剩余的单独 **
      plainText = plainText.replace(/\*\*/g, '');
      // 恢复成对的加粗标记
      plainText = plainText.replace(/__BOLD_START__/g, '**').replace(/__BOLD_END__/g, '**');
      
      if (plainText) {
        elements.push(
          <React.Fragment key={`${baseKey}-text-${key++}`}>
            {plainText}
          </React.Fragment>
        );
      }
    }
    
    // 渲染匹配的元素
    if (match.type === 'bold') {
      // 加粗文本：使用font-weight: bold
      elements.push(
        <strong
          key={`${baseKey}-bold-${key++}`}
          className="font-semibold text-[#1d1d1f]"
        >
          {match.data.text}
        </strong>
      );
    } else if (match.type === 'highlight') {
      // 重点标注：使用蓝色背景高亮
      elements.push(
        <span
          key={`${baseKey}-highlight-${key++}`}
          className="bg-[#E8F3FF] text-[#007AFF] px-1.5 py-0.5 rounded font-medium"
        >
          {match.data.text}
        </span>
      );
    } else if (match.type === 'link') {
      elements.push(
        <a
          key={`${baseKey}-link-${key++}`}
          href={match.data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#007AFF] hover:text-[#0066CC] underline decoration-1 underline-offset-2 transition-colors"
        >
          {match.data.text}
        </a>
      );
    } else if (match.type === 'percent') {
      let percent = match.data.value;
      const hasTilde = percent.startsWith('~');
      if (hasTilde) {
        percent = percent.slice(1);
      }
      
      const isPositive = percent.startsWith('+') || hasTilde || (!percent.startsWith('-') && parseFloat(percent) > 0);
      const isNegative = percent.startsWith('-');
      
      if (isPositive || isNegative) {
        elements.push(
          <span 
            key={`${baseKey}-percent-${key++}`}
            className={clsx(
              'inline-flex items-center font-semibold text-[13px] tracking-tight',
              isPositive ? 'text-[#34C759]' : 'text-[#FF3B30]'
            )}
          >
            {percent}
          </span>
        );
      } else {
        elements.push(
          <span key={`${baseKey}-percent-${key++}`} className="font-semibold text-[#1d1d1f] text-[13px] tracking-tight">
            {percent}
          </span>
        );
      }
    } else if (match.type === 'agent') {
      elements.push(
        <AgentNameChip key={`${baseKey}-agent-${key++}`} name={match.data.name} />
      );
    }
    
    lastIndex = match.endIndex;
  }
  
  // 添加剩余文本（处理换行和单独的**符号）
  if (lastIndex < remaining.length) {
    let plainText = remaining.slice(lastIndex);
    // 移除单独的 ** 符号（但保留成对的 **text**）
    plainText = plainText.replace(/\*\*([^*]+)\*\*/g, (_, content) => {
      return `__BOLD_START__${content}__BOLD_END__`;
    });
    plainText = plainText.replace(/\*\*/g, '');
    plainText = plainText.replace(/__BOLD_START__/g, '**').replace(/__BOLD_END__/g, '**');
    
    if (plainText) {
      // 处理换行：将\n转换为<br>
      const lines = plainText.split('\n');
      lines.forEach((line, lineIndex) => {
        if (lineIndex > 0) {
          // 添加换行
          elements.push(<br key={`${baseKey}-br-${key++}`} />);
        }
        if (line) {
          elements.push(
            <React.Fragment key={`${baseKey}-text-${key++}`}>
              {line}
            </React.Fragment>
          );
        }
      });
    }
  }
  
  return elements.length > 0 ? elements : text;
};


// 列表项类型（支持嵌套）
type ListItem = {
  content: string;
  level: number; // 缩进级别，0为顶级
};

// 解析内容块类型
type ContentBlock = 
  | { type: 'paragraph'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'list'; items: ListItem[]; ordered: boolean }
  | { type: 'heading'; level: number; content: string }
  | { type: 'code'; language: string; content: string }
  | { type: 'quote'; content: string; variant?: 'info' | 'tip' | 'warning' | 'success' }
  | { type: 'divider' }
  | { type: 'checklist'; items: { checked: boolean; content: string }[] }
  | { type: 'step-flow'; steps: { title: string; content: string }[] };

const parseContent = (content: string): ContentBlock[] => {
  const blocks: ContentBlock[] = [];
  const lines = content.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      i++;
      continue;
    }
    
    // 代码块
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: 'code', language, content: codeLines.join('\n') });
      continue;
    }
    
    // 引用块
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      const quoteContent = quoteLines.join(' ');
      
      // 检测引用类型（不使用emoji，只根据文字内容判断）
      let variant: 'info' | 'tip' | 'warning' | 'success' = 'info';
      if (quoteContent.includes('建议') || quoteContent.includes('提示')) {
        variant = 'tip';
      } else if (quoteContent.includes('警告') || quoteContent.includes('注意') || quoteContent.includes('风险')) {
        variant = 'warning';
      } else if (quoteContent.includes('成功') || quoteContent.includes('完成')) {
        variant = 'success';
      }
      
      blocks.push({ type: 'quote', content: quoteContent, variant });
      continue;
    }
    
    // 标题 - 正确解析标题层级
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length; // # 的数量就是层级
      let content = headingMatch[2];
      // 清理标题中的**符号，但保留加粗效果
      content = content.replace(/\*\*/g, '').trim();
      // 正确添加为heading类型
      blocks.push({ type: 'heading', level, content });
      i++;
      continue;
    }
    
    // 分割线
    if (trimmed.match(/^[-=━]{3,}$/)) {
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }
    
    // 表格
    if (trimmed.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^\|?[\s\-:|]+\|?$/)) {
      let endIdx = i + 2;
      while (endIdx < lines.length && lines[endIdx].includes('|')) {
        endIdx++;
      }
      const tableContent = lines.slice(i, endIdx).join('\n');
      const table = parseTable(tableContent);
      if (table) {
        blocks.push({ type: 'table', ...table });
        i = endIdx;
        continue;
      }
    }
    
    // 检查清单格式 -[ ] 或 -[x] 或 -[X]
    if (trimmed.match(/^-\s*\[([ xX])\]\s/)) {
      const checklistItems: { checked: boolean; content: string }[] = [];
      
      while (i < lines.length) {
        const listLine = lines[i].trim();
        const checklistMatch = listLine.match(/^-\s*\[([ xX])\]\s+(.+)$/);
        if (checklistMatch) {
          checklistItems.push({
            checked: checklistMatch[1].toLowerCase() === 'x',
            content: checklistMatch[2],
          });
          i++;
        } else if (listLine === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      
      if (checklistItems.length > 0) {
        blocks.push({ type: 'checklist', items: checklistItems });
        continue;
      }
    }
    
    // 步骤流程格式 - 检测 "Point X:" 或 "步骤X:" 或 "第X步:" 等格式
    // 也支持直接的关键词如 "实体抽取:"、"SQL生成:" 等
    const stepPattern = /^(?:Point\s*\d+|步骤\s*\d+|第\s*[一二三四五六七八九十\d]+\s*[步点项]|实体抽取|SQL生成|质量保障|语法验证|语义验证|性能验证|安全验证|权限验证)[:：]\s*(.+)$/i;
    if (stepPattern.test(trimmed)) {
      const steps: { title: string; content: string }[] = [];
      let currentStep: { title: string; content: string } | null = null;
      
      while (i < lines.length) {
        const line = lines[i].trim();
        const stepMatch = line.match(stepPattern);
        
        if (stepMatch) {
          // 保存上一个步骤
          if (currentStep) {
            steps.push(currentStep);
          }
          // 开始新步骤 - 提取标题和内容
          const parts = line.split(/[:：]/);
          const title = parts[0].trim();
          const content = parts.slice(1).join(':').trim();
          currentStep = {
            title: title,
            content: content || '',
          };
          i++;
        } else if (line === '') {
          // 空行，结束当前步骤组
          if (currentStep) {
            steps.push(currentStep);
            currentStep = null;
          }
          // 如果已经有步骤了，结束解析
          if (steps.length > 0) {
            i++;
            break;
          }
          i++;
        } else if (currentStep) {
          // 续行内容（可能是SQL代码或多行描述）
          if (line.startsWith('```') || line.match(/^[A-Z]+\s+/)) {
            // 可能是代码块或SQL，追加到内容
            currentStep.content += '\n' + line;
          } else {
            currentStep.content += ' ' + line;
          }
          i++;
        } else {
          // 不是步骤格式，结束
          break;
        }
      }
      
      // 保存最后一个步骤
      if (currentStep) {
        steps.push(currentStep);
      }
      
      if (steps.length > 0) {
        blocks.push({ type: 'step-flow', steps });
        continue;
      }
    }
    
    // 列表（支持嵌套缩进）
    if (trimmed.match(/^[•\-\*]\s/) || trimmed.match(/^\d+\.\s/)) {
      const items: ListItem[] = [];
      const ordered = !!trimmed.match(/^\d+\.\s/);
      
      while (i < lines.length) {
        const originalLine = lines[i];
        const listLine = originalLine.trim();
        
        // 检查是否是列表项
        const listMatch = listLine.match(/^([•\-\*]|\d+\.)\s+(.+)$/);
        if (listMatch) {
          // 计算缩进级别（通过原始行的前导空格/制表符）
          const leadingSpaces = originalLine.match(/^(\s*)/)?.[1] || '';
          // 计算缩进：制表符=1级，每2个空格=1级，每4个空格=1级（兼容不同格式）
          const tabs = (leadingSpaces.match(/\t/g) || []).length;
          const spaces = leadingSpaces.replace(/\t/g, '').length;
          // 优先使用制表符，否则使用空格（每2-4个空格为1级）
          const level = tabs > 0 ? tabs : Math.floor(spaces / 2);
          
          items.push({
            content: listMatch[2],
            level: level,
          });
          i++;
        } else if (listLine === '') {
          i++;
          break;
        } else {
          // 可能是续行内容，追加到上一个列表项
          if (items.length > 0) {
            items[items.length - 1].content += ' ' + listLine;
          }
          i++;
        }
      }
      
      blocks.push({ type: 'list', items, ordered });
      continue;
    }
    
    // 普通段落
    let paragraph = trimmed;
    i++;
    while (i < lines.length) {
      const nextLine = lines[i].trim();
      if (!nextLine || nextLine.startsWith('#') || nextLine.startsWith('```') ||
          nextLine.startsWith('>') ||
          nextLine.match(/^[-=━]{3,}$/) || nextLine.includes('|') || 
          nextLine.match(/^[•\-\*]\s/) || nextLine.match(/^\d+\.\s/)) {
        break;
      }
      // 清理 [object Object]
      const cleanedLine = nextLine.replace(/\[object Object\]/g, '').trim();
      if (cleanedLine) {
        paragraph += ' ' + cleanedLine;
      }
      i++;
    }
    
    // 清理整个段落中的 [object Object]
    const cleanedParagraph = paragraph.replace(/\[object Object\]/g, '').trim();
    if (cleanedParagraph) {
      blocks.push({ type: 'paragraph', content: cleanedParagraph });
    }
  }
  
  return blocks;
};

// 列表渲染组件 - 支持嵌套缩进，移除emoji
const ListRenderer = ({ items, ordered }: { items: ListItem[]; ordered: boolean }) => {
  // 计算每个层级的计数器（用于有序列表）
  const levelCounters: Record<number, number> = {};
  
  return (
    <div className="space-y-2 my-4 pl-4">
      {items.map((item, index) => {
        // 确保 content 是字符串，清理 [object Object] 和 emoji
        let itemStr: string;
        if (typeof item.content === 'string') {
          itemStr = item.content;
        } else if (item.content && typeof item.content === 'object') {
          itemStr = JSON.stringify(item.content);
        } else {
          itemStr = String(item.content || '');
        }
        itemStr = itemStr.replace(/\[object Object\]/g, '').trim();
        // 移除emoji
        itemStr = itemStr.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
        
        if (!itemStr) return null;
        
        const level = item.level || 0;
        const indent = level * 24; // 每级缩进24px
        
        // 更新当前层级的计数器
        if (ordered) {
          if (!levelCounters[level]) {
            levelCounters[level] = 0;
          }
          levelCounters[level]++;
        }
        
        return (
          <div 
            key={index} 
            className="flex items-start gap-2.5"
            style={{ marginLeft: `${indent}px` }}
          >
            {ordered ? (
              <span className="flex-shrink-0 w-5 h-5 rounded bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-semibold flex items-center justify-center mt-0.5">
                {levelCounters[level]}
              </span>
            ) : null}
            <div className="text-[14px] text-[#1d1d1f] leading-[1.8] flex-1 break-words overflow-wrap-anywhere max-w-full" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {renderInlineMarkdown(itemStr)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 检查清单组件 - 精美的复选框样式
const ChecklistRenderer = ({ items }: { items: { checked: boolean; content: string }[] }) => {
  return (
    <div className="space-y-3 my-4 bg-white rounded-xl border border-[#E5E5EA] p-4 shadow-sm">
      {items.map((item, index) => {
        const content = item.content.replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, '').trim();
        return (
          <div key={index} className="flex items-start gap-3">
            <div className={clsx(
              "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all",
              item.checked 
                ? "bg-[#007AFF] border-[#007AFF]" 
                : "bg-white border-[#D2D2D7] hover:border-[#007AFF]"
            )}>
              {item.checked && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={clsx(
              "text-[14px] leading-relaxed flex-1",
              item.checked ? "text-[#86868b] line-through" : "text-[#1d1d1f]"
            )}>
              {renderInlineMarkdown(content)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// 步骤流程组件 - 轻量横向流式步骤卡（无动画，提升稳定性与审美）
const StepFlowRenderer = ({ steps }: { steps: { title: string; content: string }[] }) => {
  return (
    <div className="my-4 p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
      <div className="flex flex-wrap items-stretch gap-3">
      {steps.map((step, index) => {
        const title = step.title.replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, '').trim();
        let content = step.content.replace(/^\*\*\s*/, '').replace(/\s*\*\*$/, '').trim();
        
        const hasSQL = content.includes('WITH') || content.includes('SELECT') || content.includes('FROM');
        const isSQLBlock = content.split('\n').length > 3 && hasSQL;
        
        return (
            <React.Fragment key={index}>
              <div className="flex items-start gap-3 px-3 py-2 bg-[#F8FAFF] rounded-xl border border-[#E5E7EB] shadow-[0_6px_18px_rgba(15,23,42,0.05)] min-w-[200px] max-w-full">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E5EDFF] text-[#1D4ED8] flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-[14px] font-semibold text-[#0F172A] leading-snug">
                  {title}
                  </div>
                {isSQLBlock ? (
                    <div className="mt-1">
                    <CodeBlock language="sql" content={content} />
                  </div>
                ) : (
                    <div className="text-[13px] text-[#475467] leading-relaxed">
                    {renderInlineMarkdown(content)}
                  </div>
                )}
              </div>
            </div>

              {index < steps.length - 1 && (
                <div className="flex items-center justify-center px-1">
                  <div className="w-6 h-[2px] bg-[#E5E7EB] rounded-full" />
                </div>
              )}
            </React.Fragment>
        );
      })}
      </div>
    </div>
  );
};

// 代码块组件 - 深色主题，改进SQL展示
const CodeBlock = ({ language, content }: { language: string; content: string }) => {
  const isMermaid = language.toLowerCase() === 'mermaid';
  const isSQL = language.toLowerCase() === 'sql';
  
  // Mermaid代码块不显示，提示AI使用[chart:...]格式
  if (isMermaid) {
    return null; // 直接隐藏，不显示任何内容
  }
  
  // 如果是 data 类型的代码块，尝试解析为图表
  if (language.toLowerCase() === 'data' || language.toLowerCase() === 'chart') {
    try {
      // 尝试解析 JSON 数据并渲染图表
      const jsonData = JSON.parse(content);
      if (jsonData.type && jsonData.data) {
        if (jsonData.type === 'line') {
          return (
            <div className="my-4">
              <LineChartComponent
                data={jsonData.data}
                xKey={jsonData.xKey || 'name'}
                yKeys={jsonData.yKeys || [{ key: 'value', name: '数值', color: '#007AFF' }]}
                title={jsonData.title}
                showArea={jsonData.showArea}
              />
            </div>
          );
        } else if (jsonData.type === 'bar') {
          return (
            <div className="my-4">
              <BarChartComponent
                data={jsonData.data}
                xKey={jsonData.xKey || 'name'}
                yKey={jsonData.yKey || 'value'}
                title={jsonData.title}
              />
            </div>
          );
        } else if (jsonData.type === 'pie') {
          return (
            <div className="my-4">
              <PieChartComponent
                data={jsonData.data}
                title={jsonData.title}
              />
            </div>
          );
        }
      }
    } catch {
      // JSON 解析失败，显示为普通代码
    }
  }
  
  // 浅色主题 - 蓝白配色，苹果风格
  return (
    <div className="rounded-xl overflow-hidden bg-white my-4 shadow-sm border border-[#E5E5EA]">
      <div className="px-4 py-2.5 bg-[#F5F5F7] text-[11px] text-[#86868b] font-medium tracking-wider border-b border-[#E5E5EA] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMermaid ? '图表代码 (Mermaid)' : isSQL ? 'SQL 查询' : language || 'code'}
        </div>
        {isSQL && (
          <button 
            className="text-[10px] text-[#007AFF] hover:text-[#0066CC] transition-colors px-2 py-0.5 rounded hover:bg-[#E8F3FF]"
            onClick={() => {
              navigator.clipboard.writeText(content);
            }}
          >
            复制
          </button>
        )}
      </div>
      <pre className="p-4 overflow-x-auto bg-white">
        <code className={clsx(
          "text-[13px] font-mono leading-relaxed whitespace-pre",
          "text-[#1d1d1f]"
        )}>
          {content}
        </code>
      </pre>
    </div>
  );
};

// 引用块组件 - 支持建议标签和图标
const QuoteBlock = ({ content, variant = 'info' }: { content: string; variant?: string }) => {
  const styles: Record<string, { bg: string; border: string; label?: string; icon?: string }> = {
    info: {
      bg: 'bg-[#F0F7FF]',
      border: 'border-l-[#007AFF]',
    },
    tip: {
      bg: 'bg-[#FFFBF0]',
      border: 'border-l-[#FF9500]',
      label: '建议',
      icon: '💡', // 灯泡图标
    },
    warning: {
      bg: 'bg-[#FFF5F5]',
      border: 'border-l-[#FF3B30]',
    },
    success: {
      bg: 'bg-[#F0FFF4]',
      border: 'border-l-[#34C759]',
    },
  };
  
  const style = styles[variant] || styles.info;
  const isSuggestion = variant === 'tip' && (content.includes('建议') || content.includes('推荐'));
  
  return (
    <div className={clsx(
      'rounded-r-lg px-4 py-3 my-4 border-l-4',
      style.bg,
      style.border
    )}>
      {isSuggestion && style.label && (
        <div className="flex items-center gap-1.5 mb-2">
          {style.icon && (
            <span className="text-[14px]">{style.icon}</span>
          )}
          <span className="text-[12px] font-semibold text-[#FF9500] uppercase tracking-wide">
            {style.label}
          </span>
        </div>
      )}
      <span className="text-[14px] text-[#1d1d1f] leading-[1.8] break-words overflow-wrap-anywhere max-w-full" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {renderInlineMarkdown(content)}
      </span>
    </div>
  );
};

// 标题组件 - 清晰的层级区别，移除emoji
const HeadingBlock = ({ level, content }: { level: number; content: string }) => {
  // 移除emoji
  const cleanContent = content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
  
  const styles: Record<number, { className: string; Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }> = {
    1: { 
      className: 'text-[24px] font-bold text-[#1a73e8] mt-8 mb-4 leading-tight tracking-tight pl-1 border-l-4 border-[#1a73e8] pl-3', 
      Tag: 'h1' 
    },
    2: { 
      className: 'text-[20px] font-bold text-[#1a73e8] mt-6 mb-4 leading-tight tracking-tight pl-1 border-l-3 border-[#1a73e8] pl-3', 
      Tag: 'h2' 
    },
    3: { 
      className: 'text-[17px] font-semibold text-[#1a73e8] mt-5 mb-3 leading-snug pl-1', 
      Tag: 'h3' 
    },
    4: { 
      className: 'text-[15px] font-semibold text-[#374151] mt-4 mb-2 leading-snug pl-1', 
      Tag: 'h4' 
    },
    5: { 
      className: 'text-[14px] font-medium text-[#374151] mt-3 mb-2 pl-1', 
      Tag: 'h5' 
    },
    6: { 
      className: 'text-[13px] font-medium text-[#6B7280] mt-2 mb-1 pl-1', 
      Tag: 'h6' 
    },
  };
  
  const style = styles[level] || styles[3];
  const Tag = style.Tag;
  
  return (
    <Tag className={style.className}>
      {renderInlineMarkdown(cleanContent)}
    </Tag>
  );
};

// 主渲染组件
export const MarkdownRenderer = ({ content, className, onAgentSwitch }: MarkdownRendererProps) => {
  const blocks = parseContent(content);
  
  return (
    <AgentSwitchContext.Provider value={onAgentSwitch}>
      <div className={clsx('space-y-2', className)}>
        {blocks.map((block, index) => {
          switch (block.type) {
            case 'heading':
              return <HeadingBlock key={index} level={block.level} content={block.content} />;
            
            case 'code':
              return <CodeBlock key={index} language={block.language} content={block.content} />;
            
            case 'table':
              return <TableRenderer key={index} headers={block.headers} rows={block.rows} />;
            
            case 'list':
              return <ListRenderer key={index} items={block.items} ordered={block.ordered} />;
            
            case 'checklist':
              return <ChecklistRenderer key={index} items={block.items} />;
            
            case 'step-flow':
              return <StepFlowRenderer key={index} steps={block.steps} />;
            
            case 'quote':
              return <QuoteBlock key={index} content={block.content} variant={block.variant} />;
            
            case 'divider':
              return <hr key={index} className="border-t border-[#E8E8ED] my-6" />;
            
            case 'paragraph':
            default:
              // 确保 content 是字符串
              let paragraphContent: string;
              if (typeof block.content === 'string') {
                paragraphContent = block.content;
              } else if (block.content && typeof block.content === 'object') {
                paragraphContent = JSON.stringify(block.content);
              } else {
                paragraphContent = String(block.content || '');
              }
              // 清理 [object Object] 和 emoji
              let cleanedContent = paragraphContent.replace(/\[object Object\]/g, '').trim();
              // 移除常见emoji
              cleanedContent = cleanedContent.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '');
              if (!cleanedContent) return null;
              return (
                <div key={index} className="text-[15px] text-[#374151] leading-[1.9] my-2 pl-1 tracking-[0.02em] whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                  {renderInlineMarkdown(cleanedContent)}
                </div>
              );
          }
        })}
      </div>
    </AgentSwitchContext.Provider>
  );
};

export default MarkdownRenderer;
