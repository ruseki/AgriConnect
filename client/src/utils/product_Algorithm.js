// utils/product_Algorithm.js

export const rankProducts = (listings) => {
    // Sort products based on the ranking criteria
    listings.forEach(listing => {
      // 1. Product Rank (Based on predefined ranking system)
      listing.rank = calculateProductRank(listing);
  
      // 2. Product Visits (Higher visits = higher ranking)
      listing.rank += calculateProductVisits(listing);
  
      // 3. Time Listed / Recency (Older listings get higher rank)
      listing.rank += calculateRecency(listing);
  
      // 4. User Behavior (Add to cart, etc.)
      listing.rank += calculateUserBehavior(listing);
  
      // 5. Price (Lower price = higher rank)
      listing.rank += calculatePriceRank(listing);
  
      // 6. Stock Availability (More stock = higher rank)
      listing.rank += calculateStockAvailability(listing);
    });
  
    // Sort listings by rank, lowest rank is better (lower rank number)
    listings.sort((a, b) => a.rank - b.rank);
    return listings;
  };
  
  const calculateProductRank = (listing) => {
    // Example logic for ranking: 
    // Lower number means better rank (1 is best)
    // Modify this logic based on your actual ranking system
    return listing.productRank || 0;
  };
  
  const calculateProductVisits = (listing) => {
    // The more visits, the higher the rank
    return listing.visits || 0;
  };
  
  const calculateRecency = (listing) => {
    // The older the listing, the higher the rank (based on creation time)
    const creationDate = new Date(listing.createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate - creationDate;
    return timeDifference;
  };
  
  const calculateUserBehavior = (listing) => {
    // Example logic: more user interaction, higher the rank
    return listing.userBehavior || 0;
  };
  
  const calculatePriceRank = (listing) => {
    // Lower price = higher rank (e.g., $100 product gets 1, $200 gets 2)
    return listing.price || 0;
  };
  
  const calculateStockAvailability = (listing) => {
    // The more stock, the higher the rank
    return listing.stock || 0;
  };
  