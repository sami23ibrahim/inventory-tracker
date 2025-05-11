// Trigger redeploy
import { useState, useEffect, useCallback } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, runTransaction } from "firebase/firestore";

export default function useRoomItems(roomId, db, supabase, DEFAULT_IMAGE_URL, roomName) {
  const [items, setItems] = useState([]);
  const [lastQuantity, setLastQuantity] = useState(null);
  const [lastItemId, setLastItemId] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  // Real-time listener
  useEffect(() => {
    if (!roomId) return;
    const itemsRef = collection(db, "rooms", roomId, "items");
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const itemsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsList);
    });
    return () => unsubscribe();
  }, [roomId, db]);

  // Add item
  const addItem = useCallback(async ({ name, image, quantity, minEnabled, minValue }) => {
    let imageUrl = DEFAULT_IMAGE_URL;
    if (image) {
      try {
        const fileExt = image.name.split('.').pop().toLowerCase();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `roomItems/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false
          });
        if (!uploadError) {
          const { data: publicUrlData, error: publicUrlError } = await supabase.storage
            .from('images')
            .getPublicUrl(filePath);
          if (!publicUrlError) {
            imageUrl = publicUrlData.publicUrl;
          }
        }
      } catch (error) {
        // fallback to default image
      }
    }
    const itemData = {
      name,
      imageUrl,
      quantity,
      lastNotifiedQuantity: quantity
    };
    if (minEnabled) {
      itemData.minQuantity = minValue;
    }
    await addDoc(collection(db, "rooms", roomId, "items"), itemData);
  }, [roomId, db, supabase, DEFAULT_IMAGE_URL]);

  // Update quantity
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    try {
      if (newQuantity < 0) {
        alert("Quantity cannot be negative");
        return;
      }
      const item = items.find(item => item.id === itemId);
      if (item) {
        setLastQuantity(item.quantity);
        setLastItemId(itemId);
        setShowUndo(true);
        if (window.undoTimeout) clearTimeout(window.undoTimeout);
        window.undoTimeout = setTimeout(() => setShowUndo(false), 5000);
      }
      const itemRef = doc(db, "rooms", roomId, "items", itemId);
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) throw new Error("Item does not exist!");
        const currentQuantity = itemDoc.data().quantity;
        const baseQuantity = currentQuantity !== item.quantity ? currentQuantity : item.quantity;
        const finalQuantity = baseQuantity + (newQuantity - item.quantity);
        transaction.update(itemRef, { quantity: finalQuantity });
      });
      setItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));

      // Debounce notification logic (3 seconds)
      if (!window._notifyDebounceTimers) window._notifyDebounceTimers = {};
      if (window._notifyDebounceTimers[itemId]) {
        clearTimeout(window._notifyDebounceTimers[itemId]);
      }
      const updatedItem = items.find(item => item.id === itemId);
      window._notifyDebounceTimers[itemId] = setTimeout(async () => {
        // Always use the roomName passed to the hook
        const finalRoomName = roomName || updatedItem?.roomName || (typeof window !== 'undefined' && window.__ROOM_NAME__) || "";
        await fetch('/api/notify-slack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            roomId,
            itemName: updatedItem?.name,
            roomName: finalRoomName,
            quantity: newQuantity,
            minQuantity: updatedItem?.minQuantity
          })
        });
      }, 3000);
    } catch (error) {
      alert('Failed to update quantity. Please try again.');
    }
  }, [roomId, db, items, roomName]);

  // Undo
  const handleUndo = useCallback(async () => {
    try {
      if (lastItemId && lastQuantity !== null) {
        const itemRef = doc(db, "rooms", roomId, "items", lastItemId);
        await updateDoc(itemRef, { quantity: lastQuantity });
        setShowUndo(false);
        setItems(prevItems => prevItems.map(item => item.id === lastItemId ? { ...item, quantity: lastQuantity } : item));
      }
    } catch (error) {
      alert('Failed to undo change. Please try again.');
    }
  }, [roomId, db, lastItemId, lastQuantity]);

  // Delete item
  const handleDeleteItem = useCallback(async (itemId, itemImageUrl) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;
    if (itemImageUrl) {
      try {
        const splitUrl = itemImageUrl.split('/public/images/');
        if (splitUrl.length === 2) {
          const filePath = splitUrl[1];
          await supabase.storage.from('images').remove([filePath]);
        }
      } catch (error) {}
    }
    const itemRef = doc(db, "rooms", roomId, "items", itemId);
    await deleteDoc(itemRef);
  }, [roomId, db, supabase]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (window.undoTimeout) clearTimeout(window.undoTimeout);
    };
  }, []);

  return {
    items,
    setItems,
    addItem,
    updateQuantity,
    handleDeleteItem,
    handleUndo,
    lastQuantity,
    lastItemId,
    showUndo,
    setShowUndo
  };
} 