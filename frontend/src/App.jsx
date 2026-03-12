import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard'; 
import ApproverDashboard from './pages/ApproverDashboard';
import AdminDashboard from './pages/AdminDashboard'; // Import the new sparkly Admin component

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* If not logged in, show Login. If logged in, redirect to home "/" */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        {/* Role-Based Routing */}
        <Route path="/" element={
          !user ? <Navigate to="/login" /> :
          user.role === 'ADMIN' ? <AdminDashboard /> : 
          user.role === 'APPROVER' ? <ApproverDashboard /> : 
          <UserDashboard /> 
        } />

        {/* Catch-all route to prevent 404s */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;