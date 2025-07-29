package com.icehufs.icebreaker.domain.codingzone.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@ToString
@AllArgsConstructor 
@NoArgsConstructor
@Getter
@Entity(name = "subject")
@Table(name = "subject") // 매핑 정보 Entity
public class Subject {

  @Id //subject_id를 pk로 설정
  @Column(name = "subject_id")
  private Integer subjectId;

  @Column(name = "subject_name")
  private String subjectName;

}
