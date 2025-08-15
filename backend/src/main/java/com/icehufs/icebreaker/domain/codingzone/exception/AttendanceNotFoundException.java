package com.icehufs.icebreaker.domain.codingzone.exception;

import org.springframework.http.HttpStatus;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.exception.BusinessException;

public class AttendanceNotFoundException extends BusinessException{
    
    public AttendanceNotFoundException(String message) {
        super(ResponseCode.NO_ANY_ATTENDANCE, message, HttpStatus.NOT_FOUND);
    }
}
