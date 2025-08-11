package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class UnmappedSubjectException extends BusinessException {

    public UnmappedSubjectException() {
        super(ResponseCode.NOT_MAPPED_CLASS, ResponseMessage.NOT_MAPPED_CLASS, HttpStatus.CONFLICT);
    }
}
