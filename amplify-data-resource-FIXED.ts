import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Organization: a
    .model({
      orgID: a.id(),
      orgName: a.string().required(),
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
      orgModules: a.hasMany('OrganizationModule', 'orgID'),
    })
    .identifier(['orgID'])
    .authorization((allow) => [
      allow.authenticated(),
      allow.group('SuperAdmin'),
    ]),

  User: a
    .model({
      userID: a.id(),
      cognitoID: a.string(),
      email: a.email().required(),
      displayName: a.string(),
      firstName: a.string(),
      lastName: a.string(),
      phone: a.phone(),
      role: a.enum(['SuperAdmin', 'SellerAdmin', 'YardOperator', 'Buyer', 'Inspector']),
      orgID: a.id(),
      organization: a.belongsTo('Organization', 'orgID'),
      status: a.enum(['active', 'inactive', 'suspended']),
      permissions: a.json(),
      themePreference: a.enum(['dark', 'light', 'system']),
      lastLoginAt: a.datetime(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      soldBoxes: a.hasMany('Box', 'sellerID'),
      soldParts: a.hasMany('Part', 'sellerID'),
      createdSales: a.hasMany('Sale', 'sellerID'),
      placedBids: a.hasMany('Bid', 'buyerID'),
      acceptedTerms: a.hasMany('TermsAcceptance', 'buyerID'),
      userModules: a.hasMany('UserModule', 'userID'),
    })
    .identifier(['userID'])
    .authorization((allow) => [
      allow.owner(),
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read', 'update']),
    ]),

  // ═══════════════════════════════════════════════════════════
  // FIXED BOX MODEL
  // ═══════════════════════════════════════════════════════════
  Box: a
    .model({
      boxID: a.id(),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id(),
      seller: a.belongsTo('User', 'sellerID'),
      boxNumber: a.string().required(),
      status: a.enum(['draft', 'in_progress', 'finalized', 'listed', 'sold']).default('draft'),
      location: a.string(),
      materialType: a.enum(['Mixed', 'Ceramic', 'Foil', 'Bead', 'aluminum', 'copper', 'brass', 'stainless', 'steel', 'mixed']),
      
      // Dimensions
      length: a.float(),
      width: a.float(),
      height: a.float(),
      dimensionUnit: a.enum(['inches', 'cm']),
      
      // Weights (new format with units)
      grossWeightLb: a.float().default(0),
      tareWeightLb: a.float().default(0),
      netWeightLb: a.float().default(0),
      grossWeightKg: a.float().default(0),
      tareWeightKg: a.float().default(0),
      netWeightKg: a.float().default(0),
      
      // Legacy weight fields (for frontend compatibility)
      grossWeight: a.float(),
      tareWeight: a.float(),
      netWeight: a.float(),
      
      // Finalization
      isFinalized: a.boolean().default(false),
      finalizedAt: a.datetime(),
      finalizedBy: a.id(),
      finalizeRecord: a.json(),
      
      // Images & Parts
      images: a.string().array(),
      imagesCount: a.integer().default(0),
      partsCount: a.integer().default(0),
      parts: a.hasMany('Part', 'boxID'),
      sale: a.hasOne('Sale', 'boxID'),
      
      // Notes & Audit
      notes: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      createdBy: a.id().required(),
      updatedBy: a.id(),
    })
    .identifier(['boxID'])
    .authorization((allow) => [
      // SuperAdmin has full access
      allow.group('SuperAdmin'),
      
      // SellerAdmin can create/read/update/delete
      allow.group('SellerAdmin').to(['create', 'read', 'update', 'delete']),
      
      // YardOperator can create/read/update (no delete)
      allow.group('YardOperator').to(['create', 'read', 'update']),
      
      // Inspector can read only
      allow.group('Inspector').to(['read']),
      
      // Buyers can read (for marketplace)
      allow.group('Buyer').to(['read']),
      
      // All authenticated users can read
      allow.authenticated().to(['read']),
    ]),

  Part: a
    .model({
      partID: a.id(),
      boxID: a.id().required(),
      box: a.belongsTo('Box', 'boxID'),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id(),
      seller: a.belongsTo('User', 'sellerID'),
      partNumber: a.string(),
      partName: a.string(),
      partType: a.string(),
      category: a.enum(['Ceramic', 'Foil', 'Bead', 'DPF']),
      materialType: a.enum(['aluminum', 'copper', 'brass', 'stainless', 'steel', 'mixed']),
      weightLb: a.float().default(0),
      weightKg: a.float().default(0),
      fillLevel: a.enum(['empty', 'quarter', 'half', 'threequarter', 'full', 'partial']).default('half'),
      images: a.string().array(),
      imagesCount: a.integer().default(0),
      status: a.enum(['draft', 'active', 'removed']).default('active'),
      description: a.string(),
      notes: a.string(),
      VIN: a.string(),
      year: a.string(),
      make: a.string(),
      model: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      addedBy: a.id(),
    })
    .identifier(['partID'])
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['create', 'read', 'update', 'delete']),
      allow.group('YardOperator').to(['create', 'read', 'update']),
      allow.group('Inspector').to(['read']),
      allow.group('Buyer').to(['read']),
      allow.authenticated().to(['read']),
    ]),

  Sale: a
    .model({
      saleID: a.id(),
      boxID: a.id(),
      box: a.belongsTo('Box', 'boxID'),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      sellerID: a.id(),
      seller: a.belongsTo('User', 'sellerID'),
      listingTitle: a.string(),
      listingDescription: a.string(),
      auctionType: a.enum(['sealed', 'open']),
      startingPrice: a.float(),
      reservePrice: a.float(),
      currentBid: a.float(),
      bidCurrency: a.string(),
      minBidIncrement: a.float(),
      startTime: a.datetime(),
      endTime: a.datetime(),
      bidDueAt: a.datetime(),
      autoClose: a.boolean(),
      manualClose: a.boolean(),
      acceptManualOverride: a.boolean(),
      antiSnipingEnabled: a.boolean(),
      antiSnipingMinutes: a.integer(),
      status: a.enum(['draft', 'active', 'closed', 'sold', 'cancelled']),
      winningBidID: a.id(),
      winningBuyerID: a.id(),
      termsText: a.string(),
      requireTermsAcceptance: a.boolean(),
      bidAuditTrail: a.json(),
      bids: a.hasMany('Bid', 'saleID'),
      termsAcceptances: a.hasMany('TermsAcceptance', 'saleID'),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      createdBy: a.id(),
      closedAt: a.datetime(),
      closedBy: a.id(),
    })
    .identifier(['saleID'])
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['create', 'read', 'update', 'delete']),
      allow.group('YardOperator').to(['read']),
      allow.group('Buyer').to(['read']),
      allow.authenticated().to(['read']),
    ]),

  Bid: a
    .model({
      bidID: a.id(),
      saleID: a.id().required(),
      sale: a.belongsTo('Sale', 'saleID'),
      buyerID: a.id().required(),
      buyer: a.belongsTo('User', 'buyerID'),
      orgID: a.id().required(),
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
    .identifier(['bidID'])
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read', 'update']),
      allow.owner().to(['read', 'create']),
      allow.group('Buyer').to(['read', 'create']),
    ]),

  TermsAcceptance: a
    .model({
      acceptanceID: a.id().required(),
      saleID: a.id().required(),
      sale: a.belongsTo('Sale', 'saleID'),
      buyerID: a.id().required(),
      buyer: a.belongsTo('User', 'buyerID'),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      acceptedAt: a.datetime().required(),
      ipAddress: a.string(),
      userAgent: a.string(),
      termsVersion: a.string().required(),
      createdAt: a.datetime(),
    })
    .identifier(['acceptanceID'])
    .authorization((allow) => [
      allow.group('SuperAdmin'),
      allow.group('SellerAdmin').to(['read']),
      allow.owner().to(['read', 'create']),
    ]),

  UserModule: a
    .model({
      moduleID: a.id(),
      userID: a.id().required(),
      user: a.belongsTo('User', 'userID'),
      moduleName: a.enum([
        'boxes_management', 'parts_management', 'inventory_reporting', 'photo_upload',
        'sales_creation', 'bidding', 'sales_analytics', 'auction_notifications',
        'organization_management', 'user_management', 'settings_management',
        'quality_inspection', 'approval_system',
        'advanced_reporting', 'data_export', 'custom_notifications', 'api_access'
      ]),
      enabled: a.boolean(),
      enabledAt: a.datetime(),
      enabledBy: a.id(),
      disabledAt: a.datetime(),
      disabledBy: a.id(),
      notes: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .identifier(['moduleID'])
    .authorization((allow) => [
      allow.group('SuperAdmin'),
    ]),

  OrganizationModule: a
    .model({
      moduleID: a.id(),
      orgID: a.id().required(),
      organization: a.belongsTo('Organization', 'orgID'),
      moduleName: a.enum([
        'boxes_management', 'parts_management', 'inventory_reporting', 'photo_upload',
        'sales_creation', 'bidding', 'sales_analytics', 'auction_notifications',
        'organization_management', 'user_management', 'settings_management',
        'quality_inspection', 'approval_system',
        'advanced_reporting', 'data_export', 'custom_notifications', 'api_access'
      ]),
      enabled: a.boolean(),
      enabledAt: a.datetime(),
      enabledBy: a.id(),
      notes: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .identifier(['moduleID'])
    .authorization((allow) => [
      allow.group('SuperAdmin'),
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
