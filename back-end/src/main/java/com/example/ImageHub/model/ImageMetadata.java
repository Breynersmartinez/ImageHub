package com.example.ImageHub.model;

import com.example.ImageHub.audit.Auditable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "image_data")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageMetadata extends Auditable<ImageMetadata> {
    @Id
    private UUID id;



    @Column(name = "NOMBRE_USUARIO")
    @NotBlank(message = " El campo userName no puede quedar en blanco ")
    private String userName;

    @Column(name = "NOMBRE_IMAGEN")
    @NotBlank(message = " El campo imageName no puede quedar en blanco ")
    private String imageName;


    @Column(name = "RUTA_INGRESADA")
    @NotBlank(message = " El campo inputPath no puede quedar en blanco ")
    private String inputPath;

    @Column(name = "RUTA_DE_TRANSFORMACION")
    private String transformPath;

    @Column(name = "DESCRIPCION")
    private String description;

    @Column(name = "FECHA_REGISTRO")
    private LocalDateTime registrationDate;


    @Column(name = "FECHA_ACTUALIZACION")
    private LocalDateTime dateOfUpdate;


}
