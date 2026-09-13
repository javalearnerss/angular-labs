
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY libs/book-gallery-server-0.0.1-SNAPSHOT.jar ./book-gallery-server.jar

EXPOSE 9030

ENTRYPOINT ["java", "-jar", "book-gallery-server.jar"]