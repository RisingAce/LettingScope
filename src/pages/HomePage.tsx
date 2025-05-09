import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import CompareSlider from "@/components/CompareSlider";
import { 
  Sparkles, 
  ArrowRight, 
  Calculator, 
  CreditCard, 
  DollarSign, 
  Clock, 
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SAMPLE_BEFORE_IMAGE = "/sample-images/empty-room.jpg";
const SAMPLE_AFTER_IMAGE = "/sample-images/staged-room.jpg";

const FEATURES = [
  {
    title: "Virtual Stager",
    description: "Transform empty rooms into beautifully staged spaces instantly with AI",
    icon: Sparkles,
    href: "/virtual-stager",
    color: "bg-gold-500/20 text-gold-600 dark:text-gold-400"
  },
  {
    title: "Bill Tracker",
    description: "Track and manage all property-related bills in one place",
    icon: CreditCard,
    href: "/bills",
    color: "bg-sky-500/20 text-sky-600 dark:text-sky-400"
  },
  {
    title: "Rental Valuator",
    description: "Get instant rental valuations for your property using AI-powered analysis.",
    icon: Calculator,
    href: "/rental-valuator",
    color: "bg-purple-500/20 text-purple-600 dark:text-purple-400"
  }
];

const DecoDivider = ({ className }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center py-8", className)}>
    <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-gold-300 dark:via-gold-800 to-transparent"></div>
    <div className="absolute flex items-center justify-center">
      <div className="h-2 w-2 rotate-45 bg-gold-500 dark:bg-gold-400"></div>
    </div>
    <div className="absolute flex items-center justify-center -ml-16">
      <div className="h-2 w-2 rotate-45 bg-gold-500 dark:bg-gold-400"></div>
    </div>
    <div className="absolute flex items-center justify-center ml-16">
      <div className="h-2 w-2 rotate-45 bg-gold-500 dark:bg-gold-400"></div>
    </div>
  </div>
);

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

const FeatureCard = ({ feature }: { feature: typeof FEATURES[0] }) => {
  const Icon = feature.icon;
  
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden group"
    >
      <div className="bg-white dark:bg-black/40 border-gold-200 dark:border-gold-800 border rounded-xl p-6 h-full backdrop-blur-sm">
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", feature.color)}>
          <Icon className="w-6 h-6" />
        </div>
        
        <h3 className="text-xl font-artdeco text-gold-900 dark:text-gold-100 mb-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
          {feature.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {feature.description}
        </p>
        
        <Button
          asChild
          variant="ghost"
          className="border border-gold-200 dark:border-gold-800 bg-white/80 dark:bg-black/80 hover:bg-gold-100 dark:hover:bg-gold-950 rounded-full px-4"
        >
          <Link to={feature.href}>
            Launch Tool
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-gold-500 dark:border-gold-400"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-gold-500 dark:border-gold-400"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-gold-500 dark:border-gold-400"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-gold-500 dark:border-gold-400"></div>
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Parallax effects
  const titleOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const titleY = useTransform(scrollY, [0, 300], [0, -50]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.1]);
  const heroBlur = useTransform(scrollY, [0, 300], [0, 5]);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const handleStageRoomClick = () => {
    navigate('/virtual-stager');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-white to-gold-50 dark:from-gray-950 dark:to-gray-900">
      <BackgroundRays />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        <motion.div 
          style={{ 
            scale: heroScale,
            filter: `blur(${heroBlur.get()}px)`,
          }}
          className="absolute inset-0 z-0"
        >
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('/patterns/art-deco-pattern.svg')] bg-repeat bg-center"></div>
        </motion.div>
        
        <div className="container max-w-7xl mx-auto z-10 pt-20">
          <motion.div 
            className="text-center mb-8"
            style={{ 
              opacity: titleOpacity,
              y: titleY,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-artdeco text-gold-900 dark:text-gold-100 mb-4">
                Transform Your Lettings. <span className="text-gold-500">Instantly</span>.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Turn empty properties into stunning, staged showcases with our virtual staging tool.
              </p>
            </motion.div>
          </motion.div>
          
          {/* Virtual Stager Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl relative border-2 border-gold-200 dark:border-gold-800"
          >
            {!isLoaded ? (
              <div className="aspect-video bg-gradient-to-r from-gold-100 to-gold-50 dark:from-gold-900/20 dark:to-gold-950/20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Sparkles className="w-10 h-10 text-gold-500" />
                </motion.div>
              </div>
            ) : (
              <>
                <CompareSlider 
                  before={SAMPLE_BEFORE_IMAGE} 
                  after={SAMPLE_AFTER_IMAGE} 
                  height={500}
                />
                
                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                  Before
                </div>
                <div className="absolute top-4 right-4 bg-gold-500 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                  After AI Staging
                </div>
              </>
            )}
          </motion.div>
          
          {/* CTA Button */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              animate={{ 
                boxShadow: ['0 0 0 0 rgba(234, 179, 8, 0)', '0 0 0 10px rgba(234, 179, 8, 0)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Button 
                onClick={handleStageRoomClick}
                size="lg" 
                className="rounded-full px-8 py-6 text-lg bg-gold-500 hover:bg-gold-600 text-white font-medium"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Stage My Room
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              No credit card required. Upload your photos and transform spaces in seconds.
            </p>
          </motion.div>
        </div>
      </section>
      
      <DecoDivider />
      
      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-artdeco text-gold-900 dark:text-gold-100 mb-4">
              Premium <span className="text-gold-500">Tools</span> for Modern Letting
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our suite of elegant tools designed to streamline property management.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>
      
      <DecoDivider />
      
      {/* Testimonial/CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-800/10 to-black/20 dark:from-gold-900/20 dark:to-black/40"></div>
        <div className="container max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-xl p-8 md:p-12 border border-gold-200 dark:border-gold-800 shadow-xl"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-artdeco text-gold-900 dark:text-gold-100 mb-4">
                  Ready to Elevate Your Property Management?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Transform empty rooms into stunning, staged showcases with our premium property management platform.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => navigate('/dashboard')}
                    size="lg"
                    className="bg-gold-500 hover:bg-gold-600 text-white"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={() => navigate('/virtual-stager')}
                    size="lg"
                    variant="outline"
                    className="border-gold-300 dark:border-gold-700"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-gold-500" />
                    Try Virtual Staging
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 -m-4 bg-gradient-to-tr from-gold-200 to-gold-500/10 dark:from-gold-800 dark:to-gold-500/10 rounded-full blur-3xl opacity-30"></div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="relative"
                  >
                    <div className="w-full aspect-square rounded-full bg-[url('/patterns/art-deco-circle.svg')] bg-contain bg-no-repeat bg-center"></div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
