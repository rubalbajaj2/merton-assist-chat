import { useState } from "react";
import Header from "@/components/Header";
import FeatureCard from "@/components/FeatureCard";
import QuestionCard from "@/components/QuestionCard";
import ChatInterface from "@/components/ChatInterface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Bus
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("assistant");
  const [selectedQuestion, setSelectedQuestion] = useState<string>();

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

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      
      <div className="container mx-auto flex-1 py-6 px-6 overflow-hidden">
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
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Admin login functionality will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
