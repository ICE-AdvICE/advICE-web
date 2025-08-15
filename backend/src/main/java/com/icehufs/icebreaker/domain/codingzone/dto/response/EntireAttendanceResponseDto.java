package com.icehufs.icebreaker.domain.codingzone.dto.response;

import java.util.List;

import com.icehufs.icebreaker.domain.codingzone.dto.object.SubjectAttendanceListItem;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EntireAttendanceResponseDto {
    private List<SubjectAttendanceListItem> studentList;
}
