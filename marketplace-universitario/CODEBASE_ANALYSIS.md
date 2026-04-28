# Marketplace Universitario - Review & Product Display Analysis

## 1. CURRENT REVIEW DISPLAY STRUCTURE

### Backend Review Model (Prisma Schema)
```prisma
model Review {
  id         String   @id @default(dbgenerated("(gen_random_uuid())::text"))
  orderId    String   @unique
  profileId  String
  reviewerId String
  rating     Int                    // 1-5 star rating
  comment    String?  @db.VarChar(300)  // Max 300 characters
  createdAt  DateTime @default(now())
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  profile    Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  reviewer   User     @relation("ReviewerRelation", fields: [reviewerId], references: [id], onDelete: Cascade)
}
```

### Backend API Endpoints (reviews.routes.js)
1. **POST /api/reviews** - Create review (COMPRADOR only)
   - Body: `{ orderId, rating, comment }`
   - Validates: order exists, belongs to reviewer, is DELIVERED
   - Returns: review data with reviewer email & profile businessName

2. **GET /api/reviews/profile/:profileId** - Fetch reviews for entrepreneur
   - Query params: `page` (default 1), `limit` (default 10)
   - Returns:
     ```json
     {
       success: true,
       data: {
         profile: { id, businessName },
         averageRating: float,
         totalReviews: number,
         reviews: [
           {
             id,
             rating,
             comment,
             createdAt,
             reviewer: { email },
             order: { product: { name } }
           }
         ]
       },
       pagination: { page, limit, total, pages }
     }
     ```

### Frontend Review Display (ReviewsSection.jsx)
- **Component Path**: `frontend/src/modules/reviews/ReviewsSection.jsx`
- **Used in**: ProfilePage.jsx (under profile)
- **Features**:
  - Displays summary: average rating + total reviews count
  - Shows individual reviews with:
    - Reviewer email
    - Date (formatted)
    - Star rating (1-5)
    - Comment text
    - Product name (optional)
  - Pagination: 5 reviews per page
  - Loading state: skeleton placeholders
  - Empty state: "No reviews yet" message

---

## 2. PRODUCT DISPLAY STRUCTURE

### Frontend Product Card (ProductCard.jsx)
- **Component Path**: `frontend/src/components/ui/ProductCard.jsx`
- **Used in**: CatalogPage, ProductsPage, ProfilePage products section
- **Displays**:
  - Product image (4:3 aspect ratio)
  - Product name (clamped to 2 lines)
  - Seller name (visible on hover with gradient overlay)
  - Category badge (top-right corner)
  - Price (formatted currency)
  - Red aesthetic: triangular notch, left border, hover effects
- **Includes seller info**: `seller.profile.businessName` from data

### Backend Product Queries (products.controller.js - getAll())
- **Includes in product query**:
  ```javascript
  {
    seller: { 
      select: { 
        id, email, 
        profile: { select: { businessName, photoUrl } } 
      } 
    },
    category: { select: { id, name } },
    _count: { select: { orders: true } }  // Order count only, NO reviews
  }
  ```
- **Filters available**: keyword, categoryId, price range, sellerId, orderBy (price/recent)
- **No review data included** in product catalog listings

### Product Detail Page (ProductDetailPage.jsx)
- **Path**: `frontend/src/modules/catalog/ProductDetailPage.jsx`
- **Shows**:
  - Seller profile link
  - Product images with gallery
  - Product description
  - Category, name, price
- **Does NOT display reviews** (only reviews in ProfilePage)

---

## 3. REVIEW DATA STRUCTURE - WHAT'S AVAILABLE

### Currently Included in Review Creation (create endpoint)
```json
{
  "id": "uuid",
  "orderId": "uuid",
  "profileId": "uuid",
  "reviewerId": "uuid",
  "rating": 1-5,
  "comment": "text (max 300 chars)",
  "createdAt": "ISO datetime",
  "reviewer": {
    "email": "string"
  },
  "profile": {
    "businessName": "string"
  }
}
```

### Order Relations Accessible (but not fetched)
```json
{
  "order": {
    "id": "uuid",
    "product": {
      "name": "string",
      "id": "uuid",
      "price": "decimal",
      "description": "string",
      "categoryId": "uuid"
			// seller info available but NOT included in review endpoint
    }
  }
}
```

