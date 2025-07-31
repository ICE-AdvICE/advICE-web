package com.icehufs.icebreaker.domain.codingzone.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.GroupInf;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneClassRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.GroupInfRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.SubjectRepository;
import com.icehufs.icebreaker.exception.BusinessException;
import com.icehufs.icebreaker.util.CodingZoneClassIdentityDto;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CodingZoneManagingService {

  private final CodingZoneClassRepository codingZoneClassRepository;
  private final GroupInfRepository groupInfRepository;
  private final SubjectRepository subjectRepository;

  @Transactional
  public void postMappingCodingZoneClass(List<CodingZoneClassAssignRequestDto> dto, String email) {

    for(CodingZoneClassAssignRequestDto requestDto : dto) {
      if(!subjectRepository.existsBySubjectId(requestDto.getSubjectId())) 
        throw new BusinessException("400", "등록하려고 하는 교과목 중 이름 매핑 작업이 이루어지지 않은 것이 있습니다, 매핑을 먼저 해주세요!", HttpStatus.BAD_REQUEST);

        // 등록 하려는 필드 값들이 DB에서 모두 같은 (currentNumber제외)경우가 있을 때 예외처리
        CodingZoneClassIdentityDto identity = new CodingZoneClassIdentityDto(requestDto);
        boolean isDuplicate = codingZoneClassRepository
            .existsByIdentity(
            identity.getAssistantName(),
            identity.getClassDate(),
            identity.getClassTime(),
            identity.getClassName(),
            identity.getMaximumNumber(),
            identity.getWeekDay(),
            identity.getSubjectId(),
            identity.getGroupId()
        );

      if (isDuplicate) {
          throw new BusinessException("409", "해당 수업은 이미 등록되어 있습니다.", HttpStatus.CONFLICT);
      }
    }
  
    Set<CodingZoneClassAssignRequestDto> dtoSet = new HashSet<CodingZoneClassAssignRequestDto>(dto);
    // 들어온 Dto 객체들 중 중복 검사
    //수업 등록 진행 시 모든 필드가 동일한 dto를 set과 List를 이용해서 비교
    if (dtoSet.size() < dto.size())  //set의 사이즈와 List의 사이즈가 다를 경우에 중복이 있다는 것이기 때문에 예외처리
    throw new BusinessException("400", "전체 내용 중복 코딩존 등록이 있습니다.", HttpStatus.BAD_REQUEST);
        

    // 수업 + 조등록 가능!
    for (CodingZoneClassAssignRequestDto requestDto : dto) {
      CodingZoneClass codingZoneClassEntity = new CodingZoneClass(requestDto);
      codingZoneClassRepository.save(codingZoneClassEntity);
      saveGroup(requestDto); // 조 등록은 아래 따로 메서드 분리
      }
    }

    public void saveGroup(CodingZoneClassAssignRequestDto dto) {
    
          GroupInf groupInf = new GroupInf();
          groupInf.setAssistantName(dto.getAssistantName());
          groupInf.setGroupId(dto.getGroupId());
          groupInf.setClassTime(dto.getClassTime());
          groupInf.setWeekDay(dto.getWeekDay());
          groupInf.setMaximumNumber(dto.getMaximumNumber());
          groupInf.setClassName(dto.getClassName());
          groupInf.setSubjectId(dto.getSubjectId());

          groupInfRepository.save(groupInf);
          
    } 
}

