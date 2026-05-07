import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

let _scrollLockCount = 0;
let _originalBodyOverflow = "";
let _originalHtmlOverflow = "";
let _originalBodyPaddingRight = "";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function lockBodyScroll() {
  if (typeof document === "undefined") return;

  if (_scrollLockCount === 0) {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Save original styles
    _originalBodyOverflow = document.body.style.overflow;
    _originalHtmlOverflow = document.documentElement.style.overflow;
    _originalBodyPaddingRight = document.body.style.paddingRight;

    // Lock scroll on both html and body
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Prevent layout shift from scrollbar
    if (scrollbarWidth > 0) {
      const bodyPaddingRight = parseFloat(
        getComputedStyle(document.body).paddingRight || "0",
      );
      document.body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;
    }
  }

  _scrollLockCount++;
}

export function unlockBodyScroll() {
  if (typeof document === "undefined") return;
  if (_scrollLockCount <= 0) return;

  _scrollLockCount--;

  if (_scrollLockCount === 0) {
    document.body.style.overflow = _originalBodyOverflow;
    document.documentElement.style.overflow = _originalHtmlOverflow;
    document.body.style.paddingRight = _originalBodyPaddingRight;
  }
}
