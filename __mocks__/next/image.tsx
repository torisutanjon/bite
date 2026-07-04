import React from 'react'

interface MockImageProps {
  src: string
  alt: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  className?: string
  style?: React.CSSProperties
  [key: string]: unknown
}

export default function MockImage({
  src,
  alt,
  fill: _fill,
  priority: _priority,
  sizes: _sizes,
  ...props
}: MockImageProps): React.ReactElement {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} {...props} />
}
