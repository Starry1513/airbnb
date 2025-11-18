import { Alert, AlertDescription } from '@/components/ui/alert';

export function NotLoggedInState() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Alert className="max-w-md">
        <AlertDescription>
          Please log in to view your listings
        </AlertDescription>
      </Alert>
    </div>
  );
}
