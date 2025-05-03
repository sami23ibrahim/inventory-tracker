import React from "react";

const RoomHeader = ({ roomName }) => (
  <h1 style={{ 
    fontSize: "44px", 
    color: "#FFF8DC", 
    letterSpacing: "1.5px",
    margin: 0,
    paddingTop: "60px",
    marginBottom: "20px",
    textAlign: "center",
    textShadow: `0 0 2px #fff8dc, 0 0 4px #ffe066, 0 2px 4px #000, 0 0 8px #ffd700` // reduced neon/3D effect
  }}>
    {roomName}
  </h1>
);

export default RoomHeader; 