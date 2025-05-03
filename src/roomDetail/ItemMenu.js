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
        background: "#232323",
        border: "1px solid #fff",
        borderRadius: "8px",
        padding: "10px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "5px"
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
          color: "#F5E8C7",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "14px"
        }}
      >
        Edit Item
      </button>
      <button
        onClick={() => {
          openInfoModal(item);
          toggleMenu(item.id);
        }}
        style={{
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          color: "#F5E8C7",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "14px"
        }}
      >
        Add Notes
      </button>
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
          fontSize: "14px"
        }}
      >
        Delete Item
      </button>
    </div>
  );
};

export default ItemMenu; 