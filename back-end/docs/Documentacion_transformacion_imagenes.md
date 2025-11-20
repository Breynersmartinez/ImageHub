# Documentacion API ImageHub

## Descripcion General

ImageHub es una API REST que permite a los usuarios cargar, almacenar, descargar y aplicar transformaciones a imagenes. La API utiliza autenticacion basada en tokens JWT y patrones de diseño como Strategy Pattern para las transformaciones de imagenes.

---

## Informacion General de la API

**Base URL:** `http://localhost:8080/api/v1`

**Autenticacion:** JWT Bearer Token

**Content-Type:** `application/json` (excepto en upload)

**CORS:** Habilitado para todos los origenes

---

## Autenticacion

Todos los endpoints requieren un token JWT valido en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## Endpoints

### 1. Cargar Imagen

**Descripcion:** Sube una nueva imagen al sistema.

**Metodo:** `POST`

**URL:** `/api/v1/images/upload`

**Autenticacion:** Requerida

**Headers:**
```
Authorization: Bearer [token]
Content-Type: multipart/form-data
```

**Parametros del Body:**
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|------------|
| file | File | Si | Archivo de imagen a subir (max 10MB) |

**Formatos soportados:** .png, .jpg, .jpeg, .gif, .bmp

**Ejemplo de Solicitud (cURL):**
```bash
curl -X POST http://localhost:8080/api/v1/images/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -F "file=@ruta/a/mi/imagen.png"
```

**Ejemplo de Respuesta Exitosa (201 Created):**
```json
{
  "success": true,
  "message": "Imagen subida exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "usuario@gmail.com",
    "imageName": "mi_imagen.png"
  }
}
```

**Posibles Errores:**
- `400 Bad Request` - Archivo invalido o formato no soportado
- `500 Internal Server Error` - Error al guardar la imagen

---

### 2. Descargar Imagen

**Descripcion:** Descarga una imagen original o transformada.

**Metodo:** `GET`

**URL:** `/api/v1/images/{imageId}/download`

**Autenticacion:** Requerida

**Parametros de URL:**
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|------------|
| imageId | String (UUID) | Si | ID unico de la imagen |

**Parametros de Query:**
| Parametro | Tipo | Requerido | Valor por Defecto | Descripcion |
|-----------|------|-----------|-------------------|------------|
| type | String | No | input | "input" para imagen original o "transform" para imagen transformada |

**Ejemplo de Solicitud (cURL):**
```bash
# Descargar imagen original
curl -X GET "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/download?type=input" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -o imagen_descargada.png

# Descargar imagen transformada
curl -X GET "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/download?type=transform" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -o imagen_transformada.png
```

**Respuesta:** Archivo binario de imagen

**Posibles Errores:**
- `404 Not Found` - Imagen no encontrada o no disponible
- `400 Bad Request` - Parametro type invalido

---

### 3. Transformar Imagen

**Descripcion:** Aplica transformaciones a una imagen (resize, crop, rotate, filter, format).

**Metodo:** `POST`

**URL:** `/api/v1/images/{imageId}/transform`

**Autenticacion:** Requerida

**Parametros de URL:**
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|------------|
| imageId | String (UUID) | Si | ID unico de la imagen |

**Body (JSON):**

#### 3.1 Resize (Redimensionar)
```json
{
  "resize": {
    "width": 200,
    "height": 200
  }
}
```

#### 3.2 Crop (Recortar)
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

#### 3.3 Rotate (Rotar)
```json
{
  "rotate": 45
}
```

#### 3.4 Filter (Filtros)
Escala de grises:
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

#### 3.5 Format (Cambiar Formato)
```json
{
  "format": "jpg"
}
```

**Formatos soportados:** jpg, jpeg, png, gif, bmp, webp

**Ejemplo de Solicitud (cURL) - Resize:**
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

