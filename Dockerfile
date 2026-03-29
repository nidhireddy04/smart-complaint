# ============================================================
# Root Dockerfile — Single-container deployment
# Builds both frontend and backend, serves everything from one
# container with the backend Spring Boot app proxying the UI.
# ============================================================

# ── Stage 1: Build React Frontend ──
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ── Stage 2: Build Spring Boot Backend ──
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /app

COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

COPY backend/src ./src

# Copy frontend build into Spring Boot static resources
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

RUN mvn clean package -DskipTests -B

# ── Stage 3: Production Runtime ──
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=backend-build /app/target/*.jar app.jar

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8081

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]