import React from "react";
import { 
  Music, Sparkles, Waves, Disc, HelpCircle, Smile, Drum, Cpu, Scale, 
  Flame, ShieldCheck, Soup, Flower2, TreePine, Cat, Ghost, Dribbble, 
  Moon, Info, Heart, Bird, Bug, Sun
} from "lucide-react";
import { PetBoxData } from "../types";
import { checkPinyinMatch } from "../utils/pinyin";

// Import custom pet JPG assets uploaded by the user
import yindiehouImg from "../assets/images/猴麦仔.jpg";
import yanhuatuanImg from "../assets/images/烟花团.jpg";
import jiayouhaikuiImg from "../assets/images/加油海葵.jpg";
import xuanguangdidiImg from "../assets/images/炫光迪迪.jpg";
import gugumaoImg from "../assets/images/咕咕帽.jpg";
import xiaochoudoudouImg from "../assets/images/小丑豆豆.jpg";
import xiaoguxiangImg from "../assets/images/小鼓象.jpg";
import shuaishuaimoouImg from "../assets/images/牵线木偶.jpg";
import gongpinggeImg from "../assets/images/公平鸽.jpg";
import linghuImg from "../assets/images/灵狐.jpg";
import dujiaoshouImg from "../assets/images/小独角兽.jpg";
import duduguoImg from "../assets/images/嘟嘟煲.jpg";
import juhualiImg from "../assets/images/菊花梨.jpg";
import youyingshuImg from "../assets/images/幽影树.jpg";
import xiaoyeImg from "../assets/images/小夜.jpg";
import emodingImg from "../assets/images/恶魔叮.jpg";
import baoyanzaiImg from "../assets/images/爆焰仔.jpg";
import xiaoxuerenImg from "../assets/images/小雪人.jpg";

// Map each pet.id in PETS_DATABASE to their newly uploaded custom JPG image
const petImageMap: Record<string, string> = {
  "yindiehou": yindiehouImg,
  "yanhuatuan": yanhuatuanImg,
  "jiayouhaikui": jiayouhaikuiImg,
  "xuanguangdidi": xuanguangdidiImg,
  "gugumao": gugumaoImg,
  "xiaochoudoudou": xiaochoudoudouImg,
  "xiaoguxiang": xiaoguxiangImg,
  "shuaishuaimoou": shuaishuaimoouImg,
  "gongpingge": gongpinggeImg,
  "linghu": linghuImg,
  "dujiaoshou": dujiaoshouImg,
  "duduguo": duduguoImg,
  "juhuali": juhualiImg,
  "youyingshu": youyingshuImg,
  "xiaoye": xiaoyeImg,
  "emoding": emodingImg,
  "baoyanzai": baoyanzaiImg,
  "xiaoxueren": xiaoxuerenImg,
};

// Map specific pet ids to their specific attribute avatar settings
const attributeAvatarMap: Record<string, { icon: any; colorClass: string; bgClass: string; borderClass: string; glowClass: string; text: string }> = {
  "guodong": {
    icon: Waves,
    colorClass: "text-sky-600 animate-pulse",
    bgClass: "bg-white",
    borderClass: "border-stone-200",
    glowClass: "shadow-xs",
    text: "水"
  },
  "xingchenchong": {
    icon: Bug,
    colorClass: "text-indigo-600 animate-pulse",
    bgClass: "bg-white",
    borderClass: "border-stone-200",
    glowClass: "shadow-xs",
    text: "虫"
  },
  "rongrong": {
    icon: Sun,
    colorClass: "text-emerald-600 animate-pulse",
    bgClass: "bg-white",
    borderClass: "border-stone-200",
    glowClass: "shadow-xs",
    text: "光/虫"
  },
  "xijiaoniao": {
    icon: Sun,
    colorClass: "text-amber-600 animate-pulse",
    bgClass: "bg-white",
    borderClass: "border-stone-200",
    glowClass: "shadow-xs",
    text: "光"
  },
  "huohongwei": {
    icon: Flame,
    colorClass: "text-rose-600 animate-pulse",
    bgClass: "bg-white",
    borderClass: "border-stone-200",
    glowClass: "shadow-xs",
    text: "火"
  }
};

