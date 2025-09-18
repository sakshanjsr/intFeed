// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/users';

function App() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, age: parseInt(age) }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setName('');
        setAge('');
        fetchUsers(); // Refresh the list
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="App">
      <header>
        <h1>intFeed</h1>
      </header>
      <main>
        <h2>Add a new record</h2>
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>

        <div className="list-container">
          <h2>All Stored Records</h2>
          {users.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No records found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;