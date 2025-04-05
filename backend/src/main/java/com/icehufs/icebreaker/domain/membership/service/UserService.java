package com.icehufs.icebreaker.domain.membership.service;

import com.icehufs.icebreaker.domain.membership.dto.request.AuthorityRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserPassRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.response.GetSignInUserResponseDto;

public interface UserService {

    GetSignInUserResponseDto getSignInUser(String email);
    String patchUserInfo(PatchUserRequestDto dto, String email);
    String patchUserPassword(PatchUserPassRequestDto dto);
    String deleteUser(String email);
    String auth1Exist(String email);
}

