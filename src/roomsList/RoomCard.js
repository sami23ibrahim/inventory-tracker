import React from "react";
import { Link } from "react-router-dom";
import { FaCog, FaLock } from "react-icons/fa";

const RoomCard = ({
  room,
  isLowStock,
  openMenuId,
  setOpenMenuId,
  onEdit,
  onDelete,
  onReport,
  children
}) => (
  <div
    style={{
      background: isLowStock ? "#f0a3b0" : "#a3c5e0",
      borderRadius: "12px",
      border: "2px solid #fff",
      boxShadow: "0 8px 32px 0 rgba(255,255,255,0.7), 0 2px 8px 0 rgba(255,255,255,0.45), 0 0 0 2px #fff2, 0 0 0 4px #ffd70022",
      overflow: "hidden",
      position: "relative",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "pointer",
      minHeight: "260px",
      maxHeight: "260px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      width: "100%",
      maxWidth: "290px",
      margin: "0 auto"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-8px)";
      e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,255,255,0.5)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(255,255,255,0.7)";
    }}
  >
    <Link to={`/room/${room.id}`}>
      <img
        src={room.imageUrl}
        alt={room.name}
        style={{
          width: "93%",
          height: "160px",
          objectFit: "cover",
          borderRadius: "8px",
          margin: "10px auto 0 auto",
          display: "block"
        }}
      />
    </Link>
    <div style={{ padding: "6px 10px 0 10px" }}>
      {room.pin && (
        <button
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            padding: "8px",
            cursor: "default",
            color: "white",
            fontSize: "20px"
          }}
        >
          <FaLock />
        </button>
      )}
      <button
        onClick={() => setOpenMenuId(openMenuId === room.id ? null : room.id)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          border: "none",
          borderRadius: "50%",
          padding: "12px",
          cursor: "pointer",
          color: "white",
          fontSize: "24px",
          width: "58px",
          height: "58px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <FaCog />
      </button>
    </div>
    {openMenuId === room.id && (
      <div className="room-menu" style={{
        position: "absolute",
        top: "60px",
        right: "10px",
        background: "#a3c5e0",
        boxShadow: "0 2px 12px #fff",
        borderRadius: "12px",
        overflow: "hidden",
        zIndex: 100,
        minWidth: "180px"
      }}>
        <button onClick={() => onEdit(room)} style={{ width: "100%", padding: "16px", background: "#a3c5e0", color: "#fff", fontSize: '20px', border: "none", textAlign: "left", cursor: "pointer" }}>✏️ Edit</button>
        <button onClick={() => onDelete(room.id, room.imageUrl)} style={{ width: "100%", padding: "16px", background: "#a3c5e0", color: "#fff", fontSize: '20px', border: "none", textAlign: "left", cursor: "pointer" }}>🗑️ Delete</button>
        <button onClick={() => onReport(room)} style={{ width: "100%", padding: "16px", background: "#a3c5e0", color: "#fff", fontSize: '20px', border: "none", textAlign: "left", cursor: "pointer" }}>📄 Report</button>
      </div>
    )}
    <div style={{ padding: "0px 10px 10px 10px", textAlign: "center", fontWeight: "bold", color: "#fff", fontSize: "28px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {room.name}
    </div>
    {children}
  </div>
);

export default RoomCard; 