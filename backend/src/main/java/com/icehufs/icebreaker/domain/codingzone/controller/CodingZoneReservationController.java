package com.icehufs.icebreaker.domain.codingzone.controller;

import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ClassListResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ClassListWithRegisteredNumResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneClassService;
import com.icehufs.icebreaker.util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coding-zone") // 코딩존 일반 사용자 API 주소
@RequiredArgsConstructor
public class CodingZoneReservationController {

    private final CodingZoneClassService codingZoneClassService;

    @GetMapping("/public/class-list/{subjectId}")
    public ResponseEntity<ResponseDto<ClassListResponseDto>> getClassListForPublic(
            @PathVariable Integer subjectId) {
        ClassListResponseDto classList = codingZoneClassService.getClassListForAllPublic(subjectId);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_GET_CLASSLIST, classList));
    }

    @GetMapping("/class-list/{subjectId}")
    public ResponseEntity<ResponseDto<ClassListWithRegisteredNumResponseDto>> getClassListForAuth(
            @PathVariable Integer subjectId,
            @AuthenticationPrincipal String email) {
        ClassListWithRegisteredNumResponseDto classList = codingZoneClassService.getClassListForAuth(subjectId, email);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_GET_CLASSLIST, classList));

    }
}
