import { useState } from "react";
import { useAuth } from "@/lib/store";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { InsertUser } from "@shared/schema";

export default function Landing() {
  const { currentUser, login, register, isLoading: authLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerData, setRegisterData] = useState<Partial<InsertUser>>({
    gender: "male",
    interests: [],
  });

  // Redirect if already logged in
  if (currentUser && !authLoading) {
    setLocation("/");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast({ title: "Welcome back!" });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(registerData as InsertUser);
      toast({ title: "Account created successfully!" });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-xl border border-white/50 relative z-10">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2 text-center">Amour</h1>
        <p className="text-muted-foreground mb-10 text-lg text-center">Meaningful connections start here.</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
              mode === "login" 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            data-testid="button-switch-login"
          >
            Login
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2 rounded-xl font-medium transition-all ${
              mode === "register" 
                ? "bg-primary text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            data-testid="button-switch-register"
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                data-testid="input-login-email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                data-testid="input-login-password"
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl"
              data-testid="button-login-submit"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={registerData.email || ""}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
                data-testid="input-register-email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                value={registerData.password || ""}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
                minLength={6}
                data-testid="input-register-password"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reg-name">Name</Label>
              <Input
                id="reg-name"
                value={registerData.name || ""}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required
                data-testid="input-register-name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reg-age">Age</Label>
              <Input
                id="reg-age"
                type="number"
                value={registerData.age || ""}
                onChange={(e) => setRegisterData({ ...registerData, age: parseInt(e.target.value) })}
                required
                min={18}
                max={100}
                data-testid="input-register-age"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Gender</Label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRegisterData({ ...registerData, gender: "male" })}
                  className={`flex-1 py-2 rounded-xl ${
                    registerData.gender === "male" ? "bg-primary text-white" : "bg-gray-100"
                  }`}
                  data-testid="button-gender-male"
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterData({ ...registerData, gender: "female" })}
                  className={`flex-1 py-2 rounded-xl ${
                    registerData.gender === "female" ? "bg-primary text-white" : "bg-gray-100"
                  }`}
                  data-testid="button-gender-female"
                >
                  Female
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="reg-location">Location</Label>
              <Input
                id="reg-location"
                value={registerData.location || ""}
                onChange={(e) => setRegisterData({ ...registerData, location: e.target.value })}
                required
                placeholder="City, State"
                data-testid="input-register-location"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reg-job">Job</Label>
              <Input
                id="reg-job"
                value={registerData.job || ""}
                onChange={(e) => setRegisterData({ ...registerData, job: e.target.value })}
                placeholder="Your occupation"
                data-testid="input-register-job"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reg-bio">Bio</Label>
              <Input
                id="reg-bio"
                value={registerData.bio || ""}
                onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                data-testid="input-register-bio"
                className="mt-1"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl"
              data-testid="button-register-submit"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
