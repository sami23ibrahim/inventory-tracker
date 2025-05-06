import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function useRooms(db, supabase) {
  const [rooms, setRooms] = useState([]);
  const [roomsLowStock, setRoomsLowStock] = useState({});

  // Fetch rooms and their low stock status
  const fetchRoomsAndStock = useCallback(async () => {
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
  }, [db]);

  useEffect(() => {
    fetchRoomsAndStock();
  }, [fetchRoomsAndStock]);

  // Add room
  const addRoom = useCallback(async ({ name, image, pin }) => {
    if (!name || !image) {
      alert("Please enter a room name and select an image.");
      return;
    }
    const fileExt = image.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `roomImages/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, image);
    if (uploadError) {
      alert('Image upload failed!');
      return;
    }
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    const imageUrl = data.publicUrl;
    await addDoc(collection(db, "rooms"), {
      name,
      imageUrl,
      pin: pin && pin.length === 4 ? pin : ""
    });
    fetchRoomsAndStock();
  }, [db, supabase, fetchRoomsAndStock]);

  // Edit room
  const editRoom = useCallback(async ({ id, name, newImage, oldImageUrl, pin }) => {
    const roomRef = doc(db, "rooms", id);
    let updatedData = { name };
    if (newImage) {
      try {
        const splitUrl = oldImageUrl.split('/public/images/');
        if (splitUrl.length === 2) {
          const oldFilePath = splitUrl[1];
          await supabase.storage.from('images').remove([oldFilePath]);
        }
      } catch (error) {}
      const fileExt = newImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `roomImages/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, newImage);
      if (!uploadError) {
        const { data: publicData } = supabase
          .storage
          .from('images')
          .getPublicUrl(filePath);
        updatedData.imageUrl = publicData.publicUrl;
      }
    }
    updatedData.pin = pin && pin.length === 4 ? pin : "";
    await updateDoc(roomRef, updatedData);
    fetchRoomsAndStock();
  }, [db, supabase, fetchRoomsAndStock]);

  // Delete room
  const deleteRoom = useCallback(async (roomId, roomImageUrl) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    // 1. Fetch all items in the room
    const itemsCollection = collection(db, "rooms", roomId, "items");
    const itemSnapshot = await getDocs(itemsCollection);
    const items = itemSnapshot.docs.map(doc => doc.data());

    // 2. Delete each item's image from Supabase
    for (const item of items) {
      if (item.imageUrl) {
        try {
          const splitUrl = item.imageUrl.split('/public/images/');
          if (splitUrl.length === 2) {
            const filePath = splitUrl[1];
            await supabase.storage.from('images').remove([filePath]);
          }
        } catch (error) {
          // Optionally log error
        }
      }
    }

    // 3. Delete the room's image as before
    if (roomImageUrl) {
      try {
        const splitUrl = roomImageUrl.split('/public/images/');
        if (splitUrl.length === 2) {
          const filePath = splitUrl[1];
          await supabase.storage.from('images').remove([filePath]);
        }
      } catch (error) {}
    }

    // 4. Delete the room and its items from Firestore
    const roomRef = doc(db, "rooms", roomId);
    await deleteDoc(roomRef);
    fetchRoomsAndStock();
  }, [db, supabase, fetchRoomsAndStock]);

  return {
    rooms,
    roomsLowStock,
    fetchRoomsAndStock,
    addRoom,
    editRoom,
    deleteRoom
  };
} 