text
# SMASH SCRAP - AWS Amplify Gen 2 Serverless Platform

A modern, serverless inventory management and auction system for salvage yards, built with AWS Amplify Gen 2.

## 🚀 Overview

SMASH SCRAP provides a complete solution for salvage yard operations, featuring:

- **Multi-tenant architecture** with organization-scoped data isolation
- **Role-based access control** with 5 distinct user types
- **Inventory management** for boxes (packages) and parts with image upload
- **Auction system** with sealed and open bidding
- **Complete buyer marketplace** with terms acceptance and bidding
- **Real-time GraphQL API** powered by AWS AppSync

## 🏗️ Tech Stack

### Frontend
- **React 18** with **Vite** for fast development
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Router** for navigation
- **AWS Amplify UI** for authentication

### Backend (AWS Amplify Gen 2)
- **Authentication**: Amazon Cognito
  - 5 user groups: SuperAdmin, SellerAdmin, YardOperator, Buyer, Inspector
  - Custom attributes: orgID, role
  - Optional MFA (SMS + TOTP)
- **API**: AWS AppSync (GraphQL)
- **Database**: Amazon DynamoDB
  - **9 tables**: Organizations, Users, Boxes, Parts, Sales, Bids, TermsAcceptance, UserModule, OrganizationModule
- **Storage**: Amazon S3
  - Private, organization-scoped image storage
  - Signed URLs for secure access
- **Functions**: AWS Lambda (Node.js)
  - Post-confirmation trigger for user setup
  - Image processor for HEIC conversion, resizing, thumbnails
- **Region**: ca-central-1 (Canada Central)

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and **npm** installed
- **AWS Account** with appropriate permissions
- **AWS CLI** configured with your credentials
- **Git** for version control

## 🎯 Quick Start

### 1. Clone the Repository

git clone https://github.com/jeffreyzwirsky/smash-scrap-amplify-gen2.git
cd smash-scrap-amplify-gen2

text

### 2. Install Dependencies

npm install

text

### 3. Start Amplify Sandbox

The Amplify sandbox provides a cloud-based development environment:

npx ampx sandbox

text

**Wait until you see:**
✔ Deployment completed
File written: amplify_outputs.json
[Sandbox] Watching for file changes...

text

### 4. Start Development Server

In a **new terminal**:

npm run dev

text

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

smash-scrap-amplify-gen2/
├── amplify/
│ ├── auth/
│ │ └── resource.ts # Cognito configuration
│ ├── data/
│ │ └── resource.ts # DynamoDB schema (9 tables)
│ ├── storage/
│ │ └── resource.ts # S3 configuration
│ └── backend.ts # Backend resource wiring
├── src/
│ ├── App.tsx # Main app with routing
│ ├── main.tsx # Entry point with Amplify config
│ ├── components/
│ │ ├── Layout.tsx # Page layout with header/nav
│ │ └── Navigation.tsx # Main navigation bar
│ ├── hooks/
│ │ └── useUserRole.ts # Custom hook for user info
│ ├── pages/
│ │ ├── Dashboard.tsx # Main dashboard
│ │ ├── Organizations.tsx # Org management
│ │ ├── Boxes.tsx # Box inventory list
│ │ ├── BoxDetails.tsx # Box details with parts
│ │ ├── Parts.tsx # All parts view
│ │ ├── Sales.tsx # Sales management (seller)
│ │ ├── SaleDetails.tsx # Sale management & bids
│ │ ├── Marketplace.tsx # Buyer marketplace browse
│ │ └── MarketplaceListing.tsx # Listing details & bidding
│ └── index.css # Tailwind styles
├── public/ # Static assets
├── package.json
└── README.md

text

## 👥 User Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| **SuperAdmin** | Full system access | Manage organizations and all users |
| **SellerAdmin** | Org management | Create sales, manage boxes/parts, finalize |
| **YardOperator** | Inventory operations | Create/edit boxes and parts |
| **Buyer** | Marketplace access | View sales, place bids, accept terms |
| **Inspector** | Read-only access | View inventory and sales data |

## 🗄️ Database Schema

### Core Tables (9 Total)

1. **Organizations** - Multi-tenant organization data
2. **Users** - User profiles with role-based access
3. **Boxes** - Container/package inventory
   - Net/gross/tare weights (lb/kg)
   - Up to 10 images
   - Part count tracking
   - Finalization workflow
4. **Parts** - Individual parts within boxes
   - Material type, fill level
   - Up to 10 images (at least 1 required)
   - Weight tracking (lb/kg)
5. **Sales** - Marketplace listings and auctions
   - Sealed/open bidding
   - Bid deadlines, anti-sniping
   - Terms acceptance required
