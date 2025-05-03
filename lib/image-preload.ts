/**
 * Preload images to prevent empty src errors
 * @param imagePaths Array of image paths to preload
 */
export const preloadImages = (imagePaths: string[]): void => {
  if (typeof window === 'undefined') return;
  
  imagePaths.forEach((path) => {
    if (!path || path === "") return

    const img = new Image()
    img.src = path
  })
}

/**
 * Check if an image exists at the given URL
 * @param url URL of the image to check
 * @returns Promise that resolves to boolean indicating if image exists
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  if (!url || url === "") return false

  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch (error) {
    console.error(`Error checking image: ${url}`, error)
    return false
  }
}

/**
 * Get a valid image URL or null if the image doesn't exist
 * @param url Primary image URL to check
 * @returns Promise that resolves to a valid image URL or null
 */
export const getValidImageUrl = async (url: string): Promise<string | null> => {
  if (!url || url === "") return null

  const exists = await checkImageExists(url)
  return exists ? url : null
}
