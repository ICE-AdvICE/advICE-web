package com.icehufs.icebreaker.domain.codingzone.controller;

import com.icehufs.icebreaker.common.ResponseDto;
import com.icehufs.icebreaker.domain.auth.service.AuthorityService;
import com.icehufs.icebreaker.domain.codingzone.dto.response.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/coding-zone") // 코딩존 일반 사용자 API 주소
@RequiredArgsConstructor
public class CodingZoneController {
    private final CodingZoneService codingzoneService;
    private final AuthorityService authorityService;

    @GetMapping("/auth-type") // 사용자의 권한 반환 API
    public ResponseEntity<ResponseDto> authExist(@AuthenticationPrincipal String email) {
        ResponseDto response = authorityService.authExist(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reserve-class/{classNum}") // 수업 예약 API
    public ResponseEntity<? super CodingZoneRegisterResponseDto> classRegist(
            @PathVariable Integer classNum,
            @AuthenticationPrincipal String email) {
        ResponseEntity<? super CodingZoneRegisterResponseDto> response = codingzoneService.classRegist(classNum, email);
        return response;
    }

    // TODO: 추후에 API 경로 변경 바람 cance -> cancel
    @DeleteMapping("/cence-class/{classNum}") // 수업 예약 취소 API
    public ResponseEntity<? super CodingZoneCanceResponseDto> classCancel(
            @PathVariable Integer classNum,
            @AuthenticationPrincipal String email) {
        ResponseEntity<? super CodingZoneCanceResponseDto> response = codingzoneService.classCancel(classNum, email);
        return response;
    }

    @GetMapping("/count-of-attend/{grade}") // 출석한 횟수 반환 API
    public ResponseEntity<? super GetCountOfAttendResponseDto> getCountAttend(
            @PathVariable Integer grade,
            @AuthenticationPrincipal String email) {
        ResponseEntity<? super GetCountOfAttendResponseDto> response = codingzoneService.getAttend(grade, email);
        return response;
    }

    @GetMapping("/attend-list") // 예약/출석/결석한 모든 수업을 반환 API
    public ResponseEntity<? super GetPersAttendListItemResponseDto> getPerAttendList(
            @AuthenticationPrincipal String email) {
        ResponseEntity<? super GetPersAttendListItemResponseDto> response = codingzoneService.getPerAttendList(email);
        return response;
    }

    @GetMapping("/reserved-list/{classDate}") // 특정 날짜에 예약한 모든 학생 정보 반환 API
    public ResponseEntity<? super GetReservedClassListItemResponseDto> getReservedList(
            @PathVariable String classDate,
            @AuthenticationPrincipal String email) {
        ResponseEntity<? super GetReservedClassListItemResponseDto> response = codingzoneService
                .getReservedClass(classDate, email);
        return response;
    }

    @GetMapping("/assistant-list") // 모든 코딩존 조교 정보 반환 API
    public ResponseEntity<? super GetCodingZoneAssitantListResponseDto> getAssistantList() {
        ResponseEntity<? super GetCodingZoneAssitantListResponseDto> response = codingzoneService.getAssistantList();
        return response;
    }
}
