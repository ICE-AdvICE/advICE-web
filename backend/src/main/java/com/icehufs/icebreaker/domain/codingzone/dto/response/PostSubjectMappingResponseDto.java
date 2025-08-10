package com.icehufs.icebreaker.domain.codingzone.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostSubjectMappingResponseDto<T> {

    private String code;
    private String message;
    private T data;

}
