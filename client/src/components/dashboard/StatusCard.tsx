import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  linkUrl: string;
  linkText: string;
  progress?: number;
  progressText?: string;
}

export default function StatusCard({
  title,
  value,
  icon,
  iconBgColor,
  linkUrl,
  linkText,
  progress,
  progressText,
}: StatusCardProps) {
  return (
    <Card className="border border-neutral-100">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div
            className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center`}
          >
            {icon}
          </div>
        </div>

        {progress !== undefined && (
          <div className="mt-4">
            <div className="w-full bg-neutral-100 rounded-full h-2.5">
              <div
                className="bg-accent h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {progressText && (
              <p className="text-xs text-neutral-500 mt-2">{progressText}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 border-t border-neutral-100">
        <Link
          href={linkUrl}
          className="text-primary text-sm font-medium hover:underline flex items-center"
        >
          {linkText}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
