package com.icehufs.icebreaker.domain.codingzone.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.exception.*;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneRegisterRepository;
import org.springframework.stereotype.Service;

import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.GroupInf;
import com.icehufs.icebreaker.domain.codingzone.dto.object.AssistantInfoDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.SubjectAssistantsResponseDto;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneClassRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.GroupInfRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.SubjectRepository;
import com.icehufs.icebreaker.domain.membership.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CodingZoneClassService {

    private final CodingZoneClassRepository codingZoneClassRepository;
    private final CodingZoneRegisterRepository codingZoneRegisterRepository;
    private final GroupInfRepository groupInfRepository;
    private final SubjectRepository subjectRepository;
    private final AuthorityRepository authorityRepository;
    private final UserRepository userRepository;

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
            codingZoneClassRepository.save(codingZoneClassEntity);

            GroupInfUpdateRequestDto groupDto = new GroupInfUpdateRequestDto(assignedClass);
            GroupInf groupInf = new GroupInf(groupDto);
            groupInfRepository.save(groupInf);
        }
    }

    // 코딩존 정보 수정
    @Transactional
    public void patchClassAndGroup(CodingZoneClassUpdateRequestDto dto, Integer classNum) {

        // 수정한 정보가 기존의 정보와 동일할 때 예외처리
        // 수정하고자 하는 코딩존 수업의 고유번호를 가져와서 DB확인
        CodingZoneClass existingClass = codingZoneClassRepository.findByClassNum(classNum);
        if(dto.isSameEntity(existingClass)) throw new DuplicatedClassException();

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

        // 수정된 필드만 반영 (Dirty Checking)
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new UnmappedSubjectException());

        existingClass.update(dto, subject);
    }

    @Transactional
    public void deleteClass(Integer classNum) {

        CodingZoneClass codingZoneClass = codingZoneClassRepository.findById(classNum)
                .orElseThrow(() -> new CodingZoneClassNotFoundException());

        if(codingZoneRegisterRepository.existsByCodingZoneClassClassNum(classNum)) {
            throw new ExistCodingZoneRegisterException();
        }
        codingZoneClassRepository.delete(codingZoneClass);
    }

    @Transactional(readOnly = true)
    public List<SubjectAssistantsResponseDto> getAssistantList() {
        List<SubjectAssistantsResponseDto> result = new ArrayList<>();

        for (int i = 1; i <= 4; i++) {
            final int index = i;
            String role = "ROLE_ADMINC" + index;

            List<Authority> authorities = switch (role) {
                case "ROLE_ADMINC1" -> authorityRepository.findByRoleAdminC1(role);
                case "ROLE_ADMINC2" -> authorityRepository.findByRoleAdminC2(role);
                case "ROLE_ADMINC3" -> authorityRepository.findByRoleAdminC3(role);
                case "ROLE_ADMINC4" -> authorityRepository.findByRoleAdminC4(role);
                default -> List.of();
            };

            if (authorities.isEmpty()) continue; // 조교가 한 명도 없으면 건너뜀

            Optional<Subject> optionalSubject = subjectRepository.findById(index);
            if (optionalSubject.isEmpty()) continue;

            Subject subject = optionalSubject.get();

            List<AssistantInfoDto> assistants = authorities.stream()
                .map(auth -> userRepository.findById(auth.getEmail())
                    .map(user -> new AssistantInfoDto(
                        user.getEmail(),
                        user.getStudentNum(),
                        user.getName()
                    ))
                    .orElse(null))
                .filter(Objects::nonNull)
                .toList();

                result.add(new SubjectAssistantsResponseDto(subject.getSubjectName(), assistants));
        }

        if(result.isEmpty()) {
            throw new AssistantsNotFoundException("조교가 등록된 과목이 아직 없습니다.");
        }

        return result;
    }



}
