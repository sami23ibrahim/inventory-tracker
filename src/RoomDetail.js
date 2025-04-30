import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { supabase } from "./supabase";
import Modal from "react-modal";
import { FaCog, FaInfoCircle } from "react-icons/fa";
import { FiHome } from "react-icons/fi";

Modal.setAppElement('#root');

// Slack notification tracking
const notifiedItems = new Set();
const lastKnownQuantities = new Map();

const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

async function notifySlack(itemName, roomName, quantity, minQuantity) {
  // Skip notifications on mobile devices
  if (isMobileDevice) return;

  const serverUrl = 'http://192.168.100.31:4000';
  try {
    await fetch(`${serverUrl}/api/notify-slack`, {
      method: 'POST',
      body: JSON.stringify({ itemName, roomName, quantity, minQuantity }),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    // Don't throw the error to prevent app crashes
  }
}

function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemImage, setNewItemImage] = useState(null);
  const [newItemQuantity, setNewItemQuantity] = useState(0);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Edit Item Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemName, setEditItemName] = useState("");
  const [editItemImage, setEditItemImage] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [editItemOldImageUrl, setEditItemOldImageUrl] = useState("");
  const [editItemMinEnabled, setEditItemMinEnabled] = useState(false);
  const [editItemMinValue, setEditItemMinValue] = useState(1);

  // Add Item Modal
  const [newItemMinEnabled, setNewItemMinEnabled] = useState(false);
  const [newItemMinValue, setNewItemMinValue] = useState(1);

  // Add state for info modal
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoItemId, setInfoItemId] = useState(null);
  const [infoNote, setInfoNote] = useState("");

  const [roomName, setRoomName] = useState("");

  // Add PIN verification states
  const [roomPin, setRoomPin] = useState("");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState("");

  // Add a default image URL
  const DEFAULT_IMAGE_URL = "https://placehold.co/300x150?text=No+Image";

  useEffect(() => {
    fetchItems();
    fetchRoomName();
  }, []);

  useEffect(() => {
    if (enteredPin.length === 4) {
      if (enteredPin === roomPin) {
        setIsPinVerified(true);
        setIsPinModalOpen(false);
        setEnteredPin("");
        setPinError("");
      } else {
        setPinError("Incorrect PIN. Please try again.");
        setTimeout(() => setEnteredPin("") , 500);
      }
    }
    // eslint-disable-next-line
  }, [enteredPin]);

  useEffect(() => {
    items.forEach(item => {
      const lastQuantity = lastKnownQuantities.get(item.id);
      const isBelowMinimum = item.minQuantity !== undefined && 
                           item.minQuantity !== null && 
                           item.quantity < item.minQuantity;
      
      // Only notify if:
      // 1. Item is below minimum
      // 2. Either:
      //    a. We haven't notified for this item before, or
      //    b. The quantity has decreased since last check
      if (isBelowMinimum && (!notifiedItems.has(item.id) || (lastQuantity !== undefined && item.quantity < lastQuantity))) {
        notifySlack(item.name, roomName, item.quantity, item.minQuantity);
        notifiedItems.add(item.id);
      }
      
      // Update last known quantity
      lastKnownQuantities.set(item.id, item.quantity);
    });
  }, [items, roomName]);

  const fetchItems = async () => {
    const itemsCollection = collection(db, "rooms", roomId, "items");
    const itemSnapshot = await getDocs(itemsCollection);
    const itemList = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(itemList);
  };

  const fetchRoomName = async () => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
      const roomData = roomSnap.data();
      setRoomName(roomData.name || "Room");
      setRoomPin(roomData.pin || "");
      if (roomData.pin) {
        setIsPinModalOpen(true);
      } else {
        setIsPinVerified(true);
      }
    } else {
      setRoomName("Room");
      setIsPinVerified(true);
    }
  };

  const handlePinSubmit = () => {
    if (enteredPin === roomPin) {
      setIsPinVerified(true);
      setIsPinModalOpen(false);
      setEnteredPin("");
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setEnteredPin("");
    }
  };

  const handleNumberClick = (number) => {
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const handleAddItem = async () => {
    if (newItemName.trim() === "") {
      alert("Please enter a name.");
      return;
    }

    let imageUrl = DEFAULT_IMAGE_URL;
    if (newItemImage) {
      const fileExt = newItemImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `roomItems/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, newItemImage);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Image upload failed!');
        return;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const itemData = {
      name: newItemName,
      imageUrl: imageUrl,
      quantity: newItemQuantity
    };
    if (newItemMinEnabled) {
      itemData.minQuantity = newItemMinValue;
    }

    await addDoc(collection(db, "rooms", roomId, "items"), itemData);

    setIsModalOpen(false);
    setNewItemName("");
    setNewItemImage(null);
    setNewItemQuantity(0);
    setNewItemMinEnabled(false);
    setNewItemMinValue(1);
    fetchItems();
  };

  const updateQuantity = async (itemId, newQuantity) => {
    const itemRef = doc(db, "rooms", roomId, "items", itemId);
    await updateDoc(itemRef, { quantity: newQuantity });
    fetchItems();
  };

  const startEditingQuantity = (itemId) => {
    setEditingItemId(itemId);
    const item = items.find(item => item.id === itemId);
    setEditedQuantity(item.quantity);
  };

  const saveEditedQuantity = async (itemId) => {
    await updateQuantity(itemId, editedQuantity);
    setEditingItemId(null);
  };

  const handleDeleteItem = async (itemId, itemImageUrl) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    if (itemImageUrl) {
      try {
        const splitUrl = itemImageUrl.split('/public/images/');
        if (splitUrl.length === 2) {
          const filePath = splitUrl[1];
          const { error: deleteError } = await supabase.storage
            .from('images')
            .remove([filePath]);
          if (deleteError) console.error('Error deleting image:', deleteError);
        }
      } catch (error) {
        console.error('Error parsing or deleting image:', error);
      }
    }

    const itemRef = doc(db, "rooms", roomId, "items", itemId);
    await deleteDoc(itemRef);
    fetchItems();
  };

  const openEditModal = (item) => {
    setEditItemId(item.id);
    setEditItemName(item.name);
    setEditItemOldImageUrl(item.imageUrl);
    setEditItemMinEnabled(!!item.minQuantity);
    setEditItemMinValue(item.minQuantity || 1);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    const itemRef = doc(db, "rooms", roomId, "items", editItemId);
  
    let updatedData = {
      name: editItemName,
    };
  
    if (editItemMinEnabled) {
      updatedData.minQuantity = editItemMinValue;
    } else {
      updatedData.minQuantity = null;
    }
  
    if (editItemImage) {
      // Delete old image
      try {
        const splitUrl = editItemOldImageUrl.split('/public/images/');
        if (splitUrl.length === 2) {
          const oldFilePath = splitUrl[1];
          await supabase.storage.from('images').remove([oldFilePath]);
        }
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
  
      // Upload new image
      const fileExt = editItemImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `roomItems/${fileName}`;
  
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, editItemImage);
  
      if (uploadError) {
        console.error('Error uploading new image:', uploadError);
        alert('Image upload failed!');
        return;
      }
  
      // Get public URL of the uploaded file
      const { data: publicData } = supabase
        .storage
        .from('images')
        .getPublicUrl(filePath);
  
      updatedData.imageUrl = publicData.publicUrl; // 🔥 This will never be undefined now
    }
  
    await updateDoc(itemRef, updatedData);
  
    setIsEditModalOpen(false);
    setEditItemName("");
    setEditItemImage(null);
    setEditItemId(null);
    setEditItemMinEnabled(false);
    setEditItemMinValue(1);
    fetchItems();
  };

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Open info modal
  const openInfoModal = (item) => {
    setInfoItemId(item.id);
    setInfoNote(item.note || "");
    setIsInfoModalOpen(true);
  };

  // Save note to Firestore
  const handleSaveNote = async () => {
    if (!infoItemId) return;
    const itemRef = doc(db, "rooms", roomId, "items", infoItemId);
    await updateDoc(itemRef, { note: infoNote });
    setIsInfoModalOpen(false);
    setInfoItemId(null);
    setInfoNote("");
    fetchItems();
  };

  return (
    <div style={{
      padding: "20px",
      minHeight: "100vh",
      background: "#181818"
    }}>
      {/* PIN Verification Modal */}
      <Modal
        isOpen={isPinModalOpen}
        onRequestClose={() => {
          if (!isPinVerified) {
            navigate("/");
          }
        }}
        contentLabel="Enter PIN"
        style={{
          overlay: {
            backgroundColor: 'rgba(24, 24, 24, 0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000
          },
          content: {
            width: '90%',
            maxWidth: '400px',
            height: 'auto',
            minHeight: '400px',
            maxHeight: '500px',
            margin: 'auto',
            textAlign: 'center',
            borderRadius: '18px',
            padding: '32px',
            background: "#232323",
            border: '1px solid #fff',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }
        }}
      >
        <h2 style={{ fontSize: "32px", marginBottom: "18px", color: "#F5E8C7", textAlign: "center" }}>Enter PIN</h2>
        {/* PIN Display */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {[0, 1, 2, 3].map((_, index) => (
            <div
              key={index}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: index < enteredPin.length ? '#F5E8C7' : 'transparent',
                border: `3px solid #F5E8C7`
              }}
            />
          ))}
        </div>
        {pinError && (
          <div style={{ color: "#F5E8C7", marginBottom: "16px", fontSize: '18px', fontWeight: 600 }}>
            {pinError}
          </div>
        )}
        {/* Numeric Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '18px',
          maxWidth: '320px',
          margin: '0 auto',
          marginBottom: '18px',
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              style={{
                width: '70px',
                height: '70px',
                fontSize: '32px',
                background: '#232323',
                color: '#F5E8C7',
                border: '1px solid #fff',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                margin: 0,
                padding: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#363062'}
              onMouseOut={(e) => e.currentTarget.style.background = '#232323'}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => handleNumberClick(0)}
            style={{
              width: '70px',
              height: '70px',
              fontSize: '32px',
              background: '#232323',
              color: '#F5E8C7',
              border: '1px solid #fff',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              margin: 0,
              padding: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#363062'}
            onMouseOut={(e) => e.currentTarget.style.background = '#232323'}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            style={{
              width: '70px',
              height: '70px',
              fontSize: '32px',
              background: '#232323',
              color: '#F5E8C7',
              border: '1px solid #fff',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              margin: 0,
              padding: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#F5E8C7'; e.currentTarget.style.color = '#232323'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#232323'; e.currentTarget.style.color = '#F5E8C7'; }}
          >
            ←
          </button>
        </div>
        <div style={{ marginTop: "6px", display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate("/")}
            style={{
              fontSize: "18px",
              backgroundColor: "#232323",
              color: "#F5E8C7",
              border: "1px solid #fff",
              padding: "8px 18px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Only show room content if PIN is verified or no PIN exists */}
      {isPinVerified && (
        <React.Fragment>
          <button
            onClick={() => navigate("/")}
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              background: "transparent",
              color: "#F5E8C7",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              fontSize: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              padding: 0,
              WebkitTapHighlightColor: "transparent", // Remove tap highlight on mobile
              WebkitTouchCallout: "none", // Disable callout on long press
              WebkitUserSelect: "none", // Disable text selection
              touchAction: "manipulation" // Optimize for touch
            }}
            title="Home"
          >
            <FiHome />
          </button>
          <h1 style={{ fontSize: "38px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center", paddingTop: "60px" }}>{roomName}</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
            {items.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#F5E8C7", fontSize: "22px", marginTop: "40px" }}>
                No items in this room yet.<br />
                Click the <span style={{fontWeight:'bold', fontSize:'28px'}}>+</span> button below to add your first item!
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} style={{
                  background: (item.minQuantity !== undefined && item.minQuantity !== null && item.quantity < item.minQuantity)
                    ? "#ff4d4f" // red
                    : "#232323",
                  border: '1px solid #fff',
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
                  overflow: "hidden",
                  position: "relative",
                  padding: "20px",
                  textAlign: "center"
                }}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={item.imageUrl || DEFAULT_IMAGE_URL}
                      alt={item.name}
                      style={{ 
                        width: "100%", 
                        height: "150px", 
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "10px"
                      }}
                    />
                    <button
                      onClick={() => openInfoModal(item)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        background: "transparent",
                        border: "none",
                        borderRadius: "50%",
                        padding: "8px",
                        cursor: "pointer",
                        color: item.note ? "#FFD700" : "#F5E8C7", // gold if note exists
                        fontSize: "20px"
                      }}
                      title={item.note ? "View/Edit Note" : "Add Note"}
                    >
                      <FaInfoCircle />
                    </button>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "transparent",
                        border: "none",
                        borderRadius: "50%",
                        padding: "8px",
                        cursor: "pointer",
                        color: "#F5E8C7",
                        fontSize: "20px"
                      }}
                    >
                      <FaCog />
                    </button>

                    {openMenuId === item.id && (
                      <div style={{
                        position: "absolute",
                        top: "45px",
                        right: "10px",
                        background: "#232323",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.7)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        zIndex: 100
                      }}>
                        <button
                          onClick={() => {
                            openEditModal(item);
                            setOpenMenuId(null);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px",
                            background: "#232323",
                            color: "#F5E8C7",
                            fontSize: '18px',
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer"
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteItem(item.id, item.imageUrl);
                            setOpenMenuId(null);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px",
                            background: "#232323",
                            color: "#F5E8C7",
                            fontSize: '18px',
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer"
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "bold", 
                    color: "#F5E8C7",
                    marginBottom: "10px"
                  }}>
                    {item.name}
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center",
                    marginBottom: "10px"
                  }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        background: "transparent",color:"#F5E8C7",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        fontSize: "32px",
                        cursor: "pointer",
                        marginRight: "10px"
                      }}
                    >
                      -
                    </button>
                    <span
                      style={{ 
                        margin: "0 10px", 
                        cursor: "pointer",
                        color: "#F5E8C7",
                        fontSize: "18px"
                      }}
                      onClick={() => startEditingQuantity(item.id)}
                    >
                      {editingItemId === item.id ? (
                        <input
                          type="number"
                          value={editedQuantity}
                          onChange={(e) => setEditedQuantity(Number(e.target.value))}
                          onBlur={() => saveEditedQuantity(item.id)}
                          autoFocus
                          style={{ 
                            width: "50px",
                            textAlign: "center",
                            border: "none",
                            borderRadius: "5px",
                            padding: "5px"
                          }}
                        />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        background: "transparent",color:"#F5E8C7",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        fontSize: "28px",
                        cursor: "pointer",
                        marginLeft: "10px"
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Item Modal */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            contentLabel="Add New Item"
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
                background: "#232323",
                border: '1px solid #fff'
              }
            }}
          >
            <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Add New Item</h2>
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
                backgroundColor: "#222",
                color: "#fff",
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
                backgroundColor: "#222",
                color: "#fff",
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
                backgroundColor: "#222",
                color: "#fff",
                fontSize: "16px",
                textAlign: "center",
                outline: "none"
              }}
            />
            <label style={{ display: "block", marginTop: "15px", color: "#F5E8C7" }}>
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
                onChange={e => setNewItemMinValue(Number(e.target.value))}
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
                onClick={handleAddItem}
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
                Add Item
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
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

          {/* Edit Item Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onRequestClose={() => setIsEditModalOpen(false)}
            contentLabel="Edit Item"
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
                background: "#232323",
                border: '1px solid #fff'
              }
            }}
          >
            <h2 style={{ fontSize: "32px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Edit Item</h2>
            <input
              type="text"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              placeholder="New Item Name"
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
                onClick={() => setIsEditModalOpen(false)}
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

          {/* Info Modal */}
          <Modal
            isOpen={isInfoModalOpen}
            onRequestClose={() => setIsInfoModalOpen(false)}
            contentLabel="Item Info"
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
                background: "#232323",
                border: '1px solid #fff'
              }
            }}
          >
            <h2 style={{ fontSize: "28px", marginBottom: "20px", color: "#F5E8C7", textAlign: "center" }}>Item Note</h2>
            <textarea
              value={infoNote}
              onChange={e => setInfoNote(e.target.value)}
              placeholder="Add any notes, numbers, or info here..."
              style={{
                width: "90%",
                height: "100px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#222",
                color: "#fff",
                fontSize: "16px",
                padding: "10px",
                resize: "none"
              }}
            />
            <div style={{ marginTop: "20px" }}>
              <button 
                onClick={handleSaveNote}
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
                Save
              </button>
              <button 
                onClick={() => setIsInfoModalOpen(false)}
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
        </React.Fragment>
      )}
    </div>
  );
}

export default RoomDetail;

