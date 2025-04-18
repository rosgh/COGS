import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import ItemUpload from './components/ItemUpload';
import InventoryTable from './components/InventoryTable';
import Summary from './components/Summary';
import { InventoryProvider } from './context.js';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CATEGORIES = ['과자', '홍차', '음료', '건강', '급식 품목', '악세사리', '전자제품', '완구'];

const AppContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Nav = styled.nav`
  display: flex;
  gap: 10px;
`;

function App() {
  return (
    <InventoryProvider>
      <Router>
        <AppContainer>
          <Nav>
            <NavLink to="/">Item Upload</NavLink>
            <NavLink to="/inventory">Inventory Table</NavLink>
            <NavLink to="/summary">Summary</NavLink>
          </Nav>
          <Routes>
            <Route path="/" element={<ItemUpload />} />
            <Route path="/inventory" element={<InventoryTable months={MONTHS} categories={CATEGORIES} />} />
            <Route path="/summary" element={<Summary months={MONTHS} categories={CATEGORIES} />} />
          </Routes>
        </AppContainer>
      </Router>
    </InventoryProvider>
  );
}

export default App;