const iconMap: Record<string, any> = {
  Music, Sparkles, Waves, Disc, Hat: HelpCircle, Smile, Drum, Cpu, Scale, 
  Flame, ShieldCheck, Soup, Flower2, TreePine, Cat, Ghost, Dribbble, Moon, Heart, Bird
};

interface PetCardProps {
  key?: any;
  pet: PetBoxData;
  searchQuery: string;
  isMatched: boolean;
  hasActiveSearch: boolean;
  count: number;
  totalAllCounts: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

const petIndices: Record<string, number> = {
  "yindiehou": 0,
  "yanhuatuan": 1,
  "jiayouhaikui": 2,
  "xuanguangdidi": 3,
  "gugumao": 4,
  "xiaochoudoudou": 5,
  "xiaoguxiang": 6,
  "shuaishuaimoou": 7,
  "gongpingge": 8,
  "linghu": 9,
  "dujiaoshou": 10,
  "duduguo": 11,
  "juhuali": 12,
  "youyingshu": 13,
  "xiaoye": 14,
  "emoding": 15,
  "guodong": 16,
  "xingchenchong": 17
};

export default function PetCard({ pet, searchQuery, isMatched, hasActiveSearch, count, totalAllCounts, onIncrement, onDecrement }: PetCardProps) {
  const IconComponent = iconMap[pet.petIcon] || HelpCircle;
  const attrAvatar = attributeAvatarMap[pet.id];

  // Calculate percentage of total count
  const percentageOfTotal = totalAllCounts > 0 ? ((count / totalAllCounts) * 100).toFixed(1) : "0.0";

  // Helper to build 1:1 mapping from positions in pet.hintInitials/pinyinInitials to original text indexes
  const buildAlignment = (text: string, initials: string) => {
    const mapping: number[] = [];
    let initialsIdx = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isPunctuation = /[\s，。！？、；：（）「」【】“”"'.:;!?,\-_()]/u.test(char);
      if (!isPunctuation) {
        if (initialsIdx < initials.length) {
          mapping.push(i);
          initialsIdx++;
        }
      }
    }
    return mapping;
  };

  // Build character mapping for pet names with pinyin syllables
  const buildNamePinyinMapping = (name: string, pinyinInitials: string, pinyinName: string) => {
    const mapping: Array<{ charIndex: number; initial: string; startInPinyin: number; endInPinyin: number }> = [];
    if (!pinyinInitials || !pinyinName) return [];

    // Filter characters in the name to match character by character with initials
    // Skip parentheses elements (e.g. "(无异色)") to prevent alignment offsets
    const cleanCharsIndices: number[] = [];
    for (let i = 0; i < name.length; i++) {
      const char = name[i];
      if (char !== "(" && char !== "（" && char !== ")" && char !== "）") {
        const hasParenSuffix = name.substring(i).startsWith("（无异色）") || name.substring(i).startsWith("(无异色)");
        if (hasParenSuffix) {
          const suffixLen = name.substring(i).indexOf("）") === -1 ? 5 : name.substring(i).indexOf("）") + 1;
          i += suffixLen - 1;
          continue;
        }
        cleanCharsIndices.push(i);
      }
    }

    // Partition pinyinName into segments based on initials letters sequence
    let currentIdxInPinyin = 0;
    const parts: Array<{ start: number; end: number }> = [];

    for (let i = 0; i < pinyinInitials.length; i++) {
      const initChar = pinyinInitials[i].toLowerCase();
      let foundIdx = -1;
      for (let j = currentIdxInPinyin; j <= pinyinName.length - (pinyinInitials.length - i); j++) {
        if (pinyinName[j].toLowerCase() === initChar) {
          foundIdx = j;
          break;
        }
      }
      if (foundIdx !== -1) {
        parts.push({ start: foundIdx, end: -1 });
        if (i > 0) {
          parts[i - 1].end = foundIdx;
        }
        currentIdxInPinyin = foundIdx + 1;
      } else {
        parts.push({ start: currentIdxInPinyin, end: currentIdxInPinyin + 1 });
        currentIdxInPinyin++;
      }
    }
    if (parts.length > 0) {
      parts[parts.length - 1].end = pinyinName.length;
    }

    // Map the cleaned indices to partitioned parts
    for (let i = 0; i < pinyinInitials.length; i++) {
      const charIdx = cleanCharsIndices[i];
      if (charIdx !== undefined && parts[i]) {
        mapping.push({
          charIndex: charIdx,
          initial: pinyinInitials[i],
          startInPinyin: parts[i].start,
          endInPinyin: parts[i].end
        });
      }
    }

    return mapping;
  };

  // Highlight matches inside name
  const renderHighlightedName = (name: string, query: string) => {
    if (!query.trim()) return name;
    const trimmedQuery = query.trim().toLowerCase();

    const intervals: Array<{ start: number; end: number; isKeyword: boolean }> = [];
    const nameLower = name.toLowerCase();

    // 1. Literal query direct substring match in name (e.g. "海葵")
    let pos = 0;
    while ((pos = nameLower.indexOf(trimmedQuery, pos)) !== -1) {
      intervals.push({
        start: pos,
        end: pos + trimmedQuery.length,
        isKeyword: false
      });
      pos += Math.max(1, trimmedQuery.length);
    }

    const pinyinMapping = buildNamePinyinMapping(name, pet.pinyinInitials, pet.pinyinName);

    // 2. Initials Match in initials (e.g. "yh" -> maps to "油海" starting at index 1 and 2 in clean values)
    if (pet.pinyinInitials) {
      const initialsLower = pet.pinyinInitials.toLowerCase();
      let initPos = 0;
      while ((initPos = initialsLower.indexOf(trimmedQuery, initPos)) !== -1) {
        const startMap = pinyinMapping[initPos];
        const endMap = pinyinMapping[initPos + trimmedQuery.length - 1];
        if (startMap && endMap) {
          intervals.push({
            start: startMap.charIndex,
            end: endMap.charIndex + 1,
            isKeyword: false
          });
        }
        initPos += Math.max(1, trimmedQuery.length);
      }
    }

    // 3. Pinyin Name Substring Match (e.g., "haikui" -> maps clean character ranges)
    if (pet.pinyinName && /^[a-z]+$/i.test(trimmedQuery) && checkPinyinMatch(pet.pinyinName, pet.pinyinInitials, trimmedQuery)) {
      const pinyinLower = pet.pinyinName.toLowerCase();
      let pinPos = 0;
      while ((pinPos = pinyinLower.indexOf(trimmedQuery, pinPos)) !== -1) {
        const queryEnd = pinPos + trimmedQuery.length;
        let firstMatchedCharIdx: number | null = null;
        let lastMatchedCharIdx: number | null = null;

        pinyinMapping.forEach(item => {
          const overlap = Math.max(0, Math.min(item.endInPinyin, queryEnd) - Math.max(item.startInPinyin, pinPos));
          if (overlap > 0) {
            if (firstMatchedCharIdx === null || item.charIndex < firstMatchedCharIdx) {
              firstMatchedCharIdx = item.charIndex;
            }
            if (lastMatchedCharIdx === null || item.charIndex > lastMatchedCharIdx) {
              lastMatchedCharIdx = item.charIndex;
            }
          }
        });

        if (firstMatchedCharIdx !== null && lastMatchedCharIdx !== null) {
          intervals.push({
            start: firstMatchedCharIdx,
            end: lastMatchedCharIdx + 1,
            isKeyword: false
          });
        }
        pinPos += Math.max(1, trimmedQuery.length);
      }
    }

    if (intervals.length === 0) return name;

    // Sort and Merge intervals
    const sortedIntervals = [...intervals].sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.end - a.end;
    });

