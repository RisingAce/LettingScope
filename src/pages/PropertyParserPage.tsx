import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Upload, CheckCircle } from "lucide-react";
import Papa from 'papaparse';

const PropertyParserPage: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadedFileName(file.name);
    setIsLoading(true);
    setProperties([]);
    setSearchTerm('');
    
    try {
      const text = await readFileAsText(file);
      
      // Check if the file contains Properties tags
      if (text.includes('<Properties>')) {
        // For XML-like format
        const parsedProperties = parsePropertiesXML(text);
        
        if (parsedProperties.length > 0) {
          console.log(`Successfully parsed ${parsedProperties.length} properties`);
          setProperties(parsedProperties);
        }
      } else {
        // For CSV format
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              console.log(`Successfully parsed ${results.data.length} properties from CSV`);
              setProperties(results.data as any[]);
            }
          }
        });
      }
    } catch (err: any) {
      console.error(`Error reading file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const readFileAsText = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };
  
  const parsePropertiesXML = (text: string) => {
    // In case the text includes XML declaration or DocumentElement, strip those out
    text = text.replace(/<\?xml[^>]*\?>|<DocumentElement>|<\/DocumentElement>/g, '');
    
    // Find all property blocks using regex
    const propertyRegex = /<Properties>([\s\S]*?)<\/Properties>/g;
    const properties = [];
    let match;
    
    // Use exec to iterate through all matches
    while ((match = propertyRegex.exec(text)) !== null) {
      const blockContent = match[0]; // Full property block including tags
      const property: Record<string, string> = {};
      
      // Extract each field using regex
      const extractField = (fieldName: string) => {
        const fieldRegex = new RegExp(`<${fieldName}>([^<]*)<\/${fieldName}>`, 'i');
        const fieldMatch = blockContent.match(fieldRegex);
        return fieldMatch ? fieldMatch[1].trim() : '';
      };
      
      property.OffCode = extractField('OffCode');
      property.Rent = extractField('Rent');
      property.ShortAddr = extractField('ShortAddr');
      property.Landlord = extractField('Landlord');
      property.Status = extractField('Status');
      property.Bedrooms = extractField('Bedroom_x0028_s_x0029_');
      property.PrpMan = extractField('PrpMan');
      property.NegName = extractField('NegName');
      
      properties.push(property);
    }
    
    console.log(`Parsed ${properties.length} properties from XML`);
    if (properties.length > 0) {
      console.log("First property:", properties[0]);
    }
    
    return properties;
  };
  
  // Log when properties state changes
  useEffect(() => {
    console.log(`Properties state updated. Now contains ${properties.length} properties`);
  }, [properties]);
  
  const filteredProperties = useMemo(() => {
    // Return early if no properties
    if (!properties || properties.length === 0) return [];
    
    // If no search term, return all properties
    if (!searchTerm || searchTerm.trim() === '') {
      return properties;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return properties.filter(property => {
      // Safeguard against null properties
      if (!property) return false;
      
      return (
        (property.ShortAddr && property.ShortAddr.toLowerCase().includes(searchTermLower)) ||
        (property.Landlord && property.Landlord.toLowerCase().includes(searchTermLower)) ||
        (property.Status && property.Status.toLowerCase().includes(searchTermLower)) ||
        (property.NegName && property.NegName.toLowerCase().includes(searchTermLower)) ||
        (property.Rent && property.Rent.toLowerCase().includes(searchTermLower)) ||
        (property.Bedrooms && property.Bedrooms.toString().includes(searchTermLower))
      );
    });
  }, [properties, searchTerm]);

  return (
    <div className="max-w-full p-4 md:p-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-artdeco text-foreground mb-4">Property Listings Manager</h1>
        
        {/* Success message when properties loaded */}
        {properties.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-md mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{properties.length} properties loaded successfully</span>
          </div>
        )}
        
        {/* Controls Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upload section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Property Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                  <Button asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.txt,.xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                {uploadedFileName && (
                  <div className="text-sm text-muted-foreground">
                    Selected file: {uploadedFileName}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file or the specific XML/TXT format with &lt;Properties&gt; tags
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Search section */}
          <Card>
            <CardHeader>
              <CardTitle>Search Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Address, landlord, status..."
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Properties Grid or Empty State */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {filteredProperties.map((property, index) => (
              <Card key={index} className="bg-card-bg dark:bg-card text-card-foreground">
                <CardHeader className="border-b border-border/20">
                  <div className="mb-2 text-lg font-medium">
                    {property.ShortAddr || 'No address'}
                  </div>
                  <div className="text-xl font-semibold text-primary">
                    {property.Rent || 'N/A'}
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-800/30 text-amber-600 dark:text-amber-300 mt-2">
                      {property.Status || 'Unknown'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border/20">
                      <div className="text-sm text-muted-foreground">Bedrooms</div>
                      <div className="font-medium">
                        {property.Bedrooms === '10' || !property.Bedrooms ? 'N/A' : property.Bedrooms}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-border/20">
                      <div className="text-sm text-muted-foreground">Landlord</div>
                      <div className="font-medium">
                        {property.Landlord || 'N/A'}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Manager</div>
                      <div className="font-medium">
                        {property.PrpMan || property.NegName || 'N/A'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-card dark:bg-card/80 rounded-lg p-12 flex flex-col items-center justify-center text-center">
            <Building className="h-12 w-12 text-primary opacity-70 mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No properties to display</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Upload a CSV file or a text file with &lt;Properties&gt; tags to view property listings
            </p>
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload Property Data
              </label>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyParserPage;
