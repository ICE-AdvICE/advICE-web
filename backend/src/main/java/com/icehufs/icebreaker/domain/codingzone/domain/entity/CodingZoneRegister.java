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

@NoArgsConstructor
@AllArgsConstructor
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

    @JoinColumn(
            name = "class_id",
            referencedColumnName = "class_num"
    )
    @ManyToOne(fetch = FetchType.LAZY)
    private CodingZoneClass codingZoneClass;

    public CodingZoneRegister(String name, String user_student_num, String email, CodingZoneClass codingZoneClass) {
        this.userName = name;
        this.userStudentNum = user_student_num;
        this.userEmail = email;
        this.attendance = "0";
        this.codingZoneClass = codingZoneClass;
    }

    public String toggleAttendance() {
        attendance = "1".equals(this.attendance) ? "0" : "1";
        return attendance;
    }
}
