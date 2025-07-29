package com.icehufs.icebreaker.domain.codingzone.dto.response;

import java.util.List;
import com.icehufs.icebreaker.util.SubjectResponseDto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GetSubjectMappingResponseDto {

  private List<SubjectResponseDto> subjectList;
  
}
