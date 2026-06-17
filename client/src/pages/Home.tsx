import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Dashboard from "./Dashboard";
import Onboarding from "./Onboarding";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const companyProfileQuery = trpc.company.profile.useQuery(undefined, {
    enabled: isAuthenticated && !loading,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || companyProfileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020206]">
        <div className="text-white text-center space-y-4">
          <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-400">Initializing core systems...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user needs onboarding
  if (!companyProfileQuery.data) {
    return <Onboarding />;
  }

  return <Dashboard />;
}
