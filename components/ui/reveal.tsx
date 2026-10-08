"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

// Each line slides up from behind a mask, staggered. Lines are passed explicitly
// so the break points stay art-directed instead of depending on viewport width.
export function RevealLines({
  lines,
  className = "",
  lineClassName = [],
  delay = 0,
  play,
}: {
  lines: readonly React.ReactNode[];
  className?: string;
  lineClassName?: string[];
  delay?: number;
  // When provided, animation is controlled externally instead of on scroll.
  play?: boolean;
}) {
  const controlled = play !== undefined;
  return (
    <span className={`block ${className}`}>
      {lines.map((line, i) => (
        <span key={i} className={`block overflow-hidden pb-[0.2em] -mb-[0.2em] ${lineClassName[i] ?? ""}`}>
          <motion.span
            className="block will-change-transform"
            initial={{ y: "110%", rotate: 2 }}
            {...(controlled
              ? { animate: play ? { y: "0%", rotate: 0 } : undefined }
              : { whileInView: { y: "0%", rotate: 0 }, viewport: { once: true, margin: "-10% 0px" } })}
            transition={{ duration: 1.1, ease, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

// Section labels read like code comments: // 01 about
export function SectionLabel({
  index,
  children,
  className = "",
}: {
  index: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`code-label ${className}`}>
      <span className="opacity-50">{`// ${index}`}</span> <span>{children}</span>
    </p>
  );
}
