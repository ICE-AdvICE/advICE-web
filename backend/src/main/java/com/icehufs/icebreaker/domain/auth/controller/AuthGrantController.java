package com.icehufs.icebreaker.domain.auth.controller;

import com.icehufs.icebreaker.domain.codingzone.dto.request.HandleAuthRequestDto;
import com.icehufs.icebreaker.domain.auth.service.GiveAuthService;
import com.icehufs.icebreaker.util.ResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AuthGrantController {
    private final GiveAuthService giveAuthService;

    @PatchMapping("/authority")
    public ResponseEntity<ResponseDto<String>> giveAuth(
            @RequestBody @Valid HandleAuthRequestDto requestBody,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(ResponseDto.success(giveAuthService.giveAuth(email, requestBody)));
    }

    @PatchMapping("/authority/deprivation")
    public ResponseEntity<ResponseDto<String>> depriveAuth(
            @RequestBody @Valid HandleAuthRequestDto requestBody,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(ResponseDto.success(giveAuthService.depriveAuth(email, requestBody)));
    }
}
