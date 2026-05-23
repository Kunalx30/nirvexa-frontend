// src/hooks/useUsage.js
import { useState, useEffect, useCallback } from "react";
import { fetchUsageSummary } from "../services/paymentService";
import { useAuth } from "../context/AuthContext";

export function useUsage() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // Skip entirely if not logged in — pricing page is public
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const summary = await fetchUsageSummary();
      setData(summary);
    } catch {
      // Silently ignore errors
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  const isPremium = data?.is_premium ?? false;

  const remaining  = (feature) => data?.usage?.[feature]?.remaining ?? null;
  const used       = (feature) => data?.usage?.[feature]?.used ?? 0;
  const limit      = (feature) => data?.usage?.[feature]?.limit ?? 0;

  const isLimited  = (feature) => {
    if (isPremium) return false;
    const rem = remaining(feature);
    return rem !== "unlimited" && rem !== null && rem <= 0;
  };

  const percentUsed = (feature) => {
    if (isPremium) return 0;
    const lim = limit(feature);
    if (!lim || lim === "unlimited") return 0;
    return Math.min(100, Math.round((used(feature) / lim) * 100));
  };

  return {
    isPremium, data, usage: data?.usage,
    loading, remaining, used, limit,
    isLimited, percentUsed, refresh: load
  };
}