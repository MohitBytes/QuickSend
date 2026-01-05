package com.file_sharing_backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.file_sharing_backend.model.TextMeta;

import jakarta.annotation.PostConstruct;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class TextService {

    private final Map<String, TextMeta> store = new ConcurrentHashMap<>();
    
    private final long EXPIRY_MS = 10 * 60 * 1000; 
    private final int MAX_TEXT_SIZE = 2 * 1024 * 1024; 
    private final int MAX_STORED_TEXTS = 1000; 
    private final int MAX_CODE_GENERATION_ATTEMPTS = 10;

    @PostConstruct
    public void init() {
        System.out.println("TextService initialized - Memory protection enabled");
    }

    public String saveText(String text) throws Exception {
        // Validate text
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text cannot be empty");
        }
        
        // Check size limit 
        int sizeInBytes = text.getBytes("UTF-8").length;
        if (sizeInBytes > MAX_TEXT_SIZE) {
            throw new IllegalArgumentException("Text size exceeds maximum limit of 2MB");
        }


        cleanExpiredEntries();
        
        if (store.size() >= MAX_STORED_TEXTS) {
            throw new IllegalStateException("Storage limit reached. Please try again later.");
        }

        String code = generateUniqueCode();
        
        // Store text with expiry time
        store.put(code, new TextMeta(
                text,
                System.currentTimeMillis() + EXPIRY_MS
        ));

        return code;
    }
    
    /**
     * Generate a unique 6-digit code, ensuring no collisions
     */
    private String generateUniqueCode() throws IllegalStateException {
        for (int attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
            String code = String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));
            
            // Check if code already exists
            if (!store.containsKey(code)) {
                return code;
            }
        }
        
        throw new IllegalStateException("Unable to generate unique code. Please try again.");
    }

    public TextMeta getText(String code) {
        // Validate code format
        if (code == null || !code.matches("^\\d{6}$")) {
            return null;
        }
        
        TextMeta meta = store.get(code);
        
        // Auto-delete if expired
        if (meta != null && meta.getExpiryTime() < System.currentTimeMillis()) {
            store.remove(code);
            return null;
        }
        
        return meta;
    }
    
    public void delete(String code) {
        if (code != null && code.matches("^\\d{6}$")) {
            store.remove(code);
        }
    }
    
    /**
     * Clean up expired entries manually
     */
    public void cleanExpiredEntries() {
        long currentTime = System.currentTimeMillis();
        store.entrySet().removeIf(entry -> entry.getValue().getExpiryTime() < currentTime);
    }
    
    
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void scheduledCleanup() {
        int sizeBefore = store.size();
        cleanExpiredEntries();
        int sizeAfter = store.size();
        
        if (sizeBefore != sizeAfter) {
            System.out.println("TextService cleanup: Removed " + (sizeBefore - sizeAfter) + 
                             " expired entries. Current: " + sizeAfter);
        }
    }
    
    /**
     * Get current storage statistics for monitoring
     */
    public Map<String, Object> getStats() {
        return Map.of(
            "totalStored", store.size(),
            "maxCapacity", MAX_STORED_TEXTS,
            "utilizationPercent", (store.size() * 100.0 / MAX_STORED_TEXTS)
        );
    }
}
