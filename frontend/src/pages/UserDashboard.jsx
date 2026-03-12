import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { AuthContext } from '../context/AuthContext';
import { 
  FiUploadCloud, FiFile, FiCheckCircle, FiClock, 
  FiAlertCircle, FiLayout, FiFolder, FiLogOut, FiSearch, FiFilter 
} from 'react-icons/fi';
import './App.css';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [view, setView] = useState('dashboard');
  const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchDocuments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/docs/user/${user.id}`);
      setDocuments(res.data);
    } catch (err) { console.error("Fetch error", err); }
  }, [user?.id]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  // Filtering Logic for My Documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    if (!file) return;

    const isDuplicate = documents.some(doc => doc.title === file.name);
    if (isDuplicate) {
      setUploadMessage({ text: 'ACCESS DENIED: FILE ALREADY EXISTS', type: 'error' });
      setTimeout(() => setUploadMessage({ text: '', type: '' }), 4000);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user?.id);

    try {
      const res = await axios.post('http://localhost:5000/api/docs/upload', formData);
      if (res.status === 200) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FF9F', '#00B3FF', '#ffffff']
        });

        setUploadMessage({ text: 'DOCUMENT SECURED SUCCESSFULLY!', type: 'success' });
        setFile(null); 
        fetchDocuments();
        setTimeout(() => setUploadMessage({ text: '', type: '' }), 5000);
      }
    } catch (err) { 
      setUploadMessage({ text: 'SYSTEM ERROR: UPLOAD FAILED', type: 'error' });
    }
  };

  const pending = documents.filter(d => d.status === 'PENDING').length;
  const approved = documents.filter(d => d.status === 'APPROVED').length;
  const rejected = documents.filter(d => d.status === 'REJECTED').length;

  const gradientTextStyle = {
    background: 'linear-gradient(90deg, #00FF9F, #00B3FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '800',
    fontFamily: 'Rajdhani'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#050B0A', color: 'white', overflow: 'hidden', fontFamily: 'Rajdhani' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#020504', padding: '30px 20px', borderRight: '1px solid rgba(0, 255, 159, 0.3)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h2 style={{ ...gradientTextStyle, fontSize: '24px', marginBottom: '40px' }}>DOCSAFE PRO</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div onClick={() => { setView('dashboard'); setSearchTerm(''); setStatusFilter('ALL'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: view === 'dashboard' ? '#00FF9F' : 'white', fontWeight: '600' }}><FiLayout /> Dashboard</div>
          <div onClick={() => { setView('archive'); setSearchTerm(''); setStatusFilter('ALL'); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: view === 'archive' ? '#00FF9F' : 'white', fontWeight: '600' }}><FiFolder /> My Documents</div>
          <div onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ff4d4d', marginTop: 'auto', marginBottom: '20px', fontWeight: '600' }}><FiLogOut /> Logout</div>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {uploadMessage.text && (
          <div className={`message-pop ${uploadMessage.type}`} style={{
            position: 'absolute', top: '20px', right: '40px', padding: '15px 30px', 
            borderRadius: '10px', zIndex: 1000, fontWeight: 'bold',
            background: uploadMessage.type === 'success' ? '#00FF9F22' : '#ff4d4d22',
            border: `1px solid ${uploadMessage.type === 'success' ? '#00FF9F' : '#ff4d4d'}`,
            color: uploadMessage.type === 'success' ? '#00FF9F' : '#ff4d4d',
            boxShadow: `0 0 20px ${uploadMessage.type === 'success' ? '#00FF9F33' : '#ff4d4d33'}`,
          }}>
            {uploadMessage.text}
          </div>
        )}

        <h1 style={{ ...gradientTextStyle, fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
          WELCOME, {user?.username?.toUpperCase()}!
        </h1>

        {view === 'dashboard' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '40px', flex: 1, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '20px', color: '#050B0A', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '800' }}>New Submission</h3>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px', border: '2px dashed #cbd5e1', borderRadius: '15px', cursor: 'pointer', backgroundColor: '#f8fafc' }}>
                  {file ? <FiFile size={45} color="#00FF9F" /> : <FiUploadCloud size={45} color="#94a3b8" />}
                  <p style={{ marginTop: '10px', fontSize: '12px', fontWeight: 'bold' }}>{file ? file.name : "Tap to Upload"}</p>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                <button onClick={handleUpload} className="cyber-btn" style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '900' }}>
                  SUBMIT DOCUMENT
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px' }}>
              <StatCard title="TOTAL UPLOADS" count={documents.length} color="#00B3FF" icon={<FiFile size={26}/>} />
              <StatCard title="PENDING DOCS" count={pending} color="#fbbf24" icon={<FiClock size={26}/>} />
              <StatCard title="VERIFIED DOCS" count={approved} color="#00FF9F" icon={<FiCheckCircle size={26}/>} />
              <StatCard title="REJECTED" count={rejected} color="#ef4444" icon={<FiAlertCircle size={26}/>} />
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'rgba(5, 11, 10, 0.8)', borderRadius: '20px', padding: '30px', border: '1px solid rgba(0, 255, 159, 0.3)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ ...gradientTextStyle, marginBottom: '25px', fontSize: '22px' }}>MY DATA ARCHIVE</h2>
            
            {/* SEARCH AND FILTER SECTION */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <FiSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#00FF9F' }} />
                <input 
                  type="text" 
                  placeholder="SEARCH_BY_FILENAME..." 
                  style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,159,0.3)', borderRadius: '8px', padding: '12px 12px 12px 45px', color: 'white', fontFamily: 'Rajdhani', outline: 'none' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,159,0.3)', borderRadius: '8px', padding: '0 15px' }}>
                <FiFilter color="#00FF9F" />
                <select 
                  style={{ backgroundColor: 'transparent', border: 'none', color: 'white', fontFamily: 'Rajdhani', cursor: 'pointer', outline: 'none', fontWeight: '700' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL" style={{background: '#050B0A'}}>ALL_STATUS</option>
                  <option value="APPROVED" style={{background: '#050B0A'}}>APPROVED</option>
                  <option value="PENDING" style={{background: '#050B0A'}}>PENDING</option>
                  <option value="REJECTED" style={{background: '#050B0A'}}>REJECTED</option>
                </select>
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #00FF9F', color: '#00FF9F', fontSize: '14px' }}>
                    <th style={{ textAlign: 'left', padding: '15px' }}>DOCUMENT NAME</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>STATUS</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>LEVEL</th>
                    <th style={{ textAlign: 'left', padding: '15px' }}>DATE & TIME</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '14px' }}>
                  {filteredDocuments.map(doc => {
                    const d = new Date(doc.submitted_at);
                    const day = d.getDate().toString().padStart(2, '0');
                    const month = (d.getMonth() + 1).toString().padStart(2, '0');
                    const year = d.getFullYear();
                    let hours = d.getHours();
                    const minutes = d.getMinutes().toString().padStart(2, '0');
                    const seconds = d.getSeconds().toString().padStart(2, '0');
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12 || 12;

                    return (
                      <tr key={doc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '18px', color: '#fff' }}>{doc.title}</td>
                        <td style={{ padding: '18px' }}>
                          <span style={{ color: doc.status === 'APPROVED' ? '#00FF9F' : doc.status === 'REJECTED' ? '#ef4444' : '#fbbf24', fontWeight: '700' }}>
                            ● {doc.status}
                          </span>
                        </td>
                        <td style={{ padding: '18px', fontWeight: '800', color: '#cbd5e1' }}>
                          {doc.status === 'REJECTED' ? 'N/A' : doc.current_level === 'FINAL' ? 'FINAL' : `${doc.current_level}`}
                        </td>
                        <td style={{ padding: '18px', whiteSpace: 'nowrap', color: 'white', fontWeight: '600' }}>
                          {`${day}/${month}/${year}`} 
                          <span style={{ color: '#00FF9F', margin: '0 10px', fontWeight: '900' }}>|</span> 
                          {`${hours}:${minutes}:${seconds} ${ampm}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, count, color, icon }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ 
        background: 'rgba(5, 11, 10, 0.9)', borderRadius: '20px', padding: '35px', 
        border: `1px solid ${hover ? color : 'rgba(255,255,255,0.1)'}`,
        boxShadow: hover ? `0 0 30px ${color}33` : 'none',
        transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }}>
      <div style={{ color: color, marginBottom: '15px' }}>{icon}</div>
      <h4 style={{ margin: 0, opacity: 0.5, fontSize: '13px', letterSpacing: '1px', fontWeight: '700' }}>{title}</h4>
      <h2 style={{ margin: '8px 0 0 0', fontSize: '52px', color: '#fff', fontWeight: '800', fontFamily: 'Rajdhani' }}>{count}</h2>
    </div>
  );
};

export default UserDashboard;