import React, { useRef, useEffect } from "react";

const SearchBar = ({ searchQuery, setSearchQuery, filteredItems, showSearchResults, setShowSearchResults, scrollToItem, onResultClick }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!showSearchResults) return;
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchResults, setShowSearchResults]);

  return (
    <div className="search-container" ref={containerRef} style={{ position: "relative" }}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowSearchResults(true)}
        placeholder="Search..."
        style={{
          width: "240px",
          padding: "10px 14px",
          borderRadius: "20px",
          border: "1px solid #a3c5e0",
          backgroundColor: "rgb(255, 255, 255)",
          color: "#000",
          fontSize: "16px",
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
          background: "rgb(255, 255, 255)",
          border: "1px solid #fff",
          borderRadius: "8px",
          padding: "10px",
          marginTop: "10px",
          zIndex: 201
        }}>
          {filteredItems.length === 0 ? (
            <div style={{
              padding: "16px",
              color: "#fff",
              textAlign: "center",
              background: "#a3c5e0",
              border: "1px solid #fff",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: 500
            }}>
              No items found matching your search.
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  if (onResultClick) {
                    onResultClick(item);
                  } else {
                    scrollToItem(item.id);
                    setShowSearchResults(false);
                  }
                }}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  color: "#a3c5e0",
                  borderBottom: "1px solid #a3c5e0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff"
                }}
              >
                <span>
                  {item.name.split(searchQuery).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span style={{ backgroundColor: "#a3c5e0", color: "#fff", borderRadius: "4px", padding: "0 2px" }}>
                          {searchQuery}
                        </span>
                      )}
                    </span>
                  ))}
                </span>
                <span style={{ color: "#a3c5e0", fontWeight: 700 }}>→</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 