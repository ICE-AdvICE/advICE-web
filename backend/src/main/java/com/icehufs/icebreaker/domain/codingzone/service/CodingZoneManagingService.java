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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CodingZoneManagingService {

    private final CodingZoneClassRepository codingZoneClassRepository;
    private final GroupInfRepository groupInfRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public void postClassAndGroup(List<CodingZoneClassAssignRequestDto> dto, String email) {

        for (CodingZoneClassAssignRequestDto assignedClass : dto) {
            if (!subjectRepository.existsBySubjectId(assignedClass.getSubjectId()))
                throw new BusinessException("400", "등록하려고 하는 교과목 중 이름 매핑 작업이 이루어지지 않은 것이 있습니다, 매핑을 먼저 해주세요!",
                        HttpStatus.BAD_REQUEST);

            // 등록 하려는 필드 값들이 DB에서 모두 같은 (currentNumber제외)경우가 있을 때 예외처리
            boolean isDuplicate = codingZoneClassRepository
                    .existsByIdentity(
                            assignedClass.getAssistantName(),
                            assignedClass.getClassDate(),
                            assignedClass.getClassTime(),
                            assignedClass.getClassName(),
                            assignedClass.getMaximumNumber(),
                            assignedClass.getWeekDay(),
                            assignedClass.getSubjectId(),
                            assignedClass.getGroupId());

            if (isDuplicate) {
                throw new BusinessException("409", "해당 수업은 이미 등록되어 있습니다.", HttpStatus.CONFLICT);
            }
        }

        // 수업 + 조등록 가능!
        for (CodingZoneClassAssignRequestDto assignedClass : dto) {
            CodingZoneClass codingZoneClassEntity = new CodingZoneClass(assignedClass);
            codingZoneClassRepository.save(codingZoneClassEntity);
            saveGroup(assignedClass); // 조 등록은 아래 따로 메서드 분리
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
