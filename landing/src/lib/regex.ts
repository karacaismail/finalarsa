/** Regex meta karakterlerini kaçışlar — kullanıcı/JSON girdisini güvenli arama desenine çevirir.
 *  Tek kaynak: GlossaryTerm ve MarkHighlight aynı kaçış mantığını buradan kullanır. */
export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
