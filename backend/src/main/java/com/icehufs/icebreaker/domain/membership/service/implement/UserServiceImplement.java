package com.icehufs.icebreaker.domain.membership.service.implement;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.icehufs.icebreaker.domain.membership.dto.request.AuthorityRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserPassRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.request.PatchUserRequestDto;
import com.icehufs.icebreaker.domain.membership.dto.response.Authority1ExistResponseDto;
import com.icehufs.icebreaker.domain.membership.dto.response.AuthorityResponseDto;
import com.icehufs.icebreaker.domain.membership.dto.response.GetSignInUserResponseDto;
import com.icehufs.icebreaker.domain.membership.dto.response.PatchUserResponseDto;
import com.icehufs.icebreaker.common.ResponseDto;
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
    public ResponseEntity<? super GetSignInUserResponseDto> getSignInUser(String email) {
        User userEntity = null;

        try {
            userEntity = userRepository.findByEmail(email);
            if (userEntity == null ) return GetSignInUserResponseDto.notExistUser();

        } catch(Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return GetSignInUserResponseDto.success(userEntity);
    }

    @Override
    public ResponseEntity<? super PatchUserResponseDto> patchUser(PatchUserRequestDto dto, String email){
                try{

                    User userEntity = userRepository.findByEmail(email);
                    if(userEntity == null) return PatchUserResponseDto.notExistUser();

                    userEntity.patchUser(dto);
                    userRepository.save(userEntity);
        
                }catch(Exception exception){
                    exception.printStackTrace();
                    return ResponseDto.databaseError();
                }
                
                return PatchUserResponseDto.success();
            }

    @Override
    public String patchUserPassword(PatchUserPassRequestDto dto) {
        User userEntity = userRepository.findByEmail(dto.getEmail());

        if(userEntity == null) throw new BusinessException("NU", "This user does not exist.", HttpStatus.UNAUTHORIZED);

        String password = dto.getPassword();
        String encodedPassword = passwordEncoder.encode(password);

        userEntity.patchUserPassword(encodedPassword);
        userRepository.save(userEntity);

        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    @Override
    public String deleteUser(String email) {
        User userEntity = userRepository.findByEmail(email);
        if(userEntity == null) throw new BusinessException("NU", "This user does not exist.", HttpStatus.UNAUTHORIZED);

        authorityRepository.deleteById(email);
        userRepository.delete(userEntity);

        return "계정이 성공적으로 삭제되었습니다.";
    }

    @Override
    public ResponseEntity<? super AuthorityResponseDto> giveAuthority(AuthorityRequestDto dto, String email) {

        try{

            Authority authority = authorityRepository.findByEmail(email);
            if(authority == null) return AuthorityResponseDto.notExistUser();
 
            //System.out.println(admin1);
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

        } catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
    }
    return AuthorityResponseDto.success();
    }
    

    @Override
    public ResponseEntity<? super Authority1ExistResponseDto> auth1Exist(String email) {

        try{

            Authority authority = authorityRepository.findByEmail(email);
            if(authority == null) return Authority1ExistResponseDto.notExistUser();
 
            String admin1 = authority.getRoleAdmin1();
            if("NULL".equals(admin1)){
                return Authority1ExistResponseDto.notAdmin();
            }

        } catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
    }
    return Authority1ExistResponseDto.success();
    }
}