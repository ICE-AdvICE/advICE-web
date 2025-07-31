package com.icehufs.icebreaker.domain.codingzone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GroupInfUpdateRequestDto {
    
    @NotBlank
    private String groupId; //A,B 조

    @NotBlank
    private String assistantName; //조교 이름

    @NotBlank
    private String classTime; //수업 시작 시간

    @NotBlank
    private String className; //과목 명

    @NotNull
    @Min(1)
    private Integer maximumNumber; //최대 인원수

    @NotBlank
    private String weekDay; //요일

    @NotNull
    private int subjectId;
}
