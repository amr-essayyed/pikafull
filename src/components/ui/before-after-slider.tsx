"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Sparkles } from "lucide-react"

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
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track container width for clean image clipping on resize
  useEffect(() => {
    if (!containerRef.current) return
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  const calculatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    let percentage = (x / rect.width) * 100
    if (percentage < 0) percentage = 0
    if (percentage > 100) percentage = 100
    setSliderPosition(percentage)
  }, [])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    calculatePosition(e.clientX)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    calculatePosition(e.clientX)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false)
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        // Safe fallback if capture was lost
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5))
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5))
    } else if (e.key === "Home") {
      setSliderPosition(0)
    } else if (e.key === "End") {
      setSliderPosition(100)
    }
  }

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className={`relative select-none overflow-hidden rounded-xl border border-border/50 bg-slate-100 dark:bg-slate-900 group shadow-sm ${aspectRatio} ${className}`}
    >
      {/* After Image (Background / Base Image) */}
      <img
        src={afterImage}
        alt={`${alt} - After`}
        className="absolute top-0 left-0 h-full w-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* After Label Badge */}
      <div className="absolute top-3 right-3 z-10 rounded-full bg-emerald-600/90 text-white px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-md backdrop-blur-sm flex items-center gap-1 pointer-events-none">
        <Sparkles className="h-3 w-3" />
        {afterLabel}
      </div>

      {/* Before Image (Clipped Overlay) */}
      <div
        className={`absolute top-0 bottom-0 left-0 overflow-hidden pointer-events-none ${
          isDragging ? "" : "transition-[width] duration-150 ease-out"
        }`}
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImage}
          alt={`${alt} - Before`}
          className="absolute top-0 left-0 h-full max-w-none object-cover"
          style={{
            width: containerWidth ? `${containerWidth}px` : "100%",
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

      {/* Interactive Slider Handle & Hit Area */}
      <div
        tabIndex={0}
        role="slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Before and after image comparison slider"
        className={`absolute top-0 bottom-0 z-20 w-12 -ml-6 flex items-center justify-center cursor-ew-resize touch-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full ${
          isDragging ? "" : "transition-[left] duration-150 ease-out"
        }`}
        style={{ left: `${sliderPosition}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {/* Visible Vertical Line */}
        <div className="h-full w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />

        {/* Slider Handle Circle with Double-Sided Arrow Icon */}
        <div
          className={`absolute h-10 w-10 rounded-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 flex items-center justify-center shadow-xl transition-transform duration-150 ${
            isDragging ? "scale-115 ring-4 ring-indigo-500/30" : "group-hover:scale-110"
          }`}
        >
          {/* Double-Sided Horizontal Arrow Icon */}
          <svg
            className="h-5 w-5 stroke-current fill-none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 7l-5 5 5 5" />
            <path d="M16 7l5 5-5 5" />
            <path d="M3 12h18" />
          </svg>
        </div>
      </div>

      {/* Helper hint tooltip on hover */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-slate-900/70 text-slate-200 text-[11px] font-medium px-3 py-1 shadow-sm backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Drag handle to compare
      </div>
    </div>
  )
}

