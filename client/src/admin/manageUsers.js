import React, { useState, useEffect, useCallback } from 'react';
import SideBar from '../components/side_bar';
import TopNavbar from '../components/top_navbar';
import axios from 'axios';
import './css/manageUsers.css';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const ManageUsers = () => {
  const [searchInput, setSearchInput] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUser, setFilteredUser] = useState(null);
  const [showEmails, setShowEmails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate();

  const handleExpiredSession = useCallback(() => {
    console.log('Auth Token:', localStorage.getItem('authToken'));
    alert('Session expired. Please log in again.');
    navigate('/'); 
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      handleExpiredSession();
      return;
    }

    const verifyAdmin = async () => {
      try {
        const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

        const response = await axios.get(`${API_BASE_URL}/api/admin/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        console.log('Verify Admin Response:', response.data); 
    
        if (!response.data.isAdmin) {
          console.log('User is NOT an admin'); 
          console.log('Auth Token:', localStorage.getItem('authToken'));
          alert('You are not authorized to access this page.');
          navigate('/'); 
        } else {
          console.log('User IS an admin'); 
        }
      } catch (error) {
        console.error('Error verifying admin:', error);
        if (error.response?.status === 403) {

        }
        handleExpiredSession();
      }
    };

    verifyAdmin();
  }, [handleExpiredSession, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        handleExpiredSession();
        return;
      }

      setLoading(true); 

      try {
        const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error.response?.status === 401) {
          handleExpiredSession();
        }
      } finally {
        setLoading(false); 
      }
    };

    fetchUsers();
  }, [handleExpiredSession, navigate]);

  const handleSearch = () => {
    const user = users.find((u) => u.email.toLowerCase() === searchInput.trim().toLowerCase());
    
    if (!user) {
      alert('No user found with that email.');
    }
  
    setFilteredUser(user || null);
  };

  const toggleEmailVisibility = (userId) => {
    setShowEmails((prevState) => ({
      ...prevState,
      [userId]: !prevState[userId], 
    }));
  };

  const formatEmail = (email, isVisible) => {
    return isVisible ? email : email.replace(/(.{3}).+(@.+)/, "$1****$2"); 
  };

  const handleApproveSeller = async (userId) => {
    try {
      const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

      const response = await axios.patch(`${API_BASE_URL}/api/users/approve-seller/${userId}`,
        {
          isSeller: true,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        }
      );

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
      const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

      const response = await axios.patch(`${API_BASE_URL}/api/users/remove-seller/${userId}`,
        {
          isSeller: false,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        }
      );

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
            Back to Dashboard
          </button>
          <h1>Manage Users</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by User Email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          {filteredUser === null && searchInput.trim().length === 20 && (
            <p className="no-user-found">No user found with that email.</p>
          )}

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
                          Make Seller
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
                        <button className="toggle-email-btn" onClick={() => toggleEmailVisibility(user.userId)}>
  {showEmails[user.userId] ? <EyeOff size={20} /> : <Eye size={20} />}
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
                            Make Seller
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

          {loading && <p>Loading...</p>}

          <div className="pagination-controls">
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>{currentPage}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
