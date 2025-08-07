package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class DuplicateClassException extends BusinessException {

    public DuplicateClassException() {
        super(ResponseCode.ALREADY_EXISTED_CLASS, ResponseMessage.ALREADY_EXISTED_CLASS, HttpStatus.CONFLICT);
    }
}
