import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, MoreHorizontal, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAppData } from "@/contexts/AppContext";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import unicornLogo from "@/assets/unicorn-logo.png";

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, exportData, importData, clearData } = useAppData();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check for dark mode preference
  useEffect(() => {
    if (localStorage.theme === 'dark' || 
        (!('theme' in localStorage) && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === "/") return "Dashboard";
    if (path.startsWith("/properties")) {
      if (path === "/properties") return "Properties";
      if (path.includes("/new")) return "Add Property";
      if (path.includes("/edit")) return "Edit Property";
      return "Property Details";
    }
    if (path.startsWith("/chasers")) return "Chasers";
    if (path.startsWith("/notes")) return "Notes";
    if (path.startsWith("/settings")) return "Settings";
    
    return "LettingScope";
  };
  
  const notificationCount = stats.overdueChaserCount + stats.overdueBillCount;

  // Handle file import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const success = importData(jsonData);
        
        // Close dialog regardless of success
        setIsImportDialogOpen(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error importing data:", error);
      }
    };
    reader.readAsText(file);
  };

  // Handle menu actions
  const handleMenuAction = (action: string) => {
    switch (action) {
      case "export":
        exportData();
        break;
      case "import":
        setIsImportDialogOpen(true);
        break;
      case "settings":
        navigate("/settings");
        break;
      default:
        break;
    }
  };

  return (
    <header className={`py-5 px-5 md:px-7 flex items-center justify-between border-b border-gold-200 dark:border-gold-800 bg-background text-foreground ${className}`}>
      <div className="flex items-center">
        <img src={unicornLogo} alt="LettingScope Logo" style={{ height: 40, marginRight: 16 }} />
        <h1 className="text-2xl font-artdeco tracking-wide relative">
          {getPageTitle()}
          {/* Art Deco underline decoration */}
          <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gold-300 dark:bg-gold-700 opacity-70"></span>
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Dark mode toggle with Art Deco styling */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleDarkMode}
          className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40 btn-hover-effect"
        >
          {isDarkMode ? 
            <Sun className="h-4 w-4 text-gold-400" /> : 
            <Moon className="h-4 w-4 text-gold-500" />
          }
        </Button>
        
        {/* Notifications with Art Deco styling */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40 btn-hover-effect"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background border-gold-200 dark:border-gold-800">
            {stats.overdueBillCount > 0 && (
              <DropdownMenuItem onClick={() => navigate("/properties")} className="hover:bg-gold-100 dark:hover:bg-gold-900/40">
                <span>{stats.overdueBillCount} overdue {stats.overdueBillCount === 1 ? "bill" : "bills"}</span>
              </DropdownMenuItem>
            )}
            {stats.overdueChaserCount > 0 && (
              <DropdownMenuItem onClick={() => navigate("/chasers")} className="hover:bg-gold-100 dark:hover:bg-gold-900/40">
                <span>{stats.overdueChaserCount} overdue {stats.overdueChaserCount === 1 ? "reminder" : "reminders"}</span>
              </DropdownMenuItem>
            )}
            {stats.upcomingChaserCount > 0 && (
              <DropdownMenuItem onClick={() => navigate("/chasers")} className="hover:bg-gold-100 dark:hover:bg-gold-900/40">
                <span>{stats.upcomingChaserCount} upcoming {stats.upcomingChaserCount === 1 ? "reminder" : "reminders"}</span>
              </DropdownMenuItem>
            )}
            {notificationCount === 0 && (
              <DropdownMenuItem className="hover:bg-gold-100 dark:hover:bg-gold-900/40">
                <span>No notifications</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* More actions menu with Art Deco styling */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40 btn-hover-effect"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background border-gold-200 dark:border-gold-800">
            <DropdownMenuItem onClick={() => handleMenuAction("export")} className="hover:bg-gold-100 dark:hover:bg-gold-900/40">
              Export Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMenuAction("import")} className="hover:bg-gold-100 dark:hover:bg-gold-900/40">
              Import Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMenuAction("settings")} className="hover:bg-gold-100 dark:hover:bg-gold-900/40">
              Settings
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive hover:bg-destructive/10"
                  onSelect={(e) => e.preventDefault()}
                >
                  Clear All Data
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-gold-200 dark:border-gold-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-artdeco">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your
                    properties, bills, chasers, and notes data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, clear all data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Import Dialog with Art Deco styling */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="sm:max-w-md bg-background border-gold-200 dark:border-gold-800">
            <DialogHeader>
              <DialogTitle className="font-artdeco">Import Data</DialogTitle>
              <DialogDescription>
                Import your LettingScope data from a JSON file
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImport}
                  className="border-gold-200 dark:border-gold-800"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Only .json files are supported. This will replace all your current data.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsImportDialogOpen(false)}
                className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40 btn-hover-effect"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
