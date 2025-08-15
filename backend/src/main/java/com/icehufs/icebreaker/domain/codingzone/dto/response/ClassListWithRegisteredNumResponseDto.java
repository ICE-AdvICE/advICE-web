package com.icehufs.icebreaker.domain.codingzone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ClassListWithRegisteredNumResponseDto {

    private List<ClassResponseDto> classList;
    private Integer registedClassNum;

}
