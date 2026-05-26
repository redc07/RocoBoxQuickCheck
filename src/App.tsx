/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { Search, X, HelpCircle, Gamepad2, Compass, Ban, Trash2, Github, FileDown } from "lucide-react";
import { PETS_DATABASE } from "./data/pets";
import PetCard from "./components/PetCard";

interface IncrementLog {
  timestamp: string;
  petId: string;
  petName: string;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [petCounts, setPetCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("pet_box_counts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [incrementLogs, setIncrementLogs] = useState<IncrementLog[]>(() => {
    try {
      const saved = localStorage.getItem("pet_box_increment_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatically save counters to localStorage
  useEffect(() => {
    localStorage.setItem("pet_box_counts", JSON.stringify(petCounts));
  }, [petCounts]);

  // Automatically save increment logs to localStorage
  useEffect(() => {
    localStorage.setItem("pet_box_increment_logs", JSON.stringify(incrementLogs));
  }, [incrementLogs]);

  const hasActiveSearch = searchQuery.trim().length > 0;

  // Ultra-precise pattern matching: restricts initials matches to whole keys only
  const processedPets = useMemo(() => {
    const queryClean = searchQuery.trim().toLowerCase();
    
    const petsWithFlag = PETS_DATABASE.map(pet => {
      if (!queryClean) {
        return { pet, isMatched: false };
      }

      // 1. Name Match (e.g. "音" or "音碟吼")
      const isNameMatch = pet.name.toLowerCase().includes(queryClean);
      
      // 2. Direct Clue character substring (e.g. "沸腾", "噼啪")
      const isHintMatch = pet.hint.toLowerCase().includes(queryClean);
      
      // 3. Name pinyin matches
      const isPinyinMatch = pet.pinyinName.toLowerCase().includes(queryClean);
      
      // 4. Name initials matches
      const isPinyinInitialsMatch = pet.pinyinInitials.toLowerCase().includes(queryClean);

      // 5. Keyword exact/partial match (e.g. "穿透力")
      const isKeywordMatch = pet.keywords.some(kw => kw.toLowerCase().includes(queryClean));

      // 6. Explicit tag-shorthand initials prefix or match (e.g. "ctl" or "ct")
      const isKeywordInitialsMatch = pet.keywordInitials.some(
        kwi => kwi.toLowerCase() === queryClean || kwi.toLowerCase().startsWith(queryClean)
      );

      // 7. Full Hint Clue Initials substring match (e.g. "cl" matches "传来", "pps" matches "噼啪声")
      const isHintInitialsMatch = pet.hintInitials.toLowerCase().includes(queryClean);

      // 8. Element Attributes Match (e.g., "火" or "机械")
      const isAttributeMatch = pet.attributes.toLowerCase().includes(queryClean);

      const isMatched = pet.id === "other" ||
                        isNameMatch || isHintMatch || isPinyinMatch || 
                        isPinyinInitialsMatch || isKeywordMatch || 
                        isKeywordInitialsMatch || isHintInitialsMatch ||
                        isAttributeMatch;

      return { pet, isMatched };
    });

    if (!queryClean) {
      return petsWithFlag;
    }

    // Move matching items directly to the top!
    return [...petsWithFlag].sort((a, b) => {
      if (a.isMatched && !b.isMatched) return -1;
      if (!a.isMatched && b.isMatched) return 1;
      return 0;
    });
  }, [searchQuery]);

  const matchesCount = useMemo(() => {
    return processedPets.filter(item => item.isMatched).length;
  }, [processedPets]);

  const handleClear = () => {
    setSearchQuery("");
  };

  const handleIncrement = (id: string) => {
    const pet = PETS_DATABASE.find(p => p.id === id);
    const petName = pet ? pet.name : (id === "other" ? "其他随从" : id);

    setPetCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));

    // Record high precision timestamp
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    setIncrementLogs(prev => [
      ...prev,
      { timestamp: timeStr, petId: id, petName }
    ]);

    setSearchQuery("");
  };

  const handleDecrement = (id: string) => {
    setPetCounts(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1)
    }));

