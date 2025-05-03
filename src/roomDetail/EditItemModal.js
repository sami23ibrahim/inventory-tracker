import React from "react";
import Modal from "react-modal";

const EditItemModal = ({
  isOpen,
  onRequestClose,
  editItemName,
  setEditItemName,
  editItemImage,
  setEditItemImage,
  editItemMinEnabled,
  setEditItemMinEnabled,
  editItemMinValue,
  setEditItemMinValue,
  handleSaveEdit,
  editItemOldImageUrl
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Edit Item"
    style={{
      overlay: {
        zIndex: 3000,
        backgroundColor: 'rgba(24, 24, 24, 0.85)'
      },
      content: {
        minWidth: '0',
        width: '90vw',
        maxWidth: '420px',
        boxSizing: 'border-box',
        margin: 'auto',
        textAlign: 'center',
        borderRadius: '12px',
        padding: '30px',
        background: "#232323",
        border: '1px solid #fff',
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)'
      }
    }}
  >
    <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Edit Item</h2>
    <input
      type="text"
      value={editItemName}
      onChange={(e) => setEditItemName(e.target.value)}
      placeholder="Item Name"
      style={{
        marginTop: "10px",
        width: "70%",
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #fff",
        backgroundColor: "#222",
        color: "#fff",
        fontSize: "16px",
        textAlign: "center",
        outline: "none"
      }}
    />
    <input
      type="file"
      onChange={(e) => setEditItemImage(e.target.files[0])}
      style={{
        marginTop: "10px",
        width: "70%",
        padding: "8px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "#222",
        color: "#fff",
        fontSize: "16px",
        outline: "none"
      }}
    />
    {editItemOldImageUrl && (
      <div style={{ marginTop: "10px" }}>
        <img
          src={editItemOldImageUrl}
          alt="Current"
          style={{
            maxWidth: "100px",
            maxHeight: "100px",
            margin: "10px auto",
            display: "block"
          }}
        />
        <p style={{ color: "#F5E8C7", fontSize: "14px" }}>Current Image</p>
      </div>
    )}
    <label style={{ display: "block", marginTop: "15px", color: "#F5E8C7" }}>
      <input
        type="checkbox"
        checked={editItemMinEnabled}
        onChange={e => setEditItemMinEnabled(e.target.checked)}
        style={{ marginRight: "8px" }}
      />
      Set Minimum
    </label>
    {editItemMinEnabled && (
      <input
        type="number"
        value={editItemMinValue}
        min={1}
        onChange={e => setEditItemMinValue(Number(e.target.value))}
        placeholder="Minimum Quantity"
        style={{
          marginTop: "10px",
          width: "70%",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #fff",
          backgroundColor: "#222",
          color: "#fff",
          fontSize: "16px",
          textAlign: "center",
          outline: "none"
        }}
      />
    )}
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={handleSaveEdit}
        style={{
          fontSize: "18px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          color: "#232323",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        Save Changes
      </button>
      <button
        onClick={onRequestClose}
        style={{
          fontSize: "18px",
          margin: "20px",
          backgroundColor: "#fff",
          color: "#232323",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </div>
  </Modal>
);

export default EditItemModal; 