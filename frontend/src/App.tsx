import './App.css'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import PaginationTable from './components/Pagination_Table'
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaginationTable />} />
      </Routes>
    </BrowserRouter>
  );
}



export default App
