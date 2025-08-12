package com.icehufs.icebreaker.domain.codingzone.service;

import com.icehufs.icebreaker.domain.codingzone.domain.entity.CodingZoneRegister;
import com.icehufs.icebreaker.domain.codingzone.dto.response.ReservationStudentDto;
import com.icehufs.icebreaker.domain.codingzone.repository.CodingZoneRegisterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final CodingZoneRegisterRepository codingZoneRegisterRepository;

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
}
