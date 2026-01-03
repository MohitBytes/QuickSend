package com.file_sharing_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin("*")
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<?> home() {
        return ResponseEntity.ok(Map.of(
            "message", "File Sharing API",
            "version", "1.0",
            "status", "running",
            "endpoints", Map.of(
                "upload", "POST /api/upload",
                "download", "GET /api/download/{code}",
                "api_info", "GET /api/"
            )
        ));
    }
}
