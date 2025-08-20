package com.icehufs.icebreaker.domain.codingzone.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icehufs.icebreaker.util.ResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.SubjectAssistantsResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneClassService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/coding-zone") // 코딩존 일반 사용자 API 주소
@RequiredArgsConstructor
public class PublicCodingZoneController {

    private final CodingZoneClassService codingzoneService;

    @GetMapping("/assistants")
    public ResponseEntity<ResponseDto<List<SubjectAssistantsResponseDto>>> getAssistantList() {
        List<SubjectAssistantsResponseDto> response = codingzoneService.getAssistantList();
        return ResponseEntity.ok(ResponseDto.success("코딩존 과목별 조교 정보 조회에 성공했습니다.", response));
    }

    @GetMapping("/count-of-attend/{subjectId}") // 출석한 횟수 반환 API
    public ResponseEntity<ResponseDto<Integer>> getCountAttend(
            @PathVariable Integer subjectId,
            @AuthenticationPrincipal String email) {
        Integer response = codingzoneService.getAttend(subjectId, email);
        return ResponseEntity.ok(ResponseDto.success("특정 학생의 출석 횟수 조회에 성공했습니다.",response));
    }

}
