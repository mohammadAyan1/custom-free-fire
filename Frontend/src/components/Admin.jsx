import { useState } from "react";
import api from "../api/api";

export default function Admin() {
    const [key, setKey] = useState("");
    const [data, setData] = useState([]);

    const load = async () => {
        const res = await api.get("/api/squad/admin/all", {
            headers: { "x-admin-key": key },
        });
        setData(res.data);
    };

    const update = async (id, status) => {
        await api.put(
            `/api/squad/admin/status/${id}`,
            { status, remark: status === "rejected" ? "Payment not verified" : "" },
            { headers: { "x-admin-key": key } }
        );
        load();
    };

    return (
        <>
            <input placeholder="Admin Key" onChange={e => setKey(e.target.value)} />
            <button onClick={load}>Load</button>

            {data.map(s => (
                <div key={s.id}>
                    <h3>{s.squad_name}</h3>
                    <p>{s.status}</p>
                    <button onClick={() => update(s.id, "approved")}>Approve</button>
                    <button onClick={() => update(s.id, "rejected")}>Reject</button>
                </div>
            ))}
        </>
    );
}
