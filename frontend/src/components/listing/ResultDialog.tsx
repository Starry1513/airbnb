import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ResultDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'success' | 'error';
    message: string;
}

export const ResultDialog = ({ open, onOpenChange, type, message }: ResultDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {type === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            <DialogTitle>
              {type === 'success' ? 'Success!' : 'Error'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
                        OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

