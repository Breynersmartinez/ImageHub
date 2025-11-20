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
public class Crop implements ImageTransform {

    @Override
    public void transform(String imagePath, TransformRequestDto request) throws IOException {
        log.info("[CROP] Iniciando recorte de imagen: {}", imagePath);

        if (request.getCrop() == null) {
            log.error("[CROP] El objeto crop es nulo");
            throw new IllegalArgumentException("Crop debe estar definido en la solicitud");
        }

        Integer x = request.getCrop().getX();
        Integer y = request.getCrop().getY();
        Integer width = request.getCrop().getWidth();
        Integer height = request.getCrop().getHeight();

        // Validar que los valores no sean nulos
        if (x == null || y == null || width == null || height == null) {
            log.error("[CROP] Valores nulos. X: {}, Y: {}, Width: {}, Height: {}", x, y, width, height);
            throw new IllegalArgumentException("X, Y, Width y Height no pueden ser nulos");
        }

        // Validar que las dimensiones sean mayores a cero
        if (width <= 0 || height <= 0) {
            log.error("[CROP] Dimensiones invalidas. Width: {}, Height: {}", width, height);
            throw new IllegalArgumentException("Width y Height deben ser mayores a 0");
        }

        try {
            BufferedImage originalImage = ImageIO.read(new File(imagePath));

            if (originalImage == null) {
                log.error("[CROP] No se pudo leer la imagen");
                throw new IOException("No se pudo leer la imagen");
            }

            int imgWidth = originalImage.getWidth();
            int imgHeight = originalImage.getHeight();

            log.info("[CROP] Dimensiones originales: {}x{}", imgWidth, imgHeight);
            log.info("[CROP] Recorte solicitado: posicion ({}, {}), tamano {}x{}", x, y, width, height);

            // Validar que el rectangulo de recorte este dentro de los limites de la imagen
            if ((x + width) > imgWidth || (y + height) > imgHeight) {
                log.error("[CROP] El rectangulo de corte excede los limites de la imagen");
                throw new IllegalArgumentException("El rectangulo de corte excede los limites de la imagen");
            }

            // Validar que X e Y no sean negativos
            if (x < 0 || y < 0) {
                log.error("[CROP] X e Y no pueden ser negativos");
                throw new IllegalArgumentException("X e Y no pueden ser negativos");
            }

            BufferedImage croppedImage = originalImage.getSubimage(x, y, width, height);
            String format = getImageFormat(imagePath);

            ImageIO.write(croppedImage, format, new File(imagePath));
            log.info("[CROP] Recorte completado. Nuevas dimensiones: {}x{}", width, height);

        } catch (IOException e) {
            log.error("[CROP] Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public boolean canHandle(TransformRequestDto request) {
        if (request == null) return false;
        boolean canHandle = request.getCrop() != null;
        if (canHandle) {
            log.debug("[CROP] Esta estrategia puede manejar esta solicitud");
        }
        return canHandle;
    }

    private String getImageFormat(String imagePath) {
        return imagePath.substring(imagePath.lastIndexOf('.') + 1).toLowerCase();
    }
}