### Gap: Missing Seller/Product Details
Currently, the review endpoint only includes:
- ✅ Reviewer email
- ✅ Product name (via order.product.name)
- ❌ Seller name/profile info (separate query needed)
- ❌ Product image
- ❌ Product category
- ❌ Product seller rating summary

---

## 4. KEY FINDINGS & RECOMMENDATIONS

### What Currently Works
1. **Reviews are linked to entrepreneurs** (via profile, not products)
   - One review per order (one-to-one unique constraint on orderId)
   - Reviews display on entrepreneur ProfilePage
   
2. **Review fetching is separate from product queries**
   - Reviews not included in product catalog data
   - Reduces payload for large product listings
   
3. **Star rating component** (StarRating.jsx)
   - Works in read-only mode everywhere
   - Supports interactive mode for creating reviews

### Current Limitations
1. **No seller ratings on product cards**
   - Products don't show average rating/review count
   - Users can't assess seller quality in catalog view
   
2. **Reviews only shown on ProfilePage**
   - Not visible on ProductDetailPage
   - ProductDetailPage doesn't link to reviews section
   
3. **Limited reviewer anonymity**
   - Shows full email address (could use initials/username instead)
   
4. **No review moderation**
   - No edit/delete endpoints for reviews
   - No backend validation of review quality

### Architecture Decision: Reviews on Profiles, Not Products
- Reviews are tied to **entrepreneur profiles**, not individual products
- This aligns with marketplace model where sellers are rated overall
- One order can only have one review (preventing duplicate reviews)
- Makes sense for B2B university marketplace

---

## 5. WHERE CHANGES WOULD NEED TO BE MADE

### To Display Seller Ratings on Product Cards:
1. **Backend - products.controller.js**
   - Add seller review stats to product query:
     ```javascript
     seller: {
       select: {
         profile: {
           select: {
             businessName,
             photoUrl,
             _count: { select: { reviews: true } },
             reviews: {
               select: { rating: true },
               // Calculate average client-side or add aggregation
             }
           }
         }
       }
     }
     ```

2. **Frontend - ProductCard.jsx**
   - Add StarRating component showing seller average
   - Add review count badge

### To Link ProductDetailPage to Reviews:
1. **ProductDetailPage.jsx**
   - Fetch seller profile reviews
   - Display ReviewsSection below seller info
   - Or add tab: "Reviews" showing seller's reviews

2. **Add useReviews hook** (optional pattern)
   - Similar to useOrders
   - Fetch reviews by profileId
   - Reusable across components

### To Improve Review Creation Experience:
1. **Add review creation flow**
   - After order is DELIVERED, show "Leave review" button
   - Modal/page with review form
   - Already has validators in place: `reviews.validators.js`

2. **Backend endpoint already exists**
   - POST /api/reviews works
   - Just needs frontend implementation

---

## 6. FILE STRUCTURE SUMMARY

### Frontend Review Files
- `frontend/src/modules/reviews/ReviewsSection.jsx` - Main review display
- `frontend/src/components/ui/StarRating.jsx` - Star rating input/display
- `frontend/src/modules/profile/ProfilePage.jsx` - Uses ReviewsSection

### Backend Review Files
- `backend/src/controllers/reviews.controller.js` - 2 endpoints (create, getByProfile)
- `backend/src/routes/reviews.routes.js` - Route definitions
- `backend/src/middlewares/validators/reviews.validators.js` - Input validation
- `backend/prisma/schema.prisma` - Review model definition

### Related Product Files
- `backend/src/controllers/products.controller.js` - Product queries
- `frontend/src/components/ui/ProductCard.jsx` - Product display
- `frontend/src/modules/catalog/ProductDetailPage.jsx` - Product detail view

---

## 7. REVIEW CREATION FLOW (Not Yet Implemented in UI)

1. **Buyer receives order** (DELIVERED status)
2. **Buyer navigates to orders/profile section**
3. **Click "Leave Review" on delivered order**
4. **Modal opens with review form**:
   - Star rating selector
   - Text input (max 300 chars)
   - Product name shown (read-only)
5. **Submit POST /api/reviews**
   - success → show confirmation
   - error → show error message

**Current Status**: Validators exist, endpoint works, but no UI to create reviews yet.
