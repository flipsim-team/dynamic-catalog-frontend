import { useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine, ISourceOptions } from "tsparticles-engine";

type Variant = "hero" | "catalog" | "dashboard";

function getOptions(variant: Variant): ISourceOptions {
  if (variant === "dashboard") {
    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 100, density: { enable: true, area: 1200 } },
        color: { value: ["#6b7280", "#4b5563", "#374151", "#9ca3af"] },
        links: { enable: false },
        move: {
          enable: true,
          speed: 0.65,
          direction: "none",
          outModes: { default: "out" },
        },
        opacity: { value: 0.55 },
        size: { value: { min: 1.5, max: 3.2 } },
      },
      interactivity: {
        events: { onHover: { enable: false }, resize: true },
      },
      background: { color: "transparent" },
    };
  }

  if (variant === "hero") {
    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 58, density: { enable: true, area: 900 } },
        color: { value: ["#ffffff", "#e2e8f0", "#bfdbfe"] },
        links: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.28,
          width: 1.15,
        },
        move: {
          enable: true,
          speed: 0.95,
          direction: "none",
          outModes: { default: "out" },
        },
        opacity: { value: 0.48 },
        size: { value: { min: 1.2, max: 2.8 } },
      },
      interactivity: {
        events: { onHover: { enable: false }, resize: true },
      },
      background: { color: "transparent" },
    };
  }

  return {
    fullScreen: { enable: false },
    fpsLimit: 60,
    detectRetina: true,
    particles: {
      number: { value: 42, density: { enable: true, area: 1000 } },
      color: { value: ["#4b5563", "#374151", "#6b7280"] },
      links: { enable: false },
      move: {
        enable: true,
        speed: 0.55,
        direction: "none",
        outModes: { default: "out" },
      },
      opacity: { value: 0.36 },
      size: { value: { min: 1.3, max: 2.8 } },
    },
    interactivity: {
      events: { onHover: { enable: false }, resize: true },
    },
    background: { color: "transparent" },
  };
}

export default function ParticlesBackground({
  variant,
  className = "",
}: {
  variant: Variant;
  className?: string;
}) {
  const options = useMemo(() => getOptions(variant), [variant]);

  return (
    <Particles
      id={`particles-${variant}`}
      className={`absolute inset-0 pointer-events-none ${className}`.trim()}
      init={loadSlim as unknown as (engine: Engine) => Promise<void>}
      options={options}
    />
  );
}
