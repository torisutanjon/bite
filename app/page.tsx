import type { Metadata } from "next";
import type { ReactElement } from "react";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import HeroSection from "@/app/components/sections/HeroSection";
import PopularNearbySection from "@/app/components/sections/PopularNearbySection";
import FeaturesSection from "@/app/components/sections/FeaturesSection";
import SignatureBitesSection from "@/app/components/sections/SignatureBitesSection";
import AppDownloadBanner from "@/app/components/sections/AppDownloadBanner";

export const metadata: Metadata = {
  title: "BiteDash | Hunger Fulfilled in One Dash",
  description:
    "Order from thousands of restaurants, 10 min kitchens, and unique local Markets.",
};

export default function LandingPage(): ReactElement {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PopularNearbySection />
        <FeaturesSection />
        <SignatureBitesSection />
        <AppDownloadBanner />
      </main>
      <Footer />
    </>
  );
}
