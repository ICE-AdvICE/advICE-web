package com.icehufs.icebreaker.domain.auth.service;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.codingzone.dto.request.HandleAuthRequestDto;
import com.icehufs.icebreaker.domain.membership.domain.entity.User;
import com.icehufs.icebreaker.domain.membership.repository.UserRepository;
import com.icehufs.icebreaker.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GiveAuthService {

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;

    public String giveAuth(String email, HandleAuthRequestDto dto) {
        Authority granteeAuthority = validateGrantorAndGranteeExist(email, dto);
        boolean hasRole = granteeAuthority.hasRole(dto.getRole());
        if (hasRole) throw new BusinessException(ResponseCode.PERMITTED_ERROR, "이미 해당 권한을 가진 사용자.", HttpStatus.UNAUTHORIZED);
        granteeAuthority.grantRole(dto.getRole());
        authorityRepository.save(granteeAuthority);
        return "권한 부여 성공.";
    }

    public String depriveAuth(String email, HandleAuthRequestDto dto) {
        Authority grateeAuthority = validateGrantorAndGranteeExist(email, dto);
        boolean hasRole = grateeAuthority.hasRole(dto.getRole());
        if (!hasRole) throw new BusinessException(ResponseCode.PERMITTED_ERROR, "이미 권한이 없는 사용자", HttpStatus.BAD_REQUEST);
        grateeAuthority.revokeRole(dto.getRole());
        authorityRepository.save(grateeAuthority);
        return "권한 박탈 성공.";
    }

    private Authority validateGrantorAndGranteeExist(String email, HandleAuthRequestDto dto) {
        User grantor = userRepository.findByEmail(email);
        if (grantor == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);

        User grantee = userRepository.findByEmail(dto.getEmail());
        if (grantee == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);

        return authorityRepository.findByEmail(grantee.getEmail());
    }
}
