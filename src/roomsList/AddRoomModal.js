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
        content: {
          minWidth: '0',
          width: '90vw',
          maxWidth: '420px',
          boxSizing: 'border-box',
          margin: 'auto',
          textAlign: 'center',
          borderRadius: '12px',
          padding: '30px',
          background: '#232323',
          border: '1px solid #fff',
          left: '50%',
          right: 'auto',
          transform: 'translateX(-50%)'
        }
      }}
    >
      <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Add New Room</h2>
      <input
        type="text"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
        placeholder="Room Name"
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
        onChange={handleImageChange}
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
      {newRoomPreview && (
        <img src={newRoomPreview} alt="Preview" style={{ marginTop: "10px", width: "70%", borderRadius: "8px" }} />
      )}
      <label style={{ display: "block", marginTop: "15px", color: "#F5E8C7" }}>
        <input
          type="checkbox"
          checked={newRoomPinEnabled}
          onChange={e => {
            setNewRoomPinEnabled(e.target.checked);
            if (!e.target.checked) setNewRoomPin("");
          }}
          style={{ marginRight: "8px" }}
        />
        Set PIN
      </label>
      {newRoomPinEnabled && (
        <input
          type="password"
          value={newRoomPin}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 4);
            setNewRoomPin(val);
          }}
          placeholder="4-digit PIN(optional)"
          style={{
            marginTop: "10px",
            width: "90%",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #fff",
            backgroundColor: "#222",
            color: "#fff",
            fontSize: "16px",
            textAlign: "center",
            outline: "none",
            letterSpacing: "8px"
          }}
        />
      )}
      <div style={{ marginTop: "20px" }}>
        <button
          style={{
            fontSize: "18px",
            marginBottom: "20px",
            backgroundColor: "#fff",
            color: "#232323",
            border: "none",
            padding: "8px 8px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
          onClick={handleAddRoom}
        >
          Add Room
        </button>
        <button
          style={{
            fontSize: "18px",
            margin: "20px",
            backgroundColor: "#fff",
            color: "#232323",
            border: "none",
            padding: "8px 8px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
          onClick={onRequestClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default AddRoomModal; 