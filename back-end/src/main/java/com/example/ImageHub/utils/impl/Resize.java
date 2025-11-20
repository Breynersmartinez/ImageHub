package com.example.ImageHub.utils.impl;

import com.example.ImageHub.dto.imgDTO.TransformRequestDto;
import com.example.ImageHub.utils.ImageTransform;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

@Slf4j
@Component
public class Resize implements ImageTransform {

    @Override
    public void transform(String imagePath, TransformRequestDto request) throws IOException {
        log.info("[RESIZE] Iniciando redimensionamiento de imagen: {}", imagePath);

        // Validar que el archivo existe
        File imageFile = new File(imagePath);
        if (!imageFile.exists()) {
            log.error("[RESIZE] Archivo no encontrado: {}", imagePath);
            throw new IOException("Archivo no encontrado: " + imagePath);
        }

        // Validar que resize no sea nulo
        if (request.getResize() == null) {
            log.error("[RESIZE] El objeto resize es nulo");
            throw new IllegalArgumentException("Resize debe estar definido en la solicitud");
        }

        Integer newWidth = request.getResize().getWidth();
        Integer newHeight = request.getResize().getHeight();

        // Validar que las dimensiones no sean nulas
        if (newWidth == null || newHeight == null) {
            log.error("[RESIZE] Width o Height es nulo. Width: {}, Height: {}", newWidth, newHeight);
            throw new IllegalArgumentException("Width y Height no pueden ser nulos");
        }

        // Validar que las dimensiones sean mayores a cero
        if (newWidth <= 0 || newHeight <= 0) {
            log.error("[RESIZE] Dimensiones invalidas. Width: {}, Height: {}", newWidth, newHeight);
            throw new IllegalArgumentException("Width y Height deben ser mayores a 0");
        }

        try {
            // Leer imagen original
            BufferedImage originalImage = ImageIO.read(imageFile);

            if (originalImage == null) {
                log.error("[RESIZE] No se pudo leer la imagen. Archivo corrupto o formato no soportado");
                throw new IOException("No se pudo leer la imagen: " + imagePath);
            }

            int originalWidth = originalImage.getWidth();
            int originalHeight = originalImage.getHeight();

            log.info("[RESIZE] Imagen original cargada. Dimensiones: {}x{}", originalWidth, originalHeight);
            log.info("[RESIZE] Nuevas dimensiones solicitadas: {}x{}", newWidth, newHeight);

            // Crear imagen redimensionada con las nuevas dimensiones
            BufferedImage resizedImage = new BufferedImage(
                    newWidth,
                    newHeight,
                    BufferedImage.TYPE_INT_RGB
            );

            log.debug("[RESIZE] BufferedImage creado con dimensiones: {}x{}", newWidth, newHeight);

            // Usar Graphics2D para dibujar imagen escalada
            var g2d = resizedImage.createGraphics();

            java.awt.Image scaledInstance = originalImage.getScaledInstance(
                    newWidth,
                    newHeight,
                    java.awt.Image.SCALE_SMOOTH
            );

            g2d.drawImage(scaledInstance, 0, 0, null);
            g2d.dispose();

            log.debug("[RESIZE] Imagen dibujada en BufferedImage");

            // Obtener formato de la imagen original
            String format = getImageFormat(imagePath);
            log.info("[RESIZE] Formato detectado: {}", format);

            // Guardar imagen redimensionada en el mismo archivo
            boolean written = ImageIO.write(resizedImage, format, imageFile);

            if (written) {
                log.info("[RESIZE] Imagen redimensionada exitosamente. Nuevas dimensiones: {}x{}", newWidth, newHeight);
            } else {
                log.error("[RESIZE] ImageIO.write() retorno false. No se escribio el archivo");
                throw new IOException("ImageIO no pudo escribir la imagen con formato: " + format);
            }

        } catch (IOException e) {
            log.error("[RESIZE] Error IOException: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("[RESIZE] Error inesperado: {}", e.getMessage(), e);
            throw new IOException("Error durante redimensionamiento: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean canHandle(TransformRequestDto request) {
        if (request == null) {
            log.warn("[RESIZE] TransformRequestDto es nulo");
            return false;
        }

        boolean canHandle = request.getResize() != null;

        if (canHandle) {
            log.debug("[RESIZE] Esta estrategia puede manejar esta solicitud");
        } else {
            log.debug("[RESIZE] Esta estrategia no puede manejar esta solicitud (resize es nulo)");
        }

        return canHandle;
    }

    // Extrae el formato de imagen de la ruta del archivo
    private String getImageFormat(String imagePath) {
        String format = "png";

        if (imagePath == null || imagePath.isEmpty()) {
            log.warn("[RESIZE] imagePath es nulo o vacio");
            return format;
        }

        String lowerPath = imagePath.toLowerCase();

        if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg")) {
            format = "jpg";
        } else if (lowerPath.endsWith(".png")) {
            format = "png";
        } else if (lowerPath.endsWith(".gif")) {
            format = "gif";
        } else if (lowerPath.endsWith(".bmp")) {
            format = "bmp";
        } else if (lowerPath.endsWith(".webp")) {
            format = "webp";
        }

        log.debug("[RESIZE] Formato extraido: {} de ruta: {}", format, imagePath);
        return format;
    }
}