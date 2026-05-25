export interface PetBoxData {
  id: string; // unique id
  name: string; // Chinese name of the pet, e.g., "音碟吼"
  pinyinName: string; // Full pinyin without spaces, e.g., "yindiehou"
  pinyinInitials: string; // First letters of pet name, e.g., "ydh"
  hint: string; // The exact clue text
  hintInitials: string; // Character-by-character initials of the hint text
  keywords: string[]; // Crucial visual or audio keywords, e.g., ["穿透力", "嘹亮"]
  keywordInitials: string[]; // Initials of key phrases, e.g., ["ctl", "ll"]
  themeColor: string; // Theme color class for backgrounds (e.g. "from-purple-500 to-indigo-600")
  badgeColor: string; // Color of the text bubble badge
  petIcon: string; // A Lucide icon key or name
  description: string; // Short stylized description of what kind of pet it is
  attributes: string; // Elemental attributes, e.g., "普通/机械"
}
