import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import NavBar from "@/components/seller/NavBar";
import HeroSection from "@/components/seller/HeroSection";
import AboutSection from "@/components/seller/AboutSection";
import ProductCatalog from "@/components/seller/ProductCatalog";
// CategoryGrid removed — categories now live as filter chips in ProductCatalog
import MediaGallery from "@/components/seller/MediaGallery";
import SocialPosts from "@/components/seller/SocialPosts";
import ReviewsSection from "@/components/seller/ReviewsSection";
import ContactSidebar from "@/components/seller/ContactSidebar";
import Footer from "@/components/seller/Footer";
import MobileCTA from "@/components/seller/MobileCTA";
import SplashScreen from "@/components/seller/SplashScreen";
import ScrollToTopButton from "@/components/seller/ScrollToTopButton";
import CursorFollower from "@/components/seller/CursorFollower";
import SplashCursor from "@/components/seller/SplashCursor";
import {
  extractSellerData,
  extractSellerDataFromRaw,
} from "@/lib/sellerDataExtractor";
import { loadSellerRawDataByGlid } from "@/lib/sellerDataLoader";

const Index = () => {
  const { glid } = useParams();
  const [rawSellerData, setRawSellerData] = useState<unknown | null>(null);
  const [isLoadingSellerData, setIsLoadingSellerData] = useState(false);
  const [hasDataLoadError, setHasDataLoadError] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const data = useMemo(() => {
    if (rawSellerData) {
      return extractSellerDataFromRaw(rawSellerData);
    }

    return glid ? null : extractSellerData();
  }, [glid, rawSellerData]);

  useEffect(() => {
    let active = true;

    if (!glid) {
      setRawSellerData(null);
      setHasDataLoadError(false);
      setIsLoadingSellerData(false);
      return () => {
        active = false;
      };
    }

    setIsLoadingSellerData(true);
    setHasDataLoadError(false);
    setRawSellerData(null);

    loadSellerRawDataByGlid(glid)
      .then((loadedData) => {
        if (!active) return;
        if (!loadedData) {
          setHasDataLoadError(true);
          return;
        }
        setRawSellerData(loadedData);
      })
      .catch(() => {
        if (active) {
          setHasDataLoadError(true);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingSellerData(false);
        }
      });

    return () => {
      active = false;
    };
  }, [glid]);

  useEffect(() => {
    if (!data) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setShowSplash(true);
    const timeout = window.setTimeout(
      () => setShowSplash(false),
      reduced ? 600 : 1500,
    );
    return () => window.clearTimeout(timeout);
  }, [data]);

  useEffect(() => {
    if (!data) return;

    const sellerTitle = data.sellerName?.trim() || "Seller Catalog";
    const description = (data.description || data.tagline || "").trim();
    const resolvedDescription = description
      ? description.slice(0, 160)
      : "Seller product catalog";

    document.title = sellerTitle;

    const upsertMeta = (
      selector: string,
      attr: "name" | "property",
      value: string,
    ) => {
      let meta = document.head.querySelector(
        selector,
      ) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, value);
        document.head.appendChild(meta);
      }
      return meta;
    };

    upsertMeta('meta[name="description"]', "name", "description").setAttribute(
      "content",
      resolvedDescription,
    );
    upsertMeta(
      'meta[property="og:title"]',
      "property",
      "og:title",
    ).setAttribute("content", sellerTitle);
    upsertMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
    ).setAttribute("content", resolvedDescription);
  }, [data]);

  if (isLoadingSellerData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <p className="text-lg text-muted-foreground">
          Loading seller catalog...
        </p>
      </div>
    );
  }

  if (hasDataLoadError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Seller not found</h1>
          <p className="mt-2 text-muted-foreground">
            No catalog data found for this GLID.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-primary underline hover:text-primary/90"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell relative min-h-screen bg-background">
      {/* <SplashCursor
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1440}
        CAPTURE_RESOLUTION={512}
        DENSITY_DISSIPATION={4.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        PRESSURE_ITERATIONS={20}
        CURL={3}
        SPLAT_RADIUS={0.12}
        SPLAT_FORCE={1600}
        SHADING={false}
        COLOR_UPDATE_SPEED={12}
        TRANSPARENT
        RAINBOW_MODE={true}
        COLOR="#FFF6F6"
        BACK_COLOR={{ r: 0.5, g: 0, b: 0 }}
      /> */}
      <CursorFollower />

      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen
            sellerName={data.sellerName}
            avatarUrl={data.avatarUrl}
            key="splash"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showSplash && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen"
          >
            <NavBar data={data} />
            <HeroSection data={data} />
            <AboutSection data={data} />
            <ProductCatalog data={data} />
            <MediaGallery data={data} />
            <SocialPosts data={data} />
            <ReviewsSection data={data} />
            <ContactSidebar data={data} />
            <Footer data={data} />
            <MobileCTA data={data} />
            <div className="h-16 md:hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollToTopButton />
    </div>
  );
};

export default Index;
