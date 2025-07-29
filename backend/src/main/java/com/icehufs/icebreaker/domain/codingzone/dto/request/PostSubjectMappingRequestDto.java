package com.icehufs.icebreaker.domain.codingzone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PostSubjectMappingRequestDto {

    @NotNull
    @Min(1)
    private Integer subjectId;

    @NotNull
    private String subjectName;
}
