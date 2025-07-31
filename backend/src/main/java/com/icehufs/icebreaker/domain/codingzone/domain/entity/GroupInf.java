package com.icehufs.icebreaker.domain.codingzone.domain.entity;

import com.icehufs.icebreaker.domain.codingzone.dto.request.GroupInfUpdateRequestDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Setter
@Entity(name = "groupinf")
@Table(name = "groupinf")
public class GroupInf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_num")
    private int classNum;

    @Column(name = "assistant_name")
    private String assistantName; // 조교 이름

    @Column(name = "group_id")
    private String groupId; // A,B 조

    @Column(name = "class_time")
    private String classTime; // 수업 시작 시간

    @Column(name = "week_day")
    private String weekDay; //요일

    @Column(name = "maximum_number")
    private int maximumNumber; //최대인원

    @Column(name = "class_name")
    private String className; //과목명

    @Column(name = "subject_id")
    private int subjectId;

    public GroupInf(GroupInfUpdateRequestDto dto) {
        this.assistantName = dto.getAssistantName();
        this.classTime = dto.getClassTime();
        this.weekDay = dto.getWeekDay();
        this.groupId = dto.getGroupId();
        this.maximumNumber = dto.getMaximumNumber();
        this.className = dto.getClassName();
        this.subjectId = dto.getSubjectId();
    }
    
}
