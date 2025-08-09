package com.icehufs.icebreaker.domain.codingzone.service.implement;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.domain.codingzone.dto.response.AuthorityExistResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GroupInfUpdateResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetListOfGroupInfResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.DeleteClassResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneRegisterResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneCanceResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.PutAttendanceResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetListOfCodingZoneClassResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetListOfCodingZoneClassForNotLogInResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetCountOfAttendResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetPersAttendListItemResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetCodingZoneStudentListResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetReservedClassListItemResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.GetCodingZoneAssitantListResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneClassNamesResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.AssistantNamesResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.CodingZoneClassInfoResponseDto;

import com.icehufs.icebreaker.domain.membership.domain.exception.UserNotFoundException;
import com.icehufs.icebreaker.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.DayOfWeek;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.LocalTime;
import java.time.LocalDate;
import java.util.List;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.stream.Collectors;

import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PatchGroupInfRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.object.CodingZoneStudentListItem;
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

    @Override
    public ResponseEntity<? super AuthorityExistResponseDto> authExist(String email) {
        try {

            Authority authority = authorityRepository.findByEmail(email);
            if (authority == null)
                return AuthorityExistResponseDto.notExistUser();

            String entireAdmin = authority.getRoleAdmin();
            String codingC1Admin = authority.getRoleAdminC1();
            String codingC2Admin = authority.getRoleAdminC2();

            if (!"NULL".equals(entireAdmin)) {
                return AuthorityExistResponseDto.entireAdmin();
            }
            if (!"NULL".equals(codingC1Admin) || !"NULL".equals(codingC2Admin)) {
                return AuthorityExistResponseDto.codingAdmin();
            }

            return AuthorityExistResponseDto.success();
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

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
                GroupInf existingEntity = groupInfRepository.findByClassNum(dtos.getClassNum());
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
    public ResponseEntity<? super DeleteClassResponseDto> deleteClass(Integer classNum, String email) {
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return DeleteClassResponseDto.notExistUser();

            CodingZoneClass codingZoneClass = codingZoneClassRepository.findByClassNum(classNum);
            if (codingZoneClass == null)
                return DeleteClassResponseDto.noExistArticle();

            codingZoneClassRepository.delete(codingZoneClass);

            return DeleteClassResponseDto.success();
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
    @Transactional
    public ResponseEntity<? super PutAttendanceResponseDto> putAttend(Integer registNum, String email) {
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return PutAttendanceResponseDto.notExistUser();

            CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository.findByRegistrationId(registNum);
            if (codingZoneRegister == null)
                return PutAttendanceResponseDto.validationFailed();

            // 출석 상태 업데이트
            if ("0".equals(codingZoneRegister.getAttendance())) { // 결석(미출석) -> 출석
                codingZoneRegister.putAttend();
            } else {
                codingZoneRegister.putNotAttend(); // 출석 -> 결석
            }

            return PutAttendanceResponseDto.success();
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public ResponseEntity<? super GetListOfCodingZoneClassResponseDto> getClassList(Integer grade, String email) {
        int registedClassNum = 0;
        try {
            log.info("✅ getClassList 진입 완료");
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return GetListOfCodingZoneClassResponseDto.notExistUser();

            if (grade != 1 && grade != 2)
                return GetListOfCodingZoneClassResponseDto.validationFailed();

            // 현재 날짜가 수요일에서 일요일 사이인지 확인 (Asia/Seoul 시간대 적용)
            ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Seoul"));

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

            // 개발 & 테스트 기간을 위한 조건
            ZonedDateTime lowerBound = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    .with(LocalTime.MIN);
            ZonedDateTime upperBound = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                    .with(LocalTime.MAX);

            // 현재 시각이 [이번주 목요일 오후 4시, 이번주 일요일] 범위 내에 있지 않으면 다음 주 수업 정보 번환하지 않기
            if (now.isBefore(lowerBound) || now.isAfter(upperBound)) {
                return GetListOfCodingZoneClassResponseDto.noExistArticle();
            }

            // 다음 주 월요일과 일요일 계산 (Asia/Seoul 시간대 적용)
            ZonedDateTime nextMonday = now.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
            ZonedDateTime nextSunday = nextMonday.plusDays(6);

            // 다음 주 월요일부터 일요일까지의 수업만 조회
            List<CodingZoneClass> classes = codingZoneClassRepository.findBySubjectIdAndClassDateBetween(
                    grade,
                    nextMonday.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    nextSunday.format(DateTimeFormatter.ISO_LOCAL_DATE));
            if (classes.isEmpty())
                return GetListOfCodingZoneClassResponseDto.noExistArticle();

            for (CodingZoneClass classEntity : classes) {
                CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository
                        .findByCodingZoneClassAndUserEmail(classEntity, email);
                if (codingZoneRegister != null) {
                    registedClassNum = classEntity.getClassNum();
                    break;
                }
            }
            return GetListOfCodingZoneClassResponseDto.success(registedClassNum, classes);
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public ResponseEntity<? super GetListOfCodingZoneClassForNotLogInResponseDto> getClassList2(Integer grade) {
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            if (grade != 1 && grade != 2)
                return GetListOfCodingZoneClassForNotLogInResponseDto.validationFailed();

            // 현재 날짜가 수요일에서 일요일 사이인지 확인 (Asia/Seoul 시간대 적용)
            ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Seoul"));

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

            // 개발 & 테스트 기간을 위한 조건
            ZonedDateTime lowerBound = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    .with(LocalTime.MIN);
            ZonedDateTime upperBound = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                    .with(LocalTime.MAX);

            // 현재 시각이 [이번주 목요일 오후 4시, 이번주 일요일] 범위 내에 있지 않으면 다음 주 수업 정보 번환하지 않기
            if (now.isBefore(lowerBound) || now.isAfter(upperBound)) {
                return GetListOfCodingZoneClassResponseDto.noExistArticle();
            }

            // 다음 주 월요일과 일요일 계산 (Asia/Seoul 시간대 적용)
            ZonedDateTime nextMonday = now.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
            ZonedDateTime nextSunday = nextMonday.plusDays(6);

            // 다음 주 월요일부터 일요일까지의 수업만 조회
            List<CodingZoneClass> classEntities = codingZoneClassRepository.findBySubjectIdAndClassDateBetween(
                    grade,
                    nextMonday.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    nextSunday.format(DateTimeFormatter.ISO_LOCAL_DATE));

            if (classEntities.isEmpty())
                return GetListOfCodingZoneClassForNotLogInResponseDto.noExistArticle();

            return GetListOfCodingZoneClassForNotLogInResponseDto.success(classEntities);
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public ResponseEntity<? super GetCountOfAttendResponseDto> getAttend(Integer subjectId, String email) {
        Integer NumOfAttend = 0;
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Seoul"));
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser) return GetCountOfAttendResponseDto.notExistUser();

            // 학년 검증
            if (subjectId != 1 && subjectId != 2) return GetCountOfAttendResponseDto.validationFailed();

            List<CodingZoneClass> classes = codingZoneClassRepository.findAllBySubjectId(subjectId);
            List<CodingZoneRegister> registratedClassList = codingZoneRegisterRepository.findAllByCodingZoneClassIn(classes);

            if (registratedClassList.isEmpty()) return GetCountOfAttendResponseDto.success(NumOfAttend);

            for (CodingZoneRegister register : registratedClassList) {
                if (register.getUserEmail().equals(email)) {
                    String attend = register.getAttendance();

                    if (attend.equals("1")) {
                        NumOfAttend++;
                    }
                    if (attend.equals("0")) {
                        CodingZoneClass codingZoneClass = register.getCodingZoneClass();

                        LocalDate classDate = LocalDate.parse(codingZoneClass.getClassDate()); // 예: "2024-11-01"
                        LocalTime classTime = LocalTime.parse(codingZoneClass.getClassTime()); // 예: "10:00:00"

                        ZonedDateTime classDateTime = ZonedDateTime.of(classDate, classTime, ZoneId.of("Asia/Seoul"));

                        // classDateTime이 now보다 과거일 경우 NumOfAttend 감소
                        if (classDateTime.isBefore(now)) {
                            NumOfAttend--;
                        }
                    }
                }
            }
            return GetCountOfAttendResponseDto.success(NumOfAttend);
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
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
    public ResponseEntity<? super GetCodingZoneStudentListResponseDto> getStudentList(String email) {
        List<CodingZoneStudentListItem> studentList = new ArrayList<>();
        List<CodingZoneRegister> classEntities = new ArrayList<>();
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return GetCodingZoneStudentListResponseDto.notExistUser();

            // 아직 출/결한 수업이 없을 때
            classEntities = codingZoneRegisterRepository.findAllByOrderByUserStudentNumAsc();
            if (classEntities.isEmpty())
                return GetCodingZoneStudentListResponseDto.noExistArticle();

            for (CodingZoneRegister register : classEntities) {
                CodingZoneClass codingZoneClass = register.getCodingZoneClass();
                CodingZoneStudentListItem codingZoneStudentListItem = new CodingZoneStudentListItem(codingZoneClass,
                        register);
                studentList.add(codingZoneStudentListItem);
            }
            return GetCodingZoneStudentListResponseDto.success(studentList);

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
    @Transactional
    public String deleteAll(String email) {
        boolean existedUser = userRepository.existsByEmail(email);
        if (!existedUser) {
            throw new UserNotFoundException("사용자를 찾을 수 없습니다.");
        }

        // 코딩존 관련 모든 테이블 초기화
        codingZoneRegisterRepository.deleteAll();
        groupInfRepository.deleteAll();
        codingZoneClassRepository.deleteAll();

        // 코딩존 조교 권한 취소
        updateAuthorities();
        return "조교 권한을 취소하는데 성공했습니다.";
    }

    // 학기 초기화를 위한 트렌젝션 분리
    @Transactional
    public void updateAuthorities() {
        List<Authority> usersC1 = authorityRepository.findByRoleAdminC1("ROLE_ADMINC1");
        List<Authority> usersC2 = authorityRepository.findByRoleAdminC2("ROLE_ADMINC2");
        List<Authority> usersC3 = authorityRepository.findByRoleAdminC3("ROLE_ADMINC3");
        List<Authority> usersC4 = authorityRepository.findByRoleAdminC4("ROLE_ADMINC4");

        usersC1.forEach(authority -> authority.revokeRole("ROLE_ADMINC1"));
        usersC2.forEach(authority -> authority.revokeRole("ROLE_ADMINC2"));
        usersC3.forEach(authority -> authority.revokeRole("ROLE_ADMINC3"));
        usersC4.forEach(authority -> authority.revokeRole("ROLE_ADMINC4"));
    }

    @Override
    public ResponseEntity<? super GetCodingZoneAssitantListResponseDto> getAssistantList() {
        List<User> ListOfCodingZone1 = new ArrayList<>();
        List<User> ListOfCodingZone2 = new ArrayList<>();
        try {
            String C1 = "ROLE_ADMINC1";
            String C2 = "ROLE_ADMINC2";
            List<Authority> users = authorityRepository.findByRoleAdminC1(C1);
            List<Authority> users2 = authorityRepository.findByRoleAdminC2(C2);
            if (users.isEmpty() || users2.isEmpty())
                return GetCodingZoneAssitantListResponseDto.notExistUser();

            users.forEach(authorityEntity -> {
                User user = userRepository.findByEmail(authorityEntity.getEmail());
                ListOfCodingZone1.add(user);
            });
            users2.forEach(authorityEntity -> {
                User user = userRepository.findByEmail(authorityEntity.getEmail());
                ListOfCodingZone2.add(user);
            });

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetCodingZoneAssitantListResponseDto.success(ListOfCodingZone1, ListOfCodingZone2);
    }

    @Override
    public CodingZoneClassNamesResponseDto getCodingZoneClassNamesByDate(String date) {
        DayOfWeek day = LocalDate.parse(date).getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) throw new BusinessException(ResponseCode.INVAIlD_DATE_WEEKEND, "입력한 날짜가 주말임", HttpStatus.BAD_REQUEST);
        List<CodingZoneClass> codingZoneClasses = codingZoneClassRepository.findAllByClassDate(date);
        if (codingZoneClasses.isEmpty()) throw new BusinessException(ResponseCode.NO_CODINGZONE_DATE, "입력한 평일에 코딩존이 없음", HttpStatus.BAD_REQUEST);
        List<String> classNames = codingZoneClasses.stream()
                .map(CodingZoneClass::getClassName)
                .distinct()
                .toList();
        return new CodingZoneClassNamesResponseDto(classNames);
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
    public List<CodingZoneClassInfoResponseDto> findCodingZoneClassesBySubjectAndDate(Long subjectId, String date) {
        List<CodingZoneClass> codingZoneClasses = codingZoneClassRepository.findBySubject_IdAndClassDate(subjectId.intValue(), date);
        List<CodingZoneClassInfoResponseDto> classInfos = new ArrayList<>();

        for (CodingZoneClass codingZoneClass :codingZoneClasses){
            CodingZoneClassInfoResponseDto dto = new CodingZoneClassInfoResponseDto(
                    codingZoneClass.getClassTime(),
                    codingZoneClass.getAssistantName(),
                    groupInfRepository.findByClassNum(codingZoneClass.getClassNum()).getGroupId(),
                    codingZoneClass.calculateClassStatus(date),
                    codingZoneClass.getClassNum());

            classInfos.add(dto);
        }
        return classInfos;
    }

    @Override
    public ByteArrayResource generateAttendanceExcelOfGrade1() throws IOException {
        List<CodingZoneRegister> codingZoneRegisters;

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("코딩존1 출석부"); // 시트 이름 설정

        // 헤더 생성 및 스타일 설정
        Row headerRow = sheet.createRow(0);
        String[] columns = { "학번", "이름", "수업 날짜", "수업 시간", "출/결석" };
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // 코딩존1을 들은 모든 학생들을 학번순으로 불러오기
        // TODO: 매핑 이후 필드값을 가져오는 방식으로 수정 바람
        List<CodingZoneClass> classes = codingZoneClassRepository.findAllBySubjectId(1);
        codingZoneRegisters = codingZoneRegisterRepository.findAllByCodingZoneClassInOrderByUserStudentNumAsc(classes);

        // 데이터 채우기
        int rowNum = 1;
        for (CodingZoneRegister register : codingZoneRegisters) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(register.getUserStudentNum());
            row.createCell(1).setCellValue(register.getUserName());

            CodingZoneClass codingZoneClass = register.getCodingZoneClass();
            row.createCell(2).setCellValue(codingZoneClass.getClassDate());
            row.createCell(3).setCellValue(codingZoneClass.getClassTime());
            row.createCell(4).setCellValue(register.getAttendance());
        }

        // 워크북을 바이트 배열로 변환
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return new ByteArrayResource(outputStream.toByteArray());

    }

    @Override
    public ByteArrayResource generateAttendanceExcelOfGrade2() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("코딩존1 출석부"); // 시트 이름 설정

        // 헤더 생성 및 스타일 설정
        Row headerRow = sheet.createRow(0);
        String[] columns = { "학번", "이름", "수업 날짜", "수업 시간", "출/결석" };
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // 코딩존1을 들은 모든 학생들을 학번순으로 불러오기
        List<CodingZoneClass> classes = codingZoneClassRepository.findAllBySubjectId(2);
        List<CodingZoneRegister> codingZoneRegisters = codingZoneRegisterRepository.findAllByCodingZoneClassInOrderByUserStudentNumAsc(classes);

        int rowNum = 1;
        for (CodingZoneRegister register : codingZoneRegisters) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(register.getUserStudentNum());
            row.createCell(1).setCellValue(register.getUserName());

            CodingZoneClass codingZoneClass = register.getCodingZoneClass();
            row.createCell(2).setCellValue(codingZoneClass.getClassDate());
            row.createCell(3).setCellValue(codingZoneClass.getClassTime());
            row.createCell(4).setCellValue(register.getAttendance());
        }

        // 워크북을 바이트 배열로 변환
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return new ByteArrayResource(outputStream.toByteArray());

    }
}
