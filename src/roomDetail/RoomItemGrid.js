import React from "react";
import ItemCard from "./ItemCard";
import QuantityEditor from "./QuantityEditor";
import ItemMenu from "./ItemMenu";

const RoomItemGrid = ({
  items,
  filteredItems,
  searchQuery,
  openMenuId,
  openInfoModal,
  toggleMenu,
  openEditModal,
  handleDeleteItem,
  updateQuantity,
  editingItemId,
  editedQuantity,
  setEditedQuantity,
  saveEditedQuantity,
  startEditingQuantity,
  DEFAULT_IMAGE_URL,
  showSearchResults
}) => {
  const displayItems = (searchQuery && filteredItems.length > 0) ? filteredItems : items;
  return (
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
        displayItems.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            DEFAULT_IMAGE_URL={DEFAULT_IMAGE_URL}
            openInfoModal={openInfoModal}
            toggleMenu={toggleMenu}
            openMenuId={openMenuId}
            openEditModal={openEditModal}
            handleDeleteItem={handleDeleteItem}
            updateQuantity={updateQuantity}
            editingItemId={editingItemId}
            editedQuantity={editedQuantity}
            setEditedQuantity={setEditedQuantity}
            saveEditedQuantity={saveEditedQuantity}
            startEditingQuantity={startEditingQuantity}
          >
            <QuantityEditor
              item={item}
              editingItemId={editingItemId}
              editedQuantity={editedQuantity}
              setEditedQuantity={setEditedQuantity}
              saveEditedQuantity={saveEditedQuantity}
              startEditingQuantity={startEditingQuantity}
              updateQuantity={updateQuantity}
            />
            <ItemMenu
              item={item}
              openMenuId={openMenuId}
              toggleMenu={toggleMenu}
              openEditModal={openEditModal}
              openInfoModal={openInfoModal}
              handleDeleteItem={handleDeleteItem}
            />
          </ItemCard>
        ))
      )}
    </div>
  );
};

export default RoomItemGrid; 