import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== SMASH SCRAP - COMPLETE DATABASE SCHEMA ==
 * 
 * This schema defines 7 tables for the SMASH SCRAP inventory management system:
 * 1. Organizations - Multi-tenant organization data
 * 2. Users - User profiles with role-based access
 * 3. Boxes - Container/package inventory
 * 4. Parts - Individual parts within boxes
 * 5. Sales - Marketplace listings and auctions
 * 6. Bids - Buyer bids on sales
 * 7. TermsAcceptance - Track buyer acceptance of sale terms
 * 
 * Features:
 * - Multi-tenant isolation via orgID
 * - Role-based authorization (SuperAdmin, SellerAdmin, YardOperator, Buyer, Inspector)
 * - Relationships between entities
 * - Sealed and open auction support
 * - Image storage references (S3)
 * - Weight calculations (lb/kg)
 * - Status tracking and audit trails
 */

const schema = a.schema({
  
  // ============================================
  // ORGANIZATIONS TABLE
  // ============================================
  Organization: a
    .model({
      orgID: a.id().required(),
      orgName: a.string().required(),
      address: a.string(),
      city: a.string(),
      province: a.string(),
      postalCode: a.string(),
      country: a.string().default('Canada'),
      contactEmail: a.email().required(),
      contactPhone: a.phone(),
      region: a.string(),
      status: a.enum(['active', 'inactive', 'suspended']),
      settings: a.json(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.group('SuperAdmin'),
    ]),

  // ============================================
  // USERS TABLE
  // ============================================
  User: a
    .model({
      userID: a.id().required(),
      cognitoID: a.string().required(),
      email: a.email().required(),
      displayName: a.string().required(),
      firstName: a.string(),
      lastName: a.string(),
      phone: a.phone(),
      role: a.enum(['SuperAdmin', 'SellerAdmin', 'YardOperator', 'Buyer', 'Inspector']),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      status: a.enum(['active', 'inactive', 'suspended'),active'),
      permissions: a.json(),
      lastLoginAt: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read', 'update']),
    ]),

  // ============================================
  // BOXES TABLE (Packages/Containers)
  // ============================================
  Box: a
    .model({
      boxID: a.id().required(),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id().required(),
      seller: a.belongsTo('User', 'sellerID'),
      boxNumber: a.string(),
      status: a.enum(['draft', 'in_progress', 'finalized', 'listed', 'sold'),draft'),
      location: a.string(),
      materialType: a.enum(['aluminum', 'copper', 'brass', 'stainless', 'steel', 'mixed']),
      
      // Dimensions
      length: a.float(),
      width: a.float(),
      height: a.float(),
      dimensionUnit: a.enum(['inches', 'cm'),inches'),
      
      // Weights (lb is authoritative, kg is derived)
      grossWeightLb: a.float(),
      tareWeightLb: a.float(),
      netWeightLb: a.float(),
      grossWeightKg: a.float(),
      tareWeightKg: a.float(),
      netWeightKg: a.float(),
      
      // Finalization tracking
      isFinalized: a.boolean().default(false),
      finalizedAt: a.datetime(),
      finalizedBy: a.id(),
      finalizeRecord: a.json(), // Stores finalization audit data
      
      // Images (up to 10)
      images: a.string().array(), // Array of S3 keys
      imagesCount: a.integer().default(0),
      
      // Part tracking
      partsCount: a.integer().default(0),
      parts: a.hasMany('Part', 'boxID'),
      
      notes: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      createdBy: a.id(),
      updatedBy: a.id(),
    })
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read', 'create', 'update', 'delete']),
      allow.group('YardOperator').to(['read', 'create', 'update']),
      allow.group('Inspector').to(['read']),
      allow.publicApiKey().to(['read']), // For marketplace viewing
    ]),

  // ============================================
  // PARTS TABLE
  // ============================================
  Part: a
    .model({
      partID: a.id().required(),
      boxID: a.id().required(),
      box: a.belongsTo('Box', 'boxID'),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id().required(),
      seller: a.belongsTo('User', 'sellerID'),
      
      partNumber: a.string(),
      partName: a.string(),
      partType: a.string(),
      materialType: a.enum(['aluminum', 'copper', 'brass', 'stainless', 'steel', 'mixed']),
      
      // Weight
      weightLb: a.float(),
      weightKg: a.float(),
      
      // Fill level (required)
      fillLevel: a.enum(['empty', 'partial', 'full']),
      
      // Images (up to 10, at least 1 required)
      images: a.string().array(),
      imagesCount: a.integer().default(0),
      
      // Status
      status: a.enum(['draft', 'active', 'removed'),active'),
      
      description: a.string(),
      notes: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      addedBy: a.id(),
    })
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read', 'create', 'update', 'delete']),
      allow.group('YardOperator').to(['read', 'create', 'update']),
      allow.group('Inspector').to(['read']),
      allow.publicApiKey().to(['read']),
    ]),

  // ============================================
  // SALES TABLE (Marketplace Listings)
  // ============================================
  Sale: a
    .model({
      saleID: a.id().required(),
      boxID: a.id().required(),
      box: a.belongsTo('Box', 'boxID'),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id().required(),
      seller: a.belongsTo('User', 'sellerID'),
      
      // Sale details
      listingTitle: a.string().required(),
      listingDescription: a.string(),
      
      // Auction type and rules
      auctionType: a.enum(['sealed', 'open'),sealed'),
      
      // Pricing
      startingPrice: a.float(),
      reservePrice: a.float(),
      currentBid: a.float(),
      bidCurrency: a.string().default('CAD'),
      minBidIncrement: a.float(), // For open auctions
      
      // Timing
      startTime: a.datetime(),
      endTime: a.datetime(),
      bidDueAt: a.datetime().required(),
      
      // Auction controls
      autoClose: a.boolean().default(true),
      manualClose: a.boolean().default(false),
      acceptManualOverride: a.boolean().default(false), // Allow SellerAdmin to accept bid before deadline
      antiSnipingEnabled: a.boolean().default(false), // Extend deadline if last-minute bid
      antiSnipingMinutes: a.integer().default(5),
      
      // Status
      status: a.enum(['draft', 'active', 'closed', 'sold', 'cancelled'),draft'),
      
      // Winner tracking
      winningBidID: a.id(),
      winningBuyerID: a.id(),
      
      // Terms and conditions
      termsText: a.string().required(),
      requireTermsAcceptance: a.boolean().default(true),
      
      // Audit trail
      bidAuditTrail: a.json(), // Track bid history
      
      bids: a.hasMany('Bid', 'saleID'),
      termsAcceptances: a.hasMany('TermsAcceptance', 'saleID'),
      
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      createdBy: a.id(),
      closedAt: a.datetime(),
      closedBy: a.id(),
    })
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read', 'create', 'update', 'delete']),
      allow.group('YardOperator').to(['read']),
      allow.group('Buyer').to(['read']),
      allow.publicApiKey().to(['read']),
    ]),

  // ============================================
  // BIDS TABLE
  // ============================================
  Bid: a
    .model({
      bidID: a.id().required(),
      saleID: a.id().required(),
      sale: a.belongsTo('Sale', 'saleID'),
      buyerID: a.id().required(),
      buyer: a.belongsTo('User', 'buyerID'),
      
      bidAmount: a.float().required(),
      bidCurrency: a.string().default('CAD'),
      
      bidStatus: a.enum(['pending', 'accepted', 'rejected', 'outbid'),pending'),
      
      bidType: a.enum(['initial', 'counter', 'auto_increment'),initial'),
      
      notes: a.string(),
      
      submittedAt: a.datetime().required(),
      respondedAt: a.datetime(),
      
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read', 'update']),
      allow.owner().to(['read', 'create']),
      allow.group('Buyer').to(['read', 'create']),
    ]),

  // ============================================
  // TERMS ACCEPTANCE TABLE
  // ============================================
  TermsAcceptance: a
    .model({
      acceptanceID: a.id().required(),
      saleID: a.id().required(),
      sale: a.belongsTo('Sale', 'saleID'),
      buyerID: a.id().required(),
      buyer: a.belongsTo('User', 'buyerID'),
      
      acceptedAt: a.datetime().required(),
      ipAddress: a.string(),
      userAgent: a.string(),
      
      termsVersion: a.string(), // Track which version of terms was accepted
      
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read']),
      allow.owner().to(['read', 'create']),
    ]),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
