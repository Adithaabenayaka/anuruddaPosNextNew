"use client";

import { useAuth } from "@/src/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
};
