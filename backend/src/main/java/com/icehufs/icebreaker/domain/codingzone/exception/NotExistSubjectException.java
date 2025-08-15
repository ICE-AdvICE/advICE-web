package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class NotExistSubjectException extends BusinessException {

    public NotExistSubjectException() {
        super(ResponseCode.NOT_ANY_MAPPINGSET, ResponseMessage.NOT_ANY_MAPPINGSET, HttpStatus.BAD_REQUEST);
    }

}
