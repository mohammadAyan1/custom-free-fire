import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
        adminCode: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();


        console.log(credentials?.adminCode);
        console.log(import.meta.env.REACT_APP_ADMIN_CODE);


        if (credentials.adminCode != import.meta.env.VITE_APP_ADMIN_CODE) {
            setError("Invalid admin code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/api/auth/admin/login", {
                username: credentials.username,
                password: credentials.password
            });

            localStorage.setItem("adminToken", response.data.token);
            localStorage.setItem("admin", JSON.stringify(response.data.admin));
            navigate("/admin/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1a2e, #16213e)",
            padding: "20px"
        }}>
            <div style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                padding: "40px",
                width: "100%",
                maxWidth: "400px",
                backdropFilter: "blur(10px)"
            }}>
                <h1 style={{
                    color: "white",
                    textAlign: "center",
                    marginBottom: "30px"
                }}>
                    🔐 Admin Portal
                </h1>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            color: "white",
                            marginBottom: "8px",
                            fontWeight: "500"
                        }}>
                            Admin Code
                        </label>
                        <input
                            type="password"
                            value={credentials.adminCode}
                            onChange={(e) => setCredentials(prev => ({ ...prev, adminCode: e.target.value }))}
                            placeholder="Enter admin code"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            color: "white",
                            marginBottom: "8px",
                            fontWeight: "500"
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={credentials.username}
                            onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="Admin username"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            color: "white",
                            marginBottom: "8px",
                            fontWeight: "500"
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Admin password"
                            style={inputStyle}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: "rgba(255, 68, 68, 0.1)",
                            border: "1px solid rgba(255, 68, 68, 0.3)",
                            color: "#ff4444",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "20px",
                            textAlign: "center"
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "10px",
                            border: "none",
                            background: loading ? "#555" : "linear-gradient(135deg, #ff416c, #ff4b2b)",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "opacity 0.3s"
                        }}
                    >
                        {loading ? "Authenticating..." : "Login as Admin"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.07)",
    color: "white",
    fontSize: "16px",
    outline: "none"
};

export default AdminLogin;