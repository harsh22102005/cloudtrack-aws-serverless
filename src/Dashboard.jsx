import { useState, useEffect } from 'react';
import { API_BASE_URL } from './aws-config.js';

function Dashboard({ userId, token, onLogout }) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Page load hote hi items fetch karo
  useEffect(() => {
    fetchItems();
  }, []);

  // GET - Saare items laao
  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/items?userId=${userId}`, {
        method: 'GET',
        headers: {
          Authorization: token
        }
      });
      const data = await response.json();
      if (response.ok) {
        setItems(data.items || []);
      } else {
        setError(data.message || 'Items load nahi hue');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  // POST - Naya item add karo
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
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
        fetchItems(); // List refresh karo
      } else {
        setError(data.message || 'Item add nahi hua');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  // PUT - Status toggle karo (pending <-> completed)
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'pending' ? 'completed' : 'pending';
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({
          userId: userId,
          itemId: item.itemId,
          title: item.title,
          status: newStatus
        })
      });
      if (response.ok) {
        fetchItems();
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  // DELETE - Item delete karo
  const handleDelete = async (itemId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items?userId=${userId}&itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token
        }
      });
      if (response.ok) {
        fetchItems();
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  };

  const tasks = items.filter((i) => i.type === 'task');
  const expenses = items.filter((i) => i.type === 'expense');
  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>CloudTrack Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <p>Welcome, <strong>{userId}</strong></p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Naya Item Add Karo</h3>
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ marginRight: '10px', padding: '8px' }}>
          <option value="task">Task</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        {type ==='expense' && (
          <input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: '8px', marginRight: '10px', width: '120px' }}
          />
        )}
        <button type="submit">Add</button>
      </form>

      {/* Tasks Section */}
      <h3>Tasks ({tasks.length})</h3>
      {tasks.length === 0 && <p>Koi task nahi hai.</p>}
      {tasks.map((item) => (
        <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #eee', marginBottom: '5px', borderRadius: '5px' }}>
          <span style={{ textDecoration: item.status === 'completed' ? 'line-through' : 'none' }}>
            {item.title}
          </span>
          <div>
            <button onClick={() => handleToggleStatus(item)} style={{ marginRight: '8px' }}>
              {item.status === 'pending' ? 'Mark Done' : 'Mark Pending'}
            </button>
            <button onClick={() => handleDelete(item.itemId)}>Delete</button>
          </div>
        </div>
      ))}

      {/* Expenses Section */}
      <h3 style={{ marginTop: '30px' }}>Expenses ({expenses.length}) — Total: ₹{totalExpense}</h3>
      {expenses.length === 0 && <p>Koi expense nahi hai.</p>}
      {expenses.map((item) => (
        <div key={item.itemId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #eee', marginBottom: '5px', borderRadius: '5px' }}>
          <span>{item.title} — ₹{item.amount}</span>
          <button onClick={() => handleDelete(item.itemId)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;