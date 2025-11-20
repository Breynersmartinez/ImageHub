package com.example.ImageHub.service;

import com.example.ImageHub.dto.imgDTO.TransformRequestDto;
import com.example.ImageHub.model.ImageMetadata;
import com.example.ImageHub.repository.ImageMetadataRepository;
import com.example.ImageHub.utils.ImageTransform;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Servicio que orquesta las transformaciones de imagenes usando Strategy Pattern
@Service
@Slf4j
public class ImageProcService {

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    @Autowired
    private List<ImageTransform> transform;

    // Maneja las transformaciones de imagen aplicando las estrategias correspondientes
    public String transformImageHandler(String uuidImage, TransformRequestDto transformRequest)
            throws IOException, IllegalArgumentException {

        log.info("Iniciando transformacion de imagen: {}", uuidImage);

        // Validar y obtener metadatos
        Optional<ImageMetadata> imageMeta = imageMetadataRepository.findById(UUID.fromString(uuidImage));
        if (imageMeta.isEmpty()) {
            throw new IllegalArgumentException("ID de imagen invalido: " + uuidImage);
        }

        String inputPath = imageMeta.get().getInputPath();
        File originalFile = new File(inputPath);

        if (!originalFile.exists()) {
            throw new IOException("Ruta de archivo no existe: " + inputPath);
        }

        // Crear copia transformada
        String transformPath = createTransformedCopy(inputPath);
        log.info("Copia transformada creada en: {}", transformPath);

        // Aplicar estrategias segun solicitud
        for (ImageTransform strategy : transform) {
            if (strategy.canHandle(transformRequest)) {
                try {
                    strategy.transform(transformPath, transformRequest);
                    log.info("Estrategia {} aplicada exitosamente", strategy.getClass().getSimpleName());
                } catch (IOException e) {
                    log.error("Error aplicando estrategia {}: {}",
                            strategy.getClass().getSimpleName(), e.getMessage());
                    throw e;
                }
            }
        }

        // IMPORTANTE: Verificar si el archivo cambio de ruta (especialmente con Format)
        String finalTransformPath = getActualImagePath(transformPath, transformRequest);

        if (!finalTransformPath.equals(transformPath)) {
            log.info("Ruta actualizada de {} a {}", transformPath, finalTransformPath);
            transformPath = finalTransformPath;
        }

        // Guardar ruta transformada en BD
        ImageMetadata metadata = imageMeta.get();
        metadata.setTransformPath(transformPath);
        imageMetadataRepository.save(metadata);
        log.info("Transformacion completada. Ruta guardada en BD: {}", transformPath);

        return transformPath;
    }

    // Crea una copia de la imagen original con sufijo _transform
    private String createTransformedCopy(String inputPath) throws IOException {
        BufferedImage originalImage = ImageIO.read(new File(inputPath));
        String[] splitPath = inputPath.split("\\.(?=[^\\.]+$)");
        String transformPath = splitPath[0] + "_transform." + splitPath[1];
        ImageIO.write(originalImage, splitPath[1], new File(transformPath));
        return transformPath;
    }

    // Obtiene la ruta actual del archivo transformado despues de las transformaciones
    // Verifica si el formato cambio (estrategia Format) y retorna la ruta correcta
    private String getActualImagePath(String expectedPath, TransformRequestDto transformRequest) {

        // Si se solicito cambio de formato, verificar si el archivo cambio
        if (transformRequest.getFormat() != null && !transformRequest.getFormat().isEmpty()) {
            String format = transformRequest.getFormat().toLowerCase();

            // Separar ruta base de la extension
            String[] splitPath = expectedPath.split("\\.(?=[^\\.]+$)");

            if (splitPath.length >= 1) {
                String basePath = splitPath[0];

                // Construir la nueva ruta con el nuevo formato
                String newPath = basePath + "." + format;
                File newFile = new File(newPath);

                // Si el archivo con el nuevo formato existe, retornar esa ruta
                if (newFile.exists()) {
                    log.info("Archivo con nuevo formato encontrado: {}", newPath);
                    return newPath;
                }
            }
        }

        // Si no cambio el formato o el archivo no existe, retornar la ruta original
        return expectedPath;
    }
}