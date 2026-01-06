/**
 * 实时解析器 - 在流式输出过程中即时解析图表和表格
 * 实现秒回效果，图表和表格实时渲染
 */

import { parseChartJson } from '../components/Charts';

export interface ParsedChunk {
  text: string;
  charts: Array<{ json: string; data: any; position: number }>;
  tables: Array<{ headers: string[]; rows: string[][]; position: number }>;
  kpis: Array<{ json: string; data: any; position: number }>;
  gantts: Array<{ json: string; data: any; position: number }>;
  thoughtChains: Array<{ json: string; data: any; position: number }>;
  toolCallChains: Array<{ json: string; data: any; position: number }>;
  blocks: Array<{ type: 'text' | 'chart' | 'table' | 'kpi' | 'kpi-group' | 'gantt' | 'thought-chain' | 'tool-call-chain'; position: number; data: any }>;
}

/**
 * 实时解析流式内容，提取图表和表格
 */
export function parseRealtimeContent(content: string): ParsedChunk {
  const result: ParsedChunk = {
    text: content,
    charts: [],
    tables: [],
    kpis: [],
    gantts: [],
    thoughtChains: [],
    toolCallChains: [],
    blocks: [],
  };
  
  // 收集所有内容块，按位置排序
  const allBlocks: Array<{ type: 'text' | 'chart' | 'table' | 'kpi' | 'kpi-group' | 'gantt' | 'thought-chain' | 'tool-call-chain'; position: number; data: any; text?: string }> = [];

  // 1. 提取图表 JSON [chart:{...}] - 支持嵌套对象
  // 支持多种格式：[chart:{...}] 或 [chart: {...}] 或 [chart:{...}]
  const chartPattern = /\[chart:\s*\{/gi;
  let chartMatch;
  const foundCharts = new Set<string>();
  const chartMatches: Array<{ start: number; end: number; json: string }> = [];
  
  // 重置正则的 lastIndex
  chartPattern.lastIndex = 0;
  
  while ((chartMatch = chartPattern.exec(content)) !== null) {
    const startIdx = chartMatch.index + chartMatch[0].length - 1; // 指向第一个 {
    let braceCount = 1;
    let endIdx = startIdx + 1;
    
    // 找到匹配的闭合 }
    while (endIdx < content.length && braceCount > 0) {
      if (content[endIdx] === '{') braceCount++;
      if (content[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    // 检查是否有闭合的 ]，如果没有找到但已经到达文本末尾，也尝试解析
    if (endIdx < content.length && content[endIdx] === ']') {
      const jsonStr = content.slice(startIdx, endIdx);
      if (!foundCharts.has(jsonStr)) {
        foundCharts.add(jsonStr);
        chartMatches.push({
          start: chartMatch.index,
          end: endIdx + 1,
          json: jsonStr,
        });
      }
    } else if (endIdx >= content.length && braceCount === 0) {
      // 如果到达文本末尾但括号已匹配，也尝试解析（可能是流式输出未完成）
      const jsonStr = content.slice(startIdx, endIdx);
      if (!foundCharts.has(jsonStr) && jsonStr.trim().length > 0) {
        foundCharts.add(jsonStr);
        chartMatches.push({
          start: chartMatch.index,
          end: endIdx,
          json: jsonStr,
        });
      }
    }
  }
  
  // 从后往前处理，避免索引偏移问题
  for (let i = chartMatches.length - 1; i >= 0; i--) {
    const match = chartMatches[i];
    try {
      const chartData = parseChartJson(match.json);
      if (chartData) {
        result.charts.push({
          json: match.json,
          data: chartData,
          position: match.start,
        });
        // 添加到blocks中
        allBlocks.push({
          type: 'chart',
          position: match.start,
          data: chartData,
        });
        // 从文本中移除图表标记，避免重复显示
        const fullMatch = content.slice(match.start, match.end);
        result.text = result.text.replace(fullMatch, '');
      } else {
        console.warn('Chart parse returned null for:', match.json);
      }
    } catch (e) {
      console.warn('Chart parse error:', e, 'JSON:', match.json);
    }
  }

  // 2. 提取KPI卡片 [kpi:{...}]
  const kpiPattern = /\[kpi:\s*\{/gi;
  let kpiMatch;
  const foundKpis = new Set<string>();
  const kpiMatches: Array<{ start: number; end: number; json: string }> = [];
  
  kpiPattern.lastIndex = 0;
  
  while ((kpiMatch = kpiPattern.exec(content)) !== null) {
    const startIdx = kpiMatch.index + kpiMatch[0].length - 1; // 指向第一个 {
    let braceCount = 1;
    let endIdx = startIdx + 1;
    
    // 找到匹配的闭合 }
    while (endIdx < content.length && braceCount > 0) {
      if (content[endIdx] === '{') braceCount++;
      if (content[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    // 检查是否有闭合的 ]
    if (endIdx < content.length && content[endIdx] === ']') {
      const jsonStr = content.slice(startIdx, endIdx);
      if (!foundKpis.has(jsonStr)) {
        foundKpis.add(jsonStr);
        kpiMatches.push({
          start: kpiMatch.index,
          end: endIdx + 1,
          json: jsonStr,
        });
      }
    }
  }
  
  // 从后往前处理，避免索引偏移问题
  for (let i = kpiMatches.length - 1; i >= 0; i--) {
    const match = kpiMatches[i];
    try {
      const kpiData = JSON.parse(match.json);
      if (kpiData && kpiData.label !== undefined && kpiData.value !== undefined) {
        // 生成唯一ID
        kpiData.id = kpiData.id || `kpi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        result.kpis.push({
          json: match.json,
          data: kpiData,
          position: match.start,
        });
        // 添加到blocks中
        allBlocks.push({
          type: 'kpi',
          position: match.start,
          data: kpiData,
        });
        // 从文本中移除KPI标记，避免重复显示
        const fullMatch = content.slice(match.start, match.end);
        result.text = result.text.replace(fullMatch, '');
      }
    } catch (e) {
      console.warn('KPI parse error:', e, 'JSON:', match.json);
    }
  }

  // 3. 提取思维链 [thought-chain:{...}]
  const thoughtChainPattern = /\[thought-chain:\s*\{/gi;
  let thoughtChainMatch;
  const foundThoughtChains = new Set<string>();
  const thoughtChainMatches: Array<{ start: number; end: number; json: string; fullMatch: string }> = [];
  
  thoughtChainPattern.lastIndex = 0;
  
  while ((thoughtChainMatch = thoughtChainPattern.exec(content)) !== null) {
    const startIdx = thoughtChainMatch.index + thoughtChainMatch[0].length - 1;
    let braceCount = 1;
    let endIdx = startIdx + 1;
    
    while (endIdx < content.length && braceCount > 0) {
      if (content[endIdx] === '{') braceCount++;
      if (content[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    if (endIdx < content.length && content[endIdx] === ']') {
      const jsonStr = content.slice(startIdx, endIdx);
      const fullMatch = content.slice(thoughtChainMatch.index, endIdx + 1);
      if (!foundThoughtChains.has(jsonStr)) {
        foundThoughtChains.add(jsonStr);
        thoughtChainMatches.push({
          start: thoughtChainMatch.index,
          end: endIdx + 1,
          json: jsonStr,
          fullMatch: fullMatch,
        });
      }
    }
  }
  
  // 从后往前处理，避免索引偏移问题
  for (let i = thoughtChainMatches.length - 1; i >= 0; i--) {
    const match = thoughtChainMatches[i];
    try {
      const thoughtChainData = JSON.parse(match.json);
      if (thoughtChainData && thoughtChainData.items && Array.isArray(thoughtChainData.items) && thoughtChainData.items.length > 0) {
        // 验证 items 的有效性
        const validItems = thoughtChainData.items.filter((item: any) => 
          item && typeof item === 'object' && item.key && item.title
        );
        
        // 只有当有有效的 items 时才添加
        if (validItems.length > 0) {
          result.thoughtChains.push({
            json: match.json,
            data: validItems,
            position: match.start,
          });
          // 添加到blocks中
          allBlocks.push({
            type: 'thought-chain',
            position: match.start,
            data: validItems,
          });
        }
        
        // 从文本中移除思维链标记，避免重复显示（使用完整匹配）
        result.text = result.text.replace(match.fullMatch, '');
        // 也尝试转义特殊字符的版本
        const escapedMatch = match.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result.text = result.text.replace(new RegExp(escapedMatch, 'g'), '');
      } else {
        // 数据格式无效，也要从文本中移除
        result.text = result.text.replace(match.fullMatch, '');
        const escapedMatch = match.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result.text = result.text.replace(new RegExp(escapedMatch, 'g'), '');
      }
    } catch (e) {
      // 即使解析失败，也要从文本中移除，避免显示代码
      result.text = result.text.replace(match.fullMatch, '');
      const escapedMatch = match.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result.text = result.text.replace(new RegExp(escapedMatch, 'g'), '');
      console.warn('ThoughtChain parse error:', e, 'JSON:', match.json.substring(0, 100));
    }
  }
  
  // 额外清理：移除任何残留的思维链代码（包括不完整的情况）
  result.text = result.text.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
  result.text = result.text.replace(/\[thought-chain:[^\]]*\]/gi, '');
  result.text = result.text.replace(/\[thought-chain[^\]]*/gi, '');

  // 3.5. 提取工具调用链 [tool-call-chain:{...}]
  const toolCallChainPattern = /\[tool-call-chain:\s*\{/gi;
  let toolCallChainMatch;
  const foundToolCallChains = new Set<string>();
  const toolCallChainMatches: Array<{ start: number; end: number; json: string; fullMatch: string }> = [];
  
  toolCallChainPattern.lastIndex = 0;
  
  while ((toolCallChainMatch = toolCallChainPattern.exec(content)) !== null) {
    const startIdx = toolCallChainMatch.index + toolCallChainPattern.lastIndex - 1;
    let braceCount = 1;
    let endIdx = startIdx + 1;
    
    while (endIdx < content.length && braceCount > 0) {
      if (content[endIdx] === '{') braceCount++;
      if (content[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    if (endIdx < content.length && content[endIdx] === ']') {
      const jsonStr = content.slice(startIdx, endIdx);
      const fullMatch = content.slice(toolCallChainMatch.index, endIdx + 1);
      if (!foundToolCallChains.has(jsonStr)) {
        foundToolCallChains.add(jsonStr);
        toolCallChainMatches.push({
          start: toolCallChainMatch.index,
          end: endIdx + 1,
          json: jsonStr,
          fullMatch: fullMatch,
        });
      }
    }
  }
  
  // 从后往前处理，避免索引偏移问题
  for (let i = toolCallChainMatches.length - 1; i >= 0; i--) {
    const match = toolCallChainMatches[i];
    try {
      const toolCallChainData = JSON.parse(match.json);
      if (toolCallChainData && toolCallChainData.items && Array.isArray(toolCallChainData.items) && toolCallChainData.items.length > 0) {
        // 验证 items 的有效性
        const validItems = toolCallChainData.items.filter((item: any) => 
          item && typeof item === 'object' && item.id && item.toolName
        );
        
        if (validItems.length > 0) {
          result.toolCallChains.push({
            json: match.json,
            data: validItems,
            position: match.start,
          });
          // 添加到blocks中
          allBlocks.push({
            type: 'tool-call-chain',
            position: match.start,
            data: validItems,
          });
        }
        
        // 从文本中移除工具调用链标记
        result.text = result.text.replace(match.fullMatch, '');
        const escapedMatch = match.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result.text = result.text.replace(new RegExp(escapedMatch, 'g'), '');
      } else {
        // 数据格式无效，也要从文本中移除
        result.text = result.text.replace(match.fullMatch, '');
        const escapedMatch = match.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result.text = result.text.replace(new RegExp(escapedMatch, 'g'), '');
      }
    } catch (e) {
      // 即使解析失败，也要从文本中移除，避免显示代码
      result.text = result.text.replace(match.fullMatch, '');
      const escapedMatch = match.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result.text = result.text.replace(new RegExp(escapedMatch, 'g'), '');
      console.warn('ToolCallChain parse error:', e, 'JSON:', match.json.substring(0, 100));
    }
  }
  
  // 额外清理：移除任何残留的工具调用链代码
  result.text = result.text.replace(/\[tool-call-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
  result.text = result.text.replace(/\[tool-call-chain:[^\]]*\]/gi, '');
  result.text = result.text.replace(/\[tool-call-chain[^\]]*/gi, '');

  // 4. 提取甘特图 [gantt:{...}]
  const ganttPattern = /\[gantt:\s*\{/gi;
  let ganttMatch;
  const foundGantts = new Set<string>();
  const ganttMatches: Array<{ start: number; end: number; json: string }> = [];
  
  ganttPattern.lastIndex = 0;
  
  while ((ganttMatch = ganttPattern.exec(content)) !== null) {
    const startIdx = ganttMatch.index + ganttMatch[0].length - 1;
    let braceCount = 1;
    let endIdx = startIdx + 1;
    
    while (endIdx < content.length && braceCount > 0) {
      if (content[endIdx] === '{') braceCount++;
      if (content[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    if (endIdx < content.length && content[endIdx] === ']') {
      const jsonStr = content.slice(startIdx, endIdx);
      if (!foundGantts.has(jsonStr)) {
        foundGantts.add(jsonStr);
        ganttMatches.push({
          start: ganttMatch.index,
          end: endIdx + 1,
          json: jsonStr,
        });
      }
    }
  }
  
  for (let i = ganttMatches.length - 1; i >= 0; i--) {
    const match = ganttMatches[i];
    try {
      const ganttData = JSON.parse(match.json);
      if (ganttData && ganttData.data && Array.isArray(ganttData.data)) {
        result.gantts.push({
          json: match.json,
          data: ganttData,
          position: match.start,
        });
        // 添加到blocks中
        allBlocks.push({
          type: 'gantt',
          position: match.start,
          data: ganttData,
        });
        const fullMatch = content.slice(match.start, match.end);
        result.text = result.text.replace(fullMatch, '');
      }
    } catch (e) {
      console.warn('Gantt parse error:', e, 'JSON:', match.json);
    }
  }

  // 5. 提取表格（Markdown 表格格式）
  const tablePattern = /(\|[^\n]+\|\n\|[-\s|:]+\|\n(?:\|[^\n]+\|\n?)+)/g;
  let tableMatch;
  const foundTables = new Set<string>();
  
  while ((tableMatch = tablePattern.exec(content)) !== null) {
    const tableText = tableMatch[1];
    if (!foundTables.has(tableText)) {
      foundTables.add(tableText);
      const table = parseMarkdownTable(tableText);
      if (table) {
        result.tables.push({
          ...table,
          position: tableMatch.index || 0,
        });
        // 添加到blocks中
        allBlocks.push({
          type: 'table',
          position: tableMatch.index || 0,
          data: table,
        });
        // 从文本中移除表格，避免重复显示
        result.text = result.text.replace(tableMatch[0], '');
      }
    }
  }

  // 收集所有非文本块的位置和结束位置
  interface ContentMarker {
    type: 'chart' | 'kpi' | 'gantt' | 'table' | 'thought-chain' | 'tool-call-chain';
    start: number;
    end: number;
    data: any;
  }
  
  const allMarkers: ContentMarker[] = [];
  
  // 收集图表位置
  for (const match of chartMatches) {
    const chartData = result.charts.find(c => c.position === match.start)?.data;
    if (chartData) {
      allMarkers.push({ type: 'chart', start: match.start, end: match.end, data: chartData });
    }
  }
  
  // 收集KPI位置
  for (const match of kpiMatches) {
    const kpiData = result.kpis.find(k => k.position === match.start)?.data;
    if (kpiData) {
      allMarkers.push({ type: 'kpi', start: match.start, end: match.end, data: kpiData });
    }
  }
  
  // 收集甘特图位置
  for (const match of ganttMatches) {
    const ganttData = result.gantts.find(g => g.position === match.start)?.data;
    if (ganttData) {
      allMarkers.push({ type: 'gantt', start: match.start, end: match.end, data: ganttData });
    }
  }
  
  // 收集思维链位置
  for (const match of thoughtChainMatches) {
    const thoughtChainData = result.thoughtChains.find(tc => tc.position === match.start)?.data;
    if (thoughtChainData) {
      allMarkers.push({ type: 'thought-chain', start: match.start, end: match.end, data: thoughtChainData });
      // 确保从文本中移除思维链标记
      const fullMatch = content.slice(match.start, match.end);
      result.text = result.text.replace(fullMatch, '');
    }
  }
  
  // 收集工具调用链位置
  for (const match of toolCallChainMatches) {
    const toolCallChainData = result.toolCallChains.find(tc => tc.position === match.start)?.data;
    if (toolCallChainData) {
      allMarkers.push({ type: 'tool-call-chain', start: match.start, end: match.end, data: toolCallChainData });
      // 确保从文本中移除工具调用链标记
      const fullMatch = content.slice(match.start, match.end);
      result.text = result.text.replace(fullMatch, '');
    }
  }
  
  // 收集表格位置（需要重新查找位置）
  tablePattern.lastIndex = 0;
  while ((tableMatch = tablePattern.exec(content)) !== null) {
    const tableText = tableMatch[1];
    const table = result.tables.find(t => 
      t.headers.join('|') === parseMarkdownTable(tableText)?.headers.join('|')
    );
    if (table) {
      allMarkers.push({ 
        type: 'table', 
        start: tableMatch.index, 
        end: tableMatch.index + tableMatch[0].length, 
        data: table 
      });
    }
  }
  
  // 按位置排序
  allMarkers.sort((a, b) => a.start - b.start);
  
  // 去重（同一位置只保留一个）
  const uniqueMarkers: ContentMarker[] = [];
  const seenStarts = new Set<number>();
  for (const marker of allMarkers) {
    if (!seenStarts.has(marker.start)) {
      seenStarts.add(marker.start);
      uniqueMarkers.push(marker);
    }
  }
  
  // 构建最终的 blocks 数组：按位置交替插入文本和图表/表格
  const finalBlocks: typeof allBlocks = [];
  let lastEnd = 0;
  
  for (const marker of uniqueMarkers) {
    // 添加当前 marker 之前的文本（但需要清理思维链标记）
    if (marker.start > lastEnd) {
      let textSegment = content.slice(lastEnd, marker.start).trim();
      // 更激进地清理思维链标记（包括不完整的情况）
      textSegment = textSegment.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
      textSegment = textSegment.replace(/\[thought-chain:[^\]]*\]/gi, '');
      // 清理可能残留的思维链片段
      textSegment = textSegment.replace(/\[thought-chain[^\]]*/gi, '');
      if (textSegment) {
        finalBlocks.push({
          type: 'text',
          position: lastEnd,
          data: null,
          text: textSegment,
        });
      }
    }
    
    // 添加当前 marker（图表/表格/KPI/甘特图/思维链）
    finalBlocks.push({
      type: marker.type,
      position: marker.start,
      data: marker.data,
    });
    
    lastEnd = marker.end;
  }
  
  // 添加所有 marker 之后的剩余文本（但需要清理思维链标记）
  if (lastEnd < content.length) {
    let textSegment = content.slice(lastEnd).trim();
    // 更激进地清理思维链标记（包括不完整的情况）
    textSegment = textSegment.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
    textSegment = textSegment.replace(/\[thought-chain:[^\]]*\]/gi, '');
    // 清理可能残留的思维链片段
    textSegment = textSegment.replace(/\[thought-chain[^\]]*/gi, '');
    if (textSegment) {
      finalBlocks.push({
        type: 'text',
        position: lastEnd,
        data: null,
        text: textSegment,
      });
    }
  }
  
  // 如果没有任何 marker，整个内容都是文本（但需要清理思维链标记）
  if (finalBlocks.length === 0) {
    let cleanText = result.text.trim();
    // 更激进地清理思维链标记（包括不完整的情况）
    cleanText = cleanText.replace(/\[thought-chain:\s*\{[^}]*\}[^\]]*\]/gi, '');
    cleanText = cleanText.replace(/\[thought-chain:[^\]]*\]/gi, '');
    // 清理可能残留的思维链片段
    cleanText = cleanText.replace(/\[thought-chain[^\]]*/gi, '');
    if (cleanText) {
      finalBlocks.push({
        type: 'text',
        position: 0,
        data: null,
        text: cleanText,
      });
    }
  }
  
  result.blocks = finalBlocks;
  
  return result;
}

/**
 * 解析 Markdown 表格
 */
function parseMarkdownTable(tableText: string): { headers: string[]; rows: string[][] } | null {
  const lines = tableText.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return null;

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
}

/**
 * 检查内容是否包含可解析的图表或表格
 */
export function hasRealtimeContent(content: string): boolean {
  return /\[chart:\s*\{/.test(content) || /\|[^\n]+\|\n\|[-\s|:]+\|/.test(content);
}

