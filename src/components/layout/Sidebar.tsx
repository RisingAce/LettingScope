import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppData } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Building, CalendarClock, Settings, FileText, 
  ChevronLeft, ChevronRight, Menu, CreditCard, DollarSign, Calculator, Wand, Sparkles,
  CheckCircle
} from "lucide-react";
import unicornLogo from "@/assets/unicorn-logo.png";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const { stats, exportDataZip } = useAppData();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [rentalToolsOpen, setRentalToolsOpen] = useState(false);

  const links = [
    {
      title: "Home",
      href: "/home",
      icon: () => (
        <img
          src={unicornLogo}
          alt="Home"
          className="w-6 h-6"
        />
      ),
      badge: null,
      group: null,
    },
    {
      title: "Virtual Stager",
      href: "/virtual-stager",
      icon: Sparkles,
      badge: "New",
      group: null,
    },
    {
      title: "Utilities",
      icon: Building, 
      group: "utilities",
      children: [
        {
          title: "Dashboard",
          href: "/dashboard",
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
      ],
    },
    {
      title: "Rental Tools",
      icon: Calculator,
      group: "rentalTools",
      children: [
        {
          title: "Rental Valuator",
          href: "/rental-valuator",
          icon: DollarSign,
          badge: null,
        },
        {
          title: "Rent Affordability",
          href: "/rental-tools/affordability",
          icon: DollarSign,
          badge: null,
        },
        {
          title: "Rental Increase",
          href: "/rental-tools/increase",
          icon: DollarSign,
          badge: null,
        },
        {
          title: "Bills Calculator",
          href: "/rental-tools/bills",
          icon: CreditCard,
          badge: null,
        },
        {
          title: "Pro-Rata Rent",
          href: "/rental-tools/pro-rata",
          icon: DollarSign,
          badge: null,
        },
        {
          title: "Property Parser",
          href: "/rental-tools/property-parser",
          icon: FileText,
          badge: null,
        },
        {
          title: "Inspectioniser",
          href: "/rental-tools/inspectioniser",
          icon: CheckCircle,
          badge: null,
        },
      ],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
      group: null,
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
          <Link to="/home" className="flex items-center justify-center py-8 w-full group bg-transparent">
            <img
              src={unicornLogo}
              alt="LettingScope Logo"
              className="w-56 h-56"
              style={{ background: 'transparent' }}
            />
          </Link>

          <div className="art-deco-divider w-full px-6 mx-auto"></div>

          {/* Navigation Links */}
          <ScrollArea className="flex-1 px-3 py-6">
            <nav className="flex flex-col gap-2">
              {links.map((link) => {
                if (link.group === "utilities") {
                  return (
                    <div key={link.title} className="w-full">
                      <button
                        className={cn(
                          "group flex w-full items-center rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent",
                          utilitiesOpen || link.children?.some(child => isActive(child.href))
                            ? "bg-sidebar-accent text-gold-400"
                            : "text-sidebar-foreground hover:text-gold-300"
                        )}
                        onClick={() => setUtilitiesOpen(!utilitiesOpen)}
                      >
                        <link.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                        {!collapsed && <span className="tracking-wide">{link.title}</span>}
                        {!collapsed && (
                          <ChevronRight
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform",
                              utilitiesOpen ? "rotate-90" : "rotate-0"
                            )}
                          />
                        )}
                      </button>
                      {utilitiesOpen && !collapsed && (
                        <div className="ml-7 mt-1 flex flex-col gap-1">
                          {link.children.map(child => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent",
                                isActive(child.href)
                                  ? "bg-sidebar-accent text-gold-400"
                                  : "text-sidebar-foreground hover:text-gold-300"
                              )}
                              onClick={() => setMobileOpen(false)}
                            >
                              <child.icon className={cn("h-4 w-4 mr-2")}/>
                              <span>{child.title}</span>
                              {child.badge && (
                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gold-900/60 text-gold-300 text-xs font-medium">
                                  {child.badge > 99 ? "99+" : child.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                if (link.group === "rentalTools") {
                  return (
                    <div key={link.title} className="w-full">
                      <button
                        className={cn(
                          "group flex w-full items-center rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent",
                          rentalToolsOpen || link.children?.some(child => isActive(child.href))
                            ? "bg-sidebar-accent text-gold-400"
                            : "text-sidebar-foreground hover:text-gold-300"
                        )}
                        onClick={() => setRentalToolsOpen(!rentalToolsOpen)}
                      >
                        <link.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                        {!collapsed && <span className="tracking-wide">{link.title}</span>}
                        {!collapsed && (
                          <ChevronRight
                            className={cn(
                              "ml-auto h-4 w-4 transition-transform",
                              rentalToolsOpen ? "rotate-90" : "rotate-0"
                            )}
                          />
                        )}
                      </button>
                      {rentalToolsOpen && !collapsed && (
                        <div className="ml-7 mt-1 flex flex-col gap-1">
                          {link.children.map(child => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent",
                                isActive(child.href)
                                  ? "bg-sidebar-accent text-gold-400"
                                  : "text-sidebar-foreground hover:text-gold-300"
                              )}
                              onClick={() => setMobileOpen(false)}
                            >
                              <child.icon className={cn("h-4 w-4 mr-2")}/>
                              <span>{child.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                // Render top-level (non-grouped) links
                if (!link.group) {
                  return (
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
                      {link.title === "Home" ? (
                        <img src={unicornLogo} alt="Home" className={cn("h-10 w-10", collapsed ? "mr-0" : "mr-3")} />
                      ) : (
                        <link.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                      )}
                      {!collapsed && <span className="tracking-wide">{link.title}</span>}
                      {!collapsed && link.badge && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-gold-900/60 text-gold-300 text-xs font-medium">
                          {link.badge > 99 ? "99+" : link.badge}
                        </span>
                      )}
                    </Link>
                  );
                }
                return null;
              })}
            </nav>

            {/* --- Export Reminder Banner --- */}
            <div className="mt-6 mx-2 p-3 rounded-lg border-2 border-gold-300 bg-gold-50 dark:bg-gold-900/10 flex flex-col items-center text-center shadow-gold-200/30 shadow-md">
              <span className="text-gold-900 dark:text-gold-200 font-artdeco text-base font-semibold mb-1">
                Remember to back up your data before you finish your session.
              </span>
              <span className="text-xs text-gold-700 dark:text-gold-300/80 mb-2">
                This will safeguard your bills, documents, and settings.
              </span>
              <Button
                size="sm"
                className="bg-gold-400 hover:bg-gold-500 text-white font-bold shadow-gold-200/30 mb-2"
                onClick={exportDataZip}
              >
                Export Full Backup
              </Button>
              <Link
                to="/settings"
                className="text-xs text-gold-700 dark:text-gold-300 hover:text-gold-900 dark:hover:text-gold-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Go to Settings
              </Link>
            </div>
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
