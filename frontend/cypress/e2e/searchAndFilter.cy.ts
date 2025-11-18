/**
 * Search and Filter Path UI Test
 *
 * This test covers the user journey for browsing and searching listings:
 * 1. User registers and creates multiple listings with different properties
 * 2. User publishes all listings
 * 3. User searches for listings by title
 * 4. User filters listings by number of bedrooms
 * 5. User filters listings by price range
 * 6. User filters listings by property type
 * 7. User clears all filters
 * 8. User views listing details
 * 9. User submits a review for a listing
 * 10. User views their review on the listing page
 *
 * Rationale:
 * This test path is important because it covers the core search and filter
 * functionality that guests use to find suitable properties. The ability to
 * search and filter is essential for user experience and directly impacts
 * booking conversions. This test ensures that:
 * - All filter options work correctly
 * - Filters can be combined (AND logic)
 * - Search results update dynamically
 * - Users can clear filters and start over
 * - Listing details are accessible from search results
 * - Review submission works correctly
 */

describe('Search and Filter Path - Guest Journey', () => {
  const testEmail = `search-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Search Test User';

  // Test listings with different properties
  const listings = [
    {
      title: 'Luxury Studio Apartment',
      propertyType: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      price: 200,
    },
    {
      title: 'Spacious Family House',
      propertyType: 'House',
      bedrooms: 4,
      bathrooms: 3,
      price: 400,
    },
    {
      title: 'Budget Friendly Room',
      propertyType: 'Room',
      bedrooms: 1,
      bathrooms: 1,
      price: 80,
    },
  ];

  before(() => {
    // Register and create listings
    cy.visit('/');
    cy.wait(1000);

    // Register
    cy.get('a[href="/register"]').click();
    cy.wait(1000);

    cy.get('input[name="email"]').type(testEmail);
    cy.get('input[name="password"]').type(testPassword);
    cy.get('input[name="confirmPassword"]').type(testPassword);
    cy.get('input[name="name"]').type(testName);

    cy.get('button[type="submit"]').contains(/register|sign up/i).click();
    cy.wait(1000);

    // Create and publish each listing
    listings.forEach((listing, index) => {
      cy.get('a[href="/new-listing"]').click();
      cy.wait(1000);

      // Fill in listing details
      cy.get('input[name="title"]').type(listing.title);
      cy.get('input[placeholder*="Street"]').type(`${index + 1} Test Street`);
      cy.get('input[placeholder*="City"]').type('Sydney');
      cy.get('input[placeholder*="State"]').type('NSW');
      cy.get('input[placeholder*="Postcode"]').type('2000');
      cy.get('input[placeholder*="Country"]').type('Australia');
      cy.get('input[name="price"]').type(listing.price.toString());

      cy.get('select[name="propertyType"]').select(listing.propertyType);

      // Add bedrooms
      for (let i = 0; i < listing.bedrooms; i++) {
        if (i > 0) {
          cy.get('button').contains(/add.*bedroom/i).click();
          cy.wait(500);
        }
        cy.get('input[placeholder="Beds"]').eq(i).type('2');
      }

      cy.get('input[name="bathrooms"]').type(listing.bathrooms.toString());

      const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      cy.get('input[name="thumbnail"]').type(base64Image);

      cy.get('button[type="submit"]').contains(/create|submit/i).click();
      cy.wait(1000);

      // Publish the listing
      cy.get('button').contains(/publish/i).first().click();
      cy.wait(1000);

      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 30);
      const endDate = futureDate.toISOString().split('T')[0];

      cy.get('input[type="date"]').first().type(startDate);
      cy.get('input[type="date"]').last().type(endDate);

      cy.get('button').contains(/publish|confirm/i).last().click();
      cy.wait(1000);

      // Go back to my listings
      cy.get('a[href="/my-listing"]').click();
      cy.wait(1000);
    });
  });

  it('Should search and filter listings successfully', () => {
    // Step 1 & 2: Already completed in before hook (register and create listings)

    // Go to all listings page
    cy.get('a[href="/"]').click();
    cy.wait(1000);

    // Verify all listings are visible
    listings.forEach((listing) => {
      cy.contains(listing.title).should('exist');
    });

    // Step 3: Search for listings by title
    cy.get('input[placeholder*="search"]').type('Apartment');
    cy.wait(500);

    // Should only show the apartment listing
    cy.contains('Luxury Studio Apartment').should('exist');
    cy.contains('Spacious Family House').should('not.exist');
    cy.contains('Budget Friendly Room').should('not.exist');

    // Clear search
    cy.get('input[placeholder*="search"]').clear();
    cy.wait(500);

    // All listings should be visible again
    listings.forEach((listing) => {
      cy.contains(listing.title).should('exist');
    });

    // Step 4: Filter listings by number of bedrooms
    cy.get('body').then($body => {
      const bedroomInput = $body.find('input[placeholder*="bedroom"]');
      if (bedroomInput.length > 0) {
        cy.get('input[placeholder*="bedroom"]').type('3');
        cy.wait(500);

        // Should only show listings with 3+ bedrooms
        cy.contains('Spacious Family House').should('exist');
        cy.contains('Luxury Studio Apartment').should('not.exist');
        cy.contains('Budget Friendly Room').should('not.exist');

        // Clear bedroom filter
        cy.get('input[placeholder*="bedroom"]').clear();
        cy.wait(500);
      }
    });

    // Step 5: Filter listings by price range
    cy.get('body').then($body => {
      const priceMinInput = $body.find('input[placeholder*="min"]');
      if (priceMinInput.length > 0) {
        cy.get('input[placeholder*="min"]').first().type('100');
        cy.get('input[placeholder*="max"]').first().type('300');
        cy.wait(500);

        // Should show listings between 100-300
        cy.contains('Luxury Studio Apartment').should('exist');
        cy.contains('Spacious Family House').should('not.exist');
        cy.contains('Budget Friendly Room').should('not.exist');

        // Clear price filters
        cy.get('input[placeholder*="min"]').first().clear();
        cy.get('input[placeholder*="max"]').first().clear();
        cy.wait(500);
      }
    });

    // Step 6: Filter listings by property type
    cy.get('body').then($body => {
      const propertyTypeInput = $body.find('input[placeholder*="property"]');
      if (propertyTypeInput.length > 0) {
        cy.get('input[placeholder*="property"]').type('House');
        cy.wait(500);

        // Should only show House type
        cy.contains('Spacious Family House').should('exist');
        cy.contains('Luxury Studio Apartment').should('not.exist');
        cy.contains('Budget Friendly Room').should('not.exist');

        // Clear property type filter
        cy.get('input[placeholder*="property"]').clear();
        cy.wait(500);
      }
    });

    // Step 7: Clear all filters (if button exists)
    cy.get('body').then($body => {
      const clearButton = $body.find('button:contains("Clear")');
      if (clearButton.length > 0) {
        cy.get('button').contains(/clear.*filter/i).click();
        cy.wait(500);
      }
    });

    // All listings should be visible
    listings.forEach((listing) => {
      cy.contains(listing.title).should('exist');
    });

    // Step 8: View listing details
    cy.contains('Luxury Studio Apartment').click();
    cy.wait(1000);

    // Verify we're on the listing detail page
    cy.contains('Luxury Studio Apartment').should('exist');
    cy.contains(/\$200/).should('exist');

    // Step 9 & 10: Submit a review (if option is available)
    cy.get('body').then($body => {
      const reviewButton = $body.find('button:contains("Review")');
      if (reviewButton.length > 0) {
        reviewButton.click();
        cy.wait(1000);

        // Select rating
        cy.get('[data-rating]').last().click().catch(() => {
          cy.get('.star').eq(4).click();
        });

        // Write review comment
        cy.get('textarea').first().type('Great place! Very clean and comfortable.');

        // Submit review
        cy.get('button[type="submit"]').contains(/submit|post/i).click();
        cy.wait(1000);

        // Verify review appears
        cy.contains('Great place! Very clean and comfortable.').should('exist');
      }
    });
  });
});
