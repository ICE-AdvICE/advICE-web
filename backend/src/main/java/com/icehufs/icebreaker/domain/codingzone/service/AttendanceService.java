package com.icehufs.icebreaker.domain.codingzone.service;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;
import com.icehufs.icebreaker.domain.codingzone.dto.response.RegisterInfoResponseDto;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ReservationStudentDto;
import com.icehufs.icebreaker.domain.codingzone.exception.UnmappedSubjectException;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneClassRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneRegisterRepository;
import com.icehufs.icebreaker.exception.BusinessException;
import com.icehufs.icebreaker.domain.codingzone.repository.SubjectRepository;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.springframework.core.io.ByteArrayResource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final CodingZoneRegisterRepository codingZoneRegisterRepository;
    private final AuthorityRepository authorityRepository;
    private final CodingZoneClassRepository codingZoneClassRepository;
    private final SubjectRepository subjectRepository;

    @Transactional(readOnly = true)
    public List<ReservationStudentDto> getReservationStudentsByClassNum(Integer classNum) {
        List<CodingZoneRegister> reservations = codingZoneRegisterRepository.findByCodingZoneClassClassNum(classNum);
        return reservations.stream()
                .map(reservation -> new ReservationStudentDto(
                        reservation.getUserName(),
                        reservation.getUserStudentNum(),
                        reservation.getCodingZoneClass().getClassNum()
                ))
                .collect(Collectors.toList());
    }

    public List<RegisterInfoResponseDto> getReservationStudentsByDate(String email, String date) {
        Integer subjectId = authorityRepository.findByEmail(email)
                .getClassAdminAuth()
                .map(role -> role.replace("ROLE_ADMINC", ""))
                .map(Integer::parseInt)
                .orElseThrow(() -> new BusinessException(ResponseCode.NO_PERMISSION, "코딩존 조교가 아닙니다.", HttpStatus.BAD_REQUEST));

        return codingZoneClassRepository.findBySubjectIdAndClassDate(subjectId, date).stream()
                .flatMap(codingZoneClass -> codingZoneRegisterRepository.findByCodingZoneClassClassNum(codingZoneClass.getClassNum()).stream()
                        .map(register -> new RegisterInfoResponseDto(
                                register.getRegistrationId(),
                                register.getUserStudentNum(),
                                register.getUserName(),
                                register.getUserEmail(),
                                codingZoneClass.getClassName(),
                                codingZoneClass.getSubject().getId(),
                                codingZoneClass.getClassTime(),
                                codingZoneClass.getAssistantName(),
                                register.getAttendance()
                        ))
                ).toList();
    }

    @Transactional
    public Integer updateAttendanceStatus(Integer registNum, String email) {
        CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository.findByRegistrationId(registNum)
                .orElseThrow(() -> new BusinessException(ResponseCode.REGISTRATION_NOT_FOUND, ResponseMessage.REGISTRATION_NOT_FOUND, HttpStatus.BAD_REQUEST));

        if (!hasAuthorityForClass(email, codingZoneRegister))
            throw new BusinessException(ResponseCode.AUTHORIZATION_FAIL, ResponseMessage.AUTHORIZATION_FAIL, HttpStatus.FORBIDDEN);

        return Integer.valueOf(codingZoneRegister.toggleAttendance());
    }

    private boolean hasAuthorityForClass(String email, CodingZoneRegister reg) {
        Authority authority = authorityRepository.findByEmail(email);
        if ("ROLE_ADMIN".equals(authority.getRoleAdmin())) return true;

        Integer subjectId = reg.getCodingZoneClass().getSubject().getId();
        String requiredRole = "ROLE_ADMINC" + subjectId;

        return authority.hasRole(requiredRole);
    }

    @Transactional(readOnly = true)
    public ByteArrayResource getEntireAttendanceExcelFile(Integer subjectId) {
        String subjectName = subjectRepository.findById(subjectId)
            .map(Subject::getSubjectName)
            .orElseThrow(UnmappedSubjectException::new);

        List<CodingZoneClass> classes = codingZoneClassRepository.findAllBySubjectId(subjectId);
        List<CodingZoneRegister> registers =
            codingZoneRegisterRepository.findAllByCodingZoneClassInOrderByUserStudentNumAsc(classes);

        Map<String, Integer> totalByStudent = calculateTotalAttendanceByStudent(registers);
        sortRegisters(registers);

        return generateExcelFile(subjectName, registers, totalByStudent);
    }

    private Map<String, Integer> calculateTotalAttendanceByStudent(List<CodingZoneRegister> registers) {
        final String PRESENT_CODE = "1";
        final String ABSENT_CODE  = "0";

        return registers.stream()
        .collect(Collectors.groupingBy(
            CodingZoneRegister::getUserStudentNum,
            Collectors.summingInt(r -> {
                String att = Objects.toString(r.getAttendance(), "");
                if (PRESENT_CODE.equals(att)) return 1;
                if (ABSENT_CODE.equals(att)) return -1;
                return 0;
            })
        ))
        .entrySet().stream()
        .collect(Collectors.toMap(
            Map.Entry::getKey,
            e -> Math.max(0, e.getValue())
        ));
    }

    private void sortRegisters(List<CodingZoneRegister> registers) {
        registers.sort(
            Comparator.comparing(CodingZoneRegister::getUserStudentNum)
                .thenComparing((CodingZoneRegister r) -> r.getCodingZoneClass().getClassDate(), Comparator.reverseOrder())
                .thenComparing((CodingZoneRegister r) -> r.getCodingZoneClass().getClassTime(), Comparator.reverseOrder())
        );
    }

    private ByteArrayResource generateExcelFile(String subjectName, List<CodingZoneRegister> registers, Map<String, Integer> totalByStudent) {
        final String PRESENT_CODE = "1";
        final String PRESENT_TEXT = "출석";
        final String ABSENT_TEXT  = "결석";

        try (Workbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(subjectName + " 코딩존 출석부");
            String[] columns = { "학번", "이름", "수업 날짜", "수업 시간", "출/결석", "인정된 총 출석 수" };

            // 제목 행 생성
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(subjectName + " 코딩존 출석부");

            // 스타일 설정: 제목을 굵게 & 가운데 정렬
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleCell.setCellStyle(titleStyle);

            // 제목 셀 병합 (컬럼 개수만큼)
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, columns.length - 1));

            // 헤더 행 생성 (1행 내려감)
            createHeaderRow(workbook, sheet, columns, 1);

            Set<String> printed = new HashSet<>();
            int rowNum = 2; // 데이터는 2행부터 시작

            for (CodingZoneRegister r : registers) {
                Row row = sheet.createRow(rowNum++);

                String studentNum = r.getUserStudentNum();
                String userName   = r.getUserName();
                String dateStr    = Objects.toString(r.getCodingZoneClass().getClassDate(), "");
                String timeStr    = Objects.toString(r.getCodingZoneClass().getClassTime(), "");
                String att        = Objects.toString(r.getAttendance(), "");

                row.createCell(0).setCellValue(studentNum);
                row.createCell(1).setCellValue(userName);
                row.createCell(2).setCellValue(dateStr);
                row.createCell(3).setCellValue(timeStr);
                row.createCell(4).setCellValue(PRESENT_CODE.equals(att) ? PRESENT_TEXT : ABSENT_TEXT);

                if (printed.add(studentNum)) {
                    row.createCell(5).setCellValue(totalByStudent.getOrDefault(studentNum, 0));
                } else {
                    row.createCell(5).setCellValue("");
                }
            }

            autoSizeColumns(sheet, columns.length);
            sheet.createFreezePane(0, 2); // 제목 + 헤더 고정
            workbook.write(outputStream);

            return new ByteArrayResource(outputStream.toByteArray());

        } catch (IOException e) {
            throw new BusinessException(
                ResponseCode.INTERNAL_SERVER_ERROR, "엑셀 파일 생성 중 오류 발생", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void createHeaderRow(Workbook wb, Sheet sheet, String[] columns, int startRow) {
        Row headerRow = sheet.createRow(startRow);
        CellStyle headerStyle = wb.createCellStyle();
        Font headerFont = wb.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void autoSizeColumns(Sheet sheet, int colCount) {
        for (int i = 0; i < colCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }
}
