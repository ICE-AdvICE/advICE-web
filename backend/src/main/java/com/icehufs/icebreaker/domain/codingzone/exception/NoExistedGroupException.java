package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class NoExistedGroupException extends BusinessException {

    public NoExistedGroupException() {
        super(ResponseCode.NOT_FOUND_GROUP, ResponseMessage.NOT_FOUND_GROUP, HttpStatus.BAD_REQUEST);
    }
}
