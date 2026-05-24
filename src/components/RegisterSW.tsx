'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    // 1. Register Service Worker in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope)
          },
          err => {
            console.log('ServiceWorker registration failed: ', err)
          }
        )
      })
    }

    // 2. Lock Zoom on Mobile / Safari
    const preventZoom = (e: Event) => {
      e.preventDefault()
    }
    
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    document.addEventListener('gesturestart', preventZoom, { passive: false })
    document.addEventListener('gesturechange', preventZoom, { passive: false })
    document.addEventListener('gestureend', preventZoom, { passive: false })
    document.addEventListener('touchstart', preventMultiTouch, { passive: false })

    return () => {
      document.removeEventListener('gesturestart', preventZoom)
      document.removeEventListener('gesturechange', preventZoom)
      document.removeEventListener('gestureend', preventZoom)
      document.removeEventListener('touchstart', preventMultiTouch)
    }
  }, [])

  return null;
}
