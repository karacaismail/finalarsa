import { Box } from "@chakra-ui/react";
import { Fragment, useState } from "react";
import { sections, getData } from "./data/resolve";
import { SectionView } from "./components/SectionView";
import { SectionDivider } from "./components/SectionDivider";
import { Footer, Header, SkipLink } from "./components/SiteChrome";
import { ReadingProgress } from "./components/ReadingProgress";
import { SectionNav } from "./components/SectionNav";
import { PresentationMode } from "./presentation/PresentationMode";

type DividerInfo = { quote: string; author: string; theme?: "grass" | "ink" | "gold" | "clay" };
const dividers = getData<{ bySlug: Record<string, DividerInfo> }>("dividers").bySlug;

export function App() {
  const [presenting, setPresenting] = useState(false);
  return (
    <Box>
      <SkipLink />
      <ReadingProgress />
      <Header onPlay={() => setPresenting(true)} />
      <Box as="main" id="main">
        {sections.map((s, i) => {
          const dv = dividers[s.slug];
          const isLast = i === sections.length - 1;
          return (
            <Fragment key={s.id}>
              <SectionView section={s} index={i} />
              {dv && !isLast && <SectionDivider quote={dv.quote} author={dv.author} theme={dv.theme} />}
            </Fragment>
          );
        })}
      </Box>
      <Footer />
      <SectionNav />
      <PresentationMode open={presenting} onClose={() => setPresenting(false)} />
    </Box>
  );
}
