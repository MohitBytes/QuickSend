FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy Maven wrapper files
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Fix permission issue
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Copy the jar to a fixed name
RUN cp target/*.jar app.jar

EXPOSE 8080

# Run the app
CMD ["java", "-jar", "app.jar"]