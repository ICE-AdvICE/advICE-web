package com.icehufs.icebreaker.domain.codingzone.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icehufs.icebreaker.util.ResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.SubjectAssistantsResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneClassService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/coding-zone") // 코딩존 일반 사용자 API 주소
@RequiredArgsConstructor
public class CodingZoneAssistantController {

    private final CodingZoneClassService codingzoneService;

    @GetMapping("/assistants")
    public ResponseEntity<ResponseDto<List<SubjectAssistantsResponseDto>>> getAssistantList() {
        List<SubjectAssistantsResponseDto> response = codingzoneService.getAssistantList();
        return ResponseEntity.ok(ResponseDto.success("코딩존 과목별 조교 정보 조회에 성공했습니다.", response));
    }

}
