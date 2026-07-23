"use client"

import React, { useState, useRef, useCallback } from "react"
import { Sparkles, SlidersHorizontal } from "lucide-react"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  alt?: string
  aspectRatio?: string
  className?: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  alt = "Before and after comparison",
  aspectRatio = "aspect-[16/10]",
  className = "",
  beforeLabel = "Before",
  afterLabel = "After",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    let percentage = (x / rect.width) * 100
    if (percentage < 0) percentage = 0
    if (percentage > 100) percentage = 100
    setSliderPosition(percentage)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isDragging) return
      handleMove(e.touches[0].clientX)
    },
    [isDragging, handleMove]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return
      handleMove(e.clientX)
    },
    [isDragging, handleMove]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleMove(e.clientX)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className={`relative select-none overflow-hidden rounded-xl border border-border/50 bg-slate-100 dark:bg-slate-900 group shadow-sm ${aspectRatio} ${className}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background / Base Image) */}
      <img
        src={afterImage}
        alt={`${alt} - After`}
        className="absolute top-0 left-0 h-full w-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* After Label Badge */}
      <div className="absolute top-3 right-3 z-10 rounded-full bg-emerald-600/90 text-white px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-md backdrop-blur-sm flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        {afterLabel}
      </div>

      {/* Before Image (Clipped Overlay) */}
      <div
        className="absolute top-0 bottom-0 left-0 overflow-hidden pointer-events-none transition-[width] duration-75 ease-out"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt={`${alt} - Before`}
          className="absolute top-0 left-0 h-full max-w-none object-cover"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
            height: "100%",
          }}
          loading="lazy"
        />
      </div>

      {/* Before Label Badge */}
      <div
        className="absolute top-3 left-3 z-10 rounded-full bg-slate-900/80 text-white px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-md backdrop-blur-sm pointer-events-none transition-opacity duration-200"
        style={{ opacity: sliderPosition < 15 ? 0 : 1 }}
      >
        {beforeLabel}
      </div>

      {/* Slider Line Divider & Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-[left] duration-75 ease-out pointer-events-none"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
      </div>

      {/* Helper hint tooltip on hover */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-slate-900/70 text-slate-200 text-[11px] font-medium px-3 py-1 shadow-sm backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Drag slider to compare
      </div>
    </div>
  )
}
