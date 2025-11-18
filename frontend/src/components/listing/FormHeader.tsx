import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FormHeaderProps {
  isEditMode: boolean;
}

export function FormHeader({ isEditMode }: FormHeaderProps) {
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardHeader>
        <Button variant="link" onClick={() => navigate('/my-listings')} className="mb-2 pl-0 w-fit">
          ← Back to My Listings
        </Button>
        <CardTitle className="text-3xl">
          {isEditMode ? 'Edit Listing' : 'Create New Listing'}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
