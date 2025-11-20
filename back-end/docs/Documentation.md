# ImageHub API Documentation

## Table of Contents

1. [General Description](#general-description)
2. [API Information](#api-information)
3. [Authentication](#authentication)
4. [User Management](#user-management)
5. [Image Management](#image-management)
6. [HTTP Status Codes](#http-status-codes)
7. [Model Structures](#model-structures)
8. [Complete Usage Example](#complete-usage-example)

---

## General Description

ImageHub is a comprehensive REST API that allows users to manage their profiles and perform advanced image operations. The API features JWT-based authentication, role-based access control (ADMIN and USER roles), and uses the Strategy Pattern for modular image transformations. It integrates SendGrid for email notifications and Spring Security for robust authentication and authorization.

---

## API Information

**Base URL:** `http://localhost:8080/api`

**Authentication:** JWT Bearer Token

**Content-Type:** `application/json` (except in upload)

**CORS:** Configured for specific origins

**Roles:** ADMIN, USER

---

## Authentication

### JWT Configuration

All endpoints (except public ones) require a valid JWT token in the header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Token Properties:**
- Expiration time: Configurable in `application.properties`
- Algorithm: HS256
- Secret key: Stored in environment variables

**Public Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- Swagger/OpenAPI documentation

---

## Authentication Endpoints

### 1. Register User

**Description:** Create a new user account in the system.

**Method:** `POST`

**URL:** `/api/auth/register`

**Authentication:** Not Required

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| id | UUID | No | User ID (generated if not provided) |
| firstName | String | Yes | First name (cannot be blank) |
| lastName | String | Yes | Last name (cannot be blank) |
| email | String | Yes | Email address (must be unique) |
| password | String | Yes | Password (will be encrypted) |
| phoneNumber | String | Yes | Phone number |
| direction | String | Yes | Address |
| role | String | No | USER or ADMIN (defaults to USER) |

**Example Request (cURL):**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@gmail.com",
    "password": "SecurePassword123!",
    "phoneNumber": "+573103212753",
    "direction": "Calle 123 #45-67",
    "role": "USER"
  }'
```

**Example Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "john.doe@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "message": "User registered successfully"
}
```

**Possible Errors:**
- `400 Bad Request` - Email already registered or invalid data
- `500 Internal Server Error` - Server error during registration

---

### 2. Login User

**Description:** Authenticate user and obtain JWT token.

**Method:** `POST`

**URL:** `/api/auth/login`

**Authentication:** Not Required

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| email | String | Yes | User email address |
| password | String | Yes | User password |

**Example Request (cURL):**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@gmail.com",
    "password": "SecurePassword123!"
  }'
```

**Example Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "john.doe@gmail.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "message": "Login successful"
}
```

**Possible Errors:**
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

---

## User Management Endpoints

### 1. Get All Users

**Description:** Retrieve all users in the system. Only for ADMIN users.

**Method:** `GET`

**URL:** `/api/users`

**Authentication:** Required

**Authorization:** ADMIN role only

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Example Success Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@gmail.com",
    "phoneNumber": "+573103212753",
    "direction": "Calle 123 #45-67",
    "role": "USER",
    "registrationDate": "2025-11-20T15:22:40",
    "active": true
  }
]
```

**Possible Errors:**
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - User is not an admin

---

### 2. Get User by ID

**Description:** Retrieve a specific user by their unique ID.

**Method:** `GET`

**URL:** `/api/users/{id}`

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| id | UUID | Yes | Unique user ID |

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X GET http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Example Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "phoneNumber": "+573103212753",
  "direction": "Calle 123 #45-67",
  "role": "USER",
  "registrationDate": "2025-11-20T15:22:40",
  "active": true
}
```

**Possible Errors:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - User not found

---

### 3. Get Current User Profile

**Description:** Retrieve the profile of the authenticated user.

**Method:** `GET`

**URL:** `/api/users/me`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Example Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "phoneNumber": "+573103212753",
  "direction": "Calle 123 #45-67",
  "role": "USER",
  "registrationDate": "2025-11-20T15:22:40",
  "active": true
}
```

**Possible Errors:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - User not found

---

### 4. Get Active Users

**Description:** Retrieve all active users. Only for ADMIN users.

**Method:** `GET`

**URL:** `/api/users/active`

**Authentication:** Required

**Authorization:** ADMIN role only

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X GET http://localhost:8080/api/users/active \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Possible Errors:**
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - User is not an admin

---

### 5. Get Users by Role

**Description:** Retrieve all users with a specific role. Only for ADMIN users.

**Method:** `GET`

**URL:** `/api/users/role/{role}`

**Authentication:** Required

**Authorization:** ADMIN role only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| role | String | Yes | USER or ADMIN |

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X GET http://localhost:8080/api/users/role/ADMIN \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Possible Errors:**
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - User is not an admin

---

### 6. Update User

**Description:** Update user information. Users can update their own data, admins can update any user.

**Method:** `PUT`

**URL:** `/api/users/{id}`

**Authentication:** Required

**Authorization:** User can update own profile or must be ADMIN

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| id | UUID | Yes | Unique user ID |

**Headers:**
```
Authorization: Bearer [token]
Content-Type: application/json
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| firstName | String | No | First name |
| lastName | String | No | Last name |
| email | String | No | Email (must be unique) |
| password | String | No | New password (will be encrypted) |
| phoneNumber | String | No | Phone number |
| direction | String | No | Address |
| role | String | No | USER or ADMIN (only ADMIN can change) |
| active | Boolean | No | Account status (only ADMIN can change) |

**Example Request (cURL):**
```bash
curl -X PUT http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "phoneNumber": "+573109876543"
  }'
```

**Example Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "phoneNumber": "+573109876543",
  "direction": "Calle 123 #45-67",
  "role": "USER",
  "registrationDate": "2025-11-20T15:22:40",
  "active": true
}
```

**Possible Errors:**
- `400 Bad Request` - Email already in use
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Not authorized to update this user
- `404 Not Found` - User not found

---

### 7. Delete User

**Description:** Permanently delete a user from the system. Only for ADMIN users.

**Method:** `DELETE`

**URL:** `/api/users/{id}`

**Authentication:** Required

**Authorization:** ADMIN role only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| id | UUID | Yes | Unique user ID |

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X DELETE http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Example Success Response (204 No Content)**

**Possible Errors:**
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - User is not an admin
- `404 Not Found` - User not found

---

### 8. Deactivate User

**Description:** Soft delete - deactivate a user without removing from database. Only for ADMIN users.

**Method:** `PATCH`

**URL:** `/api/users/{id}/deactivate`

**Authentication:** Required

**Authorization:** ADMIN role only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| id | UUID | Yes | Unique user ID |

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X PATCH http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000/deactivate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Example Success Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@gmail.com",
  "phoneNumber": "+573103212753",
  "direction": "Calle 123 #45-67",
  "role": "USER",
  "registrationDate": "2025-11-20T15:22:40",
  "active": false
}
```

---

### 9. Activate User

**Description:** Reactivate a deactivated user. Only for ADMIN users.

**Method:** `PATCH`

**URL:** `/api/users/{id}/activate`

**Authentication:** Required

**Authorization:** ADMIN role only

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X PATCH http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000/activate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

---

## Image Management Endpoints

### 1. Upload Image

**Description:** Upload a new image to the system.

**Method:** `POST`

**URL:** `/api/v1/images/upload`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer [token]
Content-Type: multipart/form-data
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| file | File | Yes | Image file (max 10MB) |

**Supported Formats:** .png, .jpg, .jpeg, .gif, .bmp

**Example Request (cURL):**
```bash
curl -X POST http://localhost:8080/api/v1/images/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -F "file=@path/to/image.png"
```

**Example Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "john.doe@gmail.com",
    "imageName": "my_image.png"
  }
}
```

**Possible Errors:**
- `400 Bad Request` - Invalid file or unsupported format
- `401 Unauthorized` - Invalid or expired token
- `500 Internal Server Error` - Server error

---

### 2. Download Image

**Description:** Download an original or transformed image.

**Method:** `GET`

**URL:** `/api/v1/images/{imageId}/download`

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| imageId | UUID | Yes | Unique image ID |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|------------|
| type | String | No | input | "input" for original or "transform" for transformed |

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
# Download original image
curl -X GET "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/download?type=input" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -o image.png

# Download transformed image
curl -X GET "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/download?type=transform" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -o image_transformed.png
```

