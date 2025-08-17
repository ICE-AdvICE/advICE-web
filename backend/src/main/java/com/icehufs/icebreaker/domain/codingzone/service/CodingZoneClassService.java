package com.icehufs.icebreaker.domain.codingzone.service;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ClassListResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ClassListWithRegisteredNumResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ClassResponseDto;
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
import org.springframework.transaction.annotation.Transactional;

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

        GroupInf existinfGroup = groupInfRepository.findByAssistantNameAndClassTimeAndClassName
                (existingClass.getAssistantName(), existingClass.getClassTime(), existingClass.getClassName())
                    .orElseThrow(GroupInfNotFoundException::new);

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
            if (isDuplicate && existinfGroup.getGroupId().equals(dto.getGroupId())) throw new AlreadyExistClassException();

        // 수정된 필드만 반영 (Dirty Checking)
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new UnmappedSubjectException());
        existingClass.update(dto, subject);
        existinfGroup.update(dto.getAssistantName(), dto.getGroupId(), dto.getClassTime(), dto.getWeekDay(), dto.getMaximumNumber(),dto.getClassName(), dto.getSubjectId());
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



    @Transactional(readOnly = true)
    public ClassListResponseDto getClassListForAllPublic(Integer subjectId) {

        List<ClassResponseDto> list = fetchNextWeekClassDtos(subjectId);
        return new ClassListResponseDto(list);

    }

    @Transactional(readOnly = true)
    public ClassListWithRegisteredNumResponseDto getClassListForAuth(Integer subjectId, String email) {
        List<ClassResponseDto> list = fetchNextWeekClassDtos(subjectId);
        int registedClassNum = 0;
        for (ClassResponseDto dto : list) {
            if (codingZoneRegisterRepository
                    .existsByCodingZoneClassClassNumAndUserEmail(dto.getClassNum(), email)) {
                registedClassNum = dto.getClassNum();
                break;
            }
        }
        return new ClassListWithRegisteredNumResponseDto(list, registedClassNum);
    }

    public List<ClassResponseDto> fetchNextWeekClassDtos(Integer subjectId) {

        // 과목 유효성 검증
        if (subjectId != 1 && subjectId != 2 && subjectId != 3 && subjectId != 4) {
            throw new NotExistSubjectException();
        }

        // 운영을 위한 조건
        // ZonedDateTime lowerBound;
        // // 이번 주 목요일 오후 4시를 lower bound 변수에 저장
        // // 만약 현재가 월~수요일이면, 즉 이번주 목요일 오후 4시가 아직 미래일 때 이번 주 목요일(오후 4시)를 반환 받기
        // if (now.getDayOfWeek().getValue() <= DayOfWeek.WEDNESDAY.getValue()) {
        // lowerBound = now.with(TemporalAdjusters.next(DayOfWeek.THURSDAY))
        // .withHour(16).withMinute(0).withSecond(0).withNano(0);
        // } else {
        // // 만약 현재가 목요일(오후 4시 이후) 또는 금~일요일인 경우, 즉 이번주 목요일 오후 4시가 과거일 때 이번 주 목요일(오후 4시)를
        // 반환 받기
        // lowerBound = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.THURSDAY))
        // .withHour(16).withMinute(0).withSecond(0).withNano(0);
        // }
        // // upperBound는 이번 주 일요일의 마지막 순간 (예: 23:59:59.999...)로 설정
        // ZonedDateTime upperBound =
        // now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
        // .with(LocalTime.MAX);

        // 현재 시간 (Asia/Seoul)
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Seoul"));

        // 개발 & 테스트 기간용 접근 허용 범위: 이번 주 월 00:00 ~ 일 23:59:59.999...
        ZonedDateTime lowerBound = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .with(LocalTime.MIN);
        ZonedDateTime upperBound = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                .with(LocalTime.MAX);

        // 허용 시간대가 아니면 예외
        if (now.isBefore(lowerBound) || now.isAfter(upperBound)) {
            throw new CodingZoneClassRequestTimeException();
        }

        // 다음 주 월~일 계산
        ZonedDateTime nextMonday = now.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        ZonedDateTime nextSunday = nextMonday.plusDays(6);

        // ZonedDateTime -> String
        String nextMondayStr = nextMonday.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String nextSundayStr = nextSunday.format(DateTimeFormatter.ISO_LOCAL_DATE);

        // 다음 주 범위 수업 조회
        List<CodingZoneClass> codingZoneClasses = codingZoneClassRepository
                .findBySubjectIdAndClassDateBetween(subjectId, nextMondayStr, nextSundayStr);

        // 조회 결과 없음
        if (codingZoneClasses.isEmpty()) {
            throw new CodingZoneClassNotFoundException();
        }

        // 엔티티 -> DTO 변환
        return codingZoneClasses.stream()
                .map(c -> new ClassResponseDto(
                        c.getClassNum(),
                        c.getAssistantName(),
                        c.getClassTime(),
                        c.getClassDate(),
                        c.getCurrentNumber(),
                        c.getMaximumNumber(),
                        c.getClassName(),
                        c.getWeekDay(),
                        c.getSubject().getId() // 필요 시 .getGrade()로 교체
                ))
                .toList();
    }
}

