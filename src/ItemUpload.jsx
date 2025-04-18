import { useInventory } from '../context';
import * as XLSX from 'xlsx';

function ItemUpload() {
  const { updateItems } = useInventory();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      
      const newItems = {};
      json.forEach((row) => {
        const category = row['제품군'];
        const item = row['품목'];
        if (category && item) {
          if (!newItems[category]) newItems[category] = [];
          newItems[category].push(item);
        }
      });
      
      // Sort items alphabetically
      Object.keys(newItems).forEach((category) => {
        newItems[category] = [...new Set(newItems[category])].sort();
      });
      
      updateItems(newItems);
      alert('Items uploaded successfully!');
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h3>Upload Item List (Excel)</h3>
      <input type="file" accept=".xlsx" onChange={handleFileUpload} />
    </div>
  );
}

export default ItemUpload;
