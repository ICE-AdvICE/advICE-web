package com.icehufs.icebreaker.domain.auth.controller;

import com.icehufs.icebreaker.domain.codingzone.dto.response.*;
import com.icehufs.icebreaker.util.ResponseDto;
import jakarta.validation.Valid;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PatchGroupInfRequestDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneService;

import java.io.IOException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/admin") // 'ICEbreaker' 코딩존 수업 등록 및 권한 부여 가능한 권한(과사조교) API 주소
@RequiredArgsConstructor
public class EntireAdminController {

    private final CodingZoneService codingzoneService;

    @PostMapping("/upload-group") //특정 (A/B)조 정보 등록 API
    public ResponseEntity<? super GroupInfUpdateResponseDto> uploadInf(
        @RequestBody @Valid List<GroupInfUpdateRequestDto> requestBody,
        @AuthenticationPrincipal String email
    ) {
        ResponseEntity<? super GroupInfUpdateResponseDto> response = codingzoneService.uploadInf(requestBody, email);
        return response;
    }

    @GetMapping("/get-group/{groupId}") //특정 (A/B)조 정보 반환 API
    public ResponseEntity<? super GetListOfGroupInfResponseDto> getList(
        @PathVariable String groupId,
        @AuthenticationPrincipal String email
    ) {
        ResponseEntity<? super GetListOfGroupInfResponseDto> response = codingzoneService.getList(groupId, email);
        return response;
    }

    @PatchMapping("/patch-group") //특정 (A/B)조 정보 수정 API
    public ResponseEntity<? super GroupInfUpdateResponseDto> patchInf(
        @RequestBody @Valid List<PatchGroupInfRequestDto> requestBody,
        @AuthenticationPrincipal String email
    ) {
        ResponseEntity<? super GroupInfUpdateResponseDto> response = codingzoneService.patchInf(requestBody, email);
        return response;
    }

    @GetMapping("/student-list") // 해당학기에 출/결한 모든 학생을 리스트로 반환 API
    public ResponseEntity<? super GetCodingZoneStudentListResponseDto> getStudentList(
        @AuthenticationPrincipal String email
    ) {
        ResponseEntity<? super GetCodingZoneStudentListResponseDto> response = codingzoneService.getStudentList(email);
        return response;
    }

    @DeleteMapping("/delete-allinf") // 코딩존 관련 모든 정보 초기화(코딩존 조교 권한 박할까지) API
    public ResponseEntity<ResponseDto<String>> deleteAll(
        @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(ResponseDto.success(codingzoneService.deleteAll(email)));
    }

    @GetMapping("/subjects/{subjectId}/assistants")
    public ResponseEntity<ResponseDto<AssistantNamesResponseDto>> getAssistantsBySubject(
            @PathVariable Long subjectId
    ) {
        AssistantNamesResponseDto assistantList = codingzoneService.getAssistantNamesBySubjectId(subjectId);
        return ResponseEntity.ok(ResponseDto.success("특정 교과목에 해당하는 조교 리스트 조회 성공.", assistantList));
    }

    @GetMapping("/codingzones")
    public ResponseEntity<ResponseDto<CodingZoneClassNamesResponseDto>> getCodingZonesByDate(@RequestParam("date") String date) {

        CodingZoneClassNamesResponseDto classNames  = codingzoneService.getCodingZoneClassNamesByDate(date);
        return ResponseEntity.ok(ResponseDto.success("특정 날짜에 이루어진 코딩존 교과목 리스트 조회 성공.", classNames));
    }

    @GetMapping("/excel/attendance/grade1")
    public ResponseEntity<?> downloadArticleExcel() {
        try {
            ByteArrayResource excelFile = codingzoneService.generateAttendanceExcelOfGrade1();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=CodingZone1.xlsx") // 클라이언트가 이 요청을 받으면 파일을 자동으로 다운로드하도록 설정
                    .contentType(MediaType.APPLICATION_OCTET_STREAM) // 바이너리 파일(엑셀, PDF 등) 전송에 적합한 MIME 타입.
                    .body(excelFile);
        } catch (IOException e) {
            return DownloadArticleExcelResponseDto.failed();
        }
    }

    @GetMapping("/excel/attendance/grade2")
    public ResponseEntity<?> downloadArticleExcel2() {
        try {
            ByteArrayResource excelFile = codingzoneService.generateAttendanceExcelOfGrade2();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=CodingZone2.xlsx") // 클라이언트가 이 요청을 받으면 파일을 자동으로 다운로드하도록 설정
                    .contentType(MediaType.APPLICATION_OCTET_STREAM) // 바이너리 파일(엑셀, PDF 등) 전송에 적합한 MIME 타입.
                    .body(excelFile);
        } catch (IOException e) {
            return DownloadArticleExcelResponseDto.failed();
        }
    }
}
