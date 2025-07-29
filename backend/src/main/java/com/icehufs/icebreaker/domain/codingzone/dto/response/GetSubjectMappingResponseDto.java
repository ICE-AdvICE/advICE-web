package com.icehufs.icebreaker.domain.codingzone.dto.response;

import java.util.List;

import com.icehufs.icebreaker.util.SubjectDto;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class GetSubjectMappingResponseDto {

  private List<SubjectDto> subjectList;
  
}
