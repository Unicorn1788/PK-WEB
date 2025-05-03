"use client"

import { useEffect } from "react"
import { preloadImages } from "@/lib/image-preload"

export function ImagePreloader() {
  useEffect(() => {
    // Preload critical images
    const imagesToPreload = [
      "/images/polking-bb.svg",
    ];
    preloadImages(imagesToPreload)
  }, [])

  return null // This component doesn't render anything
}
