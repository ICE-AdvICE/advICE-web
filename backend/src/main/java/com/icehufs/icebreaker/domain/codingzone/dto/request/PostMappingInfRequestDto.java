package com.icehufs.icebreaker.domain.codingzone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PostMappingInfRequestDto {

    @NotNull
    @Min(1)
    private Integer subjectId;

    @NotNull
    private String subjectName;
}
