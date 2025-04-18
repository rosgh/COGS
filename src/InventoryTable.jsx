import { useState } from 'react';
import styled from 'styled-components';
import { useInventory } from '../context';

const TabContainer = styled.div`
  margin-top: 20px;
`;

const TabNav = styled.div`
  display: flex;
  gap: 10px;
`;

const TabButton = styled.button`
  padding: 10px;
  background: ${(props) => (props.active ? '#007bff' : '#f0f0f0')};
  color: ${(props) => (props.active ? 'white' : '#333')};
  border: none;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

const Th = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  background-color: #f2f2f2;
`;

const Td = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

function InventoryTable({ month, categories }) {
  const { inventory, items, updateInventory, addItem } = useInventory();
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [newItem, setNewItem] = useState({});

  const initializeItemData = () => ({
    opening: { quantity: 0, unit_price: 0, amount: 0 },
    receipts: [],
    issues: { quantity: 0, amount: 0 },
    closing: { quantity: 0, unit_price: 0, amount: 0 },
  });

  const getPreviousClosing = (item, category) => {
    const monthIdx = MONTHS.indexOf(month);
    if (monthIdx === MONTHS.indexOf("April")) return { quantity: 0, amount: 0 };
    const prevMonth = MONTHS[monthIdx - 1];
    return (
      inventory[prevMonth]?.[category]?.[item]?.closing || { quantity: 0, amount: 0 }
    );
  };

  const calculateUnitPrice = (amount, quantity) => (quantity > 0 ? amount / quantity : 0);

  const handleAddItem = (category) => {
    if (newItem[category] && !items[category]?.includes(newItem[category])) {
      addItem(category, newItem[category]);
      setNewItem({ ...newItem, [category]: '' });
    }
  };

  const handleInputChange = (item, field, value, category, section) => {
    const itemData = inventory[month]?.[category]?.[item] || initializeItemData();
    
    if (section === 'opening') {
      const opening = { ...itemData.opening, [field]: parseFloat(value) || 0 };
      if (field === 'quantity' || field === 'amount') {
        opening.unit_price = calculateUnitPrice(opening.amount, opening.quantity);
      }
      itemData.opening = opening;
    } else if (section === 'receipt') {
      // Handled separately in receipt form
    } else if (section === 'issues') {
      const totalQty = itemData.opening.quantity + itemData.receipts.reduce((sum, r) => sum + r.quantity, 0);
      const totalAmount = itemData.opening.amount + itemData.receipts.reduce((sum, r) => sum + r.amount, 0);
      const unitPrice = calculateUnitPrice(totalAmount, totalQty);
      itemData.issues = {
        quantity: parseFloat(value) || 0,
        amount: (parseFloat(value) || 0) * unitPrice,
      };
    }

    // Recalculate closing
    const receiptQty = itemData.receipts.reduce((sum, r) => sum + r.quantity, 0);
    const receiptAmount = itemData.receipts.reduce((sum, r) => sum + r.amount, 0);
    const totalQty = itemData.opening.quantity + receiptQty;
    const totalAmount = itemData.opening.amount + receiptAmount;
    const closingUnitPrice = calculateUnitPrice(totalAmount, totalQty);
    itemData.closing = {
      quantity: itemData.opening.quantity + receiptQty - itemData.issues.quantity,
      unit_price: closingUnitPrice,
      amount: (itemData.opening.quantity + receiptQty - itemData.issues.quantity) * closingUnitPrice,
    };

    updateInventory(month, category, item, itemData);
  };

  const handleAddReceipt = (item, category, qty, amount) => {
    const itemData = inventory[month]?.[category]?.[item] || initializeItemData();
    const unitPrice = calculateUnitPrice(amount, qty);
    itemData.receipts.push({ quantity: parseFloat(qty) || 0, amount: parseFloat(amount) || 0, unit_price: unitPrice });

    // Recalculate closing
    const receiptQty = itemData.receipts.reduce((sum, r) => sum + r.quantity, 0);
    const receiptAmount = itemData.receipts.reduce((sum, r) => sum + r.amount, 0);
    const totalQty = itemData.opening.quantity + receiptQty;
    const totalAmount = itemData.opening.amount + receiptAmount;
    const closingUnitPrice = calculateUnitPrice(totalAmount, totalQty);
    itemData.closing = {
      quantity: itemData.opening.quantity + receiptQty - itemData.issues.quantity,
      unit_price: closingUnitPrice,
      amount: (itemData.opening.quantity + receiptQty - itemData.issues.quantity) * closingUnitPrice,
    };

    updateInventory(month, category, item, itemData);
  };

  return (
    <TabContainer>
      <TabNav>
        {categories.map((category) => (
          <TabButton
            key={category}
            active={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </TabButton>
        ))}
      </TabNav>
      <div>
        <h3>Add New Item to {activeCategory}</h3>
        <input
          type="text"
          value={newItem[activeCategory] || ''}
          onChange={(e) => setNewItem({ ...newItem, [activeCategory]: e.target.value })}
        />
        <button onClick={() => handleAddItem(activeCategory)}>Add Item</button>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Item</Th>
            <Th>Opening Qty</Th>
            <Th>Opening Unit Price</Th>
            <Th>Opening Amount</Th>
            <Th>Receipt Qty</Th>
            <Th>Receipt Unit Price</Th>
            <Th>Receipt Amount</Th>
            <Th>Issue Qty</Th>
            <Th>Issue Amount</Th>
            <Th>Closing Amount</Th>
          </tr>
        </thead>
        <tbody>
          {items[activeCategory]?.map((item) => {
            const itemData = inventory[month]?.[activeCategory]?.[item] || initializeItemData();
            const isApril = month === "April";
            const prevClosing = isApril ? { quantity: 0, amount: 0 } : getPreviousClosing(item, activeCategory);
            const opening = isApril ? itemData.opening : {
              quantity: prevClosing.quantity,
              amount: prevClosing.amount,
              unit_price: calculateUnitPrice(prevClosing.amount, prevClosing.quantity),
            };
            const receiptQty = itemData.receipts.reduce((sum, r) => sum + r.quantity, 0);
            const receiptAmount = itemData.receipts.reduce((sum, r) => sum + r.amount, 0);
            const receiptUnitPrice = calculateUnitPrice(receiptAmount, receiptQty);

            return (
              <tr key={item}>
                <Td>{item}</Td>
                <Td>
                  {isApril ? (
                    <input
                      type="number"
                      value={itemData.opening.quantity}
                      onChange={(e) => handleInputChange(item, 'quantity', e.target.value, activeCategory, 'opening')}
                    />
                  ) : (
                    opening.quantity
                  )}
                </Td>
                <Td>{opening.unit_price.toFixed(2)}</Td>
                <Td>
                  {isApril ? (
                    <input
                      type="number"
                      value={itemData.opening.amount}
                      onChange={(e) => handleInputChange(item, 'amount', e.target.value, activeCategory, 'opening')}
                    />
                  ) : (
                    opening.amount
                  )}
                </Td>
                <Td>{receiptQty.toFixed(2)}</Td>
                <Td>{receiptUnitPrice.toFixed(2)}</Td>
                <Td>{receiptAmount.toFixed(2)}</Td>
                <Td>
                  <input
                    type="number"
                    value={itemData.issues.quantity}
                    onChange={(e) => handleInputChange(item, 'quantity', e.target.value, activeCategory, 'issues')}
                  />
                </Td>
                <Td>{itemData.issues.amount.toFixed(2)}</Td>
                <Td>{itemData.closing.amount.toFixed(2)}</Td>
              </tr>
            );
          }) || <tr><Td colSpan="10">No items available</Td></tr>}
        </tbody>
      </Table>
      <div>
        <h4>Add Receipt</h4>
        {items[activeCategory]?.map((item) => (
          <div key={item}>
            <span>{item}: </span>
            <input type="number" id={`receipt_qty_${item}`} placeholder="Quantity" />
            <input type="number" id={`receipt_amt_${item}`} placeholder="Amount" />
            <button
              onClick={() => {
                const qty = document.getElementById(`receipt_qty_${item}`).value;
                const amt = document.getElementById(`receipt_amt_${item}`).value;
                if (qty && amt) handleAddReceipt(item, activeCategory, qty, amt);
              }}
            >
              Add Receipt
            </button>
          </div>
        ))}
      </div>
      <h4>Totals</h4>
      <p>
        Opening: {items[activeCategory]?.reduce((sum, item) => {
          const data = inventory[month]?.[activeCategory]?.[item] || initializeItemData();
          return sum + (month === "April" ? data.opening.amount : getPreviousClosing(item, activeCategory).amount);
        }, 0).toFixed(2)}
      </p>
      <p>
        Receipts: {items[activeCategory]?.reduce((sum, item) => {
          const data = inventory[month]?.[activeCategory]?.[item] || initializeItemData();
          return sum + data.receipts.reduce((s, r) => s + r.amount, 0);
        }, 0).toFixed(2)}
      </p>
      <p>
        Issues: {items[activeCategory]?.reduce((sum, item) => {
          const data = inventory[month]?.[activeCategory]?.[item] || initializeItemData();
          return sum + data.issues.amount;
        }, 0).toFixed(2)}
      </p>
      <p>
        Closing: {items[activeCategory]?.reduce((sum, item) => {
          const data = inventory[month]?.[activeCategory]?.[item] || initializeItemData();
          return sum + data.closing.amount;
        }, 0).toFixed(2)}
      </p>
    </TabContainer>
  );
}

export default InventoryTable;
