package com.icehufs.icebreaker.domain.codingzone.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Entity(name = "codingzoneregister")
@Table(name = "codingzoneregister")
public class CodingZoneRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "registration_id")
    private Integer registrationId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_student_num", nullable = false)
    private String userStudentNum;

    @Column(name = "attendance", nullable = false)
    private String attendance;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "class_num")
    private int classNum;

     //subject 테이블 : codingzoneRegister 테이블 = 1 : N 관계
    @JoinColumn(name = "subject_id")   
    @ManyToOne(fetch = FetchType.LAZY) 
    private CodingZoneClass codingZoneClass; 

    public CodingZoneRegister(String email, String name, String user_student_num, Integer classNum,
            CodingZoneClass codingZoneClass) {
        this.classNum = classNum;
        this.userEmail = email;
        this.userName = name;
        this.userStudentNum = user_student_num;
        this.attendance = "0";
        this.codingZoneClass = codingZoneClass;
    }
    
    public CodingZoneRegister(String email, String name, String user_student_num, Integer classNum) {
        this.classNum = classNum;
        this.userEmail = email;
        this.userName = name;
        this.userStudentNum = user_student_num;
        this.attendance = "0";
    }

    public void putAttend() {
        this.attendance = "1";
    }

    public void putNotAttend() {
        this.attendance = "0";
    }
}
