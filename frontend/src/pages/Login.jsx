import './App.css';
import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState({ text: '', type: '' });
  const [isTunneling, setIsTunneling] = useState(false);
  const canvasRef = useRef(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Binary Tunnel Logic remains the same
  useEffect(() => {
    if (!isTunneling) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = "01010101";
    const fontSize = 16;
    const drops = Array(Math.floor(canvas.width / fontSize)).fill(0);
    const draw = () => {
      ctx.fillStyle = "rgba(5, 11, 10, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00FF9F";
      ctx.font = fontSize + "px Rajdhani";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [isTunneling]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      const userData = res.data.user || res.data;
      if (userData) {
        setLoginStatus({ text: 'ACCESS GRANTED', type: 'success' });
        setIsTunneling(true);
        setTimeout(() => {
          login(userData);
          if (res.data.token) localStorage.setItem('token', res.data.token);
          navigate(userData.role === 'ADMIN' ? '/admin' : userData.role === 'APPROVER' ? '/approver' : '/');
        }, 2000);
      }
    } catch (err) {
      setLoginStatus({ text: 'INVALID CREDENTIALS', type: 'error' });
      setTimeout(() => setLoginStatus({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="login-container" style={{ 
      /* HIGH CONTRAST BACKGROUND: Deep Onyx with a subtle Emerald glow in center */
      background: 'radial-gradient(circle, rgba(0,255,159,0.08) 0%, rgba(5,11,10,1) 70%)',
      backgroundColor: '#050B0A', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      overflow: 'hidden' 
    }}> 
      
      <canvas ref={canvasRef} className={`binary-canvas ${isTunneling ? 'binary-active' : ''}`} />

      {loginStatus.text && (
        <div className={`message-pop ${loginStatus.type}`} style={{
          position: 'absolute', top: '30px', padding: '15px 40px', borderRadius: '5px', zIndex: 1000, 
          fontWeight: '800', fontFamily: 'Rajdhani',
          background: loginStatus.type === 'success' ? '#00FF9F22' : '#ff4d4d22',
          border: `2px solid ${loginStatus.type === 'success' ? '#00FF9F' : '#ff4d4d'}`,
          color: loginStatus.type === 'success' ? '#00FF9F' : '#ff4d4d',
          animation: 'slideInDown 0.5s ease-out'
        }}>
          {loginStatus.text}
        </div>
      )}

      <div className="login-card" style={{ 
        zIndex: 10, 
        opacity: isTunneling ? 0 : 1, 
        transition: 'opacity 0.5s',
        /* Enhanced Card Shadow for Floating Effect */
        boxShadow: '0 0 50px rgba(0,0,0,0.8), 0 0 20px rgba(0,255,159,0.1)' 
      }}> 
        <h1 style={{ fontFamily: 'Rajdhani', fontWeight: '900' }}>DocSafe <span style={{ color: '#fff' }}>Pro</span></h1>
        <p className="system-status">STRUCTURED APPROVALS SIMPLIFIED!</p>
        
        <form className="input-group" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          
          <label style={{ textAlign: 'left', marginBottom: '5px' }}>USER_IDENTITY</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
          
          <label style={{ textAlign: 'left', marginBottom: '5px', marginTop: '15px' }}>SECURITY_KEY</label>
          <div style={{ position: 'relative', width: '100%', display: 'block' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              className="input-field" 
              placeholder="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                boxSizing: 'border-box', // CRITICAL: Ensures padding doesn't push the box out
                paddingRight: '45px',
                margin: 0
              }} 
            />
            <div 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', 
                cursor: 'pointer', color: '#00FF9F', display: 'flex', alignItems: 'center' 
              }}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </div>
          </div>
          
          <button className="cyber-btn" type="submit" style={{ marginTop: '25px', width: '100%' }}>
            LOGIN
          </button>
        </form>
        <p className="encryption-tag" style={{ marginTop: '20px' }}>PROTOCOL: BIOMETRIC_BYPASS_OFF</p>
      </div>
    </div>
  );
};

export default Login;