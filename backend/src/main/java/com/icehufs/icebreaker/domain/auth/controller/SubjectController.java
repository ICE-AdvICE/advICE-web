package com.icehufs.icebreaker.domain.auth.controller;

import java.util.List;

import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneClassInfoResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.PostSubjectMappingResponseDto;
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
import org.springframework.web.bind.annotation.DeleteMapping;
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

    @PostMapping
    public ResponseEntity<PostSubjectMappingResponseDto> postSubjectMapping(
            @AuthenticationPrincipal String email, // 확인하고자하는 유저의 토큰 유효성 확인 후 유저의 메일 반환
            @Valid @RequestBody List<PostSubjectMappingRequestDto> requestDto // 매핑이 여러개 들어올 수 있으니 List<>로
    ) {
        PostSubjectMappingResponseDto postSubjectMappingResponseDto = subjectService.postMappingCodingZoneClass(requestDto, email);
        return ResponseEntity.ok(postSubjectMappingResponseDto);
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<SubjectResponseDto>>> getSubjectMapping(
            @AuthenticationPrincipal String email) {
        return ResponseEntity
                .ok(ResponseDto.success(ResponseMessage.SUCCESS_CLASS_CREATE, subjectService.getMappingCodingZoneClass(email)));
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<ResponseDto<List<SubjectResponseDto>>> deleteSubjectMapping(
            @PathVariable Integer subjectId) {
        List<SubjectResponseDto> deleteSubject = subjectService.deleteMappingCodingzoneClass(subjectId);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_DELETE_MAPPING, deleteSubject));
    }

    @GetMapping("/{subjectId}/codingzones")
    public ResponseEntity<ResponseDto<List<CodingZoneClassInfoResponseDto>>> getCodingZoneClassesBySubjectAndDate(
            @PathVariable Long subjectId,
            @RequestParam("date") String date) {
        List<CodingZoneClassInfoResponseDto> result = codingzoneService.findCodingZoneClassesBySubjectAndDate(subjectId, date);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_MAPPING_GET, result));
    }
}
