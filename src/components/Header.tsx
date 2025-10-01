import { Button } from "@/components/ui/button";
import awsLogo from "@/assets/aws-logo.png";
import { Infinity } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Infinity className="w-6 h-6" />
          <span>Cloudwick | Amorphic</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg p-3 flex items-center justify-center w-16 h-16">
            <span className="text-primary font-bold text-3xl">M</span>
          </div>
          <div className="text-center">
            <div className="text-sm font-light tracking-wide">LONDON BOROUGH OF</div>
            <div className="text-3xl font-bold">MERTON</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm">
            Admin Login
          </Button>
          <img src={awsLogo} alt="AWS" className="h-10 w-auto" />
        </div>
      </div>
    </header>
  );
};

export default Header;
