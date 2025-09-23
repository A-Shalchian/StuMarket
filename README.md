# StuMarket 🎓 - College Student Marketplace

A modern marketplace platform exclusively for college students to buy, sell, and connect within their campus community.

## 📱 What is StuMarket?

StuMarket is a secure, student-only marketplace where verified college students can:
- Buy and sell textbooks, electronics, furniture, and more
- Create and discover campus events and parties
- Connect with other students through real-time messaging
- Build trust through reviews and ratings
- Trade safely within their college community

## 🛠️ Built With

### Frontend
- **Next.js 15.5.2** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **React 19.1.0** - UI library

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication (Google OAuth)
  - Real-time subscriptions
  - Row Level Security (RLS)
  - File storage

### Features
- 🌓 Dark/Light mode with system preference detection
- 🔐 Google OAuth authentication
- 📱 Fully responsive design
- 🔒 Row-level security for data protection
- ⚡ Real-time updates
- 🎨 Modern glassmorphism UI

## 📋 Development Todo List

### ✅ Phase 1: Foundation (Completed)
- [x] Project setup with Next.js and TypeScript
- [x] Supabase integration
- [x] Google OAuth authentication
- [x] Database schema design (14 tables)
- [x] Basic routing structure
- [x] Dark/light theme toggle
- [x] Responsive navbar with user menu
- [x] Homepage with hero section
- [x] Login page
- [x] Protected routes middleware
- [x] User context provider

### 🚧 Phase 2: Core Marketplace (In Progress)
- [ ] **Listings Management**
  - [ ] Create listing page with form validation
  - [ ] Edit listing functionality
  - [ ] Delete listing with confirmation
  - [ ] Listing detail page
  - [ ] Image upload to Supabase storage
  - [ ] Multiple image support with gallery

- [ ] **Browse & Discovery**
  - [ ] Listings grid view
  - [ ] Listings list view
  - [ ] Category filtering
  - [ ] Price range filter
  - [ ] Condition filter
  - [ ] Sort by (price, date, popularity)
  - [ ] Search functionality with debouncing
  - [ ] Pagination or infinite scroll

- [ ] **User Features**
  - [ ] User profile page
  - [ ] Edit profile functionality
  - [ ] View other users' profiles
  - [ ] User listings tab
  - [ ] Favorites/Wishlist
  - [ ] Recently viewed items

### 📅 Phase 3: Social Features
- [ ] **Messaging System**
  - [ ] Conversation list
  - [ ] Real-time chat interface
  - [ ] Message notifications
  - [ ] Typing indicators
  - [ ] Read receipts
  - [ ] Block/Report users

- [ ] **Events & Parties**
  - [ ] Create event page
  - [ ] Event detail page
  - [ ] Event calendar view
  - [ ] RSVP functionality
  - [ ] Event categories
  - [ ] Event search and filters

- [ ] **Reviews & Ratings**
  - [ ] Add review after transaction
  - [ ] Star rating system
  - [ ] Review moderation
  - [ ] Seller ratings display
  - [ ] Trust score calculation

### 🚀 Phase 4: Advanced Features
- [ ] **Transactions**
  - [ ] Make offer functionality
  - [ ] Accept/Decline offers
  - [ ] Transaction history
  - [ ] Sales analytics for sellers
  - [ ] Purchase history for buyers

- [ ] **Notifications**
  - [ ] In-app notifications
  - [ ] Email notifications
  - [ ] Push notifications (PWA)
  - [ ] Notification preferences

- [ ] **Search & Discovery**
  - [ ] Advanced search filters
  - [ ] Saved searches
  - [ ] Search alerts
  - [ ] Trending items
  - [ ] Recommended for you

- [ ] **Admin Features**
  - [ ] Admin dashboard
  - [ ] User management
  - [ ] Content moderation
  - [ ] Reports management
  - [ ] Analytics dashboard

### 💎 Phase 5: Premium Features
- [ ] **Payments**
  - [ ] Stripe integration
  - [ ] Secure checkout
  - [ ] Payment history
  - [ ] Refund system

- [ ] **Verification**
  - [ ] College email verification (.edu)
  - [ ] Student ID verification
  - [ ] Trusted seller badges

- [ ] **Mobile**
  - [ ] Progressive Web App (PWA)
  - [ ] React Native app
  - [ ] Push notifications

- [ ] **AI Features**
  - [ ] Auto-categorization
  - [ ] Price suggestions
  - [ ] Image recognition for listings
  - [ ] Spam detection

### 🐛 Known Issues & Improvements
- [ ] Fix hydration warnings
- [ ] Optimize image loading
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Setup CI/CD pipeline
- [ ] Add analytics (Google Analytics/Mixpanel)
- [ ] SEO optimization
- [ ] Accessibility improvements (WCAG compliance)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Rate limiting
- [ ] Input sanitization

### 📝 Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Code style guide
- [ ] Security best practices

## 🎯 Current Focus
Working on Phase 2: Core Marketplace features, specifically the listings management system.

---

**Note**: This is an educational project. The roadmap is comprehensive and implementation will be iterative based on user feedback and requirements.