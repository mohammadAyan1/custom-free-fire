

import React, { useState, useEffect } from "react";
import api from "../api/api.js";

const AdminDashboard = () => {
    const [squads, setSquads] = useState(null);
    const [selectedSquad, setSelectedSquad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateData, setUpdateData] = useState({
        status: 'pending',
        remark: '',
        roomId: '',
        roomPassword: ''
    });
    const [viewDetails, setViewDetails] = useState(null);

    useEffect(() => {
        fetchSquads();
    }, []);

    const fetchSquads = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await api.get("/api/admin/squads", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSquads(response.data?.data);
        } catch (error) {
            console.error("Fetch squads error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (squadId) => {
        try {
            const token = localStorage.getItem("adminToken");
            // FIXED: Correct endpoint
            await api.put(`/api/admin/squad/${squadId}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Status updated successfully!");
            fetchSquads();
            setSelectedSquad(null);
        } catch (error) {
            console.error("Update error:", error);
            alert("❌ Update failed: " + (error.response?.data?.message || error.message));
        }
    };

    const sendEmail = async (squadId, emailType = 'custom') => {
        try {
            const token = localStorage.getItem("adminToken");
            // FIXED: Correct endpoint with emailType in body
            await api.post(`/api/admin/squad/${squadId}/send-email`,
                { emailType: emailType }, // Add email type to body
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            alert("✅ Email sent successfully!");
        } catch (error) {
            console.error("Send email error:", error);
            alert("❌ Failed to send email: " + (error.response?.data?.message || error.message));
        }
    };

    const viewSquadDetails = async (squadId) => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await api.get(`/api/admin/squad/${squadId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setViewDetails(response.data.data);
        } catch (error) {
            console.error("View details error:", error);
            alert("❌ Failed to fetch details: " + (error.response?.data?.message || error.message));
        }
    };

    const closeModal = () => {
        setSelectedSquad(null);
        setViewDetails(null);
    };

    if (loading) return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontSize: "24px"
        }}>
            Loading Admin Dashboard...
        </div>
    );

    return (
        <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
            <div style={{
                background: "white",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                marginBottom: "20px"
            }}>
                <h1 style={{ margin: 0, color: "#333" }}>
                    🎮 Admin Dashboard
                </h1>
                <p style={{ color: "#666", marginTop: "5px" }}>
                    Total Squads: <strong>{squads?.length || 0}</strong>
                </p>
            </div>

            {/* Squads List */}
            <div style={{ display: "grid", gap: "20px", marginTop: "10px" }}>
                {squads?.map(squad => (
                    <div key={squad.id} style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, color: "#333" }}>{squad.squad_name}</h3>
                                <div style={{ marginTop: "10px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
                                    <div>
                                        <p style={{ margin: "5px 0", color: "#666" }}>
                                            <strong>Code:</strong> <code style={{ background: "#f0f0f0", padding: "2px 8px", borderRadius: "4px" }}>{squad.registration_code}</code>
                                        </p>
                                        <p style={{ margin: "5px 0", color: "#666" }}>
                                            <strong>Leader:</strong> {squad.leader_email}
                                        </p>
                                        {squad.leader_name && (
                                            <p style={{ margin: "5px 0", color: "#666" }}>
                                                <strong>Leader Name:</strong> {squad.leader_name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ margin: "5px 0", color: "#666" }}>
                                            <strong>Players:</strong> {squad.total_players || 4}
                                        </p>
                                        <p style={{ margin: "5px 0", color: "#666" }}>
                                            <strong>Registered:</strong> {new Date(squad.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    background:
                                        squad.status === 'approved' ? '#d4edda' :
                                            squad.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                                    color:
                                        squad.status === 'approved' ? '#155724' :
                                            squad.status === 'rejected' ? '#721c24' : '#856404',
                                    display: "inline-block",
                                    marginBottom: "8px"
                                }}>
                                    {squad.status.toUpperCase()}
                                </div>
                                <div style={{
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    background:
                                        squad.payment_status === 'paid' ? '#d4edda' :
                                            squad.payment_status === 'rejected' ? '#f8d7da' : '#fff3cd',
                                    color:
                                        squad.payment_status === 'paid' ? '#155724' :
                                            squad.payment_status === 'rejected' ? '#721c24' : '#856404',
                                    display: "inline-block"
                                }}>
                                    PAYMENT: {squad.payment_status.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ marginTop: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <button
                                onClick={() => setSelectedSquad(squad)}
                                style={{
                                    padding: "8px 16px",
                                    background: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Update Status
                            </button>
                            <button
                                onClick={() => sendEmail(squad.id, 'approval')}
                                style={{
                                    padding: "8px 16px",
                                    background: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Send Approval Email
                            </button>
                            <button
                                onClick={() => sendEmail(squad.id, 'payment_received')}
                                style={{
                                    padding: "8px 16px",
                                    background: "#17a2b8",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                Send Payment Email
                            </button>
                            <button
                                onClick={() => viewSquadDetails(squad.id)}
                                style={{
                                    padding: "8px 16px",
                                    background: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Update Status Modal */}
            {selectedSquad && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "10px",
                        width: "500px",
                        maxWidth: "90%",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}>
                        <h2 style={{ marginTop: 0 }}>Update Status: {selectedSquad.squad_name}</h2>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                Status:
                            </label>
                            <select
                                value={updateData.status}
                                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ddd"
                                }}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                Room ID:
                            </label>
                            <input
                                type="text"
                                value={updateData.roomId}
                                onChange={(e) => setUpdateData({ ...updateData, roomId: e.target.value })}
                                placeholder="Enter room ID"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ddd"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                Room Password:
                            </label>
                            <input
                                type="text"
                                value={updateData.roomPassword}
                                onChange={(e) => setUpdateData({ ...updateData, roomPassword: e.target.value })}
                                placeholder="Enter room password"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ddd"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                                Remark:
                            </label>
                            <textarea
                                value={updateData.remark}
                                onChange={(e) => setUpdateData({ ...updateData, remark: e.target.value })}
                                placeholder="Enter remark (optional)"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ddd",
                                    minHeight: "100px",
                                    resize: "vertical"
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => handleUpdateStatus(selectedSquad.id)}
                                style={{
                                    padding: "10px 20px",
                                    background: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                Update
                            </button>
                            <button
                                onClick={closeModal}
                                style={{
                                    padding: "10px 20px",
                                    background: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {viewDetails && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "10px",
                        width: "800px",
                        maxWidth: "90%",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0 }}>Squad Details: {viewDetails.squad_name}</h2>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "#666"
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Squad Info */}
                        <div style={{
                            background: "#f8f9fa",
                            padding: "20px",
                            borderRadius: "8px",
                            marginBottom: "20px"
                        }}>
                            <h3 style={{ marginTop: 0 }}>📋 Squad Information</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                                <div>
                                    <p><strong>Registration Code:</strong></p>
                                    <code style={{
                                        background: "#333",
                                        color: "white",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        fontSize: "16px"
                                    }}>
                                        {viewDetails.registration_code}
                                    </code>
                                </div>
                                <div>
                                    <p><strong>Status:</strong></p>
                                    <span style={{
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        background: viewDetails.status === 'approved' ? '#d4edda' :
                                            viewDetails.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                                        color: viewDetails.status === 'approved' ? '#155724' :
                                            viewDetails.status === 'rejected' ? '#721c24' : '#856404'
                                    }}>
                                        {viewDetails.status}
                                    </span>
                                </div>
                                <div>
                                    <p><strong>Payment Status:</strong></p>
                                    <span style={{
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        background: viewDetails.payment_status === 'paid' ? '#d4edda' :
                                            viewDetails.payment_status === 'rejected' ? '#f8d7da' : '#fff3cd',
                                        color: viewDetails.payment_status === 'paid' ? '#155724' :
                                            viewDetails.payment_status === 'rejected' ? '#721c24' : '#856404'
                                    }}>
                                        {viewDetails.payment_status}
                                    </span>
                                </div>

                            </div>

                            <div style={{ marginTop: "15px" }}>
                                <p><strong>Leader Email:</strong> {viewDetails.leader_email}</p>
                                <p><strong>Leader WhatsApp:</strong> {viewDetails.leader_whatsapp}</p>
                                {viewDetails.room_id && <p><strong>Room ID:</strong> {viewDetails.room_id}</p>}
                                {viewDetails.room_password && <p><strong>Room Password:</strong> {viewDetails.room_password}</p>}
                                {viewDetails.remark && <p><strong>Remark:</strong> {viewDetails.remark}</p>}
                            </div>


                            <div>
                                <p className="text-2xl font-bold">Payment Image</p>
                                <img src={`${import.meta.env.VITE_BACKEND_URL}${viewDetails?.payment_screenshot}`} alt="" />
                            </div>
                        </div>

                        {/* Players List */}
                        <div style={{ marginBottom: "20px" }}>
                            <h3>👥 Squad Players ({viewDetails.players?.length || 0})</h3>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "15px",
                                marginTop: "15px"
                            }}>
                                {viewDetails.players?.map((player, index) => (
                                    <div key={index} style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "15px",
                                        background: "white"
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "10px"
                                        }}>
                                            <h4 style={{ margin: 0 }}>{player.name}</h4>
                                            <span style={{
                                                padding: "3px 8px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                background: viewDetails.leader_index === index ?
                                                    'rgba(40, 167, 69, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                                                color: viewDetails.leader_index === index ?
                                                    '#155724' : '#6c757d',
                                                border: "1px solid rgba(0,0,0,0.1)"
                                            }}>
                                                {viewDetails.leader_index === index ? "LEADER" : "MEMBER"}
                                            </span>
                                        </div>
                                        <div style={{ lineHeight: "1.6" }}>
                                            <p><strong>WhatsApp:</strong> {player.whatsapp}</p>
                                            <p><strong>UID:</strong> {player.uid}</p>
                                            <p><strong>Username:</strong> {player.username}</p>
                                            <p><strong>Image:</strong> {player.username}</p>

                                            <div>

                                                <img src={`${import.meta.env.VITE_BACKEND_URL}${player?.screenshot}`} alt="" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ textAlign: "center" }}>
                            <button
                                onClick={closeModal}
                                style={{
                                    padding: "10px 30px",
                                    background: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer"
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;