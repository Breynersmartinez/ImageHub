package com.example.ImageHub.utils;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;

@Component
@Slf4j
public class ImageValidationUtils {

    @Value("${image.supported-formats}")
    private String SUPPORTED_FILE_TYPES;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public void validate(MultipartFile file) throws IOException, IllegalArgumentException {
        log.info("Iniciando validación de archivo: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            log.warn("Archivo vacío");
            throw new IllegalArgumentException("El archivo está vacío");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("Archivo excede tamaño máximo: {} bytes", file.getSize());
            throw new IllegalArgumentException("El archivo excede el tamaño máximo permitido (10MB)");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            log.warn("Nombre de archivo nulo o vacío");
            throw new IllegalArgumentException("El nombre del archivo no es válido");
        }

        if (!hasValidExtension(filename)) {
            log.warn("Extensión de archivo inválida: {}", filename);
            throw new IllegalArgumentException("Extensión de archivo inválida. Formatos permitidos: " + SUPPORTED_FILE_TYPES);
        }

        if (!isImage(file)) {
            log.warn("Archivo no es una imagen válida: {}", filename);
            throw new IllegalArgumentException("El archivo no es una imagen válida");
        }

        log.info("Validación exitosa para archivo: {}", filename);
    }

    private boolean hasValidExtension(String filename) {
        String[] fileTypes = SUPPORTED_FILE_TYPES.split(",");
        String fileLower = filename.toLowerCase().trim();

        for (String fileType : fileTypes) {
            String cleanType = fileType.trim().toLowerCase();
            if (!cleanType.startsWith(".")) {
                cleanType = "." + cleanType;
            }
            if (fileLower.endsWith(cleanType)) {
                log.debug("Extensión válida encontrada: {}", cleanType);
                return true;
            }
        }
        return false;
    }

    private boolean isImage(MultipartFile file) throws IOException {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            boolean isValid = image != null;
            if (!isValid) {
                log.warn("ImageIO no pudo leer el archivo como imagen");
            }
            return isValid;
        } catch (IOException e) {
            log.error("Error al validar formato de imagen: {}", e.getMessage());
            throw new IOException("Error al validar formato de imagen", e);
        }
    }
}