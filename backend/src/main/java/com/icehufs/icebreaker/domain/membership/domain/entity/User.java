package com.icehufs.icebreaker.domain.membership.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.icehufs.icebreaker.domain.auth.dto.request.SignUpRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserPassRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserRequestDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
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

    public void patchUser(PatchUserRequestDto dto){
        this.studentNum = dto.getStudentNum();
        this.name = dto.getName();
    }

    public void patchUserPassword(String password){
        this.password = password;
    }

    public User(SignUpRequestDto dto) {
        this.email = dto.getEmail();
        this.studentNum = dto.getStudentNum();
        this.password = dto.getPassword();
        this.name = dto.getName();

    }


}

