import { Alert, AlertDescription } from '@/components/ui/alert';

interface ListingsErrorStateProps {
  error: Error | null;
}

export function ListingsErrorState({ error }: ListingsErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertDescription>
          Error: {error instanceof Error ? error.message : 'Failed to load listings'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
