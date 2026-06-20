import { Box } from "@chakra-ui/react";
import { sections } from "./data/resolve";
import { SectionView } from "./components/SectionView";
import { Footer, Header, SkipLink } from "./components/SiteChrome";
import { ReadingProgress } from "./components/ReadingProgress";
import { SectionNav } from "./components/SectionNav";

export function App() {
  return (
    <Box>
      <SkipLink />
      <ReadingProgress />
      <Header />
      <Box as="main" id="main">
        {sections.map((s, i) => (
          <SectionView key={s.id} section={s} index={i} />
        ))}
      </Box>
      <Footer />
      <SectionNav />
    </Box>
  );
}
