package com.file_sharing_backend.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.file_sharing_backend.model.TextMeta;
import com.file_sharing_backend.service.TextService;

import java.util.Map;

@RestController
@RequestMapping("/api/text")
@CrossOrigin("*")
public class TextController {

    private final TextService textService;

    public TextController(TextService textService) {
        this.textService = textService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendText(@RequestBody Map<String, String> payload) {
        try {
            String text = payload.get("text");
            
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Text cannot be empty"));
            }

            String code = textService.saveText(text);
            
            return ResponseEntity.ok(Map.of(
                "code", code,
                "message", "Text saved successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to save text: " + e.getMessage()));
        }
    }

    @GetMapping("/{code}")
    public ResponseEntity<?> getText(@PathVariable String code) {

        if (code == null || !code.matches("^\\d{6}$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid code format. Code must be 6 digits."));
        }
        
        TextMeta meta = textService.getText(code);

        if (meta == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Invalid or expired code"));
        }

        meta.setViewed(true);

        return ResponseEntity.ok(Map.of(
            "text", meta.getContent(),
            "viewed", meta.isViewed()
        ));
    }

    @GetMapping("/status/{code}")
    public ResponseEntity<?> getStatus(@PathVariable String code) {
        // Validate code format
        if (code == null || !code.matches("^\\d{6}$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Invalid code format. Code must be 6 digits."));
        }
        
        TextMeta meta = textService.getText(code);
        
        if (meta == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Text not found or expired"));
        }
        
        return ResponseEntity.ok(Map.of(
            "viewed", meta.isViewed(),
            "expired", false
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(textService.getStats());
    }
}
