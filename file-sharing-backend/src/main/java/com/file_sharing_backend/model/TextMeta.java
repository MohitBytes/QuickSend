package com.file_sharing_backend.model;

public class TextMeta {

    private String content;
    private long expiryTime;
    private boolean viewed = false;

    public TextMeta(String content, long expiryTime) {
        this.content = content;
        this.expiryTime = expiryTime;
        this.viewed = false;
    }

    public String getContent() {
        return content;
    }

    public long getExpiryTime() {
        return expiryTime;
    }
    
    public boolean isViewed() {
        return viewed;
    }
    
    public void setViewed(boolean viewed) {
        this.viewed = viewed;
    }
}
