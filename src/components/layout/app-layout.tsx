"use client";

import { useState } from "react";
import { SideNav, MobileNav } from "@/components/layout/side-nav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Side Navigation */}
      <SideNav isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Mobile Navigation Trigger */}
      <div className="md:hidden fixed top-2 left-2 z-50">
        <MobileNav />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
