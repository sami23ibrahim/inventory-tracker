import React from "react";
import Modal from "react-modal";

const AddRoomModal = ({
  isOpen,
  onRequestClose,
  newRoomName,
  setNewRoomName,
  newRoomImage,
  setNewRoomImage,
  newRoomPreview,
  setNewRoomPreview,
  newRoomPin,
  setNewRoomPin,
  newRoomPinEnabled,
  setNewRoomPinEnabled,
  handleAddRoom
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewRoomImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewRoomPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add New Room"
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
      <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#fff", textAlign: "center" }}>Add New Shelf</h2>
      <input
        type="text"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
        placeholder="Shelf Name"
        style={{
          marginTop: "10px",
          width: "70%",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #fff",
          backgroundColor: "#fff",
          color: "black",
          fontSize: "16px",
          textAlign: "center",
          outline: "none"
        }}
      />
      <input
        type="file"
        onChange={handleImageChange}
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
      {newRoomPreview && (
        <img src={newRoomPreview} alt="Preview" style={{ marginTop: "10px", width: "70%", borderRadius: "8px" }} />
      )}
      <label style={{ display: "block", marginTop: "15px", color: "#fff" }}>
        <input
          type="checkbox"
          checked={newRoomPinEnabled}
          onChange={e => {
            setNewRoomPinEnabled(e.target.checked);
            if (!e.target.checked) setNewRoomPin("");
          }}
          style={{ marginRight: "8px" }}
        />
        Lock Shelf
      </label>
      {newRoomPinEnabled && (
        <input
          type="password"
          value={newRoomPin}
          onChange={e => setNewRoomPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="4-digit PIN (optional)"
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
          onClick={handleAddRoom}
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
          <span style={{color: '#a3c5e0', fontWeight: 700}}> Add Shelf </span>
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
};

export default AddRoomModal; 