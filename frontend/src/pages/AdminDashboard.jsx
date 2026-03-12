import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FiUsers, FiCheckCircle, FiXCircle, FiClock, FiTrash2, 
  FiLayout, FiLogOut, FiFileText, FiSettings, FiUser, FiActivity, FiSearch, FiFilter 
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [allUsers, setAllUsers] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [view, setView] = useState('overview');
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      const usersRes = await axios.get('http://localhost:5000/api/admin/users');
      const docsRes = await axios.get('http://localhost:5000/api/admin/documents');
      setAllUsers(usersRes.data);
      setAllDocs(docsRes.data);
    } catch (err) {
      console.error("Backend Sync Error:", err);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Confirm deletion? This will permanently remove the user and their files.")) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
        fetchData(); 
      } catch (err) { alert("Delete failed"); }
    }
  };

  const stats = {
    pending: allDocs.filter(d => d.status === 'PENDING').length,
    approved: allDocs.filter(d => d.status === 'APPROVED').length,
    rejected: allDocs.filter(d => d.status === 'REJECTED').length,
    users: allUsers.length
  };

  // COMBINED SEARCH & FILTER LOGIC
  const getProcessedDocs = () => {
    return allDocs.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (doc.username && doc.username.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = statusFilter === 'ALL' || doc.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  };

  const filteredDocs = getProcessedDocs();

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const d = new Date(timestamp);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} | ${hours}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return '#00FF9F';
      case 'REJECTED': return '#FF4D4D';
      case 'PENDING': return '#FFB800';
      default: return '#E2E8F0';
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>DOCSAFE <span style={{color: '#fff'}}>PRO</span></h2>
        <nav style={styles.nav}>
          <div onClick={() => {setView('overview'); setSearchTerm(''); setStatusFilter('ALL');}} style={view === 'overview' ? styles.activeLink : styles.link}><FiLayout /> OVERVIEW</div>
          <div onClick={() => {setView('docs'); setSearchTerm(''); setStatusFilter('ALL');}} style={view === 'docs' ? styles.activeLink : styles.link}><FiFileText /> DOCUMENTS</div>
          <div onClick={() => {setView('users'); setSearchTerm(''); setStatusFilter('ALL');}} style={view === 'users' ? styles.activeLink : styles.link}><FiUsers /> USERS</div>
          <div onClick={() => {setView('settings'); setSearchTerm(''); setStatusFilter('ALL');}} style={view === 'settings' ? styles.activeLink : styles.link}><FiSettings /> SETTINGS</div>
          <div onClick={logout} style={styles.logout}><FiLogOut /> LOGOUT</div>
        </nav>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
            <h1 style={styles.sparkleTitle}>SYSTEM_<span style={{ color: '#00FF9F' }}>COMMAND_CENTER</span></h1>
            <div style={styles.statusPill}><FiActivity /> LIVE_MONITORING</div>
        </div>

        {/* OVERVIEW SPECIFIC: Stat boxes only appear here */}
        {view === 'overview' && (
          <>
            <div style={styles.cardGrid}>
              <StatCard title="PENDING" count={stats.pending} color="#FFB800" icon={<FiClock />} />
              <StatCard title="APPROVED" count={stats.approved} color="#00FF9F" icon={<FiCheckCircle />} />
              <StatCard title="REJECTED" count={stats.rejected} color="#FF4D4D" icon={<FiXCircle />} />
              <StatCard title="TOTAL USERS" count={stats.users} color="#00B3FF" icon={<FiUsers />} />
            </div>

            <div style={searchBarRow}>
                <div style={searchWrapper}>
                  <FiSearch style={searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Search recent activity..." 
                    style={searchInput} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
            </div>

            <div style={styles.glassPanel}>
              <h3 style={styles.panelTitle}>LIVE_VERIFICATION_FEED</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>FILE IDENTIFIER</th>
                    <th style={styles.th}>ENFORCEMENT</th>
                    <th style={styles.th}>STAGE</th>
                    <th style={styles.th}>DATE | TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.slice(0, 10).map(doc => (
                    <tr key={doc.id} style={styles.tableRow}>
                      <td style={styles.td}>{doc.title}</td>
                      <td style={styles.td}>
                        <span style={{...styles.badge, color: getStatusColor(doc.status)}}>● {doc.status}</span>
                      </td>
                      <td style={styles.td}>{doc.current_level}</td>
                      <td style={{...styles.td, color: '#E2E8F0', fontWeight: '600'}}>{formatDateTime(doc.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* DOCUMENTS VIEW */}
        {view === 'docs' && (
          <>
            <div style={searchBarRow}>
              <div style={searchWrapper}>
                <FiSearch style={searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search archive by filename or owner..." 
                  style={searchInput} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div style={filterWrapper}>
                <FiFilter style={filterIcon} />
                <select 
                  style={filterSelect} 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">ALL_ENFORCEMENTS</option>
                  <option value="APPROVED">APPROVED_ONLY</option>
                  <option value="PENDING">PENDING_ONLY</option>
                  <option value="REJECTED">REJECTED_ONLY</option>
                </select>
              </div>
            </div>

            <div style={styles.glassPanel}>
              <h2 style={styles.panelTitle}>GLOBAL_DOCUMENT_ARCHIVE</h2>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>DOCUMENT_NAME</th>
                    <th style={styles.th}>OWNER</th>
                    <th style={styles.th}>DATE |  TIME</th>
                    <th style={styles.th}>FINAL_STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(doc => (
                    <tr key={doc.id} style={styles.tableRow}>
                      <td style={styles.td}><FiFileText style={{marginRight: '12px', color: '#00B3FF'}}/>{doc.title}</td>
                      <td style={styles.td}><FiUser style={{marginRight: '12px'}}/>{doc.username || `UID_${doc.user_id}`}</td>
                      <td style={{...styles.td, color: '#E2E8F0', fontWeight: '600'}}>{formatDateTime(doc.submitted_at)}</td>
                      <td style={styles.td}>
                        <span style={{...styles.badge, color: getStatusColor(doc.status)}}>● {doc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* USERS VIEW */}
        {view === 'users' && (
          <>
            <div style={searchBarRow}>
              <div style={searchWrapper}>
                <FiSearch style={searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search users by name..." 
                  style={searchInput} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.glassPanel}>
              <h2 style={styles.panelTitle}>SYSTEM_USER_DIRECTORY</h2>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>USER_IDENTIFIER</th>
                    <th style={styles.th}>ROLE</th>
                    <th style={styles.th}>LEVEL</th>
                    <th style={styles.th}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                    <tr key={u.id} style={styles.tableRow}>
                      <td style={{...styles.td, fontWeight: '700'}}>{u.username.toUpperCase()}</td>
                      <td style={styles.td}><span style={styles.roleBadge}>{u.role}</span></td>
                      <td style={styles.td}>{u.approval_level || 'L0_USER'}</td>
                      <td style={styles.td}>
                        <button onClick={() => handleDeleteUser(u.id)} className="cyber-delete-btn">DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* SETTINGS VIEW */}
        {view === 'settings' && (
          <div style={styles.glassPanel}>
            <h2 style={styles.panelTitle}>PORTAL_CONFIGURATIONS</h2>
            <div style={styles.configBox}>
                <h4 style={{color: '#00FF9F', margin: '0 0 10px 0'}}>ADMINISTRATOR_MODE: ENFORCED</h4>
                <p style={{color: '#94A3B8', margin: 0}}>Multi-tier verification is currently active across L1, L2, and L3 protocols.</p>
                <div style={{marginTop: '25px', display: 'flex', gap: '20px'}}>
                  <button className="settings-btn">RESET_SYSTEM_LOGS</button>
                  <button className="settings-btn" style={{borderColor: '#00B3FF', color: '#00B3FF'}}>UPDATE_SECURITY_KEYS</button>
                </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .cyber-delete-btn { background: rgba(255, 77, 77, 0.1); color: #FF4D4D; border: 1px solid #FF4D4D; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: 800; font-family: 'Rajdhani'; transition: 0.3s; }
        .cyber-delete-btn:hover { background: #FF4D4D; color: #fff; box-shadow: 0 0 15px rgba(255, 77, 77, 0.4); }
        .settings-btn { background: transparent; border: 1px solid #00FF9F; color: #00FF9F; padding: 12px 20px; border-radius: 4px; font-family: 'Rajdhani'; font-weight: 900; cursor: pointer; transition: 0.3s; }
        .settings-btn:hover { background: rgba(255,255,255,0.05); transform: translateY(-2px); }
        .stat-card-container { background: rgba(255, 255, 255, 0.03); border-radius: 15px; padding: 30px; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; border: 1px solid rgba(255,255,255,0.08); }
        .stat-card-container:hover { transform: translateY(-8px) scale(1.02); background: rgba(255, 255, 255, 0.06); }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, count, color, icon }) => (
  <div className="stat-card-container" style={{ borderBottom: `4px solid ${color}` }}>
    <div style={{ color: color, fontSize: '32px', marginBottom: '15px' }}>{icon}</div>
    <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: color, letterSpacing: '1px' }}>{title}</p>
    <h2 style={{ margin: '10px 0 0 0', fontSize: '52px', fontWeight: '900', color: '#fff' }}>{count}</h2>
  </div>
);

const searchBarRow = { display: 'flex', gap: '20px', marginBottom: '40px', alignItems: 'center' };
const searchWrapper = { position: 'relative', flex: 1, display: 'flex', alignItems: 'center' };
const searchIcon = { position: 'absolute', left: '18px', color: '#00FF9F', fontSize: '18px' };
const searchInput = { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 255, 159, 0.3)', borderRadius: '8px', padding: '14px 14px 14px 50px', color: '#fff', fontSize: '15px', fontFamily: "'Rajdhani', sans-serif", outline: 'none' };
const filterWrapper = { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(0, 255, 159, 0.3)', borderRadius: '8px', padding: '0 15px' };
const filterIcon = { color: '#00FF9F' };
const filterSelect = { backgroundColor: 'transparent', border: 'none', color: '#fff', padding: '14px 5px', fontFamily: "'Rajdhani', sans-serif", outline: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px' };

const styles = {
  container: { display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#050B0A', color: '#E2E8F0', fontFamily: "'Rajdhani', sans-serif", overflow: 'hidden' },
  sidebar: { width: '280px', backgroundColor: '#020504', padding: '40px 25px', borderRight: '1px solid rgba(0, 255, 159, 0.3)', display: 'flex', flexDirection: 'column' },
  logo: { color: '#00FF9F', fontSize: '28px', marginBottom: '60px', fontWeight: '900', letterSpacing: '3px' },
  nav: { display: 'flex', flexDirection: 'column', gap: '15px' },
  link: { display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '700', color: '#94A3B8' },
  activeLink: { display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', color: '#00FF9F', fontWeight: '900', backgroundColor: 'rgba(0, 255, 159, 0.08)', borderLeft: '5px solid #00FF9F' },
  logout: { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', color: '#FF4D4D', marginTop: 'auto', fontWeight: '800', padding: '20px' },
  main: { flex: 1, padding: '50px 70px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  sparkleTitle: { fontSize: '38px', fontWeight: '900', letterSpacing: '3px', background: 'linear-gradient(90deg, #00FF9F, #00B3FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statusPill: { backgroundColor: 'rgba(0, 255, 159, 0.1)', color: '#00FF9F', padding: '8px 20px', borderRadius: '30px', fontSize: '12px', fontWeight: '900', border: '1px solid #00FF9F', display: 'flex', alignItems: 'center', gap: '10px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', marginBottom: '40px' },
  glassPanel: { background: 'rgba(255,255,255,0.015)', borderRadius: '18px', padding: '40px', border: '1px solid rgba(255,255,255,0.08)' },
  panelTitle: { color: '#00FF9F', marginBottom: '35px', fontSize: '22px', fontWeight: '900', letterSpacing: '2px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '20px', color: '#00FF9F', fontSize: '15px', fontWeight: '900', borderBottom: '2px solid rgba(0, 255, 159, 0.4)' },
  tableRow: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
  td: { padding: '25px 20px', fontSize: '16px' },
  badge: { fontWeight: '900', fontSize: '14px' },
  roleBadge: { border: '1px solid #00B3FF', color: '#00B3FF', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '900' },
  configBox: { padding: '30px', border: '1px dashed #00FF9F', borderRadius: '8px', background: 'rgba(0, 255, 159, 0.02)' }
};

export default AdminDashboard;