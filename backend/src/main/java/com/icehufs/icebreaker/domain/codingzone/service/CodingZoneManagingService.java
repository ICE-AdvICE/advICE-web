package com.icehufs.icebreaker.domain.codingzone.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.GroupInf;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;
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
                throw new BusinessException("NOT_MAPPED_CLASS",
                        "등록하려고 하는 교과목 중 이름 매핑 작업이 이루어지지 않은 것이 있습니다, 매핑을 먼저 해주세요!",
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
                throw new BusinessException("DUPLICATED_CLASS", "해당 수업은 이미 등록되어 있습니다.", HttpStatus.CONFLICT);
            }
        }

        // 수업 + 조 등록
        for (CodingZoneClassAssignRequestDto assignedClass : dto) {

            CodingZoneClass codingZoneClassEntity = new CodingZoneClass(assignedClass);
            codingZoneClassRepository.save(codingZoneClassEntity); // 먼저 수업을 등록하고

            GroupInfUpdateRequestDto groupDto = new GroupInfUpdateRequestDto(assignedClass);
            GroupInf groupInf = new GroupInf(groupDto);
            groupInfRepository.save(groupInf); // 조 등록

        }
    }

}
