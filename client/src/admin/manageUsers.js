import React, { useState, useEffect } from 'react';
import SideBar from '../components/side_bar';
import TopNavbar from '../components/top_navbar';
import axios from 'axios';
import './css/manageUsers.css';
import { useNavigate } from 'react-router-dom';

const ManageUsers = () => {
  const [searchInput, setSearchInput] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUser, setFilteredUser] = useState(null);
  const [showEmails, setShowEmails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });

        if (!response.data.isAdmin) {
          alert('You are not authorized to access this page.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error verifying admin:', error);
        alert('Session expired. Please log in again.');
        navigate('/login');
      }
    };

    verifyAdmin();
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = () => {
    const userIdLength = 20;

    if (searchInput.trim().length !== userIdLength) {
      alert(`Invalid User ID. Please enter a User ID with exactly ${userIdLength} characters.`);
      setFilteredUser(null);
      return;
    }

    const user = users.find((u) => u.userId === searchInput.trim());
    setFilteredUser(user || null);
  };

  const toggleEmailVisibility = (userId) => {
    setShowEmails((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const formatEmail = (email, isVisible) => {
    if (isVisible) return email;
    const [prefix, domain] = email.split('@');
    const visibleStart = Math.min(2, prefix.length);
    const visibleEnd = Math.min(2, prefix.length - visibleStart);
    const hiddenLength = prefix.length - visibleStart - visibleEnd;

    const hiddenPart = '*'.repeat(hiddenLength);
    return `${prefix.slice(0, visibleStart)}${hiddenPart}${prefix.slice(prefix.length - visibleEnd)}@${domain}`;
  };

  const handleApproveSeller = async (userId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/users/approve-seller/${userId}`, {
        isSeller: true,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });

      if (response.status === 200) {
        alert('Seller approved successfully!');
        const updatedUsers = users.map((user) =>
          user.userId === userId ? { ...user, isSeller: true } : user
        );
        setUsers(updatedUsers);
      } else {
        console.error('Failed to approve seller:', response.data);
        alert(response.data.message || 'Failed to approve seller.');
      }
    } catch (error) {
      console.error('Error approving seller:', error.message);
      alert(error.response?.data?.message || 'Error approving seller. Please try again.');
    }
  };

  const handleRemoveSeller = async (userId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/users/remove-seller/${userId}`, {
        isSeller: false,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });

      if (response.status === 200) {
        alert('Seller role removed successfully!');
        const updatedUsers = users.map((user) =>
          user.userId === userId ? { ...user, isSeller: false } : user
        );
        setUsers(updatedUsers);
      } else {
        console.error('Failed to remove seller role:', response.data);
        alert('Failed to remove seller role.');
      }
    } catch (error) {
      console.error('Error removing seller role:', error.message);
      alert('Error removing seller role. Please try again.');
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="admin-manage-user-container">
      <TopNavbar />
      <div className="dashboard-content">
        <SideBar />
        <div className="manage-users-main">
          <button className="back-button" onClick={() => navigate('/admin')}>
            &lt; Back to Admin Panel
          </button>
          <h1>Manage Users</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by User ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Verified Email</th>
                  <th>Verified Seller</th>
                  <th>Active Listings</th>
                  <th>User ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredUser ? (
                  <tr>
                    <td>{`${filteredUser.first_name} ${filteredUser.last_name}`}</td>
                    <td>
                      {formatEmail(filteredUser.email, showEmails[filteredUser.userId])}
                      <button onClick={() => toggleEmailVisibility(filteredUser.userId)}>
                        {showEmails[filteredUser.userId] ? 'Hide' : 'Show'}
                      </button>
                    </td>
                    <td>
                      <span className={`circle ${filteredUser.isVerified ? 'green' : 'red'}`}></span>
                    </td>
                    <td>
                      <span className={`circle ${filteredUser.isSeller ? 'green' : 'red'}`}></span>
                      {filteredUser.isSeller ? (
                        <button className="remove-seller-btn" onClick={() => handleRemoveSeller(filteredUser.userId)}>
                          Remove Seller Role
                        </button>
                      ) : (
                        <button onClick={() => handleApproveSeller(filteredUser.userId)}>
                          Approve
                        </button>
                      )}
                    </td>
                    <td>{filteredUser.isSeller ? filteredUser.activeListings || 0 : '—'}</td>
                    <td>{filteredUser.userId}</td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.userId}>
                      <td>{`${user.first_name} ${user.last_name}`}</td>
                      <td>
                        {formatEmail(user.email, showEmails[user.userId])}
                        <button onClick={() => toggleEmailVisibility(user.userId)}>
                          {showEmails[user.userId] ? 'Hide' : 'Show'}
                        </button>
                      </td>
                      <td>
                        <span className={`circle ${user.isVerified ? 'green' : 'red'}`}></span>
                      </td>
                      <td>
                        <span className={`circle ${user.isSeller ? 'green' : 'red'}`}></span>
                        {user.isSeller ? (
                          <button className="remove-seller-btn" onClick={() => handleRemoveSeller(user.userId)}>
                            Remove Seller Role
                          </button>
                        ) : (
                          <button onClick={() => handleApproveSeller(user.userId)}>
                            Approve
                          </button>
                        )}
                      </td>
                      <td>{user.isSeller ? user.activeListings || 0 : '—'}</td>
                      <td>{user.userId}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pageNextPrevious-buttons">
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              &lt; Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
