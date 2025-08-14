package com.icehufs.icebreaker.domain.codingzone.service;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.domain.auth.domain.entity.Authority;
import com.icehufs.icebreaker.domain.auth.repostiory.AuthorityRepository;
import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ReservationStudentDto;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneRegisterRepository;
import com.icehufs.icebreaker.exception.BusinessException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final CodingZoneRegisterRepository codingZoneRegisterRepository;
    private final AuthorityRepository authorityRepository;

    public List<ReservationStudentDto> getReservationStudentsByClassNum (Integer classNum) {
        List<CodingZoneRegister> reservations = codingZoneRegisterRepository.findByCodingZoneClassClassNum(classNum);
        return reservations.stream()
                .map(reservation -> new ReservationStudentDto(
                        reservation.getUserName(),
                        reservation.getUserStudentNum(),
                        reservation.getCodingZoneClass().getClassNum()
                ))
                .collect(Collectors.toList());
    }


    @Transactional
    public Integer updateAttendanceStatus(Integer registNum, String email) {
        CodingZoneRegister codingZoneRegister = codingZoneRegisterRepository.findByRegistrationId(registNum)
                .orElseThrow(() -> new BusinessException(ResponseCode.REGISTRATION_NOT_FOUND, ResponseMessage.REGISTRATION_NOT_FOUND, HttpStatus.BAD_REQUEST));

        if (!hasAuthorityForClass(email, codingZoneRegister))
            throw new BusinessException(ResponseCode.AUTHORIZATION_FAIL, ResponseMessage.AUTHORIZATION_FAIL, HttpStatus.FORBIDDEN);

        return Integer.valueOf(codingZoneRegister.toggleAttendance());
    }

    private boolean hasAuthorityForClass(String email, CodingZoneRegister reg) {
        Authority authority = authorityRepository.findByEmail(email);
        if ("ROLE_ADMIN".equals(authority.getRoleAdmin())) return true;

        Integer subjectId = reg.getCodingZoneClass().getSubject().getId();
        String requiredRole = "ROLE_ADMINC" + subjectId;

        return authority.hasRole(requiredRole);
    }

}
