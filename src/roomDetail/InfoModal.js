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
      overlay: {
        zIndex: 3000,
        backgroundColor: 'rgba(235, 231, 223, 0.85)'
      },
      content: {
        minWidth: '0',
        width: '90vw',
        maxWidth: '420px',
        boxSizing: 'border-box',
        margin: 'auto',
        textAlign: 'center',
        borderRadius: '12px',
        padding: '30px',
        background: '#a3c5e0',
        border: '1px solid #fff',
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        color: '#fff'
      }
    }}
  >
    <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#fff", textAlign: "center" }}>Item Notes</h2>
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
        backgroundColor: "#fff",
        color: "#232323",
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
          color: "#a3c5e0",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        <span style={{color: '#a3c5e0', fontWeight: 700}}>Save Notes</span>
      </button>
      <button
        onClick={onRequestClose}
        style={{
          fontSize: "18px",
          margin: "20px",
          backgroundColor: "#fff",
          color: "#a3c5e0",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        <span style={{color: '#a3c5e0', fontWeight: 700}}>Cancel</span>
      </button>
    </div>
  </Modal>
);

export default InfoModal; 