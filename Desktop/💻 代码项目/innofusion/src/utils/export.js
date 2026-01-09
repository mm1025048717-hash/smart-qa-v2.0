import { saveAs } from 'file-saver';

export const exportToMarkdown = (projectName, bubbles, fusionHistory) => {
  let markdownContent = `# ${projectName || 'Innofusion Project Export'}\n\n`;

  // Section for original ideas (non-fused bubbles)
  const originalBubbles = bubbles.filter(b => !b.isFused && b.kind !== 'fusion');
  if (originalBubbles.length > 0) {
    markdownContent += `## 原始灵感 (Original Ideas)\n\n`;
    originalBubbles.forEach(bubble => {
      markdownContent += `- **${bubble.text}** (${bubble.kind})\n`;
    });
    markdownContent += `\n`;
  }

  // Section for fusion process
  if (fusionHistory.length > 0) {
    markdownContent += `## 融合过程 (Fusion Process)\n\n`;
    fusionHistory.forEach((fusion, index) => {
      markdownContent += `### ${index + 1}. ${fusion.title}\n\n`;
      markdownContent += `**融合自 (Fused from):** ${fusion.parents.join(' & ')}\n\n`;
      if (fusion.notes) {
        markdownContent += `**关键笔记 (Key Notes):**\n`;
        // Format notes as a blockquote
        const notes = fusion.notes.split('\n').map(line => `> ${line}`).join('\n');
        markdownContent += `${notes}\n\n`;
      }
      markdownContent += `---\n\n`;
    });
  }
  
  // Create a blob and trigger download
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
  const filename = `${projectName || 'export'}.md`;
  saveAs(blob, filename);
};

