import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { ListingCardCheckout } from '@/components/listing/ListingCardCheckout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from '../api/booking';
import { fetchListingsWithDetails, OneListing } from '../api/listingQueries';



const Loading = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // Local filter UI states
  const [bedroomsMin, setBedroomsMin] = useState<number | ''>('');
  const [bedroomsMax, setBedroomsMax] = useState<number | ''>('');
  const [bathroomsMin, setBathroomsMin] = useState<number | ''>('');
  const [bathroomsMax, setBathroomsMax] = useState<number | ''>('');
  const [priceMinL, setPriceMinL] = useState<number | ''>('');
  const [priceMaxL, setPriceMaxL] = useState<number | ''>('');
  const [propertyTypeL, setPropertyTypeL] = useState<string>('');
  const [amenityL, setAmenityL] = useState<string>('');
  const [amenitiesL, setAmenitiesL] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [titleSort, setTitleSort] = useState<'asc' | 'desc' | ''>('');

  const { data: listings, isLoading, isError, error } = useQuery({
    queryKey: ['listings-with-details'],
    queryFn: fetchListingsWithDetails,
  });
  //   if (!listings) throw new Error('Failed to fetch listings');
  
  // Filter only published listings
  let publishedListings = listings?.filter((listing: OneListing) => listing.published === true) || [];

  // Apply local UI filters (AND logic) using if
  let finalListings = [...publishedListings];

  if (searchTerm) {
    finalListings = finalListings.filter(l => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = l.title.toLowerCase().includes(searchLower);
      const cityMatch = l.address?.city?.toLowerCase().includes(searchLower);
      return titleMatch || cityMatch;
    });
  }

  if (bedroomsMin !== '') {
    finalListings = finalListings.filter(l => {
      const bedrooms = l.metadata?.bedrooms;
      const bedroomCount = Array.isArray(bedrooms) ? bedrooms.length : (typeof bedrooms === 'number' ? bedrooms : 0);
      return bedroomCount >= Number(bedroomsMin);
    });
  }

  if (bedroomsMax !== '') {
    finalListings = finalListings.filter(l => {
      const bedrooms = l.metadata?.bedrooms;
      const bedroomCount = Array.isArray(bedrooms) ? bedrooms.length : (typeof bedrooms === 'number' ? bedrooms : 0);
      return bedroomCount <= Number(bedroomsMax);
    });
  }

  if (bathroomsMin !== '') {
    finalListings = finalListings.filter(l =>
      (l.metadata?.bathrooms ?? 0) >= Number(bathroomsMin)
    );
  }

  if (bathroomsMax !== '') {
    finalListings = finalListings.filter(l =>
      (l.metadata?.bathrooms ?? 0) <= Number(bathroomsMax)
    );
  }

  if (priceMinL !== '') {
    finalListings = finalListings.filter(l =>
      (l.price ?? 0) >= Number(priceMinL)
    );
  }

  if (priceMaxL !== '') {
    finalListings = finalListings.filter(l =>
      (l.price ?? 0) <= Number(priceMaxL)
    );
  }

  if (propertyTypeL) {
    finalListings = finalListings.filter(l =>
      (l.metadata?.propertyType ?? '').toLowerCase().includes(propertyTypeL.toLowerCase())
    );
  }

  if (amenitiesL.length > 0) {
    finalListings = finalListings.filter(l =>
      l.metadata?.amenities?.some(a => amenitiesL.includes(a))
    );
  }

  if (dateRange) {
    finalListings = finalListings.filter(l =>
      l.availability.some(a => a.start >= dateRange.start && a.end <= dateRange.end)
    );
  }

  // Sort by title if sorting is enabled
  if (titleSort === 'asc') {
    finalListings.sort((a, b) => a.title.localeCompare(b.title));
  } else if (titleSort === 'desc') {
    finalListings.sort((a, b) => b.title.localeCompare(a.title));
  }

  // Legacy filters removed in favor of local UI filters above

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div>Loading...</div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div>Error: {error instanceof Error ? error.message : 'Failed to load listings'}</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">All Listings</CardTitle>
            <CardDescription>
              Browse available properties {publishedListings.length > 0 && `(${publishedListings.length} available)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input 
              type="text" 
              placeholder="Search listings by title or city..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            {/* Filters UI */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Bedrooms (min)</label>
                <Input
                  type="number"
                  min={0}
                  value={bedroomsMin}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBedroomsMin(v === '' ? '' : Math.max(0, Number(v)));
                  }}
                  placeholder="e.g. 2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Bedrooms (max)</label>
                <Input
                  type="number"
                  min={0}
                  value={bedroomsMax}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBedroomsMax(v === '' ? '' : Math.max(0, Number(v)));
                  }}
                  placeholder="e.g. 5"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Bathrooms (min)</label>
                <Input
                  type="number"
                  min={0}
                  value={bathroomsMin}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBathroomsMin(v === '' ? '' : Math.max(0, Number(v)));
                  }}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Bathrooms (max)</label>
                <Input
                  type="number"
                  min={0}
                  value={bathroomsMax}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBathroomsMax(v === '' ? '' : Math.max(0, Number(v)));
                  }}
                  placeholder="e.g. 3"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Sort by Title</label>
                <Select value={titleSort} onValueChange={(value: 'asc' | 'desc' | '') => setTitleSort(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No sort</SelectItem>
                    <SelectItem value="asc">Ascending (A-Z)</SelectItem>
                    <SelectItem value="desc">Descending (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Price Min</label>
                <Input
                  type="number"
                  min={0}
                  value={priceMinL}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPriceMinL(v === '' ? '' : Math.max(0, Number(v)));
                  }}
                  placeholder="e.g. 100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Price Max</label>
                <Input
                  type="number"
                  min={0}
                  value={priceMaxL}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPriceMaxL(v === '' ? '' : Math.max(0, Number(v)));
                  }}
                  placeholder="e.g. 500"
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs text-muted-foreground">Property Type</label>
                <Input
                  type="text"
                  value={propertyTypeL}
                  onChange={(e) => setPropertyTypeL(e.target.value)}
                  placeholder="e.g. Apartment, House"
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs text-muted-foreground">Amenities (add one, press Enter)</label>
                <Input
                  type="text"
                  value={amenityL}
                  onChange={(e) => setAmenityL(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && amenityL.trim()) {
                      if (!amenitiesL.includes(amenityL.trim())) {
                        setAmenitiesL([...amenitiesL, amenityL.trim()]);
                      }
                      setAmenityL('');
                    }
                  }}
                  placeholder="e.g. Wifi"
                />
                {amenitiesL.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {amenitiesL.map((a) => (
                      <Button key={a} variant="secondary" size="sm" onClick={() => setAmenitiesL(amenitiesL.filter(x => x !== a))}>
                        {a} ×
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs text-muted-foreground">Date Range</label>
                <Input
                  type="date"
                  value={dateRange?.start}
                  onChange={(e) => setDateRange({ start: e.target.value, end: dateRange?.end ?? '' })}
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs text-muted-foreground">End Date</label>
                <Input
                  type="date"
                  value={dateRange?.end}
                  onChange={(e) => setDateRange({ start: dateRange?.start ?? '', end: e.target.value })}
                />
              </div>
              <div className="lg:col-span-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setBedroomsMin('');
                    setBedroomsMax('');
                    setBathroomsMin('');
                    setBathroomsMax('');
                    setPriceMinL('');
                    setPriceMaxL('');
                    setPropertyTypeL('');
                    setAmenityL('');
                    setAmenitiesL([]);
                    setDateRange(null);
                    setTitleSort('');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {finalListings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {searchTerm 
                  ? `No listings found matching "${searchTerm}"`
                  : publishedListings.length === 0
                    ? "No published listings available at the moment."
                    : "No listings match your search."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finalListings.map((listing: OneListing) => (
              <ListingCardCheckout key={listing.id} listing={listing} ifDateRange={dateRange ? true : false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;


