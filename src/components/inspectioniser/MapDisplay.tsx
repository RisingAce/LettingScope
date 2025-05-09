import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapDisplayProps {
  latitude: number;
  longitude: number;
  address: string;
  className?: string;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({
  latitude,
  longitude,
  address,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);
  
  useEffect(() => {
    // Only initialize the map once and when we have valid coordinates
    if (mapRef.current && !mapInitialized.current && isValidCoordinate(latitude, longitude)) {
      // This is a placeholder for map initialization
      // In a real application, you would use a mapping library like Leaflet or Google Maps
      
      // Mark that we've initialized the map
      mapInitialized.current = true;
      
      // For now, we'll just show a styled div with the coordinates
      mapRef.current.innerHTML = `
        <div class="bg-muted h-full w-full relative flex items-center justify-center">
          <div class="absolute inset-0 overflow-hidden">
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform-gpu">
              <div class="flex flex-col items-center">
                <div class="h-8 w-8 rounded-full bg-gold-600 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="mt-2 text-xs text-center max-w-[200px] font-medium">${address}</div>
              </div>
            </div>
          </div>
          <div class="absolute bottom-2 left-2 text-xs bg-white p-1 rounded shadow text-muted-foreground">
            Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}
          </div>
        </div>
      `;
    }
  }, [latitude, longitude, address]);
  
  // Helper function to check if coordinates are valid
  const isValidCoordinate = (lat: number, lng: number) => {
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  };
  
  // Open the location in Google Maps or other map application
  const openInMaps = () => {
    if (isValidCoordinate(latitude, longitude)) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
    } else {
      // If we don't have coordinates, try to search by address
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };
  
  return (
    <Card className={`border-gold-400/30 overflow-hidden ${className}`}>
      <div className="relative">
        <div ref={mapRef} className="h-48 w-full bg-muted">
          {/* Map will be rendered here */}
          {!isValidCoordinate(latitude, longitude) && (
            <div className="h-full w-full flex flex-col items-center justify-center">
              <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Location not available</p>
              <p className="text-xs text-muted-foreground">{address}</p>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-2 right-2 flex gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 bg-white/90 hover:bg-white text-black shadow-md"
            onClick={openInMaps}
          >
            <Navigation className="h-3.5 w-3.5 mr-1" />
            Directions
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gold-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Property Location</p>
            <p className="text-xs text-muted-foreground">{address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
