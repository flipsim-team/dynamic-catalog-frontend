import { useEffect, useState, type ReactNode } from "react";
import { cn, maskContactInfo } from "@/lib/utils";

export default function RevealableContactValue({
  value,
  prefix = "",
  href,
  leadingIcon,
  className = "",
  revealClassName = "",
  hideClassName = "",
  title,
}: {
  value: string;
  prefix?: string;
  href?: string;
  leadingIcon?: ReactNode;
  className?: string;
  revealClassName?: string;
  hideClassName?: string;
  title?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [value]);

  const displayedValue = revealed ? value : maskContactInfo(value);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!revealed) {
      event.preventDefault();
      setRevealed(true);
    }
  };

  const content = (
    <>
      {leadingIcon}
      <span className={revealed ? revealClassName : hideClassName}>
        {prefix}
        {displayedValue}
      </span>
    </>
  );

  const baseClassName = cn(
    "appearance-none border-0 bg-transparent p-0 m-0 text-inherit text-left cursor-pointer",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        aria-pressed={revealed}
        title={
          title ||
          (revealed ? "Click again to contact" : "Click to reveal contact")
        }
        onClick={handleClick}
        className={baseClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={revealed}
      title={title || (revealed ? "Hide contact" : "Click to reveal contact")}
      onClick={() => setRevealed((current) => !current)}
      className={baseClassName}
    >
      {content}
    </button>
  );
}
