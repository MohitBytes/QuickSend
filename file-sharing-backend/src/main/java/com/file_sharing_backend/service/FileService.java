package com.file_sharing_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.file_sharing_backend.model.FileMeta;

import jakarta.annotation.PostConstruct;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class FileService {

    private final Map<String, FileMeta> store = new ConcurrentHashMap<>();
    
    @Value("${file.upload-dir:./uploads}")
    private String UPLOAD_DIR;
    
    private final long EXPIRY_MS = 10 * 60 * 1000; 
    
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            System.out.println("Upload directory created/verified at: " + Paths.get(UPLOAD_DIR).toAbsolutePath());
        } catch (Exception e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    public String saveFile(MultipartFile file) throws Exception {

        String code = String.format("%06d", new Random().nextInt(999999));
        
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath();
        Files.createDirectories(uploadPath);

        Path path = uploadPath.resolve(code + "_" + file.getOriginalFilename());
        file.transferTo(path.toFile());

        store.put(code, new FileMeta(
                file.getOriginalFilename(),
                path.toString(),
                System.currentTimeMillis() + EXPIRY_MS
        ));

        return code;
    }

    public FileMeta getFile(String code) {
        return store.get(code);
    }

    public String saveMultipleFilesAsZip(MultipartFile[] files) throws Exception {
        String code = String.format("%06d", new Random().nextInt(999999));
        
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath();
        Files.createDirectories(uploadPath);

        String zipFileName = code + "_files.zip";
        Path zipPath = uploadPath.resolve(zipFileName);
        
        try (FileOutputStream fos = new FileOutputStream(zipPath.toFile());
             ZipOutputStream zos = new ZipOutputStream(fos)) {
            
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    ZipEntry zipEntry = new ZipEntry(file.getOriginalFilename());
                    zos.putNextEntry(zipEntry);
                    zos.write(file.getBytes());
                    zos.closeEntry();
                }
            }
        }

        store.put(code, new FileMeta(
                "files.zip",
                zipPath.toString(),
                System.currentTimeMillis() + EXPIRY_MS
        ));

        return code;
    }

    public void delete(String code) {
        FileMeta meta = store.get(code);
        if (meta != null) {
            new File(meta.getFilePath()).delete();
            store.remove(code);
        }
    }
}
