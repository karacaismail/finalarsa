import { Box } from "@chakra-ui/react";

/**
 * Hero illüstrasyonu — parsellere bölünmüş arazi (izometrik patchwork).
 * Custom görsel kuralı gereği SVG; tema paletiyle (çimen yeşili/altın) uyumlu, düz/flat illüstrasyon.
 * Dekoratif ama anlamlı: role="img" + aria-label. Mobilde küçülür, masaüstünde sağ kolonu doldurur.
 */
export function HeroArt() {
  return (
    <Box w="100%" maxW={{ base: "320px", lg: "100%" }} mx={{ base: "auto", lg: "0" }} aria-hidden={false}>
      <svg
        viewBox="0 0 460 470"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Parsellere bölünmüş arazi illüstrasyonu — dikey arsa pazaryeri"
      >
        {/* yumuşak arka plan */}
        <circle cx="232" cy="250" r="220" fill="#f3f7ec" />

        {/* güneş */}
        <circle cx="392" cy="96" r="38" fill="#f0c34b" opacity="0.18" />
        <circle cx="392" cy="96" r="25" fill="#f0c34b" />

        {/* uzak tepeler (diamond arkasında) */}
        <path d="M30 215 Q 140 150 232 182 Q 330 150 432 215 Z" fill="#cfe3b4" />
        <path d="M70 218 Q 170 168 250 192 Q 340 165 420 220 Z" fill="#b6d68f" />

        {/* arazi gölgesi */}
        <ellipse cx="232" cy="422" rx="180" ry="26" fill="#000000" opacity="0.05" />

        {/* parseller (izometrik patchwork) */}
        <g strokeLinejoin="round">
          <polygon points="230,175 300,215 230,255 160,215" fill="#7cb342" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
          <polygon points="300,215 370,255 300,295 230,255" fill="#9ccc65" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
          <polygon points="370,255 440,295 370,335 300,295" fill="#6aa336" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
          <polygon points="160,215 230,255 160,295 90,255" fill="#6aa336" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
          {/* merkez = seçili parsel (altın) */}
          <polygon points="230,255 300,295 230,335 160,295" fill="#e6c34d" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
          <polygon points="300,295 370,335 300,375 230,335" fill="#7cb342" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
          <polygon points="90,255 160,295 90,335 20,295" fill="#9ccc65" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
          <polygon points="160,295 230,335 160,375 90,335" fill="#7cb342" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
          <polygon points="230,335 300,375 230,415 160,375" fill="#5a8a2e" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" />
        </g>

        {/* seçili parsel altın kesik çizgi vurgu */}
        <polygon points="230,255 300,295 230,335 160,295" fill="none" stroke="#cc9900" strokeWidth="2.5" strokeDasharray="6 5" />

        {/* mahsul satırları (doku) */}
        <g stroke="#5a8a2e" strokeWidth="1.4" opacity="0.35" strokeLinecap="round">
          <line x1="312" y1="226" x2="350" y2="247" />
          <line x1="305" y1="234" x2="343" y2="255" />
          <line x1="298" y1="242" x2="336" y2="263" />
        </g>

        {/* sol arka ağaç (küçük) */}
        <g>
          <ellipse cx="96" cy="298" rx="16" ry="5" fill="#000000" opacity="0.06" />
          <rect x="93" y="283" width="5" height="14" rx="2" fill="#8a6a3a" />
          <circle cx="96" cy="280" r="13" fill="#4d7c1f" />
          <circle cx="88" cy="284" r="9" fill="#6aa336" />
          <circle cx="104" cy="284" r="8" fill="#7cb342" />
        </g>

        {/* sağ ağaç */}
        <g>
          <ellipse cx="372" cy="300" rx="20" ry="6" fill="#000000" opacity="0.07" />
          <rect x="368" y="280" width="7" height="20" rx="3" fill="#8a6a3a" />
          <circle cx="372" cy="278" r="18" fill="#4d7c1f" />
          <circle cx="360" cy="284" r="12" fill="#6aa336" />
          <circle cx="384" cy="283" r="11" fill="#7cb342" />
        </g>

        {/* konum pini (merkez parselde) */}
        <g>
          <ellipse cx="230" cy="298" rx="15" ry="4.5" fill="#000000" opacity="0.13" />
          <path
            d="M230 296 C 218 280 213 274 213 265 A 17 17 0 1 1 247 265 C 247 274 242 280 230 296 Z"
            fill="#4d7c1f"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <circle cx="230" cy="264" r="7" fill="#ffffff" />
          <circle cx="230" cy="264" r="3.2" fill="#cc9900" />
        </g>
      </svg>
    </Box>
  );
}
