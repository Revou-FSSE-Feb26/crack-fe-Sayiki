# API Testing Guide

## Prerequisites

1. Start the development server:
```bash
npm run dev
```

Server should be running at `http://localhost:3000`

## Testing with cURL (PowerShell)

### 1. Seed the Database
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/seed" -Method POST -ContentType "application/json" | Select-Object -Expand Content | ConvertFrom-Json
```

### 2. Register a New User
```powershell
$body = @{
    email = "newuser@example.com"
    password = "NewUser123!"
    name = "New User"
    role = "user"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json" | Select-Object -Expand Content | ConvertFrom-Json
```

### 3. Login
```powershell
$body = @{
    email = "admin@switchlab.com"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$loginData = $response.Content | ConvertFrom-Json
$token = $loginData.data.token
Write-Output "Token: $token"
```

### 4. Get Current User (with token)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/me" -Method GET -Headers $headers | Select-Object -Expand Content | ConvertFrom-Json
```

### 5. Get All Products
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET | Select-Object -Expand Content | ConvertFrom-Json
```

### 6. Create a Product (requires admin/modder token)
```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Test Switch"
    description = "Test description for new switch product"
    price = 50000
    category = "Switches"
    stock = 100
    images = @("https://example.com/test-switch.jpg")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Headers $headers -Body $body | Select-Object -Expand Content | ConvertFrom-Json
```

### 7. Get All Services
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/services" -Method GET | Select-Object -Expand Content | ConvertFrom-Json
```

### 8. Get All Modders
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/modders" -Method GET | Select-Object -Expand Content | ConvertFrom-Json
```

## Testing with Postman/Thunder Client

### Collection of Requests

#### 1. Seed Database
```
POST http://localhost:3000/api/seed
```

#### 2. Register User
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User",
  "role": "user"
}
```

#### 3. Login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@switchlab.com",
  "password": "Admin123!"
}
```

**Save the token from the response!**

#### 4. Get Current User
```
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 5. Get All Products
```
GET http://localhost:3000/api/products
```

#### 6. Get Product by ID
```
GET http://localhost:3000/api/products/PRODUCT_ID
```

#### 7. Create Product (Admin/Modder)
```
POST http://localhost:3000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Gateron Cap Yellow",
  "description": "Linear switches with gold-plated spring",
  "price": 48000,
  "category": "Switches",
  "stock": 75,
  "variations": [
    { "name": "70 switches", "price": 48000, "stock": 75 },
    { "name": "90 switches", "price": 58000, "stock": 50 }
  ],
  "images": ["https://example.com/cap-yellow.jpg"]
}
```

#### 8. Update Product
```
PUT http://localhost:3000/api/products/PRODUCT_ID
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "price": 45000,
  "stock": 100
}
```

#### 9. Delete Product (Admin only)
```
DELETE http://localhost:3000/api/products/PRODUCT_ID
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
```

#### 10. Get All Services
```
GET http://localhost:3000/api/services
```

#### 11. Create Service (Modder/Admin)
```
POST http://localhost:3000/api/services
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Custom Cable Sleeving",
  "description": "Premium cable sleeving service with Paracord",
  "basePrice": 150000,
  "category": "Custom",
  "modderId": "YOUR_MODDER_ID",
  "turnaroundTime": "5-7 days",
  "options": [
    { "name": "Detachable Connector", "price": 50000 }
  ],
  "images": ["https://example.com/cable.jpg"]
}
```

#### 12. Get All Modders
```
GET http://localhost:3000/api/modders
```

#### 13. Create Modder Profile (Modder role required)
```
POST http://localhost:3000/api/modders
Authorization: Bearer YOUR_MODDER_TOKEN_HERE
Content-Type: application/json

{
  "displayName": "KeyboardWizard",
  "bio": "Passionate keyboard modder specializing in wireless builds",
  "location": "Surabaya",
  "specialties": ["Wireless Conversion", "Foam Modding"],
  "equipment": ["Soldering Station", "3D Printer"],
  "status": "accepting",
  "portfolio": ["https://example.com/build1.jpg"]
}
```

## Expected Test Results

### ✅ Success Scenarios

1. **Seed Database**: Returns test account credentials
2. **Register**: Returns user object and JWT token
3. **Login**: Returns user object and JWT token
4. **Get Products**: Returns array of products (empty if not seeded)
5. **Create Product** (with modder/admin token): Returns created product with 201 status
6. **Get Modders**: Returns array of modder profiles

### ❌ Error Scenarios to Test

1. **Register with existing email**: Should return 409 Conflict
2. **Login with wrong password**: Should return 401 Unauthorized
3. **Access /api/auth/me without token**: Should return 401 Unauthorized
4. **Create product without token**: Should return 401 Unauthorized
5. **Create product with user role**: Should return 403 Forbidden
6. **Invalid email format**: Should return 400 Bad Request with validation errors
7. **Weak password**: Should return 400 Bad Request

## Quick Test Sequence

1. Start server: `npm run dev`
2. Seed database: `POST /api/seed`
3. Login as admin: `POST /api/auth/login` (use admin credentials from seed response)
4. Get all products: `GET /api/products` (should return 3 products)
5. Get all services: `GET /api/services` (should return 3 services)
6. Get all modders: `GET /api/modders` (should return 2 modders)
7. Create a new product with admin token: `POST /api/products`
8. Verify new product appears: `GET /api/products`

## Notes

- All test accounts have passwords following the pattern: `[Role]123!` (e.g., `Admin123!`, `Modder123!`)
- JWT tokens expire after 7 days
- Database resets when server restarts (in-memory storage)
- Use seed endpoint to quickly populate test data