    const mergedIntervals: Array<{ start: number; end: number; isKeyword: boolean }> = [];
    sortedIntervals.forEach(interval => {
      if (mergedIntervals.length === 0) {
        mergedIntervals.push(interval);
      } else {
        const last = mergedIntervals[mergedIntervals.length - 1];
        if (interval.start < last.end) {
          last.end = Math.max(last.end, interval.end);
          last.isKeyword = last.isKeyword && interval.isKeyword;
        } else {
          mergedIntervals.push(interval);
        }
      }
    });

    // Render marked segments
    const renderedNodes: React.ReactNode[] = [];
    let lastIndex = 0;

    mergedIntervals.forEach((interval, idx) => {
      if (interval.start > lastIndex) {
        renderedNodes.push(name.substring(lastIndex, interval.start));
      }
      const matchedText = name.substring(interval.start, interval.end);
      renderedNodes.push(
        <mark key={idx} className="bg-amber-300 text-stone-950 px-1 py-0.5 rounded font-black shadow-xs hover:bg-amber-400 transition-colors duration-150">
          {matchedText}
        </mark>
      );
      lastIndex = interval.end;
    });

    if (lastIndex < name.length) {
      renderedNodes.push(name.substring(lastIndex));
    }

    return <span>{renderedNodes}</span>;
  };

  // Highlight matches inside clue text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const trimmedQuery = query.trim().toLowerCase();

    // List of intervals in the text to highlight
    const intervals: Array<{ start: number; end: number; isKeyword: boolean }> = [];
    const textLower = text.toLowerCase();

    // 1. Literal query direct substring match
    let pos = 0;
    while ((pos = textLower.indexOf(trimmedQuery, pos)) !== -1) {
      intervals.push({
        start: pos,
        end: pos + trimmedQuery.length,
        isKeyword: false
      });
      pos += Math.max(1, trimmedQuery.length);
    }

    // 2. Keyword exact/pinyin initial match
    pet.keywords.forEach((keyword, i) => {
      const initial = pet.keywordInitials[i];
      const isKeywordContentMatch = keyword.toLowerCase().includes(trimmedQuery);
      const isInitialMatch = initial && (initial.toLowerCase() === trimmedQuery || initial.toLowerCase().startsWith(trimmedQuery));

      if (isKeywordContentMatch || isInitialMatch) {
        let matchStartInKeyword = 0;
        let matchLength = keyword.length;

        if (isKeywordContentMatch) {
          matchStartInKeyword = keyword.toLowerCase().indexOf(trimmedQuery);
          matchLength = trimmedQuery.length;
        } else if (isInitialMatch) {
          matchStartInKeyword = 0;
          matchLength = trimmedQuery.length;
        }

        const kwLower = keyword.toLowerCase();
        let kwPos = 0;
        while ((kwPos = textLower.indexOf(kwLower, kwPos)) !== -1) {
          intervals.push({
            start: kwPos + matchStartInKeyword,
            end: kwPos + matchStartInKeyword + matchLength,
            isKeyword: true
          });
          kwPos += Math.max(1, keyword.length);
        }
      }
    });

    // 3. Initials substring match (e.g. "ppd" matching "砰砰的" and "噼啪的" via hintInitials)
    if (pet.hintInitials) {
      const initialsLower = pet.hintInitials.toLowerCase();
      let initPos = 0;
      const alignmentMapping = buildAlignment(text, pet.hintInitials);

      while ((initPos = initialsLower.indexOf(trimmedQuery, initPos)) !== -1) {
        const startTextIdx = alignmentMapping[initPos];
        const endTextIdx = alignmentMapping[initPos + trimmedQuery.length - 1];

        if (startTextIdx !== undefined && endTextIdx !== undefined) {
          intervals.push({
            start: startTextIdx,
            end: endTextIdx + 1,
            isKeyword: false
          });
        }
        initPos += Math.max(1, trimmedQuery.length);
      }
    }

    if (intervals.length === 0) return text;

    // Sort intervals by start index ascending, then by length descending (end index descending)
    const sortedIntervals = [...intervals].sort((a, b) => {
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return b.end - a.end;
    });

    // Merge overlapping/nested intervals
    const mergedIntervals: Array<{ start: number; end: number; isKeyword: boolean }> = [];
    sortedIntervals.forEach(interval => {
      if (mergedIntervals.length === 0) {
        mergedIntervals.push(interval);
      } else {
        const last = mergedIntervals[mergedIntervals.length - 1];
        if (interval.start < last.end) {
          // Overlap! Merge by taking the max end index
          last.end = Math.max(last.end, interval.end);
          // If either was a direct query match (isKeyword = false), make the merged interval direct (amber)
          last.isKeyword = last.isKeyword && interval.isKeyword;
        } else {
          mergedIntervals.push(interval);
        }
      }
    });

    // Slice text and map to React nodes
    const renderedNodes: React.ReactNode[] = [];
    let lastIndex = 0;

    mergedIntervals.forEach((interval, idx) => {
      // Unmatched leading part
      if (interval.start > lastIndex) {
        renderedNodes.push(text.substring(lastIndex, interval.start));
      }
      // Highlighted part
      const matchedText = text.substring(interval.start, interval.end);
      const className = interval.isKeyword
        ? "bg-emerald-200 text-emerald-950 px-1 py-0.5 rounded font-black shadow-xs hover:bg-emerald-300 transition-colors duration-150"
        : "bg-amber-300 text-stone-950 px-1 py-0.5 rounded font-black shadow-xs hover:bg-amber-400 transition-colors duration-150";

      renderedNodes.push(
        <mark key={idx} className={className}>
          {matchedText}
        </mark>
      );
      lastIndex = interval.end;
    });

    // Remainder of text
    if (lastIndex < text.length) {
      renderedNodes.push(text.substring(lastIndex));
    }

    return <span>{renderedNodes}</span>;
  };

  // Get elemental type label
  const getElementType = () => {
    return pet.attributes;
  };

  const idx = petIndices[pet.id];

  // Status-based opacity and glow
  const cardOpacity = hasActiveSearch && !isMatched ? "opacity-15 saturate-35 grayscale-60 scale-[0.97]" : "opacity-100 scale-100";
  const borderStyle = hasActiveSearch && isMatched 
    ? "border-2 border-amber-600 shadow-[0_0_14px_rgba(217,119,6,0.22)] ring-1 ring-amber-500/10" 
    : "border border-stone-850/15 hover:border-stone-850/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] shadow-sm";

  return (
    <div 
      id={`pet-card-${pet.id}`} 
      onClick={() => onIncrement(pet.id)}
      style={{ backgroundColor: "#f2eadd" }}
      className={`relative rounded-lg p-2.5 min-[360px]:p-3 sm:p-3.5 flex flex-col justify-start gap-2.5 sm:gap-3.5 text-left transition-all duration-200 h-full cursor-pointer hover:scale-[1.01] active:scale-[0.98] select-none ${cardOpacity} ${borderStyle}`}
    >
      {/* Top Part: Avatar on Left, Name/Attributes/Status on Right */}
      <div className="flex items-center gap-2 sm:gap-3 w-full shrink-0">
        {/* Sprite or Custom Avatar */}
        {petImageMap[pet.id] ? (
          <div 
            className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-md border border-stone-300 bg-white overflow-hidden shrink-0 shadow-sm select-none pointer-events-none flex items-center justify-center p-0"
          >
            <img 
              src={petImageMap[pet.id]} 
              alt={pet.name} 
              className="w-full h-full object-cover rounded-md"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : attrAvatar ? (
          <div 
            style={{ backgroundColor: "#f2eadd" }}
            className={`w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-md border ${attrAvatar.borderClass} overflow-hidden shrink-0 ${attrAvatar.glowClass} select-none pointer-events-none flex flex-col items-center justify-center relative p-1`}
          >
            <attrAvatar.icon className={`w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 stroke-[1.5] ${attrAvatar.colorClass}`} />
            <span className="text-[8px] sm:text-[9px] font-sans font-black text-stone-800 absolute bottom-0.5 leading-none bg-stone-150/90 border border-stone-250 px-1 py-0.5 rounded-sm scale-90">
              {attrAvatar.text}
            </span>
          </div>
        ) : (
          <div 
            style={{ backgroundColor: "#f2eadd" }}
            className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-md border border-stone-300 overflow-hidden shrink-0 shadow-sm select-none pointer-events-none flex items-center justify-center text-stone-600"
          >
            {idx !== undefined ? (
              <div 
                className="w-full h-full animate-fade-in"
                style={{
                  backgroundImage: `url('/src/assets/images/pet_box_avatars_1779439619741.png')`,
                  backgroundSize: '600% 300%',
                  backgroundPosition: `${(idx % 6) / 5 * 100}% ${Math.floor(idx / 6) / 2 * 100}%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            ) : (
              <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 stroke-[1.5] text-amber-600 animate-pulse" />
            )}
          </div>
        )}

        {/* Right column of top row: Name & Attribute info */}
        <div className="flex flex-col items-start gap-0.5 sm:gap-1 justify-center min-w-0 flex-1">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap w-full">
            <h3 className={`text-sm min-[360px]:text-base sm:text-lg md:text-xl font-black font-sans text-stone-950 leading-tight truncate ${hasActiveSearch && isMatched ? "text-amber-950" : ""}`} title={pet.name}>
              {renderHighlightedName(pet.name, searchQuery)}
            </h3>
            {getElementType() && (
              <span className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-stone-950/10 text-stone-900 border border-stone-950/15 font-black shrink-0">
                {getElementType()}
              </span>
            )}
          </div>
          
          {hasActiveSearch && isMatched && (
            <span className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-900 border border-amber-500/25 font-extrabold select-none animate-pulse">
              已对齐
            </span>
          )}
        </div>
      </div>

      {/* Main Info Columns */}
      <div className="flex-1 w-full min-h-0 flex flex-col justify-between gap-2.5 sm:gap-3">
        {/* Highlighted hint without prefix text (increased size by 50%) */}
        <p className="text-[13px] min-[360px]:text-[14.5px] sm:text-[15.5px] xl:text-[16.8px] text-stone-900 leading-snug select-all font-bold text-left">
          {renderHighlightedText(pet.hint, searchQuery)}
        </p>

        {/* Dynamic Intuitive Counter Buttons */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 mt-auto pt-1.5 sm:pt-2 w-full border-t border-stone-950/10 shrink-0 select-none">
          <div className="flex flex-col items-start justify-center leading-none">
            <span className="text-[10px] sm:text-[11px] text-stone-500/90 font-black font-sans">计数:</span>
            {count > 0 && totalAllCounts > 0 && (
              <span className="text-[9px] text-amber-800 font-bold font-sans mt-0.5" title={`${pet.name}占总计数的比例`}>
                占比 {percentageOfTotal}%
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Avoid duplicate/double triggers
                onDecrement(pet.id);
              }}
              className="w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center rounded bg-white hover:bg-stone-100 active:bg-stone-200 text-[10px] sm:text-xs text-stone-800 font-extrabold transition-all border border-stone-300 active:scale-90 shadow-xs shrink-0"
              title="手动减少计数"
            >
              -
            </button>
            
            <span 
              className={`text-[9px] sm:text-[10px] md:text-[11px] font-black font-mono px-1.5 sm:px-2 py-0.5 rounded transition-all min-w-[14px] sm:min-w-[18px] text-center shrink-0 ${
                count > 0 
                  ? "bg-amber-500 text-stone-950 font-black shadow-[0_2px_6px_rgba(245,158,11,0.35)]" 
                  : "bg-stone-200/50 text-stone-500 border border-stone-300/60"
              }`}
            >
              {count}
            </span>
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Avoid duplicate/double triggers
                onIncrement(pet.id);
              }}
              className="w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center rounded bg-white hover:bg-stone-100 active:bg-stone-200 text-[10px] sm:text-xs text-stone-800 font-extrabold transition-all border border-stone-300 active:scale-95 shadow-xs shrink-0"
              title="手动增加计数"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