// --- 简单导出 PPTX（无外部依赖版本：动态按需加载 PptxGenJS 若可用） ---
export async function exportToPptx(structured) {
  try {
    let PptxGenJS = null;
    try {
      // eslint-disable-next-line no-undef
      if (window && window.PptxGenJS) {
        PptxGenJS = window.PptxGenJS;
      } else {
        const mod = await import('pptxgenjs');
        PptxGenJS = mod.default || mod;
      }
    } catch (_) {}
    if (!PptxGenJS) {
      // 兜底：导出 Markdown 作为替代
      const md = buildMarkdownFromStructured(structured);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${structured?.title || 'export'}.md`);
      return;
    }

    const pptx = new PptxGenJS();
    const title = structured?.title || '方案';

    // 封面
    {
      const slide = pptx.addSlide();
      slide.addText(title, { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 36, bold: true });
      if (structured?.oneSentence) {
        slide.addText(structured.oneSentence, { x: 0.5, y: 3, w: 9, h: 1.5, fontSize: 18, color: '666666' });
      }
    }

    // Big Idea / 标题 / 钩子
    {
      const slide = pptx.addSlide();
      slide.addText('Big Idea / 标题 / 钩子', { x: 0.5, y: 0.3, fontSize: 18, bold: true });
      const parts = [];
      if (structured?.bigIdea) parts.push(`Big Idea: ${structured.bigIdea}`);
      if (structured?.titlesTop5?.length) parts.push(`标题Top5: \n- ${structured.titlesTop5.join('\n- ')}`);
      if (structured?.hooksTop5?.length) parts.push(`开场钩子Top5: \n- ${structured.hooksTop5.join('\n- ')}`);
      slide.addText(parts.join('\n\n'), { x: 0.5, y: 1.0, w: 9, h: 5, fontSize: 14 });
    }

    // 传播链路 / 素材清单
    {
      const slide = pptx.addSlide();
      slide.addText('传播链路 / 素材清单', { x: 0.5, y: 0.3, fontSize: 18, bold: true });
      const pipe = structured?.pipeline || [];
      const assets = structured?.assets || [];
      slide.addText(`传播链路:\n- ${pipe.join('\n- ')}`, { x: 0.5, y: 1.0, w: 4.5, h: 5, fontSize: 14 });
      slide.addText(`素材清单:\n- ${assets.join('\n- ')}`, { x: 5.0, y: 1.0, w: 4.5, h: 5, fontSize: 14 });
    }

    // 卖点/反共识/话术
    {
      const slide = pptx.addSlide();
      slide.addText('卖点 / 反共识 / 话术', { x: 0.5, y: 0.3, fontSize: 18, bold: true });
      const lines = [];
      (structured?.sellingPoints || []).forEach(s => lines.push(`卖点：${s}`));
      (structured?.contrarianPoints || []).forEach(s => lines.push(`反共识：${s}`));
      (structured?.talkTracks || []).forEach(s => lines.push(`话术：${s}`));
      slide.addText(lines.join('\n'), { x: 0.5, y: 1.0, w: 9, h: 5, fontSize: 14 });
    }

    // MVP / 里程碑 / KPI
    {
      const slide = pptx.addSlide();
      slide.addText('MVP / 里程碑 / KPI', { x: 0.5, y: 0.3, fontSize: 18, bold: true });
      const left = [];
      if (structured?.mvp) left.push(`MVP:\n${structured.mvp}`);
      slide.addText(left.join('\n\n'), { x: 0.5, y: 1.0, w: 4.5, h: 5, fontSize: 14 });
      const right = [];
      if (structured?.milestones?.length) right.push(`里程碑:\n- ${structured.milestones.map(m=>`${m.name}：${m.desc}`).join('\n- ')}`);
      if (structured?.kpis?.length) right.push(`KPI:\n- ${structured.kpis.map(k=>`${k.name}：${k.target}`).join('\n- ')}`);
      slide.addText(right.join('\n\n'), { x: 5.0, y: 1.0, w: 4.5, h: 5, fontSize: 14 });
    }

    await pptx.writeFile({ fileName: `${title}.pptx` });
  } catch (e) {
    // 兜底：不抛出，避免打断用户流程
  }
}

function buildMarkdownFromStructured(s) {
  const lines = [];
  lines.push(`# ${s?.title || '方案'}`);
  if (s?.oneSentence) lines.push(`\n## 一句话主张\n${s.oneSentence}`);
  if (s?.bigIdea) lines.push(`\n## Big Idea\n${s.bigIdea}`);
  if (s?.titlesTop5?.length) { lines.push(`\n## 标题 Top 5`); s.titlesTop5.forEach((t,i)=>lines.push(`${i+1}. ${t}`)); }
  if (s?.hooksTop5?.length) { lines.push(`\n## 开场钩子 Top 5`); s.hooksTop5.forEach((t,i)=>lines.push(`${i+1}. ${t}`)); }
  if (s?.pipeline?.length) lines.push(`\n## 传播链路\n- ${s.pipeline.join('\n- ')}`);
  if (s?.assets?.length) lines.push(`\n## 素材清单\n- ${s.assets.join('\n- ')}`);
  if (s?.sellingPoints?.length || s?.contrarianPoints?.length || s?.talkTracks?.length) {
    lines.push(`\n## 核心卖点与差异`);
    (s.sellingPoints||[]).forEach(v=>lines.push(`- 卖点：${v}`));
    (s.contrarianPoints||[]).forEach(v=>lines.push(`- 反共识：${v}`));
    (s.talkTracks||[]).forEach(v=>lines.push(`- 话术：${v}`));
  }
  if (s?.mvp) lines.push(`\n## MVP\n${s.mvp}`);
  if (s?.milestones?.length) { lines.push(`\n## 里程碑`); s.milestones.forEach(m=>lines.push(`- ${m.name}：${m.desc}`)); }
  if (s?.kpis?.length) { lines.push(`\n## KPI`); s.kpis.forEach(k=>lines.push(`- ${k.name}：${k.target}`)); }
  return lines.join('\n');
}

// 导出 Notion 友好 Markdown（标题作为一级、其余二级，尽量纯文本）
export function exportToNotionMarkdown(structured) {
  const md = buildMarkdownFromStructured(structured);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const filename = `${structured?.title || 'export'}.md`;
  saveAs(blob, filename);
}