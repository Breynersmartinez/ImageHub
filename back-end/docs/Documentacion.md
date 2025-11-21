# Documentación API ImageHub

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Información de la API](#información-de-la-api)
3. [Autenticación](#autenticación)
4. [Gestión de Usuarios](#gestión-de-usuarios)
5. [Gestión de Imágenes](#gestión-de-imágenes)
6. [Códigos de Estado HTTP](#códigos-de-estado-http)
7. [Estructuras de Modelos](#estructuras-de-modelos)
8. [Ejemplo de Uso Completo](#ejemplo-de-uso-completo)

---

## Descripción General

ImageHub es una API REST completa que permite a los usuarios gestionar sus perfiles y realizar operaciones avanzadas con imágenes. La API incluye autenticación basada en JWT, control de acceso basado en roles (roles ADMIN y USER) e implementa el patrón Strategy para transformaciones modulares de imágenes. Se integra con SendGrid para notificaciones por correo electrónico y utiliza Spring Security para autenticación y autorización robustas.

---

## Información de la API

**URL Base:** `http://localhost:8080/api`

**Autenticación:** Token Bearer JWT

**Content-Type:** `application/json` (excepto en carga de archivos)

**CORS:** Configurado para orígenes específicos

**Roles:** ADMIN, USER

---

## Autenticación

### Configuración JWT

Todos los puntos finales (excepto los públicos) requieren un token JWT válido en el encabezado:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Propiedades del Token:**
- Tiempo de expiración: Configurable en `application.properties`
- Algoritmo: HS256
- Clave secreta: Almacenada en variables de entorno

**Puntos Finales Públicos:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- Documentación Swagger/OpenAPI

---

## Puntos Finales de Autenticación

### 1. Registrar Usuario

**Descripción:** Crear una nueva cuenta de usuario en el sistema.

**Método:** `POST`

**URL:** `/api/auth/register`

**Autenticación:** No requerida

**Encabezados:**
```
Content-Type: application/json
```

**Parámetros del Cuerpo:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| id | UUID | No | ID de usuario (generado automáticamente si no se proporciona) |
| firstName | String | Sí | Nombre (no puede estar vacío) |
| lastName | String | Sí | Apellido (no puede estar vacío) |
| email | String | Sí | Correo electrónico (debe ser único) |
| password | String | Sí | Contraseña (será encriptada) |
| phoneNumber | String | Sí | Número de teléfono |
| direction | String | Sí | Dirección |
| role | String | No | USER o ADMIN (por defecto USER) |

**Ejemplo de Solicitud (cURL):**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@gmail.com",
    "password": "ContraseñaSegura123!",
    "phoneNumber": "+573103212753",
    "direction": "Calle 123 #45-67",
    "role": "USER"
  }'
```

**Respuesta de Éxito (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "juan.perez@gmail.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "USER",
  "message": "Usuario registrado exitosamente"
}
```

**Posibles Errores:**
- `400 Bad Request` - Correo electrónico ya registrado o datos inválidos
- `500 Internal Server Error` - Error del servidor durante el registro

---

### 2. Iniciar Sesión

**Descripción:** Autenticar usuario y obtener token JWT.

**Método:** `POST`

**URL:** `/api/auth/login`

**Autenticación:** No requerida

**Encabezados:**
```
Content-Type: application/json
```

**Parámetros del Cuerpo:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| email | String | Sí | Correo electrónico del usuario |
| password | String | Sí | Contraseña del usuario |

**Ejemplo de Solicitud (cURL):**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@gmail.com",
    "password": "ContraseñaSegura123!"
  }'
```

**Respuesta de Éxito (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "juan.perez@gmail.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "USER",
  "message": "Inicio de sesión exitoso"
}
```

**Posibles Errores:**
- `401 Unauthorized` - Credenciales inválidas
- `404 Not Found` - Usuario no encontrado
- `500 Internal Server Error` - Error del servidor

---

## Puntos Finales de Gestión de Usuarios

### 1. Obtener Todos los Usuarios

**Descripción:** Recuperar todos los usuarios del sistema. Solo para usuarios ADMIN.

**Método:** `GET`

**URL:** `/api/users`

**Autenticación:** Requerida

**Autorización:** Solo rol ADMIN

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Respuesta de Éxito (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan.perez@gmail.com",
    "phoneNumber": "+573103212753",
    "direction": "Calle 123 #45-67",
    "role": "USER",
    "registrationDate": "2025-11-20T15:22:40",
    "active": true
  }
]
```

**Posibles Errores:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - El usuario no es administrador

---

### 2. Obtener Usuario por ID

**Descripción:** Recuperar un usuario específico por su ID único.

**Método:** `GET`

**URL:** `/api/users/{id}`

**Autenticación:** Requerida

**Parámetros de URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| id | UUID | Sí | ID único del usuario |

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X GET http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Respuesta de Éxito (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@gmail.com",
  "phoneNumber": "+573103212753",
  "direction": "Calle 123 #45-67",
  "role": "USER",
  "registrationDate": "2025-11-20T15:22:40",
  "active": true
}
```

**Posibles Errores:**
- `401 Unauthorized` - Token inválido o expirado
- `404 Not Found` - Usuario no encontrado

---

### 3. Obtener Perfil de Usuario Actual

**Descripción:** Recuperar el perfil del usuario autenticado.

**Método:** `GET`

**URL:** `/api/users/me`

**Autenticación:** Requerida

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Respuesta de Éxito (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@gmail.com",
  "phoneNumber": "+573103212753",
  "direction": "Calle 123 #45-67",
  "role": "USER",
  "registrationDate": "2025-11-20T15:22:40",
  "active": true
}
```

**Posibles Errores:**
- `401 Unauthorized` - Token inválido o expirado
- `404 Not Found` - Usuario no encontrado

---

### 4. Obtener Usuarios Activos

**Descripción:** Recuperar todos los usuarios activos. Solo para usuarios ADMIN.

**Método:** `GET`

**URL:** `/api/users/active`

**Autenticación:** Requerida

**Autorización:** Solo rol ADMIN

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X GET http://localhost:8080/api/users/active \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Posibles Errores:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - El usuario no es administrador

---

### 5. Obtener Usuarios por Rol

**Descripción:** Recuperar todos los usuarios con un rol específico. Solo para usuarios ADMIN.

**Método:** `GET`

**URL:** `/api/users/role/{role}`

**Autenticación:** Requerida

**Autorización:** Solo rol ADMIN

**Parámetros de URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| role | String | Sí | USER o ADMIN |

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X GET http://localhost:8080/api/users/role/ADMIN \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Posibles Errores:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - El usuario no es administrador

---

### 6. Actualizar Usuario

**Descripción:** Actualizar información del usuario. Los usuarios pueden actualizar sus propios datos, los administradores pueden actualizar cualquier usuario.

**Método:** `PUT`

**URL:** `/api/users/{id}`

**Autenticación:** Requerida

**Autorización:** El usuario puede actualizar su propio perfil o debe ser ADMIN

**Parámetros de URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| id | UUID | Sí | ID único del usuario |

**Encabezados:**
```
Authorization: Bearer [token]
Content-Type: application/json
```

**Parámetros del Cuerpo:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| firstName | String | No | Nombre |
| lastName | String | No | Apellido |
| email | String | No | Correo electrónico (debe ser único) |
| password | String | No | Nueva contraseña (será encriptada) |
| phoneNumber | String | No | Número de teléfono |
| direction | String | No | Dirección |
| role | String | No | USER o ADMIN (solo ADMIN puede cambiar) |
| active | Boolean | No | Estado de cuenta (solo ADMIN puede cambiar) |

**Ejemplo de Solicitud (cURL):**
```bash
curl -X PUT http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "María",
    "phoneNumber": "+573109876543"
  }'
```

**Respuesta de Éxito (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "María",
  "lastName": "Pérez",
  "email": "juan.perez@gmail.com",
  "phoneNumber": "+573109876543",
  "direction": "Calle 123 #45-67",
  "role": "USER",
  "registrationDate": "2025-11-20T15:22:40",
  "active": true
}
```

**Posibles Errores:**
- `400 Bad Request` - Correo electrónico ya en uso
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - No autorizado para actualizar este usuario
- `404 Not Found` - Usuario no encontrado

---

### 7. Eliminar Usuario

**Descripción:** Eliminar permanentemente un usuario del sistema. Solo para usuarios ADMIN.

**Método:** `DELETE`

**URL:** `/api/users/{id}`

**Autenticación:** Requerida

**Autorización:** Solo rol ADMIN

**Parámetros de URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| id | UUID | Sí | ID único del usuario |

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X DELETE http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Respuesta de Éxito (204 Sin Contenido)**

**Posibles Errores:**
- `401 Unauthorized` - Token inválido o expirado
- `403 Forbidden` - El usuario no es administrador
- `404 Not Found` - Usuario no encontrado

---

### 8. Desactivar Usuario

**Descripción:** Eliminación suave - desactivar un usuario sin eliminarlo de la base de datos. Solo para usuarios ADMIN.

**Método:** `PATCH`

**URL:** `/api/users/{id}/deactivate`

**Autenticación:** Requerida

**Autorización:** Solo rol ADMIN

**Parámetros de URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| id | UUID | Sí | ID único del usuario |

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X PATCH http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000/deactivate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Respuesta de Éxito (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan.perez@gmail.com",
  "phoneNumber": "+573103212753",
  "direction": "Calle 123 #45-67",
  "role": "USER",
  "registrationDate": "2025-11-20T15:22:40",
  "active": false
}
```

---

### 9. Activar Usuario

**Descripción:** Reactivar un usuario desactivado. Solo para usuarios ADMIN.

**Método:** `PATCH`

**URL:** `/api/users/{id}/activate`

**Autenticación:** Requerida

**Autorización:** Solo rol ADMIN

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X PATCH http://localhost:8080/api/users/550e8400-e29b-41d4-a716-446655440000/activate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

---

## Puntos Finales de Gestión de Imágenes

### 1. Cargar Imagen

**Descripción:** Cargar una nueva imagen al sistema.

**Método:** `POST`

**URL:** `/api/v1/images/upload`

**Autenticación:** Requerida

**Encabezados:**
```
Authorization: Bearer [token]
Content-Type: multipart/form-data
```

**Parámetros del Cuerpo:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| file | File | Sí | Archivo de imagen (máximo 10MB) |

**Formatos Soportados:** .png, .jpg, .jpeg, .gif, .bmp

**Ejemplo de Solicitud (cURL):**
```bash
curl -X POST http://localhost:8080/api/v1/images/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -F "file=@ruta/a/imagen.png"
```

**Respuesta de Éxito (201 Creado):**
```json
{
  "success": true,
  "message": "Imagen cargada exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "juan.perez@gmail.com",
    "imageName": "mi_imagen.png"
  }
}
```

**Posibles Errores:**
- `400 Bad Request` - Archivo inválido o formato no soportado
- `401 Unauthorized` - Token inválido o expirado
- `500 Internal Server Error` - Error del servidor

---

### 2. Descargar Imagen

**Descripción:** Descargar una imagen original o transformada.

**Método:** `GET`

**URL:** `/api/v1/images/{imageId}/download`

**Autenticación:** Requerida

**Parámetros de URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| imageId | UUID | Sí | ID único de la imagen |

**Parámetros de Consulta:**
| Parámetro | Tipo | Requerido | Por Defecto | Descripción |
|-----------|------|----------|---------|------------|
| type | String | No | input | "input" para original o "transform" para transformada |

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
# Descargar imagen original
curl -X GET "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/download?type=input" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -o imagen.png

# Descargar imagen transformada
curl -X GET "http://localhost:8080/api/v1/images/550e8400-e29b-41d4-a716-446655440000/download?type=transform" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -o imagen_transformada.png
```

**Respuesta:** Archivo de imagen binario

**Posibles Errores:**
- `400 Bad Request` - Parámetro de tipo inválido
- `401 Unauthorized` - Token inválido o expirado
- `404 Not Found` - Imagen no encontrada

---

### 3. Transformar Imagen

**Descripción:** Aplicar transformaciones a una imagen usando varias estrategias.

**Método:** `POST`

**URL:** `/api/v1/images/{imageId}/transform`

**Autenticación:** Requerida

**Parámetros de URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|------------|
| imageId | UUID | Sí | ID único de la imagen |

**Encabezados:**
```
Authorization: Bearer [token]
Content-Type: application/json
```

**Tipos de Transformación:**

#### Redimensionar
```json
{
  "resize": {
    "width": 200,
    "height": 200
  }
}
```

#### Recortar
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

#### Rotar
```json
{
  "rotate": 45
}
```

#### Filtro - Escala de Grises
```json
{
  "filters": {
    "grayscale": true
  }
}
```

#### Filtro - Sepia
```json
{
  "filters": {
    "sepia": true
  }
}
```

#### Conversión de Formato
```json
{
  "format": "jpg"
}
```

**Formatos Soportados:** jpg, jpeg, png, gif, bmp, webp

**Ejemplo de Solicitud (cURL) - Redimensionar:**
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

**Respuesta de Éxito (200 OK):**
```json
{
  "success": true,
  "message": "Transformación completada exitosamente",
  "data": "D:\\Tech\\images\\input\\usuario@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\imagen_transform.png"
}
```

**Posibles Errores:**
- `400 Bad Request` - Parámetros inválidos
- `401 Unauthorized` - Token inválido o expirado
- `404 Not Found` - Imagen no encontrada
- `500 Internal Server Error` - Error de transformación

---

### 4. Obtener Imágenes del Usuario

**Descripción:** Recuperar todas las imágenes del usuario autenticado con paginación.

**Método:** `GET`

**URL:** `/api/v1/images/user/all`

**Autenticación:** Requerida

**Parámetros de Consulta:**
| Parámetro | Tipo | Requerido | Por Defecto | Descripción |
|-----------|------|----------|---------|------------|
| page | Integer | No | 0 | Número de página (comienza en 0) |
| size | Integer | No | 10 | Resultados por página |

**Encabezados:**
```
Authorization: Bearer [token]
```

**Ejemplo de Solicitud (cURL):**
```bash
curl -X GET "http://localhost:8080/api/v1/images/user/all?page=0&size=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Respuesta de Éxito (200 OK):**
```json
{
  "success": true,
  "message": "Imágenes recuperadas exitosamente",
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "userName": "juan.perez@gmail.com",
        "imageName": "mi_imagen.png",
        "inputPath": "D:\\Tech\\images\\input\\juan.perez@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\mi_imagen.png",
        "transformPath": "D:\\Tech\\images\\input\\juan.perez@gmail.com\\550e8400-e29b-41d4-a716-446655440000\\mi_imagen_transform.png",
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

**Posibles Errores:**
- `401 Unauthorized` - Token inválido o expirado
- `404 Not Found` - El usuario no tiene imágenes

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|------------|
| 200 | OK - Solicitud exitosa |
| 201 | Creado - Recurso creado exitosamente |
| 204 | Sin Contenido - Eliminación exitosa |
| 400 | Solicitud Incorrecta - Solicitud o parámetros inválidos |
| 401 | No Autorizado - Token JWT inválido o expirado |
| 403 | Prohibido - El usuario no tiene permisos requeridos |
| 404 | No Encontrado - Recurso no encontrado |
| 500 | Error Interno del Servidor - Error del servidor |

---

## Estructuras de Modelos

### Modelo de Usuario
```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "email": "string (único)",
  "phoneNumber": "string",
  "direction": "string",
  "role": "USER o ADMIN",
  "registrationDate": "2025-11-20T15:22:40",
  "active": "boolean",
  "createdBy": "string",
  "creationDate": "2025-11-20T15:22:40",
  "lastModifiedBy": "string",
  "lastModifiedDate": "2025-11-20T15:22:43"
}
```

### Modelo de Metadatos de Imagen
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

### Modelo de Respuesta de Autenticación
```json
{
  "token": "string-token-jwt",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "USER o ADMIN",
  "message": "string"
}
```

### Modelo TransformRequestDto
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

## Flujo de Uso Típico

### Registro y Autenticación de Usuarios

1. **Registrar nuevo usuario:**
   ```
   POST /api/auth/register
   ```

2. **Iniciar sesión:**
   ```
   POST /api/auth/login
   ```

3. **Obtener perfil de usuario actual:**
   ```
   GET /api/users/me
   ```

### Gestión de Imágenes

1. **Cargar imagen:**
   ```
   POST /api/v1/images/upload
   ```

2. **Obtener imágenes del usuario:**
   ```
   GET /api/v1/images/user/all
   ```

3. **Aplicar transformación:**
   ```
   POST /api/v1/images/{imageId}/transform
   ```

4. **Descargar imagen transformada:**
   ```
   GET /api/v1/images/{imageId}/download?type=transform
   ```

---

## Características de Seguridad

- Autenticación basada en token JWT con expiración configurable
- Control de acceso basado en roles (RBAC) para roles ADMIN y USER
- Encriptación de contraseña usando BCrypt
- Validación de correo electrónico y verificación de unicidad
- Capacidad de eliminación suave para cuentas de usuario
- Seguimiento de pista de auditoría (creado por, fecha de creación, última modificación por, fecha de última modificación)
- Configuración CORS para orígenes específicos
- Seguridad a nivel de método usando anotaciones @PreAuthorize
- Notificaciones por correo electrónico a través de SendGrid para registro de usuario

---

## Notas Importantes

- Todos los puntos finales autenticados requieren un token bearer JWT válido
- Los usuarios solo pueden acceder a sus propias imág