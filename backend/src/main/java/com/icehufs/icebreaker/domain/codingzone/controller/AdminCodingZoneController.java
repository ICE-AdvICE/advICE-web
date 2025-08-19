package com.icehufs.icebreaker.domain.codingzone.controller;


import com.icehufs.icebreaker.domain.codingzone.dto.response.RegisterInfoResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.AttendanceService;
import com.icehufs.icebreaker.util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admins") // 코딩존 일반 사용자 API 주소
@RequiredArgsConstructor
public class AdminCodingZoneController {
    private final AttendanceService attendanceService;

    @PatchMapping("attendances/{registNum}")
    public ResponseEntity<ResponseDto<Integer>> patchAttendance(@PathVariable Integer registNum, @AuthenticationPrincipal String email) {
        Integer attendanceStatus = attendanceService.updateAttendanceStatus(registNum, email);
        return ResponseEntity.ok(ResponseDto.success("출/결석 처리 성공", attendanceStatus));
    }

    @GetMapping("codingzones")
    public ResponseEntity<ResponseDto<List<RegisterInfoResponseDto>>> getReservationDetailsByDate (@RequestParam String date, @AuthenticationPrincipal String email) {
        List<RegisterInfoResponseDto> reservationStudentsByDate = attendanceService.getReservationStudentsByDate(email, date);
        return ResponseEntity.ok(ResponseDto.success("특정 교과목 조교의 특정 날짜 코딩존 예약 학생 리스트 조회 성공.",reservationStudentsByDate));
    }
}
