import { Button } from "@/components/ui/button";
import awsLogo from "@/assets/aws-logo.png";

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-lg p-2 flex items-center justify-center w-12 h-12">
            <span className="text-primary font-bold text-2xl">M</span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs font-light">LONDON BOROUGH OF</div>
              <div className="text-xl font-bold">MERTON</div>
            </div>
            <div className="h-8 w-px bg-white/30 mx-2" />
            <div className="text-sm font-medium">Cloudwick | Amorphic</div>
            <img src={awsLogo} alt="AWS" className="h-6 w-auto ml-2" />
          </div>
        </div>
        <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
          Admin Login
        </Button>
      </div>
    </header>
  );
};

export default Header;
