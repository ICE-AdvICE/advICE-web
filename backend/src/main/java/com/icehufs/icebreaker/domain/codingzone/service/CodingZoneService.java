package com.icehufs.icebreaker.domain.codingzone.service;

import com.icehufs.icebreaker.domain.codingzone.dto.response.*;
import org.springframework.http.ResponseEntity;

import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PatchGroupInfRequestDto;

import java.util.List;

public interface CodingZoneService {
    //admin(과사 조교) 권한을 위한 로직
    ResponseEntity<? super GroupInfUpdateResponseDto> uploadInf(List<GroupInfUpdateRequestDto> dto, String email);
    ResponseEntity<? super GetListOfGroupInfResponseDto> getList(String groupId, String email);
    ResponseEntity<? super GroupInfUpdateResponseDto> patchInf(List<PatchGroupInfRequestDto> dto, String email);

    //권한이 필요없는 로직
    ResponseEntity<? super CodingZoneRegisterResponseDto> classRegist(Integer classNum, String email);
    ResponseEntity<? super CodingZoneCanceResponseDto> classCancel(Integer classNum, String email);
    ResponseEntity<? super GetCountOfAttendResponseDto> getAttend(Integer grade,String email);
    ResponseEntity<? super GetPersAttendListItemResponseDto> getPerAttendList(String email);
    ResponseEntity<? super GetReservedClassListItemResponseDto> getReservedClass(String classDate, String email);
    AssistantNamesResponseDto getAssistantNamesBySubjectId(Long subjectId);
    SubjectMappingInfoResponseDto getClassNamesWithSubjectIdsByDate(String date);
    List<CodingZoneClassInfoResponseDto> findCodingZoneClassesBySubjectAndDate(Integer subjectId, String date);
    //수업 코딩존 조교
}
