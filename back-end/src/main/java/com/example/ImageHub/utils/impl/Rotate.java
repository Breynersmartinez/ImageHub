package com.example.ImageHub.utils.impl;

import com.example.ImageHub.dto.imgDTO.TransformRequestDto;
import com.example.ImageHub.utils.ImageTransform;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

@Slf4j
@Component
public class Rotate implements ImageTransform {

    @Override
    public void transform(String imagePath, TransformRequestDto request) throws IOException {
        log.info("[ROTATE] Iniciando rotacion de imagen: {}", imagePath);

        if (request.getRotate() == null) {
            log.error("[ROTATE] El valor rotate es nulo");
            throw new IllegalArgumentException("Rotate debe estar definido en la solicitud");
        }

        double angle = request.getRotate();
        log.info("[ROTATE] Angulo de rotacion: {} grados", angle);

        try {
            BufferedImage originalImage = ImageIO.read(new File(imagePath));

            if (originalImage == null) {
                log.error("[ROTATE] No se pudo leer la imagen");
                throw new IOException("No se pudo leer la imagen");
            }

            int width = originalImage.getWidth();
            int height = originalImage.getHeight();
            log.info("[ROTATE] Dimensiones originales: {}x{}", width, height);

            BufferedImage rotatedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = rotatedImage.createGraphics();

            // Configurar opciones de calidad de renderizado
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

            // Rotar desde el centro de la imagen
            double radians = Math.toRadians(angle);
            g2d.rotate(radians, width / 2.0, height / 2.0);
            g2d.drawImage(originalImage, 0, 0, null);
            g2d.dispose();

            String format = getImageFormat(imagePath);
            ImageIO.write(rotatedImage, format, new File(imagePath));

            log.info("[ROTATE] Rotacion completada. Angulo: {} grados", angle);

        } catch (IOException e) {
            log.error("[ROTATE] Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public boolean canHandle(TransformRequestDto request) {
        if (request == null) return false;
        boolean canHandle = request.getRotate() != null;
        if (canHandle) {
            log.debug("[ROTATE] Esta estrategia puede manejar esta solicitud");
        }
        return canHandle;
    }

    private String getImageFormat(String imagePath) {
        return imagePath.substring(imagePath.lastIndexOf('.') + 1).toLowerCase();
    }
}