**Response:** Binary image file

**Possible Errors:**
- `400 Bad Request` - Invalid type parameter
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Image not found

---

### 3. Transform Image

**Description:** Apply transformations to an image using various strategies.

**Method:** `POST`

**URL:** `/api/v1/images/{imageId}/transform`

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| imageId | UUID | Yes | Unique image ID |

**Headers:**
```
Authorization: Bearer [token]
Content-Type: application/json
```

**Transformation Types:**

#### Resize
```json
{
  "resize": {
    "width": 200,
    "height": 200
  }
}
```

#### Crop
```json
{
  "crop": {
    "x": 50,
    "y": 50,
    "width": 300,
    "height": 300
  }
}
```

#### Rotate
```json
{
  "rotate": 45
}
```

#### Filter - Grayscale
```json
{
  "filters": {
    "grayscale": true
  }
}
```

#### Filter - Sepia
```json
{
  "filters": {
    "sepia": true
  }
}
```

#### Format Conversion
```json
{
  "format": "jpg"
}
```

**Supported Formats:** jpg, jpeg, png, gif, bmp, webp

**Example Request (cURL) - Resize:**
```bash
curl -X POST "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/transform" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "resize": {
      "width": 100,
      "height": 100
    }
  }'
```

**Example Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Transformation completed successfully",
  "data": "D:\\Tech\\images\\input\\user@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\image_transform.png"
}
```

**Possible Errors:**
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Image not found
- `500 Internal Server Error` - Transformation error

---

### 4. Get User Images

**Description:** Retrieve all images for the authenticated user with pagination.

**Method:** `GET`

**URL:** `/api/v1/images/user/all`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|------------|
| page | Integer | No | 0 | Page number (starts at 0) |
| size | Integer | No | 10 | Results per page |

**Headers:**
```
Authorization: Bearer [token]
```

**Example Request (cURL):**
```bash
curl -X GET "http://localhost:8080/api/v1/images/user/all?page=0&size=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Example Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Images retrieved successfully",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "userName": "john.doe@gmail.com",
        "imageName": "my_image.png",
        "inputPath": "D:\\Tech\\images\\input\\john.doe@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\my_image.png",
        "transformPath": "D:\\Tech\\images\\input\\john.doe@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\my_image_transform.png",
        "registrationDate": "2025-11-20T15:22:40",
        "dateOfUpdate": "2025-11-20T15:22:43",
        "hasTransformation": true
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Possible Errors:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - User has no images

