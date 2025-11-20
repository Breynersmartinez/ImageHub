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
public class Filter implements ImageTransform {

    @Override
    public void transform(String imagePath, TransformRequestDto request) throws IOException {
        log.info("[FILTER] Iniciando aplicacion de filtro a imagen: {}", imagePath);

        if (request.getFilters() == null) {
            log.error("[FILTER] El objeto filters es nulo");
            throw new IllegalArgumentException("Filters debe estar definido en la solicitud");
        }

        Boolean grayscale = request.getFilters().getGrayscale();
        Boolean sepia = request.getFilters().getSepia();

        // Validar que al menos un filtro este habilitado
        if ((grayscale == null || !grayscale) && (sepia == null || !sepia)) {
            log.error("[FILTER] Ningun filtro esta habilitado");
            throw new IllegalArgumentException("Debe habilitar al menos un filtro (grayscale o sepia)");
        }

        try {
            BufferedImage originalImage = ImageIO.read(new File(imagePath));

            if (originalImage == null) {
                log.error("[FILTER] No se pudo leer la imagen");
                throw new IOException("No se pudo leer la imagen");
            }

            BufferedImage filteredImage = new BufferedImage(
                    originalImage.getWidth(),
                    originalImage.getHeight(),
                    BufferedImage.TYPE_INT_RGB
            );

            // Aplicar el filtro seleccionado
            if (grayscale != null && grayscale) {
                log.info("[FILTER] Aplicando filtro GRAYSCALE");
                applyGrayscale(originalImage, filteredImage);
            } else if (sepia != null && sepia) {
                log.info("[FILTER] Aplicando filtro SEPIA");
                applySepia(originalImage, filteredImage);
            }

            String format = getImageFormat(imagePath);
            ImageIO.write(filteredImage, format, new File(imagePath));

            log.info("[FILTER] Filtro aplicado exitosamente");

        } catch (IOException e) {
            log.error("[FILTER] Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    // Aplicar filtro en escala de grises
    private void applyGrayscale(BufferedImage originalImage, BufferedImage filteredImage) {
        for (int y = 0; y < originalImage.getHeight(); y++) {
            for (int x = 0; x < originalImage.getWidth(); x++) {
                int rgb = originalImage.getRGB(x, y);
                int r = (rgb >> 16) & 0xff;
                int g = (rgb >> 8) & 0xff;
                int b = rgb & 0xff;
                int gray = (r + g + b) / 3;
                int newPixel = (gray << 16) | (gray << 8) | gray;
                filteredImage.setRGB(x, y, newPixel);
            }
        }
    }

    // Aplicar filtro sepia
    private void applySepia(BufferedImage originalImage, BufferedImage filteredImage) {
        for (int y = 0; y < originalImage.getHeight(); y++) {
            for (int x = 0; x < originalImage.getWidth(); x++) {
                int rgb = originalImage.getRGB(x, y);
                int r = (rgb >> 16) & 0xff;
                int g = (rgb >> 8) & 0xff;
                int b = rgb & 0xff;

                // Aplicar formula sepia
                int tr = Math.min(255, (int) (0.393 * r + 0.769 * g + 0.189 * b));
                int tg = Math.min(255, (int) (0.349 * r + 0.686 * g + 0.168 * b));
                int tb = Math.min(255, (int) (0.272 * r + 0.534 * g + 0.131 * b));

                int newPixel = (tr << 16) | (tg << 8) | tb;
                filteredImage.setRGB(x, y, newPixel);
            }
        }
    }

    @Override
    public boolean canHandle(TransformRequestDto request) {
        if (request == null) return false;
        boolean canHandle = request.getFilters() != null;
        if (canHandle) {
            log.debug("[FILTER] Esta estrategia puede manejar esta solicitud");
        }
        return canHandle;
    }

    private String getImageFormat(String imagePath) {
        return imagePath.substring(imagePath.lastIndexOf('.') + 1).toLowerCase();
    }
}