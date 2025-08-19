package com.icehufs.icebreaker.domain.auth.controller;

import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassUpdateRequestDto;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneClassService;
import com.icehufs.icebreaker.util.ResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/codingzones/classes")
@RequiredArgsConstructor
public class ClassAndGroupManageController {

    private final CodingZoneClassService codingZoneManagingService;

    @PostMapping("")
    public ResponseEntity<ResponseDto<String>> postClassAndGroup(
            @AuthenticationPrincipal String email,
            @RequestBody @Valid List<CodingZoneClassAssignRequestDto> requestBody) {

        codingZoneManagingService.postClassAndGroup(requestBody, email);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_CLASS_CREATE));
    }

    @PatchMapping("/{classNum}")
    public ResponseEntity<ResponseDto<String>> patchClassAndGroup(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CodingZoneClassUpdateRequestDto requestBody,
            @PathVariable Integer classNum) {

        codingZoneManagingService.patchClassAndGroup(requestBody, classNum);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_CLASS_UPDATE));
    }

    @DeleteMapping("/{classNum}")
    public ResponseEntity<ResponseDto<String>> deleteClass(
            @PathVariable("classNum") Integer classNum
    ) {
        codingZoneManagingService.deleteClass(classNum);
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_CLASS_DELETE));
    }
}
