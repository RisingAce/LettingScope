/**
 * Virtual Stager API Functions
 * 
 * This file contains utility functions for interacting with OpenAI's API
 * specifically for the virtual staging feature.
 */

/**
 * Configuration options for the virtual staging request
 */
export interface VirtualStagingOptions {
  roomType: string;
  style: string;
  lightingMood: string;
  additionalDetails?: string;
  size?: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  format?: 'png' | 'jpeg' | 'webp';
  outputCompression?: number;
  background?: 'transparent' | 'opaque';
  moderation?: 'auto' | 'low';
}

// Key for storing the API key in local storage
const API_KEY_STORAGE_KEY = 'openai-api-key';

/**
 * Get the OpenAI API key from local storage
 */
export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

/**
 * Save the OpenAI API key to local storage
 */
export function saveApiKey(apiKey: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

/**
 * Clear the OpenAI API key from local storage
 */
export function clearApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

/**
 * Check if an API key is already saved
 */
export function hasApiKey(): boolean {
  return !!getApiKey();
}

/**
 * Converts an image File object to a PNG File object using canvas.
 * 
 * @param file - The input image File (can be JPEG, WEBP, etc.)
 * @param fileName - The desired filename for the output PNG file.
 * @returns A Promise resolving to the PNG File object.
 */
async function convertToPngFile(file: File, fileName: string = 'image.png'): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Canvas toBlob failed'));
          }
          resolve(new File([blob], fileName, { type: 'image/png' }));
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a virtual staging of an unfurnished room using the Vercel serverless API route
 * 
 * @param image - The image file to be staged
 * @param options - Staging configuration options
 * @returns A Promise resolving to the URL of the generated image
 */
export async function generateStagedRoom(
  image: File,
  options: VirtualStagingOptions
): Promise<string> {
  try {
    // --- Convert image to PNG before proceeding --- 
    console.log('[VirtualStager API] Converting input image to PNG...');
    const pngImageFile = await convertToPngFile(image, 'staging_input.png');
    console.log('[VirtualStager API] PNG conversion complete:', pngImageFile);
    // --- End conversion ---

    // --- Get dimensions for mask --- 
    const img = new Image();
    const imgLoadPromise = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = URL.createObjectURL(pngImageFile);
    });
    await imgLoadPromise;
    URL.revokeObjectURL(img.src); // Clean up object URL
    const { naturalWidth: width, naturalHeight: height } = img;
    console.log(`[VirtualStager API] Image dimensions: ${width}x${height}`);
    // --- End get dimensions ---

    // Create the base prompt that will be sent to the API
    const basePrompt = createStagingPrompt(options);

    // Use FormData to send image and prompt to Vercel API route
    const formData = new FormData();
    formData.append("prompt", basePrompt);
    formData.append("n", "1");
    formData.append("size", options.size || "1024x1024");
    formData.append("model", "gpt-image-1");
    formData.append("image", pngImageFile);

    console.log("Sending request to /api/stage-room with payload:", { prompt: basePrompt });

    const response = await fetch("/api/stage-room", {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    console.log('[VirtualStager Debug] Full API Response:', result);

    if (!response.ok) {
      console.error("API Error:", result);
      const errorMsg = result?.error || `HTTP error! status: ${response.status}`;
      throw new Error(`API Error: ${errorMsg}`);
    }

    if (result.data && result.data[0] && result.data[0].b64_json) {
      const b64Json = result.data[0].b64_json;
      const imageUrl = `data:image/png;base64,${b64Json}`;
      console.log('[VirtualStager Debug] Result image (Base64 Data URI):', imageUrl.substring(0, 100) + '...');
      return imageUrl;
    } else if (result.data && result.data[0] && result.data[0].url) {
      const imageUrl = result.data[0].url;
      console.log('[VirtualStager Debug] Result image URL:', imageUrl);
      return imageUrl;
    } else {
      console.error("Unexpected API response structure:", result);
      throw new Error('Unexpected API response structure');
    }
  } catch (error) {
    console.error('Error generating staged room:', error);
    throw error;
  }
}

/**
 * Creates a detailed prompt for the OpenAI API based on user options
 */
