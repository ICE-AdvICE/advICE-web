package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class ExistCodingZoneRegisterException extends BusinessException {

    public ExistCodingZoneRegisterException() {
        super(ResponseCode.ALREADY_RESERVED_CLASS, ResponseMessage.ALREADY_RESERVED_CLASS, HttpStatus.BAD_REQUEST);
    }
}
