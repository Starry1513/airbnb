import { Skeleton } from '@/components/ui/skeleton';

export function ListingsLoadingState() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto p-4">
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
