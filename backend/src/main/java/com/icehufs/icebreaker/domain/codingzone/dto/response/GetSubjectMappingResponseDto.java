package com.icehufs.icebreaker.domain.codingzone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GetSubjectMappingResponseDto<T> {

  private String code;
  private String message;
  private T data;
  
}
