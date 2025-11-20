package com.example.ImageHub.config;


import com.example.ImageHub.utils.ImageTransform;
import com.example.ImageHub.utils.impl.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class TransformConfig {

    @Bean
    public List<ImageTransform> transformStrategies(
            Resize resize,
            Crop crop,
            Rotate rotate,
            Filter filter,
            Format format) {

        return Arrays.asList(
                resize,
                crop,
                rotate,
                filter,
                format
        );
    }
}