---

## HTTP Status Codes

| Code | Description |
|------|------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid request or parameters |
| 401 | Unauthorized - Invalid or expired JWT token |
| 403 | Forbidden - User lacks required permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Model Structures

### User Model
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "email": "string (unique)",
  "phoneNumber": "string",
  "direction": "string",
  "role": "USER or ADMIN",
  "registrationDate": "2025-11-20T15:22:40",
  "active": "boolean",
  "createdBy": "string",
  "creationDate": "2025-11-20T15:22:40",
  "lastModifiedBy": "string",
  "lastModifiedDate": "2025-11-20T15:22:43"
}
```

### ImageMetadata Model
```json
{
  "id": "uuid",
  "userName": "string",
  "imageName": "string",
  "inputPath": "string",
  "transformPath": "string or null",
  "description": "string or null",
  "registrationDate": "2025-11-20T15:22:40",
  "dateOfUpdate": "2025-11-20T15:22:43",
  "hasTransformation": "boolean"
}
```

### AuthResponse Model
```json
{
  "token": "jwt-token-string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "USER or ADMIN",
  "message": "string"
}
```

### TransformRequestDto Model
```json
{
  "resize": {
    "width": "number",
    "height": "number"
  },
  "crop": {
    "x": "number",
    "y": "number",
    "width": "number",
    "height": "number"
  },
  "filters": {
    "grayscale": "boolean",
    "sepia": "boolean"
  },
  "format": "string",
  "rotate": "number"
}
```

---

## Typical Usage Flow

### User Registration and Authentication

1. **Register new user:**
   ```
   POST /api/auth/register
   ```

2. **Login:**
   ```
   POST /api/auth/login
   ```

3. **Get current user profile:**
   ```
   GET /api/users/me
   ```

### Image Management

1. **Upload image:**
   ```
   POST /api/v1/images/upload
   ```

2. **Get user images:**
   ```
   GET /api/v1/images/user/all
   ```

3. **Apply transformation:**
   ```
   POST /api/v1/images/{imageId}/transform
   ```

4. **Download transformed image:**
   ```
   GET /api/v1/images/{imageId}/download?type=transform
   ```

---

## Security Features

- JWT token-based authentication with configurable expiration
- Role-based access control (RBAC) for ADMIN and USER roles
- Password encryption using BCrypt
- Email validation and uniqueness checking
- Soft delete capability for user accounts
- Audit trail tracking (created by, creation date, last modified by, last modified date)
- CORS configuration for specific origins
- Method-level security using @PreAuthorize annotations
- Email notifications via SendGrid for user registration

---

## Important Notes

- All authenticated endpoints require a valid JWT bearer token
- Users can only access their own images
- Only ADMIN users can manage other users
- Image file maximum size is 10MB
- Images are organized by user email in the storage directory
- Transformations are applied to copies with "_transform" suffix
- Original files are never modified directly
- All user passwords are encrypted before storage
- Welcome emails are sent automatically on user registration

---

## Configuration Properties

### Application Configuration

The following properties should be configured in `application.properties`:

**Database Configuration:**
```properties
spring.datasource.url=${URL_DB}
spring.datasource.username=${USER_NAME}
spring.datasource.password=${PASSWORD_DB}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

