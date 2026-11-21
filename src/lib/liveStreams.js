export const DEFAULT_LIVE_STREAMS = [
  {
    id: "afadiat-hls",
    name_ur: "ڈیلی افادیت لائیو (HLS)",
    name_en: "Daily Afadiat Live (HLS)",
    desc_ur: "روزنامہ افادیت ایچ ڈی براہِ راست نشریات",
    desc_en: "Daily Afadiat HD Live Stream",
    provider: "hls",
    isLive: true,
    streamUrl: "https://mtoczko.github.io/hls-test-streams/test-vtt/playlist.m3u8",
    embedUrl: "",
  },
  {
    id: "afadiat-live",
    name_ur: "ڈیلی افادیت لائیو",
    name_en: "Daily Afadiat Live",
    desc_ur: "اسلام آباد اسٹوڈیو — ۲۴ گھنٹے بریکنگ نیوز اور حالاتِ حاضرہ",
    desc_en: "Islamabad Studio — 24/7 Breaking News & Current Affairs",
    provider: "youtube",
    isLive: true,
    streamUrl: "",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig",
  },
  {
    id: "afadiat-news-24",
    name_ur: "افادیت نیوز ۲۴",
    name_en: "Afadiat News 24",
    desc_ur: "بزنس، مارکیٹس اور خصوصی رپورٹس",
    desc_en: "Business, Markets & Special Bulletins",
    provider: "youtube",
    isLive: true,
    streamUrl: "",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig",
  },
  {
    id: "afadiat-world",
    name_ur: "افادیت ورلڈ",
    name_en: "Afadiat World",
    desc_ur: "بین الاقوامی اور کھیلوں کی خصوصی نشریات",
    desc_en: "International & Sports Special Coverage",
    provider: "youtube",
    isLive: false,
    streamUrl: "",
    embedUrl: "",
  },
];

export function toYouTubeEmbedUrl(input = "") {
  const val = String(input || "").trim();
  if (!val) return "";
  if (val.includes("youtube.com/embed/")) return val;
  if (/^UC[a-zA-Z0-9_-]{10,}$/.test(val)) {
    return `https://www.youtube.com/embed/live_stream?channel=${val}`;
  }
  const watchMatch = val.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = val.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const liveMatch = val.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}`;
  return val;
}
