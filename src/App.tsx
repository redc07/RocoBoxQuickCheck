/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { Search, X, HelpCircle, Gamepad2, Compass, Ban, Trash2 } from "lucide-react";
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

  return (
    <div className="h-screen md:overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-amber-400/30 selection:text-amber-150 p-2 sm:p-3 flex flex-col gap-1.5 overflow-y-auto md:overflow-y-hidden">
      
      <div className="max-w-[1600px] mx-auto w-full flex flex-col flex-1 min-h-0 space-y-1.5">
        {/* Sleek, Minimalist, Compact Top Controls Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-900 pb-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-amber-400 shrink-0" size={15} />
            <h1 className="text-sm md:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>洛克王国·世界S2盒子提示词极速查询与记录</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct click to clear all scores */}
            <button
              onClick={handleClearAllCounts}
              className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/25 active:bg-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-semibold transition-all"
              title="清空所有随从的计数"
            >
              <Trash2 size={11} />
              <span>清空所有计数</span>
            </button>

            <div className="text-[10px] text-slate-500 bg-slate-900/40 border border-slate-900 px-2 py-0.5 rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>QQ 524254767</span>
            </div>
          </div>
        </header>

        {/* Dense Precise Input Filter Section */}
        <section className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center shrink-0">
          <div className="relative flex-1 flex items-center bg-slate-900/80 border border-slate-800/80 focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/20 rounded-lg transition-all">
            <div className="pl-3 text-slate-500 shrink-0">
              <Search size={13} />
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="快速搜首字母首拼(如: cl 传来, pps 噼啪声, bl 冰冷) 或 关键字 (如: 穿透力, 气泡)..."
              className="w-full py-2 px-3 bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none text-xs font-sans"
            />

            {hasActiveSearch && (
              <button
                onClick={handleClear}
                className="mr-1.5 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                title="清空"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Inline Compact Count Badge */}
          {hasActiveSearch && (
            <div className="text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0 justify-center">
              <Compass size={11} className="animate-spin duration-3000" />
              <span>
                高亮并置顶 <strong className="font-bold text-amber-200">{matchesCount}</strong> 款已锁定随从
              </span>
            </div>
          )}
        </section>

        {/* Empty Matches View */}
        {hasActiveSearch && matchesCount === 0 && (
          <div className="w-full text-center py-4 bg-slate-900/10 border border-dashed border-slate-900 rounded-lg max-w-xs mx-auto space-y-1 shrink-0">
            <Ban size={15} className="text-slate-700 mx-auto" />
            <p className="text-[11px] text-slate-400 font-semibold font-sans">无匹配随从，请检查首字母或密语</p>
          </div>
        )}

        {/* 18 Pets Ultra-high Density Single-page Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 md:grid-rows-3 gap-2 flex-grow min-h-0 overflow-y-auto md:overflow-hidden bg-slate-950 pb-1">
          {processedPets.map(({ pet, isMatched }) => (
            <PetCard
              key={pet.id}
              pet={pet}
              searchQuery={searchQuery}
              isMatched={isMatched}
              hasActiveSearch={hasActiveSearch}
              count={petCounts[pet.id] || 0}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))}
        </section>
      </div>

      {/* Tiny Compact Footer */}
      <footer className="max-w-[1600px] mx-auto w-full pt-1.5 mt-1 border-t border-slate-900/40 flex justify-between items-center text-[9px] text-slate-700 font-mono tracking-wider shrink-0">
        <span>ROC BOX MULTI-QUERY INSTANT SCREEN v2.5</span>
      </footer>
    </div>
  );
}
