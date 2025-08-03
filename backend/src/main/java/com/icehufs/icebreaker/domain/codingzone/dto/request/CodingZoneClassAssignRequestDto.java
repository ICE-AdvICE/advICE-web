package com.icehufs.icebreaker.domain.codingzone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class CodingZoneClassAssignRequestDto {

    @NotBlank
    @NotNull
    private String assistantName;//조교 이름

    @NotBlank
    @NotNull
    private String classTime;//수업 시작 시간 (예 13:00:00)

    @NotBlank
    @NotNull 
    private String classDate;// 수업 날짜 (예 2024-07-21)

    @NotBlank
    private String weekDay; //수업 요일

    @NotNull
    private String groupId;  

    @NotNull
    @Min(1)
    private Integer maximumNumber;//최대 인원수

    @NotNull // 등록 페이지에서 교과목 명을 버튼 선택으로 하고 이때 넘어오는 값이 빈칸을 포함할 수 있기 때문에 @NotBlank설정을 삭제
    private String className; //과목 명

    @NotNull
    private int subjectId; // 수정

    @NotNull
    private final Integer currentNumber = 0; // 수업 등록에서는 "예약 가능한 현재 인원이 0으로 초기화 되기 때문에 상수로 선언"
}
