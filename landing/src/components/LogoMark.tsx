/**
 * arsam.net logo işareti — hero arazi illüstrasyonunun minimalist versiyonu.
 * İzometrik 4 parsel + altın "seçili parsel" + konum pini. Şekil viewBox'ı tümüyle doldurur
 * (boşluksuz), böylece küçük boyutta bile net görünür. Header'da ~48px kullanılır.
 */
export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <g strokeLinejoin="round">
        {/* üst */}
        <polygon points="20,3 28.5,11.5 20,20 11.5,11.5" fill="#9ccc65" stroke="#ffffff" strokeWidth="1.2" />
        {/* sağ */}
        <polygon points="28.5,11.5 37,20 28.5,28.5 20,20" fill="#6aa336" stroke="#ffffff" strokeWidth="1.2" />
        {/* sol */}
        <polygon points="11.5,11.5 20,20 11.5,28.5 3,20" fill="#7cb342" stroke="#ffffff" strokeWidth="1.2" />
        {/* alt · seçili parsel (altın) */}
        <polygon points="20,20 28.5,28.5 20,37 11.5,28.5" fill="#e6c34d" stroke="#ffffff" strokeWidth="1.2" />
      </g>
      {/* konum pini */}
      <path
        d="M20 25 C 16.4 20.4 15.1 18.8 15.1 15.8 A 4.9 4.9 0 1 1 24.9 15.8 C 24.9 18.8 23.6 20.4 20 25 Z"
        fill="#4d7c1f"
        stroke="#ffffff"
        strokeWidth="1.4"
      />
      <circle cx="20" cy="15.8" r="2.1" fill="#ffffff" />
    </svg>
  );
}
