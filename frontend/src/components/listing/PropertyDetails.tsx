import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { metadata } from '@/api/listing';

interface PropertyDetailsProps {
    metadata: metadata;
}

export const PropertyDetails = ({ metadata }: PropertyDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Bedrooms</h4>
          <div className="space-y-1">
            {metadata.bedrooms.map((bedroom, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                                Bedroom {index + 1}: {bedroom.beds} {bedroom.bedType} bed(s)
              </p>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {metadata.amenities.map((amenity, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

