# ═══════════════════════════════════════════════════════════════
# SMASH SCRAP - Box Creation Business Rules & Validation
# ═══════════════════════════════════════════════════════════════

## 📦 BOX CREATION RULES

### **1. REQUIRED FIELDS**
✅ **Box Number** (string, unique per org)
  - Format: alphanumeric, dashes, underscores allowed
  - Min length: 3 characters
  - Max length: 50 characters
  - Examples: "BOX-001", "WH-A-123", "CAT_2024_001"
  - Must be unique within organization

✅ **Organization ID** (string, auto-assigned)
  - Automatically set from logged-in user's orgID
  - Cannot be changed by non-SuperAdmin

✅ **Status** (enum, default: "draft")
  - Valid values: draft, inprogress, finalized, listed, sold
  - Default: "draft"

✅ **Created By** (string, auto-assigned)
  - User ID (Cognito sub) of creator
  - Automatically set from logged-in user

### **2. OPTIONAL FIELDS**
⚪ **Material Type** (string, default: "Mixed")
  - Valid values: Mixed, Ceramic, Foil, Bead
  - Default: "Mixed"

⚪ **Location** (string)
  - Free text field for warehouse/storage location
  - Examples: "Warehouse A", "Yard 3", "Building B - Bay 5"
  - Max length: 100 characters

⚪ **Tare Weight** (number, default: 0)
  - Weight of empty container in pounds
  - Min: 0
  - Max: 10,000
  - Decimal places: 2

⚪ **Gross Weight** (number, default: 0)
  - Total weight including container in pounds
  - Min: 0
  - Max: 10,000
  - Decimal places: 2

⚪ **Net Weight** (number, calculated)
  - Auto-calculated: Gross Weight - Tare Weight
  - Cannot be manually set
  - Must be >= 0

### **3. VALIDATION RULES**

#### **Box Number Validation**
function validateBoxNumber(boxNumber, orgID) {
// Check required
if (!boxNumber || boxNumber.trim().length === 0) {
return { valid: false, error: "Box number is required" };
}

// Check length
if (boxNumber.length < 3) {
return { valid: false, error: "Box number must be at least 3 characters" };
}

if (boxNumber.length > 50) {
return { valid: false, error: "Box number cannot exceed 50 characters" };
}

// Check format (alphanumeric, dash, underscore only)
const validFormat = /^[a-zA-Z0-9_-]+$/;
if (!validFormat.test(boxNumber)) {
return { valid: false, error: "Box number can only contain letters, numbers, dashes, and underscores" };
}

// Check uniqueness (query DB)
const exists = await checkBoxNumberExists(boxNumber, orgID);
if (exists) {
return { valid: false, error: "Box number already exists in your organization" };
}

return { valid: true };
}

text

#### **Weight Validation**
function validateWeights(tareWeight, grossWeight) {
// Check tare weight
if (tareWeight < 0) {
return { valid: false, error: "Tare weight cannot be negative" };
}

if (tareWeight > 10000) {
return { valid: false, error: "Tare weight cannot exceed 10,000 lbs" };
}

// Check gross weight
if (grossWeight < 0) {
return { valid: false, error: "Gross weight cannot be negative" };
}

if (grossWeight > 10000) {
return { valid: false, error: "Gross weight cannot exceed 10,000 lbs" };
}

// Check net weight
const netWeight = grossWeight - tareWeight;
if (netWeight < 0) {
return { valid: false, error: "Gross weight must be greater than or equal to tare weight" };
}

return { valid: true, netWeight };
}

text

### **4. CREATION WORKFLOW**

USER CLICKS "CREATE BOX"
└─> Modal opens with form

USER FILLS FORM
├─> Box Number (required)
├─> Material Type (optional, default: Mixed)
├─> Location (optional)
├─> Tare Weight (optional, default: 0)
└─> Gross Weight (optional, default: 0)

USER CLICKS "CREATE BOX" BUTTON
└─> Validation runs

VALIDATION
├─> Check box number (required, format, unique)
├─> Check weights (non-negative, logical)
└─> Check orgID (must exist)

IF VALIDATION FAILS
├─> Show error message
└─> Keep modal open

IF VALIDATION PASSES
├─> Calculate net weight
├─> Create box record in DynamoDB
├─> Close modal
├─> Show success message
├─> Refresh box list
└─> Navigate to box detail page

text

### **5. PERMISSIONS**

