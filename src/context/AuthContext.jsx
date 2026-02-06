import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../api/auth";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    onError: () => {
      // navigate("/sign-in");
      const publicRoutes = ["/", "/events", "/events/:id", "/about", "/contact"];

      const current = window.location.pathname;

      const isPublic = publicRoutes.some((r) =>
        current.startsWith(r.replace("/:id", ""))
      );

      if (!isPublic) {
        navigate("/sign-in");
      }
    }
  });

  const isAuthenticated = data?.success === true;
  const hasProfile = data?.data?.hasProfile ?? false;
  const user = data?.data?.user ?? null;

  // Subscription Logic
  let isTrialExpired = false;
  let isProActive = false;

  if (user) {
    // Check Pro status
    isProActive = user.subscription?.plan === 'pro' &&
      user.subscription?.status === 'active' &&
      new Date(user.subscription?.expiryDate) > new Date();

    // Check Trial status
    if (user.subscription?.plan === 'free' && user.subscription?.expiryDate) {
      isTrialExpired = new Date(user.subscription.expiryDate) < new Date();
    } else {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      isTrialExpired = new Date(user.createdAt) < threeMonthsAgo;
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Clear the query cache
      queryClient.clear();
      // Cookies are cleared by the server on logout
      // Navigate to sign-in page
      navigate("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear cache and redirect
      queryClient.clear();
      navigate("/sign-in");
    }
  };

  const value = {
    isAuthenticated,
    hasProfile,
    user,
    isTrialExpired,
    isProActive,
    isLoading,
    error,
    refetch,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

