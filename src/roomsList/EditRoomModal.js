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
      <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#fff", textAlign: "center" }}>Edit Shelf</h2>
      <input
        type="text"
        value={editRoomName}
        onChange={(e) => setEditRoomName(e.target.value)}
        placeholder="Room Name"
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
      {editRoomPreview && (
        <img src={editRoomPreview} alt="Preview" style={{ marginTop: "10px", width: "70%", borderRadius: "8px" }} />
      )}
      <label style={{ display: "block", marginTop: "15px", color: "#fff" }}>
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
                backgroundColor: "#fff",
                color: "#232323",
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
            onChange={e => setEditRoomPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
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
        </>
      )}
      {pinError && <div style={{ color: '#ff4d4f', marginTop: 8 }}>{pinError}</div>}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleSaveEdit}
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
          <span style={{color: '#a3c5e0', fontWeight: 700}}>Save Changes</span>
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

export default EditRoomModal; 