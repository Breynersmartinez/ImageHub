# ImageHub API Documentation

## General Description

ImageHub is a REST API that allows users to upload, store, download, and apply transformations to images. The API uses JWT-based authentication and design patterns such as Strategy Pattern for image transformations.

---

## General API Information

**Base URL:** `http://localhost:8080/api/v1`

**Authentication:** JWT Bearer Token

**Content-Type:** `application/json` (except in upload)

**CORS:** Enabled for all origins

---

## Authentication

All endpoints require a valid JWT token in the header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## Endpoints

### 1. Upload Image

**Description:** Uploads a new image to the system.

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
| file | File | Yes | Image file to upload (max 10MB) |

**Supported Formats:** .png, .jpg, .jpeg, .gif, .bmp

**Example Request (cURL):**
```bash
curl -X POST http://localhost:8080/api/v1/images/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -F "file=@path/to/my/image.png"
```

**Example Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "user@gmail.com",
    "imageName": "my_image.png"
  }
}
```

**Possible Errors:**
- `400 Bad Request` - Invalid file or unsupported format
- `500 Internal Server Error` - Error saving the image

---

### 2. Download Image

**Description:** Downloads an original or transformed image.

**Method:** `GET`

**URL:** `/api/v1/images/{imageId}/download`

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| imageId | String (UUID) | Yes | Unique image ID |

**Query Parameters:**
| Parameter | Type | Required | Default Value | Description |
|-----------|------|----------|----------------|------------|
| type | String | No | input | "input" for original image or "transform" for transformed image |

**Example Request (cURL):**
```bash
# Download original image
curl -X GET "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/download?type=input" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -o downloaded_image.png

# Download transformed image
curl -X GET "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/download?type=transform" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -o transformed_image.png
```

**Response:** Binary image file

**Possible Errors:**
- `404 Not Found` - Image not found or not available
- `400 Bad Request` - Invalid type parameter

---

### 3. Transform Image

**Description:** Applies transformations to an image (resize, crop, rotate, filter, format).

**Method:** `POST`

**URL:** `/api/v1/images/{imageId}/transform`

**Authentication:** Required

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|------------|
| imageId | String (UUID) | Yes | Unique image ID |

**Body (JSON):**

#### 3.1 Resize
```json
{
  "resize": {
    "width": 200,
    "height": 200
  }
}
```

#### 3.2 Crop
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

#### 3.3 Rotate
```json
{
  "rotate": 45
}
```

#### 3.4 Filter
Grayscale:
```json
{
  "filters": {
    "grayscale": true
  }
}
```

Sepia:
```json
{
  "filters": {
    "sepia": true
  }
}
```

#### 3.5 Format
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
      "width": 200,
      "height": 200
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
- `400 Bad Request` - Invalid parameters or validation failed
- `404 Not Found` - Image not found
- `500 Internal Server Error` - Error during transformation

---

### 4. Get User Images

**Description:** Retrieves all images of the authenticated user with pagination.

**Method:** `GET`

**URL:** `/api/v1/images/user/all`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default Value | Description |
|-----------|------|----------|----------------|------------|
| page | Integer | No | 0 | Page number (starts at 0) |
| size | Integer | No | 10 | Number of results per page |

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
        "userName": "user@gmail.com",
        "imageName": "my_image.png",
        "inputPath": "D:\\Tech\\images\\input\\user@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\my_image.png",
        "transformPath": "D:\\Tech\\images\\input\\user@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\my_image_transform.png",
        "description": null,
        "registrationDate": "2025-11-20T15:22:40",
        "dateOfUpdate": "2025-11-20T15:22:43",
        "hasTransformation": true
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 10
    },
    "totalElements": 1,
    "totalPages": 1
  }
}
```

**Possible Errors:**
- `404 Not Found` - User has no images
- `400 Bad Request` - Invalid pagination parameters

---

## HTTP Status Codes

| Code | Description |
|------|------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request or incorrect parameters |
| 401 | Unauthorized - Invalid or expired JWT token |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Model Structures

### ImageMetadata
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

### TransformRequestDto
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

1. **Authenticate** - Obtain JWT token

2. **Upload image:**
   ```
   POST /api/v1/images/upload
   ```

3. **Get list of images:**
   ```
   GET /api/v1/images/user/all
   ```

4. **Apply transformation:**
   ```
   POST /api/v1/images/{imageId}/transform
   ```

5. **Download transformed image:**
   ```
   GET /api/v1/images/{imageId}/download?type=transform
   ```

---

## Important Notes

- All requests must include a valid `Authorization` header
- Maximum file size for upload is 10MB
- Images are stored in the path configured in `application.properties`: `image.input.path`
- Transformations are applied to copies of the original file (file with "_transform" suffix)
- The original file is never modified directly
- Supported formats can be modified in `application.properties`: `image.supported-formats`

---

## Limitations and Considerations

- Only authenticated users can perform operations
- Each user can only access their own images
- Transformations are applied sequentially according to the Strategy Pattern
- The transformed file is saved with the same name but with "_transform" suffix
- When changing format, a new file is created and the old one is deleted

---

## Complete Usage Example

```bash
# 1. Upload image
IMAGE_ID=$(curl -X POST http://localhost:8080/api/v1/images/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@image.png" | jq -r '.data.id')

# 2. Resize to 100x100
curl -X POST "http://localhost:8080/api/v1/images/$IMAGE_ID/transform" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resize": {"width": 100, "height": 100}}'

# 3. Download transformed image
curl -X GET "http://localhost:8080/api/v1/images/$IMAGE_ID/download?type=transform" \
  -H "Authorization: Bearer TOKEN" \
  -o result.png
```

---

## Support

For bug reports or feature requests, please contact the development team.