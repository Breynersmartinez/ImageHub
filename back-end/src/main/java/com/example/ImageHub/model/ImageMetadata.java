package com.example.ImageHub.model;

import com.example.ImageHub.audit.Auditable;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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


}
