# QuickSend 🚀

QuickSend is a modern, fast, and secure file sharing platform that enables instant file and text sharing with simple 6-digit codes. Share files up to 200MB and text up to 2MB with automatic 10-minute expiry.

![QuickSend](https://img.shields.io/badge/QuickSend-File%20Sharing-blueviolet)
![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.1-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **🔐 Secure Transfer**: Safe and secure file and text sharing
- **⚡ Lightning Fast**: Instant upload and download with minimal latency
- **⏱️ Auto Expiry**: Files and text automatically expire after 10 minutes
- **📦 Multiple Files**: Upload up to 20 files at once (automatically zipped)
- **📝 Text Sharing**: Share text content up to 2MB
- **🎯 Simple Codes**: Easy-to-remember 6-digit sharing codes
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🐳 Docker Ready**: Easy deployment with Docker support

## 🛠️ Technology Stack

### Backend
- **Java 17**: Modern Java runtime
- **Spring Boot 4.0.1**: Enterprise-grade application framework
- **Spring Web MVC**: RESTful API development
- **Maven**: Dependency management and build automation

### Frontend
- **HTML5**: Modern semantic markup
- **CSS3**: Custom styling with gradients and animations
- **Vanilla JavaScript**: No framework dependencies, lightweight and fast

## 📁 Project Structure

```
QuickSend/
├── file-sharing-backend/       # Spring Boot backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/file_sharing_backend/
│   │   │   │   ├── controller/     # REST API controllers
│   │   │   │   │   ├── FileController.java
│   │   │   │   │   ├── TextController.java
│   │   │   │   │   └── HomeController.java
│   │   │   │   ├── service/        # Business logic services
│   │   │   │   │   ├── FileService.java
│   │   │   │   │   └── TextService.java
│   │   │   │   ├── model/          # Data models
│   │   │   │   │   ├── FileMeta.java
│   │   │   │   │   └── TextMeta.java
│   │   │   │   └── FileShareApplication.java
│   │   │   └── resources/
│   │   └── test/
│   ├── uploads/                # Temporary file storage
│   ├── Dockerfile             # Docker configuration
│   ├── pom.xml                # Maven configuration
│   └── mvnw                   # Maven wrapper
├── file-sharing-frontend/      # Frontend web application
│   ├── index.html             # Main landing page
│   ├── send.html              # File upload page
│   ├── receive.html           # File download page
│   ├── sendText.html          # Text sharing page
│   ├── receiveText.html       # Text viewing page
│   ├── css/                   # Stylesheets
│   └── js/                    # JavaScript files
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+ (or use the included Maven wrapper)
- A web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohitBytes/QuickSend.git
   cd QuickSend
   ```

2. **Build and run the backend**
   ```bash
   cd file-sharing-backend
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   
   The backend API will start on `http://localhost:8080`

3. **Run the frontend**
   
   Open `file-sharing-frontend/index.html` in your web browser, or use a simple HTTP server:
   
   ```bash
   cd file-sharing-frontend
   # Using Python
   python -m http.server 3000
   # Or using Node.js
   npx http-server -p 3000
   ```
   
   Access the application at `http://localhost:3000`

### Docker Deployment

1. **Build the Docker image**
   ```bash
   cd file-sharing-backend
   docker build -t quicksend-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 8080:8080 quicksend-backend
   ```

3. **Serve the frontend**
   
   You can use any static file server or nginx to serve the frontend files.

## 📖 Usage

### Sending a File

1. Navigate to the application homepage
2. Click on **"Send File"**
3. Select one or more files (up to 20 files, max 200MB total)
4. Click **"Upload"**
5. Share the generated 6-digit code with your recipient

### Receiving a File

1. Navigate to the application homepage
2. Click on **"Receive File"**
3. Enter the 6-digit code
4. Click **"Download"** to retrieve the file

### Sharing Text

1. Navigate to the application homepage
2. Click on **"Send Text"**
3. Enter your text (up to 2MB)
4. Click **"Send"**
5. Share the generated 6-digit code

### Viewing Shared Text

1. Navigate to the application homepage
2. Click on **"Receive Text"**
3. Enter the 6-digit code
4. View the shared text content

## 🔌 API Endpoints

### File Endpoints

#### Upload File(s)
```http
POST /api/upload
Content-Type: multipart/form-data

Parameter: files (one or multiple files)

Response:
{
  "code": "123456",
  "filename": "example.txt",
  "zipped": false,
  "fileCount": 1,
  "message": "File uploaded successfully"
}
```

#### Download File
```http
GET /api/download/{code}

Response: File download (Content-Disposition: attachment)
```

#### Check File Status
```http
GET /api/status/{code}

Response:
{
  "downloaded": false,
  "expired": false,
  "filename": "example.txt"
}
```

### Text Endpoints

#### Send Text
```http
POST /api/text/send
Content-Type: application/json

Body:
{
  "text": "Your text content here"
}

Response:
{
  "code": "123456",
  "message": "Text saved successfully"
}
```

#### Receive Text
```http
GET /api/text/{code}

Response:
{
  "text": "Your text content here",
  "viewed": true
}
```

#### Check Text Status
```http
GET /api/text/status/{code}

Response:
{
  "viewed": false,
  "expired": false
}
```

### General Endpoints

#### API Information
```http
GET /api/

Response:
{
  "message": "File Sharing API",
  "version": "1.0",
  "endpoints": {
    "upload": "POST /api/upload",
    "download": "GET /api/download/{code}"
  }
}
```

## ⚙️ Configuration

### File Size Limits
- **Single File**: Up to 200MB
- **Multiple Files**: Up to 20 files, 200MB total
- **Text Content**: Up to 2MB

### Expiry Time
- Files and text automatically expire after **10 minutes**
- Downloaded/viewed status is tracked

## 🔒 Security Features

- CORS enabled for cross-origin requests
- File size validation
- Automatic cleanup of expired files
- Secure file storage with unique codes
- No permanent storage of user data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**MohitBytes**

- GitHub: [@MohitBytes](https://github.com/MohitBytes)

## 🙏 Acknowledgments

- Built with Spring Boot and modern web technologies
- Inspired by the need for simple, secure file sharing
- Special thanks to the open-source community

---

Made with ❤️ by MohitBytes
