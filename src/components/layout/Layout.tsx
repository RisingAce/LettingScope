
import React, { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Art Deco corner decorations */}
            <div className="relative">
              {/* Top left corner */}
              <div className="absolute -top-2 -left-2 w-10 h-10 border-t-2 border-l-2 border-gold-300 dark:border-gold-700 rounded-tl-lg" />
              {/* Top right corner */}
              <div className="absolute -top-2 -right-2 w-10 h-10 border-t-2 border-r-2 border-gold-300 dark:border-gold-700 rounded-tr-lg" />
              
              {/* Main content with subtle Art Deco background pattern */}
              <div className="pt-4 px-2 pb-6 bg-background relative">
                {/* Subtle Art Deco pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_transparent_50%,_rgba(233,203,141,0.5)_50%,_transparent_100%)] bg-[length:20px_20px]"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {children}
                </div>
              </div>
              
              {/* Bottom left corner */}
              <div className="absolute -bottom-2 -left-2 w-10 h-10 border-b-2 border-l-2 border-gold-300 dark:border-gold-700 rounded-bl-lg" />
              {/* Bottom right corner */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-2 border-r-2 border-gold-300 dark:border-gold-700 rounded-br-lg" />
            </div>
          </div>
        </main>
        
        <footer className="px-4 py-3 text-xs text-center text-muted-foreground border-t border-gold-200 dark:border-gold-800">
          <div className="flex flex-col items-center justify-center">
            <div className="art-deco-divider w-32 mb-2 h-px bg-gradient-to-r from-transparent via-gold-300 dark:via-gold-700 to-transparent"></div>
            <p className="font-artdeco tracking-wide">LettingScope &copy; 2025</p>
            <p className="text-xs mt-1">Elegance in Property Management</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