**Hibernate Configuration:**
```properties
spring.jpa.show-sql=true
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.properties.hibernate.format_sql=false
```

**JWT Configuration:**
```properties
jwt.secret.key=${TOKEN_JWT}
jwt.expiration.time=86400000
```

**Server Configuration:**
```properties
spring.application.name=ImageHub
server.port=8080
```

**Email Configuration (SendGrid):**
```properties
sendgrid.api.key=${SENDGRID_API_KEY}
user.name.email=${USER_NAME_MAIL}
```

**Swagger/OpenAPI Documentation:**
```properties
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.operationsSorter=method
```

**File Upload Configuration:**
```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

**Image Storage Configuration:**
```properties
image.input.path=D:\\Tech\\images\\input
image.output.path=D:\\Tech\\images\\output
image.supported-formats=jpg,jpeg,png
```

### Environment Variables

The following environment variables must be set in your system or `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `URL_DB` | PostgreSQL database URL | jdbc:postgresql://localhost:5432/imagehub |
| `USER_NAME` | Database username | postgres |
| `PASSWORD_DB` | Database password | your_secure_password |
| `TOKEN_JWT` | Base64 encoded JWT secret key | base64_encoded_secret_key_here |
| `SENDGRID_API_KEY` | SendGrid API key for email | SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
| `USER_NAME_MAIL` | Email sender address | noreply@imagehub.com |

### Complete application.properties File

```properties
# Application Configuration
spring.application.name=ImageHub
server.port=8080

# Database Configuration
spring.datasource.url=${URL_DB}
spring.datasource.username=${USER_NAME}
spring.datasource.password=${PASSWORD_DB}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.properties.hibernate.format_sql=false

# JWT Configuration
jwt.secret.key=${TOKEN_JWT}
jwt.expiration.time=86400000

# SendGrid Email Configuration
sendgrid.api.key=${SENDGRID_API_KEY}
user.name.email=${USER_NAME_MAIL}

# Swagger/OpenAPI Documentation
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.operationsSorter=method

# File Upload Configuration
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB

# Image Storage Configuration
image.input.path=D:\\Tech\\images\\input
image.output.path=D:\\Tech\\images\\output
image.supported-formats=jpg,jpeg,png
```

### Setup Instructions

1. **Create directories for image storage:**
   ```bash
   mkdir -p D:\Tech\images\input
   mkdir -p D:\Tech\images\output
   ```

2. **Set up PostgreSQL database:**
    - Create a database named `imagehub`
    - Ensure PostgreSQL is running on localhost:5432

3. **Configure environment variables:**
    - Set `URL_DB`, `USER_NAME`, `PASSWORD_DB` for database connection
    - Set `TOKEN_JWT` with a secure base64-encoded secret key
    - Set `SENDGRID_API_KEY` from your SendGrid account
    - Set `USER_NAME_MAIL` for the email sender address

4. **Alternative: Use .env file with Spring Profile:**
    - Create `.env` file in project root
    - Load environment variables using `@Value` annotation
    - Or use Spring Cloud Config for centralized configuration

---

## Complete Usage Example

```bash
# 1. Register new user
REGISTER_RESPONSE=$(curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@gmail.com",
    "password": "SecurePassword123!",
    "phoneNumber": "+573103212753",
    "direction": "Calle 123 #45-67"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')

# 2. Upload image
UPLOAD_RESPONSE=$(curl -X POST http://localhost:8080/api/v1/images/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@image.png")

IMAGE_ID=$(echo $UPLOAD_RESPONSE | jq -r '.data.id')

# 3. Apply transformation
curl -X POST "http://localhost:8080/api/v1/images/$IMAGE_ID/transform" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resize": {"width": 100, "height": 100}}'

# 4. Download transformed image
curl -X GET "http://localhost:8080/api/v1/images/$IMAGE_ID/download?type=transform" \
  -H "Authorization: Bearer $TOKEN" \
  -o result.png

# 5. Get user profile
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# 6. Get user images
curl -X GET "http://localhost:8080/api/v1/images/user/all?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Support

For bug reports or feature requests, please contact the development team at bmtechnologicalsolutions@gmail.com