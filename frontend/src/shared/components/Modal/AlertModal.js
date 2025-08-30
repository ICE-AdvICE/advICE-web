import CommonModal from "./CommonModal.jsx";

export default function AlertModal({
  isOpen,
  onClose,
  title = "AdvICE",
  children,
  confirmText = "확인",
  onConfirm,
  disableOverlayClose = true,
  zIndex = 2000,
}) {
  return (
    <CommonModal
      isOpen={isOpen}
      closeModal={onClose}
      title={title}
      closeType="none"
      disableOverlayClose={disableOverlayClose}
      zIndex={zIndex}
      footer={
        <div style={{ display: "flex", gap: 8 }}>
          <button className="modal-close-button" onClick={onConfirm ?? onClose}>
            {confirmText}
          </button>
        </div>
      }
    >
      <div
        style={{ marginBottom: 8 }}
        dangerouslySetInnerHTML={{ __html: children }}
      />
      {/* Modal이 기본 close 버튼을 렌더하지만, 커스텀 쓰고 싶으면 closeType="none"으로 바꾸고 아래 버튼만 두세요 */}
      {/* <div className="modal-footer"><button className="modal-close-button" onClick={onConfirm ?? onClose}>{confirmText}</button></div> */}
    </CommonModal>
  );
}
