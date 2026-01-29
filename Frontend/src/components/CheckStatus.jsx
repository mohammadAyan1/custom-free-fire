import { useState } from "react";
import api from "../api/api";

export default function CheckStatus() {
    const [code, setCode] = useState("");
    const [data, setData] = useState(null);

    const check = async () => {
        const res = await api.get(`/api/squad/by-code/${code}`);
        setData(res.data);
    };

    return (
        <>
            <input onChange={e => setCode(e.target.value)} placeholder="Enter Code" />
            <button onClick={check}>Check</button>

            {data && (
                <div>
                    <h3>Status: {data.squad.status}</h3>
                    <p>Remark: {data.squad.remark}</p>
                </div>
            )}
        </>
    );
}
