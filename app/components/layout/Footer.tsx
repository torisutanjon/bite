import type { ReactElement } from "react";
import Link from "next/link";
import { Box, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import {
  InstagramLogoIcon,
  TwitterLogoIcon,
  LinkedInLogoIcon,
} from "@radix-ui/react-icons";

const companyLinks = [
  { label: "Become a Rider", href: "/rider" },
  { label: "Add your Restaurant", href: "/restaurant/register" },
  { label: "Business Hub", href: "/business" },
  { label: "About Us", href: "/about" },
];

const supportLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Help Center", href: "/help" },
  { label: "Cookie Policy", href: "/cookies" },
];

export default function Footer(): ReactElement {
  return (
    <footer className="bg-gray-950 text-white">
      <Container size="4">
        <Grid
          columns={{ initial: "2", md: "4" }}
          gap="8"
          className="py-14 px-4"
        >
          {/* Brand */}
          <Box className="col-span-2 md:col-span-1">
            <Heading size="5" weight="bold" className="text-brand">
              BiteDash
            </Heading>
            <Text size="2" className="mt-3 text-gray-400 leading-relaxed block">
              Bread-breaking flavors, right to your door. Discover local
              favorites and unique dishes delivered with speed.
            </Text>
          </Box>

          {/* Company */}
          <Box>
            <Text
              size="2"
              weight="bold"
              className="text-white uppercase tracking-wider"
            >
              BiteDash
            </Text>
            <Flex direction="column" gap="3" mt="4">
              {companyLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Text
                    size="2"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Box>

          {/* Support */}
          <Box>
            <Text
              size="2"
              weight="bold"
              className="text-white uppercase tracking-wider"
            >
              Support
            </Text>
            <Flex direction="column" gap="3" mt="4">
              {supportLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Text
                    size="2"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Text>
                </Link>
              ))}
            </Flex>
          </Box>

          {/* Social */}
          <Box>
            <Text
              size="2"
              weight="bold"
              className="text-white uppercase tracking-wider"
            >
              Social
            </Text>
            <Flex gap="3" mt="4">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-gray-400 hover:bg-brand hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramLogoIcon width="16" height="16" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-gray-400 hover:bg-brand hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <TwitterLogoIcon width="16" height="16" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-gray-400 hover:bg-brand hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInLogoIcon width="16" height="16" />
              </Link>
            </Flex>
          </Box>
        </Grid>

        {/* Copyright */}
        <Box className="border-t border-white/10 py-5 px-4">
          <Text size="1" className="text-gray-500 text-center block">
            © {new Date().getFullYear()} BiteDash Inc. All rights reserved.
          </Text>
        </Box>
      </Container>
    </footer>
  );
}
