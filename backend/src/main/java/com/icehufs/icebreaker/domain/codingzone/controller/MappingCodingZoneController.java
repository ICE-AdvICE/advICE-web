package com.icehufs.icebreaker.domain.codingzone.controller;

import java.util.List;

import org.apache.poi.ss.formula.functions.T;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.MappingInfo;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PostMappingInfoRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetMappingInfoResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.PostMappingInfoResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.GroupInfoService;
import com.icehufs.icebreaker.util.ResponseDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/admin/subject-aliases") // 코딩존 메핑 관련 controller 
@RequiredArgsConstructor
public class MappingCodingZoneController {

    private final GroupInfoService groupInfoService;

  // 코딩존 매핑 등록 controller
    @PostMapping("")
    public ResponseEntity<ResponseDto<PostMappingInfoResponseDto>> postMappingInf(
        @AuthenticationPrincipal String email,  //확인하고자하는 유저의 토큰 유효성 확인 후 유저의 메일 반환
        @Valid @RequestBody List<PostMappingInfoRequestDto> requestDto // 매핑이 여러개 들어올 수 있으니 List<>로
    ){
        return ResponseEntity.ok(ResponseDto.success(groupInfoService.postMappingCodingZoneClass(requestDto, email)));
    }

    /*  
    @GetMapping("")
    public ResponseEntity<ResponseDto<GetMappingInfoResponseDto<List<MappingInfo>>>> getMappingInf(
        @AuthenticationPrincipal String email // 조회는 따로 RequestBody 필요 없음
    ){
        return ResponseEntity.ok(ResponseDto.success(groupInfoService.getMappingCodingZoneClass(email)));
    }
    */

}
