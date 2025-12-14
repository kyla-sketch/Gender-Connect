import { useAuth } from "@/lib/store";
import { Heart, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const { login, currentUser } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if already logged in
  if (currentUser) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-xl border border-white/50 relative z-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Amour</h1>
        <p className="text-muted-foreground mb-10 text-lg">Meaningful connections start here.</p>

        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Continue as</p>
          
          <button
            onClick={() => login('male')}
            className="w-full group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Man</h3>
                <p className="text-sm text-gray-500">Seeking Women</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
          </button>

          <button
            onClick={() => login('female')}
            className="w-full group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Woman</h3>
                <p className="text-sm text-gray-500">Seeking Men</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
          </button>
        </div>

        <p className="mt-8 text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
