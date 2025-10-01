import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Mail, Lock, Eye, EyeOff, BarChart3, Database, Users, Activity, Settings } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess?: () => void;
  onAdminLogin?: () => void;
}

const AdminLogin = ({ onLoginSuccess, onAdminLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");

  // Dummy credentials
  const ADMIN_EMAIL = "admin@cloudwick.com";
  const ADMIN_PASSWORD = "password";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      onAdminLogin?.();
      console.log("✅ Admin login successful");
    } else {
      setError("Invalid email or password. Please try again.");
      console.log("❌ Admin login failed");
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setError("");
    onAdminLogin?.(); // Call the logout handler
  };

  if (isLoggedIn) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Admin Panel</h3>
              <p className="text-xs text-muted-foreground">Logged in as {ADMIN_EMAIL}</p>
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        
        {/* Admin Tabs */}
        <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 flex-shrink-0">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="flex-1 m-4 overflow-y-auto">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>
                  Overview of system metrics and administrative controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                          <p className="text-2xl font-bold">1,234</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                          <p className="text-2xl font-bold">89</p>
                        </div>
                        <Activity className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">System Status</p>
                          <p className="text-2xl font-bold text-green-600">Online</p>
                        </div>
                        <Shield className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm">User login successful</p>
                            <p className="text-xs text-muted-foreground">2 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm">New chat session started</p>
                            <p className="text-xs text-muted-foreground">5 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm">System maintenance scheduled</p>
                            <p className="text-xs text-muted-foreground">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button className="w-full justify-start" variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        Manage Knowledge Base
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="w-4 h-4 mr-2" />
                        User Management
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        System Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="knowledge-base" className="flex-1 m-4 overflow-y-auto">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Knowledge Base Management
                </CardTitle>
                <CardDescription>
                  Manage and organize the AI assistant's knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-full">
                {/* Merton FOI Application iframe */}
                <iframe
                  src="https://merton-foi.lovable.app/"
                  className="w-full h-[calc(100vh-300px)] border-0 p-0"
                  title="Merton FOI Application"
                  allowFullScreen
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@cloudwick.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