**Ejemplo de Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Transformacion completada exitosamente",
  "data": "D:\\Tech\\images\\input\\usuario@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\imagen_transform.png"
}
```

**Posibles Errores:**
- `400 Bad Request` - Parametros invalidos o validacion fallida
- `404 Not Found` - Imagen no encontrada
- `500 Internal Server Error` - Error durante la transformacion

---

### 4. Obtener Imagenes del Usuario

**Descripcion:** Obtiene todas las imagenes del usuario autenticado con paginacion.

**Metodo:** `GET`

**URL:** `/api/v1/images/user/all`

**Autenticacion:** Requerida

**Parametros de Query:**
| Parametro | Tipo | Requerido | Valor por Defecto | Descripcion |
|-----------|------|-----------|-------------------|------------|
| page | Integer | No | 0 | Numero de pagina (comienza en 0) |
| size | Integer | No | 10 | Cantidad de resultados por pagina |

**Ejemplo de Solicitud (cURL):**
```bash
curl -X GET "http://localhost:8080/api/v1/images/user/all?page=0&size=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Ejemplo de Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "message": "Imagenes obtenidas exitosamente",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "userName": "usuario@gmail.com",
        "imageName": "mi_imagen.png",
        "inputPath": "D:\\Tech\\images\\input\\usuario@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\mi_imagen.png",
        "transformPath": "D:\\Tech\\images\\input\\usuario@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\mi_imagen_transform.png",
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

**Posibles Errores:**
- `404 Not Found` - Usuario sin imagenes
- `400 Bad Request` - Parametros de paginacion invalidos

---

## Codigos de Estado HTTP

| Codigo | Descripcion |
|--------|------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Solicitud invalida o parametros incorrectos |
| 401 | Unauthorized - Token JWT invalido o expirado |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Estructura de Modelos

### ImageMetadata
```json
{
  "id": "uuid",
  "userName": "string",
  "imageName": "string",
  "inputPath": "string",
  "transformPath": "string o null",
  "description": "string o null",
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

## Flujo Típico de Uso

1. **Autenticarse** - Obtener token JWT

2. **Cargar imagen:**
   ```
   POST /api/v1/images/upload
   ```

3. **Obtener lista de imagenes:**
   ```
   GET /api/v1/images/user/all
   ```

4. **Aplicar transformacion:**
   ```
   POST /api/v1/images/{imageId}/transform
   ```

5. **Descargar imagen transformada:**
   ```
   GET /api/v1/images/{imageId}/download?type=transform
   ```

---

## Notas Importantes

- Todas las solicitudes deben incluir un header `Authorization` valido
- El tamano maximo de archivo para upload es 10MB
- Las imagenes se almacenan en la ruta configurada en `application.properties`: `image.input.path`
- Las transformaciones se aplican a copias del archivo original (archivo con sufijo "_transform")
- El archivo original nunca se modifica directamente
- Los formatos soportados se pueden modificar en `application.properties`: `image.supported-formats`

---

## Limitaciones y Consideraciones

- Solo usuarios autenticados pueden realizar operaciones
- Cada usuario solo puede acceder a sus propias imagenes
- Las transformaciones se aplican secuencialmente segun el Strategy Pattern
- El archivo transformado se guarda con el mismo nombre pero con sufijo "_transform"
- Para cambiar el formato, se crea un nuevo archivo y se elimina el antiguo

---

## Ejemplo Completo de Uso

```bash
# 1. Subir imagen
IMAGE_ID=$(curl -X POST http://localhost:8080/api/v1/images/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@imagen.png" | jq -r '.data.id')

# 2. Redimensionar a 100x100
curl -X POST "http://localhost:8080/api/v1/images/$IMAGE_ID/transform" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resize": {"width": 100, "height": 100}}'

# 3. Descargar imagen transformada
curl -X GET "http://localhost:8080/api/v1/images/$IMAGE_ID/download?type=transform" \
  -H "Authorization: Bearer TOKEN" \
  -o resultado.png
```

---

## Soporte

Para reportar problemas o solicitar funcionalidades adicionales, contactar al equipo de desarrollo.