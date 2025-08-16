'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  User,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { navigationConfig, type NavItem } from '@/config/navigation';
import { useTheme } from '@/components/providers/theme-provider';

interface SideNavProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function SideNav({ isCollapsed, setIsCollapsed }: SideNavProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const userRole = session?.user?.systemRole || 'User';

  // Filter navigation items based on user role
  const filteredNavItems = navigationConfig.filter(item => 
    item.roles.includes(userRole as any)
  );

  // Add theme toggle to filtered items
  const navItemsWithTheme = [...filteredNavItems, {
    title: 'Toggle Theme',
    icon: theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
    roles: ['Admin', 'User'],
    isThemeToggle: true
  }];

  // Recursive function to render navigation items
  const renderNavItems = (items: (NavItem & { isThemeToggle?: boolean })[], level = 0) => {
    return items.map((item) => {
      // Handle theme toggle
      if (item.isThemeToggle) {
        return (
          <Button
            key="theme-toggle"
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center"
            )}
            onClick={toggleTheme}
          >
            {item.icon}
            {!isCollapsed && <span className="ml-2">{item.title}</span>}
          </Button>
        );
      }

      const hasChildren = item.children && item.children.length > 0;
      const isActive = pathname === item.href || (item.children?.some(child => pathname?.startsWith(child.href)));
      
      // Filter children based on user role
      const filteredChildren = item.children?.filter(child => 
        child.roles.includes(userRole as any)
      ) || [];

      return (
        <div key={item.href}>
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                isActive ? "bg-muted text-primary" : "text-muted-foreground",
                isCollapsed && "justify-center",
                level > 0 && "pl-6"
              )}
            >
              {item.icon}
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ) : (
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                isCollapsed && "justify-center",
                level > 0 && "pl-6"
              )}
            >
              {item.icon}
              {!isCollapsed && <span>{item.title}</span>}
            </div>
          )}
          
          {!isCollapsed && hasChildren && filteredChildren.length > 0 && (
            <div className="ml-4">
              {renderNavItems(filteredChildren, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div 
      className={cn(
        "relative hidden h-screen border-r bg-background md:block",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 font-semibold">
              <span>ManageMate</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-6 w-6"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {renderNavItems(navItemsWithTheme)}
          </nav>
        </div>
        
        {/* User Profile and Logout */}
        <div className="p-4 border-t">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="ml-auto"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile navigation component
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const userRole = session?.user?.systemRole || 'User';

  // Filter navigation items based on user role
  const filteredNavItems = navigationConfig.filter(item => 
    item.roles.includes(userRole as any)
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="ml-2 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <span className="font-semibold">ManageMate</span>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  toggleTheme();
                  setOpen(false);
                }}
              >
                {theme === 'light' ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                <span>Toggle Theme</span>
              </Button>
            </nav>
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="ml-auto"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}