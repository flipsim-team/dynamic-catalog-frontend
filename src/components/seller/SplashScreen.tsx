import { useState } from "react";
import { motion } from "framer-motion";

export default function SplashScreen({
  sellerName,
  avatarUrl,
}: {
  sellerName: string;
  avatarUrl?: string;
}) {
  const initials = sellerName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = Boolean(avatarUrl) && !avatarFailed;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-background"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.06),transparent_32%),radial-gradient(circle_at_80%_20%,hsl(var(--secondary)/0.05),transparent_28%)]" />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-72 w-72 rounded-full border border-primary/10 bg-primary/5 blur-2xl"
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-border bg-card shadow-lg overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-[1.5rem] border border-dashed border-primary/20"
          />
          {showAvatar ? (
            <img
              src={avatarUrl}
              alt={sellerName}
              className="relative z-10 h-full w-full object-contain"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className="relative z-10 bg-gradient-to-br from-primary via-brand-indigo to-secondary bg-clip-text text-3xl font-black text-transparent">
              {initials}
            </span>
          )}
        </motion.div>
        <motion.p
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.55 }}
          className="mt-8 text-xs uppercase tracking-[0.4em] text-muted-foreground"
        >
          Loading the catalog preview...
        </motion.p>
        <motion.h2
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.55 }}
          className="mt-3 text-3xl font-bold text-foreground sm:text-4xl"
        >
          {sellerName}
        </motion.h2>
        <motion.p
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.55 }}
          className="mt-3 max-w-md text-sm leading-7 text-muted-foreground"
        >
          Rendering the catalog...
        </motion.p>
        <div className="mt-8 flex w-64 gap-2">
          {[0, 1, 2].map((item) => (
            <motion.div
              key={item}
              initial={{ scaleX: 0.2, opacity: 0.35 }}
              animate={{ scaleX: [0.2, 1, 0.35], opacity: [0.35, 1, 0.45] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                delay: item * 0.18,
                ease: "easeInOut",
              }}
              className="h-1.5 flex-1 origin-left rounded-full bg-gradient-to-r from-primary via-brand-indigo to-secondary"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
