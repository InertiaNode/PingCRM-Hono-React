import React from "react";
import Logo from "@/Components/Logo/Logo";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-800 via-indigo-900 to-purple-900 p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="bg-pattern absolute inset-0 opacity-50"></div>

      {/* Content Container */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Logo
            className="mx-auto block w-full max-w-xs fill-white text-white drop-shadow-lg"
            height={50}
          />
        </div>

        {/* Main Content Slot */}
        {children}
      </div>

      {/* Floating Elements */}
      <div className="absolute left-10 top-10 h-20 w-20 animate-pulse rounded-full bg-white/10"></div>
      <div className="animation-delay-1000 absolute bottom-10 right-10 h-16 w-16 animate-pulse rounded-full bg-white/10"></div>
      <div className="animation-delay-2000 absolute right-1/4 top-1/3 h-12 w-12 animate-pulse rounded-full bg-white/10"></div>
    </div>
  );
}
