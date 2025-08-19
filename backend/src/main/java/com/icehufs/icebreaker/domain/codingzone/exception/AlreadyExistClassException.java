package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class AlreadyExistClassException extends BusinessException {

    public AlreadyExistClassException() {
        super(ResponseCode.ALREADY_EXISTED_CLASS, ResponseMessage.ALREADY_EXISTED_CLASS, HttpStatus.CONFLICT);
    }
}

