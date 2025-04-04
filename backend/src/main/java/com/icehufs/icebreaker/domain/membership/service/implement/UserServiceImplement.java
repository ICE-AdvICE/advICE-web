package com.icehufs.icebreaker.domain.membership.service.implement;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.membership.dto.request.AuthorityRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserPassRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.response.GetSignInUserResponseDto;
import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.membership.domain.entity.User;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.membership.repository.UserRepository;
import com.icehufs.icebreaker.domain.membership.service.UserService;
import com.icehufs.icebreaker.global.exception.BusinessException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImplement implements UserService {

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public GetSignInUserResponseDto getSignInUser(String email) {
        User userEntity = userRepository.findByEmail(email);
        if (userEntity == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);

        return new GetSignInUserResponseDto(userEntity.getEmail(), userEntity.getStudentNum(), userEntity.getName());
    }

    @Override
    public String patchUserInfo(PatchUserRequestDto dto, String email){
        User userEntity = userRepository.findByEmail(email);
        if (userEntity == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);

        userEntity.patchUser(dto);
        userRepository.save(userEntity);

        return "사용자 계정이 성공적으로 수정되었습니다.";
    }

    @Override
    public String patchUserPassword(PatchUserPassRequestDto dto) {
        User userEntity = userRepository.findByEmail(dto.getEmail());

        if (userEntity == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);

        String password = dto.getPassword();
        String encodedPassword = passwordEncoder.encode(password);

        userEntity.patchUserPassword(encodedPassword);
        userRepository.save(userEntity);

        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    @Override
    public String deleteUser(String email) {
        User userEntity = userRepository.findByEmail(email);
        if (userEntity == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);

        authorityRepository.deleteById(email);
        userRepository.delete(userEntity);

        return "계정이 성공적으로 삭제되었습니다.";
    }

    @Override
    public String giveAuthority(AuthorityRequestDto dto, String email) {
        Authority authority = authorityRepository.findByEmail(email);
        if(authority == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);

        if(dto.getRoleAdmin1() == 1){ //익명게시판 운영자 권한 부여
            authority.giveAdmin1Auth();
        }

        if(dto.getRoleAdminC1() == 1){ //코딩존 운영자 권한 부여
            authority.giveAdminC1Auth();
        }

        if(dto.getRoleAdminC2() == 1){ //코딩존 운영자 권한 부여
            authority.giveAdminC2Auth();
        }

        if(dto.getRoleAdmin() == 1){ //코딩존 운영자 권한 부여
            authority.giveAdminAuth();
        }
        authorityRepository.save(authority);

        return "Success";
    }

    @Override
    public String auth1Exist(String email) {
        Authority authority = authorityRepository.findByEmail(email);
        if(authority == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);
 
        String admin1 = authority.getRoleAdmin1();
        if("NULL".equals(admin1)){
            throw new BusinessException(ResponseCode.SUCCESS_BUT_NOT, ResponseMessage.SUCCESS_BUT_NOT, HttpStatus.NOT_FOUND);
        }

        return "Success";
    }
}