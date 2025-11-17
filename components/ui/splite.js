'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const Spline = dynamic(() => import('@splinetool/react-spline/next'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span className="loader" />
    </div>
  ),
})

export function SplineScene({ scene, className }) {
  return <Spline scene={scene} className={className} />
}


