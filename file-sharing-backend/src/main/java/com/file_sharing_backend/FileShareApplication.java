package com.file_sharing_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FileShareApplication {
    public static void main(String[] args) {
        SpringApplication.run(FileShareApplication.class, args);
    }
}

