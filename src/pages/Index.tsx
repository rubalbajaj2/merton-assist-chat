import { useState } from "react";
import Header from "@/components/Header";
import FeatureCard from "@/components/FeatureCard";
import QuestionCard from "@/components/QuestionCard";
import ChatInterface from "@/components/ChatInterface";
import AdminLogin from "@/components/AdminLogin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  AlertCircle, 
  Wrench, 
  Info,
  Lightbulb,
  Trash2,
  Car,
  MapPin,
  Home,
  Users,
  DollarSign,
  Shield,
  Book,
  Phone,
  Mail,
  Clock,
  FileCheck,
  TreePine,
  Droplets,
  Zap,
  Building2,
  Heart,
  School,
  Bus,
  BarChart3,
  Database,
  Activity,
  Settings
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("assistant");
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const features = [
    { icon: Calendar, title: "Calendar reminders" },
    { icon: FileText, title: "Form filling" },
    { icon: AlertCircle, title: "Issue reporting" },
    { icon: Wrench, title: "Service requests" },
    { icon: Info, title: "Providing information" },
  ];

  const questions = [
    { icon: Lightbulb, question: "Report a broken streetlight", category: "Street Lighting" },
    { icon: Trash2, question: "Set up a bin reminder for me", category: "Waste Management" },
    { icon: Car, question: "Apply for a parking permit", category: "Parking" },
    { icon: MapPin, question: "Report a pothole in my street", category: "Highways" },
    { icon: DollarSign, question: "Pay my council tax", category: "Council Tax" },
    { icon: Home, question: "Report abandoned property", category: "Housing" },
    { icon: Users, question: "Register for council updates", category: "Communications" },
    { icon: Shield, question: "Report antisocial behavior", category: "Community Safety" },
    { icon: Book, question: "Find my local library hours", category: "Libraries" },
    { icon: Phone, question: "Book a bulky waste collection", category: "Waste Management" },
    { icon: Mail, question: "Request a new recycling bin", category: "Recycling" },
    { icon: Clock, question: "Check planning application status", category: "Planning" },
    { icon: FileCheck, question: "Apply for housing benefit", category: "Benefits" },
    { icon: TreePine, question: "Report a dangerous tree", category: "Parks & Gardens" },
    { icon: Droplets, question: "Report a water leak", category: "Highways" },
    { icon: Zap, question: "Report faulty traffic lights", category: "Traffic" },
    { icon: Building2, question: "Apply for a building permit", category: "Building Control" },
    { icon: Heart, question: "Access adult social care", category: "Social Services" },
    { icon: School, question: "Apply for school admissions", category: "Education" },
    { icon: Bus, question: "Get a concessionary bus pass", category: "Transport" },
    { icon: Home, question: "Report graffiti removal", category: "Street Cleaning" },
    { icon: TreePine, question: "Book a garden waste subscription", category: "Waste Management" },
    { icon: MapPin, question: "Find my local councillor", category: "Democracy" },
    { icon: FileText, question: "Request copy of birth certificate", category: "Registration" },
    { icon: Phone, question: "Report noise complaint", category: "Environmental Health" },
  ];

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question);
  };

  const handleQuestionProcessed = () => {
    setSelectedQuestion(undefined);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setSelectedTab("assistant");
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      
      <div className="container mx-auto flex-1 py-6 px-6 overflow-hidden">
        {isAdminLoggedIn ? (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Admin Panel</h3>
                  <p className="text-xs text-muted-foreground">Logged in as admin@cloudwick.com</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleAdminLogout}
              >
                Logout
              </Button>
            </div>
            
            {/* Admin Tabs */}
            <Tabs defaultValue="dashboard" className="flex-1 flex flex-col overflow-hidden">
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
        ) : (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-6">
            <TabsTrigger value="assistant">Agentic AI Assistant</TabsTrigger>
            <TabsTrigger value="reports">Recent Reports</TabsTrigger>
              <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="flex flex-col flex-1 overflow-hidden">
            {/* Features Section */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {features.map((feature, index) => (
                <FeatureCard key={index} icon={feature.icon} title={feature.title} />
              ))}
            </div>

            {/* Main Content Area - Side by Side */}
            <div className="grid md:grid-cols-[350px_1fr] gap-6 h-[500px]">
              {/* Left: Questions Sidebar */}
              <div className="bg-card rounded-lg border border-border p-4 flex flex-col h-[450px] min-h-0">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">What Can I Do...</h2>
                </div>
                
                {/* Scrollable Window for Questions */}
                <div className="bg-background rounded-lg border border-border p-3 flex-1 overflow-y-scroll min-h-0">
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <QuestionCard
                        key={index}
                        icon={q.icon}
                        question={q.question}
                        category={q.category}
                        onClick={() => handleQuestionClick(q.question)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Chat Interface */}
              <div className="h-[450px] flex flex-col">
              <ChatInterface 
                selectedQuestion={selectedQuestion}
                onQuestionProcessed={handleQuestionProcessed}
              />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Recent reports will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            <AdminLogin onAdminLogin={handleAdminLogin} />
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
