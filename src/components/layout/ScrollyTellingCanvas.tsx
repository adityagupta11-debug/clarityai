"use client";

import { useEffect, useRef } from "react";

interface ScrollyTellingCanvasProps {
  progress: number; // 0.0 to 1.0
  frameCount?: number;
}

export function ScrollyTellingCanvas({ progress, frameCount = 240 }: ScrollyTellingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const drawFrameRef = useRef<(() => void) | null>(null);

  // Current frame (0-indexed array). Kept in a ref so the resize handler can
  // redraw the latest frame without being re-created on every scroll.
  const frameIndex = Math.min(frameCount - 1, Math.max(0, Math.floor(progress * frameCount)));
  const frameIndexRef = useRef(frameIndex);

  // Preload frames and wire up canvas sizing / resize handling once.
  useEffect(() => {
    imagesRef.current = [];
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = `/sequence/frame_${String(i).padStart(3, "0")}_delay-0.2s.webp`;
      imagesRef.current.push(img);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawFrame = () => {
      const img = imagesRef.current[frameIndexRef.current];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the image covering the canvas while keeping aspect ratio (object-cover).
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        // Canvas is wider than image, match widths
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        // Canvas is taller than image, match heights
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };
    drawFrameRef.current = drawFrame;

    // Size for high-DPI displays, then redraw the current frame.
    const handleResize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      drawFrame();
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [frameCount]);

  // Redraw whenever the active frame changes.
  useEffect(() => {
    frameIndexRef.current = frameIndex;
    drawFrameRef.current?.();
  }, [frameIndex]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        // The images have a black background, so they blend perfectly into the #050505 page background
      }}
    />
  );
}
