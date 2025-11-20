import { VercelRequest, VercelResponse } from '@vercel/node';
import { getEmailFromAuthorization, login, logout, register } from './_lib/service';
import { addListing, getListingDetails, getAllListings, updateListing, removeListing, publishListing, unpublishListing, leaveListingReview, assertOwnsListing } from './_lib/service';
import { makeNewBooking, getAllBookings, removeBooking, acceptBooking, declineBooking, assertOwnsBooking } from './_lib/service';
import { catchErrors } from './_lib/handler';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { method, url } = req;
  
  // Vercel paths include /api prefix, so we need to handle both /api/... and /...
  // Remove /api prefix if present to normalize the path
  let path = url || '/';
  if (path.startsWith('/api')) {
    path = path.substring(4) || '/';
  }

  // Log request for debugging
  console.log(`[${method}] ${path}`, { 
    url, 
    hasBody: !!req.body, 
    contentType: req.headers['content-type'],
    query: req.query 
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vercel automatically parses JSON body, but ensure it's an object
  if ((method === 'POST' || method === 'PUT') && req.body) {
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {
        console.error('Failed to parse JSON body:', e);
        res.status(400).json({ error: 'Invalid JSON in request body' });
        return;
      }
    }
  }

  try {
    // Auth routes
    if (path === '/user/auth/login' && method === 'POST') {
      const { email, password } = req.body;
      const token = await login(email, password);
      res.json({ token });
      return;
    }

    if (path === '/user/auth/register' && method === 'POST') {
      const { email, password, name } = req.body || {};
      
      // Log request body for debugging
      console.log('Register request body:', { email, password, name, bodyType: typeof req.body });
      
      // Validate required fields before calling register
      if (!email || !password || !name) {
        const missing = [];
        if (!email) missing.push('email');
        if (!password) missing.push('password');
        if (!name) missing.push('name');
        res.status(400).json({ error: `Must provide: ${missing.join(', ')}` });
        return;
      }
      
      const token = await register(email, password, name);
      res.json({ token });
      return;
    }

    if (path === '/user/auth/logout' && method === 'POST') {
      const email = getEmailFromAuthorization(req.headers.authorization);
      await logout(email);
      res.json({});
      return;
    }

    // Listings routes
    if (path === '/listings' && method === 'GET') {
      const listings = await getAllListings();
      res.json({ listings });
      return;
    }

    if (path === '/listings/new' && method === 'POST') {
      const email = getEmailFromAuthorization(req.headers.authorization);
      const { title, address, price, thumbnail, metadata } = req.body;
      const listingId = await addListing(title, email, address, price, thumbnail, metadata);
      res.json({ listingId });
      return;
    }

    const listingMatch = path.match(/^\/listings\/(\d+)$/);
    if (listingMatch) {
      const listingId = listingMatch[1];

      if (method === 'GET') {
        const listing = await getListingDetails(listingId);
        res.json({ listing });
        return;
      }

      if (method === 'PUT') {
        const email = getEmailFromAuthorization(req.headers.authorization);
        await assertOwnsListing(email, listingId);
        const { title, address, thumbnail, price, metadata } = req.body;
        await updateListing(listingId, title, address, thumbnail, price, metadata);
        res.json({});
        return;
      }

      if (method === 'DELETE') {
        const email = getEmailFromAuthorization(req.headers.authorization);
        await assertOwnsListing(email, listingId);
        await removeListing(listingId);
        res.json({});
        return;
      }
    }

    const publishMatch = path.match(/^\/listings\/publish\/(\d+)$/);
    if (publishMatch && method === 'PUT') {
      const listingId = publishMatch[1];
      const email = getEmailFromAuthorization(req.headers.authorization);
      await assertOwnsListing(email, listingId);
      const { availability } = req.body;
      await publishListing(listingId, availability);
      res.json({});
      return;
    }

    const unpublishMatch = path.match(/^\/listings\/unpublish\/(\d+)$/);
    if (unpublishMatch && method === 'PUT') {
      const listingId = unpublishMatch[1];
      const email = getEmailFromAuthorization(req.headers.authorization);
      await assertOwnsListing(email, listingId);
      await unpublishListing(listingId);
      res.json({});
      return;
    }

    const reviewMatch = path.match(/^\/listings\/(\d+)\/review\/(\d+)$/);
    if (reviewMatch && method === 'PUT') {
      const listingId = reviewMatch[1];
      const bookingId = reviewMatch[2];
      const email = getEmailFromAuthorization(req.headers.authorization);
      const { review } = req.body;
      await leaveListingReview(email, listingId, bookingId, review);
      res.json({});
      return;
    }

    // Bookings routes
    if (path === '/bookings' && method === 'GET') {
      const bookings = await getAllBookings();
      res.json({ bookings });
      return;
    }

    const newBookingMatch = path.match(/^\/bookings\/new\/(\d+)$/);
    if (newBookingMatch && method === 'POST') {
      const listingId = newBookingMatch[1];
      const email = getEmailFromAuthorization(req.headers.authorization);
      const { dateRange, totalPrice } = req.body;
      const bookingId = await makeNewBooking(email, dateRange, totalPrice, listingId);
      res.json({ bookingId });
      return;
    }

    const bookingMatch = path.match(/^\/bookings\/(\d+)$/);
    if (bookingMatch && method === 'DELETE') {
      const bookingId = bookingMatch[1];
      const email = getEmailFromAuthorization(req.headers.authorization);
      await assertOwnsBooking(email, bookingId);
      await removeBooking(bookingId);
      res.json({});
      return;
    }

    const acceptMatch = path.match(/^\/bookings\/accept\/(\d+)$/);
    if (acceptMatch && method === 'PUT') {
      const bookingId = acceptMatch[1];
      const email = getEmailFromAuthorization(req.headers.authorization);
      await acceptBooking(email, bookingId);
      res.json({});
      return;
    }

    const declineMatch = path.match(/^\/bookings\/decline\/(\d+)$/);
    if (declineMatch && method === 'PUT') {
      const bookingId = declineMatch[1];
      const email = getEmailFromAuthorization(req.headers.authorization);
      await declineBooking(email, bookingId);
      res.json({});
      return;
    }

    // Default - API docs
    if (path === '/' || path === '/docs') {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AirBrB API</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              h1 { color: #333; }
              code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
              .endpoint { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #007bff; }
              .method { font-weight: bold; color: #007bff; }
            </style>
          </head>
          <body>
            <h1>AirBrB API Documentation</h1>
            <p>Base URL: <code>${req.headers.host}</code></p>

            <h2>Authentication</h2>
            <div class="endpoint">
              <div><span class="method">POST</span> /user/auth/register</div>
              <div><span class="method">POST</span> /user/auth/login</div>
              <div><span class="method">POST</span> /user/auth/logout</div>
            </div>

            <h2>Listings</h2>
            <div class="endpoint">
              <div><span class="method">GET</span> /listings</div>
              <div><span class="method">POST</span> /listings/new</div>
              <div><span class="method">GET</span> /listings/:id</div>
              <div><span class="method">PUT</span> /listings/:id</div>
              <div><span class="method">DELETE</span> /listings/:id</div>
              <div><span class="method">PUT</span> /listings/publish/:id</div>
              <div><span class="method">PUT</span> /listings/unpublish/:id</div>
              <div><span class="method">PUT</span> /listings/:id/review/:bookingid</div>
            </div>

            <h2>Bookings</h2>
            <div class="endpoint">
              <div><span class="method">GET</span> /bookings</div>
              <div><span class="method">POST</span> /bookings/new</div>
              <div><span class="method">DELETE</span> /bookings/:id</div>
              <div><span class="method">PUT</span> /bookings/accept/:id</div>
              <div><span class="method">PUT</span> /bookings/decline/:id</div>
            </div>
          </body>
        </html>
      `);
      return;
    }

    res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    // Log full error for debugging
    console.error('[Handler Error]', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      path,
      method
    });
    
    // Re-throw to let catchErrors handle it properly
    throw error;
  }
};

export default catchErrors(handler);
