import exifr from 'exifr';

/**
 * Extract GPS coordinates from image EXIF data
 * Returns null if no GPS data is found
 */
export async function extractLocationFromImage(file: File): Promise<{ lat: number; lng: number } | null> {
  try {
    const exifData = await exifr.parse(file, {
      gps: true,
      pick: ['latitude', 'longitude']
    });

    if (exifData && exifData.latitude && exifData.longitude) {
      return {
        lat: exifData.latitude,
        lng: exifData.longitude
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting location from image:', error);
    return null;
  }
}

