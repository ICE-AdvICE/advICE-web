package com.icehufs.icebreaker.domain.membership.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;

@Getter
public class ChangeUserPasswordRequestDto {

    @NotBlank
    private String password;

    @NotBlank
    private String email;

    public void setEmail(String email) {
        this.email = email + "@hufs.ac.kr";
    }
}
