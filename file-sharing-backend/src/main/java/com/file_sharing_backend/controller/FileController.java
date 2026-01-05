package com.file_sharing_backend.controller;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.file_sharing_backend.model.FileMeta;
import com.file_sharing_backend.service.FileService;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

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
            "message", "This endpoint requires a POST request with one or more files",
            "method", "POST",
            "endpoint", "/api/upload",
            "parameter", "files (multipart/form-data)",
            "limits", Map.of(
                "maxFiles", 20,
                "maxTotalSize", "200MB"
            ),
            "usage", "Use the Send File page in the frontend to upload files. Multiple files will be automatically zipped."
        ));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@RequestParam("files") MultipartFile[] files) {
        try {
            // Validate file count
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "No files uploaded"));
            }
            
            if (files.length > 20) {
                return ResponseEntity.badRequest().body(Map.of("error", "Maximum 20 files allowed"));
            }
            
            long totalSize = 0;
            for (MultipartFile file : files) {
                totalSize += file.getSize();
            }
            long maxSize = 200L * 1024 * 1024; // 200MB
            if (totalSize > maxSize) {
                return ResponseEntity.badRequest().body(Map.of("error", "Total file size exceeds 200MB"));
            }
            
            if (files.length == 1) {
                MultipartFile file = files[0];
                if (file.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
                }
                
                String code = fileService.saveFile(file);
                return ResponseEntity.ok(Map.of(
                    "code", code,
                    "filename", file.getOriginalFilename(),
                    "zipped", false,
                    "fileCount", 1,
                    "message", "File uploaded successfully"
                ));
            }
            
            String code = fileService.saveMultipleFilesAsZip(files);
            return ResponseEntity.ok(Map.of(
                "code", code,
                "filename", "files.zip",
                "zipped", true,
                "fileCount", files.length,
                "message", "Files uploaded and zipped successfully"
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

        // Detect content type
        String contentType = Files.probeContentType(file.toPath());
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        meta.setDownloaded(true);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + meta.getFileName() + "\"")
                .contentLength(file.length())
                .body(resource);
    }
    
    @GetMapping("/status/{code}")
    public ResponseEntity<?> status(@PathVariable String code) {
        FileMeta meta = fileService.getFile(code);
        
        if (meta == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "File not found"));
        }
        
        boolean isExpired = meta.getExpiryTime() < System.currentTimeMillis();
        
        return ResponseEntity.ok(Map.of(
            "downloaded", meta.isDownloaded(),
            "expired", isExpired,
            "filename", meta.getFileName()
        ));
    }
}

