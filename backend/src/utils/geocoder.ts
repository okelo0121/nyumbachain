import axios from 'axios';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export const geocodeAddress = async (address: string, city: string): Promise<LatLng> => {
  try {
    const query = `${address}, ${city}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'NyumbaChain-Hackathon-App/1.0',
      },
      timeout: 5000,
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }

  // Fallback default coordinates (Nairobi Center)
  return {
    latitude: -1.2921,
    longitude: 36.8219,
  };
};
