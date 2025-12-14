import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/store";
import { Heart, MessageCircle, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentUser, logout } = useAuth();

  if (!currentUser) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-b md:border-r border-border p-6 flex flex-col sticky top-0 md:h-screen z-10">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
             <Heart className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-primary">Amour</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <Link 
            href="/"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location === "/" 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Heart className={cn("w-5 h-5", location === "/" && "fill-current")} />
            Discover
          </Link>
          <Link 
            href="/messages"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location === "/messages" 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <MessageCircle className={cn("w-5 h-5", location === "/messages" && "fill-current")} />
            Messages
          </Link>
          <Link 
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location === "/profile" 
                ? "bg-primary/10 text-primary font-medium" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <UserIcon className={cn("w-5 h-5", location === "/profile" && "fill-current")} />
            Profile
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-full object-cover border-2 border-background shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-background shadow-sm">
                {currentUser.name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{currentUser.gender}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
