package com.icehufs.icebreaker.util;

import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Getter
@AllArgsConstructor
@EqualsAndHashCode
public class CodingZoneClassIdentityDto {

    private String assistantName;
    private String classDate;
    private String classTime;
    private String className;
    private int maximumNumber;
    private String weekDay;
    private int subjectId;
    private String groupId;

    public CodingZoneClassIdentityDto(CodingZoneClassAssignRequestDto dto) {
        this.assistantName = dto.getAssistantName();
        this.classDate = dto.getClassDate();
        this.classTime = dto.getClassTime();
        this.className = dto.getClassName();
        this.maximumNumber = dto.getMaximumNumber();
        this.weekDay = dto.getWeekDay();
        this.subjectId = dto.getSubjectId();
        this.groupId = dto.getGroupId();
    }
}
