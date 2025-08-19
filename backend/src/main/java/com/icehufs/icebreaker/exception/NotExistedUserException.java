package com.icehufs.icebreaker.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import org.springframework.http.HttpStatus;

public class NotExistedUserException extends BusinessException{

    public NotExistedUserException() {
        super(ResponseCode.NOT_EXISTED_USER, ResponseMessage.NOT_EXISTED_USER, HttpStatus.NOT_FOUND);
    }
}



