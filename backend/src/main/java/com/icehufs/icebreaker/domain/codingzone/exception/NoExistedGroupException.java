package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class NoExistedGroupException extends BusinessException {

    // 수업 수정 시, 수정하려고 하는 조 정보가 없을 때
    public NoExistedGroupException() {
        super(ResponseCode.NOT_FOUND_GROUP, ResponseMessage.NOT_FOUND_GROUP, HttpStatus.BAD_REQUEST);
    }
}
