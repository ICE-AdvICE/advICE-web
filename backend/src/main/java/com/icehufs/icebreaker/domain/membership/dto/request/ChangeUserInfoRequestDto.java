package com.icehufs.icebreaker.domain.membership.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;

@Getter
public class ChangeUserInfoRequestDto {
    
    @NotBlank
    private String studentNum;

    @NotBlank
    private String name;

}
