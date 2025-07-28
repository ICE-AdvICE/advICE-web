package com.icehufs.icebreaker.domain.codingzone.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.icehufs.icebreaker.domain.codingzone.dto.request.PostMappingInfRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.PostMappingInfResponseDto;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneService;
import com.icehufs.icebreaker.util.ResponseDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/admin/subject-aliases") // 코딩존 메핑 관련 controller 
@RequiredArgsConstructor
public class MappingCodingZoneController {

  private final CodingZoneService codingZoneService;

  // 코딩존 매핑 등록 controller
  @PostMapping("")
  public ResponseEntity<ResponseDto<PostMappingInfResponseDto>> postMappingInf(
        @AuthenticationPrincipal String email,  //확인하고자하는 유저의 토큰 유효성 확인 후 유저의 메일 반환
        @Valid @RequestBody List<PostMappingInfRequestDto> requestDto // 매핑이 여러개 들어올 수 있으니 List<>로
    ){
        return ResponseEntity.ok(ResponseDto.success(codingZoneService.postMappingCodingZoneClass(requestDto, email)));
    }

  
  
}
