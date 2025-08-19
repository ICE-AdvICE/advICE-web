package com.icehufs.icebreaker.domain.codingzone.exception;

import org.springframework.http.HttpStatus;

import com.icehufs.icebreaker.common.ResponseCode;
import com.icehufs.icebreaker.exception.BusinessException;

public class AssistantsNotFoundException extends BusinessException{
    public AssistantsNotFoundException(String message) {
    super(ResponseCode.NO_ANY_ASSISTANTS, message, HttpStatus.NOT_FOUND);
    }
}
