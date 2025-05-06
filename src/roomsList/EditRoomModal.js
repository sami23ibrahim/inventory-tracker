import React from "react";
import Modal from "react-modal";

const EditRoomModal = ({
  isOpen,
  onRequestClose,
  editRoomName,
  setEditRoomName,
  editRoomNewImage,
  setEditRoomNewImage,
  editRoomPreview,
  setEditRoomPreview,
  editRoomPin,
  setEditRoomPin,
  editRoomPinEnabled,
  setEditRoomPinEnabled,
  handleSaveEdit,
  currentRoomPin,
  superPassword,
  oldPinInput,
  setOldPinInput,
  pinError
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditRoomNewImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditRoomPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const isChangingPin = currentRoomPin && currentRoomPin.length === 4;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Room"
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
      <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Edit Room</h2>
      <input
        type="text"
        value={editRoomName}
        onChange={(e) => setEditRoomName(e.target.value)}
        placeholder="Room Name"
        style={{
          marginTop: "10px",
          width: "70%",
          padding: "8px",
          borderRadius: "10px",
          border: "1px solid #fff",
          backgroundColor: "#222",
          color: "#fff",
          fontSize: "16px",
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
      {editRoomPreview && (
        <img src={editRoomPreview} alt="Preview" style={{ marginTop: "10px", width: "70%", borderRadius: "8px" }} />
      )}
      <label style={{ display: "block", marginTop: "15px", color: "#F5E8C7" }}>
        <input
          type="checkbox"
          checked={editRoomPinEnabled}
          onChange={e => {
            setEditRoomPinEnabled(e.target.checked);
            if (!e.target.checked) setEditRoomPin("");
          }}
          style={{ marginRight: "8px" }}
        />
        {isChangingPin ? "Change PIN" : "Set PIN"}
      </label>
      {editRoomPinEnabled && (
        <>
          {isChangingPin && (
            <input
              type="password"
              value={oldPinInput}
              onChange={e => setOldPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Current PIN or Superpassword"
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
                outline: "none",
                letterSpacing: "8px"
              }}
            />
          )}
          <input
            type="password"
            value={editRoomPin}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 4);
              setEditRoomPin(val);
            }}
            placeholder="4-digit PIN (optional)"
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
              outline: "none",
              letterSpacing: "8px"
            }}
          />
        </>
      )}
      {pinError && <div style={{ color: '#ff4d4f', marginTop: 8 }}>{pinError}</div>}
      <div style={{ marginTop: "20px" }}>
        <button style={{
          fontSize: "18px",
          marginBottom: "20px",
          backgroundColor: "#fff",
          color: "#232323",
          border: "none",
          padding: "8px 8px",
          borderRadius: "10px",
          cursor: "pointer"
        }} 
        onClick={handleSaveEdit}>Save Changes</button>
        <button onClick={onRequestClose} style={{
          fontSize: "18px",
          margin: "20px",
          backgroundColor: "#fff",
          color: "#232323",
          border: "none",
          padding: "8px 8px",
          borderRadius: "10px",
          cursor: "pointer"
        }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default EditRoomModal; 