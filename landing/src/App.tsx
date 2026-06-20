import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { sections } from "./data/resolve";
import { SectionView } from "./components/SectionView";
import { Footer, Header, SkipLink } from "./components/SiteChrome";
import { ReadingProgress } from "./components/ReadingProgress";
import { SectionNav } from "./components/SectionNav";
import { PresentationMode } from "./presentation/PresentationMode";

export function App() {
  const [presenting, setPresenting] = useState(false);
  return (
    <Box>
      <SkipLink />
      <ReadingProgress />
      <Header onPlay={() => setPresenting(true)} />
      <Box as="main" id="main">
        {sections.map((s, i) => (
          <SectionView key={s.id} section={s} index={i} />
        ))}
      </Box>
      <Footer />
      <SectionNav />
      <PresentationMode open={presenting} onClose={() => setPresenting(false)} />
    </Box>
  );
}
