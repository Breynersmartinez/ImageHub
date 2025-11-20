package com.example.ImageHub.dto.imgDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageResponse {


    private UUID id;
    private String userName;
    private String imageName;
    private String inputPath;
    private String transformPath;
    private String description;
    private LocalDateTime registrationDate;
    private LocalDateTime dateOfUpdate;
    private boolean hasTransformation;

    public ImageResponse(UUID id, String userName, String imageName,
                            String inputPath, String transformPath,
                            LocalDateTime registrationDate) {
        this.id = id;
        this.userName = userName;
        this.imageName = imageName;
        this.inputPath = inputPath;
        this.transformPath = transformPath;
        this.registrationDate = registrationDate;
        this.hasTransformation = transformPath != null && !transformPath.isEmpty();
    }
}
