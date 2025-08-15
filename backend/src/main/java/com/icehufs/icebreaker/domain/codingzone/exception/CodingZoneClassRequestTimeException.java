package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class CodingZoneClassRequestTimeException extends BusinessException {

    public CodingZoneClassRequestTimeException() {
        super(ResponseCode.CLASS_UNAVAILABLE_PERIOD, ResponseMessage.CLASS_UNAVAILABLE_PERIOD, HttpStatus.BAD_REQUEST);
    }
}
