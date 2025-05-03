import { useState, useEffect } from "react";

export default function useSearch(items) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    setFilteredItems,
    showSearchResults,
    setShowSearchResults
  };
} 