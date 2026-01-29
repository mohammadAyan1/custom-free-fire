import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import image1 from "../../public/WhatsApp Image 2026-01-25 at 11.10.57 PM.jpeg"

const Dashboard = () => {
    const [squadData, setSquadData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentFile, setPaymentFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const squadCode = localStorage.getItem("squadCode");

    useEffect(() => {
        if (!squadCode) {
            navigate("/");
            return;
        }
        fetchSquadData();
    }, [squadCode]);

    const fetchSquadData = async () => {
        try {
            const response = await api.get(`/api/squad/user/${squadCode}`);
            setSquadData(response.data.squad);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch squad data");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentUpload = async (e) => {
        e.preventDefault();
        if (!paymentFile) {
            alert("Please select payment screenshot");
            return;
        }

        const formData = new FormData();
        formData.append("payment", paymentFile);

        setUploading(true);
        try {
            await api.post(`/api/squad/upload-payment/${squadCode}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Payment uploaded successfully! Status will be updated after verification.");
            fetchSquadData();
            setPaymentFile(null);
        } catch (error) {
            alert(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return '#28a745';
            case 'rejected': return '#dc3545';
            case 'pending': return '#ffc107';
            default: return '#6c757d';
        }
    };

    const getPaymentColor = (status) => {
        switch (status) {
            case 'paid': return '#28a745';
            case 'rejected': return '#dc3545';
            case 'pending': return '#ffc107';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0f0f0f, #1b1b1b)",
                color: "white"
            }}>
                Loading...
            </div>
        );
    }

    if (!squadData) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0f0f0f, #1b1b1b)",
                color: "white"
            }}>
                No squad data found
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f0f0f, #1b1b1b)",
            color: "white",
            padding: "20px"
        }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto"
            }}>
                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                    flexWrap: "wrap",
                    gap: "20px"
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "28px" }}>
                            🎮 Squad Dashboard
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "5px" }}>
                            Registration Code: <code style={{
                                background: "rgba(255,255,255,0.1)",
                                padding: "4px 12px",
                                borderRadius: "6px",
                                fontWeight: "bold"
                            }}>{squadData.registration_code}</code>
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("squadCode");
                            navigate("/");
                        }}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "rgba(255,255,255,0.05)",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        Logout
                    </button>
                </div>

                {/* Status Cards */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px"
                }}>
                    <div style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "15px",
                        padding: "20px"
                    }}>
                        <h3 style={{ marginTop: 0, color: "rgba(255,255,255,0.9)" }}>
                            Registration Status
                        </h3>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginTop: "10px"
                        }}>
                            <div style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: getStatusColor(squadData.status)
                            }}></div>
                            <span style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                color: getStatusColor(squadData.status)
                            }}>
                                {squadData.status}
                            </span>
                        </div>
                    </div>

                    <div style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "15px",
                        padding: "20px"
                    }}>
                        <h3 style={{ marginTop: 0, color: "rgba(255,255,255,0.9)" }}>
                            Payment Status
                        </h3>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginTop: "10px"
                        }}>
                            <div style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: getPaymentColor(squadData.payment_status)
                            }}></div>
                            <span style={{
                                fontSize: "18px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                color: getPaymentColor(squadData.payment_status)
                            }}>
                                {squadData.payment_status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Squad Details */}
                <div style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "15px",
                    padding: "25px",
                    marginBottom: "30px"
                }}>
                    <h2 style={{ marginTop: 0 }}>Squad Information</h2>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "15px",
                        marginTop: "15px"
                    }}>
                        <div>
                            <label style={{ color: "rgba(255,255,255,0.7)" }}>Squad Name</label>
                            <p style={{ fontSize: "18px", fontWeight: "bold" }}>{squadData.squad_name}</p>
                        </div>
                        <div>
                            <label style={{ color: "rgba(255,255,255,0.7)" }}>Leader Email</label>
                            <p style={{ fontSize: "18px" }}>{squadData.leader_email}</p>
                        </div>
                        <div>
                            <label style={{ color: "rgba(255,255,255,0.7)" }}>Total Players</label>
                            <p style={{ fontSize: "18px" }}>{squadData.total_players || 4}</p>
                        </div>
                        <div>
                            <label style={{ color: "rgba(255,255,255,0.7)" }}>Registered On</label>
                            <p style={{ fontSize: "18px" }}>
                                {new Date(squadData.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Match Details (if approved) */}
                    {squadData.status === 'approved' && squadData.room_id && (
                        <div style={{
                            marginTop: "25px",
                            padding: "20px",
                            background: "rgba(40, 167, 69, 0.1)",
                            border: "1px solid rgba(40, 167, 69, 0.3)",
                            borderRadius: "10px"
                        }}>
                            <h3 style={{ color: "#28a745", marginTop: 0 }}>🎮 Match Details</h3>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "15px",
                                marginTop: "10px"
                            }}>
                                <div>
                                    <label style={{ color: "rgba(255,255,255,0.7)" }}>Room ID</label>
                                    <p style={{ fontSize: "20px", fontWeight: "bold", color: "#28a745" }}>
                                        {squadData.room_id}
                                    </p>
                                </div>
                                <div>
                                    <label style={{ color: "rgba(255,255,255,0.7)" }}>Room Password</label>
                                    <p style={{ fontSize: "20px", fontWeight: "bold", color: "#28a745" }}>
                                        {squadData.room_password}
                                    </p>
                                </div>
                            </div>
                            <p style={{ marginTop: "15px", color: "rgba(255,255,255,0.8)" }}>
                                <strong>Note:</strong> Please join the room 15 minutes before the scheduled match time.
                            </p>
                        </div>
                    )}

                    {/* Admin Remark */}
                    {squadData.remark && (
                        <div style={{
                            marginTop: "25px",
                            padding: "15px",
                            background: "rgba(255, 193, 7, 0.1)",
                            border: "1px solid rgba(255, 193, 7, 0.3)",
                            borderRadius: "10px"
                        }}>
                            <h4 style={{ color: "#ffc107", marginTop: 0 }}>📝 Admin Remark</h4>
                            <p>{squadData.remark}</p>
                        </div>
                    )}
                </div>

                {/* Payment Section */}
                {squadData.payment_status === 'pending' && (
                    <div style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "15px",
                        padding: "25px",
                        marginBottom: "30px"
                    }}>
                        <h2 style={{ marginTop: 0 }}>💳 Complete Payment</h2>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "30px",
                            marginTop: "20px"
                        }}>
                            {/* QR Code */}
                            <div>
                                <h3>Scan QR to Pay</h3>
                                <div style={{
                                    background: "white",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    display: "inline-block",
                                    marginTop: "10px"
                                }}>
                                    {/* Replace with your actual QR code */}
                                    <div style={{
                                        width: "200px",
                                        height: "200px",
                                        background: "linear-gradient(45deg, #667eea, #764ba2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "black",
                                        fontWeight: "bold",
                                        fontSize: "14px",
                                        borderRadius: "10px"
                                    }}>
                                        <img src={`${image1}`} alt="QR" />
                                    </div>
                                </div>
                                <div style={{ marginTop: "15px" }}>
                                    <p><strong>Amount:</strong> ₹1200</p>
                                    <p><strong>UPI ID:</strong> 7879110142@ybl</p>
                                    <p><strong>Note:</strong> Add your squad name in payment note</p>
                                </div>
                            </div>

                            {/* Upload Section */}
                            <div>
                                <h3>Upload Payment Proof</h3>
                                <form onSubmit={handlePaymentUpload} style={{ marginTop: "20px" }}>
                                    <div style={{ marginBottom: "20px" }}>
                                        <label style={{
                                            display: "block",
                                            marginBottom: "10px",
                                            fontWeight: "500"
                                        }}>
                                            Select Payment Screenshot
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setPaymentFile(e.target.files[0])}
                                            style={{
                                                width: "100%",
                                                padding: "12px",
                                                borderRadius: "8px",
                                                border: "1px solid rgba(255,255,255,0.2)",
                                                background: "rgba(255,255,255,0.07)",
                                                color: "white"
                                            }}
                                        />
                                        {paymentFile && (
                                            <p style={{ marginTop: "10px", color: "#28a745" }}>
                                                ✅ Selected: {paymentFile.name}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading || !paymentFile}
                                        style={{
                                            width: "100%",
                                            padding: "14px",
                                            borderRadius: "10px",
                                            border: "none",
                                            background: uploading ? "#555" : "linear-gradient(135deg, #28a745, #20c997)",
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            cursor: uploading ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {uploading ? "Uploading..." : "Submit Payment Proof"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Players List */}
                <div style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "15px",
                    padding: "25px"
                }}>
                    <h2 style={{ marginTop: 0 }}>👥 Squad Members</h2>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "20px",
                        marginTop: "20px"
                    }}>
                        {squadData.players && squadData.players.map((player, index) => (
                            <div key={index} style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "10px",
                                padding: "20px"
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "15px"
                                }}>
                                    <h3 style={{ margin: 0 }}>{player.name}</h3>
                                    <span style={{
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        background: squadData.leader_index === index
                                            ? "rgba(0, 255, 140, 0.15)"
                                            : "rgba(255,255,255,0.08)",
                                        border: "1px solid rgba(255,255,255,0.1)"
                                    }}>
                                        {squadData.leader_index === index ? "LEADER" : "MEMBER"}
                                    </span>
                                </div>

                                <div style={{ lineHeight: "1.8" }}>
                                    <p><strong>WhatsApp:</strong> {player.whatsapp}</p>
                                    <p><strong>UID:</strong> {player.uid}</p>
                                    <p><strong>Username:</strong> {player.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;