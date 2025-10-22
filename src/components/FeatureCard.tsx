import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
}

const FeatureCard = ({ icon: Icon, title }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg transition-colors">
      <Icon className="w-8 h-8 text-primary stroke-[1.5]" />
      <span className="text-sm font-medium text-center">{title}</span>
    </div>
  );
};

export default FeatureCard;
