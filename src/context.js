import { createContext, useContext, useState, useEffect } from 'react';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState({});
  const [items, setItems] = useState({});

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('inventoryData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setInventory(parsed.inventory || {});
      setItems(parsed.items || {});
    }
  }, []);

  // Save to localStorage when inventory or items change
  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify({ inventory, items }));
  }, [inventory, items]);

  const updateInventory = (month, category, item, data) => {
    setInventory((prev) => {
      const newMonth = {
        ...prev[month],
        [category]: {
          ...(prev[month]?.[category] || {}),
          [item]: data,
        },
      };
      return { ...prev, [month]: newMonth };
    });
  };

  const addItem = (category, item) => {
    setItems((prev) => {
      const currentItems = prev[category] || [];
      if (!currentItems.includes(item)) {
        currentItems.push(item);
      }
      return {
        ...prev,
        [category]: [...currentItems].sort(),
      };
    });
  };

  const updateItems = (newItems) => {
    setItems(newItems);
  };

  // JSX를 명확히 정리
  return (
    <InventoryContext.Provider
      value={{
        inventory,
        items,
        updateInventory,
        addItem,
        updateItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
