"use client";

import { motion } from "framer-motion";
import { useState, memo } from "react";

interface LineData {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  moveX: number;
  moveY: number;
  rotate: number;
}

export const AnimatedBackground = memo(() => {
  const [lines] = useState<LineData[]>(() => {
    const generatedLines = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      moveX: Math.random() * 500 - 250,
      moveY: Math.random() * 500 - 250,
      rotate: Math.random() * 360,
    }));
    return generatedLines;
  });

  if (lines.length === 0)
    return <div className="absolute inset-0 bg-neutral-900" />;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-neutral-950">
      {/* Capa de líneas animadas */}
      {lines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute h-[2px] w-[100px] bg-gradient-to-r from-transparent via-neutral-500/20 to-transparent"
          style={{
            left: `${line.x}%`,
            top: `${line.y}%`,
          }}
          animate={{
            x: [0, line.moveX],
            y: [0, line.moveY],
            opacity: [0, 1, 0],
            rotate: [0, line.rotate],
          }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
            delay: line.delay,
          }}
        />
      ))}

      {/* Efecto de ruido o textura sutil */}
      <div className="absolute inset-0 bg-transparent opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]" />
    </div>
  );
});

AnimatedBackground.displayName = "AnimatedBackground";
