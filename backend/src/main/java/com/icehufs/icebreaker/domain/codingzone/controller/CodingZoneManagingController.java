package com.icehufs.icebreaker.domain.codingzone.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneManagingService;
import com.icehufs.icebreaker.util.ResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/admin/codingzone/classes")
@RequiredArgsConstructor
public class CodingZoneManagingController {

    private final CodingZoneManagingService codingZoneManagingService;

    @PostMapping("") // 코딩존 수업 등록 Controller
    public ResponseEntity<ResponseDto<Void>> postClassAndGroup(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody List<CodingZoneClassAssignRequestDto> requestBody) {

        codingZoneManagingService.postClassAndGroup(requestBody, email);
        return ResponseEntity.ok(ResponseDto.success("코딩존 수업 등록 성공"));
    }
}
