import React from "react";
import Modal from "react-modal";

const ReportModal = ({
  isOpen,
  onRequestClose,
  reportRoomName,
  reportItems
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Room Report"
    style={{
      content: {
        minWidth: '0',
        width: '90vw',
        maxWidth: '420px',
        minHeight: '200px',
        boxSizing: 'border-box',
        margin: 'auto',
        textAlign: 'center',
        borderRadius: '12px',
        padding: '30px',
        background: '#232323',
        border: '1px solid #fff',
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)'
      }
    }}
  >
    <h2 style={{ fontSize: "28px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Report: {reportRoomName}</h2>
    {reportItems.length === 0 ? (
      <div style={{ color: "#F5E8C7", fontSize: "18px" }}>No items in this room.</div>
    ) : (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {reportItems.map(item => (
          <li key={item.id} style={{
            color: (item.minQuantity !== undefined && item.minQuantity !== null && item.quantity < item.minQuantity)
              ? "#ff4d4f"
              : "#F5E8C7",
            fontWeight: "bold",
            fontSize: "18px",
            marginBottom: "10px",
            background: "rgba(255,255,255,0.07)",
            borderRadius: "8px",
            padding: "8px"
          }}>
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>{String(item.name)}</span>
            <span style={{ float: "right" }}>Qty: {item.quantity}</span>
          </li>
        ))}
      </ul>
    )}
    <button
      onClick={onRequestClose}
      style={{
        fontSize: "18px",
        marginTop: "20px",
        backgroundColor: "#fff",
        color: "#232323",
        border: "none",
        padding: "8px 16px",
        borderRadius: "10px",
        cursor: "pointer"
      }}
    >
      Close
    </button>
  </Modal>
);

export default ReportModal; 