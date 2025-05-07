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
      overlay: {
        zIndex: 3000,
        backgroundColor: 'rgba(235, 231, 223, 0.85)'
      },
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
        background: '#a3c5e0',
        border: '1px solid #fff',
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        color: '#fff'
      }
    }}
  >
    <h2 style={{ fontSize: "28px", marginBottom: "20px", color: "#fff", textAlign: "center" }}>Report: {reportRoomName}</h2>
    {reportItems.length === 0 ? (
      <div style={{ color: "#fff", fontSize: "18px" }}>No items in this room.</div>
    ) : (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {reportItems.map(item => (
          <li key={item.id} style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: "18px",
            marginBottom: "10px",
            background: (item.minQuantity !== undefined && item.minQuantity !== null && item.quantity < item.minQuantity)
              ? "#f0a3b0"
              : "rgba(255,255,255,0.07)",
            borderRadius: "8px",
            padding: "8px"
          }}>
            <span style={{ fontWeight: "bold", fontSize: "18px", color: "#fff" }}>{String(item.name)}</span>
            <span style={{ float: "right", color: "#fff" }}>Qty: {item.quantity}</span>
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
        color: "#a3c5e0",
        border: "none",
        padding: "8px 16px",
        borderRadius: "10px",
        cursor: "pointer"
      }}
    >
      <span style={{color: '#a3c5e0', fontWeight: 700}}>Close</span>
    </button>
  </Modal>
);

export default ReportModal; 