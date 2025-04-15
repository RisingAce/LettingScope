import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppData } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Building, CalendarClock, Settings, FileText, 
  ChevronLeft, ChevronRight, Menu, CreditCard
} from "lucide-react";
import unicornLogo from "@/assets/unicorn-logo.png";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const { stats } = useAppData();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "Properties",
      href: "/properties",
      icon: Building,
      badge: stats.propertyCount > 0 ? stats.propertyCount : null,
    },
    {
      title: "Bills",
      href: "/bills",
      icon: CreditCard,
      badge: (stats.pendingBillCount + stats.overdueBillCount) > 0 ? 
        (stats.pendingBillCount + stats.overdueBillCount) : null,
    },
    {
      title: "Chasers",
      href: "/chasers",
      icon: CalendarClock,
      badge: (stats.upcomingChaserCount + stats.overdueChaserCount) > 0 ? 
        (stats.upcomingChaserCount + stats.overdueChaserCount) : null,
    },
    {
      title: "Notes",
      href: "/notes",
      icon: FileText,
      badge: null,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile menu button - visible on small screens */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar content */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full transition-all duration-300 bg-sidebar border-r border-sidebar-border md:relative",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex flex-col items-center justify-center h-80 px-5 py-6">
            <Link to="/" className="flex flex-col items-center gap-4 w-full">
              <img src={unicornLogo} alt="LettingScope Logo" style={{ height: 224, width: 224, objectFit: 'contain' }} />
              <span className="text-2xl font-artdeco tracking-wide text-sidebar-foreground drop-shadow-sm mt-2">LettingScope</span>
            </Link>
          </div>

          <div className="art-deco-divider w-full px-6 mx-auto"></div>

          {/* Navigation Links */}
          <ScrollArea className="flex-1 px-3 py-6">
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent",
                    isActive(link.href)
                      ? "bg-sidebar-accent text-gold-400"
                      : "text-sidebar-foreground hover:text-gold-300"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <link.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                  {!collapsed && <span className="tracking-wide">{link.title}</span>}
                  {!collapsed && link.badge && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gold-900/60 text-gold-300 text-xs font-medium">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </ScrollArea>

          <div className="art-deco-divider w-full px-6 mx-auto"></div>

          {/* Sidebar Footer */}
          <div className="p-4">
            <p className="text-xs text-sidebar-foreground/60 text-center font-artdeco tracking-wide">
              Elegance in Management
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
