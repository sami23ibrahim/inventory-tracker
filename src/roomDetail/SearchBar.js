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
  );
};

export default SearchBar; 