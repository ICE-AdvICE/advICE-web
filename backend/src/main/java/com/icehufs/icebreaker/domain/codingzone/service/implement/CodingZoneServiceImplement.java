package com.icehufs.icebreaker.domain.codingzone.service.implement;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GroupInfUpdateResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetListOfGroupInfResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneRegisterResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneCanceResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetPersAttendListItemResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetReservedClassListItemResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.SubjectMappingInfoResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.AssistantNamesResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneClassInfoResponseDto;

import com.icehufs.icebreaker.domain.codingzone.exception.GroupInfNotFoundException;
import com.icehufs.icebreaker.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PatchGroupInfRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.object.PersAttendManagListItem;
import com.icehufs.icebreaker.domain.codingzone.dto.object.ReservedClassListItem;
import com.icehufs.icebreaker.common.ResponseDto;
import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.GroupInf;
import com.icehufs.icebreaker.domain.membership.domain.entity.User;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneClassRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneRegisterRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.GroupInfRepository;
import com.icehufs.icebreaker.domain.membership.repository.UserRepository;
import com.icehufs.icebreaker.domain.codingzone.service.CodingZoneService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class CodingZoneServiceImplement implements CodingZoneService {

    private final CodingZoneClassRepository codingZoneClassRepository;
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final GroupInfRepository groupInfRepository;
    private final CodingZoneRegisterRepository codingZoneRegisterRepository;

    @Transactional
    public ResponseEntity<? super GroupInfUpdateResponseDto> uploadInf(List<GroupInfUpdateRequestDto> requestBody,
            String email) {
        try {
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return GroupInfUpdateResponseDto.notExistUser();

            // requestBody가 비어있지 않은지 확인하고 첫 번째 요소의 groupId를 사용
            if (requestBody != null && !requestBody.isEmpty()) {
                String groupId = requestBody.get(0).getGroupId();
                groupInfRepository.deleteByGroupId(groupId); // 새로운 정보를 저장하기 전에 기존 (A/B)조의 정보 삭제

                for (GroupInfUpdateRequestDto requestDto : requestBody) {
                    GroupInf groupInf = new GroupInf(requestDto);
                    groupInfRepository.save(groupInf);
                }
            }

            return GroupInfUpdateResponseDto.success();
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public ResponseEntity<? super GetListOfGroupInfResponseDto> getList(String groupId, String email) {
        List<GroupInf> groupInfEntities = new ArrayList<>();
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return GetListOfGroupInfResponseDto.notExistUser();

            groupInfEntities = groupInfRepository.findByGroupId(groupId);
            if (groupInfEntities.isEmpty())
                return GetListOfGroupInfResponseDto.noExistArticle();

            return GetListOfGroupInfResponseDto.success(groupInfEntities);
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public ResponseEntity<? super GroupInfUpdateResponseDto> patchInf(List<PatchGroupInfRequestDto> dto, String email) {

        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return GroupInfUpdateResponseDto.notExistUser();

            // 각 수업을 수정
            for (PatchGroupInfRequestDto dtos : dto) {
                GroupInf existingEntity = groupInfRepository.findByClassNum(dtos.getClassNum()).orElseThrow(GroupInfNotFoundException::new);
                if (existingEntity != null) {
                    existingEntity.setAssistantName(dtos.getAssistantName());
                    existingEntity.setClassTime(dtos.getClassTime());
                    existingEntity.setWeekDay(dtos.getWeekDay());
                    existingEntity.setMaximumNumber(dtos.getMaximumNumber());
                    existingEntity.setClassName(dtos.getClassName());
                    groupInfRepository.save(existingEntity);
                }
            }

            return GroupInfUpdateResponseDto.success();
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    @Transactional
    public ResponseEntity<? super CodingZoneRegisterResponseDto> classRegist(Integer classNum, String email) {

        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인
            User userEntity = userRepository.findByEmail(email);
            if (userEntity == null) {
                return CodingZoneRegisterResponseDto.notExistUser();
            }
        
            CodingZoneClass codingZoneClass = codingZoneClassRepository.findByClassNum(classNum);
            if (codingZoneClass == null) {
                return CodingZoneRegisterResponseDto.validationFailed(); // 발생할 수 없는 예외로 validation으로 처리
            }
        
            CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository.findByCodingZoneClassAndUserEmail(codingZoneClass,
                    email);
            if (codingZoneRegister != null) {
                return CodingZoneRegisterResponseDto.alreadyReserve(); // 해당 수업을 이미 예약했을 때
            }
        
            // 인원 초과 처리
            if (codingZoneClass.getCurrentNumber() >= codingZoneClass.getMaximumNumber()) {
                return CodingZoneRegisterResponseDto.fullClass();
            }
        
            // 신청한 수업 등록
            String userName = userEntity.getName();
            String userStudentNum = userEntity.getStudentNum();
            CodingZoneRegister newRegisterEntity = new CodingZoneRegister(userName, userStudentNum, email, codingZoneClass);
            codingZoneRegisterRepository.save(newRegisterEntity);
            codingZoneClass.increaseNum(); // 예약자 수 증가
            codingZoneClassRepository.save(codingZoneClass);

            return CodingZoneRegisterResponseDto.success();
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    @Transactional
    public ResponseEntity<? super CodingZoneCanceResponseDto> classCancel(Integer classNum, String email) {
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인
            User userEntity = userRepository.findByEmail(email);
            if (userEntity == null) {
                return CodingZoneCanceResponseDto.notExistUser();
            }

            CodingZoneClass codingZoneClass = codingZoneClassRepository.findByClassNum(classNum);
            if (codingZoneClass == null) {
                return CodingZoneCanceResponseDto.validationFailed(); // 발생할 수 없는 예외로 validation으로 처리
            }

            // 예약하지 않은 수업을 취소하려 할 경우 방지
            CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository.findByCodingZoneClassAndUserEmail(codingZoneClass,
                    email);
            if (codingZoneRegister == null) {
                return CodingZoneCanceResponseDto.notReserve();
            }

            codingZoneRegisterRepository.delete(codingZoneRegister);
            codingZoneClass.decreaseCurrentNum();
            codingZoneClassRepository.save(codingZoneClass);

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return CodingZoneCanceResponseDto.success();
    }


    @Override
    public ResponseEntity<? super GetPersAttendListItemResponseDto> getPerAttendList(String email) {
        List<PersAttendManagListItem> attendClassEntities = new ArrayList<>();
        List<CodingZoneRegister> classEntities = new ArrayList<>();
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return GetPersAttendListItemResponseDto.notExistUser();

            // 아직 출/결한 수업이 없을 때
            classEntities = codingZoneRegisterRepository.findByUserEmail(email);
            if (classEntities.isEmpty())
                return GetPersAttendListItemResponseDto.noExistArticle();

            for (CodingZoneRegister register : classEntities) {
                CodingZoneClass codingZoneClass = register.getCodingZoneClass();
                PersAttendManagListItem persAttendManagListItem = new PersAttendManagListItem(codingZoneClass,
                        register);
                attendClassEntities.add(persAttendManagListItem);
            }
            return GetPersAttendListItemResponseDto.success(attendClassEntities);

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public ResponseEntity<? super GetReservedClassListItemResponseDto> getReservedClass(String classDate,
            String email) {
        List<ReservedClassListItem> studentList = new ArrayList<>();
        int kindOfClass = 0;
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            User user = userRepository.findByEmail(email);
            if (user == null)
                return GetReservedClassListItemResponseDto.notExistUser();

            // TODO: 코딩존 종류가 늘어났기 때문에 수정 바람
            Authority authority = authorityRepository.findByEmail(email);
            if (!"NULL".equals(authority.getRoleAdminC1())) {
                kindOfClass = 1;
            }
            if (!"NULL".equals(authority.getRoleAdminC2())) {
                kindOfClass = 2;
            }

            // TODO: 매핑 이후 필드값을 가져오는 방식으로 수정 바람
            List<CodingZoneClass> classes = codingZoneClassRepository.findAllBySubjectId(kindOfClass);
            List<CodingZoneRegister> registers = codingZoneRegisterRepository.findAllByCodingZoneClassIn(classes);

            // 예약한 학생이 없을 때
            if (registers.isEmpty())
                return GetReservedClassListItemResponseDto.noExistArticle();

            for (CodingZoneRegister register : registers) {
                CodingZoneClass codingZoneClass = register.getCodingZoneClass();
                if (classDate.equals(codingZoneClass.getClassDate())) {
                    ReservedClassListItem reservedClassListItem = new ReservedClassListItem(codingZoneClass, register);
                    studentList.add(reservedClassListItem);
                }
            }
            if (studentList.isEmpty()) {
                return GetReservedClassListItemResponseDto.noExistArticle();
            }
            return GetReservedClassListItemResponseDto.success(studentList);
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public SubjectMappingInfoResponseDto getClassNamesWithSubjectIdsByDate(String date) {
        DayOfWeek day = LocalDate.parse(date).getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) throw new BusinessException(ResponseCode.INVAIlD_DATE_WEEKEND, "입력한 날짜가 주말임", HttpStatus.BAD_REQUEST);
        List<CodingZoneClass> codingZoneClasses = codingZoneClassRepository.findAllByClassDate(date);
        if (codingZoneClasses.isEmpty()) throw new BusinessException(ResponseCode.NO_CODINGZONE_DATE, "입력한 평일에 코딩존이 없음", HttpStatus.BAD_REQUEST);

        Map<Integer, String> subjectIdToClassNameMap  = codingZoneClasses.stream()
                .collect(Collectors.toMap(
                        c -> c.getSubject().getId(),
                        CodingZoneClass::getClassName,
                        (existing, replacement) -> existing
                ));
        return new SubjectMappingInfoResponseDto(subjectIdToClassNameMap );
    }

    @Override
    public AssistantNamesResponseDto getAssistantNamesBySubjectId(Long subjectId) {
        List<Authority> authorityList = switch (subjectId.intValue()) {
            case 1 -> authorityRepository.findByRoleAdminC1("ROLE_ADMINC1");
            case 2 -> authorityRepository.findByRoleAdminC2("ROLE_ADMINC2");
            case 3 -> authorityRepository.findByRoleAdminC3("ROLE_ADMINC3");
            case 4 -> authorityRepository.findByRoleAdminC4("ROLE_ADMINC4");
            default -> throw new BusinessException(ResponseCode.INVALID_SUBJECT_ID, "유효하지 않은 과목 ID 입니다.", HttpStatus.BAD_REQUEST);
        };

        if (authorityList.isEmpty()) throw new BusinessException(ResponseCode.TUTOR_NOT_FOUND, "선택한 교과목에 등록된 조교 리스트 없음", HttpStatus.BAD_REQUEST);

        List<String> assistantNames = new ArrayList<>();
        for (Authority authority : authorityList) { // 특정 권한을 가진 user를 찾아서 이름을 list에 담아 반환
            User assistant = userRepository.findByEmail(authority.getEmail());
            if (assistant == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, "선택한 교과목에 등록된 조교가 존재 하지 않습니다.", HttpStatus.NOT_FOUND);
            assistantNames.add(assistant.getName());
        }
        return new AssistantNamesResponseDto(assistantNames);
    }

    @Override
    public List<CodingZoneClassInfoResponseDto> findCodingZoneClassesBySubjectAndDate(Integer subjectId, String date) {
        List<CodingZoneClass> codingZoneClasses = codingZoneClassRepository.findBySubjectIdAndClassDate(subjectId, date);
        List<CodingZoneClassInfoResponseDto> classInfos = new ArrayList<>();

        for (CodingZoneClass codingZoneClass : codingZoneClasses) {
            CodingZoneClassInfoResponseDto dto = new CodingZoneClassInfoResponseDto(
                    codingZoneClass.getClassTime(),
                    codingZoneClass.getAssistantName(),
                    groupInfRepository.findByClassNum(codingZoneClass.getClassNum())
                            .orElseThrow(GroupInfNotFoundException::new)
                            .getGroupId(),
                    codingZoneClass.calculateClassStatus(date),
                    codingZoneClass.getClassNum(),
                    codingZoneClass.getMaximumNumber(),
                    codingZoneClass.getCurrentNumber()
            );
            classInfos.add(dto);
        }
        return classInfos;
    }
}
