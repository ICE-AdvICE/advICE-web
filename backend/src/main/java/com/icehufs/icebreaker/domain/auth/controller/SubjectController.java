package com.icehufs.icebreaker.domain.auth.controller;

import java.util.List;

import com.icehufs.icebreaker.domain.codingzone.dto.response.AssistantNamesResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneClassInfoResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PostSubjectMappingRequestDto;
import com.icehufs.icebreaker.domain.codingzone.service.SubjectService;
import com.icehufs.icebreaker.util.ResponseDto;
import com.icehufs.icebreaker.util.SubjectResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/admin/subjects") // 코딩존 메핑 관련 controller
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;
    private final CodingZoneService codingzoneService;

    // 코딩존 매핑 등록 controller
    @PostMapping("")
    public ResponseEntity<ResponseDto<String>> postSubjectMapping(
            @AuthenticationPrincipal String email, // 확인하고자하는 유저의 토큰 유효성 확인 후 유저의 메일 반환
            @Valid @RequestBody List<PostSubjectMappingRequestDto> requestDto // 매핑이 여러개 들어올 수 있으니 List<>로
    ) {
        subjectService.postMappingCodingZoneClass(requestDto, email);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_CLASS_MAPPING));
    }

    // 코딩존 매핑 조회 controller
    @GetMapping("")
    public ResponseEntity<ResponseDto<List<SubjectResponseDto>>> getSubjectMapping(
            @AuthenticationPrincipal String email) {
        return ResponseEntity
                .ok(ResponseDto.success(ResponseMessage.SUCCESS_CLASS_CREATE, subjectService.getMappingCodingZoneClass(email)));
    }
    @GetMapping("/{subjectId}/assistants")
    public ResponseEntity<ResponseDto<AssistantNamesResponseDto>> getAssistantsName(
            @PathVariable Long subjectId
    ) {
        AssistantNamesResponseDto assistantNamesResponse = codingzoneService.getAssistantNamesBySubjectId(subjectId);
        return ResponseEntity.ok(ResponseDto.success("특정 교과목에 해당하는 조교 리스트 조회 성공.", assistantNamesResponse ));
    }

    @GetMapping("/{subjectId}/codingzones")
    public ResponseEntity<ResponseDto<List<CodingZoneClassInfoResponseDto>>> getCodingZoneClassesBySubjectAndDate(
            @PathVariable Long subjectId,
            @RequestParam("date") String date) {
        List<CodingZoneClassInfoResponseDto> result = codingzoneService.findCodingZoneClassesBySubjectAndDate(subjectId, date);
        return ResponseEntity.ok(ResponseDto.success("특정 날짜와 교과목에 해당하는 코딩존 수업 리스트 조회 성공.", result));
    }
}
