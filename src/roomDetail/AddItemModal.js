import React from "react";
import Modal from "react-modal";

const AddItemModal = ({
  isOpen,
  onRequestClose,
  newItemName,
  setNewItemName,
  newItemImage,
  setNewItemImage,
  newItemQuantity,
  setNewItemQuantity,
  newItemMinEnabled,
  setNewItemMinEnabled,
  newItemMinValue,
  setNewItemMinValue,
  handleAddItem
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Add New Item"
    style={{
      overlay: {
        zIndex: 3000,
        backgroundColor: 'rgba(235, 231, 223, 0.85)'
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
        background: '#a3c5e0',
        border: '1px solid #fff',
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)',
        color: '#fff'
      }
    }}
  >
    <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#fff", textAlign: "center" }}>Add New Item</h2>
    <input
      type="text"
      value={newItemName}
      onChange={(e) => setNewItemName(e.target.value)}
      placeholder="Item Name"
      style={{
        marginTop: "10px",
        width: "70%",
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #fff",
        backgroundColor: "#fff",
        color: "#232323",
        fontSize: "16px",
        textAlign: "center",
        outline: "none"
      }}
    />
    <input
      type="file"
      onChange={(e) => setNewItemImage(e.target.files[0])}
      style={{
        marginTop: "10px",
        width: "70%",
        padding: "8px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "#fff",
        color: "#232323",
        fontSize: "16px",
        outline: "none"
      }}
    />
    <input
      type="number"
      value={newItemQuantity}
      onChange={(e) => setNewItemQuantity(Number(e.target.value))}
      placeholder="Quantity"
      style={{
        marginTop: "10px",
        width: "70%",
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #fff",
        backgroundColor: "#fff",
        color: "#232323",
        fontSize: "16px",
        textAlign: "center",
        outline: "none"
      }}
    />
    <label style={{ display: "block", marginTop: "15px", color: "#fff" }}>
      <input
        type="checkbox"
        checked={newItemMinEnabled}
        onChange={e => setNewItemMinEnabled(e.target.checked)}
        style={{ marginRight: "8px" }}
      />
      Set Minimum
    </label>
    {newItemMinEnabled && (
      <input
        type="number"
        value={newItemMinValue}
        min={1}
        onChange={(e) => setNewItemMinValue(Number(e.target.value))}
        placeholder="Minimum Quantity"
        style={{
          marginTop: "10px",
          width: "70%",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #fff",
          backgroundColor: "#fff",
          color: "#232323",
          fontSize: "16px",
          textAlign: "center",
          outline: "none"
        }}
      />
    )}
    <div style={{ marginTop: "20px" }}>
      <button
        onClick={handleAddItem}
        style={{
          fontSize: "18px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          color: "#a3c5e0",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        <span style={{color: '#a3c5e0', fontWeight: 700}}>Add Item</span>
      </button>
      <button
        onClick={onRequestClose}
        style={{
          fontSize: "18px",
          margin: "20px",
          backgroundColor: "#fff",
          color: "#a3c5e0",
          border: "none",
          padding: "8px 16px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        <span style={{color: '#a3c5e0', fontWeight: 700}}>Cancel</span>
      </button>
    </div>
  </Modal>
);

export default AddItemModal; 