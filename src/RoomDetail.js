import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, onSnapshot, runTransaction } from "firebase/firestore";
import { supabase } from "./supabase";
import Modal from "react-modal";
import { FaCog, FaInfoCircle } from "react-icons/fa";
import { FiHome } from "react-icons/fi";

Modal.setAppElement('#root');

// Slack notification tracking
const notifiedItems = new Set();
const lastKnownQuantities = new Map();

const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemImage, setNewItemImage] = useState(null);
  const [newItemQuantity, setNewItemQuantity] = useState(0);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [lastQuantity, setLastQuantity] = useState(null);
  const [lastItemId, setLastItemId] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Add webhook status state
  const [webhookHealth, setWebhookHealth] = useState({ status: 'unknown', error: null });

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.item-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
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

  // Restore the useEffect for periodic health checks
  useEffect(() => {
    // Initial check
    checkWebhookHealth();
    
    // Check every 5 minutes
    const interval = setInterval(checkWebhookHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Set up real-time listener for items
    const itemsRef = collection(db, "rooms", roomId, "items");
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const itemsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsList);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [roomId]);

  // Add click outside handler for search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredItems(items);
      setShowSearchResults(false);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredItems(filtered);
    setShowSearchResults(true);
  }, [searchQuery, items]);

  const scrollToItem = (itemId) => {
    const element = document.getElementById(`item-${itemId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add highlight effect
      element.style.animation = 'highlight 1s';
      setTimeout(() => {
        element.style.animation = '';
      }, 1000);
    }
  };

  // Add CSS for highlight animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes highlight {
        0% { background-color: rgba(255, 255, 255, 0.2); }
        100% { background-color: transparent; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      // Prevent negative quantities
      if (newQuantity < 0) {
        alert("Quantity cannot be negative");
        return;
      }
      
      // Store previous quantity for undo
      const item = items.find(item => item.id === itemId);
      if (item) {
        setLastQuantity(item.quantity);
        setLastItemId(itemId);
        setShowUndo(true);
        // Clear previous timeout if it exists
        if (window.undoTimeout) {
          clearTimeout(window.undoTimeout);
        }
        // Hide undo button after 5 seconds
        window.undoTimeout = setTimeout(() => setShowUndo(false), 5000);
      }

      const itemRef = doc(db, "rooms", roomId, "items", itemId);
      
      // Use transaction to prevent conflicts
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) {
          throw new Error("Item does not exist!");
        }
        
        const currentQuantity = itemDoc.data().quantity;
        // If the quantity has changed since we started the update, 
        // we'll use the new quantity as the base for our update
        const baseQuantity = currentQuantity !== item.quantity ? currentQuantity : item.quantity;
        const finalQuantity = baseQuantity + (newQuantity - item.quantity);
        
        transaction.update(itemRef, { quantity: finalQuantity });
      });
      
      // Update local state after successful transaction
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleUndo = async () => {
    try {
      if (lastItemId && lastQuantity !== null) {
        const itemRef = doc(db, "rooms", roomId, "items", lastItemId);
        await updateDoc(itemRef, { quantity: lastQuantity });
        setShowUndo(false);
        
        // Update local state instead of fetching
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === lastItemId ? { ...item, quantity: lastQuantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Error undoing quantity change:', error);
      alert('Failed to undo change. Please try again.');
    }
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (window.undoTimeout) {
        clearTimeout(window.undoTimeout);
      }
    };
  }, []);

  const startEditingQuantity = (itemId) => {
    setEditingItemId(itemId);
    const item = items.find(item => item.id === itemId);
    setEditedQuantity(item.quantity);
  };

  const saveEditedQuantity = async (itemId) => {
    // Validate edited quantity
    if (editedQuantity < 0) {
      alert("Quantity cannot be negative");
      return;
    }
    if (isNaN(editedQuantity)) {
      alert("Please enter a valid number");
      return;
    }
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
  };

  // Update the checkWebhookHealth function
  const checkWebhookHealth = async () => {
    try {
      const response = await fetch('http://192.168.100.31:4000/api/health');
      const data = await response.json();
      
      setWebhookHealth({
        status: data.status === 'healthy' ? 'healthy' : 'unhealthy',
        error: data.lastError
      });
    } catch (error) {
      setWebhookHealth({
        status: 'unhealthy',
        error: 'Failed to connect to notification server'
      });
      console.error('Failed to check webhook health:', error);
    }
  };

  // Update notifySlack to use webhook health status
  const notifySlack = async (itemName, roomName, quantity, minQuantity) => {
    if (isMobileDevice) {
      console.log('Skipping Slack notification on mobile device');
      return;
    }

    if (webhookHealth.status === 'unhealthy') {
      console.error('Skipping notification - Slack webhook is not working:', webhookHealth.error);
      return;
    }

    try {
      const serverUrl = 'http://192.168.100.31:4000/api/notify-slack';
      console.log('Sending notification to:', serverUrl);
      
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemName,
          roomName,
          quantity,
          minQuantity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Slack notification failed:', errorData);
        
        if (response.status === 503) {
          setWebhookHealth({
            status: 'unhealthy',
            error: errorData.details
          });
        }
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      setWebhookHealth({
        status: 'unhealthy',
        error: 'Failed to send notification'
      });
    }
  };

  return (
    <div style={{
      padding: "20px",
      minHeight: "100vh",
      background: "#181818"
    }}>
      {isPinVerified && (
        <>
          {/* Search Bar and Home Button Container */}
          <div style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            zIndex: 200
          }}>
            {/* Home Button */}
            <button
              onClick={() => navigate("/")}
              style={{
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
                padding: 0,
                WebkitTapHighlightColor: "transparent",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                touchAction: "manipulation"
              }}
              title="Home"
            >
              <FiHome />
            </button>

            {/* Search Bar */}
            <div className="search-container" style={{ position: "relative" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search items..."
                style={{
                  width: "200px",
                  padding: "8px 12px",
                  borderRadius: "20px",
                  border: "1px solid #fff",
                  backgroundColor: "#232323",
                  color: "#F5E8C7",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              {showSearchResults && searchQuery && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "250px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  background: "#232323",
                  border: "1px solid #fff",
                  borderRadius: "8px",
                  padding: "10px",
                  marginTop: "10px",
                  zIndex: 201
                }}>
                  {filteredItems.length === 0 ? (
                    <div style={{
                      padding: "8px",
                      color: "#F5E8C7",
                      textAlign: "center"
                    }}>
                      No items found matching your search.
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          scrollToItem(item.id);
                          setShowSearchResults(false);
                        }}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          color: "#F5E8C7",
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <span>
                          {item.name.split(searchQuery).map((part, i, arr) => (
                            <span key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <span style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                  {searchQuery}
                                </span>
                              )}
                            </span>
                          ))}
                        </span>
                        <span style={{ color: "#888" }}>→</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#232323",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #fff",
            zIndex: 1000,
            cursor: "pointer"
          }} onClick={checkWebhookHealth}>
            <div style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: webhookHealth.status === 'healthy' 
                ? '#4CAF50'  // Green for healthy
                : webhookHealth.status === 'unhealthy' 
                  ? '#f44336'  // Red for unhealthy
                  : '#FFA726'  // Orange for unknown
            }} />
            <span style={{ 
              color: "#F5E8C7",
              fontSize: "14px"
            }}>
              {webhookHealth.status === 'healthy' 
                ? 'Notifications Active'
                : webhookHealth.status === 'unhealthy'
                  ? 'Notification Issues'
                  : 'Checking Status...'}
            </span>
          </div>
          
          {/* Show error tooltip if there's an error */}
          {webhookHealth.error && webhookHealth.status === 'unhealthy' && (
            <div style={{
              position: "fixed",
              top: "70px",
              right: "20px",
              background: "#232323",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #f44336",
              color: "#F5E8C7",
              fontSize: "14px",
              maxWidth: "250px",
              zIndex: 1000
            }}>
              {webhookHealth.error}
            </div>
          )}
        </>
      )}

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
              padding: 0,
              zIndex: 3000
            }}
          >
            +
          </button>

          {/* Add undo button */}
          {showUndo && (
            <button
              onClick={handleUndo}
              style={{
                position: "fixed",
                bottom: "100px",
                right: "30px",
                background: "#232323",
                color: "#F5E8C7",
                border: "1px solid #fff",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
                zIndex: 1000
              }}
            >
              Undo Last Change
            </button>
          )}

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "20px",
            padding: "20px"
          }}>
            {(!searchQuery && items.length === 0) ? (
              <div style={{ 
                gridColumn: "1/-1", 
                textAlign: "center", 
                color: "#F5E8C7", 
                fontSize: "22px", 
                marginTop: "40px",
                padding: "20px"
              }}>
                No items in this room yet.<br />
                Click the <span style={{fontWeight:'bold', fontSize:'28px'}}>+</span> button below to add your first item!
              </div>
            ) : (
              (searchQuery && filteredItems.length > 0 ? filteredItems : items).map(item => (
                <div 
                  key={item.id} 
                  id={`item-${item.id}`}
                  style={{
                    background: (item.minQuantity !== undefined && item.minQuantity !== null && item.quantity < item.minQuantity)
                      ? "#ff4d4f"
                      : "#232323",
                    border: '1px solid #fff',
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
                    overflow: "hidden",
                    position: "relative",
                    padding: "20px",
                    textAlign: "center"
                  }}
                >
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
                        padding: "12px",
                        cursor: "pointer",
                        color: item.note ? "#FFD700" : "#F5E8C7",
                        fontSize: "24px",
                        width: "48px",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
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

                    {openMenuId === item.id && (
                      <div className="item-menu" style={{
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
                          onClick={() => {
                            openEditModal(item);
                            setOpenMenuId(null);
                          }}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "#232323",
                            color: "#F5E8C7",
                            fontSize: '18px',
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
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
                            padding: "12px 16px",
                            background: "#232323",
                            color: "#F5E8C7",
                            fontSize: '18px',
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
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
                    marginBottom: "10px",
                    gap: "10px"
                  }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        background: "transparent",
                        color: "#F5E8C7",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        fontSize: "28px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      -
                    </button>
                    <span
                      style={{ 
                        margin: "0 10px", 
                        cursor: "pointer",
                        color: "#F5E8C7",
                        fontSize: "18px",
                        minWidth: "40px",
                        padding: "4px 8px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "6px"
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
                            width: "100%",
                            textAlign: "center",
                            border: "none",
                            borderRadius: "6px",
                            padding: "4px",
                            fontSize: "18px",
                            background: "transparent",
                            color: "#F5E8C7"
                          }}
                        />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        background: "transparent",
                        color: "#F5E8C7",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        fontSize: "28px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
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

