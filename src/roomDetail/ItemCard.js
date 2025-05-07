import React from "react";
import { FaCog, FaInfoCircle } from "react-icons/fa";

const ItemCard = ({
  item,
  DEFAULT_IMAGE_URL,
  openInfoModal,
  toggleMenu,
  openMenuId,
  openEditModal,
  handleDeleteItem,
  updateQuantity,
  editingItemId,
  editedQuantity,
  setEditedQuantity,
  saveEditedQuantity,
  startEditingQuantity,
  children
}) => {
  const isBelowMinimum = item.minQuantity !== undefined && 
                        item.minQuantity !== null && 
                        item.quantity < item.minQuantity;

  return (
    <div
      id={`item-${item.id}`}
      style={{
        background: isBelowMinimum ? "#f0a3b0" : "#a3c5e0",
        borderRadius: "12px",
        boxShadow: "0 8px 32px 0 rgba(255,255,255,0.7), 0 2px 8px 0 rgba(255,255,255,0.45), 0 0 0 2px #fff2, 0 0 0 4px #ffd70022",
        overflow: "hidden",
        position: "relative",
        padding: "6px",
        textAlign: "center",
        minHeight: "210px",
        maxHeight: "210px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={item.imageUrl || DEFAULT_IMAGE_URL}
          alt={item.name}
          style={{
            width: "100%",
            height: "130px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "4px"
          }}
        />
        {/* Only show info icon if item.note exists */}
        {item.note && (
        <button
          onClick={() => openInfoModal(item)}
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            padding: "12px",
            cursor: "pointer",
            color: "#FFD700",
            fontSize: "24px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title={"View/Edit Note"}
        >
          <FaInfoCircle />
        </button>
        )}
        <button
          onClick={() => toggleMenu(item.id)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            padding: "12px",
            cursor: "pointer",
            color: "rgb(255, 255, 255)",
            fontSize: "24px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <FaCog style={{
            color: '#FFF8DC',
            textShadow: `
              0 0 8px #fff8dc,
              0 0 16px #ffe066,
              0 3px 8px #000,
              0 0 24px #ffd700
            `
          }} />
        </button>
      </div>
      <div style={{
        fontSize: "18px",
        fontWeight: "bold",
        color: "rgb(255, 255, 255)", 
        marginBottom: "10px"
      }}>
        {item.name}
      </div>
      {children}
      {/* Reserve space for min warning to prevent card jump */}
      <div style={{ minHeight: '22px' }}>
        {/* The min warning will be rendered inside children (QuantityEditor), but this reserves space */}
      </div>
    </div>
  );
};

export default ItemCard; 