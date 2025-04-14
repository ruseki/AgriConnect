import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideBar from '../components/side_bar';
import TopNavbar from '../components/top_navbar';
import './css/manageCheckouts.css';

const ManageCheckouts = () => {
    const [checkouts, setCheckouts] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(true);
    const [confirmationModal, setConfirmationModal] = useState({ isVisible: false, checkoutId: null }); // Tracks modal visibility

    useEffect(() => {
        const fetchCheckouts = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Retrieve token
                console.log('Auth Token:', token); // Debugging token

                const response = await axios.get('http://localhost:5000/api/cart', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('API Response:', response.data); // Log full API response
                console.log('Fetched Checkouts:', response.data.checkouts); // Log specifically checkouts

                if (response.status === 200) {
                    setCheckouts(response.data.cartItems || []); // Access `cartItems` in the response
                }
            } catch (error) {
                console.error('Error fetching checkouts:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCheckouts();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.patch(
                `http://localhost:5000/api/cart/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200) {
                setCheckouts((prevCheckouts) =>
                    prevCheckouts.map((checkout) =>
                        checkout._id === id ? { ...checkout, status } : checkout
                    )
                );
            }
            setConfirmationModal({ isVisible: false, checkoutId: null }); // Close modal after approval/rejection
        } catch (error) {
            console.error('Error updating checkout status:', error.message);
        }
    };

    const openConfirmationModal = (checkoutId) => {
        setConfirmationModal({ isVisible: true, checkoutId });
    };

    const closeConfirmationModal = () => {
        setConfirmationModal({ isVisible: false, checkoutId: null });
    };

    // Debug log to verify checkouts data before rendering
    console.log('Checkouts to Render:', checkouts);

    return (
        <div className="mcheckouts-main">
            <TopNavbar />
            <main className="mcheckouts-main-content">
                <SideBar />
                <div className="mcheckouts-admin-content">
                    <h1 className="mcheckouts-title">Manage User Checkouts</h1>

                    {loading ? (
                        <p className="mcheckouts-loading-message">Loading...</p>
                    ) : checkouts.length > 0 ? ( // Check if `checkouts` has data
                        <table className="mcheckouts-table">
                            <thead>
                                <tr>
                                    <th>User Name</th>
                                    <th>Listing ID</th>
                                    <th>Seller Name</th>
                                    <th>Bank</th>
                                    <th>Reference No</th>
                                    <th>Proof</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {checkouts.map((checkout) => (
                                    <tr key={checkout._id} className="mcheckouts-row">
                                        <td>{checkout.userId ? `${checkout.userId.first_name} ${checkout.userId.last_name}` : 'Unknown User'}</td>
                                        <td>{checkout.listingId?.listingId || 'No Listing ID'}</td>
                                        <td>{checkout.listingId?.sellerName || 'No Seller'}</td>
                                        <td>{checkout.bank}</td>
                                        <td>{checkout.referenceNumber}</td>
                                        <td>
                                            <a
                                                href={checkout.proofImage}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mcheckouts-proof-link"
                                            >
                                                View Image
                                            </a>
                                        </td>
                                        <td>{checkout.status}</td>
                                        <td>
                                            {checkout.status === 'Pending' && (
                                                <>
                                                    <button
                                                        className="mcheckouts-button mcheckouts-approve-button"
                                                        onClick={() => openConfirmationModal(checkout._id)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="mcheckouts-button mcheckouts-reject-button"
                                                        onClick={() => handleUpdateStatus(checkout._id, 'Rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="mcheckouts-no-data-message">No checkouts available.</p>
                    )}
                </div>
            </main>

            {/* Confirmation Modal */}
            {confirmationModal.isVisible && (
                <div className="mcheckouts-modal-overlay">
                    <div className="mcheckouts-modal-content">
                        <p>Are you sure you want to approve this payment?</p>
                        <button
                            className="mcheckouts-modal-button"
                            onClick={() => handleUpdateStatus(confirmationModal.checkoutId, 'Approved')}
                        >
                            Yes, Approve
                        </button>
                        <button className="mcheckouts-modal-button" onClick={closeConfirmationModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCheckouts;