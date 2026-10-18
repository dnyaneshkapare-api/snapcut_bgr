const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_DIMENSION = 5000
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use a JPG, PNG, or WEBP image.'
  if (file.size > MAX_FILE_SIZE) return 'That file is over the 10 MB limit.'
  return null
}

export async function validateImageDimensions(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file)
  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
      image.onerror = () => reject(new Error('Unable to read the image.'))
      image.src = url
    })
    if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
      return 'Images must be 5000 × 5000 px or smaller.'
    }
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

function averageCornerColor(data: Uint8ClampedArray, width: number, height: number) {
  const points = [
    [1, 1], [width - 2, 1], [1, height - 2], [width - 2, height - 2],
  ]
  let r = 0; let g = 0; let b = 0
  points.forEach(([x, y]) => {
    const index = (y * width + x) * 4
    r += data[index]; g += data[index + 1]; b += data[index + 2]
  })
  return { r: r / points.length, g: g / points.length, b: b / points.length }
}

export async function createQuickCut(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('Unable to process this image.'))
      element.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas processing is unavailable in this browser.')
    context.drawImage(image, 0, 0)
    const frame = context.getImageData(0, 0, canvas.width, canvas.height)
    const background = averageCornerColor(frame.data, canvas.width, canvas.height)
    for (let index = 0; index < frame.data.length; index += 4) {
      const distance = Math.sqrt(
        (frame.data[index] - background.r) ** 2 +
        (frame.data[index + 1] - background.g) ** 2 +
        (frame.data[index + 2] - background.b) ** 2,
      )
      if (distance < 48) frame.data[index + 3] = 0
      else if (distance < 80) frame.data[index + 3] = Math.round(((distance - 48) / 32) * 255)
    }
    context.putImageData(frame, 0, 0)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not export the transparent preview.')), 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}
