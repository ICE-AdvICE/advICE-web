package com.icehufs.icebreaker.domain.membership.domain.entity;

import com.icehufs.icebreaker.domain.membership.domain.exception.DuplicatePasswordException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.icehufs.icebreaker.domain.auth.dto.request.SignUpRequestDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Getter
@Table(name = "user")
public class User {
    @Id
    @Column(name = "user_email")
    private String email;

    @Column(name = "user_student_num")
    private String studentNum;

    @Column(name = "user_password")
    private String password;

    @Column(name = "user_name")
    private String name;

    public void changeUserInfo(String studentNum, String name){
        this.studentNum = studentNum;
        this.name = name;
    }

    public void changeUserPassword(String password){
        if (this.password.equals(password)) {
            throw new DuplicatePasswordException("현재 비밀번호와 변경하려는 비밀번호가 동일합니다.");
        }
        this.password = password;
    }

    public User(SignUpRequestDto dto) {
        this.email = dto.getEmail();
        this.studentNum = dto.getStudentNum();
        this.password = dto.getPassword();
        this.name = dto.getName();
    }
}