    setIncrementLogs(prev => {
      // Find the last logged item for this pet and remove it to keep logs aligned
      const idx = [...prev].reverse().findIndex(log => log.petId === id);
      if (idx !== -1) {
        const actualIndex = prev.length - 1 - idx;
        return prev.filter((_, i) => i !== actualIndex);
      }
      return prev;
    });
  };

  const handleClearAllCounts = () => {
    setPetCounts({});
    setIncrementLogs([]);
  };

  // Calculate total counts for progress tracking
  const totalCountSum = useMemo(() => {
    return Object.values(petCounts).reduce((acc: number, val: number) => acc + val, 0);
  }, [petCounts]);

  // Compute stats of currently counted pets (sorted by count descending for live distribution dashboard)
  const petStatistics = useMemo(() => {
    const totalCount = incrementLogs.length;
    const summary: Record<string, { id: string; name: string; count: number; percentage: number }> = {};
    
    Object.entries(petCounts).forEach(([id, countVal]) => {
      const count = countVal as number;
      if (count > 0) {
        const pet = PETS_DATABASE.find(p => p.id === id);
        const name = pet ? pet.name : (id === "other" ? "其他随从" : id);
        summary[id] = {
          id,
          name,
          count,
          percentage: totalCount > 0 ? parseFloat(((count / totalCount) * 100).toFixed(1)) : 0
        };
      }
    });

    return Object.values(summary).sort((a, b) => b.count - a.count);
  }, [petCounts, incrementLogs]);

