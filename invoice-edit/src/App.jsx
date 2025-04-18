import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreateInvoice from './pages/CreateInvoice';
import ListInvoices  from './pages/ListInvoices';
import ViewInvoice   from './pages/ViewInvoice';
import EditInvoice   from './pages/EditInvoice';

import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/"          element={<Navigate to="/list" />} /> */}
        <Route path="/create"    element={<CreateInvoice />} />
        <Route path="/list"      element={<ListInvoices />} />
        <Route path="/view/:id"  element={<ViewInvoice />} />
        <Route path="/edit/:id"  element={<EditInvoice />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
