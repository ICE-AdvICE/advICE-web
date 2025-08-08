package com.icehufs.icebreaker.domain.codingzone.service;

import java.util.List;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.exception.DuplicatedClassException;
import com.icehufs.icebreaker.domain.codingzone.exception.AlreadyExistClassException;
import com.icehufs.icebreaker.domain.codingzone.exception.NoExistedGroupException;
import com.icehufs.icebreaker.domain.codingzone.exception.UnmappedSubjectException;
import org.springframework.stereotype.Service;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.GroupInf;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneClassRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.GroupInfRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.SubjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CodingZoneClassService {

    private final CodingZoneClassRepository codingZoneClassRepository;
    private final GroupInfRepository groupInfRepository;
    private final SubjectRepository subjectRepository;

    // 코딩존 등록
    @Transactional
    public void postClassAndGroup(List<CodingZoneClassAssignRequestDto> dto, String email) {

        for (CodingZoneClassAssignRequestDto assignedClass : dto) {
            // 매핑 작업을 하지 않은 교과목에 해당하는 코딩존 수업을 등록하려고 할때
            if (!subjectRepository.existsById(assignedClass.getSubjectId())) throw new UnmappedSubjectException();

            // 등록 하려는 필드 값들이 DB에서 모두 같은 (currentNumber제외)경우가 있을 때 예외처리
            boolean isDuplicate = codingZoneClassRepository
                    .existsByIdentity(
                            assignedClass.getAssistantName(),
                            assignedClass.getClassDate(),
                            assignedClass.getClassTime(),
                            assignedClass.getClassName(),
                            assignedClass.getMaximumNumber(),
                            assignedClass.getWeekDay(),
                            assignedClass.getSubjectId()
                            );

            // 이미 시전에 동일한 수업을 등록한 경우
            if (isDuplicate) throw new AlreadyExistClassException();
        }

        // 수업 + 조 등록
        for (CodingZoneClassAssignRequestDto assignedClass : dto) {
            Subject subject = subjectRepository.findById(assignedClass.getSubjectId()).orElseThrow(() -> new UnmappedSubjectException());
            CodingZoneClass codingZoneClassEntity = new CodingZoneClass(assignedClass, subject);
            codingZoneClassRepository.save(codingZoneClassEntity); // 먼저 수업을 등록하고

            GroupInfUpdateRequestDto groupDto = new GroupInfUpdateRequestDto(assignedClass);
            GroupInf groupInf = new GroupInf(groupDto);
            groupInfRepository.save(groupInf); // 조 등록
        }
    }

    // 코딩존 정보 수정
    @Transactional
    public void patchClassAndGroup(CodingZoneClassUpdateRequestDto dto, Integer classNum) {

        // 수정한 정보가 기존의 정보와 동일할 때 예외처리
        // 수정하고자 하는 코딩존 수업의 고유번호를 가져와서 DB확인
        CodingZoneClass existingClass = codingZoneClassRepository.findByClassNum(classNum);
        if(dto.isSameEntity(existingClass)) throw new DuplicatedClassException();

        // DB 저장된 원래 codingzoneclass 수업 삭제
        CodingZoneClass existedClass = codingZoneClassRepository.findByClassNum(classNum);
        codingZoneClassRepository.removeCodingZoneClassByClassNum(classNum);

        // DB 저장된 원래 groupinf 조 삭제
        GroupInf group = groupInfRepository.findByAssistantNameAndClassTimeAndClassName(existedClass.getAssistantName(), existedClass.getClassTime(),existedClass.getClassName())
                .orElseThrow(() -> new NoExistedGroupException());
        groupInfRepository.delete(group);

        // 수정된 정보가 아직 매핑 전 교과목이 포함되었을 경우 예외처리
        if (!subjectRepository.existsById(dto.getSubjectId())) throw new UnmappedSubjectException();

        // 수정한 정보가 이미 DB에 저장되어 있는 경우
        boolean isDuplicate = codingZoneClassRepository
                .existsByIdentity(
                        dto.getAssistantName(),
                        dto.getClassDate(),
                        dto.getClassTime(),
                        dto.getClassName(),
                        dto.getMaximumNumber(),
                        dto.getWeekDay(),
                        dto.getSubjectId()
                );

        // 이미 시전에 동일한 수업을 등록한 경우 예외처리
        if (isDuplicate) throw new AlreadyExistClassException();

        // 수정한 정보로 수업 등록
        Subject subject = subjectRepository.findById(dto.getSubjectId()) .orElseThrow(() -> new UnmappedSubjectException());
        CodingZoneClass codingZoneClassEntity = new CodingZoneClass(dto, classNum, subject);
        codingZoneClassRepository.save(codingZoneClassEntity);
        // 수정한 정보로 조 등록
        GroupInfUpdateRequestDto groupDto = new GroupInfUpdateRequestDto(dto);
        GroupInf groupInf = new GroupInf(groupDto);
        groupInfRepository.save(groupInf); // 조 등록

    }
}
