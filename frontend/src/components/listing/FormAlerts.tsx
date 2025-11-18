import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormAlertsProps {
  error: string;
  successMessage: string;
}

export function FormAlerts({ error, successMessage }: FormAlertsProps) {
  if (!error && !successMessage) return null;

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
