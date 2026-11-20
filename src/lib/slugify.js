// Smart Bilingual SEO Slug Generator (English + Urdu -> Roman-Urdu Transliteration)

const URDU_TO_LATIN = {
  ا: "a", آ: "aa", ب: "b", پ: "p", ت: "t", ٹ: "t", ث: "s",
  ج: "j", چ: "ch", ح: "h", خ: "kh", د: "d", ڈ: "d", ذ: "z",
  ر: "r", ڑ: "r", ز: "z", ژ: "zh", س: "s", ش: "sh", ص: "s",
  ض: "z", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q",
  ک: "k", گ: "g", ل: "l", م: "m", ن: "n", ں: "n", و: "o",
  ہ: "h", ھ: "h", ء: "", ی: "i", ے: "e", ؤ: "o", ئ: "i",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

export function transliterateUrdu(text) {
  if (!text) return "";
  let out = "";
  for (const ch of String(text)) {
    if (URDU_TO_LATIN[ch] !== undefined) {
      out += URDU_TO_LATIN[ch];
    } else if (/[a-zA-Z0-9\s-]/.test(ch)) {
      out += ch;
    } else if (/[\u0600-\u06FF]/.test(ch)) {
      // skip diacritics (zabar, zer, pesh, etc.)
      continue;
    } else {
      out += " ";
    }
  }
  return out;
}

export function generateSeoSlug({ titleEn = "", titleUr = "", focusKeyword = "", categorySlug = "" }) {
  const source = (titleEn && titleEn.trim()) || (focusKeyword && focusKeyword.trim()) || transliterateUrdu(titleUr);
  let base = String(source || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");

  if (!base) {
    base = `story-${Date.now().toString(36)}`;
  }

  if (categorySlug && !base.startsWith(`${categorySlug}-`)) {
    const cleanCat = String(categorySlug).toLowerCase().replace(/[^a-z0-9-]+/g, "");
    if (cleanCat) {
      return `${cleanCat}-${base}`.slice(0, 84).replace(/-+$/g, "");
    }
  }

  return base;
}
