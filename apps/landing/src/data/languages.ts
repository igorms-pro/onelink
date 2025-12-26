export type Language = {
  code: string;
  name: string;
  flag: string;
  langCode?: string;
};

export const languages: Language[] = [
  { code: "EN", name: "English", flag: "🇬🇧" },
  { code: "FR", name: "Français", flag: "🇫🇷" },
  { code: "ES", name: "Español", flag: "🇪🇸" },
  { code: "PT", name: "Português", flag: "🇵🇹" },
  { code: "BR", name: "Português (Brasil)", flag: "🇧🇷", langCode: "pt-BR" },
  { code: "JA", name: "日本語", flag: "🇯🇵" },
  { code: "ZH", name: "中文", flag: "🇨🇳" },
  { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "IT", name: "Italiano", flag: "🇮🇹" },
  { code: "RU", name: "Русский", flag: "🇷🇺" },
];
