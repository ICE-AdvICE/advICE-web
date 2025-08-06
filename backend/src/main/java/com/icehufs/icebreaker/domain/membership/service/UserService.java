package com.icehufs.icebreaker.domain.membership.service;

import com.icehufs.icebreaker.domain.membership.domain.exception.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.membership.dto.request.ChangeUserPasswordRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.ChangeUserInfoRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.response.GetUserInfoResponseDto;
import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.membership.domain.entity.User;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.membership.repository.UserRepository;
import com.icehufs.icebreaker.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final PasswordEncoder passwordEncoder;

    public GetUserInfoResponseDto getUserInfo(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new UserNotFoundException("존재하지않는 사용자입니다.");

        return new GetUserInfoResponseDto(user.getEmail(), user.getStudentNum(), user.getName());
    }

    public String changeUserInfo(ChangeUserInfoRequestDto dto, String email){
        User user = userRepository.findByEmail(email);
        if (user == null) throw new UserNotFoundException("존재하지않는 사용자입니다.");

        user.changeUserInfo(dto.getStudentNum(), dto.getName());
        userRepository.save(user);

        return "사용자 계정이 성공적으로 수정되었습니다.";
    }

    public String changeUserPassword(ChangeUserPasswordRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail());
        if (user == null) throw new UserNotFoundException("존재하지않는 사용자입니다.");

        String encodedPassword = passwordEncoder.encode(dto.getPassword());
        user.changeUserPassword(encodedPassword);
        userRepository.save(user);

        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    @Transactional
    public String deleteUser(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new UserNotFoundException("존재하지않는 사용자입니다.");

        authorityRepository.deleteById(email);
        userRepository.delete(user);

        return "계정이 성공적으로 삭제되었습니다.";
    }

    public String auth1Exist(String email) {
        Authority authority = authorityRepository.findByEmail(email);
        // TODO: Authority 도메인에서 예외 추가해주세요.
        if(authority == null) throw new BusinessException(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.UNAUTHORIZED);
 
        String admin1 = authority.getRoleAdmin1();
        if("NULL".equals(admin1)){
            throw new BusinessException(ResponseCode.SUCCESS_BUT_NOT, ResponseMessage.SUCCESS_BUT_NOT, HttpStatus.NOT_FOUND);
        }

        return "Success";
    }
}