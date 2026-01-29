import React, { useMemo, useState } from "react";
import api from "../api/api";

const emptyPlayer = () => ({
    name: "",
    whatsapp: "",
    uid: "",
    username: "",
    screenshot: null,
    preview: "",
});

const Home = () => {
    const [loading, setLoading] = useState(false);

    const [squadData, setSquadData] = useState({
        squadName: "",
        leaderIndex: 0,
        leaderEmail: "",
        leaderWhatsapp: "",
        players: [emptyPlayer(), emptyPlayer(), emptyPlayer(), emptyPlayer()],
    });

    const leaderName = useMemo(() => {
        const leader = squadData.players[squadData.leaderIndex];
        return leader?.name || `Player ${squadData.leaderIndex + 1}`;
    }, [squadData.leaderIndex, squadData.players]);

    const handleSquadChange = (e) => {
        setSquadData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePlayerChange = (index, field, value) => {
        setSquadData((prev) => {
            const updated = [...prev.players];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, players: updated };
        });
    };

    const handleScreenshotChange = (index, file) => {
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        setSquadData((prev) => {
            const updated = [...prev.players];
            updated[index] = { ...updated[index], screenshot: file, preview: previewUrl };
            return { ...prev, players: updated };
        });
    };

    const validateWhatsApp = (num) => {
        const cleaned = num.toString().replace(/\D/g, '');
        return /^[0-9]{10}$/.test(cleaned);
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();

        // ✅ basic validations
        if (!squadData.squadName.trim()) {
            return alert("Squad Name is required ❌");
        }

        // Validate leader contact
        if (!squadData.leaderEmail || !squadData.leaderEmail.includes('@')) {
            return alert("Valid leader email is required ❌");
        }

        if (!squadData.leaderWhatsapp || !validateWhatsApp(squadData.leaderWhatsapp)) {
            return alert("Leader WhatsApp number must be 10 digits ❌");
        }

        for (let i = 0; i < squadData.players.length; i++) {
            const p = squadData.players[i];

            if (!p.name || !p.whatsapp || !p.uid || !p.username) {
                return alert(`Please fill all fields for Player ${i + 1} ❌`);
            }

            if (!validateWhatsApp(p.whatsapp)) {
                return alert(`Player ${i + 1}: WhatsApp number must be 10 digits ❌`);
            }

            if (!p.screenshot) {
                return alert(`Player ${i + 1}: Screenshot is required ❌`);
            }
        }

        try {
            setLoading(true);

            const form = new FormData();
            form.append("squadName", squadData.squadName);
            form.append("leaderIndex", squadData.leaderIndex);
            form.append("leaderEmail", squadData.leaderEmail);
            form.append("leaderWhatsapp", squadData.leaderWhatsapp);

            // Players (without screenshot)
            form.append(
                "players",
                JSON.stringify(
                    squadData.players.map((p) => ({
                        name: p.name,
                        whatsapp: p.whatsapp,
                        uid: p.uid,
                        username: p.username,
                    }))
                )
            );

            // upload screenshots in same order
            squadData.players.forEach((player) => {
                form.append("screenshots", player.screenshot);
            });

            const res = await api.post("/api/squad/squad-register", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert(res.data.message || "Squad Registered ✅");

            // Show registration code to user
            if (res.data.registrationCode) {
                alert(`✅ Registration Successful!\n\nYour Registration Code: ${res.data.registrationCode}\n\n📝 Save this code to:\n1. Check your status\n2. Upload payment screenshot\n3. Access dashboard\n\nAn email has been sent to ${squadData.leaderEmail} with details.`);
            }

            // ✅ reset form
            setSquadData({
                squadName: "",
                leaderIndex: 0,
                leaderEmail: "",
                leaderWhatsapp: "",
                players: [emptyPlayer(), emptyPlayer(), emptyPlayer(), emptyPlayer()],
            });
        } catch (error) {
            console.error(error);
            alert(error?.response?.data?.message || "Something went wrong ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "20px",
                background: "linear-gradient(135deg, #0f0f0f, #1b1b1b)",
                color: "white",
            }}
        >
            <div
                style={{
                    maxWidth: "980px",
                    margin: "auto",
                }}
            >
                <div
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: "18px",
                        borderRadius: "16px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                    }}
                >
                    <h1 style={{ margin: 0, fontSize: "26px" }}>
                        🔥 Free Fire Custom Squad Registration
                    </h1>
                    <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.75)" }}>
                        Fill details carefully. Wrong UID/Number may disqualify your squad.
                    </p>


                    <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.75)" }}>
                        Match Date is 5 6 7 8 feb 2026
                    </p>


                    <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.75)" }}>
                        Time will be Mention you when you completed you registeration via Email
                    </p>



                    {/* Rules + Prize */}
                    <div
                        style={{
                            marginTop: "16px",
                            display: "grid",
                            gap: "14px",
                            gridTemplateColumns: "1fr 1fr",
                        }}
                    >
                        <div
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                borderRadius: "14px",
                                padding: "14px",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>✅ Rules</h3>
                            <ol style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                                <li>All squads must play honestly.</li>
                                <li>No hacker allowed.</li>
                                <li>If hacker found, match will restart.</li>
                                <li>If hacker in squad → squad disqualified (no prize).</li>
                                <li>Rules are strict for fair gameplay.</li>
                                <li>Each person Fee 300.</li>
                            </ol>
                        </div>

                        <div
                            style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                borderRadius: "14px",
                                padding: "14px",
                            }}
                        >
                            <h3 style={{ marginTop: 0 }}>🏆 Winning Prize</h3>
                            <div style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>
                                <div>🥇 1st Prize: <b>₹5000</b></div>
                                <div>🥈 2nd Prize: <b>₹3000</b></div>
                                <div>🥉 3rd Prize: <b>₹2000</b></div>
                                <div>🎯 Per Kill (per person): <b>₹10</b></div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitForm} style={{ marginTop: "18px" }}>
                        {/* Squad Name */}
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ fontWeight: 600 }}>Squad Name *</label>
                            <input
                                type="text"
                                name="squadName"
                                value={squadData.squadName}
                                onChange={handleSquadChange}
                                placeholder="Enter squad name"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {/* Leader Contact Details */}
                        <div style={{
                            marginBottom: "20px",
                            padding: "20px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.03)"
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>📞 Leader Contact Details *</h3>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <div>
                                    <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                                        Leader Email
                                    </label>
                                    <input
                                        type="email"
                                        value={squadData.leaderEmail}
                                        onChange={(e) => setSquadData(prev => ({ ...prev, leaderEmail: e.target.value }))}
                                        placeholder="leader@example.com"
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                                        Leader WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={squadData.leaderWhatsapp}
                                        onChange={(e) => setSquadData(prev => ({ ...prev, leaderWhatsapp: e.target.value }))}
                                        placeholder="10 digit WhatsApp number"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <p style={{ marginTop: "10px", color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
                                Important: All tournament updates and match details will be sent to this email and WhatsApp number.
                            </p>
                        </div>

                        {/* Leader select */}
                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ fontWeight: 600 }}>Select Leader *</label>
                            <select
                                value={squadData.leaderIndex}
                                onChange={(e) =>
                                    setSquadData((prev) => ({
                                        ...prev,
                                        leaderIndex: Number(e.target.value),
                                    }))
                                }
                                style={selectStyle}
                            >
                                <option value={0}>Player 1</option>
                                <option value={1}>Player 2</option>
                                <option value={2}>Player 3</option>
                                <option value={3}>Player 4</option>
                            </select>

                            <p style={{ marginTop: "8px", color: "rgba(255,255,255,0.7)" }}>
                                Current Leader: <b>{leaderName}</b>
                            </p>
                        </div>

                        <h2 style={{ marginBottom: "10px" }}>👥 Players (4 Members) *</h2>

                        <div style={{ display: "grid", gap: "12px" }}>
                            {squadData.players.map((player, index) => (
                                <div
                                    key={index}
                                    style={{
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        padding: "16px",
                                        borderRadius: "16px",
                                        background: "rgba(255,255,255,0.05)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        <h3 style={{ margin: 0 }}>Player {index + 1}</h3>
                                        <span
                                            style={{
                                                padding: "6px 10px",
                                                borderRadius: "999px",
                                                fontSize: "12px",
                                                border: "1px solid rgba(255,255,255,0.15)",
                                                background:
                                                    squadData.leaderIndex === index
                                                        ? "rgba(0, 255, 140, 0.15)"
                                                        : "rgba(255,255,255,0.06)",
                                            }}
                                        >
                                            {squadData.leaderIndex === index ? "LEADER ✅" : "MEMBER"}
                                        </span>
                                    </div>

                                    <div style={{ display: "grid", gap: "10px" }}>
                                        <input
                                            type="text"
                                            placeholder="Name *"
                                            value={player.name}
                                            onChange={(e) => handlePlayerChange(index, "name", e.target.value)}
                                            required
                                            style={inputStyle}
                                        />

                                        <input
                                            type="text"
                                            placeholder="WhatsApp Number (10 digits) *"
                                            value={player.whatsapp}
                                            onChange={(e) =>
                                                handlePlayerChange(index, "whatsapp", e.target.value)
                                            }
                                            required
                                            style={inputStyle}
                                        />

                                        <input
                                            type="text"
                                            placeholder="Free Fire UID / ID *"
                                            value={player.uid}
                                            onChange={(e) => handlePlayerChange(index, "uid", e.target.value)}
                                            required
                                            style={inputStyle}
                                        />

                                        <input
                                            type="text"
                                            placeholder="Free Fire Username *"
                                            value={player.username}
                                            onChange={(e) =>
                                                handlePlayerChange(index, "username", e.target.value)
                                            }
                                            required
                                            style={inputStyle}
                                        />
                                    </div>

                                    <div style={{ marginTop: "10px" }}>
                                        <label style={{ fontWeight: 600, fontSize: "14px" }}>
                                            Upload Screenshot Proof *
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required
                                            onChange={(e) => handleScreenshotChange(index, e.target.files?.[0])}
                                            style={{
                                                display: "block",
                                                marginTop: "8px",
                                                color: "white",
                                                padding: "8px",
                                                borderRadius: "8px",
                                                border: "1px solid rgba(255,255,255,0.15)",
                                                background: "rgba(255,255,255,0.06)",
                                                width: "100%"
                                            }}
                                        />

                                        {player.preview && (
                                            <img
                                                src={player.preview}
                                                alt="preview"
                                                style={{
                                                    marginTop: "10px",
                                                    width: "100%",
                                                    maxWidth: "220px",
                                                    borderRadius: "12px",
                                                    border: "1px solid rgba(255,255,255,0.12)",
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "20px", padding: "15px", background: "rgba(255, 193, 7, 0.1)", borderRadius: "10px" }}>
                            <p style={{ margin: 0, color: "rgba(255,255,255,0.9)" }}>
                                <strong>Note:</strong> After registration, you'll receive a unique code. Use it to upload payment screenshot and check status.
                            </p>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            style={{
                                marginTop: "16px",
                                width: "100%",
                                padding: "13px",
                                borderRadius: "14px",
                                background: loading ? "#444" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                border: "none",
                                fontWeight: 700,
                                fontSize: "16px",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "opacity 0.3s"
                            }}
                        >
                            {loading ? "Registering..." : "Register Squad ✅"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    outline: "none",
    color: "white",
    fontSize: "16px"
};

const selectStyle = {
    width: "100%",
    marginTop: "8px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    outline: "none",
    color: "white",
    fontSize: "16px"
};

export default Home;