package com.icehufs.icebreaker.filter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.provider.JwtProvider;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter{ 
    //JwtAuthenticationFilter가 conroller에 가기전 단계로 여기서 jwt의 검증이 되고, 검증된 jwt의학번과 권한을 나머지 request정보와 같이 Context에 저장해서 controller에게 넘겨줌

    private final JwtProvider jwtProvider;
    private final AuthorityRepository authorityRepository;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        try {
            String token = parseBearerToken(request);
            if (token == null || token.isEmpty()) {
                // 토큰이 없으면 검증하지 않고 다음 필터로 넘김
                filterChain.doFilter(request, response);
                return;
            }

            String requestURI = request.getRequestURI();
            boolean isRefreshTokenRequest = "/api/v1/auth/refresh".equals(requestURI);

            String email = jwtProvider.extractEmail(token);
            boolean isValid = jwtProvider.validate(token) != null;
            if (isValid) {
                // Access Token이 유효한 경우 기존 로직 유지 (권한 저장)
                List<GrantedAuthority> authorities = new ArrayList<>();
                Authority authority = authorityRepository.findByEmail(email);

                authorities.add(new SimpleGrantedAuthority("ROLE_USER")); // 기본 사용자 권한 부여

                if (!"NULL".equals(authority.getRoleAdmin1())) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN1")); // 익명게시판 운영자 권한 부여
                }
                if (!"NULL".equals(authority.getRoleAdminC1())) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMINC1"));// 코딩존 과목1 조교 권한 부여
                }
                if (!"NULL".equals(authority.getRoleAdminC2())) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMINC2"));// 코딩존 과목2 조교 권한 부여
                }
                if (!"NULL".equals(authority.getRoleAdminC3())) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMINC3"));// 코딩존 과목3 조교 권한 부여
                }
                if (!"NULL".equals(authority.getRoleAdminC4())) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMINC4"));// 코딩존 과목4 조교 권한 부여
                }
                if (!"NULL".equals(authority.getRoleAdmin())) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));// 'ICEbreaker' 코딩존 수업 등록 및 권한 부여 가능한 권한(과사조교) 부여
                }

                AbstractAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(email, null, authorities); // Context를 생성하기 위해 authenticationToken에 이메일, 비밀번호(없음), 권한을 매개변수로 전달
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request)); // authenticationToken에 request의 상세 정보 추가

                SecurityContext securityContext = SecurityContextHolder.createEmptyContext(); // Context 선언
                securityContext.setAuthentication(authenticationToken); // securityContext를 초기화

                SecurityContextHolder.setContext(securityContext); // Context를 외부에서 사용할 수 있도록 설정

            } else if (isRefreshTokenRequest) {
                // Refresh Token API 요청이면 만료된 Access Token에서도 email 저장
                AbstractAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(email, null, List.of()); // 권한 없이 email만 SecurityContext에 저장
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
                securityContext.setAuthentication(authenticationToken);
                SecurityContextHolder.setContext(securityContext);
            } else {
                // 다른 API 요청에서는 401 반환
                setJsonResponse(response, HttpServletResponse.SC_UNAUTHORIZED, ResponseCode.ACCESS_TOKEN_EXPIRED, "Access Token expired.");
                return;
            }
        } catch (Exception exception) {
            exception.printStackTrace();
        }
        filterChain.doFilter(request, response);
    }

    private void setJsonResponse(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(String.format("{\"code\":\"%s\", \"message\":\"%s\"}", code, message));
    }

    private String parseBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
    
}