// High-density distinct, vibrant but elegant signature pastel colors for each pet
const PET_COLOR_MAP: Record<string, { bg: string; text: string; border: string; hex: string; fgHex: string }> = {
  yindiehou: { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", text: "text-indigo-800", border: "border-indigo-300", hex: "#e0e7ff", fgHex: "#3730a3" },
  yanhuatuan: { bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-850", border: "border-red-350", hex: "#fee2e2", fgHex: "#991b1b" },
  jiayouhaikui: { bg: "bg-teal-50 text-teal-700 border-teal-200", text: "text-teal-800", border: "border-teal-350", hex: "#ccfbf1", fgHex: "#115e59" },
  xuanguangdidi: { bg: "bg-pink-50 text-pink-700 border-pink-200", text: "text-pink-800", border: "border-pink-350", hex: "#fce7f3", fgHex: "#9d174d" },
  gugumao: { bg: "bg-purple-50 text-purple-700 border-purple-200", text: "text-purple-800", border: "border-purple-350", hex: "#f3e8ff", fgHex: "#6b21a8" },
  xiaochoudoudou: { bg: "bg-amber-50 text-amber-700 border-amber-250", text: "text-amber-800", border: "border-amber-350", hex: "#fef3c7", fgHex: "#92400e" },
  xiaoguxiang: { bg: "bg-sky-50 text-sky-700 border-sky-200", text: "text-sky-850", border: "border-sky-350", hex: "#e0f2fe", fgHex: "#075985" },
  shuaishuaimoou: { bg: "bg-slate-50 text-slate-700 border-slate-200", text: "text-slate-800", border: "border-slate-350", hex: "#e2e8f0", fgHex: "#1e293b" },
  gongpingge: { bg: "bg-cyan-50 text-cyan-700 border-cyan-200", text: "text-cyan-850", border: "border-cyan-350", hex: "#ecfeff", fgHex: "#155e75" },
  linghu: { bg: "bg-violet-50 text-violet-700 border-violet-200", text: "text-violet-800", border: "border-violet-350", hex: "#ede9fe", fgHex: "#5b21b6" },
  dujiaoshou: { bg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", text: "text-fuchsia-800", border: "border-fuchsia-350", hex: "#fae8ff", fgHex: "#86198f" },
  duduguo: { bg: "bg-orange-50 text-orange-700 border-orange-200", text: "text-orange-850", border: "border-orange-350", hex: "#ffedd5", fgHex: "#9a3412" },
  juhuali: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "text-emerald-800", border: "border-emerald-350", hex: "#d1fae5", fgHex: "#065f46" },
  youyingshu: { bg: "bg-green-50 text-green-700 border-green-200", text: "text-green-800", border: "border-green-350", hex: "#dcfce7", fgHex: "#166534" },
  xiaoye: { bg: "bg-zinc-100 text-zinc-700 border-zinc-250", text: "text-zinc-800", border: "border-zinc-350", hex: "#e4e4e7", fgHex: "#27272a" },
  emoding: { bg: "bg-rose-50 text-rose-700 border-rose-200", text: "text-rose-800", border: "border-rose-350", hex: "#ffe4e6", fgHex: "#9f1239" },
  baoyanzai: { bg: "bg-red-50 text-red-700 border-red-200", text: "text-red-900", border: "border-red-300", hex: "#fef2f2", fgHex: "#b91c1c" },
  xiaoxueren: { bg: "bg-blue-50 text-blue-700 border-blue-200", text: "text-blue-850", border: "border-blue-300", hex: "#eff6ff", fgHex: "#1e40af" },
  rongrong: { bg: "bg-lime-50 text-lime-700 border-lime-200", text: "text-lime-800", border: "border-lime-350", hex: "#f7fee7", fgHex: "#3f6212" },
  xijiaoniao: { bg: "bg-sky-50 text-sky-700 border-sky-200", text: "text-sky-850", border: "border-sky-350", hex: "#f0f9ff", fgHex: "#0369a1" },
  huohongwei: { bg: "bg-rose-50 text-rose-700 border-rose-200", text: "text-rose-950", border: "border-rose-300", hex: "#fff1f2", fgHex: "#9f1239" },
  guodong: { bg: "bg-yellow-50 text-amber-700 border-yellow-200", text: "text-yellow-850", border: "border-yellow-350", hex: "#fef9c3", fgHex: "#854d0e" },
  xingchenchong: { bg: "bg-purple-50 text-indigo-700 border-indigo-200", text: "text-purple-900", border: "border-purple-350", hex: "#faf5ff", fgHex: "#6b21a8" },
  other: { bg: "bg-stone-100 text-stone-600 border-stone-200", text: "text-stone-700", border: "border-stone-300", hex: "#e7e5e4", fgHex: "#44403c" }
};

  // Export to professional border-fitted, beautifully color-styled Excel Spreadsheet (.xls HTML Format)
  const handleExportExcel = () => {
    if (incrementLogs.length === 0) return;

    const totalCount = incrementLogs.length;

    // Use standard XML/HTML declaration that Excel opens with grid lines, columns & gorgeous cell styles
    let html = "\ufeff"; // BOM declaration for Chinese excel systems
    html += `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>极速抓取统计报表</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table { border-collapse: collapse; font-family: 'Microsoft YaHei', 'SimSun', sans-serif; }
  td, th { border: 1px solid #c0c0c0; padding: 6px 12px; text-align: left; font-size: 12px; }
  th { background-color: #f3f4f6; color: #1f2937; font-weight: bold; border: 1px solid #c0c0c0; text-align: center; }
  .title-header { font-size: 16px; font-weight: bold; color: #78350f; border: none; padding: 8px 0; }
  .info-meta { font-size: 11px; color: #4b5563; border: none; }
  .section-title { font-size: 13px; font-weight: bold; color: #78350f; height: 28px; padding-left: 10px; border-bottom: 2px solid #b45309; }
</style>
</head>
<body>
  <table>
    <!-- Sheet Title Info Block -->
    <tr>
      <td colspan="3" class="title-header">洛克王国 · 随从秘语极速抓取多开统计报表</td>
    </tr>
    <tr>
      <td colspan="3" class="info-meta">导出时间: ${new Date().toLocaleString()} &nbsp;|&nbsp; 累计抓获总数: ${totalCount} 只</td>
    </tr>
    <tr><td colspan="3" style="border:none; height: 8px;"></td></tr>

    <!-- Summary Stats Table Partition -->
    <tr>
      <td colspan="3" class="section-title">📊 随从种类产出实时占比统计 (爆率一览)</td>
    </tr>
    <tr>
      <th style="width: 250px;">出货精灵种类</th>
      <th style="width: 150px; text-align: right;">抓获数量 (个)</th>
      <th style="width: 180px; text-align: right;">出货率占比 (%)</th>
    </tr>
`;

    petStatistics.forEach(stat => {
      const color = PET_COLOR_MAP[stat.id] || PET_COLOR_MAP.other;
      html += `
    <tr>
      <td style="font-weight: bold; color: #292524;">${stat.name}</td>
      <td style="color: ${color.fgHex}; font-weight: bold; text-align: right;">${stat.count}</td>
      <td style="font-weight: bold; text-align: right; color: #b45309;">${stat.percentage}%</td>
    </tr>`;
    });

    html += `
    <tr style="font-weight: bold;">
      <td style="text-align: right; font-weight: bold; color: #1c1917;">总计累计汇总</td>
      <td style="text-align: right; font-weight: bold; color: #1c1917; font-size: 13px;">${totalCount}</td>
      <td style="text-align: right; font-weight: bold; color: #1c1917; font-size: 13px;">100.0%</td>
    </tr>
    <tr><td colspan="3" style="border:none; height: 18px;"></td></tr>

    <!-- Raw Stream Logs Partition -->
    <tr>
      <td colspan="3" class="section-title">📝 详细抓取操作流水流水记录表 (各精灵专属着色比对)</td>
    </tr>
    <tr>
      <th style="width: 100px; text-align: center;">序号</th>
      <th style="width: 250px;">记录时间</th>
      <th style="width: 330px;">精灵种类 (专属颜色标记，方便阅读)</th>
    </tr>
`;

    incrementLogs.forEach((log, index) => {
      const color = PET_COLOR_MAP[log.petId] || PET_COLOR_MAP.other;
      html += `
    <tr>
      <td style="text-align: center; color: #4b5563;">${index + 1}</td>
      <td style="color: #4b5563;">${log.timestamp}</td>
      <td style="color: ${color.fgHex}; font-weight: bold;">&nbsp;●&nbsp;${log.petName}</td>
    </tr>`;
    });

    html += `
  </table>
</body>
</html>`;

    // Prompt user to download
    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    link.setAttribute("href", url);
    link.setAttribute("download", `洛克随从极速抓取占比报表_${dateStr}.xls`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#ebdcc5] text-[#3c362d] font-sans selection:bg-amber-500/30 selection:text-amber-950 p-2 sm:p-4 flex flex-col gap-3">
      
      <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1 gap-2.5 sm:gap-3.5">
        {/* Sleek, Minimalist, Compact Top Controls Bar */}
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-stone-300 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-amber-800 shrink-0 animate-pulse" size={17} />
            <h1 className="text-sm min-[360px]:text-base md:text-lg font-black tracking-tight text-stone-900 flex items-center gap-1.5">
              <span>洛克王国 · 盒子提示词极速查询与计数</span>
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {/* Direct click to clear all scores */}
            <button
              onClick={handleClearAllCounts}
              className="text-[10px] sm:text-xs bg-rose-500/10 text-rose-800 border border-rose-500/25 hover:bg-rose-500/20 active:bg-rose-500/35 px-2.5 py-1 rounded flex items-center gap-1 font-extrabold transition-all shadow-xs cursor-pointer"
              title="清空所有随从的计数"
            >
              <Trash2 size={12} />
              <span>清空所有计数</span>
            </button>

            <a
              href="https://space.bilibili.com/1574149783"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs text-stone-700 bg-white/60 hover:bg-white/95 border border-stone-300/80 hover:border-amber-600/40 px-2.5 py-1 rounded flex items-center gap-1.5 font-bold shadow-xs transition-all cursor-pointer"
              title="访问 B站 Tiki西米路 主页"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-xs" />
              <span>B站：Tiki西米路</span>
            </a>

            <a
              href="https://github.com/redc07/RocoBoxQuickCheck"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs text-stone-700 bg-white/60 hover:bg-white/95 border border-stone-300/80 hover:border-amber-600/40 px-2.5 py-1 rounded flex items-center gap-1.5 font-bold shadow-xs transition-all cursor-pointer"
              title="查看 Github 仓库"
            >
              <Github size={12} className="text-stone-700" />
              <span>GitHub</span>
            </a>
          </div>
        </header>

        {/* Dense Precise Input Filter Section */}
        <section className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center shrink-0">
          <div className="relative flex-1 flex items-center bg-white/90 border border-stone-300/80 focus-within:border-amber-600 focus-within:ring-2 focus-within:ring-amber-600/10 rounded-lg transition-all shadow-xs">
            <div className="pl-3 text-stone-400 shrink-0">
              <Search size={14} />
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="快速搜首字母首拼(如: cl 传来, pps 噼啪声, bl 冰冷) 或 关键字 (如: 穿透力, 气泡)..."
              className="w-full py-2 min-[360px]:py-2.5 px-3 bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none text-xs sm:text-sm font-semibold"
            />

            {hasActiveSearch && (
              <button
                onClick={handleClear}
                className="mr-1.5 p-1 rounded hover:bg-stone-150 text-stone-400 hover:text-stone-600 transition-colors"
                title="清空"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Inline Compact Count Badge */}
          {hasActiveSearch && (
            <div className="text-[10px] sm:text-xs bg-amber-500/15 text-amber-950 border border-amber-500/25 px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0 justify-center font-bold shadow-xs">
              <Compass size={12} className="animate-spin duration-3000 text-amber-700" />
              <span>
                高亮并置顶 <strong className="font-extrabold text-amber-900">{matchesCount}</strong> 款匹配随从
              </span>
            </div>
          )}
        </section>

        {/* Empty Matches View */}
        {hasActiveSearch && matchesCount === 0 && (
          <div className="w-full text-center py-6 bg-white/40 border border-dashed border-stone-300 rounded-lg max-w-xs mx-auto space-y-1.5 shrink-0 my-4 shadow-sm">
            <Ban size={18} className="text-stone-400 mx-auto" />
            <p className="text-xs text-stone-600 font-bold font-sans">无匹配随从，请检查首字母或密语</p>
          </div>
        )}

        {/* 24 Pets Ultra-high Density Single-page Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5 pb-4">
          {processedPets.map(({ pet, isMatched }) => (
            <PetCard
              key={pet.id}
              pet={pet}
              searchQuery={searchQuery}
              isMatched={isMatched}
              hasActiveSearch={hasActiveSearch}
              count={petCounts[pet.id] || 0}
              totalAllCounts={totalCountSum}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
        </section>
      </div>

      {/* Statistics & Proportion Dashboard */}
      {incrementLogs.length > 0 && (
        <section className="max-w-[1600px] mx-auto w-full bg-white/45 border border-stone-300 rounded-lg p-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-300 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-1">
                <span>📊</span>
                <span>随从产出实时占比看板</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-900/10 text-amber-950 font-bold">
                共 {incrementLogs.length} 次记录
              </span>
            </div>
            
            {/* Export To Excel Button */}
            <button
              onClick={handleExportExcel}
              className="text-xs bg-amber-800 hover:bg-amber-900 active:bg-amber-950 text-amber-50 font-extrabold px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-sm cursor-pointer border border-amber-950/20"
              title="导出包含边框、配色与爆率占比的 Excel 高级排版文档"
            >
              <FileDown size={13} />
              <span>导出此次记录为 Excel</span>
            </button>
          </div>

          <div className="mt-2.5 space-y-2">
            <div className="text-[11px] font-black text-amber-900/70 mb-1 flex items-center gap-1">
              <span>📈 各种类随从爆率统计（实时排序一览）：</span>
            </div>
            <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
              {petStatistics.map((stat) => {
                const color = PET_COLOR_MAP[stat.id] || PET_COLOR_MAP.other;
                return (
                  <div key={stat.id} className="bg-white/70 border border-stone-300/40 rounded-lg p-2 flex flex-col justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] hover:border-amber-600/30 transition-all">
                    <div className="flex justify-between items-center text-[10.5px] sm:text-xs">
                      <span className="font-extrabold text-stone-900 truncate" title={stat.name}>{stat.name}</span>
                      <span className={`font-black px-1.5 py-0.5 rounded text-[10px] border ${color.bg}`}>{stat.count}</span>
                    </div>
                    {/* Mini Visual percentage bar */}
                    <div className="mt-1.5">
                      <div className="w-full bg-stone-200/80 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-700 h-full rounded-full transition-all duration-500"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-stone-500 mt-0.5 font-bold">
                        <span>占比:</span>
                        <span className="text-amber-800 font-extrabold">{stat.percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Tiny Compact Footer */}
      <footer className="max-w-[1600px] mx-auto w-full pt-2.5 mt-auto border-t border-stone-300 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] md:text-xs text-stone-500 font-mono tracking-wider shrink-0 select-none">
        <span>ROC BOX MULTI-QUERY INSTANT SCREEN v2.6</span>
        
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 bg-white/50 px-3 py-1.5 rounded-md border border-stone-300/80 shadow-xs font-sans font-bold text-stone-700">
          <div className="flex items-center gap-1">
            <span>总计数:</span>
            <span className="text-stone-900 font-black text-[12px]">{totalCountSum}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
