import { Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { getStoredTokens } from "@/lib/api";

/**
 * Wraps protected routes — if the user is not authenticated,
 * redirects to the home page ("/").
 */
export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const tokens = getStoredTokens();

  // While the auth provider is restoring session, show nothing (or a loader)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // No user and no stored tokens → redirect to home
  if (!user && (!tokens || !tokens.access)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
