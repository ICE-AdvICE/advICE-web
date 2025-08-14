package com.icehufs.icebreaker.domain.codingzone.dto.response;

import lombok.Getter;

@Getter
public class ClassResponseDto {

    private Integer classNum;
    private String assistantName;
    private String classTime;
    private String classDate;
    private Integer currentNumber;
    private Integer maximumNumber;
    private String className;
    private String weekDay;
    private Integer subjectId;

    public ClassResponseDto(Integer classNum, String assistantName, String classTime, String classDate, int currentNumber, int maximumNumber, String className, String weekDay, Integer id) {
        this.classNum = classNum;
        this.assistantName = assistantName;
        this.classTime = classTime;
        this.classDate = classDate;
        this.currentNumber = currentNumber;
        this.maximumNumber = maximumNumber;
        this.className = className;
        this.weekDay = weekDay;
        this.subjectId = id;
    }
}
