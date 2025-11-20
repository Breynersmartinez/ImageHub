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
public class Format implements ImageTransform {

    private static final String[] SUPPORTED_FORMATS = {"jpg", "jpeg", "png", "gif", "bmp", "webp"};

    @Override
    public void transform(String imagePath, TransformRequestDto request) throws IOException {
        log.info("[FORMAT] Iniciando conversion de formato de imagen: {}", imagePath);

        if (request.getFormat() == null || request.getFormat().isEmpty()) {
            log.error("[FORMAT] El formato es nulo o vacio");
            throw new IllegalArgumentException("Format debe estar definido en la solicitud");
        }

        String newFormat = request.getFormat().toLowerCase();
        log.info("[FORMAT] Nuevo formato solicitado: {}", newFormat);

        // Validar que el formato sea soportado
        if (!isSupportedFormat(newFormat)) {
            log.error("[FORMAT] Formato no soportado: {}. Soportados: jpg, png, gif, bmp, webp", newFormat);
            throw new IllegalArgumentException("Formato no soportado: " + newFormat);
        }

        try {
            BufferedImage originalImage = ImageIO.read(new File(imagePath));

            if (originalImage == null) {
                log.error("[FORMAT] No se pudo leer la imagen");
                throw new IOException("No se pudo leer la imagen");
            }

            // Separar ruta y extension actual
            String[] splitPath = imagePath.split("\\.(?=[^\\.]+$)");

            if (splitPath.length < 2) {
                log.error("[FORMAT] Ruta de archivo invalida: {}", imagePath);
                throw new IOException("Ruta de archivo invalida");
            }

            String basePath = splitPath[0];
            String oldFormat = splitPath[1].toLowerCase();

            log.info("[FORMAT] Formato actual: {}", oldFormat);
            log.info("[FORMAT] Ruta base: {}", basePath);

            // Si el formato es el mismo, no hacer nada
            if (oldFormat.equals(newFormat)) {
                log.info("[FORMAT] El formato ya es {}, no hay cambios necesarios", newFormat);
                return;
            }

            // Crear nueva ruta con el nuevo formato
            String newPath = basePath + "." + newFormat;
            log.info("[FORMAT] Nueva ruta: {}", newPath);

            // Guardar la imagen en el nuevo formato
            boolean written = ImageIO.write(originalImage, newFormat, new File(newPath));

            if (!written) {
                log.error("[FORMAT] No se pudo escribir la imagen en formato {}", newFormat);
                throw new IOException("No se pudo guardar la imagen en formato: " + newFormat);
            }

            log.info("[FORMAT] Archivo nuevo creado correctamente");

            // Eliminar archivo antiguo
            File oldFile = new File(imagePath);
            if (oldFile.exists()) {
                boolean deleted = oldFile.delete();
                if (deleted) {
                    log.info("[FORMAT] Archivo antiguo eliminado: {}", imagePath);
                } else {
                    log.warn("[FORMAT] No se pudo eliminar archivo antiguo: {}", imagePath);
                }
            }

            log.info("[FORMAT] Conversion completada. De {} a {}", oldFormat, newFormat);

        } catch (IOException e) {
            log.error("[FORMAT] Error: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public boolean canHandle(TransformRequestDto request) {
        if (request == null) return false;
        boolean canHandle = request.getFormat() != null && !request.getFormat().isEmpty();
        if (canHandle) {
            log.debug("[FORMAT] Esta estrategia puede manejar esta solicitud");
        }
        return canHandle;
    }

    // Validar que el formato sea soportado por la aplicacion
    private boolean isSupportedFormat(String format) {
        for (String supported : SUPPORTED_FORMATS) {
            if (supported.equals(format.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
}