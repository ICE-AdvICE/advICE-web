package com.icehufs.icebreaker.domain.auth.controller;


import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.service.SemesterMaintenanceService;
import com.icehufs.icebreaker.util.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/semester")
@RequiredArgsConstructor
public class SemesterMaintenanceController {

    private final SemesterMaintenanceService semesterMaintenanceService;

    @DeleteMapping
    public ResponseEntity<ResponseDto<String>> deleteAll(
    ) {
        semesterMaintenanceService.resetSemester();
        return ResponseEntity.ok(ResponseDto.success(ResponseMessage.SUCCESS_RESET_SEMESTER));
    }
}
