import { ChakraProvider } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { system } from "./theme";

/**
 * Yalın provider — yalnız aydınlık tema. next-themes kullanılmaz (renk modu yok),
 * böylece işletim sisteminin koyu modu sayfayı etkilemez.
 */
export function Provider({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
