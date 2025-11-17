'use client'

import React, { useEffect, useState } from 'react'
import Script from 'next/script'

export function SplineScene({ scene, className }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.9.37/build/spline-viewer.js"
        type="module"
        strategy="afterInteractive"
      />
      {mounted ? (
        <spline-viewer
          url={scene}
          className={className}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      ) : (
        <div className="w-full h-full" />
      )}
    </>
  )
}


