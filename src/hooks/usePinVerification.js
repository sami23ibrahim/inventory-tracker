import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function usePinVerification(roomId, db, navigate) {
  const [roomPin, setRoomPin] = useState("");
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState("");
  const [roomName, setRoomName] = useState("");

  // Fetch room name and PIN
  const fetchRoomName = useCallback(async () => {
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
  }, [roomId, db]);

  useEffect(() => {
    fetchRoomName();
  }, [fetchRoomName]);

  // PIN verification logic
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
  }, [enteredPin, roomPin]);

  const handleNumberClick = (number) => {
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  return {
    roomName,
    setRoomName,
    roomPin,
    isPinModalOpen,
    setIsPinModalOpen,
    enteredPin,
    setEnteredPin,
    isPinVerified,
    setIsPinVerified,
    pinError,
    setPinError,
    handleNumberClick,
    handleBackspace,
    fetchRoomName
  };
} 