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

/**
 * Masks phone numbers and email addresses by replacing the middle 50% with 'x'
 * Examples:
 *  - 9324561979 → 93xxxxxx979 (keep first 2, last 3 digits)
 *  - testemail@email.com → testexxxxxxxxxl.com (mask middle 50%)
 */
export function maskContactInfo(value: string): string {
  if (!value || typeof value !== "string") return value;

  // Check if it looks like a phone number (10 digits)
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    const first = digitsOnly.slice(0, 2);
    const last = digitsOnly.slice(-3);
    const masked = "x".repeat(digitsOnly.length - 5);
    return `${first}${masked}${last}`;
  }

  // Otherwise treat as email (replace middle 50%)
  if (value.includes("@")) {
    const length = value.length;
    const maskStart = Math.ceil(length * 0.25);
    const maskEnd = Math.floor(length * 0.75);
    const before = value.slice(0, maskStart);
    const after = value.slice(maskEnd);
    const masked = "x".repeat(maskEnd - maskStart);
    return `${before}${masked}${after}`;
  }

  return value;
}
