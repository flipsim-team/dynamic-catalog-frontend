import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Decorative cursor halo that only runs on desktop pointer devices.
export default function CursorFollower() {
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 200, damping: 24, mass: 0.35 });
  const smoothY = useSpring(y, { stiffness: 200, damping: 24, mass: 0.35 });

  useEffect(() => {
    // Enable the effect only when the device can reasonably track a hover pointer.
    const media = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
    );
    const updateEnabled = () => setEnabled(media.matches);

    updateEnabled();
    media.addEventListener("change", updateEnabled);

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      media.removeEventListener("change", updateEnabled);
      window.removeEventListener("mousemove", onMove);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[95] hidden lg:block"
      style={{ x: smoothX, y: smoothY }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <span className="absolute -inset-8 rounded-full bg-primary/18 blur-2xl" />
        <span className="block h-8 w-8 rounded-full border border-primary/50 bg-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.35)]" />
      </div>
    </motion.div>
  );
}
