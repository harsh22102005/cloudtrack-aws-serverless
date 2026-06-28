import { useState, useEffect } from 'react';
import { API_BASE_URL, RECEIPTS_BUCKET, AWS_REGION } from './aws-config.js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { fetchAuthSession } from "aws-amplify/auth";

function Dashboard({ userId, token, onLogout }) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const getEmailFromToken = (t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.email || userId;
    } catch {
      return userId;
    }
  };

  const displayName = getEmailFromToken(token);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/items?userId=${userId}`, {
        method: 'GET',
        headers: { Authorization: token }
      });
      const data = await response.json();
      if (response.ok) {
        setItems(data.items || []);
      } else {
        setError(data.message || 'Failed to load items');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({
          userId: userId,
          type: type,
          title: title,
          amount: type === 'expense' ? parseFloat(amount) || 0 : null,
          status: 'pending'
        })
      });
      const data = await response.json();
      if (response.ok) {
        setTitle('');
        setAmount('');
        fetchItems();
      } else {
        setError(data.message || 'Failed to add item');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'pending' ? 'completed' : 'pending';
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ userId: userId, itemId: item.itemId, title: item.title, status: newStatus })
      });
      if (response.ok) fetchItems();
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (itemId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items?userId=${userId}&itemId=${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: token }
      });
      if (response.ok) fetchItems();
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage('');

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens.idToken.toString();

      const credentials = fromCognitoIdentityPool({
        clientConfig: { region: AWS_REGION },
        identityPoolId: "us-east-2:4f1e9d74-eaed-4541-997a-dbeb1d6706ae",
        logins: {
          [`cognito-idp.${AWS_REGION}.amazonaws.com/us-east-2_pS4w10tak`]: idToken
        }
      });

      const s3Client = new S3Client({ region: AWS_REGION, credentials: credentials });
      const fileName = `${userId}-${Date.now()}-${file.name}`;
      const fileBuffer = await file.arrayBuffer();

      await s3Client.send(
        new PutObjectCommand({
          Bucket: RECEIPTS_BUCKET,
          Key: fileName,
          Body: fileBuffer,
          ContentType: file.type
        })
      );

      setUploadMessage('success:Receipt uploaded. A notification email is on its way.');
    } catch (err) {
      setUploadMessage('error:Upload failed - ' + err.message);
    }
    setUploading(false);
  };

  const tasks = items.filter((i) => i.type === 'task');
  const expenses = items.filter((i) => i.type === 'expense');
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const openTasks = tasks.filter((t) => t.status === 'pending').length;

  const isUploadError = uploadMessage.startsWith('error:');
  const uploadText = uploadMessage.replace('success:', '').replace('error:', '');

  const styles = {
    page: { minHeight: '100vh', background: '#0A0E1F', color: '#F4F6FA', fontFamily: "'Inter', sans-serif", paddingBottom: '60px' },
    topBar: {
      background: '#141B33', borderBottom: '1px solid #262F52', padding: '16px 28px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
    },
    brand: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '17px', fontFamily: "'Space Grotesk', sans-serif" },
    dot: { width: '8px', height: '8px', borderRadius: '50%', background: '#34D399', boxShadow: '0 0 10px #34D399' },
    welcome: { fontSize: '12.5px', color: '#8A93B8' },
    logoutBtn: { background: '#1B2444', border: '1px solid #262F52', color: '#F4F6FA', padding: '8px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' },
    body: { padding: '28px', maxWidth: '880px', margin: '0 auto' },
    err: { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.35)', color: '#FCA5A5', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { background: '#141B33', border: '1px solid #262F52', borderRadius: '14px', padding: '18px 20px' },
    statLabel: { fontSize: '11px', color: '#8A93B8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 },
    statValue: { fontFamily: "'JetBrains Mono', monospace", fontSize: '26px', fontWeight: 600, marginTop: '8px' },
    panel: { background: '#141B33', border: '1px solid #262F52', borderRadius: '14px', padding: '20px', marginBottom: '18px' },
    panelTitle: { fontSize: '14.5px', marginBottom: '14px', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
    formRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
    select: { background: '#1B2444', border: '1px solid #262F52', borderRadius: '10px', padding: '11px 12px', color: '#F4F6FA', fontSize: '13.5px', flex: '0 0 110px' },
    input: { background: '#1B2444', border: '1px solid #262F52', borderRadius: '10px', padding: '11px 14px', color: '#F4F6FA', fontSize: '13.5px', flex: '1 1 160px', outline: 'none' },
    addBtn: { border: 'none', borderRadius: '10px', padding: '11px 22px', background: 'linear-gradient(135deg,#4D7FFF,#9B6BFF)', color: 'white', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' },
    uploadBox: { border: '1.5px dashed #262F52', borderRadius: '12px', padding: '22px', textAlign: 'center', background: '#1B2444', cursor: 'pointer', display: 'block' },
    uploadIcon: { fontSize: '20px' },
    uploadT: { fontSize: '13px', fontWeight: 600, marginTop: '8px' },
    uploadD: { fontSize: '11.5px', color: '#8A93B8', marginTop: '4px' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #262F52' },
    rowLast: { borderBottom: 'none' },
    rowTitle: { fontSize: '13.5px' },
    rowTitleDone: { textDecoration: 'line-through', color: '#8A93B8' },
    rowActions: { display: 'flex', gap: '8px', alignItems: 'center' },
    pillPending: { fontSize: '11px', padding: '4px 10px', borderRadius: '999px', fontWeight: 600, background: 'rgba(155,107,255,0.15)', color: '#C4B5FD' },
    pillDone: { fontSize: '11px', padding: '4px 10px', borderRadius: '999px', fontWeight: 600, background: 'rgba(52,211,153,0.15)', color: '#6EE7B7' },
    iconBtn: { background: '#1B2444', border: '1px solid #262F52', color: '#8A93B8', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px' },
    empty: { fontSize: '13px', color: '#8A93B8', padding: '4px 0' },
    amountText: { fontFamily: "'JetBrains Mono', monospace", color: '#8A93B8', fontSize: '13px' }
  };

  return (
    <div style={styles.page}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet" />

      <div style={styles.topBar}>
        <div style={styles.brand}><span style={styles.dot}></span>CloudTrack</div>
        <div style={styles.welcome}>Welcome, <strong style={{ color: '#F4F6FA' }}>{displayName}</strong></div>
        <button style={styles.logoutBtn} onClick={onLogout}>Log out</button>
      </div>

      <div style={styles.body}>
        {error && <div style={styles.err}>{error}</div>}

        <div style={styles.statGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Open tasks</div>
            <div style={{ ...styles.statValue, color: '#4D7FFF' }}>{String(openTasks).padStart(2, '0')}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Tracked expenses</div>
            <div style={{ ...styles.statValue, color: '#9B6BFF' }}>{String(expenses.length).padStart(2, '0')}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total spent</div>
            <div style={{ ...styles.statValue, color: '#34D399' }}>${totalExpense}</div>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>Add new item</div>
          <form onSubmit={handleAddItem} style={styles.formRow}>
            <select style={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="task">Task</option>
              <option value="expense">Expense</option>
            </select>
            <input style={styles.input} type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            {type === 'expense' && (
              <input style={{ ...styles.input, flex: '0 0 120px' }} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            )}
            <button style={styles.addBtn} type="submit" disabled={loading}>Add</button>
          </form>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>Upload receipt</div>
          <label style={styles.uploadBox}>
            <div style={styles.uploadIcon}>&#8593;</div>
            <div style={styles.uploadT}>{uploading ? 'Uploading...' : 'Click to choose a receipt'}</div>
            <div style={styles.uploadD}>Goes straight to S3 - you will get an email once it is processed</div>
            <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
          {uploadMessage && (
            <div style={{ marginTop: '12px', fontSize: '12.5px', color: isUploadError ? '#FCA5A5' : '#6EE7B7' }}>
              {uploadText}
            </div>
          )}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>Tasks ({tasks.length})</div>
          {tasks.length === 0 && <div style={styles.empty}>No tasks yet.</div>}
          {tasks.map((item, i) => (
            <div key={item.itemId} style={i === tasks.length - 1 ? { ...styles.row, ...styles.rowLast } : styles.row}>
              <span style={item.status === 'completed' ? { ...styles.rowTitle, ...styles.rowTitleDone } : styles.rowTitle}>{item.title}</span>
              <div style={styles.rowActions}>
                <span style={item.status === 'pending' ? styles.pillPending : styles.pillDone}>
                  {item.status === 'pending' ? 'Pending' : 'Done'}
                </span>
                <button style={styles.iconBtn} onClick={() => handleToggleStatus(item)} title="Toggle status">
                  {item.status === 'pending' ? '\u2713' : '\u21BA'}
                </button>
                <button style={styles.iconBtn} onClick={() => handleDelete(item.itemId)} title="Delete">&#10005;</button>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.panel}>
          <div style={styles.panelTitle}>Expenses (${totalExpense} total)</div>
          {expenses.length === 0 && <div style={styles.empty}>No expenses yet.</div>}
          {expenses.map((item, i) => (
            <div key={item.itemId} style={i === expenses.length - 1 ? { ...styles.row, ...styles.rowLast } : styles.row}>
              <span style={styles.rowTitle}>{item.title}</span>
              <div style={styles.rowActions}>
                <span style={styles.amountText}>${item.amount}</span>
                <button style={styles.iconBtn} onClick={() => handleDelete(item.itemId)} title="Delete">&#10005;</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;