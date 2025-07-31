package com.icehufs.icebreaker.domain.codingzone.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.icehufs.icebreaker.domain.codingzone.dto.request.CodingZoneClassAssignRequestDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter
@Entity(name = "codingzoneclass")
@Table(name = "codingzoneclass")
public class CodingZoneClass {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_num")
    private int classNum;

    @Column(name = "assistant_name")
    private String assistantName;

    @Column(name = "class_time")
    private String classTime;

    @Column(name = "class_date")
    private String classDate;

    @Column(name = "current_number")
    private int currentNumber;

    @Column(name = "maximum_number")
    private int maximumNumber;

    @Column(name = "class_name")
    private String className;

    @Column(name = "week_day")
    private String weekDay;

    @Column(name = "subject_id")
    private int subjectId;

    public CodingZoneClass(CodingZoneClassAssignRequestDto dto) {
        this.assistantName = dto.getAssistantName();
        this.classTime = dto.getClassTime();
        this.classDate = dto.getClassDate();
        this.currentNumber = 0;
        this.maximumNumber = dto.getMaximumNumber();
        this.className = dto.getClassName();
        this.weekDay = dto.getWeekDay();
        this.subjectId = dto.getSubjectId();
    }

    public void increaseNum() {
        this.currentNumber++;
    }

    public void decreaseNum(){
        this.currentNumber--;
    }
}
