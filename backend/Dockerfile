# 1. 빌드 단계 (Gradle로 빌드 실행)
FROM openjdk:17-jdk-slim AS builder

# 2. 타임존 설정
ENV TZ=Asia/Seoul
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. 프로젝트 파일 복사
COPY . .

# 5. Gradle 빌드 실행 (테스트 제외)
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 6. 배포 단계 (최적화된 JDK 포함)
FROM openjdk:17-jdk-slim

# 7. 타임존 설정
ENV TZ=Asia/Seoul
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# JVM에 headless 설정 추가
ENV JAVA_TOOL_OPTIONS="-Djava.awt.headless=true"

# 8. 작업 디렉토리 설정
WORKDIR /app

# 9. 빌드된 JAR 파일을 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 10. .env 파일이 존재할 경우 환경 변수로 로드 (기본적으로 /app/.env 경로 사용)
CMD ["java", "-jar", "app.jar"]