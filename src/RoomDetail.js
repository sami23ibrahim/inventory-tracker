/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { updateDoc, doc } from "firebase/firestore";
import { supabase } from "./supabase";
import Modal from "react-modal";
import { FiHome } from "react-icons/fi";
import SearchBar from "./roomDetail/SearchBar";
import PinModal from "./roomDetail/PinModal";
import EditItemModal from "./roomDetail/EditItemModal";
import InfoModal from "./roomDetail/InfoModal";
import RoomHeader from "./roomDetail/RoomHeader";
import AddItemModal from "./roomDetail/AddItemModal";
import UndoButton from "./roomDetail/UndoButton";
import RoomItemGrid from "./roomDetail/RoomItemGrid";
import useRoomItems from "./hooks/useRoomItems";
import usePinVerification from "./hooks/usePinVerification";
import useSearch from "./hooks/useSearch";
import useWebhookHealth from "./hooks/useWebhookHealth";

Modal.setAppElement('#root');

function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
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

  // Add a default image URL
  const DEFAULT_IMAGE_URL = "https://placehold.co/300x150?text=No+Image";

  // Use custom hook for items and undo logic
  const {
    items,
    updateQuantity,
    handleDeleteItem,
    handleUndo,
    showUndo,
    addItem
  } = useRoomItems(roomId, db, supabase, DEFAULT_IMAGE_URL);

  const lastKnownQuantities = useRef(new Map());
  const lastNotifiedQuantity = useRef(new Map());

  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Use custom hook for webhook health (move above notifySlack)
  const { webhookHealth, checkWebhookHealth } = useWebhookHealth();

  // Use custom hook for PIN logic and room name (move above useEffect)
  const {
    roomName,
    isPinModalOpen,
    enteredPin,
    setEnteredPin,
    isPinVerified,
    pinError,
    handleNumberClick,
    handleBackspace,
    fetchRoomName
  } = usePinVerification(roomId, db, navigate);

  const notifySlack = useCallback(async (itemName, roomName, quantity, minQuantity) => {
    if (isMobileDevice) {
      console.log('Skipping Slack notification on mobile device');
      return;
    }
    console.log('NOTIFY SLACK: webhookHealth.status is', webhookHealth.status);
    if (webhookHealth.status === 'unhealthy') {
      console.error('Skipping notification - Slack webhook is not working:', webhookHealth.error);
      return;
    }
    try {
      // Always use the Vercel backend for notifications
      const serverUrl = 'https://inventoryd3z.vercel.app/api/notify-slack';
      const payload = {
        itemName,
        roomName,
        quantity,
        minQuantity
      };
      console.log('NOTIFY SLACK: About to send notification', serverUrl, payload);
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      console.log('DEBUG: Response status:', response.status);
      let errorData = null;
      if (!response.ok) {
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Failed to parse error response' };
        }
        console.error('Slack notification failed:', errorData);
        if (response.status === 503) {
          checkWebhookHealth();
        }
      } else {
        const respText = await response.text();
        console.log('DEBUG: Response text:', respText);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      checkWebhookHealth();
    }
  }, [isMobileDevice, webhookHealth, checkWebhookHealth]);

  // Use custom hook for search/filter logic
  const {
    searchQuery,
    setSearchQuery,
    filteredItems,
    setFilteredItems,
    showSearchResults,
    setShowSearchResults
  } = useSearch(items);

  const handleSearchResultClick = (item) => {
    setFilteredItems([item]);
    setSearchQuery(item.name);
    setShowSearchResults(false);
    scrollToItem(item.id);
  };

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

  // --- Move these two useEffect hooks to the very end, just before return ---
  // fetchRoomName is stable and wrapped in useCallback in the custom hook
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchRoomName();
  }, [fetchRoomName]);

  useEffect(() => {
    items.forEach(item => {
      const lastQuantity = lastKnownQuantities.current.get(item.id);
      const lastNotified = lastNotifiedQuantity.current.get(item.id);

      // Reset notification state if at or above min
      if (item.minQuantity !== undefined && item.minQuantity !== null && item.quantity >= item.minQuantity) {
        lastNotifiedQuantity.current.set(item.id, null);
      }

      // Notify if:
      // - Crossing from min or above to below min
      // - Or, decreasing further below min (and not already notified for this quantity)
      if (
        item.minQuantity !== undefined &&
        item.minQuantity !== null &&
        item.quantity < item.minQuantity &&
        item.quantity !== lastNotified &&
        (
          (lastQuantity !== undefined && lastQuantity >= item.minQuantity) || // crossing threshold
          (lastQuantity !== undefined && item.quantity < lastQuantity)        // decreasing further below min
        )
      ) {
        notifySlack(item.name, roomName, item.quantity, item.minQuantity);
        lastNotifiedQuantity.current.set(item.id, item.quantity);
      }

      lastKnownQuantities.current.set(item.id, item.quantity);
    });
  }, [items, roomName, notifySlack]);

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
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredItems={filteredItems}
              showSearchResults={showSearchResults}
              setShowSearchResults={setShowSearchResults}
              scrollToItem={scrollToItem}
              onResultClick={handleSearchResultClick}
            />
          </div>

          {/* Status Indicator */}
          {/* <WebhookStatus webhookHealth={webhookHealth} />  // Slack notification status temporarily disabled */}
        </>
      )}

      {/* PIN Verification Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        isPinVerified={isPinVerified}
        enteredPin={enteredPin}
        setEnteredPin={setEnteredPin}
        pinError={pinError}
        handleNumberClick={handleNumberClick}
        handleBackspace={handleBackspace}
        navigate={navigate}
        onRequestClose={() => {
          if (!isPinVerified) {
            navigate("/");
          }
        }}
      />

      {/* Only show room content if PIN is verified or no PIN exists */}
      {isPinVerified && (
        <React.Fragment>
          <RoomHeader roomName={roomName} navigate={navigate} />
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
          <UndoButton showUndo={showUndo} onUndo={handleUndo} />

          <RoomItemGrid
            items={items}
            filteredItems={filteredItems}
            searchQuery={searchQuery}
            openMenuId={openMenuId}
            openInfoModal={openInfoModal}
            toggleMenu={toggleMenu}
            openEditModal={openEditModal}
            handleDeleteItem={handleDeleteItem}
            updateQuantity={updateQuantity}
            editingItemId={editingItemId}
            editedQuantity={editedQuantity}
            setEditedQuantity={setEditedQuantity}
            saveEditedQuantity={saveEditedQuantity}
            startEditingQuantity={startEditingQuantity}
            DEFAULT_IMAGE_URL={DEFAULT_IMAGE_URL}
            showSearchResults={showSearchResults}
          />

          {/* Add Item Modal */}
          <AddItemModal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            newItemImage={newItemImage}
            setNewItemImage={setNewItemImage}
            newItemQuantity={newItemQuantity}
            setNewItemQuantity={setNewItemQuantity}
            newItemMinEnabled={newItemMinEnabled}
            setNewItemMinEnabled={setNewItemMinEnabled}
            newItemMinValue={newItemMinValue}
            setNewItemMinValue={setNewItemMinValue}

            handleAddItem={() => {
              if (!newItemName.trim()) {
                alert("Please enter a name.");
                return;
              }
              addItem({
                name: newItemName,
                image: newItemImage,
                quantity: newItemQuantity,
                minEnabled: newItemMinEnabled,
                minValue: newItemMinValue
              });
              setIsModalOpen(false);
              setNewItemName("");
              setNewItemImage(null);
              setNewItemQuantity(0);
              setNewItemMinEnabled(false);
              setNewItemMinValue(1);
            }}
          />

          {/* Edit Item Modal */}
          <EditItemModal
            isOpen={isEditModalOpen}
            onRequestClose={() => setIsEditModalOpen(false)}
            editItemName={editItemName}
            setEditItemName={setEditItemName}
            editItemImage={editItemImage}
            setEditItemImage={setEditItemImage}
            editItemMinEnabled={editItemMinEnabled}
            setEditItemMinEnabled={setEditItemMinEnabled}
            editItemMinValue={editItemMinValue}
            setEditItemMinValue={setEditItemMinValue}
            handleSaveEdit={handleSaveEdit}
            editItemOldImageUrl={editItemOldImageUrl}
          />

          {/* Info Modal */}
          <InfoModal
            isOpen={isInfoModalOpen}
            onRequestClose={() => setIsInfoModalOpen(false)}
            infoNote={infoNote}
            setInfoNote={setInfoNote}
            handleSaveNote={handleSaveNote}
          />
        </React.Fragment>
      )}
    </div>
  );
}

export default RoomDetail;

