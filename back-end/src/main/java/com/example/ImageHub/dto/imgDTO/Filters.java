package com.example.ImageHub.dto.imgDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Filters {
    private Boolean sepia;
    private Boolean grayscale;
}
