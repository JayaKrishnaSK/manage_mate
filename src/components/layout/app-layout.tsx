"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { SideNav, MobileNav } from "@/components/layout/side-nav";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { status } = useSession();
  const pathname = usePathname();

  // Don't redirect to login if we're already on the login or register page
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Redirect to login if not authenticated and not on auth pages
  if (status === "unauthenticated" && !isAuthPage) {
    redirect("/login");
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't show the layout for auth pages
  if (isAuthPage) {
    return <div>{children}</div>;
  }

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