6. **Bids** - Buyer bids on sales
   - Bid status tracking
   - Automatic winner selection
7. **TermsAcceptance** - Legal audit trail for terms acceptance
8. **UserModule** - Module permissions per user
9. **OrganizationModule** - Module permissions per organization

## ✅ Completed Features

### Inventory Management
- ✅ Create, view, and manage boxes
- ✅ Add parts to boxes with images
- ✅ Finalize boxes (locks from editing)
- ✅ Image upload to S3
- ✅ Weight calculations (lb/kg)
- ✅ Search and filter functionality

### Sales & Auctions
- ✅ Create sales from finalized boxes
- ✅ Sealed and open bid auction types
- ✅ Set starting price, reserve price, timing
- ✅ Activate and close sales
- ✅ Automatic winner selection
- ✅ Bid tracking and ranking

### Buyer Marketplace
- ✅ Browse active listings
- ✅ View listing details
- ✅ Place bids with validation
- ✅ Terms & conditions acceptance
- ✅ Bid confirmation and feedback

### User Management
- ✅ Cognito authentication
- ✅ Multi-tenant data isolation
- ✅ Role-based access control
- ✅ Custom user attributes (orgID, role)

## 🚀 Complete User Workflows

### Seller Workflow
1. Create organization
2. Create box (draft status)
3. Add parts with images (up to 10 per part)
4. Finalize box (locks editing)
5. Create sale listing
6. Activate auction
7. Monitor bids in real-time
8. Close auction → Winner auto-selected
9. Box marked as "sold"

### Buyer Workflow
1. Browse marketplace
2. View listing details
3. Review terms & conditions
4. Accept terms
5. Submit bid (validated)
6. Track bid status
7. If winner → Arrange payment/pickup

## 🖼️ Image Upload

Parts support up to 10 images each:
- Uploaded to S3 private storage
- Access via signed URLs
- Organization-scoped paths
- Automatic image count tracking

> **Note**: HEIC conversion and auto-resizing planned for image-processor Lambda

## 🛠️ Development Workflow

### Making Backend Changes

1. Edit files in `/amplify/` directory
2. Sandbox will auto-detect changes and redeploy
3. Test changes in your local React app

### Updating the Schema

Edit `/amplify/data/resource.ts`:
- Add/modify models
- Update authorization rules
- Sandbox will regenerate GraphQL API

### Adding New Pages

1. Create new component in `/src/pages/`
2. Add route in `/src/App.tsx`
3. Add navigation link in `/src/components/Navigation.tsx`

## 📝 Next Steps

### Backend Enhancements
- [ ] Complete image processor Lambda (HEIC conversion, resizing)
- [ ] Add S3 event trigger for automatic image processing
- [ ] Implement email notifications for bids and sales
- [ ] Add GraphQL subscriptions for real-time updates
- [ ] Set up CloudWatch monitoring and alarms

### Frontend Enhancements
- [ ] Add edit/delete functionality for boxes and parts
- [ ] Build user management dashboard (SuperAdmin)
- [ ] Add image gallery/lightbox for part images
- [ ] Implement real-time bid updates with subscriptions
- [ ] Add export functionality (CSV/PDF reports)
- [ ] Build seller analytics dashboard

### Testing
- [ ] Write unit tests for Lambda functions
- [ ] Add integration tests for GraphQL API
- [ ] Perform end-to-end testing of workflows
- [ ] Load testing for concurrent auctions

## 🚀 Deployment

### Deploy to Production

npx ampx pipeline-deploy --branch main --app-id <YOUR_APP_ID>

text

### Environment Variables

Set in Amplify Console → App Settings → Environment variables:

- `VITE_AWS_REGION`: `ca-central-1`

## 📚 Documentation

For detailed documentation, see:
- [AWS Amplify Gen 2 Docs](https://docs.amplify.aws/gen2/)
- [SMASH SCRAP Development Guide](https://docs.google.com/document/d/1deu1zc-PxVjz-EW3S-KQ4g9iD1dlXIj3TVC40KZVZ_g/edit)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test with `npx ampx sandbox`
4. Submit a pull request

## 📄 License

Private - UNLICENSED

## 👨‍💻 Author

Jeffrey Zwirsky - SMASH SCRAP Team

---

**Built with** ❤️ **using AWS Amplify Gen 2**

**Status**: 🎉 **Core platform complete and functional** 🎉
Summary of Changes:
✅ Updated database count (7 → 9 tables)
✅ Added complete page structure
✅ Marked all completed features as DONE
✅ Added complete user workflows
✅ Updated Next Steps to reflect current state
✅ Added proper status badge at bottom

Replace your README.md with this updated version! 🚀