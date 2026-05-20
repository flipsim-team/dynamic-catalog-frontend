import { useEffect, useState } from "react";

// Derive a two-letter fallback avatar from the seller name.
function getInitials(sellerName: string) {
  return sellerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Avatar component that walks through candidate image URLs and falls back to initials.
export default function SellerAvatar({
  sellerName,
  avatarCandidates = [],
  imageClassName,
  fallbackClassName,
}: {
  sellerName: string;
  avatarCandidates?: string[];
  imageClassName?: string;
  fallbackClassName?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const initials = getInitials(sellerName);
  const candidateSignature = avatarCandidates.join("|");
  const activeAvatarUrl = avatarCandidates[activeIndex] || "";

  // Reset the candidate index whenever the avatar source list changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [candidateSignature]);

  // Advance to the next candidate when the current image fails to load.
  const handleError = () => {
    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      return nextIndex < avatarCandidates.length
        ? nextIndex
        : avatarCandidates.length;
    });
  };

  if (!activeAvatarUrl) {
    return <span className={fallbackClassName}>{initials}</span>;
  }

  return (
    <img
      src={activeAvatarUrl}
      alt={sellerName}
      className={imageClassName}
      onError={handleError}
    />
  );
}
