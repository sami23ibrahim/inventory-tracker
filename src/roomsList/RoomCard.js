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
      background: isLowStock ? "#ff4d4f" : "#232323",
      borderRadius: "12px",
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.7), 0 2px 8px 0 rgba(0,0,0,0.45), 0 0 0 2px #fff2, 0 0 0 4px #ffd70022",
      overflow: "hidden",
      position: "relative",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "pointer"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-8px)";
      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.5)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.7)";
    }}
  >
    <Link to={`/room/${room.id}`}>
      <img
        src={room.imageUrl}
        alt={room.name}
        style={{ width: "100%", height: "170px", objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", borderBottom: isLowStock ? '4px solid #ff4d4f' : '4px solid #fff' }}
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
            color: "#F5E8C7",
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
          color: "#F5E8C7",
          fontSize: "24px",
          width: "48px",
          height: "48px",
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
        background: "#232323",
        boxShadow: "0 2px 6px rgba(0,0,0,0.7)",
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 100
      }}>
        <button onClick={() => onEdit(room)} style={{ width: "100%", padding: "10px", background: "#232323", color: "#F5E8C7", fontSize: '18px', border: "none", textAlign: "left", cursor: "pointer" }}>✏️ Edit</button>
        <button onClick={() => onDelete(room.id, room.imageUrl)} style={{ width: "100%", padding: "10px", background: "#232323", color: "#F5E8C7", fontSize: '18px', border: "none", textAlign: "left", cursor: "pointer" }}>🗑️ Delete</button>
        <button onClick={() => onReport(room)} style={{ width: "100%", padding: "10px", background: "#232323", color: "#F5E8C7", fontSize: '18px', border: "none", textAlign: "left", cursor: "pointer" }}>📄 Report</button>
      </div>
    )}
    <div style={{ padding: "6px 10px 10px 10px", textAlign: "center", fontWeight: "bold", color: "#F5E8C7" }}>
      {room.name}
    </div>
    {children}
  </div>
);

export default RoomCard; 