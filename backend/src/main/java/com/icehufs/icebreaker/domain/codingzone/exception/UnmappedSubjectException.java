package com.icehufs.icebreaker.domain.codingzone.exception;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.common.ResponseMessage;
import com.icehufs.icebreaker.exception.BusinessException;
import org.springframework.http.HttpStatus;

public class UnmappedSubjectException extends BusinessException {

    // 수업 등록+수정 시, 아직 매핑 작업을 하기 전일 때
    public UnmappedSubjectException() {
        super(ResponseCode.NOT_MAPPED_CLASS, ResponseMessage.NOT_MAPPED_CLASS, HttpStatus.CONFLICT);
    }
}
