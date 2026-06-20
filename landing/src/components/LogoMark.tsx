/**
 * arsam.net logo işareti — hero arazi illüstrasyonunun minimalist versiyonu.
 * İzometrik 4 parsel + altın "seçili parsel" + konum pini. Header'da ~36px logo olarak kullanılır.
 * Dekoratif: aria-hidden (yanında metin marka adını taşır).
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <g strokeLinejoin="round">
        {/* üst */}
        <polygon points="20,5 27.5,12.5 20,20 12.5,12.5" fill="#9ccc65" stroke="#ffffff" strokeWidth="1.1" />
        {/* sağ */}
        <polygon points="27.5,12.5 35,20 27.5,27.5 20,20" fill="#6aa336" stroke="#ffffff" strokeWidth="1.1" />
        {/* sol */}
        <polygon points="12.5,12.5 20,20 12.5,27.5 5,20" fill="#7cb342" stroke="#ffffff" strokeWidth="1.1" />
        {/* alt · seçili parsel (altın) */}
        <polygon points="20,20 27.5,27.5 20,35 12.5,27.5" fill="#e6c34d" stroke="#ffffff" strokeWidth="1.1" />
      </g>
      {/* konum pini */}
      <path
        d="M20 23.5 C 17 19.8 15.8 18.4 15.8 16.2 A 4.2 4.2 0 1 1 24.2 16.2 C 24.2 18.4 23 19.8 20 23.5 Z"
        fill="#4d7c1f"
        stroke="#ffffff"
        strokeWidth="1.2"
      />
      <circle cx="20" cy="16.2" r="1.8" fill="#ffffff" />
    </svg>
  );
}
