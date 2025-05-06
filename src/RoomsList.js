import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { supabase } from "./supabase";
import Modal from "react-modal";
import useRooms from "./hooks/useRooms";
import RoomCard from "./roomsList/RoomCard";
import AddRoomModal from "./roomsList/AddRoomModal";
import EditRoomModal from "./roomsList/EditRoomModal";
import ReportModal from "./roomsList/ReportModal";
import SearchBar from "./roomDetail/SearchBar";
import useSearch from "./hooks/useSearch";

Modal.setAppElement('#root');

function RoomsList() {
  const {
    rooms,
    roomsLowStock,
    addRoom,
    editRoom,
    deleteRoom
  } = useRooms(db, supabase);
  const {
    searchQuery,
    setSearchQuery,
    filteredItems: filteredRooms,
    setFilteredItems,
    showSearchResults,
    setShowSearchResults
  } = useSearch(rooms);
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

  // Add state for PIN change verification
  const [oldPinInput, setOldPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const superPassword = "3991"; // Hardcoded superpassword

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
    if (isReportModalOpen && reportRoomId) {
      fetchReportItems(reportRoomId);
    }
    // eslint-disable-next-line
  }, [isReportModalOpen, reportRoomId]);

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
    console.trace('handleAddRoom called');
    console.log('newRoomName:', newRoomName);
    console.log('newRoomImage:', newRoomImage);
    if (newRoomName.trim() === "" || !newRoomImage) {
      alert("Please enter a room name and select an image.");
      return;
    }

    try {
      await addRoom({
        name: newRoomName,
        image: newRoomImage,
        pin: newRoomPin.length === 4 ? newRoomPin : ""
      });
      console.log('addRoom finished');
      setNewRoomName("");
      setNewRoomImage(null);
      setNewRoomPreview(null);
      setNewRoomPin("");
      setIsAddModalOpen(false);
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

    await deleteRoom(roomId);
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
    // Find the current room object
    const currentRoom = rooms.find(r => r.id === editRoomId);
    const currentRoomPin = currentRoom ? currentRoom.pin : "";
    const isChangingPin = editRoomPinEnabled && currentRoomPin && currentRoomPin.length === 4;
    // If changing PIN, require old PIN or superpassword
    if (isChangingPin && editRoomPin !== currentRoomPin) {
      if (oldPinInput !== currentRoomPin && oldPinInput !== superPassword) {
        setPinError("Incorrect current PIN or superpassword.");
        return;
      }
    }
    setPinError("");
    await editRoom({
      id: editRoomId,
      name: editRoomName,
      newImage: editRoomNewImage,
      oldImageUrl: editRoomOldImageUrl,
      pin: editRoomPin
    });
    setIsEditModalOpen(false);
    setEditRoomName("");
    setEditRoomId(null);
    setEditRoomNewImage(null);
    setEditRoomPreview(null);
    setEditRoomPin("");
    setOldPinInput("");
    setPinError("");
  };

  const handleRoomSearchResultClick = (room) => {
    setFilteredItems([room]);
    setSearchQuery(room.name);
    setShowSearchResults(false);
  };

  return (
    <div style={{
      padding: "20px",
      minHeight: "100vh",
      background: "#181818"
    }}>
      <h2 style={{ 
        fontSize: "44px", 
        marginBottom: "30px", 
        color: "#FFF8DC", 
        textAlign: "center", 
        letterSpacing: "1.5px",
        textShadow: `0 0 2px #fff8dc, 0 0 4px #ffe066, 0 2px 4px #000, 0 0 8px #ffd700`
      }}>Die Drei Zahnärzte</h2>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredItems={filteredRooms}
          showSearchResults={showSearchResults}
          setShowSearchResults={setShowSearchResults}
          scrollToItem={() => {}}
          onResultClick={handleRoomSearchResultClick}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
        {filteredRooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            isLowStock={roomsLowStock[room.id]}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onEdit={openEditModal}
            onDelete={handleDeleteRoom}
            onReport={() => { setReportRoomId(room.id); setIsReportModalOpen(true); setOpenMenuId(null); }}
          />
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

      <AddRoomModal
        isOpen={isAddModalOpen}
        onRequestClose={() => setIsAddModalOpen(false)}
        newRoomName={newRoomName}
        setNewRoomName={setNewRoomName}
        newRoomImage={newRoomImage}
        setNewRoomImage={setNewRoomImage}
        newRoomPreview={newRoomPreview}
        setNewRoomPreview={setNewRoomPreview}
        newRoomPin={newRoomPin}
        setNewRoomPin={setNewRoomPin}
        newRoomPinEnabled={newRoomPinEnabled}
        setNewRoomPinEnabled={setNewRoomPinEnabled}
        handleAddRoom={handleAddRoom}
      />
      <EditRoomModal
        isOpen={isEditModalOpen}
        onRequestClose={() => {
          setIsEditModalOpen(false);
          setOldPinInput("");
          setPinError("");
        }}
        editRoomName={editRoomName}
        setEditRoomName={setEditRoomName}
        editRoomNewImage={editRoomNewImage}
        setEditRoomNewImage={setEditRoomNewImage}
        editRoomPreview={editRoomPreview}
        setEditRoomPreview={setEditRoomPreview}
        editRoomPin={editRoomPin}
        setEditRoomPin={setEditRoomPin}
        editRoomPinEnabled={editRoomPinEnabled}
        setEditRoomPinEnabled={setEditRoomPinEnabled}
        handleSaveEdit={handleSaveEdit}
        currentRoomPin={rooms.find(r => r.id === editRoomId)?.pin || ""}
        superPassword={superPassword}
        oldPinInput={oldPinInput}
        setOldPinInput={setOldPinInput}
        pinError={pinError}
      />
      <ReportModal
        isOpen={isReportModalOpen}
        onRequestClose={() => setIsReportModalOpen(false)}
        reportRoomName={reportRoomName}
        reportItems={reportItems}
      />
    </div>
  );
}

export default RoomsList;
