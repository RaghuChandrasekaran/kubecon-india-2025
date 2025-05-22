
FROM gradle:7.6.1-jdk17-alpine AS build
WORKDIR /app

# Copy only the files needed for dependency resolution first
COPY build.gradle settings.gradle ./
# Download dependencies - this layer will be cached if the gradle files don't change
RUN gradle dependencies --no-daemon

# Now copy the source code
COPY src ./src
# Build the application
RUN gradle clean build -x test --no-daemon

FROM openjdk:17-alpine
RUN addgroup -S spring && adduser -S spring -G spring
WORKDIR /app
COPY --from=build /app/build/libs/cart-1.0.0.jar app.jar
USER spring:spring
ENTRYPOINT ["java","-jar","/app/app.jar"]