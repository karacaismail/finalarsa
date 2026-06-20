import { Box, chakra } from "@chakra-ui/react";
import { brand } from "../data/resolve";
import { A, Flex } from "../ui";
import { LogoMark } from "./LogoMark";

const PlayBtn = chakra("button");

const contact = brand.contact as { email: string; phone: string; phoneHref: string; city: string };
const founder = brand.founder as { name: string; role: string };

export function SkipLink() {
  return (
    <A
      href="#main"
      position="fixed"
      top="3"
      left="3"
      zIndex="2000"
      bg="grass"
      color="white"
      px="4"
      py="2"
      borderRadius="control"
      fontWeight="bold"
      textDecoration="none"
      transform="translateY(-200%)"
      transition="transform 0.15s"
      _focusVisible={{ transform: "translateY(0)" }}
    >
      İçeriğe geç
    </A>
  );
}

export function Header({ onPlay }: { onPlay?: () => void }) {
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="100"
      bg="rgba(255,255,255,0.88)"
      backdropFilter="saturate(180%) blur(8px)"
      borderBottom="1px solid"
      borderColor="line"
    >
      <Flex maxW="1100px" mx="auto" px={{ base: "5", md: "8" }} h="64px" align="center" justify="space-between" gap="3">
        <Flex align="center" gap="3" minW="0">
          <LogoMark size={48} />
          <Flex align="baseline" gap="2" minW="0">
            <Box as="span" fontWeight="bold" color="ink" fontSize="lg">
              arsam.net
            </Box>
            <Box as="span" color="inkMuted" fontSize="md" display={{ base: "none", sm: "block" }} truncate>
              yatırımcı sunumu
            </Box>
          </Flex>
        </Flex>
        <Flex align="center" gap="2" flexShrink="0">
          <PlayBtn
            type="button"
            onClick={onPlay}
            display="inline-flex"
            alignItems="center"
            gap="2"
            minH="40px"
            px="3"
            borderRadius="control"
            bg="paper"
            color="grass"
            border="2px solid"
            borderColor="grass"
            fontWeight="bold"
            fontSize="md"
            cursor="pointer"
            _hover={{ bg: "surface" }}
            aria-label="Sunum modunu başlat"
          >
            <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82 16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128" />
            </svg>
            <Box as="span" display={{ base: "none", sm: "inline" }}>
              Sunum
            </Box>
          </PlayBtn>
          <A
            href={`mailto:${contact.email}`}
            display="inline-flex"
            alignItems="center"
            minH="40px"
            px="4"
            borderRadius="control"
            bg="grass"
            color="white"
            fontWeight="bold"
            fontSize="md"
            textDecoration="none"
            _hover={{ bg: "grassInk" }}
            flexShrink="0"
          >
            İletişim
          </A>
        </Flex>
      </Flex>
    </Box>
  );
}

export function Footer() {
  const muted = "#b9b7ad";
  return (
    <Box as="footer" bg="ink" color="white">
      <Box maxW="1100px" mx="auto" px={{ base: "5", md: "8" }} py={{ base: "10", md: "14" }}>
        <Box fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" mb="2">
          Tohum sizden, toprak bizden. Hasat ortak.
        </Box>
        <Box color={muted} maxW="56ch" mb="6">
          {brand.tagline as string}
        </Box>
        <Flex gap={{ base: "4", md: "10" }} wrap="wrap" fontSize="md">
          <Box>
            <Box color={muted} mb="1">İletişim</Box>
            <A href={`mailto:${contact.email}`} color="white" textDecoration="underline" display="block">
              {contact.email}
            </A>
            <A href={contact.phoneHref} color="white" textDecoration="underline" display="block">
              {contact.phone}
            </A>
          </Box>
          <Box>
            <Box color={muted} mb="1">Sunan</Box>
            <Box>
              {founder.name} · {founder.role}
            </Box>
            <Box color={muted}>{contact.city}</Box>
          </Box>
          <Box>
            <Box color={muted} mb="1">Hazırlık</Box>
            <Box>{brand.preparedAt as string}</Box>
            <Box color={muted}>{brand.domain as string}</Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
