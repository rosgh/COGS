import { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState({});
  const [items, setItems] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('inventoryData');
    if (savedData) {
      const { inventory, items } = JSON.parse(savedData);
      setInventory(inventory || {});
      setItems(items || {});
    }
  }, []);

  // Save to localStorage when inventory or items change
  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify({ inventory, items }));
  }, [inventory, items]);

  const updateInventory = (month, category, item, data) => {
    setInventory((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        [category]: {
          ...prev[month]?.[category],
          [item]: data,
        },
      },
    }));
  };

  const addItem = (category, item) => {
    setItems((prev) => {
      const newItems = [...(prev[category] || []), item];
      return {
        ...prev,
        [category]: [...new Set(newItems)].sort(), // Sort alphabetically
      };
    });
  };

  const updateItems = (newItems) => {
    setItems(newItems);
  };

  return (
    <InventoryContext.Provider value={{ inventory, items, updateInventory, addItem, updateItems }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
