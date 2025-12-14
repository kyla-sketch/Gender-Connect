import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/store";
import { Layout } from "@/components/Layout";
import Landing from "@/pages/Landing";
import Browse from "@/pages/Browse";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/not-found";

function PrivateRouter() {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Landing />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Browse} />
        <Route path="/messages" component={Messages} />
        <Route path="/profile" component={() => <div className="p-10 text-center text-muted-foreground">Profile Settings Placeholder</div>} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="font-sans text-foreground bg-background min-h-screen">
          <Switch>
             {/* Public Routes */}
             <Route path="/landing" component={Landing} />
             
             {/* Protected Routes Wrapper */}
             <Route path="/" component={PrivateRouter} />
             <Route path="/messages" component={PrivateRouter} />
             <Route path="/profile" component={PrivateRouter} />
             
             {/* Fallback */}
             <Route component={NotFound} />
          </Switch>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
