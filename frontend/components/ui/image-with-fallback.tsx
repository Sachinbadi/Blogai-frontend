'use client'

import { useState, useEffect } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  className?: string
}

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setError(false)
    setLoading(true)
  }, [src])

  const defaultImage = 'https://via.placeholder.com/400x300?text=No+Image'

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
        <img 
          src={defaultImage}
          alt="Default"
          className={className}
          onError={() => setError(true)}
        />
      </div>
    )
  }

  return error ? (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
      <img 
        src={defaultImage}
        alt="Default"
        className={className}
      />
    </div>
  ) : (
    <div className="relative">
      {loading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  )
} 