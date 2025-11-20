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

/**
 * Servicio que orquesta las transformaciones de imágenes usando Strategy Pattern.
 * Recibe múltiples estrategias inyectadas y las aplica según la solicitud.
 */
@Service
@Slf4j
public class ImageProcService {

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    @Autowired
    private List<ImageTransform> transform;

    /**
     * Maneja las transformaciones de imagen aplicando las estrategias correspondientes.
     *
     * @param uuidImage       UUID de la imagen a transformar
     * @param transformRequest solicitud con las transformaciones a aplicar
     * @return ruta del archivo transformado
     * @throws IOException si ocurre error en operaciones de archivo
     * @throws IllegalArgumentException si la imagen no existe
     */
    public String transformImageHandler(String uuidImage, TransformRequestDto transformRequest)
            throws IOException, IllegalArgumentException {

        log.info("Iniciando transformación de imagen: {}", uuidImage);

        // Validar y obtener metadatos
        Optional<ImageMetadata> imageMeta = imageMetadataRepository.findById(UUID.fromString(uuidImage));
        if (imageMeta.isEmpty()) {
            throw new IllegalArgumentException("ID de imagen inválido: " + uuidImage);
        }

        String inputPath = imageMeta.get().getInputPath();
        File originalFile = new File(inputPath);

        if (!originalFile.exists()) {
            throw new IOException("Ruta de archivo no existe: " + inputPath);
        }

        // Crear copia transformada
        String transformPath = createTransformedCopy(inputPath);
        log.info("Copia transformada creada en: {}", transformPath);

        // Aplicar estrategias según solicitud
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

        // Guardar ruta transformada en BD
        ImageMetadata metadata = imageMeta.get();
        metadata.setTransformPath(transformPath);
        imageMetadataRepository.save(metadata);
        log.info("Transformación completada. Ruta guardada en BD: {}", transformPath);

        return transformPath;
    }

    /**
     * Crea una copia de la imagen original con sufijo "_transform"
     */
    private String createTransformedCopy(String inputPath) throws IOException {
        BufferedImage originalImage = ImageIO.read(new File(inputPath));
        String[] splitPath = inputPath.split("\\.(?=[^\\.]+$)");
        String transformPath = splitPath[0] + "_transform." + splitPath[1];
        ImageIO.write(originalImage, splitPath[1], new File(transformPath));
        return transformPath;
    }
}