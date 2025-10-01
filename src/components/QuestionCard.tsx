import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuestionCardProps {
  icon: LucideIcon;
  question: string;
  category: string;
  onClick: () => void;
}

const QuestionCard = ({ icon: Icon, question, category, onClick }: QuestionCardProps) => {
  return (
    <Card 
      className="p-4 cursor-pointer hover:border-primary/50 transition-all hover:shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm mb-1">{question}</p>
          <p className="text-xs text-muted-foreground">{category}</p>
        </div>
      </div>
    </Card>
  );
};

export default QuestionCard;
