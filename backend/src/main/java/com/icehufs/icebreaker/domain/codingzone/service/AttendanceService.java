package com.icehufs.icebreaker.domain.codingzone.service;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneClass;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ReservationStudentDto;
import com.icehufs.icebreaker.domain.codingzone.exception.UnmappedSubjectException;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneClassRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneRegisterRepository;
import com.icehufs.icebreaker.domain.codingzone.repository.SubjectRepository;

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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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

    public ByteArrayResource getEntireAttendanceExcelFile(Integer subjectId) throws IOException {
    String subjectName = subjectRepository.findById(subjectId)
        .map(Subject::getSubjectName)
        .orElseThrow(UnmappedSubjectException::new);

    List<CodingZoneClass> classes = codingZoneClassRepository.findAllBySubjectId(subjectId);
    List<CodingZoneRegister> registers =
        codingZoneRegisterRepository.findAllByCodingZoneClassInOrderByUserStudentNumAsc(classes);

    // 학번별 출석/결석 집계 -> 인정된 총 출석 수 = max(0, 출석수 - 결석수)
    Map<String, long[]> cnt = new HashMap<>(); // [0]=출석, [1]=결석
    for (CodingZoneRegister r : registers) {
        String key = r.getUserStudentNum();
        long[] c = cnt.computeIfAbsent(key, k -> new long[2]);
        if ("출석".equals(String.valueOf(r.getAttendance()))) c[0]++; else c[1]++;
    }
    Map<String, Integer> totalByStudent = new HashMap<>();
    cnt.forEach((k, c) -> totalByStudent.put(k, (int)Math.max(0, c[0] - c[1])));

    // 정렬: 학번 오름차순, 날짜/시간 내림차순(최신 행에 총합이 찍히도록)
    registers.sort(
        Comparator.comparing(CodingZoneRegister::getUserStudentNum)
            .thenComparing((CodingZoneRegister r) -> r.getCodingZoneClass().getClassDate(), Comparator.reverseOrder())
            .thenComparing(r -> r.getCodingZoneClass().getClassTime(), Comparator.reverseOrder())
    );

    try (Workbook workbook = new XSSFWorkbook();
         ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

        Sheet sheet = workbook.createSheet(subjectName + " 코딩존 출석부");

        // 헤더 설정
        Row headerRow = sheet.createRow(0);
        String[] columns = { "학번", "이름", "수업 날짜", "수업 시간", "출/결석", "인정된 총 출석 수" };
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        // 행 생성: 같은 학번의 첫 행(최신 행)에만 총합 기입
        Set<String> printed = new HashSet<>();
        int rowNum = 1;
        for (CodingZoneRegister r : registers) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(r.getUserStudentNum());
            row.createCell(1).setCellValue(r.getUserName());
            row.createCell(2).setCellValue(String.valueOf(r.getCodingZoneClass().getClassDate()));
            row.createCell(3).setCellValue(String.valueOf(r.getCodingZoneClass().getClassTime()));
            row.createCell(4).setCellValue(String.valueOf(r.getAttendance()));

            String key = r.getUserStudentNum();
            if (!printed.contains(key)) {
                row.createCell(5).setCellValue(totalByStudent.getOrDefault(key, 0));
                printed.add(key);
            } else {
                row.createCell(5).setCellValue("");
            }
        }

        for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);

        workbook.write(outputStream);
        return new ByteArrayResource(outputStream.toByteArray());
    }
}
}
