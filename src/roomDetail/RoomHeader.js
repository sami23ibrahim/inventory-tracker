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
      fontSize: "45px",
      fontWeight: 900,
      color: "#fff",
      letterSpacing: "0.03em",
      textAlign: "center",
      lineHeight: 1.1,
     
    }}>
      {roomName}
    </span>
  </div>
);

export default RoomHeader; 