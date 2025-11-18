import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReviewFormFields } from './ReviewFormFields';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  comment: string;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const ReviewDialog = ({ open, onOpenChange, score, comment, onScoreChange, onCommentChange, onSubmit, isSubmitting, onCancel }: ReviewDialogProps) => {
  const isValid = score >= 1 && score <= 5 && comment.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>Leave a review for this listing</DialogDescription>
        </DialogHeader>
        <ReviewFormFields score={score} comment={comment} onScoreChange={onScoreChange} onCommentChange={onCommentChange} />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSubmit} disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
