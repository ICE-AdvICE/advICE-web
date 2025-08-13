package com.icehufs.icebreaker.domain.auth.controller;

import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.dto.response.SubjectListResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.SubjectService;
import com.icehufs.icebreaker.util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class AllAuthSubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public ResponseEntity<ResponseDto<SubjectListResponseDto>> getSubjectMapping() {
        return ResponseEntity
                .ok(ResponseDto.success(ResponseMessage.SUCCESS_MAPPING_GET, subjectService.getMappingCodingZoneClass()));
    }
}
