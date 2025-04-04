package com.icehufs.icebreaker.domain.membership.service;

import org.springframework.http.ResponseEntity;

import com.icehufs.icebreaker.domain.membership.dto.request.AuthorityRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserPassRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.response.Authority1ExistResponseDto;
import com.icehufs.icebreaker.domain.membership.dto.response.AuthorityResponseDto;
import com.icehufs.icebreaker.domain.membership.dto.response.GetSignInUserResponseDto;
import com.icehufs.icebreaker.domain.membership.dto.response.PatchUserResponseDto;

public interface UserService {

    ResponseEntity<? super GetSignInUserResponseDto> getSignInUser(String email);
    String patchUser(PatchUserRequestDto dto, String email);
    String patchUserPassword(PatchUserPassRequestDto dto);
    String deleteUser(String email);
    ResponseEntity<? super AuthorityResponseDto> giveAuthority(AuthorityRequestDto dto, String email);
    ResponseEntity<? super Authority1ExistResponseDto> auth1Exist(String email);
}

