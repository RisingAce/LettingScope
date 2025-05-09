import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, CloudDrizzle, CloudRain, Sun, CloudSun, CloudFog, Snowflake, Wind, ThermometerSun, Droplets } from 'lucide-react';
import { format } from 'date-fns';

// Import from our types
import { WeatherCondition } from '@/types/inspection';

interface WeatherDisplayProps {
  weather: WeatherCondition;
  className?: string;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  weather,
  className = ''
}) => {
  // Helper function to get weather icon based on condition
  const getWeatherIcon = (condition: string | undefined) => {
    if (!condition) return <Cloud className="h-5 w-5" />;
    
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('sun') && lowerCondition.includes('cloud')) {
      return <CloudSun className="h-5 w-5 text-amber-500" />;
    } else if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
      return <Sun className="h-5 w-5 text-amber-500" />;
    } else if (lowerCondition.includes('drizzle')) {
      return <CloudDrizzle className="h-5 w-5 text-blue-400" />;
    } else if (lowerCondition.includes('rain')) {
      return <CloudRain className="h-5 w-5 text-blue-500" />;
    } else if (lowerCondition.includes('snow')) {
      return <Snowflake className="h-5 w-5 text-blue-200" />;
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return <CloudFog className="h-5 w-5 text-gray-400" />;
    } else if (lowerCondition.includes('wind')) {
      return <Wind className="h-5 w-5 text-gray-500" />;
    } else {
      return <Cloud className="h-5 w-5 text-gray-400" />;
    }
  };
  
  return (
    <Card className={`border-gold-400/30 ${className}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Weather Conditions</h3>
            <p className="text-xs text-muted-foreground">
              During inspection on {format(new Date(weather.timestamp), 'PP p')}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            {getWeatherIcon(weather.condition)}
            <span className="font-medium">{weather.condition || 'Unknown'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <ThermometerSun className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium">{weather.temperature !== undefined ? `${weather.temperature}°C` : 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Temperature</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{weather.humidity !== undefined ? `${weather.humidity}%` : 'N/A'}</p>
              <p className="text-xs text-muted-foreground">Humidity</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
