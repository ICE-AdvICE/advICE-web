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
  rootClassName = "",
  contentClassName = "",
}) {
  const handleOverlayClick = () => {
    if (!disableOverlayClose) closeModal?.();
  };

  if (!isOpen) return null;
  return createPortal(
    <div
      className={`modal-overlay ${rootClassName}`.trim()}
      onClick={handleOverlayClick}
      style={{ zIndex }} // ⭐ 추가: 인라인 z-index
    >
      <div
        className={`modal-content ${contentClassName}`.trim()}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
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

        {(closeType === "button" || footer) && (
          <div className="modal-footer">
            {showFooterLogo ? (
              <img src="/header-name.png" alt="School Header" />
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
