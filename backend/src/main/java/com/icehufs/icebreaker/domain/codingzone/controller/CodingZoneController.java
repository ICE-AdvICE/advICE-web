package com.icehufs.icebreaker.domain.codingzone.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.icehufs.icebreaker.domain.codingzone.dto.response.AuthorityExistResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneCanceResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneRegisterResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetCodingZoneAssitantListResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetCountOfAttendResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetListOfCodingZoneClassForNotLogInResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetListOfCodingZoneClassResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetPersAttendListItemResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetReservedClassListItemResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/coding-zone") // 코딩존 일반 사용자 API 주소
@RequiredArgsConstructor
public class CodingZoneController {
    private final CodingZoneService codingzoneService;

    @GetMapping("/auth-type") // 사용자의 권한 반환 API
    public ResponseEntity<? super AuthorityExistResponseDto> authExist(
            @AuthenticationPrincipal String email) {
        ResponseEntity<? super AuthorityExistResponseDto> response = codingzoneService.authExist(email);
        return response;
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

    @GetMapping("/class-list/{grade}") // 코딩존 메인 페이지에서 로그인 된 사용자를 위한 수업들 나열 API
    public ResponseEntity<? super GetListOfCodingZoneClassResponseDto> getClassList(
            @PathVariable Integer grade,
            @AuthenticationPrincipal String email) {
        ResponseEntity<? super GetListOfCodingZoneClassResponseDto> response = codingzoneService.getClassList(grade,
                email);
        return response;
    }

    @GetMapping("/class-list/for-not-login/{grade}") // 코딩존 메인 페이지에서 로그인 안된 사용자를 위한 수업들 나열 API
    public ResponseEntity<? super GetListOfCodingZoneClassForNotLogInResponseDto> getClassList2(
            @PathVariable Integer grade) {
        ResponseEntity<? super GetListOfCodingZoneClassForNotLogInResponseDto> response = codingzoneService
                .getClassList2(grade);
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
