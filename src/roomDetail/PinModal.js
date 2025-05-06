import React from "react";
import Modal from "react-modal";

const PinModal = ({
  isOpen,
  isPinVerified,
  enteredPin,
  setEnteredPin,
  pinError,
  handleNumberClick,
  handleBackspace,
  navigate,
  onRequestClose
}) => (
  <Modal
    isOpen={isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Enter PIN"
    style={{
      overlay: {
        zIndex: 3000,
        backgroundColor: 'rgba(24, 24, 24, 0.85)'
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
        background: "#232323",
        border: '1px solid #fff',
        left: '50%',
        right: 'auto',
        transform: 'translateX(-50%)'
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
          onMouseOver={e => e.currentTarget.style.background = '#363062'}
          onMouseOut={e => e.currentTarget.style.background = '#232323'}
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
        onMouseOver={e => e.currentTarget.style.background = '#363062'}
        onMouseOut={e => e.currentTarget.style.background = '#232323'}
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
        onMouseOver={e => { e.currentTarget.style.background = '#F5E8C7'; e.currentTarget.style.color = '#232323'; }}
        onMouseOut={e => { e.currentTarget.style.background = '#232323'; e.currentTarget.style.color = '#F5E8C7'; }}
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
);

export default PinModal; 