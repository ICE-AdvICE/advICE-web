package com.icehufs.icebreaker.domain.codingzone.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class HandleAuthRequestDto {

    @NotBlank
    private String email; // 권한을 줄 사용자 이메일

    @NotBlank
    private String role; // 권한의 종류
}
