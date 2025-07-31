package com.icehufs.icebreaker.domain.codingzone.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PostSubjectMappingRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.PostSubjectMappingResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.SubjectService;
import com.icehufs.icebreaker.util.ResponseDto;
import com.icehufs.icebreaker.util.SubjectResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/admin/subjects") // 코딩존 메핑 관련 controller
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    // 코딩존 매핑 등록 controller
    @PostMapping("")
    public ResponseEntity<ResponseDto<PostSubjectMappingResponseDto>> postSubjectMapping(
            @AuthenticationPrincipal String email, // 확인하고자하는 유저의 토큰 유효성 확인 후 유저의 메일 반환
            @Valid @RequestBody List<PostSubjectMappingRequestDto> requestDto // 매핑이 여러개 들어올 수 있으니 List<>로
    ) {
        return ResponseEntity.ok(ResponseDto.success(subjectService.postMappingCodingZoneClass(requestDto, email)));
    }

    // 코딩존 매핑 조회 controller
    @GetMapping("")
    public ResponseEntity<ResponseDto<List<SubjectResponseDto>>> getSubjectMapping(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(ResponseDto.success(subjectService.getMappingCodingZoneClass(email)));
    }
}
