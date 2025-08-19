package com.icehufs.icebreaker.domain.membership.domain.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(String message) {
        super(ResponseCode.NOT_EXISTED_USER, message, HttpStatus.NOT_FOUND);
    }
}
