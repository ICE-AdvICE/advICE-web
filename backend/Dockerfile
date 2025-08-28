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

# 6. 배포 단계
FROM openjdk:17-jdk-slim

# 7. 타임존 설정
ENV TZ=Asia/Seoul
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# JVM에 headless 설정 추가
ENV JAVA_TOOL_OPTIONS="-Djava.awt.headless=true"

# 폰트 관련 라이브러리 설치
RUN apt-get update && apt-get install -y \
    libfreetype6 \
    libxrender1 \
    libxext6 \
    libfontconfig1 \
 && rm -rf /var/lib/apt/lists/*

# 8. 작업 디렉토리 설정
WORKDIR /app

# 9. 빌드된 JAR 복사
COPY --from=builder /app/build/libs/*.jar app.jar

# 10. 실행
CMD ["java", "-jar", "app.jar"]