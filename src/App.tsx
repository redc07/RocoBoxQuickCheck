/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { Search, X, HelpCircle, Gamepad2, Compass, Ban, Trash2, Github } from "lucide-react";
import { PETS_DATABASE } from "./data/pets";
import PetCard from "./components/PetCard";

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

  // Automatically save counters to localStorage
  useEffect(() => {
    localStorage.setItem("pet_box_counts", JSON.stringify(petCounts));
  }, [petCounts]);

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
    setPetCounts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    setSearchQuery("");
  };

  const handleDecrement = (id: string) => {
    setPetCounts(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1)
    }));
  };

  const handleClearAllCounts = () => {
    setPetCounts({});
  };

  // Calculate total counts and percentages for progress tracking
  const totalCountSum = useMemo(() => {
    return Object.values(petCounts).reduce((acc: number, val: number) => acc + val, 0);
  }, [petCounts]);

  const validPets = useMemo(() => {
    return PETS_DATABASE.filter(p => p.id !== "other");
  }, []);

  const countedTypesCount = useMemo(() => {
    return validPets.filter(p => (petCounts[p.id] || 0) > 0).length;
  }, [validPets, petCounts]);

  const progressPercentage = useMemo(() => {
    if (validPets.length === 0) return 0;
    return parseFloat(((countedTypesCount / validPets.length) * 100).toFixed(1));
  }, [countedTypesCount, validPets]);

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

      {/* Tiny Compact Footer */}
      <footer className="max-w-[1600px] mx-auto w-full pt-2.5 mt-auto border-t border-stone-300 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] md:text-xs text-stone-500 font-mono tracking-wider shrink-0 select-none">
        <span>ROC BOX MULTI-QUERY INSTANT SCREEN v2.6</span>
        
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 bg-white/50 px-3 py-1.5 rounded-md border border-stone-300/80 shadow-xs font-sans font-bold text-stone-700">
          <div className="flex items-center gap-1">
            <span>记录种类:</span>
            <span className="text-stone-900 font-black text-[12px]">{countedTypesCount} / {validPets.length}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-stone-300 pl-2.5">
            <span>收集进度:</span>
            <span className="text-amber-800 font-black text-[12px]">{progressPercentage}%</span>
          </div>
          <div className="flex items-center gap-1 border-l border-stone-300 pl-2.5">
            <span>总计数:</span>
            <span className="text-stone-900 font-black text-[12px]">{totalCountSum}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