function createStagingPrompt(options: VirtualStagingOptions): string {
  const { roomType, style, lightingMood, additionalDetails } = options;
  
  // Map room types to more descriptive text
  const roomDescriptions: Record<string, string> = {
    'living-room': 'living room with seating area',
    'kitchen': 'modern kitchen with appliances',
    'bedroom': 'comfortable bedroom with bed',
    'bathroom': 'clean bathroom with fixtures',
    'dining-room': 'dining room with table and chairs',
    'office': 'functional home office space',
    'hallway': 'welcoming entrance hallway',
  };
  
  // Map styles to descriptive elements
  const styleDescriptions: Record<string, string> = {
    'scandinavian': 'clean lines, light woods, minimalist, whites and soft neutrals',
    'minimalist': 'uncluttered, simple, functional, neutral palette',
    'industrial': 'exposed materials, raw textures, metals, urban feel',
    'modern': 'sleek, contemporary, bold colors, innovative materials',
    'rustic': 'natural materials, warm woods, earthy tones, cozy feel',
    'mid-century': 'retro 50s-60s style, organic forms, geometric patterns',
    'traditional': 'classic, elegant, rich textures, ornate details',
    'bohemian': 'eclectic, colorful, layered textiles, plants, global influence',
    'art-deco': 'glamorous, geometric patterns, bold colors, luxury finishes',
    'coastal': 'beachy, light blues and whites, natural light, breezy feel',
    'luxury': 'high-end materials, sophisticated, plush textures, statement pieces',
  };
  
  // Map lighting moods to descriptions
  const lightingDescriptions: Record<string, string> = {
    'bright': 'well-lit with abundant natural light',
    'natural': 'balanced natural daylight illuminating the space',
    'warm': 'warm and cozy lighting creating an inviting atmosphere',
    'dramatic': 'dramatic lighting with defined shadows and highlights',
    'evening': 'soft evening ambient lighting with lamps and mood lighting',
  };
  
  // Build the prompt with detailed instructions
  /* OLD PROMPT 
  let prompt = `Transform this unfurnished room into a beautifully staged ${roomDescriptions[roomType] || roomType} with ${styleDescriptions[style] || style} design style. `;
  prompt += `The space should have ${lightingDescriptions[lightingMood] || lightingMood} lighting. `;
  prompt += `Include appropriate furniture, artwork, plants, and decor elements that showcase the space's potential. `;
  */

  // NEW, more direct prompt for /edits endpoint
  let prompt = `Add realistic virtual staging furniture and decor to this image of an unfurnished ${roomDescriptions[roomType] || roomType}. `;
  prompt += `Apply a ${styleDescriptions[style] || style} design style with ${lightingDescriptions[lightingMood] || lightingMood} lighting. `;
  prompt += `Place appropriate furniture `;
  
  // Add specific requirements based on room type
  switch (roomType) {
    case 'living-room':
      prompt += '(e.g., sofa, coffee table, accent chairs, rug) ';
      break;
    case 'kitchen':
      prompt += '(e.g., countertop appliances, accessories, potentially a small dining set) ';
      break;
    case 'bedroom':
      prompt += '(e.g., well-made bed, nightstands, lighting) ';
      break;
    case 'bathroom':
      prompt += '(e.g., towels, accessories, spa elements) ';
      break;
    case 'dining-room':
      prompt += '(e.g., dining table with settings, chairs, lighting fixture) ';
      break;
    case 'office':
      prompt += '(e.g., desk, chair, bookshelf) ';
      break;
    case 'hallway':
      prompt += '(e.g., entryway furniture, mirror, artwork) ';
      break;
  }
  prompt += `within the existing space shown in the image. `;
  
  // Strengthened prompt for preservation of fixed features
  prompt += 'IMPORTANT: Do NOT remove, alter, obscure, or replace any existing architectural features, built-in furniture, or appliances (such as kitchen hobs, countertops, cabinets, windows, doors, radiators, flooring, or any other fixed elements). These must remain exactly as shown in the original image. Only add virtual furniture and decor. Do NOT hide or cover any original features or appliances. The staging must enhance the space while keeping all existing elements fully visible and unchanged. '; 
  
  // Add additional styling details
  prompt += `The design should highlight the room's best features and create a spacious, appealing atmosphere. `;
  
  // Include any additional user-provided details
  if (additionalDetails && additionalDetails.trim()) {
    prompt += `Specifically, consider this request: ${additionalDetails.trim()}. `;
  }
  
  // Important instructions for the AI
  prompt += 'The staging should look realistic and professional, suitable for property marketing. ';
  // Emphasize maintaining the original structure
  prompt += 'CRITICAL: Maintain the original room dimensions, walls, windows, doors, flooring, and architectural features shown in the image. Only add furniture and decor.' 
  
  console.log("[VirtualStager API] Generated Prompt:", prompt); // Log the generated prompt
  return prompt;
}

/**
 * Converts a File object to a base64-encoded string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract just the base64 part without the data URL prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Converts a base64 string to a Blob object
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}

/**
 * Downloads an image from a URL
 */
export async function downloadImageFromUrl(url: string, filename: string = 'virtual-staged-room.png'): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

/**
 * Formats room type option values into human-readable display text
 */
export function formatRoomType(roomType: string): string {
  const mapping: Record<string, string> = {
    'living-room': 'Living Room',
    'kitchen': 'Kitchen',
    'bedroom': 'Bedroom',
    'bathroom': 'Bathroom',
    'dining-room': 'Dining Room',
    'office': 'Home Office',
    'hallway': 'Hallway/Entrance',
  };
  
  return mapping[roomType] || roomType;
}

/**
 * Formats style option values into human-readable display text
 */
export function formatStyle(style: string): string {
  const mapping: Record<string, string> = {
    'scandinavian': 'Scandinavian',
    'minimalist': 'Minimalist',
    'industrial': 'Industrial',
    'modern': 'Modern',
    'rustic': 'Rustic',
    'mid-century': 'Mid-Century',
    'traditional': 'Traditional',
    'bohemian': 'Bohemian',
    'art-deco': 'Art Deco',
    'coastal': 'Coastal',
    'luxury': 'Luxury',
  };
  
  return mapping[style] || style;
}

/**
 * Formats lighting mood option values into human-readable display text
 */
export function formatLightingMood(mood: string): string {
  const mapping: Record<string, string> = {
    'bright': 'Bright & Airy',
    'natural': 'Natural Daylight',
    'warm': 'Warm & Cozy',
    'dramatic': 'Dramatic',
    'evening': 'Evening Ambiance',
  };
  
  return mapping[mood] || mood;
}
