import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    title?: string;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  className = '',
  onClick,
  title
}: StarRatingProps) => {
  const sizeClass = sizeClasses[size];
  const baseClasses = onClick 
    ? `flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${className}`
    : `flex items-center gap-1 ${className}`;

  return (
    <div className={baseClasses} onClick={onClick} title={title}>
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
};

