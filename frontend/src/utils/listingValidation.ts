// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateListingData = (data: any): { valid: boolean; error?: string } => {
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    return { valid: false, error: 'Title is required and must be a non-empty string' };
  }
  if (!data.address || typeof data.address !== 'object') {
    return { valid: false, error: 'Address is required and must be an object' };
  }
  if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
    return { valid: false, error: 'Price is required and must be a positive number' };
  }
  if (!data.metadata || typeof data.metadata !== 'object') {
    return { valid: false, error: 'Metadata is required and must be an object' };
  }

  const addressFields = ['street', 'city', 'state', 'postcode', 'country'];
  for (const field of addressFields) {
    if (!data.address[field] || typeof data.address[field] !== 'string') {
      return { valid: false, error: `Address.${field} is required and must be a string` };
    }
  }

  if (!data.metadata.propertyType || typeof data.metadata.propertyType !== 'string' || !data.metadata.propertyType.trim()) {
    return { valid: false, error: 'Metadata.propertyType is required and must be a non-empty string' };
  }
  if (typeof data.metadata.bathrooms !== 'number' || data.metadata.bathrooms < 0) {
    return { valid: false, error: 'Metadata.bathrooms is required and must be a non-negative number' };
  }
  if (!Array.isArray(data.metadata.bedrooms) || data.metadata.bedrooms.length === 0) {
    return { valid: false, error: 'Metadata.bedrooms is required and must be a non-empty array' };
  }

  for (let i = 0; i < data.metadata.bedrooms.length; i++) {
    const bedroom = data.metadata.bedrooms[i];
    if (!bedroom || typeof bedroom !== 'object') {
      return { valid: false, error: `Metadata.bedrooms[${i}] must be an object` };
    }
    if (typeof bedroom.beds !== 'number' || bedroom.beds <= 0) {
      return { valid: false, error: `Metadata.bedrooms[${i}].beds must be a positive number` };
    }
    if (!bedroom.bedType || typeof bedroom.bedType !== 'string') {
      return { valid: false, error: `Metadata.bedrooms[${i}].bedType is required and must be a string` };
    }
  }

  return { valid: true };
};
