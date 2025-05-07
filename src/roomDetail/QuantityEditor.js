import React from "react";
import { FaInfoCircle } from "react-icons/fa";

const QuantityEditor = ({
  item,
  editingItemId,
  editedQuantity,
  setEditedQuantity,
  saveEditedQuantity,
  startEditingQuantity,
  updateQuantity
}) => {
  const isEditing = editingItemId === item.id;
  const isBelowMinimum = item.minQuantity !== undefined && 
                        item.minQuantity !== null && 
                        item.quantity < item.minQuantity;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "0",
      position: "relative"
    }}>
      {isBelowMinimum && false && (
        <div style={{
          position: 'absolute',
          top: '-16px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: "flex",
          alignItems: "center",
          gap: "3px",
          color: "#ff4d4f",
          fontSize: '11px',
          zIndex: 2
        }}>
          <FaInfoCircle style={{ fontSize: '12px' }} />
          <span style={{ fontSize: "11px" }}>
            Min: {item.minQuantity}
          </span>
        </div>
      )}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px"
      }}>
        {isEditing ? (
          <input
            type="number"
            value={editedQuantity}
            onChange={(e) => setEditedQuantity(Number(e.target.value))}
            onBlur={() => saveEditedQuantity(item.id)}
            autoFocus
            style={{
              width: "100%",
              textAlign: "center",
              border: "none",
              borderRadius: "6px",
              padding: "4px",
              fontSize: "18px",
              background: "transparent",
              color: "#F5E8C7"
            }}
          />
        ) : (
          <>
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              -
            </button>
            <span
              onClick={() => startEditingQuantity(item.id)}
              style={{
                margin: "0 10px",
                cursor: "pointer",
                color: "#fff",
                fontSize: "18px",
                minWidth: "40px",
                padding: "4px 8px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "6px"
              }}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "28px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              +
            </button>
          </>
        )}
      </div>
      <div style={{ minHeight: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Removed min warning display */}
      </div>
    </div>
  );
};

export default QuantityEditor; 