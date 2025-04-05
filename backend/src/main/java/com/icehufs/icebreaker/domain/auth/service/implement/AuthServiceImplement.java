package com.icehufs.icebreaker.domain.auth.service.implement;

import java.time.LocalDateTime;
import java.time.Period;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.icehufs.icebreaker.domain.auth.dto.object.JwtToken;
import com.icehufs.icebreaker.domain.auth.dto.response.LogoutResponseDto;
import com.icehufs.icebreaker.domain.auth.dto.response.RegenerateTokenResponseDto;
import com.icehufs.icebreaker.domain.auth.service.RefreshTokenService;
import com.icehufs.icebreaker.provider.CertificationNumber;
import com.icehufs.icebreaker.domain.auth.dto.request.CheckCertificationRequestDto;
import com.icehufs.icebreaker.domain.auth.dto.request.EmailCertificationRequestDto;
import com.icehufs.icebreaker.domain.auth.dto.request.GiveUserBanRequestDto;
import com.icehufs.icebreaker.domain.auth.dto.request.SignInRequestDto;
import com.icehufs.icebreaker.domain.auth.dto.request.SignUpRequestDto;
import com.icehufs.icebreaker.domain.auth.dto.response.CheckCertificationResponseDto;
import com.icehufs.icebreaker.domain.auth.dto.response.CheckUserBanResponseDto;
import com.icehufs.icebreaker.domain.auth.dto.response.EmailCertificationResponseDto;
import com.icehufs.icebreaker.domain.auth.dto.response.GiveUserBanResponseDto;
import com.icehufs.icebreaker.domain.auth.dto.response.PassChanEmailCertificationResponseDto;
import com.icehufs.icebreaker.domain.auth.dto.response.SignInResponseDto;
import com.icehufs.icebreaker.domain.auth.dto.response.SignUpResponseDto;
import com.icehufs.icebreaker.common.ResponseDto;
import com.icehufs.icebreaker.domain.article.domain.entity.Article;
import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.auth.domain.type.BanDurationEnum;
import com.icehufs.icebreaker.domain.auth.domain.type.BanReasonEnum;
import com.icehufs.icebreaker.domain.auth.domain.entity.Certification;
import com.icehufs.icebreaker.domain.membership.domain.entity.User;
import com.icehufs.icebreaker.domain.auth.domain.entity.UserBan;
import com.icehufs.icebreaker.provider.EmailProvider;
import com.icehufs.icebreaker.provider.JwtProvider;
import com.icehufs.icebreaker.domain.article.repository.ArticleRepository;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.auth.repostiory.CertificationRepository;
import com.icehufs.icebreaker.domain.auth.repostiory.UserBanRepository;
import com.icehufs.icebreaker.domain.membership.repository.UserRepository;
import com.icehufs.icebreaker.domain.auth.service.AuthService;
import com.icehufs.icebreaker.util.EncryptionUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImplement implements AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final RefreshTokenService refreshTokenService;
    private final CertificationRepository certificationRepository;
    private final EmailProvider emailProvider;
    private final UserBanRepository userBanRepository;
    private final AuthorityRepository authorityRepository;

    // 운영자의 게시글 삭제 관련 레포지토리
    private final ArticleRepository articleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ResponseEntity<? super SignUpResponseDto> signUp(SignUpRequestDto dto) {
        try{

            String email = dto.getEmail(); //이메일 중복을 확인해주는 코드
            boolean existsByEmail = userRepository.existsByEmail(email);
            if (existsByEmail) return SignUpResponseDto.duplicateEmail();

            String password = dto.getPassword(); //비밀번호를 암호화
            String encodedPassword = passwordEncoder.encode(password);
            dto.setPassword(encodedPassword);

            User userEntity = new User(dto); //dto데이터를 entity에 삽입
            Authority authority = new Authority(dto.getEmail());//새 사용자한테 USER 기본 권한 부여

            userRepository.save(userEntity); //entity를 repository를 통해 db에 저장
            authorityRepository.save(authority);

        } catch (Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();

        }

        return SignUpResponseDto.success();
    }

    @Override
    public ResponseEntity<? super SignInResponseDto> signIn(SignInRequestDto dto) {
        try{

            String email = dto.getEmail();  //요청으로 받은 이메일 존재 확인
            User userEntity = userRepository.findByEmail(email);
            if (userEntity == null) return SignInResponseDto.signInFail();

            String password = dto.getPassword(); //요청 받은 비번과 해당 유저(이메일)의 비번 일치하는지 확인
            String encodedPassword = userEntity.getPassword();

            boolean isMatched = passwordEncoder.matches(password, encodedPassword); //입력 받은 비번과 db에 있는 암호화된 비번 확인;
            if(!isMatched) {
                return SignInResponseDto.signInFail();
            }

            JwtToken jwtToken = jwtProvider.create(email);
            refreshTokenService.storeRefreshToken(email, jwtToken.refreshToken());

            return SignInResponseDto.success(jwtToken);
        } catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public ResponseEntity<? super LogoutResponseDto> logout(String email) {
        try {
            refreshTokenService.deleteRefreshToken(email);
            return LogoutResponseDto.success();
        } catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    @Override
    public ResponseEntity<? super RegenerateTokenResponseDto> refresh(String refreshToken, String email) {
        try {
            if (email == null) {
                return RegenerateTokenResponseDto.invalidToken();
            }

            boolean isValid = refreshTokenService.vaildateRefreshToken(email, refreshToken);
            if (!isValid) {
                return RegenerateTokenResponseDto.invalidToken();
            }

            JwtToken jwtToken = jwtProvider.create(email);
            refreshTokenService.storeRefreshToken(email, jwtToken.refreshToken());

            return RegenerateTokenResponseDto.success(jwtToken);
        } catch(Exception exception){
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }
    @Override
    public ResponseEntity<? super EmailCertificationResponseDto> emailCertification(EmailCertificationRequestDto dto) {
        try {
            // String userId = dto.getId();
            String email = dto.getEmail();

            // 존재하는 이메일인지 확인.
            boolean isExistEmail = userRepository.existsByEmail(email);
            if (isExistEmail) return EmailCertificationResponseDto.duplicateId();

            
            Certification certification1 = certificationRepository.findByUserEmail(email);

            // 전에 이 이메일로 인증번호를 받은적 있으면 그 이메일 삭제
            if (certification1 != null){
                certificationRepository.delete(certification1);
            }

            // 인증번호 생성
            String certificationNumber = CertificationNumber.getCertificationNumber();

            // 이메일 전송 성공 여부 확인
            boolean isSuccessed = emailProvider.sendCertificationMail(email, certificationNumber);
            if (!isSuccessed) return EmailCertificationResponseDto.mailSendFail();

            // 데이터베이스 저장.
            Certification certification = new Certification(email, certificationNumber);
            certificationRepository.save(certification);


        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return EmailCertificationResponseDto.success();
    }

    @Override
    public ResponseEntity<? super CheckCertificationResponseDto> checkCertification(CheckCertificationRequestDto dto) {
        // System.out.println("Starting certification check for email: " + dto.getEmail());
        try {
            // String userId = dto.getId();
            String email = dto.getEmail();
            String certificationNumber = dto.getCertificationNumber();
            //System.out.println("Starting certification check for email: " + email);


            Certification certification = certificationRepository.findByUserEmail(email);
            // 인증 메일을 보내지 않은 경우.
            if (certification == null) {
                return CheckCertificationResponseDto.certificationFail();
            }

            boolean isMatched = certification.getUserEmail().equals(email) && certification.getCertificationNumber().equals(certificationNumber);

            if (!isMatched) {
                return CheckCertificationResponseDto.certificationFail();
            } else { // 인증 완료 시에 인증 테이블에서 해당 인증번호 삭제
                certificationRepository.delete(certification);
            }


        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
        return CheckCertificationResponseDto.success();
    }

    @Override
    @Transactional
    public ResponseEntity<? super GiveUserBanResponseDto> giveUserBan(GiveUserBanRequestDto dto, Integer articleNum, String email) {
        Article articleEntity = null;
        try {

            // 정지하려는 운영자 로그인 시간 초과
            boolean existedUser1 = userRepository.existsByEmail(email);
            if (!existedUser1) return GiveUserBanResponseDto.notExistUser();

            articleEntity = articleRepository.findByArticleNum(articleNum);

            // 만일 게시글이 존재하지 않을 경우.
            if (articleEntity == null) return GiveUserBanResponseDto.noExistArticle();

            // 게시글의 이메일을 복호화하는 과정
            String decryptedWriterEmail = EncryptionUtil.decrypt(articleEntity.getUserEmail());

            // 정지하려는 유저가 이전에 탈퇴했기에 User테이블에 엔티티가 없을 경우.
            boolean existedUser = userRepository.existsByEmail(decryptedWriterEmail);
            if (!existedUser) return GiveUserBanResponseDto.withdrawnId();

            boolean ban_email = userBanRepository.existsByEmail(decryptedWriterEmail);
            // 이미 정지된 계정일 경우.(운영자가 한 번에 단일 작성자의 문제가 있는 여러 게시글에 정지를 부여할 경우.)
            if (ban_email) {
                return GiveUserBanResponseDto.duplicateId();
            }

            BanDurationEnum banDuration = BanDurationEnum.valueOf(dto.getBanDuration().toUpperCase());
            BanReasonEnum banReason = BanReasonEnum.valueOf(dto.getBanReason().toUpperCase());
            UserBan userBan = new UserBan();
            LocalDateTime currentDateTime = LocalDateTime.now();
            LocalDateTime banEndTime = currentDateTime.plus(getPeriod(banDuration));
            userBan.setEmail(decryptedWriterEmail);
            userBan.setBanDuration(banDuration);
            userBan.setBanReason(banReason);
            userBan.setBanStartTime(currentDateTime);
            userBan.setBanEndTime(banEndTime);

            // 사용자 정지와 함께 게시물 삭제를 할 경우 코드
            //commentRepository.deleteByArticleNum(articleNum);
            //favoriteRepository.deleteByArticleNum(articleNum);
            //articleRepository.delete(articleEntity);

            userBanRepository.save(userBan);
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return GiveUserBanResponseDto.success();
    }

    @Override
    public ResponseEntity<? super PassChanEmailCertificationResponseDto> passChanEmailCertif(EmailCertificationRequestDto dto){
        try {
            
            String email = dto.getEmail();

            // 존재하는 이메일인지 확인.
            boolean isExistEmail = userRepository.existsByEmail(email);
            if (!isExistEmail) return PassChanEmailCertificationResponseDto.notExistUser();

            Certification certification1 = certificationRepository.findByUserEmail(email);
            if (certification1 != null){
                certificationRepository.delete(certification1);
            }

            // 인증번호 생성
            String certificationNumber = CertificationNumber.getCertificationNumber();

            // 이메일 전송 성공 여부 확인
            boolean isSuccessed = emailProvider.sendCertificationMail(email, certificationNumber);
            if (!isSuccessed) return EmailCertificationResponseDto.mailSendFail();

            // 데이터베이스 저장.
            Certification certification = new Certification(email, certificationNumber);
            certificationRepository.save(certification);


        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }

        return PassChanEmailCertificationResponseDto.success();
    }

    @Override
    public ResponseEntity<? super CheckUserBanResponseDto> checkUserBanStatus(String token) {
        try {
            String email = jwtProvider.extractEmail(token);
            UserBan userBan = userBanRepository.findByEmail(email);
            // 만일 계정이 정지되어있다면..
            if (userBan != null){
                // LocalDateTime banEndTime = userBan.getBanStartTime().plus(getPeriod(userBan.getBanDuration()));
                // 활동 정지가 만료되지 않았을 경우
                if (LocalDateTime.now().isBefore(userBan.getBanEndTime())) {

                    return CheckUserBanResponseDto.success(userBan.getEmail(), userBan.getBanDuration(), userBan.getBanStartTime(), userBan.getBanEndTime(), userBan.getBanReason());
                    // 활동 정지가 만료되었을 경우
                } else {
                    userBanRepository.delete(userBan);
                    return CheckUserBanResponseDto.notBanned();
                }
            } else {
                return CheckUserBanResponseDto.notBanned();
            }
        } catch (Exception exception) {
            exception.printStackTrace();
            return ResponseDto.databaseError();
        }
    }

    // BanDuration 엔티티를 받아와 사용.
    private Period getPeriod(BanDurationEnum banDuration) {
        switch (banDuration) {
            case ONE_MONTH:
                return Period.ofMonths(1);
            case SIX_MONTHS:
                return Period.ofMonths(6);
            case ONE_YEAR:
                return Period.ofYears(1);
            case PERMANENT:
                return Period.ofYears(100);  // 100년이기에 사실상 영구정지와 같다.
            default:
                throw new IllegalArgumentException("Unknown ban duration: " + banDuration);
        }
    }
}
