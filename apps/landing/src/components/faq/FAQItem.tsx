import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

interface FAQItemProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FAQItem({
  question,
  answer,
  isExpanded,
  onToggle,
}: FAQItemProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
      >
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground pr-6">
          {question}
        </h3>
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-6 w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
          ) : (
            <ChevronDown className="h-6 w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
          )}
        </div>
      </button>
      <div
        className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="border-t border-gray-200 dark:border-gray-800">
          <p className="px-6 md:px-8 py-4 md:py-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
