package com.icehufs.icebreaker.domain.codingzone.dto.response;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.Subject;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
public class SubjectResponseDto {

    private Integer subjectId;
    private String subjectName;

    public SubjectResponseDto(Integer subjectId, String subjectName) {
        this.subjectId = subjectId;
        this.subjectName = subjectName;
    }
}
