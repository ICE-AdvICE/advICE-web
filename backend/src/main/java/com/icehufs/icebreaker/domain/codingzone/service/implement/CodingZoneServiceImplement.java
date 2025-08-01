package com.icehufs.icebreaker.domain.codingzone.service.implement;

import com.icehufs.icebreaker.domain.codingzone.dto.response.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.request.PatchGroupInfRequestDto;
import com.icehufs.icebreaker.domain.codingzone.dto.object.CodingZoneStudentListItem;
import com.icehufs.icebreaker.domain.codingzone.dto.object.PersAttendManagListItem;
import com.icehufs.icebreaker.domain.codingzone.dto.object.ReservedClassListItem;
import com.icehufs.icebreaker.common.ResponseDto;
import com.icehufs.icebreaker.domain.article.dto.response.CheckOwnOfArticleResponseDto;
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

@Service
@RequiredArgsConstructor
public class CodingZoneServiceImplement implements CodingZoneService {

    private final CodingZoneClassRepository codingZoneClassRepository;
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final GroupInfRepository groupInfRepository;
    private final CodingZoneRegisterRepository codingZoneRegisterRepository;

    @Override
    public ResponseEntity<? super CodingZoneClassAssignResponseDto> codingzoneClassAssign(
            List<CodingZoneClassAssignRequestDto> dto, String email) {
        try {
            // 사용자 계정이 존재하는지(로그인시간이 초과 됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return CheckOwnOfArticleResponseDto.notExistUser();

            for (CodingZoneClassAssignRequestDto requestDto : dto) {
                CodingZoneClass codingZoneClassEntity = new CodingZoneClass(requestDto);
                codingZoneClassRepository.save(codingZoneClassEntity);
            }

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return CodingZoneClassAssignResponseDto.success();
    }

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

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return AuthorityExistResponseDto.success();
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
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GroupInfUpdateResponseDto.success();
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

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetListOfGroupInfResponseDto.success(groupInfEntities);
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

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GroupInfUpdateResponseDto.success();

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

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return DeleteClassResponseDto.success();
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

            CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository.findByClassNumAndUserEmail(classNum,
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
            int subjectId = codingZoneClass.getSubjectId();
            CodingZoneRegister newRegisterEntity = new CodingZoneRegister(subjectId, email, userName, userStudentNum,
                    classNum);
            codingZoneRegisterRepository.save(newRegisterEntity);
            codingZoneClass.increaseNum(); // 예약자 수 증가
            codingZoneClassRepository.save(codingZoneClass);

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return CodingZoneRegisterResponseDto.success();
    }

    @Override
    @Transactional
    public ResponseEntity<? super CodingZoneCanceResponseDto> classCance(Integer classNum, String email) {
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
            CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository.findByClassNumAndUserEmail(classNum,
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
            codingZoneRegisterRepository.save(codingZoneRegister);

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return PutAttendanceResponseDto.success();
    }

    @Override
    public ResponseEntity<? super GetListOfCodingZoneClassResponseDto> getClassList(Integer grade, String email) {
        List<CodingZoneClass> classEntities = new ArrayList<>();
        int registedClassNum = 0;
        try {
            System.out.println("✅ getClassList 진입 완료");
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
            classEntities = codingZoneClassRepository.findBySubjectIdAndClassDateBetween(
                    grade,
                    nextMonday.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    nextSunday.format(DateTimeFormatter.ISO_LOCAL_DATE));
            if (classEntities.isEmpty())
                return GetListOfCodingZoneClassResponseDto.noExistArticle();

            for (CodingZoneClass classEntity : classEntities) {
                CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository
                        .findByClassNumAndUserEmail(classEntity.getClassNum(), email);
                if (codingZoneRegister != null) {
                    registedClassNum = classEntity.getClassNum();
                    break;
                }
            }

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetListOfCodingZoneClassResponseDto.success(registedClassNum, classEntities);
    }

    @Override
    public ResponseEntity<? super GetListOfCodingZoneClassForNotLogInResponseDto> getClassList2(Integer grade) {
        List<CodingZoneClass> classEntities = new ArrayList<>();
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
            classEntities = codingZoneClassRepository.findBySubjectIdAndClassDateBetween(
                    grade,
                    nextMonday.format(DateTimeFormatter.ISO_LOCAL_DATE),
                    nextSunday.format(DateTimeFormatter.ISO_LOCAL_DATE));

            if (classEntities.isEmpty())
                return GetListOfCodingZoneClassForNotLogInResponseDto.noExistArticle();

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetListOfCodingZoneClassForNotLogInResponseDto.success(classEntities);
    }

    @Override
    public ResponseEntity<? super GetCountOfAttendResponseDto> getAttend(Integer grade, String email) {
        Integer NumOfAttend = 0;
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Seoul"));
        List<CodingZoneRegister> classEntities = new ArrayList<>();
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return GetCountOfAttendResponseDto.notExistUser();

            // 학년 검증
            if (grade != 1 && grade != 2)
                return GetCountOfAttendResponseDto.validationFailed();

            classEntities = codingZoneRegisterRepository.findByGrade(grade);
            if (classEntities.isEmpty())
                return GetCountOfAttendResponseDto.success(NumOfAttend);

            for (CodingZoneRegister entity : classEntities) {
                if (entity.getUserEmail().equals(email)) {
                    String attend = entity.getAttendance();
                    if (attend.equals("1")) {
                        NumOfAttend++;
                    }
                    if (attend.equals("0")) {
                        CodingZoneClass codingZoneClass = codingZoneClassRepository
                                .findByClassNum(entity.getClassNum());

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

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetCountOfAttendResponseDto.success(NumOfAttend);
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

            for (CodingZoneRegister codingZoneRegister : classEntities) {
                CodingZoneClass codingZoneClass = codingZoneClassRepository
                        .findByClassNum(codingZoneRegister.getClassNum());
                PersAttendManagListItem persAttendManagListItem = new PersAttendManagListItem(codingZoneClass,
                        codingZoneRegister);
                attendClassEntities.add(persAttendManagListItem);
            }
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetPersAttendListItemResponseDto.success(attendClassEntities);

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

            for (CodingZoneRegister codingZoneRegister : classEntities) {
                CodingZoneClass codingZoneClass = codingZoneClassRepository
                        .findByClassNum(codingZoneRegister.getClassNum());
                CodingZoneStudentListItem codingZoneStudentListItem = new CodingZoneStudentListItem(codingZoneClass,
                        codingZoneRegister);
                studentList.add(codingZoneStudentListItem);
            }
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetCodingZoneStudentListResponseDto.success(studentList);

    }

    @Override
    public ResponseEntity<? super GetReservedClassListItemResponseDto> getReservedClass(String classDate,
            String email) {
        List<ReservedClassListItem> studentList = new ArrayList<>();
        List<CodingZoneRegister> classEntities = new ArrayList<>();
        int kindOfClass = 0;
        try {
            // 사용자 계정이 존재하는지(로그인 시간이 초과됐는지) 확인하는 코드
            User user = userRepository.findByEmail(email);
            if (user == null)
                return GetReservedClassListItemResponseDto.notExistUser();

            Authority authority = authorityRepository.findByEmail(email);
            if (!"NULL".equals(authority.getRoleAdminC1())) {
                kindOfClass = 1;
            }
            if (!"NULL".equals(authority.getRoleAdminC2())) {
                kindOfClass = 2;
            }

            classEntities = codingZoneRegisterRepository.findByGrade(kindOfClass);
            // 예약한 학생이 없을 때
            if (classEntities.isEmpty())
                return GetReservedClassListItemResponseDto.noExistArticle();

            for (CodingZoneRegister codingZoneRegister : classEntities) {
                CodingZoneClass codingZoneClass = codingZoneClassRepository
                        .findByClassNum(codingZoneRegister.getClassNum());
                if (classDate.equals(codingZoneClass.getClassDate())) {
                    ReservedClassListItem reservedClassListItem = new ReservedClassListItem(codingZoneClass,
                            codingZoneRegister);
                    studentList.add(reservedClassListItem);
                }
            }
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        if (studentList.isEmpty())
            return GetReservedClassListItemResponseDto.noExistArticle();
        return GetReservedClassListItemResponseDto.success(studentList);

    }

    @Override
    public ResponseEntity<? super DeleteAllInfResponseDto> deleteAll(String email) {
        try {
            boolean existedUser = userRepository.existsByEmail(email);
            if (!existedUser)
                return DeleteAllInfResponseDto.notExistUser();

            // 코딩존 관련 모든 테이블 초기화
            deleteAllData();

            // 코딩존 조교 권한 취소
            updateAuthorities();

        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return DeleteAllInfResponseDto.success();
    }

    // 학기 초기화를 위한 트렌젝션 분리
    @Transactional
    private void deleteAllData() {
        codingZoneRegisterRepository.deleteAll();
        groupInfRepository.deleteAll();
        codingZoneClassRepository.deleteAll();
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
        codingZoneRegisters = codingZoneRegisterRepository.findByGradeOrderByUserStudentNumAsc(1);

        // 데이터 채우기
        int rowNum = 1;
        for (CodingZoneRegister register : codingZoneRegisters) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(register.getUserStudentNum());
            row.createCell(1).setCellValue(register.getUserName());

            int classNum = register.getClassNum();
            CodingZoneClass codingZoneClass = codingZoneClassRepository.findByClassNum(classNum);
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
        codingZoneRegisters = codingZoneRegisterRepository.findByGradeOrderByUserStudentNumAsc(2);

        // 데이터 채우기
        int rowNum = 1;
        for (CodingZoneRegister register : codingZoneRegisters) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(register.getUserStudentNum());
            row.createCell(1).setCellValue(register.getUserName());

            int classNum = register.getClassNum();
            CodingZoneClass codingZoneClass = codingZoneClassRepository.findByClassNum(classNum);
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