import "./CommonModal.css";
import { createPortal } from "react-dom";

function CommonModal({
  isOpen,
  closeModal,
  children,
  title = "AdvICE",
  closeType = "button",
  disableOverlayClose = false,
  showFooterLogo = true,
  footer,
  zIndex = 1000,
  size = "default", // "default" 또는 "large"
}) {
  const handleOverlayClick = () => {
    if (!disableOverlayClose) closeModal?.();
  };

  // 크기 설정
  const getModalSize = () => {
    if (size === "large") {
      return {
        width: "1100px",
        height: "400px",
        maxWidth: "1100px",
        minWidth: "1100px",
        minHeight: "400px",
      };
    }
    return {
      width: "650px",
      height: "280px",
      maxWidth: "90%",
    };
  };

  // 헤더 padding 설정
  const getHeaderPadding = () => {
    if (size === "large") {
      return {
        padding: "55px 0px 15px 0px",
      };
    }
    return {
      padding: "35px 0px 8px 0px",
    };
  };

  // 헤더 글씨 크기 설정
  const getHeaderTitleSize = () => {
    if (size === "large") {
      return {
        fontSize: "34px",
        fontWeight: "bold",
      };
    }
    return {
      fontSize: "30px",
      fontWeight: "bold",
    };
  };

  // 로고 크기 설정
  const getLogoSize = () => {
    if (size === "large") {
      return {
        width: "140px",
        height: "auto",
      };
    }
    return {
      width: "120px",
      height: "auto",
    };
  };

  const modalSize = getModalSize();
  const headerPadding = getHeaderPadding();
  const headerTitleSize = getHeaderTitleSize();
  const logoSize = getLogoSize();

  if (!isOpen) return null;
  return createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{ zIndex }} // ⭐ 추가: 인라인 z-index
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={modalSize}
      >
        <div className="modal-header" style={headerPadding}>
          <h2 className="modal-title" style={headerTitleSize}>
            {title}
          </h2>
          {closeType === "icon" && (
            <button
              type="button"
              onClick={closeModal}
              className="modal-x-button"
              aria-label="닫기"
              title="닫기"
            >
              ✕
            </button>
          )}
        </div>

        <div className="modal-body">{children}</div>

        {/* footer 표시 조건 수정: large 사이즈일 때도 footer 표시 */}
        {(closeType === "button" || footer || size === "large") && (
          <div className="modal-footer">
            {showFooterLogo ? (
              <img
                src="/header-name.png"
                alt="School Header"
                style={logoSize}
              />
            ) : (
              <span />
            )}

            {footer ? (
              <div>{footer}</div>
            ) : (
              <button
                type="button"
                onClick={closeModal}
                className="modal-close-button"
              >
                close
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default CommonModal;
