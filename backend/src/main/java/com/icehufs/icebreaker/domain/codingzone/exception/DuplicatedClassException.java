package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class DuplicatedClassException extends BusinessException {

    public DuplicatedClassException() {
        super(ResponseCode.NOT_MODIFIED_INFO, ResponseMessage.NOT_MODIFIED_INFO, HttpStatus.CONFLICT);
    }
}
