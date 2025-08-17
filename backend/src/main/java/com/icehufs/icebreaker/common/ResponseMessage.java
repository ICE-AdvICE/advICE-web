package com.icehufs.icebreaker.common;

public interface ResponseMessage {
    // HTTP Status 200
    String SUCCESS = "Success.";
    String CODING_ADMIN = "This user is coding-zone admin.";
    String ENTIRE_ADMIN = "This user is entire admin.";
    String SUCCESS_MAPPING_GET = "매핑 조회 성공";
    String SUCCESS_CLASS_CREATE = "코딩존 등록 성공";
    String SUCCESS_CLASS_DELETE = "코딩존 삭제 성공";
    String SUCCESS_CLASS_UPDATE = "코딩존 정보 수정 성공";
    String SUCCESS_POST_MAPPING = "신규 매핑 정보로 등록 성공";
    String SUCCESS_DELETE_MAPPING = "코딩존 매핑 삭제 성공 ";
    String SUCCESS_RESET_SEMESTER = "학기 초기화 성공";
    String SUCCESS_GET_CLASSLIST = "예약 가능한 수업 리스트 반환 성공";

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
    String ALREADY_EXISTED_CLASS = "이미 등록된 코딩존 수업";
    String NOT_MAPPED_CLASS = "매핑되지 않은 교과목 정보 포함";
    String DUPLICATED_MAPPING_SET = "등록 리스트 중 중복된 번호, 교과목명 포함";
    String DUPLICATED_MAPPING_CLASSNAME = "등록 리스트 중 중복된 교과목명 포함";
    String DUPLICATED_MAPPING_NUMBER= "등록 리스트 중 중복된 매핑 번호 포함";
    String NOT_ANY_MAPPINGSET = "어떠한 매핑 정보도 등록 정보 없음";
    String NOT_WEEKDAY = "입력한 날짜가 주중이 아님";
    String NOT_MODIFIED_INFO = "변경된 정보가 없음";
    String DELETE_NOT_ALLOW = "해당 코딩존 번호를 사용하는 수업이 등록되어 있습니다. 먼저 해당 수업을 삭제해주세요.";
    String ALREADY_RESERVED_CLASS = "이미 해당 수업을 예약한 학생이 있으므로, 등록 취소가 불가능한 수업입니다.";
    String NOT_FOUND_CLASS = "해당 코딩존 수업이 없습니다.";
    String NOT_FOUND_GROUP = "해당 코딩존의 조 정보가 없습니다.";
    String CLASS_UNAVAILABLE_PERIOD = "수업 정보는 지정된 시간대에만 조회할 수 있습니다.";
    String REGISTRATION_NOT_FOUND = "예약 정보를 찾을 수 없습니다.";

    // HTTP Status 401
    String SIGN_IN_FAIL = "Login information mismatch.";
    String AUTHORIZATION_FAIL = "권한이 없습니다.";

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
