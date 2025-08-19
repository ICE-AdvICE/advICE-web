package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class GroupInfNotFoundException extends BusinessException {

    public GroupInfNotFoundException() {
        super(ResponseCode.NOT_FOUND_CLASS, ResponseMessage.NOT_FOUND_CLASS, HttpStatus.BAD_REQUEST);
    }
}
