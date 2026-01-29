import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Login = () => {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim()) {
            setError("Please enter registration code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get(`/api/squad/user/${code}`);
            if (response.data.success) {
                // Store code in localStorage or context
                localStorage.setItem("squadCode", code);
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid registration code");
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
            background: "linear-gradient(135deg, #0f0f0f, #1b1b1b)",
            padding: "20px"
        }}>
            <div style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "20px",
                padding: "40px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}>
                <h1 style={{
                    color: "white",
                    textAlign: "center",
                    marginBottom: "10px"
                }}>
                    🔐 Squad Login
                </h1>

                <p style={{
                    color: "rgba(255,255,255,0.7)",
                    textAlign: "center",
                    marginBottom: "30px"
                }}>
                    Enter your registration code to access squad details
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            color: "white",
                            marginBottom: "8px",
                            fontWeight: "500"
                        }}>
                            Registration Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Enter your registration code"
                            style={{
                                width: "100%",
                                padding: "14px",
                                borderRadius: "12px",
                                border: error ? "1px solid #ff4444" : "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.07)",
                                color: "white",
                                fontSize: "16px",
                                outline: "none",
                                transition: "border 0.3s"
                            }}
                        />
                        {error && (
                            <p style={{
                                color: "#ff4444",
                                fontSize: "14px",
                                marginTop: "8px"
                            }}>
                                ⚠️ {error}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "none",
                            background: loading ? "#555" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "opacity 0.3s"
                        }}
                    >
                        {loading ? "Checking..." : "Access Squad Dashboard →"}
                    </button>
                </form>

                <div style={{
                    marginTop: "30px",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <p style={{
                        color: "rgba(255,255,255,0.6)",
                        textAlign: "center",
                        fontSize: "14px"
                    }}>
                        Don't have a code?{" "}
                        <a
                            href="/register"
                            style={{
                                color: "#667eea",
                                textDecoration: "none",
                                fontWeight: "500"
                            }}
                        >
                            Register your squad
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;