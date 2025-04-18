import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import ItemUpload from './components/ItemUpload';
import InventoryTable from './components/InventoryTable';
import Summary from './components/Summary';
import { InventoryProvider } from './context';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const CATEGORIES = ["과자", "중국", "음료", "라면", "문구", "빵", "생활용품", "약품", "아이스크림", "포켓몬", "앨범", "아이돌"];

const AppContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Nav = styled.nav`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const NavTab = styled(NavLink)`
  padding: 10px;
  text-decoration: none;
  color: #333;
  &.active {
    background-color: #007bff;
    color: white;
    border-radius: 5px;
  }
`;

const SaveButton = styled.button`
  margin: 10px 0;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

function App() {
  const [showUpload, setShowUpload] = useState(false);

  const handleSave = () => {
    // Save data to localStorage (context handles actual saving)
    alert("Data saved successfully!");
  };

  return (
    <InventoryProvider>
      <Router>
        <AppContainer>
          <h1>Inventory Management</h1>
          <button onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? "Hide Upload" : "Show Upload"}
          </button>
          {showUpload && <ItemUpload />}
          <SaveButton onClick={handleSave}>Save Data</SaveButton>
          <Nav>
            {MONTHS.slice(MONTHS.indexOf("April")).map((month) => (
              <NavTab key={month} to={`/month/${month}`}>
                {month}
              </NavTab>
            ))}
            <NavTab to="/summary">Summary</NavTab>
          </Nav>
          <Routes>
            {MONTHS.slice(MONTHS.indexOf("April")).map((month) => (
              <Route
                key={month}
                path={`/month/${month}`}
                element={<InventoryTable month={month} categories={CATEGORIES} />}
              />
            ))}
            <Route path="/summary" element={<Summary months={MONTHS} categories={CATEGORIES} />} />
            <Route path="/" element={<InventoryTable month="April" categories={CATEGORIES} />} />
          </Routes>
        </AppContainer>
      </Router>
    </InventoryProvider>
  );
}

export default App;
