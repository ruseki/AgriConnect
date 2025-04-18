/* WithdrawalPage.js */

import React, { useState, useEffect } from 'react';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import './css/WithdrawalPage.css';

const WithdrawalPage = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]); // For withdrawal history
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState(''); // Dropdown for method
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [commissionFee, setCommissionFee] = useState(0);
  const [totalReceive, setTotalReceive] = useState(0); // Amount after commission
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal visibility

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken'); // Retrieve the token
      try {
        // Fetch seller balance
        const balanceResponse = await fetch('http://localhost:5000/api/withdraw/balance', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Fetch withdrawal history
        const historyResponse = await fetch('http://localhost:5000/api/withdraw-history', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // Log responses for debugging
        console.log('Balance Response:', balanceResponse);
        console.log('History Response:', historyResponse);
  
        // Handle response errors
        if (!balanceResponse.ok) {
          console.error('Error fetching balance:', balanceResponse.status);
          return;
        }
        if (!historyResponse.ok) {
          console.error('Error fetching history:', historyResponse.status);
          setHistory([]); // Fallback to empty history
        }
  
        // Parse responses
        const balanceResult = await balanceResponse.json();
        const historyResult = historyResponse.ok ? await historyResponse.json() : { history: [] };
  
        console.log('Parsed Balance:', balanceResult); // Debug balance
        console.log('Parsed History:', historyResult); // Debug history
  
        // Update state
        setBalance(balanceResult.sellerBalance || 0); // Set balance state
        setHistory(historyResult.history || []); // Set history state
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    setLoading(true);
  
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('http://localhost:5000/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method: withdrawMethod,
          accountNumber,
          accountName,
        }),
      });
  
      if (response.ok) {
        alert('Withdrawal successful!');
        setBalance((prev) => prev - parseFloat(withdrawAmount)); // Deduct locally
        setHistory((prev) => [
          ...prev,
          {
            method: withdrawMethod,
            amount: withdrawAmount,
            date: new Date().toLocaleString(),
          },
        ]); // Update history locally
        setShowModal(false);
        setWithdrawAmount('');
        setWithdrawMethod('');
        setAccountNumber('');
        setAccountName('');
      } else {
        const result = await response.json();
        alert(`Withdrawal failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Calculate commission and total to receive
    const commission = withdrawAmount ? withdrawAmount * 0.01 : 0;
    setCommissionFee(commission.toFixed(2));
    setTotalReceive((withdrawAmount - commission).toFixed(2));
  }, [withdrawAmount]);

  return (
    <>
      <TopNavbar />
      <SideBar />
      <div className="withdraw-page">
        <h1>Withdraw Funds</h1>
        <p>Current Balance: ₱{balance.toFixed(2)}</p>

        <h2>Withdrawal History</h2>
        <ul className="withdraw-history">
          {history.length > 0 ? (
            history.map((entry, index) => (
              <li key={index}>
                <p>
                  <strong>Amount:</strong> ₱{entry.amount.toFixed(2)}
                </p>
                <p>
                  <strong>Method:</strong> {entry.method}
                </p>
                <p>
                  <strong>Date:</strong> {entry.date}
                </p>
              </li>
            ))
          ) : (
            <p>No withdrawal history available.</p>
          )}
        </ul>

        <button onClick={() => setShowModal(true)} className="withdraw-btn">
          Withdraw
        </button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Withdraw Funds</h2>
              <p>Available Balance: ₱{balance.toFixed(2)}</p>

              <div>
                <label>Withdrawal Method:</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="withdraw-method"
                >
                  <option value="" disabled>
                    Select Method
                  </option>
                  <option value="Bank #1">Bank #1</option>
                  <option value="Bank #2">Bank #2</option>
                  <option value="Bank #3">Bank #3</option>
                </select>
              </div>

              <div>
                <label>Account Number:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter Account Number"
                />
              </div>

              <div>
                <label>Account Name:</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter Account Name"
                />
              </div>

              <div>
                <label>Amount to Withdraw:</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter Amount"
                />
              </div>

              <p>Commission (1%): ₱{commissionFee}</p>
              <p>Total to Receive: ₱{totalReceive}</p>

              <div className="modal-buttons">
                <button
                  onClick={handleWithdraw}
                  disabled={
                    loading || !withdrawAmount || !withdrawMethod || !accountNumber || !accountName
                  }
                >
                  {loading ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WithdrawalPage;