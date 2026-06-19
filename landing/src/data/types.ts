export interface Metric {
  value: string | number;
  unit: string;
  display: string;
  label: string;
  source?: string;
  note?: string;
}

export interface NavMeta {
  num: string;
  label: string;
}

export interface SectionTitle {
  text: string;
  accent?: string;
}

/** Bloklar `type` ayırıcılı; alanlar bloğa göre değişir (gevşek tip — JSON doğrulanmış kaynaktır). */
export interface Block {
  type: string;
  [key: string]: any;
}

export interface SectionRefs {
  metrics?: string[];
  data?: string[];
  sources?: string[];
  glossary?: string[];
  shared?: string[];
}

export interface Section {
  id: string;
  kind: "section";
  order: number;
  slug: string;
  nav: NavMeta;
  background: string;
  title: SectionTitle;
  blocks: Block[];
  refs?: SectionRefs;
}

export interface FinancialYear {
  year: string;
  revenue: number;
  expense: number;
  net: number;
  headcount: number;
  cashEnd: number;
}
