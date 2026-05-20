import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Image as ImageIcon,
  Video,
  X,
  Play,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { SellerData } from "@/lib/sellerDataExtractor";
import { extractYouTubeId } from "@/lib/sellerDataExtractor";

function LazyImage({
  src,
  alt,
  className,
  onError,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  onClick?: () => void;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "200px" });
  return (
    <div ref={ref} className={className} onClick={onClick}>
      {inView ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={onError ? () => onError() : undefined}
        />
      ) : (
        <div className="w-full h-full shimmer" />
      )}
    </div>
  );
}

// Gallery section that shows extracted catalog images and embedded YouTube posts.
export default function MediaGallery({
  data,
  onVisibilityChange,
}: {
  data: SellerData;
  onVisibilityChange?: (visible: boolean) => void;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });
  const sectionRef = useRef<HTMLElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [hiddenImages, setHiddenImages] = useState<Set<string>>(new Set());

  // Hide images that fail to load so the gallery can keep rendering the rest.
  const hideImage = useCallback((url: string) => {
    setHiddenImages((prev) => new Set(prev).add(url));
  }, []);

  const visibleImages = data.galleryImages.filter(
    (img) => !hiddenImages.has(img.url),
  );
  const ytPosts = useMemo(
    () =>
      data.socialProfiles.find((p) => p.platform === "youtube")?.posts || [],
    [data.socialProfiles],
  );

  useEffect(() => {
    // Inform the parent page when this section actually has content to show.
    if (typeof onVisibilityChange === "function") {
      onVisibilityChange(Boolean(visibleImages.length || ytPosts.length));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleImages.length, ytPosts.length]);

  if (!visibleImages.length && !ytPosts.length) return null;

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="py-20 sm:py-28 bg-background relative overflow-hidden"
    >
      <div
        ref={ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Media Gallery
            </h2>
          </div>

          <Tabs defaultValue={visibleImages.length ? "images" : "videos"}>
            <TabsList className="rounded-full mb-8 bg-muted">
              {visibleImages.length > 0 && (
                <TabsTrigger
                  value="images"
                  className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <ImageIcon className="w-4 h-4 mr-2" /> Images (
                  {visibleImages.length})
                </TabsTrigger>
              )}
              {ytPosts.length > 0 && (
                <TabsTrigger
                  value="videos"
                  className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Video className="w-4 h-4 mr-2" /> Videos ({ytPosts.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="images">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visibleImages.map((img, i) => (
                  <motion.div
                    key={img.url}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      delay: Math.min(i * 0.03, 0.5),
                      duration: 0.4,
                    }}
                    whileHover={{ scale: 1.03 }}
                    className="relative group aspect-square rounded-2xl overflow-hidden cursor-pointer border border-border bg-muted/30 shadow-sm"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <LazyImage
                      src={img.url}
                      alt={img.caption || ""}
                      className="w-full h-full"
                      onError={() => hideImage(img.url)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <ZoomIn className="w-4 h-4 text-foreground" />
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                      {img.source}
                    </span>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ytPosts.map((vid, i) => {
                  const id = extractYouTubeId(vid.url);
                  return (
                    <motion.div
                      key={vid.url}
                      initial={{ opacity: 0, y: 25 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                      className="group rounded-2xl overflow-hidden cursor-pointer border border-border bg-card hover:shadow-lg transition-shadow duration-300"
                      onClick={() => setVideoModal(id)}
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={
                            vid.thumbnailUrl ||
                            `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`
                          }
                          alt={vid.caption.slice(0, 50)}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-xl"
                          >
                            <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-0.5" />
                          </motion.div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {vid.caption.slice(0, 90) || "Video"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {lightboxIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2.5 hover:bg-white/10 rounded-full"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => {
                if (i === null) return null;
                return (i - 1 + visibleImages.length) % visibleImages.length;
              });
            }}
            className="absolute left-2 sm:left-4 top-auto sm:top-1/2 bottom-4 sm:bottom-auto sm:-translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => {
                if (i === null) return null;
                return (i + 1) % visibleImages.length;
              });
            }}
            className="absolute right-2 sm:right-4 top-auto sm:top-1/2 bottom-4 sm:bottom-auto sm:-translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            src={visibleImages[lightboxIndex!].url}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}

      {videoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setVideoModal(null)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2.5 hover:bg-white/10 rounded-full"
            onClick={() => setVideoModal(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-full max-w-3xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoModal}?autoplay=1`}
              title="Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full rounded-2xl"
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
