import styled from 'styled-components';
import { useInventory } from '../context';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
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

function Summary({ months, categories }) {
  const { inventory } = useInventory();
  const [selectedMonth, setSelectedMonth] = useState('April');

  const summaryData = categories.map((category) => {
    let totalOpening = 0;
    let totalReceipt = 0;
    let totalIssue = 0;
    let totalClosing = 0;

    if (inventory[selectedMonth]?.[category]) {
      Object.values(inventory[selectedMonth][category]).forEach((itemData) => {
        totalOpening += selectedMonth === 'April' ? itemData.opening.amount : itemData.opening.amount;
        totalReceipt += itemData.receipts.reduce((sum, r) => sum + r.amount, 0);
        totalIssue += itemData.issues.amount;
        totalClosing += itemData.closing.amount;
      });
    }

    return {
      category,
      opening: totalOpening,
      receipt: totalReceipt,
      issue: totalIssue,
      closing: totalClosing,
    };
  });

  return (
    <div>
      <h3>Summary</h3>
      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
        {months.slice(months.indexOf("April")).map((month) => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>
      <Table>
        <thead>
          <tr>
            <Th>Category</Th>
            <Th>Opening Amount</Th>
            <Th>Receipt Amount</Th>
            <Th>Issue Amount</Th>
            <Th>Closing Amount</Th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((data) => (
            <tr key={data.category}>
              <Td>{data.category}</Td>
              <Td>{data.opening.toFixed(2)}</Td>
              <Td>{data.receipt.toFixed(2)}</Td>
              <Td>{data.issue.toFixed(2)}</Td>
              <Td>{data.closing.toFixed(2)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Summary;
