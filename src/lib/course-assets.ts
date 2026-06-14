const courseImagePattern = /^\/course-assets\/(.+)\.(png|jpe?g)$/i;
const courseDocumentPattern = /^\/course-assets\/(.+\.pdf)$/i;

export function getOptimizedImageSrc(src: string) {
  const match = src.match(courseImagePattern);
  if (!match) return src;

  return `/course-assets-optimized/${match[1]}.${match[2].toLowerCase()}.webp`;
}

export function getOptimizedDocumentSrc(src: string) {
  const match = src.match(courseDocumentPattern);
  if (!match) return src;

  return `/course-assets-optimized/${match[1]}`;
}
