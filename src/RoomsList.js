import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { supabase } from "./supabase";
import Modal from "react-modal";
import { FaCog, FaLock } from "react-icons/fa";

Modal.setAppElement('#root');

function RoomsList() {
  const [rooms, setRooms] = useState([]);
  const [roomsLowStock, setRoomsLowStock] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomImage, setNewRoomImage] = useState(null);
  const [newRoomPreview, setNewRoomPreview] = useState(null);
  const [newRoomPin, setNewRoomPin] = useState("");
  const [newRoomPinEnabled, setNewRoomPinEnabled] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [editRoomName, setEditRoomName] = useState("");
  const [editRoomOldImageUrl, setEditRoomOldImageUrl] = useState("");
  const [editRoomNewImage, setEditRoomNewImage] = useState(null);
  const [editRoomPreview, setEditRoomPreview] = useState(null);
  const [editRoomPin, setEditRoomPin] = useState("");
  const [editRoomPinEnabled, setEditRoomPinEnabled] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  // Add state for report modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportRoomId, setReportRoomId] = useState(null);
  const [reportItems, setReportItems] = useState([]);
  const [reportRoomName, setReportRoomName] = useState("");

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.room-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    fetchRoomsAndStock();
  }, []);

  useEffect(() => {
    if (isReportModalOpen && reportRoomId) {
      fetchReportItems(reportRoomId);
    }
    // eslint-disable-next-line
  }, [isReportModalOpen, reportRoomId]);

  const fetchRoomsAndStock = async () => {
    const roomsCollection = collection(db, "rooms");
    const roomSnapshot = await getDocs(roomsCollection);
    const roomList = roomSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // For each room, fetch items and check for low stock
    const lowStockMap = {};
    await Promise.all(roomList.map(async (room) => {
      const itemsCollection = collection(db, "rooms", room.id, "items");
      const itemSnapshot = await getDocs(itemsCollection);
      const items = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      lowStockMap[room.id] = items.some(item => item.minQuantity !== undefined && item.minQuantity !== null && item.quantity < item.minQuantity);
    }));

    setRooms(roomList);
    setRoomsLowStock(lowStockMap);
  };

  const fetchReportItems = async (roomId) => {
    const itemsCollection = collection(db, "rooms", roomId, "items");
    const itemSnapshot = await getDocs(itemsCollection);
    const itemList = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setReportItems(itemList);
    // Optionally fetch room name
    const room = rooms.find(r => r.id === roomId);
    setReportRoomName(room ? room.name : "Room");
  };

  const handleAddRoom = async () => {
    if (newRoomName.trim() === "" || !newRoomImage) {
      alert("Please enter a room name and select an image.");
      return;
    }

    const fileExt = newRoomImage.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `roomImages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, newRoomImage);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      alert('Image upload failed!');
      return;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    try {
      await addDoc(collection(db, "rooms"), {
        name: newRoomName,
        imageUrl: imageUrl,
        pin: newRoomPin.length === 4 ? newRoomPin : ""
      });

      setNewRoomName("");
      setNewRoomImage(null);
      setNewRoomPreview(null);
      setNewRoomPin("");
      setIsAddModalOpen(false);
      fetchRoomsAndStock();
    } catch (error) {
      console.error('Error saving room to Firestore:', error);
      alert('Failed to save room. Please try again.');
    }
  };

  const handleDeleteRoom = async (roomId, roomImageUrl) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    if (roomImageUrl) {
      try {
        const splitUrl = roomImageUrl.split('/public/images/');
        if (splitUrl.length === 2) {
          const filePath = splitUrl[1];
          await supabase.storage.from('images').remove([filePath]);
        }
      } catch (error) {
        console.error('Error deleting room image:', error);
      }
    }

    const roomRef = doc(db, "rooms", roomId);
    await deleteDoc(roomRef);
    fetchRoomsAndStock();
  };

  const openEditModal = (room) => {
    setEditRoomId(room.id);
    setEditRoomName(room.name);
    setEditRoomOldImageUrl(room.imageUrl);
    setEditRoomNewImage(null);
    setEditRoomPreview(null);
    setEditRoomPin(room.pin || "");
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    const roomRef = doc(db, "rooms", editRoomId);

    let updatedData = { name: editRoomName };

    if (editRoomNewImage) {
      try {
        const splitUrl = editRoomOldImageUrl.split('/public/images/');
        if (splitUrl.length === 2) {
          const oldFilePath = splitUrl[1];
          await supabase.storage.from('images').remove([oldFilePath]);
        }
      } catch (error) {
        console.error('Error deleting old room image:', error);
      }

      const fileExt = editRoomNewImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `roomImages/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, editRoomNewImage);

      if (uploadError) {
        console.error('Error uploading new image:', uploadError);
        alert('Image upload failed!');
        return;
      }

      const { data: publicData } = supabase
        .storage
        .from('images')
        .getPublicUrl(filePath);

      updatedData.imageUrl = publicData.publicUrl;
    }

    updatedData.pin = editRoomPin.length === 4 ? editRoomPin : "";

    await updateDoc(roomRef, updatedData);

    setIsEditModalOpen(false);
    setEditRoomName("");
    setEditRoomId(null);
    setEditRoomNewImage(null);
    setEditRoomPreview(null);
    setEditRoomPin("");
    fetchRoomsAndStock();
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleNewRoomImageChange = (e) => {
    const file = e.target.files[0];
    setNewRoomImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewRoomPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditRoomImageChange = (e) => {
    const file = e.target.files[0];
    setEditRoomNewImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditRoomPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  async function notifySlack(itemName, roomName) {
    await fetch('http://localhost:4000/api/notify-slack', {
      method: 'POST',
      body: JSON.stringify({ itemName, roomName }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return (
    <div style={{
      padding: "20px",
      minHeight: "100vh",
      background: "#181818"
    }}>
      <h2 style={{ fontSize: "38px", marginBottom: "30px", color: "#F5E8C7", textAlign: "center" }}>Die Drei Zahnärzte</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
        {rooms.map(room => (
          <div 
            key={room.id}
            style={{
              background: roomsLowStock[room.id] ? "#ff4d4f" : "#232323",
              border: '1px solid #fff',
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
              overflow: "hidden",
              position: "relative",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.7)";
            }}
          >
            <Link to={`/room/${room.id}`}>
              <img
                src={room.imageUrl}
                alt={room.name}
                style={{ width: "100%", height: "150px", objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", borderBottom: roomsLowStock[room.id] ? '4px solid #ff4d4f' : '4px solid #fff' }}
              />
            </Link>
            <div style={{ padding: "15px" }}>
              {room.pin && (
                <button
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "50%",
                    padding: "8px",
                    cursor: "default",
                    color: "#F5E8C7",
                    fontSize: "20px"
                  }}
                >
                  <FaLock />
                </button>
              )}
              <button
                onClick={() => toggleMenu(room.id)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: "50%",
                  padding: "12px",
                  cursor: "pointer",
                  color: "#F5E8C7",
                  fontSize: "24px",
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <FaCog />
              </button>
            </div>
            {openMenuId === room.id && (
              <div className="room-menu" style={{
                position: "absolute",
                top: "60px",
                right: "10px",
                background: "#232323",
                boxShadow: "0 2px 6px rgba(0,0,0,0.7)",
                borderRadius: "8px",
                overflow: "hidden",
                zIndex: 100
              }}>
                <button
                  onClick={() => openEditModal(room)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#232323", color: "#F5E8C7", fontSize: '18px',
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.id, room.imageUrl)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#232323", color: "#F5E8C7", fontSize: '18px',
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => { setReportRoomId(room.id); setIsReportModalOpen(true); setOpenMenuId(null); }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#232323", color: "#F5E8C7", fontSize: '18px',
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  📄 Report
                </button>
              </div>
            )}
            <div style={{ padding: "10px", textAlign: "center", fontWeight: "bold", color: "#F5E8C7" }}>
              {room.name}
            </div>
          </div>
        ))}
      </div>

      {/* Add Room Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "#232323",
          color: "#F5E8C7",
          border: "1px solid #fff",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "38px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0
        }}
      >
        +
      </button>

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        contentLabel="Add New Room"
        style={{
          content: {
            minWidth: '320px',
            width: '90vw',
            maxWidth: '420px',
            height: 'auto',
            margin: 'auto',
            textAlign: 'center',
            borderRadius: '12px',
            padding: '30px',
            background: '#232323',
            border: '1px solid #fff',
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
          onChange={handleNewRoomImageChange}
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
            onClick={() => setIsAddModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel="Edit Room"
        style={{
          content: {
            minWidth: '320px',
            width: '90vw',
            maxWidth: '420px',
            height: 'auto',
            margin: 'auto',
            textAlign: 'center',
            borderRadius: '12px',
            padding: '30px',
            background: '#232323',
            border: '1px solid #fff',
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
          onChange={handleEditRoomImageChange}
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
          Set PIN
        </label>
        {editRoomPinEnabled && (
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
        )}
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
          <button onClick={() => setIsEditModalOpen(false)} style={{
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

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onRequestClose={() => setIsReportModalOpen(false)}
        contentLabel="Room Report"
        style={{
          content: {
            minWidth: '320px',
            width: '90vw',
            maxWidth: '420px',
            minHeight: '200px',
            margin: 'auto',
            textAlign: 'center',
            borderRadius: '12px',
            padding: '30px',
            background: '#232323',
            border: '1px solid #fff',
          }
        }}
      >
        <h2 style={{ fontSize: "28px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Report: {reportRoomName}</h2>
        {reportItems.length === 0 ? (
          <div style={{ color: "#F5E8C7", fontSize: "18px" }}>No items in this room.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {reportItems.map(item => (
              <li key={item.id} style={{
                color: (item.minQuantity !== undefined && item.minQuantity !== null && item.quantity < item.minQuantity)
                  ? "#ff4d4f"
                  : "#F5E8C7",
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "10px",
                background: "rgba(255,255,255,0.07)",
                borderRadius: "8px",
                padding: "8px"
              }}>
                {item.name} <span style={{ float: "right" }}>Qty: {item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => setIsReportModalOpen(false)}
          style={{
            fontSize: "18px",
            marginTop: "20px",
            backgroundColor: "#fff",
            color: "#232323",
            border: "none",
            padding: "8px 16px",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Close
        </button>
      </Modal>
    </div>
  );
}

export default RoomsList;
