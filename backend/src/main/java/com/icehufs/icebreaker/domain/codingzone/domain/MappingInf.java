package com.icehufs.icebreaker.domain.codingzone.domain;


import com.icehufs.icebreaker.domain.codingzone.dto.request.PostMappingInfRequestDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@ToString
@AllArgsConstructor 
@NoArgsConstructor
@Getter
@Setter
@Entity(name = "mappinginf")
@Table(name = "mappinginf") // 매핑 정보 Entity
public class MappingInf {

  @Id //subject_id를 pk로 설정
  @Column(name = "subject_id")
  private Integer subjectId;

  @Column(name = "subject_name")
  private String subjectName;

  public MappingInf(PostMappingInfRequestDto dto) {
        this.subjectId = dto.getSubjectId();
        this.subjectName = dto.getSubjectName();
    }

  
}