**Who can create boxes?**
✅ SuperAdmin (all orgs)
✅ SellerAdmin (own org only)
✅ YardOperator (own org only)
❌ Buyer (read-only)
❌ Inspector (read-only)

### **6. DATABASE RECORD**

{
boxID: "uuid-generated-by-dynamodb",
orgID: "user-org-123",
boxNumber: "BOX-001",
materialType: "Ceramic",
location: "Warehouse A",
status: "draft",
createdBy: "user-cognito-sub",
tareWeight: 25.5,
grossWeight: 125.75,
netWeight: 100.25,
images: [],
createdAt: "2024-11-10T21:00:00.000Z",
updatedAt: "2024-11-10T21:00:00.000Z"
}

text

### **7. ERROR HANDLING**

**Common Errors:**
- ❌ "Box number is required"
- ❌ "Box number already exists"
- ❌ "Box number must be at least 3 characters"
- ❌ "Invalid characters in box number"
- ❌ "Gross weight must be greater than tare weight"
- ❌ "Organization ID not set"
- ❌ "You do not have permission to create boxes"

### **8. SUCCESS CRITERIA**

✅ Box appears in list immediately after creation
✅ User navigates to box detail page
✅ Box has correct status ("draft")
✅ Net weight calculated correctly
✅ CreatedBy field set to current user
✅ OrgID matches user's organization
✅ No duplicate box numbers in org

### **9. FRONTEND IMPLEMENTATION**

async function createBox() {
// 1. Validate required fields
if (!form.boxNumber.trim()) {
alert("Box number is required");
return;
}

if (!orgID) {
alert("Organization ID not set. Please contact support.");
return;
}

// 2. Validate box number format
const boxNumberRegex = /^[a-zA-Z0-9_-]{3,50}$/;
if (!boxNumberRegex.test(form.boxNumber)) {
alert("Box number must be 3-50 characters (letters, numbers, dash, underscore only)");
return;
}

// 3. Validate weights
if (form.tareWeight < 0 || form.grossWeight < 0) {
alert("Weights cannot be negative");
return;
}

const netWeight = form.grossWeight - form.tareWeight;
if (netWeight < 0) {
alert("Gross weight must be greater than or equal to tare weight");
return;
}

// 4. Check uniqueness (query existing boxes)
const { data: existingBoxes } = await client.models.Box.list({
filter: {
orgID: { eq: orgID },
boxNumber: { eq: form.boxNumber.trim() }
}
});

if (existingBoxes && existingBoxes.length > 0) {
alert("Box number already exists in your organization");
return;
}

// 5. Create box
setCreating(true);
try {
const result = await client.models.Box.create({
orgID,
boxNumber: form.boxNumber.trim(),
materialType: form.materialType,
location: form.location.trim(),
status: "draft",
createdBy: userId || "",
tareWeight: form.tareWeight,
grossWeight: form.grossWeight,
netWeight,
});

text
// 6. Handle success
if (result.data) {
  setShowCreate(false);
  await loadBoxes();
  nav(`/boxes/${result.data.boxID}`);
}
} catch (e) {
alert(Error creating box: ${e.message});
} finally {
setCreating(false);
}
}

text

### **10. BACKEND VALIDATION (AWS AppSync)**

GraphQL mutation with validation
type Mutation {
createBox(input: CreateBoxInput!): Box
@auth(rules: [
{ allow: groups, groups: ["SuperAdmin", "SellerAdmin", "YardOperator"] }
])
}

input CreateBoxInput {
orgID: ID!
boxNumber: String! @validate(minLength: 3, maxLength: 50, pattern: "^[a-zA-Z0-9_-]+$")
materialType: MaterialType
location: String @validate(maxLength: 100)
status: BoxStatus!
createdBy: ID!
tareWeight: Float @validate(min: 0, max: 10000)
grossWeight: Float @validate(min: 0, max: 10000)
netWeight: Float!
}

text

---

## ✅ CHECKLIST FOR CREATING A BOX

- [ ] User is logged in
- [ ] User has permission (SuperAdmin, SellerAdmin, or YardOperator)
- [ ] Organization ID is set
- [ ] Box number is provided
- [ ] Box number is unique in organization
- [ ] Box number follows format rules
- [ ] Weights are non-negative
- [ ] Gross weight >= Tare weight
- [ ] Net weight calculated correctly
- [ ] Box appears in list after creation
- [ ] User navigates to detail page
- [ ] CreatedBy set to current user

---

**End of Business Rules Document**
