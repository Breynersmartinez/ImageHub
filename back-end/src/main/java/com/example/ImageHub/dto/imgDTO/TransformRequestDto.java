package com.example.ImageHub.dto.imgDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransformRequestDto {



    // Composicion
    private Crop crop;
    private Filters filters;
    private  Resize resize;

    //Atributos
    private String format;
    private Integer rotate;

}
