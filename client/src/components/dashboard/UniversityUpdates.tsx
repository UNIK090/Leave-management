import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Update } from "@shared/types";
import { CampaignOutlined } from '@mui/icons-material';
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface UniversityUpdatesProps {
  updates: Update[];
  isLoading?: boolean;
}

export default function UniversityUpdates({ updates, isLoading = false }: UniversityUpdatesProps) {
  return (
    <Card className="border-neutral-100">
      <CardHeader className="pb-3 border-b border-neutral-100">
        <CardTitle className="text-lg font-semibold flex items-center">
          <span className="material-icons text-accent-dark mr-2">campaign</span>
          University Updates
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-neutral-500">Loading updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No updates available.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {updates.map((update) => (
              <div key={update.id} className="p-4 hover:bg-neutral-50 transition-colors duration-150">
                {update.imageUrl && (
                  <img 
                    src={update.imageUrl} 
                    alt={update.title} 
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-medium text-sm">{update.title}</h3>
                <p className="text-xs text-neutral-500 mt-1">{update.content}</p>
                <p className="text-xs text-primary mt-2">
                  Posted {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 border-t border-neutral-100 bg-neutral-50">
        <Link 
          href="/updates" 
          className="text-primary text-sm font-medium hover:underline block text-center w-full"
        >
          View All Updates
        </Link>
      </CardFooter>
    </Card>
  );
}
