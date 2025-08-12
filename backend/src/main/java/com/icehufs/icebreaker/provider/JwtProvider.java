package com.icehufs.icebreaker.provider;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;
import com.icehufs.icebreaker.domain.auth.dto.object.JwtToken;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtProvider {

    private Key key;

    public JwtProvider() {
        // 256비트 이상의 강력한 키를 생성
        this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }

    public JwtToken create(String email) {

        Date expiredDate = Date.from(Instant.now().plus(1, ChronoUnit.HOURS));

        String accessToken = Jwts.builder()
                .signWith(key)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(expiredDate)
                .compact();

        String refreshToken = UUID.randomUUID().toString();

        return new JwtToken(accessToken, refreshToken);
    }

    public String validate(String jwt) {

        String claims = null;

        try {
            claims = Jwts.parserBuilder()
                    .setSigningKey(key) //토큰 서명을 검증을 위해 키 설정
                    .build()
                    .parseClaimsJws(jwt) //JWT의 만료 시간을 확인
                    .getBody()
                    .getSubject();
        } catch (Exception exception) {
            exception.printStackTrace();
            return null;
        }

        return claims;
    }

    

    public String extractEmail(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
            return claims.getSubject();
        } catch (ExpiredJwtException e) {
            return e.getClaims().getSubject(); // rerfresh 토큰을 위해 만료된 경우에도 email 반환
        }
    }
}
