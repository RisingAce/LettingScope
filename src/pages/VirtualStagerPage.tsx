import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Wand,
  Upload,
  Home,
  Image as ImageIcon,
  Download,
  Sparkles,
  Settings,
  Loader2,
  Info,
  RotateCcw,
  Share2,
  Camera,
  Palette,
  RefreshCw,
  Check,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateStagedRoom,
  downloadImageFromUrl,
} from "@/utils/virtualStagerApi";
import CompareSlider from "@/components/CompareSlider";

// Define the form validation schema
const formSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters").optional(),
  roomType: z.string().min(1, "Room type is required"),
  style: z.string().min(1, "Style is required"),
  lightingMood: z.string().min(1, "Lighting mood is required"),
  additionalDetail: z.string().optional(),
  image: z.instanceof(File).optional(),
  size: z.string().default("1024x1024"),
  quality: z.enum(["low", "medium", "high", "auto"]).default("high"),
  format: z.enum(["png", "jpeg", "webp"]).default("png"),
});

type FormValues = z.infer<typeof formSchema>;

// Predefined options for the form
const roomTypeOptions = [
  { value: "living-room", label: "Living Room" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bedroom", label: "Bedroom" },
  { value: "bathroom", label: "Bathroom" },
  { value: "dining-room", label: "Dining Room" },
  { value: "office", label: "Home Office" },
  { value: "hallway", label: "Hallway/Entrance" },
];

const styleOptions = [
  { value: "scandinavian", label: "Scandinavian" },
  { value: "minimalist", label: "Minimalist" },
  { value: "industrial", label: "Industrial" },
  { value: "modern", label: "Modern" },
  { value: "rustic", label: "Rustic" },
  { value: "mid-century", label: "Mid-Century" },
  { value: "traditional", label: "Traditional" },
  { value: "bohemian", label: "Bohemian" },
  { value: "art-deco", label: "Art Deco" },
  { value: "coastal", label: "Coastal" },
  { value: "luxury", label: "Luxury" },
];

const lightingOptions = [
  { value: "bright", label: "Bright & Airy" },
  { value: "natural", label: "Natural Daylight" },
  { value: "warm", label: "Warm & Cozy" },
  { value: "dramatic", label: "Dramatic" },
  { value: "evening", label: "Evening Ambiance" },
];

const BackgroundRays = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-10">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 h-[200vh] w-5 bg-gradient-to-t from-gold-500/0 via-gold-400/30 to-gold-500/0"
          style={{
            rotate: i * 30,
            transformOrigin: "top",
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i % 3,
            ease: "easeInOut",
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  </div>
);

const UsesProgressBar = ({ usesLeft, maxUses, isDepleting }: { usesLeft: number, maxUses: number, isDepleting: boolean }) => {
  const percent = (usesLeft / maxUses) * 100;
  return (
    <div className="my-6 flex flex-col items-center">
      <div className="relative w-72 h-8 bg-gradient-to-r from-gold-200 via-white to-gold-200 rounded-full border-4 border-gold-500 shadow-artdeco">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: isDepleting ? 1.2 : 0.5, ease: isDepleting ? [0.4, 0, 0.2, 1] : 'easeOut' }}
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-200 rounded-full shadow-inner"
          style={{ borderTopRightRadius: percent === 100 ? '1.5rem' : 0, borderBottomRightRadius: percent === 100 ? '1.5rem' : 0 }}
        />
        {/* Deco borders */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-gold-700 bg-white flex items-center justify-center shadow-lg">
          <span className="font-artdeco text-gold-700 text-xl">{usesLeft}</span>
        </div>
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 border-gold-700 bg-white flex items-center justify-center shadow-lg">
          <span className="font-artdeco text-gold-700 text-xl">{maxUses}</span>
        </div>
      </div>
      <div className="mt-2 text-gold-700 font-artdeco text-lg tracking-widest">
        {usesLeft === 0 ? 'No Free Uses Remaining' : `${usesLeft} Free Use${usesLeft > 1 ? 's' : ''} Remaining`}
      </div>
    </div>
  );
};

export default function VirtualStagerPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [hasStagedImage, setHasStagedImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomType: roomTypeOptions[0].value,
      style: styleOptions[0].value,
      lightingMood: lightingOptions[0].value,
      additionalDetail: "",
      size: "1024x1024",
      quality: "high",
      format: "png",
      image: undefined, // Explicitly set image to undefined initially
    },
  });

  // Handle file selection
  const handleFileChange = useCallback((file: File | null) => {
    console.log('[VirtualStager Debug] handleFileChange triggered. File:', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setOriginalImageUrl(result);
        console.log('[VirtualStager Debug] Setting form image value:', file);
        // Set the File object itself for validation
        form.setValue('image', file, { shouldValidate: true, shouldDirty: true });
        console.log('[VirtualStager Debug] Form image value AFTER set:', form.getValues('image'));
        // Trigger validation explicitly for the image field
        form.trigger('image');
        console.log('[VirtualStager Debug] Form errors after image trigger:', form.formState.errors);
      };
      reader.onerror = (error) => {
        console.error("[VirtualStager Debug] FileReader error:", error);
        toast({ title: "Error reading file", variant: "destructive" });
      };
      reader.readAsDataURL(file);
    } else {
      setOriginalImageUrl(null);
      form.setValue('image', undefined, { shouldValidate: true, shouldDirty: true });
      console.log('[VirtualStager Debug] Image removed from form.');
    }
    setIsUploadDialogOpen(false);
  }, [form, toast]);

  // Handle file upload through click
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  }, [handleFileChange]);

  // Handle file upload through drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  // Prevent default behavior for drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    console.log('[VirtualStager Debug] >>> onSubmit HANDLER ENTERED! <<<'); 
    console.log('[VirtualStager Debug] Form values on submit:', values);
    console.log('[VirtualStager Debug] originalImageUrl:', originalImageUrl);
    
    console.log('[VirtualStager Debug] Checking formState errors inside onSubmit:', form.formState.errors);

    // Use validated values.image from the arguments
    if (!values.image) { 
      console.error('[VirtualStager Debug] Image missing in validated form values!');
      toast({
        title: "Image Required",
        description: "Please upload an image of an unfurnished room first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the file from the form
      const image = values.image;
      console.log('[VirtualStager Debug] Image from form:', image);
      
      if (!image) {
        throw new Error("Image is required");
      }
      
      // Create the staging options from form values
      const stagingOptions = {
        roomType: values.roomType,
        style: values.style,
        lightingMood: values.lightingMood,
        additionalDetails: values.additionalDetail,
        size: values.size,
        quality: values.quality,
        format: values.format,
      };
      console.log('[VirtualStager Debug] Staging options:', stagingOptions);
      
      // Call the API to generate the staged room
      const result = await generateStagedRoom(image, stagingOptions);
      console.log('[VirtualStager Debug] Result image URL:', result);
      
      // Set the image URL for display
      setImageUrl(result);
      setHasStagedImage(true);
      
      toast({
        title: "Virtual Staging Complete",
        description: "Your room has been virtually staged!",
        variant: "default",
      });
    } catch (error) {
      console.error('[VirtualStager Debug] Error in onSubmit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error generating the staged image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to download the staged image
  const handleDownload = () => {
    if (imageUrl) {
      downloadImageFromUrl(imageUrl, `virtual-staged-${form.getValues().roomType}-${form.getValues().style}.png`);
    }
  };
  
  // --- Usage Tracking State ---
  const [usesLeft, setUsesLeft] = useState<number>(1); // Default: 1 free use
  const [isDepleting, setIsDepleting] = useState(false);

  // --- Check usage on mount ---
  useEffect(() => {
    // TODO: Replace with actual API call to check usage
    // For now, simulate fetch from API/localStorage
    const used = localStorage.getItem('virtual-stager-used');
    setUsesLeft(used ? 0 : 1);
  }, []);

  // --- Animate depletion when generating ---
  const handleDeplete = () => {
    setIsDepleting(true);
    setTimeout(() => {
      setUsesLeft(0);
      setIsDepleting(false);
      localStorage.setItem('virtual-stager-used', 'true');
    }, 1200);
  };

  // --- Patch onSubmit to deplete uses ---
  const onSubmitWithDepletion = async (values: FormValues) => {
    if (usesLeft <= 0) {
      toast({
        title: "Limit Reached",
        description: "You have used your free virtual staging. Upgrade to continue!",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setShowComparison(false);
    setImageUrl(null);
    setHasStagedImage(false);
    try {
      // ...existing logic...
      const image = values.image;
      if (!image) throw new Error("Image is required");
      const stagingOptions = {
        roomType: values.roomType,
        style: values.style,
        lightingMood: values.lightingMood,
        additionalDetails: values.additionalDetail,
        size: values.size,
        quality: values.quality,
        format: values.format,
      };
      const result = await generateStagedRoom(image, stagingOptions);
      setImageUrl(result);
      setHasStagedImage(true);
      toast({
        title: "Virtual Staging Complete",
        description: "Your room has been virtually staged!",
        variant: "default",
      });
      handleDeplete();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error generating the staged image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-white to-gold-50 dark:from-gray-950 dark:to-gray-900">
      <BackgroundRays />
      <div className="absolute inset-0 opacity-20 bg-[url('/patterns/art-deco-pattern.svg')] bg-repeat bg-center pointer-events-none z-0"></div>
      <div className="container max-w-4xl mx-auto py-16 px-4 relative z-10">
        <div className="bg-white/80 dark:bg-black/60 border border-gold-200 dark:border-gold-800 rounded-2xl shadow-xl backdrop-blur-md p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-artdeco text-gold-900 dark:text-gold-100 mb-2 text-center">Virtual Stager</h1>
          <p className="text-lg text-gold-700 dark:text-gold-300 font-medium mb-8 text-center">Stage unfurnished rooms with AI-powered design</p>
          {/* Art Deco Progress Bar for Usage */}
          <UsesProgressBar usesLeft={usesLeft} maxUses={1} isDepleting={isDepleting} />
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
            {/* Left column - Upload & Form */}
            <div className="lg:col-span-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitWithDepletion)} className="space-y-5">
                  <Card className="border-gold-200 dark:border-gold-800 shadow-lg overflow-hidden">
                    <CardHeader className="bg-gold-50 dark:bg-gold-900/20 border-b border-gold-100 dark:border-gold-800">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-artdeco text-gold-800 dark:text-gold-300 flex items-center gap-2">
                          <Camera className="h-5 w-5 text-gold-500" />
                          Room &amp; Preferences
                        </CardTitle>
                      </div>
                      <CardDescription>
                        Upload an unfurnished room photo and customize your staging preferences
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {/* Room Photo Preview */}
                      <div 
                        className="mb-6 rounded-md border-2 border-dashed border-gold-200 dark:border-gold-800 relative overflow-hidden"
                        style={{ minHeight: "200px" }}
                        onClick={() => setIsUploadDialogOpen(true)}
                      >
                        {originalImageUrl ? (
                          <div className="relative cursor-pointer">
                            <img 
                              src={originalImageUrl} 
                              alt="Room to stage" 
                              className="w-full h-auto rounded"
                            />
                            <Badge className="absolute top-3 left-3 bg-black/70 text-white">
                              Unfurnished Room
                            </Badge>
                          </div>
                        ) : (
                          <div 
                            className="flex flex-col items-center justify-center text-center p-8 h-48 cursor-pointer"
                          >
                            <ImageIcon className="h-12 w-12 mb-4 text-gold-200" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Upload an unfurnished room photo
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Room Type */}
                      <FormField
                        control={form.control}
                        name="roomType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gold-700 dark:text-gold-300">Room Type</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="border-gold-200 dark:border-gold-800">
                                  <SelectValue placeholder="Select room type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roomTypeOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Design Style */}
                      <FormField
                        control={form.control}
                        name="style"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gold-700 dark:text-gold-300">Design Style</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="border-gold-200 dark:border-gold-800">
                                  <SelectValue placeholder="Select design style" />
                                </SelectTrigger>
                                <SelectContent>
                                  {styleOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Lighting Mood */}
                      <FormField
                        control={form.control}
                        name="lightingMood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gold-700 dark:text-gold-300">Lighting Mood</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value} 
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="border-gold-200 dark:border-gold-800">
                                  <SelectValue placeholder="Select lighting mood" />
                                </SelectTrigger>
                                <SelectContent>
                                  {lightingOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Additional Details */}
                      <FormField
                        control={form.control}
                        name="additionalDetail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gold-700 dark:text-gold-300">
                              Additional Details (Optional)
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Add specific details, e.g., 'Include a reading nook' or 'Feature a breakfast bar'"
                                className="border-gold-200 dark:border-gold-800 min-h-24 resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Advanced Options */}
                      <div className="pt-4">
                        {/* Image Size */}
                        <FormField
                          control={form.control}
                          name="size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gold-700 dark:text-gold-300">Image Size</FormLabel>
                              <FormControl>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="border-gold-200 dark:border-gold-800">
                                    <SelectValue placeholder="Select image size" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1024x1024">1024x1024</SelectItem>
                                    <SelectItem value="2048x2048">2048x2048</SelectItem>
                                    <SelectItem value="4096x4096">4096x4096</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Image Quality */}
                        <FormField
                          control={form.control}
                          name="quality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gold-700 dark:text-gold-300">Image Quality</FormLabel>
                              <FormControl>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="border-gold-200 dark:border-gold-800">
                                    <SelectValue placeholder="Select image quality" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="auto">Auto</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Image Format */}
                        <FormField
                          control={form.control}
                          name="format"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gold-700 dark:text-gold-300">Image Format</FormLabel>
                              <FormControl>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="border-gold-200 dark:border-gold-800">
                                    <SelectValue placeholder="Select image format" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="png">PNG</SelectItem>
                                    <SelectItem value="jpeg">JPEG</SelectItem>
                                    <SelectItem value="webp">WebP</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-artdeco flex items-center justify-center h-12 shadow-md"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Generating Staged Room...
                              </>
                            ) : (
                              <>
                                <Wand className="h-5 w-5 mr-2" />
                                Stage This Room
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>
            
            {/* Right column - Results */}
            <div className="lg:col-span-7">
              <Card className="flex-1 min-w-[380px] max-w-[600px] border border-gold-100 dark:border-gold-900 bg-gold-50/50 dark:bg-gold-900/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="font-artdeco text-xl text-gold-800 dark:text-gold-300">
                    Virtual Staging Result
                  </CardTitle>
                  <div className="flex gap-2 items-center">
                    {originalImageUrl && imageUrl && (
                      <Button size="sm" variant="outline" onClick={() => setShowComparison((v) => !v)}>
                        {showComparison ? "Hide" : "Compare"}
                      </Button>
                    )}
                    {imageUrl && (
                      <Button size="sm" variant="outline" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {showComparison && originalImageUrl && imageUrl ? (
                    <CompareSlider before={originalImageUrl} after={imageUrl} height={400} />
                  ) : imageUrl ? (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Virtually Staged"
                        className="rounded-lg shadow-lg w-full h-auto object-contain"
                      />
                      <span className="absolute top-2 right-2 bg-gold-400 text-white text-xs px-2 py-1 rounded font-semibold shadow">
                        Virtually Staged
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                      <ImageIcon className="w-16 h-16 mb-4 text-gold-200" />
                      <span className="text-lg">Your virtually staged room will appear here</span>
                    </div>
                  )}
                  {/* ...rest of the design details ... */}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Upload Dialog */}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-artdeco text-xl text-gold-800 dark:text-gold-300">
                  Upload Room Photo
                </DialogTitle>
              </DialogHeader>
              
              <div 
                className="flex flex-col items-center justify-center border-2 border-dashed border-gold-200 dark:border-gold-800 rounded-lg p-6"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gold-400 mb-4" />
                <h3 className="text-base font-medium mb-2">
                  Drag & drop or click to upload
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Upload a photo of an unfurnished room for virtual staging
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Info className="h-3.5 w-3.5 mr-1" />
                  Supported formats: JPEG, PNG
                </div>
                <div>Max size: 10MB</div>
              </div>
              
              <div className="flex justify-end mt-4">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">Cancel</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
