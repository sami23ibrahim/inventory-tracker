import React from "react";

const RoomHeader = ({ roomName }) => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    marginBottom: "18px",
    width: "100%"
  }}>
    <span style={{
      fontFamily: "'Baloo 2', Arial, sans-serif",
      fontSize: "55px",
      fontWeight: 900,
      color: "#fff",
      letterSpacing: "0.04em",
      textAlign: "center",
      lineHeight: 1.1,
      textShadow: `
        0 2px 0 #b0b0b0,
        0 4px 0 #a3c5e0,
        0 6px 8px rgba(163,197,224,0.35),
        0 8px 16px #a3c5e0
      `
    }}>
      {roomName}
    </span>
  </div>
);

export default RoomHeader; 