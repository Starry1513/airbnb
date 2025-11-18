import { apiCall } from './config';
// finishing listnig api according to api swagger doc

export interface Listings {
  listings: Listing[];
}


export interface Listing {
  id: number;
  title: string;
  owner: string;
  address: Address;
  thumbnail: string;
  published: boolean;
  price?: number;
  reviews?: Review[];
  metadata?: metadata;
}

export interface GetOneListing {
  title:        string;
  owner:        string;
  address:      Address;
  price:        number;
  thumbnail:    string;
  metadata:     metadata;
  reviews:      Review[];
  availability: AvailabilityRange[];
  published:    boolean;
  postedOn:     string;
}


export interface NewListing {
  title:     string;
  address:   Address;
  price:     number;
  thumbnail: string;
  metadata:  metadata;
}


export interface Address {
  street:     string;
  city:       string;
  state:      string;
  country:    string;
  postcode:   string;
}
export interface Bedroom {
  beds: number;
  bedType: string;
}

export interface metadata {
  bedrooms:    Bedroom[];
  bathrooms:   number;
  propertyType: string;
  amenities:   string[];
}

export interface Review {
  score: number;
  comment: string;
  userEmail: string;
}


export interface listId {
  listingId: number;
}



export const getListings = async (): Promise<Listings> => {
  return apiCall('/listings');
};

export const newListing = async (
  { title, address, price, thumbnail, metadata }: NewListing
): Promise<listId> => {
  return apiCall('/listings/new', {
    method: 'POST',
    body: JSON.stringify({ title, address, price, thumbnail, metadata }),
  });
};

export const getOneListing = async ({listingId} : listId): Promise<GetOneListing> => {
  const response = await apiCall(`/listings/${listingId}`);
  return response.listing;
};

export interface UpdateListing {
  title?:     string;
  address?:   Address;
  price?:     number;
  thumbnail?: string;
  metadata?:  metadata;
}



export const updateListing = async (
  listingId: number,
  updates: UpdateListing
): Promise<void> => {
  return apiCall(`/listings/${listingId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export interface AvailabilityRange {
  start: string;
  end: string;
}

export const publishListing = async (
  listingId: number,
  availability: AvailabilityRange[]
): Promise<void> => {
  // Convert from { start, end } to { from, to } format expected by backend
  const backendFormat = availability.map(range => ({
    from: range.start,
    to: range.end,
  }));
  return apiCall(`/listings/publish/${listingId}`, {
    method: 'PUT',
    body: JSON.stringify({ availability: backendFormat }),
  });
};

export const unpublishListing = async (listingId: number): Promise<void> => {
  return apiCall(`/listings/unpublish/${listingId}`, {
    method: 'PUT',
  });
};

export const deleteListing = async (listingId: number): Promise<void> => {
  return apiCall(`/listings/${listingId}`, {
    method: 'DELETE',
  });
};
//  call API `makeNewBooking(listingId, dateRange, totalPrice)` (adjust to your API)

export const makeNewBooking = async (listingId: number, dateRange: string[], totalPrice: number): Promise<void> => {
  // Backend expects dateRange in format { from: string, to: string }
  const dateRangeObj = {
    from: dateRange[0],
    to: dateRange[1],
  };
  const payload = { dateRange: dateRangeObj, totalPrice };
  console.log('Making booking request:', {
    listingId,
    endpoint: `/bookings/new/${listingId}`,
    payload,
  });
  return apiCall(`/bookings/new/${listingId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// /listings/{listingid}/review/{bookingid}
// Backend expects: PUT method with { review: { text: string, rating: number } }
export const leaveReview = async (listingId: number, bookingId: number, score: number, comment: string): Promise<void> => {
  // Backend expects rating (not score) and text (not comment)
  const review = {
    text: comment,
    rating: score,
  };
  return apiCall(`/listings/${listingId}/review/${bookingId}`, {
    method: 'PUT',
    body: JSON.stringify({ review }),
  });
};

