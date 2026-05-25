import { 
  Music, Sparkles, Waves, Disc, HelpCircle, Smile, Drum, Cpu, Scale, 
  Flame, ShieldCheck, Soup, Flower2, TreePine, Cat, Ghost, Dribbble, 
  Moon, Info, Heart, Bird, Bug, Sun
} from "lucide-react";
import { PetBoxData } from "../types";

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

export default function PetCard({ pet, searchQuery, isMatched, hasActiveSearch, count, onIncrement, onDecrement }: PetCardProps) {
  const IconComponent = iconMap[pet.petIcon] || HelpCircle;
  const attrAvatar = attributeAvatarMap[pet.id];

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
          <mark className="bg-amber-300 text-stone-950 px-1 py-0.5 rounded font-black shadow-sm">
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
            <mark className="bg-emerald-200 text-emerald-950 px-1 py-0.5 rounded font-black whitespace-nowrap shadow-sm">
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
      className={`relative rounded-lg p-3.5 flex flex-col justify-start gap-3.5 text-left transition-all duration-200 h-full cursor-pointer hover:scale-[1.01] active:scale-[0.98] select-none ${cardOpacity} ${borderStyle}`}
    >
      {/* Top Part: Avatar on Left, Name/Attributes/Status on Right */}
      <div className="flex items-center gap-3 w-full shrink-0">
        {/* Sprite or Custom Avatar */}
        {petImageMap[pet.id] ? (
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-md border border-stone-300 bg-white overflow-hidden shrink-0 shadow-sm select-none pointer-events-none flex items-center justify-center p-0"
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
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-md border ${attrAvatar.borderClass} ${attrAvatar.bgClass} overflow-hidden shrink-0 ${attrAvatar.glowClass} select-none pointer-events-none flex flex-col items-center justify-center relative p-1`}
          >
            <attrAvatar.icon className={`w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5] ${attrAvatar.colorClass}`} />
            <span className="text-[9px] font-sans font-black text-stone-800 absolute bottom-0.5 leading-none bg-stone-150/90 border border-stone-250 px-1 py-0.5 rounded-sm scale-90">
              {attrAvatar.text}
            </span>
          </div>
        ) : (
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-md border border-stone-300 bg-stone-50 overflow-hidden shrink-0 shadow-md select-none pointer-events-none flex items-center justify-center text-stone-600 bg-stone-100"
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
              <IconComponent className="w-8 h-8 stroke-[1.5] text-amber-600 animate-pulse" />
            )}
          </div>
        )}

        {/* Right column of top row: Name & Attribute info */}
        <div className="flex flex-col items-start gap-1 justify-center min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap w-full">
            <h3 className={`text-[18px] sm:text-[21px] font-black font-sans text-stone-950 leading-tight truncate ${hasActiveSearch && isMatched ? "text-amber-950" : ""}`}>
              {pet.name}
            </h3>
            {getElementType() && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-950/10 text-stone-900 border border-stone-950/15 font-black shrink-0">
                {getElementType()}
              </span>
            )}
          </div>
          
          {hasActiveSearch && isMatched && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-900 border border-amber-500/25 font-extrabold select-none animate-pulse">
              已对齐
            </span>
          )}
        </div>
      </div>

      {/* Main Info Columns */}
      <div className="flex-1 w-full min-h-0 flex flex-col justify-between gap-3">
        {/* Highlighted hint without prefix text (increased size by 50%) */}
        <p className="text-[15px] sm:text-[16.5px] xl:text-[17.5px] text-stone-900 leading-snug select-all font-bold text-left">
          {renderHighlightedText(pet.hint, searchQuery)}
        </p>

        {/* Dynamic Intuitive Counter Buttons */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2 w-full border-t border-stone-950/10 shrink-0 select-none">
          <span className="text-[11px] text-stone-500/90 font-black font-sans">计数:</span>
          
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Avoid duplicate/double triggers
                onDecrement(pet.id);
              }}
              className="w-5 h-5 flex items-center justify-center rounded bg-white hover:bg-stone-100 active:bg-stone-200 text-xs text-stone-800 font-extrabold transition-all border border-stone-300 active:scale-90 shadow-xs"
              title="手动减少计数"
            >
              -
            </button>
            
            <span 
              className={`text-[10px] md:text-[11px] font-black font-mono px-2 py-0.5 rounded transition-all min-w-[18px] text-center ${
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
              className="w-5 h-5 flex items-center justify-center rounded bg-white hover:bg-stone-100 active:bg-stone-200 text-xs text-stone-800 font-extrabold transition-all border border-stone-300 active:scale-95 shadow-xs"
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
