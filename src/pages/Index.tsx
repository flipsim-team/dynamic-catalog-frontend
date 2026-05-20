import {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import NavBar from "@/components/seller/NavBar";
import HeroSection from "@/components/seller/HeroSection";
import AboutSection from "@/components/seller/AboutSection";
import ProductCatalog from "@/components/seller/ProductCatalog";
import MediaGallery from "@/components/seller/MediaGallery";
import SocialPosts from "@/components/seller/SocialPosts";
import ReviewsSection from "@/components/seller/ReviewsSection";
import ContactSidebar from "@/components/seller/ContactSidebar";
import CatalogFeedback from "@/components/seller/CatalogFeedback";
import Footer from "@/components/seller/Footer";
import MobileCTA from "@/components/seller/MobileCTA";
import SplashScreen from "@/components/seller/SplashScreen";
import ScrollToTopButton from "@/components/seller/ScrollToTopButton";
import { extractSellerDataFromRaw } from "@/lib/sellerDataExtractor";
import { useSellerGlidData } from "@/hooks/useSellerGlidData";
import CursorFollower from "@/components/seller/CursorFollower";
import { useIsMobile } from "@/hooks/use-mobile";

const SplashCursor = lazy(() => import("@/components/seller/SplashCursor"));
const DEFAULT_FAVICON_HREF = "/favicon.ico";

function resolveImageUrl(url: string) {
  // Try loading an image URL in the browser to verify it exists.
  // Resolves with the original URL on success, or `null` on failure.
  return new Promise<string | null>((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => resolve(url);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function resolveFaviconHref(candidates: string[]) {
  // Iterate over favicon candidates and return the first valid image href.
  for (const candidate of candidates) {
    const trimmedCandidate = candidate.trim();
    if (!trimmedCandidate) continue;

    const resolvedCandidate = await resolveImageUrl(trimmedCandidate);
    if (resolvedCandidate) {
      return resolvedCandidate;
    }
  }

  return DEFAULT_FAVICON_HREF;
}

const Index = () => {
  const { glid: sellerId } = useParams();
  const {
    data: rawSellerData,
    isPending: isLoadingSellerData,
    isError,
    isFetched,
  } = useSellerGlidData(sellerId);
  const hasDataLoadError =
    Boolean(sellerId?.trim()) &&
    isFetched &&
    !isLoadingSellerData &&
    (isError || rawSellerData == null);
  const [showSplash, setShowSplash] = useState(true);
  const isMobile = useIsMobile();
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false,
  );
  const data = useMemo(() => {
    if (rawSellerData) {
      return extractSellerDataFromRaw(rawSellerData);
    }

    return null;
  }, [rawSellerData]);

  // Whether the gallery section has any images or YouTube posts.
  const galleryHasData = Boolean(
    data?.galleryImages?.length ||
    data?.socialProfiles?.some(
      (profile) => profile.platform === "youtube" && profile.posts?.length > 0,
    ),
  );

  const [gallerySectionVisible, setGallerySectionVisible] =
    useState<boolean>(galleryHasData);

  // Whether any social profiles contain posts.
  const socialHasData = Boolean(
    data?.socialProfiles?.some((profile) => profile.posts?.length > 0),
  );

  const [socialSectionVisible, setSocialSectionVisible] =
    useState<boolean>(socialHasData);

  useEffect(() => {
    if (!data) return;
    // Verify an image URL before using it in document metadata or favicon links.
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
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Pick the first favicon candidate that actually resolves as an image.
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!data) return;

    const sellerTitle = data.sellerName?.trim() || "Seller Catalog";
    const description = (data.description || data.tagline || "").trim();
    const resolvedDescription = description
      ? description.slice(0, 160)
      : "Seller product catalog";

    document.title = sellerTitle;

    // Main seller route: loads the catalog, derives UI data, and renders the page sections.
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

    const upsertLink = (selector: string) => {
      let link = document.head.querySelector(
        selector,
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        document.head.appendChild(link);
      }
      return link;
    };

    let cancelled = false;
    void resolveFaviconHref(
      data.avatarCandidates.length > 0
        ? data.avatarCandidates
        : [data.avatarUrl, DEFAULT_FAVICON_HREF],
    ).then((faviconHref) => {
      if (cancelled) return;

      const faviconLink = upsertLink('link[rel="icon"]');
      faviconLink.setAttribute("rel", "icon");
      faviconLink.setAttribute("type", "image/x-icon");
      faviconLink.setAttribute("href", faviconHref);
    });

    return () => {
      cancelled = true;
    };
  }, [data]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [sellerId]);

  if (sellerId?.trim() && isLoadingSellerData) {
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
          <h1 className="text-2xl font-semibold">Page Doesn't Exist</h1>
          <p className="mt-2 text-muted-foreground">
            The page you're looking for doesn't exist or the seller ID is
            invalid.
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

  // Whether the About section should render (any relevant company or product data).
  const aboutHasData = Boolean(
    data?.description ||
    data?.tagline ||
    data?.businessType ||
    data?.products?.length ||
    data?.categories?.length ||
    data?.fullAddress ||
    data?.city ||
    data?.website ||
    data?.socialProfiles?.length,
  );
  const productsHasData = Boolean(data?.products?.length);
  const reviewsHasData = Boolean(
    data?.reviewsSummary?.totalRating ||
    data?.reviewsSummary?.noOfRatings ||
    data?.individualReviews?.length > 0,
  );
  const contactHasData = Boolean(
    data?.primaryPhone ||
    data?.email ||
    data?.fullAddress ||
    data?.city ||
    data?.website ||
    data?.whatsappUrl ||
    data?.socialProfiles?.some((profile) => Boolean(profile.url)),
  );
  const feedbackTriggerSectionId = aboutHasData ? "about" : "overview";

  return (
    <div className="page-shell relative min-h-screen bg-background">
      {!isMobile && isDesktop && (
        <Suspense fallback={null}>
          <SplashCursor
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
            RAINBOW_MODE={false}
            COLOR="#B4EBE6"
            BACK_COLOR={{ r: 0.5, g: 0, b: 0 }}
          />
        </Suspense>
      )}
      {/* <CursorFollower /> */}

      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen
            sellerName={data.sellerName}
            avatarCandidates={data.avatarCandidates}
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
            <NavBar
              data={data}
              galleryVisible={gallerySectionVisible}
              socialVisible={socialSectionVisible}
            />
            <HeroSection data={data} />
            {aboutHasData && <AboutSection data={data} />}
            {productsHasData && <ProductCatalog data={data} />}
            {galleryHasData && (
              <MediaGallery
                data={data}
                onVisibilityChange={setGallerySectionVisible}
              />
            )}
            {socialHasData && (
              <SocialPosts
                data={data}
                onVisibilityChange={setSocialSectionVisible}
              />
            )}
            {reviewsHasData && <ReviewsSection data={data} />}
            {contactHasData && <ContactSidebar data={data} />}
            <Footer
              data={data}
              galleryVisible={gallerySectionVisible}
              socialVisible={socialSectionVisible}
            />
            <MobileCTA data={data} />
            <div className="h-16 md:hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      <CatalogFeedback
        sellerId={sellerId || data.sellerId || "unknown"}
        sellerName={data.sellerName}
        triggerSectionId={feedbackTriggerSectionId}
      />

      <ScrollToTopButton />
    </div>
  );
};

export default Index;
