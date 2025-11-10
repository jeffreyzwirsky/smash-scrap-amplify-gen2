# SMASH SCRAP - AWS Amplify Gen 2 Serverless Platform

A modern, serverless inventory management and auction system for salvage yards, built with AWS Amplify Gen 2.

## 🚀 Overview

SMASH SCRAP provides a complete solution for salvage yard operations, featuring:

- **Multi-tenant architecture** with organization-scoped data isolation
- **Role-based access control** with 5 distinct user types
- **Inventory management** for boxes (packages) and parts
- **Auction system** with sealed and open bidding
- **Image processing** with HEIC support, auto-resizing, and thumbnails
- **Real-time updates** via GraphQL subscriptions

## 🏗️ Tech Stack

### Frontend
- **React 18** with **Vite** for fast development
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality

### Backend (AWS Amplify Gen 2)
- **Authentication**: Amazon Cognito
  - 5 user groups: SuperAdmin, SellerAdmin, YardOperator, Buyer, Inspector
  - Custom attributes: orgID, role
  - Optional MFA (SMS + TOTP)
- **API**: AWS AppSync (GraphQL)
- **Database**: Amazon DynamoDB
  - 7 tables: Organizations, Users, Boxes, Parts, Sales, Bids, TermsAcceptance
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

```bash
git clone https://github.com/jeffreyzwirsky/smash-scrap-amplify-gen2.git
cd smash-scrap-amplify-gen2
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install Lambda function dependencies
cd amplify/function/post-confirmation
npm install
cd ../../..

cd amplify/function/image-processor
npm install
cd ../../..
```

### 3. Start Amplify Sandbox

The Amplify sandbox provides a cloud-based development environment:

```bash
npx ampx sandbox
```

This will:
- Deploy all backend resources to AWS
- Generate the `amplify_outputs.json` file
- Watch for changes and auto-deploy

### 4. Start Development Server

In a new terminal:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
smash-scrap-amplify-gen2/
├── amplify/
│   ├── auth/
│   │   └── resource.ts          # Cognito configuration
│   ├── data/
│   │   └── resource.ts          # DynamoDB schema (7 tables)
│   ├── storage/
│   │   └── resource.ts          # S3 configuration
│   ├── function/
│   │   ├── post-confirmation/   # User setup Lambda
│   │   │   ├── resource.ts
│   │   │   ├── handler.ts
│   │   │   └── package.json
│   │   └── image-processor/     # Image processing Lambda
│   │       ├── resource.ts
│   │       ├── handler.ts
│   │       └── package.json
│   └── backend.ts               # Backend resource wiring
├── src/
│   ├── App.tsx                  # Main React component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind styles
├── public/                       # Static assets
├── package.json
└── README.md
```

## 👥 User Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| **SuperAdmin** | Full system access | Manage organizations and all users |
| **SellerAdmin** | Org management | Create sales, manage boxes/parts, finalize |
| **YardOperator** | Inventory operations | Create/edit boxes and parts |
| **Buyer** | Marketplace access | View sales, place bids, accept terms |
| **Inspector** | Read-only access | View inventory and sales data |

## 🗄️ Database Schema

### Core Tables

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
   - Weight tracking
5. **Sales** - Marketplace listings and auctions
   - Sealed/open bidding
   - Bid deadlines, anti-sniping
   - Terms acceptance required
6. **Bids** - Buyer bids on sales
7. **TermsAcceptance** - Track buyer acceptance of sale terms

## 🖼️ Image Processing

The image processor Lambda handles:

- **HEIC to JPG conversion** using `heic-convert`
- **Resize to max 2560px** (maintaining aspect ratio)
- **Generate 800px thumbnails**
- **Strip GPS data** from EXIF
- **Preserve EXIF time and orientation**
- **Enforce 5MB max file size**

> **Note**: The image processor is currently a stub. Full implementation with `sharp` and `heic-convert` needs to be completed.

## 🚀 Deployment

### Deploy to AWS

```bash
npx ampx pipeline-deploy --branch main --app-id <YOUR_APP_ID>
```

### Environment Variables

Set in Amplify Console → App Settings → Environment variables:

- `VITE_AWS_REGION`: `ca-central-1`
- Add any other environment-specific variables

## 🛠️ Development Workflow

### Making Backend Changes

1. Edit files in `/amplify/` directory
2. Sandbox will auto-detect changes and redeploy
3. Test changes in your local React app

### Adding New Lambda Functions

1. Create new directory in `/amplify/function/`
2. Add `resource.ts` and `handler.ts`
3. Create `package.json` with dependencies
4. Import and register in `amplify/backend.ts`

### Updating the Schema

Edit `/amplify/data/resource.ts`:
- Add/modify models
- Update authorization rules
- Sandbox will regenerate GraphQL API

## 📝 Next Steps

### Frontend Development
- [ ] Build Box/Part management UI (SellerAdmin, YardOperator)
- [ ] Implement Marketplace and bidding interface (Buyer)
- [ ] Create user management dashboard (SuperAdmin)
- [ ] Add image upload with S3 signed URLs
- [ ] Implement real-time updates with GraphQL subscriptions

### Backend Completion
- [ ] Complete image processor Lambda implementation
- [ ] Add S3 event trigger for automatic image processing
- [ ] Implement DynamoDB User record creation in post-confirmation
- [ ] Add email notifications for bids and sales
- [ ] Set up CloudWatch monitoring and alarms

### Testing
- [ ] Write unit tests for Lambda functions
- [ ] Add integration tests for GraphQL API
- [ ] Perform end-to-end testing of workflows

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

SMASH SCRAP Team

---

**Built with** ❤️ **using AWS Amplify Gen 2**
