package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class DuplicatedClassException extends BusinessException {

    // 수업 수정 시, 수정 전 정보와 완전히 같은 정보가 등록되려 할 때
    public DuplicatedClassException() {
        super(ResponseCode.NOT_MODIFIED_INFO, ResponseMessage.NOT_MODIFIED_INFO, HttpStatus.CONFLICT);
    }
}
