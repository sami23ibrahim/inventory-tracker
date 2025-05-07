import React from "react";

const ItemMenu = ({
  item,
  openMenuId,
  toggleMenu,
  openEditModal,
  openInfoModal,
  handleDeleteItem
}) => {
  if (openMenuId !== item.id) return null;

  return (
    <div
      className="item-menu"
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "#a3c5e0",
        border: "1px solid #fff",
        borderRadius: "12px",
        padding: "10px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        minWidth: "140px",
        boxShadow: "0 2px 12px #fff"
      }}
    >
      <button
        onClick={() => {
          openEditModal(item);
          toggleMenu(item.id);
        }}
        style={{
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "16px"
        }}
      >
        Edit Item
      </button>
      <div style={{height: '1px', background: '#fff', opacity: 0.3, margin: '4px 0'}} />
      <button
        onClick={() => {
          openInfoModal(item);
          toggleMenu(item.id);
        }}
        style={{
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "16px"
        }}
      >
        Add Notes
      </button>
      <div style={{height: '1px', background: '#fff', opacity: 0.3, margin: '4px 0'}} />
      <button
        onClick={() => {
          handleDeleteItem(item.id, item.imageUrl);
          toggleMenu(item.id);
        }}
        style={{
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          color: "#f44336",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "16px"
        }}
      >
        Delete Item
      </button>
    </div>
  );
};

export default ItemMenu; 