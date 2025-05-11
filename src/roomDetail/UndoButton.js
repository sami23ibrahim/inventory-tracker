import React from "react";

const UndoButton = ({ showUndo, onUndo }) => {
  if (!showUndo) return null;
  return (
    <button
      onClick={onUndo}
      style={{
        position: "fixed",
        bottom: "100px",
        right: "30px",
        background: "rgba(29, 197, 244, 0.19)",
        color: "#fff",
        border: "1px solid #fff",
        borderRadius: "10px",
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
        zIndex: 1000
      }}
    >
      Undo Last Change
    </button>
  );
};

export default UndoButton; 