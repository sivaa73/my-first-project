import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiEye, FiCheck, FiX, FiClock, FiFileText, FiActivity, FiLogOut, FiDatabase, FiSearch, FiFilter } from 'react-icons/fi';

const ApproverDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [historyDocs, setHistoryDocs] = useState([]);
  const [activeTab, setActiveTab] = useState('queue');
  
  // NEW: Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchData = useCallback(async () => {
    if (!user?.approval_level) return;
    try {
      const queueRes = await axios.get(`http://localhost:5000/api/docs/pending/${user.approval_level}`);
      setPendingDocs(queueRes.data);
      const historyRes = await axios.get(`http://localhost:5000/api/docs/history/${user.approval_level}`);
      setHistoryDocs(historyRes.data);
    } catch (err) { console.error("Data fetch error:", err); }
  }, [user?.approval_level]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (docId, action) => {
    let nextLevel = user.approval_level;
    let status = 'PENDING';
    if (action === 'approve') {
      if (user.approval_level === 'L1') nextLevel = 'L2';
      else if (user.approval_level === 'L2') nextLevel = 'L3';
      else if (user.approval_level === 'L3') { nextLevel = 'FINAL'; status = 'APPROVED'; }
    } else {
      status = 'REJECTED';
      nextLevel = 'NONE';
    }
    try {
      await axios.put(`http://localhost:5000/api/docs/update-status/${docId}`, { status, nextLevel });
      fetchData();
    } catch (err) { console.error("Action failed"); }
  };

  // Logic to process the list based on search and filters
  const getFilteredList = () => {
    const list = activeTab === 'queue' ? pendingDocs : historyDocs;
    return list.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (doc.username && doc.username.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterStatus === 'ALL' || doc.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const filteredData = getFilteredList();

  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <h2 style={logoStyle}>DOCSAFE <span style={{color:'#fff'}}>PRO</span></h2>
        <nav style={navStack}>
          <div onClick={() => setActiveTab('queue')} style={activeTab === 'queue' ? navActive : navLink}>
            <FiActivity /> APPROVAL_QUEUE
          </div>
          <div onClick={() => setActiveTab('history')} style={activeTab === 'history' ? navActive : navLink}>
            <FiClock /> PAST_DECISIONS
          </div>
          <div onClick={logout} style={logoutLink}><FiLogOut /> LOGOUT</div>
        </nav>
      </aside>

      <main style={contentArea}>
        <div style={headerFlex}>
          <h1 style={gradientTitle}>REVIEW_<span style={{ color: '#fff' }}>CONSOLE</span></h1>
          <div style={levelBadge}>{user?.approval_level || 'N/A'}_AUTHORITY</div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div style={searchBarContainer}>
          <div style={searchWrapper}>
            <FiSearch style={searchIcon} />
            <input 
              type="text" 
              placeholder="Search by file name or user..." 
              style={searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === 'history' && (
            <div style={filterWrapper}>
              <FiFilter style={filterIcon} />
              <select 
                style={filterSelect} 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">ALL STATUS</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          )}
        </div>

        {activeTab === 'queue' && (
          <div style={statsGrid}>
            <div className="stat-card pending-hover" style={cardStyle}>
              <div style={cardHeader}><FiClock color="#FFB800" /> PENDING</div>
              <h2 style={cardValue}>{pendingDocs.length}</h2>
            </div>
            <div className="stat-card approved-hover" style={cardStyle}>
              <div style={cardHeader}><FiCheck color="#00FF9F" /> AUTHORIZED</div>
              <h2 style={cardValue}>{historyDocs.filter(d => d.status === 'APPROVED' || d.status === 'PENDING').length}</h2>
            </div>
            <div className="stat-card rejected-hover" style={cardStyle}>
              <div style={cardHeader}><FiX color="#FF4D4D" /> REJECTED</div>
              <h2 style={cardValue}>{historyDocs.filter(d => d.status === 'REJECTED').length}</h2>
            </div>
          </div>
        )}

        <div style={tableContainer}>
          <h3 style={tableTitle}>
            <FiDatabase style={{marginRight: '10px'}}/>
            {activeTab === 'queue' ? 'LIVE_VERIFICATION_STREAM' : 'HISTORICAL_ARCHIVE'}
          </h3>
          <table style={mainTable}>
            <thead>
              <tr style={thRow}>
                <th style={{ padding: '15px' }}>FILENAME</th>
                <th style={{ padding: '15px' }}>USER_ID</th>
                <th style={{ padding: '15px' }}>DATE | TIME</th>
                <th style={{ textAlign: 'center', padding: '15px' }}>ENFORCEMENT</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(doc => {
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
                  <tr key={doc.id} style={trRow}>
                    <td style={tdText}><FiFileText style={{marginRight: '10px', color: '#00FF9F'}}/> {doc.title}</td>
                    <td style={{ ...tdText, fontWeight: '700' }}>{doc.username ? doc.username.toUpperCase() : `USER_${doc.user_id}`}</td>
                    <td style={{ ...tdText, color: 'white', fontWeight: '600' }}>
                      {`${day}/${month}/${year}`} 
                      <span style={{ color: '#00FF9F', margin: '0 10px', fontWeight: '900' }}>|</span> 
                      {`${hours}:${minutes}:${seconds} ${ampm}`}
                    </td>
                    <td style={{ ...actionGroup, padding: '15px' }}>
                      {activeTab === 'queue' ? (
                        <>
                          <button onClick={() => window.open(`http://localhost:5000/${doc.file_path}`, '_blank')} className="cyber-btn btn-view">VIEW</button>
                          <button onClick={() => handleAction(doc.id, 'approve')} className="cyber-btn btn-approve">APPROVE</button>
                          <button onClick={() => handleAction(doc.id, 'reject')} className="cyber-btn btn-reject">REJECT</button>
                        </>
                      ) : (
                        <span style={{ 
                          color: doc.status === 'REJECTED' ? '#FF4D4D' : '#00FF9F', 
                          fontWeight: '800', 
                          fontSize: '12px',
                          letterSpacing: '1px'
                        }}>
                          {doc.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>NO DOCUMENTS FOUND MATCHING YOUR SEARCH</div>
          )}
        </div>
      </main>

      <style>{`
        .cyber-btn { border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 11px; letter-spacing: 0.5px; transition: all 0.2s ease; font-family: 'Rajdhani', sans-serif; }
        .btn-view { background: rgba(0, 179, 255, 0.08); color: #00B3FF; border: 1px solid rgba(0, 179, 255, 0.3); }
        .btn-approve { background: rgba(0, 255, 159, 0.08); color: #00FF9F; border: 1px solid rgba(0, 255, 159, 0.3); }
        .btn-reject { background: rgba(255, 77, 77, 0.08); color: #FF4D4D; border: 1px solid rgba(255, 77, 77, 0.3); }
        .cyber-btn:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.05); }
        .btn-view:hover { border-color: #00B3FF; color: #fff; }
        .btn-approve:hover { border-color: #00FF9F; color: #fff; }
        .btn-reject:hover { border-color: #FF4D4D; color: #fff; }
        .cyber-btn:active { transform: scale(0.96); }
      `}</style>
    </div>
  );
};

// CSS Styles (Including New Search/Filter Styles)
const pageStyle = { display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#050B0A', color: '#E2E8F0', fontFamily: "'Rajdhani', sans-serif", overflow: 'hidden' };
const sidebarStyle = { width: '280px', backgroundColor: '#050B0A', borderRight: '1px solid rgba(255, 255, 255, 0.05)', padding: '40px 20px', display: 'flex', flexDirection: 'column' };
const logoStyle = { color: '#00FF9F', fontSize: '24px', fontWeight: '900', marginBottom: '60px', letterSpacing: '2px' };
const navStack = { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 };
const navLink = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '4px', cursor: 'pointer', color: '#94A3B8', fontWeight: '600' };
const navActive = { ...navLink, backgroundColor: 'rgba(0, 255, 159, 0.1)', color: '#00FF9F', borderLeft: '4px solid #00FF9F' };
const logoutLink = { ...navLink, color: '#FF4D4D', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' };
const contentArea = { flex: 1, padding: '50px 70px', overflowY: 'auto' };
const gradientTitle = { fontSize: '36px', fontWeight: '900', margin: 0, letterSpacing: '3px', background: 'linear-gradient(90deg, #00FF9F, #00B3FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const levelBadge = { background: 'linear-gradient(90deg, #00FF9F, #00B3FF)', color: '#050B0A', padding: '8px 20px', borderRadius: '2px', fontSize: '12px', fontWeight: '900' };
const headerFlex = { display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '40px' };

// Search bar specific styles
const searchBarContainer = { display: 'flex', gap: '20px', marginBottom: '30px' };
const searchWrapper = { position: 'relative', flex: 1, display: 'flex', alignItems: 'center' };
const searchIcon = { position: 'absolute', left: '15px', color: '#00FF9F', fontSize: '18px' };
const searchInput = { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 255, 159, 0.2)', borderRadius: '8px', padding: '12px 12px 12px 45px', color: '#fff', fontFamily: "'Rajdhani', sans-serif", outline: 'none' };
const filterWrapper = { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 255, 159, 0.2)', borderRadius: '8px', padding: '0 15px' };
const filterIcon = { color: '#00FF9F' };
const filterSelect = { backgroundColor: 'transparent', border: 'none', color: '#fff', padding: '12px 5px', fontFamily: "'Rajdhani', sans-serif", outline: 'none', cursor: 'pointer', fontWeight: '600' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '50px' };
const cardStyle = { backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' };
const cardHeader = { fontSize: '13px', fontWeight: '700', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' };
const cardValue = { fontSize: '48px', fontWeight: '900', color: '#fff', margin: 0 };
const tableContainer = { backgroundColor: 'rgba(255, 255, 255, 0.01)', padding: '35px', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.05)' };
const tableTitle = { color: '#00FF9F', fontSize: '20px', fontWeight: '700', marginBottom: '30px' };
const mainTable = { width: '100%', borderCollapse: 'collapse' };
const thRow = { textAlign: 'left', borderBottom: '1px solid rgba(0, 255, 159, 0.2)', color: '#00FF9F', fontSize: '13px', fontWeight: '800', letterSpacing: '1px' };
const trRow = { borderBottom: '1px solid rgba(255,255,255,0.03)' };
const tdText = { padding: '22px 15px', fontSize: '14px', color: '#CBD5E1' };
const actionGroup = { display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' };

export default ApproverDashboard;