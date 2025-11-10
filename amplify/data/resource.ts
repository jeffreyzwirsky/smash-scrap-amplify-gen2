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
      orgID: a.id(),
      orgName: a.string(),
      address: a.string(),
      city: a.string(),
      province: a.string(),
      postalCode: a.string(),
      country: a.string(),
      contactEmail: a.email(),
      contactPhone: a.phone(),
      region: a.string(),
      status: a.enum(['active', 'inactive', 'suspended']),
      settings: a.json(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
          users: a.hasMany('User', 'orgID'),
          boxes: a.hasMany('Box', 'orgID'),
          parts: a.hasMany('Part', 'orgID'),
          sales: a.hasMany('Sale', 'orgID'),
          bids: a.hasMany('Bid', 'orgID'),
          termsAcceptances: a.hasMany('TermsAcceptance', 'orgID'),
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
      userID: a.id(),
      cognitoID: a.string(),
      email: a.email(),
      displayName: a.string(),
      firstName: a.string(),
      lastName: a.string(),
      phone: a.phone(),
      role: a.enum(['SuperAdmin', 'SellerAdmin', 'YardOperator', 'Buyer', 'Inspector']),
      orgID: a.id(),
      organization: a.belongsTo('Organization', 'orgID'),
      status: a.enum(['active', 'inactive', 'suspended']),
      permissions: a.json(),
      lastLoginAt: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
            soldBoxes: a.hasMany('Box', 'sellerID'),
            soldParts: a.hasMany('Part', 'sellerID'),
            createdSales: a.hasMany('Sale', 'sellerID'),
            placedBids: a.hasMany('Bid', 'buyerID'),
            acceptedTerms: a.hasMany('TermsAcceptance', 'buyerID'),
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
      boxID: a.id(),
      orgID: a.id(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id(),
      seller: a.belongsTo('User', 'sellerID'),
      boxNumber: a.string(),
      status: a.enum(['draft', 'in_progress', 'finalized', 'listed', 'sold']),
      location: a.string(),
      materialType: a.enum(['aluminum', 'copper', 'brass', 'stainless', 'steel', 'mixed']),
      
      // Dimensions
      length: a.float(),
      width: a.float(),
      height: a.float(),
      dimensionUnit: a.enum(['inches', 'cm']),
      
      // Weights (lb is authoritative, kg is derived)
      grossWeightLb: a.float(),
      tareWeightLb: a.float(),
      netWeightLb: a.float(),
      grossWeightKg: a.float(),
      tareWeightKg: a.float(),
      netWeightKg: a.float(),
      
      // Finalization tracking
      isFinalized: a.boolean(),
      finalizedAt: a.datetime(),
      finalizedBy: a.id(),
      finalizeRecord: a.json(), // Stores finalization audit data
      
      // Images (up to 10)
      images: a.string().array(), // Array of S3 keys
      imagesCount: a.integer(),
      
      // Part tracking
      partsCount: a.integer(),
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
      partID: a.id(),
      boxID: a.id(),
      box: a.belongsTo('Box', 'boxID'),
      orgID: a.id(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id(),
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
      imagesCount: a.integer(),
      
      // Status
      status: a.enum(['draft', 'active', 'removed']),
      
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
      saleID: a.id(),
      boxID: a.id(),
      box: a.belongsTo('Box', 'boxID'),
      orgID: a.id(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id(),
      seller: a.belongsTo('User', 'sellerID'),
      
      // Sale details
      listingTitle: a.string(),
      listingDescription: a.string(),
      
      // Auction type and rules
      auctionType: a.enum(['sealed', 'open']),
      
      // Pricing
      startingPrice: a.float(),
      reservePrice: a.float(),
      currentBid: a.float(),
      bidCurrency: a.string(),
      minBidIncrement: a.float(), // For open auctions
      
      // Timing
      startTime: a.datetime(),
      endTime: a.datetime(),
      bidDueAt: a.datetime(),
      
      // Auction controls
      autoClose: a.boolean(),
      manualClose: a.boolean(),
      acceptManualOverride: a.boolean(), // Allow SellerAdmin to accept bid before deadline
      antiSnipingEnabled: a.boolean(), // Extend deadline if last-minute bid
      antiSnipingMinutes: a.integer(),
      
      // Status
      status: a.enum(['draft', 'active', 'closed', 'sold', 'cancelled']),
      
      // Winner tracking
      winningBidID: a.id(),
      winningBuyerID: a.id(),
      
      // Terms and conditions
      termsText: a.string(),
      requireTermsAcceptance: a.boolean(),
      
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
      bidID: a.id(),
      saleID: a.id(),
      sale: a.belongsTo('Sale', 'saleID'),
      buyerID: a.id(),
      buyer: a.belongsTo('User', 'buyerID'),
          orgID: a.id(),
          organization: a.belongsTo('Organization', 'orgID'),
      
      bidAmount: a.float(),
      bidCurrency: a.string(),
      
      bidStatus: a.enum(['pending', 'accepted', 'rejected', 'outbid']),
      
      bidType: a.enum(['initial', 'counter', 'auto_increment']),
      
      notes: a.string(),
      
      submittedAt: a.datetime(),
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
      acceptanceID: a.id(),
      saleID: a.id(),
      sale: a.belongsTo('Sale', 'saleID'),
      buyerID: a.id(),
      buyer: a.belongsTo('User', 'buyerID'),
          orgID: a.id(),
          organization: a.belongsTo('Organization', 'orgID'),
      
      acceptedAt: a.datetime(),
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
          
