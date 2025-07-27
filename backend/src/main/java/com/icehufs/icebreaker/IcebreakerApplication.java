package com.icehufs.icebreaker;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class IcebreakerApplication {	
    public static void main( String[] args) {
        // .env 파일 로드
        Dotenv dotenv = Dotenv.configure()
            .directory("/app") // 로칼에서 실행할때 "backend/"로 수정 -> 작업후 다시 "/app"로 돌려놓기
            .ignoreIfMissing() // 파일이 없으면 무시
            .load();

        // 환경 변수를 시스템 프로퍼티로 설정
        if (dotenv != null) {
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
        }

        SpringApplication.run(IcebreakerApplication.class, args);
    }	
}