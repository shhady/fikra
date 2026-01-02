import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-white text-center">جاري التحميل...</div>
      </div>
    </div>
  )
} 