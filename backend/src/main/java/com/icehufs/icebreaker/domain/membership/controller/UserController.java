package com.icehufs.icebreaker.domain.membership.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserPassRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.response.GetSignInUserResponseDto;
import com.icehufs.icebreaker.domain.membership.service.UserService;
import com.icehufs.icebreaker.util.ResponseDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/user") //일반 사용자를 위한 URL 주소(회원가입/로그인/이메일 인증/정지 확인)
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("") // 특정 사용자의 정보 반환 API
    public ResponseEntity<ResponseDto<GetSignInUserResponseDto>> getSignInUser(
        @AuthenticationPrincipal String email //확인하고자하는 유저의 토큰 유효성 확인 후 유저의 메일 반환
    ){
        return ResponseEntity.ok(ResponseDto.success(userService.getSignInUser(email)));
    }

    @PatchMapping("") // 개인정보 수정 API
    public ResponseEntity<ResponseDto<String>> patchUser(
        @RequestBody @Valid PatchUserRequestDto requestBody,
        @AuthenticationPrincipal String email
    ){
        return ResponseEntity.ok(ResponseDto.success(userService.patchUserInfo(requestBody, email)));
    }

    @PatchMapping("/password") // 비밀번호 수정 API
    public ResponseEntity<ResponseDto<String>> patchUserPassword(
        @RequestBody @Valid PatchUserPassRequestDto requestDto){
        return ResponseEntity.ok(ResponseDto.success(userService.patchUserPassword(requestDto)));
    }

    @DeleteMapping("") // 회원탈퇴 API
    public ResponseEntity<ResponseDto<String>> deleteUser(
        @AuthenticationPrincipal String email
    ){
        return ResponseEntity.ok(ResponseDto.success(userService.deleteUser(email)));
    }

    @GetMapping("/auth1-exist") // "익명게시판" 운영자 판별 API
    public ResponseEntity<ResponseDto<String>> auth1Exist(
        @AuthenticationPrincipal String email
    ){
        return ResponseEntity.ok(ResponseDto.success(userService.auth1Exist(email)));
    }
}
