package com.file_sharing_backend.controller;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.file_sharing_backend.model.FileMeta;
import com.file_sharing_backend.service.FileService;

import java.io.File;
import java.io.FileInputStream;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping("/")
    public ResponseEntity<?> home() {
        return ResponseEntity.ok(Map.of(
            "message", "File Sharing API",
            "version", "1.0",
            "endpoints", Map.of(
                "upload", "POST /api/upload",
                "download", "GET /api/download/{code}"
            )
        ));
    }

    @GetMapping("/upload")
    public ResponseEntity<?> uploadInfo() {
        return ResponseEntity.ok(Map.of(
            "message", "This endpoint requires a POST request with a file",
            "method", "POST",
            "endpoint", "/api/upload",
            "parameter", "file (multipart/form-data)",
            "usage", "Use the Send File page in the frontend to upload files"
        ));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            
            String code = fileService.saveFile(file);
            return ResponseEntity.ok(Map.of(
                "code", code,
                "filename", file.getOriginalFilename(),
                "message", "File uploaded successfully"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{code}")
    public ResponseEntity<?> download(@PathVariable String code) throws Exception {

        FileMeta meta = fileService.getFile(code);

        if (meta == null || meta.getExpiryTime() < System.currentTimeMillis()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Invalid or expired code");
        }

        File file = new File(meta.getFilePath());
        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + meta.getFileName() + "\"")
                .contentLength(file.length())
                .body(resource);
    }
}

