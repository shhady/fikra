'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">حدث خطأ ما</h2>
        <button
          onClick={reset}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
        >
          حاول مرة أخرى
        </button>
      </div>
    </div>
  )
} 