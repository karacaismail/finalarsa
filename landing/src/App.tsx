import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { Footer, Header, SkipLink } from "./components/SiteChrome";
import { ReadingProgress } from "./components/ReadingProgress";
import { AccordionPresentation } from "./components/AccordionPresentation";
import { PresentationMode } from "./presentation/PresentationMode";

/**
 * Tek sayfa. İçerik 8 ana accordion grubu altında toplanır (AccordionPresentation):
 * en üstte sabit Karar Kutusu, altında gruplar. Sunum modu (PresentationMode) bölümleri
 * global `sections` dizisinden türetir; accordion gruplamasından bağımsızdır.
 */
export function App() {
  const [presenting, setPresenting] = useState(false);
  return (
    <Box>
      <SkipLink />
      <ReadingProgress />
      <Header onPlay={() => setPresenting(true)} />
      <Box as="main" id="main">
        <AccordionPresentation />
      </Box>
      <Footer />
      <PresentationMode open={presenting} onClose={() => setPresenting(false)} />
    </Box>
  );
}
