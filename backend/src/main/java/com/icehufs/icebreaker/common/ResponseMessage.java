package com.icehufs.icebreaker.common;

public interface ResponseMessage {
    // HTTP Status 200
    String SUCCESS = "Success.";
    String CODING_ADMIN = "This user is coding-zone admin.";
    String ENTIRE_ADMIN = "This user is entire admin.";
    String SUCCESS_CLASS_MAPPING = "코딩존 매핑 등록 성공";
    String SUCCESS_MAPPING_GET = "코딩존 매핑 조회 성공";
    String SUCCESS_CLASS_CREATE = "코딩존 등록 성공";
    String SUCCESS_CLASS_UPDATE = "코딩존 정보 수정 성공";

    // HTTP Status 400
    String BAD_REQUEST = "잘못된 입력 형식";
    String VALIDATION_FAILED = "Validation failed.";
    String DUPLICATE_EMAIL = "Duplicate email.";
    String NOT_EXISTED_USER = "This user does not exist.";
    String NOT_EXISTED_ARTICLE = "This article does not exist.";
    String NOT_EXISTED_COMMET = "Thie comment does not exist.";
    String FULL_CLASS = "This class already full.";
    String ALREADY_RESERVE = "Alredy reserve class.";
    String NOT_RESERVE_CLASS = "Not reserve class.";
    String NOT_SIGNUP_USER = "Not signUp user.";
    String PERMITTED_ERROR = "Permission error.";
    String ALREADY_EXISTED_CLASS = "Already reserved class";
    String NOT_MAPPED_CLASS = "매핑되지 않은 교과목 정보 포함";
    String ALREADY_EXISTED_CLASSMAPP = "이미 매핑된 교과목 이름이 포함";
    String ALREADY_EXISTED_NUMMAPP = "이미 매핑된 고유 번호가 포함 ";
    String ALREADY_EXISTED_MAPPSET = "이미 포함된 매핑번호와 교과목 이름 포함";
    String NOT_ANY_MAPPINGSET = "어떠한 매핑 정보도 등록 정보 없음";
    String NOT_WEEKDAY = "입력한 날짜가 주중이 아님";
    String NOT_FOUND_GROUP = "조 정보가 존재하지 않음";
    String NOT_MODIFIED_INFO = "변경된 정보가 없음";
    String ALREADY_POST_CLASS = "이미 등록된 수업";

    // HTTP Status 401
    String SIGN_IN_FAIL = "Login information mismatch.";
    String AUTHORIZATION_FAIL = "Authorization Failed.";

    // HTTP Status 403
    String NO_PERMISSION = "Do not have permission.";
    String BANNED_USER = "User is currently banned from posting.";

    // HTTP Status 404
    String SUCCESS_BUT_NOT = "Success but not.";
    String WITHDRAWN_EMAIL = "User who has withdrawn.";

    // HTTP Status 500
    String MAIL_FAIL = "Mail send Failed.";
    String DATABASE_ERROR = "Database error.";
    String DOES_NOT_MATCH_EMAIL = "Doesn't Match Email.";
    String INTERNAL_SERVER_ERROR = "Internal Server Error.";

}
