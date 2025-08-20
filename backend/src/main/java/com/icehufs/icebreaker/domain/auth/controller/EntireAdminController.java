package com.icehufs.icebreaker.domain.auth.controller;


import com.icehufs.icebreaker.domain.codingzone.service.AttendanceService;
import com.icehufs.icebreaker.domain.codingzone.dto.response.SubjectMappingInfoResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ReservationStudentDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.EntireAttendanceResponseDto;
import com.icehufs.icebreaker.util.ResponseDto;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.icehufs.icebreaker.domain.codingzone.dto.object.SubjectAttendanceListItem;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneService;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/admin") // 'ICEbreaker' 코딩존 수업 등록 및 권한 부여 가능한 권한(과사조교) API 주소
@RequiredArgsConstructor
public class EntireAdminController {

    private final CodingZoneService codingzoneService;
    private final AttendanceService attendanceService;

    @GetMapping("/codingzones")
    public ResponseEntity<ResponseDto<SubjectMappingInfoResponseDto>> getCodingZonesByDate(@RequestParam("date") String date) {

        SubjectMappingInfoResponseDto subjectIdNameMap = codingzoneService.getClassNamesWithSubjectIdsByDate(date);
        return ResponseEntity.ok(ResponseDto.success("특정 날짜에 이루어진 코딩존 교과목 리스트 조회 성공.", subjectIdNameMap));
    }

    @GetMapping("/attendances/{classNum}")
    public ResponseEntity<ResponseDto<List<ReservationStudentDto>>> getReservationStudents(
            @PathVariable Integer classNum
    ) {
        List<ReservationStudentDto> studentList = attendanceService.getReservationStudentsByClassNum(classNum);
        return ResponseEntity.ok(ResponseDto.success("특정 일에 특정 조교의 코딩존에 참여한 학생 리스트 조회 성공.", studentList));
    }

    @GetMapping("/entire-attendance/{subjectId}/export")
    public ResponseEntity<Resource> getEntireAttendanceExcelFile(@PathVariable Integer subjectId) {
        ByteArrayResource excelFile = attendanceService.getEntireAttendanceExcelFile(subjectId);
        String filename = "codingzone" + subjectId + "_entire_attendance.xlsx";

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(excelFile);
    }

    @GetMapping("/entire-attendance/{subjectId}")
    public ResponseEntity<ResponseDto<EntireAttendanceResponseDto>> getEntireAttendanceList(
            @PathVariable Integer subjectId
    ) {
        List<SubjectAttendanceListItem> studentList = attendanceService.getEntireAttendanceList(subjectId);
        EntireAttendanceResponseDto response = new EntireAttendanceResponseDto(studentList);
        return ResponseEntity.ok(
                ResponseDto.success("모든 수강생들의 출/결 정보 조회 성공.", response)
        );  
    }
}
