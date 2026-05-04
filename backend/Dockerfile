# ---- Build stage ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Cache dependencies first
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline || true

# Copy sources and build
COPY src src
RUN ./mvnw -B -ntp clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Render provides $PORT; default to 8080 locally
ENV PORT=8080
EXPOSE 8080

COPY --from=build /app/target/*.jar app.jar

# Persistent uploads dir (mount a Render disk here if you want persistence)
RUN mkdir -p /app/uploads
ENV APP_UPLOAD_DIR=/app/uploads

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -Dapp.upload.dir=${APP_UPLOAD_DIR} -jar app.jar"]
