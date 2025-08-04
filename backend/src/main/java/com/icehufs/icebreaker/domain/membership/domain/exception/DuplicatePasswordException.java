package com.icehufs.icebreaker.domain.membership.domain.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class DuplicatePasswordException extends BusinessException {
    public DuplicatePasswordException(String message) {
        super(ResponseCode.DUPLICATE_PASSWORD, message, HttpStatus.BAD_REQUEST);
    }
}
