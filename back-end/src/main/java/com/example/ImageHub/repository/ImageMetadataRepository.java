package com.example.ImageHub.repository;

import com.example.ImageHub.model.ImageMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImageMetadataRepository extends JpaRepository<ImageMetadata, UUID> {

    /*
     * Obtiene todas las imagenes de un usuario con paginacion, ordenadas por fecha de registro
     * userName nombre de usuario
     * page parámetros de paginación
     * página de imágenes del usuario
     */
    Page<ImageMetadata> findAllByUserNameOrderByRegistrationDate(String userName, Pageable page);

    /*
     * Obtiene todas las imagenes de un usuario sin paginacion
     *  userName nombre de usuario
     *  lista de imágenes del usuario
     */
    List<ImageMetadata> findByUserName(String userName);

    /*
     * Busca una imagen específica por ID y usuario (para validar pertenencia)
     * id UUID de la imagen
     * userName nombre del usuario propietario
     *  imagen si pertenece al usuario
     */
    Optional<ImageMetadata> findByIdAndUserName(UUID id, String userName);

    /*
     * Obtiene las imgenes que ya han sido transformadas (tienen transformPath)
     * userName nombre de usuario
     *  lista de imagnes transformadas
     */
    List<ImageMetadata> findByUserNameAndTransformPathIsNotNull(String userName);


    /*
     * Obtiene las imágenes que aún no han sido transformadas
     * userName nombre de usuario
     *  lista de imágenes sin transformar
     */
    List<ImageMetadata> findByUserNameAndTransformPathIsNull(String userName);
}
