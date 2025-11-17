'use client'

import React from 'react'
import Script from 'next/script'

export function SplineScene({ scene, className }) {
  return (
    <>
      <Script
        src="https://unpkg.com/@splinetool/runtime/build/spline-viewer.js"
        strategy="afterInteractive"
      />
      <spline-viewer
        url={scene}
        class={className}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </>
  )
}


