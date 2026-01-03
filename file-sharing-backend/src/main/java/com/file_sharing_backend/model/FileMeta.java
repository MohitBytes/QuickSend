package com.file_sharing_backend.model;

public class FileMeta {

    private String fileName;
    private String filePath;
    private long expiryTime;
    private boolean downloaded = false;

    public FileMeta(String fileName, String filePath, long expiryTime) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.expiryTime = expiryTime;
        this.downloaded = false;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public long getExpiryTime() {
        return expiryTime;
    }
    
    public boolean isDownloaded() {
        return downloaded;
    }
    
    public void setDownloaded(boolean downloaded) {
        this.downloaded = downloaded;
    }
}

