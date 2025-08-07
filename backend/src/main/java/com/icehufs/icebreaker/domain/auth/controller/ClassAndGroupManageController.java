package com.icehufs.icebreaker.domain.auth.controller;

import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassUpdateRequestDto;
import org.springframework.web.bind.annotation.*;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneClassService;
import com.icehufs.icebreaker.util.ResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/admin/codingzones/classes")
@RequiredArgsConstructor
public class ClassAndGroupManageController {

    private final CodingZoneClassService codingZoneManagingService;

    @PostMapping("") // 코딩존 수업 등록 Controller
    public ResponseEntity<ResponseDto<String>> postClassAndGroup(
            @AuthenticationPrincipal String email,
            @RequestBody @Valid List<CodingZoneClassAssignRequestDto> requestBody) {

        codingZoneManagingService.postClassAndGroup(requestBody, email);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_CLASS_CREATE));
    }

    @PatchMapping("/{classNum}") // 특정 코딩존 수업 정보 수정 Controller
    public ResponseEntity<ResponseDto<String>> patchClassAndGroup(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CodingZoneClassUpdateRequestDto requestBody,
            @PathVariable Integer classNum) {

        codingZoneManagingService.patchClassAndGroup(requestBody, classNum);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_CLASS_UPDATE, null));
    }
}
