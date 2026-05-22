import { 
  Music, Sparkles, Waves, Disc, HelpCircle, Smile, Drum, Cpu, Scale, 
  Flame, ShieldCheck, Soup, Flower2, TreePine, Cat, Ghost, Dribbble, 
  Moon, Info
} from "lucide-react";
import { PetBoxData } from "../types";

const iconMap: Record<string, any> = {
  Music, Sparkles, Waves, Disc, Hat: HelpCircle, Smile, Drum, Cpu, Scale, 
  Flame, ShieldCheck, Soup, Flower2, TreePine, Cat, Ghost, Dribbble, Moon
};

interface PetCardProps {
  key?: any;
  pet: PetBoxData;
  searchQuery: string;
  isMatched: boolean;
  hasActiveSearch: boolean;
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

export default function PetCard({ pet, searchQuery, isMatched, hasActiveSearch }: PetCardProps) {
  const IconComponent = iconMap[pet.petIcon] || HelpCircle;

  // Highlight matches inside clue text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const trimmedQuery = query.trim().toLowerCase();
    
    // 1. Try exact match standard text
    const index = text.toLowerCase().indexOf(trimmedQuery);
    if (index >= 0) {
      const before = text.substring(0, index);
      const matched = text.substring(index, index + trimmedQuery.length);
      const after = text.substring(index + trimmedQuery.length);
      return (
        <span>
          {before}
          <mark className="bg-amber-400 text-slate-950 px-0.5 py-0.2 rounded font-semibold">
            {matched}
          </mark>
          {after}
        </span>
      );
    }

    // 2. Try match keyword fallback inside the string to highlight the correct Chinese term
    let matchedKeyword = "";
    for (const keyword of pet.keywords) {
      if (keyword.toLowerCase().includes(trimmedQuery)) {
        matchedKeyword = keyword;
        break;
      }
    }

    for (let i = 0; i < pet.keywordInitials.length; i++) {
      if (pet.keywordInitials[i] === trimmedQuery) {
        matchedKeyword = pet.keywords[i];
        break;
      }
    }

    if (matchedKeyword) {
      const kwIndex = text.indexOf(matchedKeyword);
      if (kwIndex >= 0) {
        const before = text.substring(0, kwIndex);
        const matched = text.substring(kwIndex, kwIndex + matchedKeyword.length);
        const after = text.substring(kwIndex + matchedKeyword.length);
        return (
          <span>
            {before}
            <mark className="bg-emerald-400 text-slate-950 px-0.5 py-0.2 rounded font-semibold whitespace-nowrap">
              {matched}
            </mark>
            {after}
          </span>
        );
      }
    }

    return text;
  };

  // Get elemental type label
  const getElementType = () => {
    switch (pet.id) {
      case "yindiehou": return "声/翼";
      case "yanhuatuan": return "火系";
      case "jiayouhaikui": return "水/草";
      case "xuanguangdidi": return "光/龙";
      case "gugumao": return "魔法";
      case "xiaochoudoudou": return "萌系";
      case "xiaoguxiang": return "石/土";
      case "shuaishuaimoou": return "机械";
      case "gongpingge": return "翼系";
      case "linghu": return "冰/火";
      case "dujiaoshou": return "神圣";
      case "duduguo": return "火系";
      case "juhuali": return "草/蔬";
      case "youyingshu": return "幽灵";
      case "xiaoye": return "暗夜";
      case "emoding": return "恶魔";
      case "guodong": return "水/胶";
      case "xingchenchong": return "虫/星";
      default: return "普通";
    }
  };

  const idx = petIndices[pet.id] ?? 0;

  // Status-based opacity and glow
  const cardOpacity = hasActiveSearch && !isMatched ? "opacity-15 saturate-30 grayscale-75 scale-[0.97]" : "opacity-100 scale-100";
  const borderStyle = hasActiveSearch && isMatched 
    ? "border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] bg-slate-900/95" 
    : "border border-slate-900 bg-slate-900/35 hover:border-slate-800/80 hover:bg-slate-900/50";

  return (
    <div 
      id={`pet-card-${pet.id}`} 
      className={`relative rounded-lg p-2 flex flex-col items-center justify-start gap-1.5 text-center transition-all duration-200 h-full ${cardOpacity} ${borderStyle}`}
    >
      {/* Sprite Avatar */}
      <div 
        className="w-14 h-14 sm:w-16 sm:h-16 md:w-[68px] md:h-[68px] xl:w-20 xl:h-20 rounded-md border border-slate-800 bg-slate-950 overflow-hidden shrink-0 shadow-inner select-none pointer-events-none"
        style={{
          backgroundImage: `url('/src/assets/images/pet_box_avatars_1779439619741.png')`,
          backgroundSize: '600% 300%',
          backgroundPosition: `${(idx % 6) / 5 * 100}% ${Math.floor(idx / 6) / 2 * 100}%`,
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Main Info Columns */}
      <div className="flex-1 w-full min-h-0 flex flex-col justify-start items-center space-y-1">
        {/* Header Name Row */}
        <div className="flex flex-col items-center gap-0.5 shrink-0 w-full">
          <div className="flex items-center gap-1 justify-center max-w-full">
            <h3 className={`text-xs sm:text-sm font-black font-sans text-white truncate ${hasActiveSearch && isMatched ? "text-amber-300" : ""}`}>
              {pet.name}
            </h3>
            <span className="text-[8px] px-1 py-0 rounded bg-slate-800/70 text-slate-400 font-medium scale-90 shrink-0">
              {getElementType()}
            </span>
          </div>
          
          {hasActiveSearch && isMatched && (
            <span className="text-[8px] px-1.5 py-0 rounded bg-amber-400/20 text-amber-300 border border-amber-400/20 font-semibold select-none animate-pulse">
              已对齐
            </span>
          )}
        </div>

        {/* Highlighted hint without prefix text */}
        <p className="text-[10px] sm:text-[11px] xl:text-[11.5px] text-slate-200 leading-snug select-all font-sans text-center">
          {renderHighlightedText(pet.hint, searchQuery)}
        </p>
      </div>
    </div>
  );
}
