import { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';

interface ReviewFormFieldsProps {
  score: number;
  comment: string;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
}

export function ReviewFormFields({ score, comment, onScoreChange, onCommentChange }: ReviewFormFieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Score (1-5)</label>
        <Input
          type="number"
          min="1"
          max="5"
          value={score || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onScoreChange(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Comment</label>
        <Textarea
          value={comment}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onCommentChange(e.target.value)}
          placeholder="Write your review here..."
        />
      </div>
    </div>
  );
}
