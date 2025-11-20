package com.example.ImageHub.service;

import com.example.ImageHub.model.ImageMetadata;
import com.example.ImageHub.repository.ImageMetadataRepository;
import com.example.ImageHub.utils.ImageValidationUtils;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${image.input.path}")
    private String FILE_DIR;

    @Autowired
    private ImageMetadataRepository imageMetadataRepository;

    @Autowired
    private ImageValidationUtils imageValidationUtils;

    public String saveFile(MultipartFile file, String userName)
            throws IOException, IllegalArgumentException {

        log.info("Iniciando guardado de archivo para usuario: {}", userName);

        imageValidationUtils.validate(file);
        UUID uuidImage = UUID.randomUUID();

        Path path = Paths.get(FILE_DIR, userName, uuidImage.toString());
        File uploadDir = new File(path.toUri());

        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            if (!created) {
                throw new IOException("No se pudo crear el directorio: " + path);
            }
            log.info("Directorio creado: {}", path);
        }

        Path filePath = Paths.get(path.toString(), file.getOriginalFilename());

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Archivo guardado en: {}", filePath);
        } catch (IOException e) {
            log.error("Error guardando archivo: {}", e.getMessage());
            throw e;
        }

        LocalDateTime now = LocalDateTime.now();
        ImageMetadata newImage = ImageMetadata.builder()
                .id(uuidImage)
                .imageName(file.getOriginalFilename())
                .inputPath(filePath.toString())
                .userName(userName)
                .registrationDate(now)
                .dateOfUpdate(now)
                .build();

        try {
            imageMetadataRepository.save(newImage);
            log.info("Metadata de imagen guardada en BD: {}", uuidImage);
        } catch (Exception e) {
            log.error("Error guardando metadata: {}", e.getMessage());
            Files.delete(filePath);
            throw new IOException("Error guardando metadata de imagen", e);
        }

        return uuidImage.toString();
    }

    /**
     * Recupera una imagen como Spring Resource.
     * CORREGIDO: Usando FileSystemResource en lugar de UrlResource
     *
     * @param imageId UUID de la imagen
     * @param type    "input" para imagen original o "transform" para imagen transformada
     * @return imagen como Resource
     * @throws IOException si la imagen no se encuentra o hay error en operaciones
     */
    public Resource getFile(String imageId, String type) throws IOException {

        log.info("Obteniendo archivo - ID: {}, Tipo: {}", imageId, type);

        // Validar tipo
        if (!type.equals("input") && !type.equals("transform")) {
            throw new IllegalArgumentException(
                    "Tipo inválido. Use 'input' o 'transform'"
            );
        }

        // Obtener metadata de la imagen
        Optional<ImageMetadata> imgMeta = imageMetadataRepository.findById(UUID.fromString(imageId));

        if (imgMeta.isEmpty()) {
            throw new IOException("ID de imagen no existe: " + imageId);
        }

        // Seleccionar ruta según tipo
        String filePath = null;

        if (type.equals("input")) {
            filePath = imgMeta.get().getInputPath();
        } else if (type.equals("transform")) {
            filePath = imgMeta.get().getTransformPath();

            if (filePath == null || filePath.isEmpty()) {
                throw new IOException(
                        "Imagen transformada no disponible para ID: " + imageId
                );
            }
        }

        // Validar que el archivo existe
        Path path = Paths.get(filePath);

        // CAMBIO PRINCIPAL: FileSystemResource en lugar de UrlResource
        Resource resource = new FileSystemResource(path);

        if (!resource.exists()) {
            log.error("Archivo no encontrado en ruta: {}", filePath);
            throw new IOException("Archivo no presente en sistema de archivos: " + filePath);
        }

        if (!resource.isReadable()) {
            log.error("Archivo no legible: {}", filePath);
            throw new IOException("Archivo no legible: " + filePath);
        }

        log.info("Archivo obtenido exitosamente: {}", filePath);
        return resource;
    }

    /**
     * Obtiene todas las imágenes metadata de un usuario con paginación.
     */
    public Page<ImageMetadata> getAllImageMetadataByUser(String userName, Pageable page)
            throws IOException {

        log.info("Obteniendo imágenes del usuario: {} - Página: {}, Tamaño: {}",
                userName, page.getPageNumber(), page.getPageSize());

        Page<ImageMetadata> imgData = imageMetadataRepository
                .findAllByUserNameOrderByRegistrationDate(userName, page);

        if (imgData.isEmpty()) {
            log.warn("El usuario {} no tiene imágenes", userName);
            throw new IOException("El usuario no tiene imágenes subidas");
        }

        log.info("Se obtuvieron {} imágenes para usuario: {}",
                imgData.getNumberOfElements(), userName);
        return imgData;
    }

    /**
     * Obtiene todas las imágenes de un usuario sin paginación.
     */
    public java.util.List<ImageMetadata> getAllImagesByUser(String userName)
            throws IOException {

        log.info("Obteniendo todas las imágenes del usuario: {}", userName);

        java.util.List<ImageMetadata> images = imageMetadataRepository.findByUserName(userName);

        if (images.isEmpty()) {
            log.warn("El usuario {} no tiene imágenes", userName);
            throw new IOException("El usuario no tiene imágenes subidas");
        }

        log.info("Se obtuvieron {} imágenes para usuario: {}", images.size(), userName);
        return images;
    }

    /**
     * Obtiene imágenes que ya han sido transformadas.
     */
    public java.util.List<ImageMetadata> getTransformedImagesByUser(String userName)
            throws IOException {

        log.info("Obteniendo imágenes transformadas del usuario: {}", userName);

        java.util.List<ImageMetadata> images = imageMetadataRepository
                .findByUserNameAndTransformPathIsNotNull(userName);

        if (images.isEmpty()) {
            log.warn("El usuario {} no tiene imágenes transformadas", userName);
            throw new IOException("El usuario no tiene imágenes transformadas");
        }

        log.info("Se obtuvieron {} imágenes transformadas para usuario: {}",
                images.size(), userName);
        return images;
    }

    /**
     * Obtiene imágenes que NO han sido transformadas.
     */
    public java.util.List<ImageMetadata> getUntransformedImagesByUser(String userName)
            throws IOException {

        log.info("Obteniendo imágenes sin transformar del usuario: {}", userName);

        java.util.List<ImageMetadata> images = imageMetadataRepository
                .findByUserNameAndTransformPathIsNull(userName);

        if (images.isEmpty()) {
            log.warn("El usuario {} no tiene imágenes sin transformar", userName);
            throw new IOException("El usuario no tiene imágenes sin transformar");
        }

        log.info("Se obtuvieron {} imágenes sin transformar para usuario: {}",
                images.size(), userName);
        return images;
    }

    /**
     * Elimina una imagen tanto de disco como de la base de datos.
     */
    @Transactional
    public void deleteImage(String imageId, String userName)
            throws IOException {

        log.info("Eliminando imagen: {} del usuario: {}", imageId, userName);

        Optional<ImageMetadata> imgMeta = imageMetadataRepository
                .findByIdAndUserName(UUID.fromString(imageId), userName);

        if (imgMeta.isEmpty()) {
            throw new IOException(
                    "Imagen no encontrada o no pertenece al usuario"
            );
        }

        ImageMetadata image = imgMeta.get();

        try {
            Path inputPath = Paths.get(image.getInputPath());
            Files.deleteIfExists(inputPath);
            log.info("Archivo original eliminado: {}", inputPath);
        } catch (IOException e) {
            log.error("Error eliminando archivo original: {}", e.getMessage());
        }

        if (image.getTransformPath() != null && !image.getTransformPath().isEmpty()) {
            try {
                Path transformPath = Paths.get(image.getTransformPath());
                Files.deleteIfExists(transformPath);
                log.info("Archivo transformado eliminado: {}", transformPath);
            } catch (IOException e) {
                log.error("Error eliminando archivo transformado: {}", e.getMessage());
            }
        }

        imageMetadataRepository.delete(image);
        log.info("Metadata de imagen eliminada de BD: {}", imageId);
    }

}