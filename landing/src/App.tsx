import { Box } from "@chakra-ui/react";
import { Fragment } from "react";
import { sections } from "./data/resolve";
import { SectionView } from "./components/SectionView";
import { AiFirstPanel } from "./components/ChartViews";
import { Footer, Header, SkipLink } from "./components/SiteChrome";

export function App() {
  return (
    <Box>
      <SkipLink />
      <Header />
      <Box as="main" id="main">
        {sections.map((s, i) => (
          <Fragment key={s.id}>
            <SectionView section={s} index={i} />
            {/* AI-first panel: finansal bölümünden hemen sonra (verimlilik/maliyet hikayesini pekiştirir) */}
            {s.slug === "finansal" && <AiFirstPanel />}
          </Fragment>
        ))}
      </Box>
      <Footer />
    </Box>
  );
}
