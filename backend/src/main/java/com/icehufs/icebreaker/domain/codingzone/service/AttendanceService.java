package com.icehufs.icebreaker.domain.codingzone.service;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ReservationStudentDto;
import com.icehufs.icebreaker.domain.codingzone.exception.UnmappedSubjectException;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneClassRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneRegisterRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.SubjectRepository;
import com.icehufs.icebreaker.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.Workbook; 
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.HashMap;
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
    private final CodingZoneClassRepository codingZoneClassRepository;
    private final SubjectRepository subjectRepository;

    public List<ReservationStudentDto> getReservationStudentsByClassNum (Integer classNum) {
        List<CodingZoneRegister> reservations = codingZoneRegisterRepository.findByCodingZoneClassClassNum(classNum);
        return reservations.stream()
                .map(reservation -> new ReservationStudentDto(
                        reservation.getUserName(),
                        reservation.getUserStudentNum(),
                        reservation.getCodingZoneClass().getClassNum()
                ))
                .collect(Collectors.toList());
    }

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
            createHeaderRow(workbook, sheet, columns);

            Set<String> printed = new HashSet<>();
            int rowNum = 1;

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
            sheet.createFreezePane(0, 1);
            workbook.write(outputStream);

            return new ByteArrayResource(outputStream.toByteArray());

        } catch (IOException e) {
            throw new BusinessException(ResponseCode.INTERNAL_SERVER_ERROR,"엑셀 파일 생성 중 오류 발생", HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}

    private void createHeaderRow(Workbook wb, Sheet sheet, String[] columns) {
        Row headerRow = sheet.createRow(0);
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
