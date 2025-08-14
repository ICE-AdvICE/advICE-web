package com.icehufs.icebreaker.domain.codingzone.controller;


import com.icehufs.icebreaker.domain.codingzone.service.AttendanceService;
import com.icehufs.icebreaker.util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
