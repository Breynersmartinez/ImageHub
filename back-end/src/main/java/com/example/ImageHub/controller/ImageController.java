package com.example.ImageHub.controller;

import com.example.ImageHub.dto.imgDTO.ApiResponse;
import com.example.ImageHub.dto.imgDTO.ImageResponse;
import com.example.ImageHub.dto.imgDTO.TransformRequestDto;
import com.example.ImageHub.model.ImageMetadata;
import com.example.ImageHub.service.FileStorageService;
import com.example.ImageHub.service.ImageProcService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/images")
@CrossOrigin(origins = "*")
public class ImageController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ImageProcService imageProcService;

    /**
     * Sube una nueva imagen
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImageResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        try {
            String userName = authentication.getName();
            String imageId = fileStorageService.saveFile(file, userName);

            ImageResponse response = ImageResponse.builder()
                    .id(UUID.fromString(imageId))
                    .userName(userName)
                    .imageName(file.getOriginalFilename())
                    .build();

            log.info("Imagen subida exitosamente por usuario: {}", userName);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Imagen subida exitosamente"));

        } catch (IllegalArgumentException e) {
            log.error("Error de validación: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage(), "Validación fallida"));

        } catch (IOException e) {
            log.error("Error al guardar imagen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage(), "Error al guardar imagen"));
        }
    }

    /**
     * Obtiene una imagen (original o transformada)
     */
    @GetMapping("/{imageId}/download")
    public ResponseEntity<Resource> downloadImage(
            @PathVariable String imageId,
            @RequestParam(defaultValue = "input") String type) {

        try {
            Resource resource = fileStorageService.getFile(imageId, type);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .header("Content-Type", "image/png") // o detectar dinámicamente
                    .body(resource);

        } catch (IOException e) {
            log.error("Error descargando imagen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Aplica transformaciones a una imagen usando Strategy Pattern
     */
    @PostMapping("/{imageId}/transform")
    public ResponseEntity<ApiResponse<String>> transformImage(
            @PathVariable String imageId,
            @RequestBody TransformRequestDto transformRequest,
            Authentication authentication) {

        try {
            log.info("Transformación solicitada para imagen: {} por usuario: {}",
                    imageId, authentication.getName());

            String transformedPath = imageProcService.transformImageHandler(imageId, transformRequest);

            return ResponseEntity.ok()
                    .body(ApiResponse.success(transformedPath,
                            "Transformación completada exitosamente"));

        } catch (IllegalArgumentException e) {
            log.error("Error de validación: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage(), "Validación fallida"));

        } catch (IOException e) {
            log.error("Error transformando imagen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage(), "Error en transformación"));
        }
    }

    /**
     * Obtiene todas las imágenes del usuario autenticado con paginación
     */
    @GetMapping("/user/all")
    public ResponseEntity<ApiResponse<Page<ImageMetadata>>> getUserImages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        try {
            String userName = authentication.getName();
            Pageable pageable = PageRequest.of(page, size);
            Page<ImageMetadata> images = fileStorageService.getAllImageMetadataByUser(userName, pageable);

            return ResponseEntity.ok()
                    .body(ApiResponse.success(images,
                            "Imagenes obtenidas exitosamente"));

        } catch (IOException e) {
            log.error("Error obteniendo imágenes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage(), "No se encontraron imágenes"));
        }
    }
}