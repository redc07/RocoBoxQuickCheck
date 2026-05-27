/**
 * Checks if a search query is a precise Pinyin match for a pet's Pinyin representation.
 * It returns true if the query is a prefix of the entire Pinyin name OR if the query
 * matches a contiguous sequence of complete syllables in the name.
 */
export const checkPinyinMatch = (pinyinName: string, pinyinInitials: string, query: string): boolean => {
  if (!pinyinName || !pinyinInitials || !query) return false;
  const q = query.toLowerCase().trim();
  const pName = pinyinName.toLowerCase();
  const pInit = pinyinInitials.toLowerCase();

  if (!q) return false;

  // 1. Prefix match (e.g. "xiao" matches "xiaochoudoudou")
  if (pName.startsWith(q)) return true;

  // 2. Extract individual syllables based on initials offsets
  let currentIdx = 0;
  const parts: Array<{ start: number; end: number }> = [];

  for (let i = 0; i < pInit.length; i++) {
    const initChar = pInit[i];
    let foundIdx = -1;
    for (let j = currentIdx; j <= pName.length - (pInit.length - i); j++) {
      if (pName[j] === initChar) {
        foundIdx = j;
        break;
      }
    }
    if (foundIdx !== -1) {
      parts.push({ start: foundIdx, end: -1 });
      if (i > 0) {
        parts[i - 1].end = foundIdx;
      }
      currentIdx = foundIdx + 1;
    } else {
      parts.push({ start: currentIdx, end: currentIdx + 1 });
      currentIdx++;
    }
  }
  if (parts.length > 0) {
    parts[parts.length - 1].end = pName.length;
  }

  const syllables = parts.map(part => pName.substring(part.start, part.end));

  // 3. Exact match check of consecutive syllables
  // E.g. "chou" matches "chou", "doudou" matches "dou" + "dou", "choudou" matches "chou" + "dou"
  for (let start = 0; start < syllables.length; start++) {
    let currentConcat = "";
    for (let end = start; end < syllables.length; end++) {
      currentConcat += syllables[end];
      if (currentConcat === q) {
        return true;
      }
    }
  }

  return false;
};
