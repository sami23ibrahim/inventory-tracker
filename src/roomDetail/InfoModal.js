import React from "react";
import Modal from "react-modal";

const InfoModal = ({
  isOpen,
  onRequestClose,
  infoNote,
  setInfoNote,
  handleSaveNote
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Item Info"
    style={{
      content: {
        minWidth: '320px',
        width: '90vw',
        maxWidth: '420px',
        height: 'auto',
        margin: 'auto',
        textAlign: 'center',
        borderRadius: '12px',
        padding: '30px',
        background: "#232323",
        border: '1px solid #fff'
      }
    }}
  >
    <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Item Notes</h2>
    <textarea
      value={infoNote}
      onChange={(e) => setInfoNote(e.target.value)}
      placeholder="Add notes about this item..."
      style={{
        width: "90%",
        height: "150px",
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #fff",
        backgroundColor: "#222",
        color: "#fff",
        fontSize: "16px",
        outline: "none",
        resize: "none"
      }}
    />
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={handleSaveNote}
        style={{
          fontSize: "18px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          color: "#232323",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        Save Notes
      </button>
      <button
        onClick={onRequestClose}
        style={{
          fontSize: "18px",
          margin: "20px",
          backgroundColor: "#fff",
          color: "#232323",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </div>
  </Modal>
);

export default InfoModal; 