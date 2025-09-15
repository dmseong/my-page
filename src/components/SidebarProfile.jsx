import React from "react";

export default function SidebarProfile({
    username = "dmseong",
    name = "김성희",
    role = "Sookmyung Woman's Univ CS",
    lines = [
        ""
    ],
}) {
    const avatar = `https://github.com/${username}.png`;
    const gh = `https://github.com/${username}`;
    return (
        <aside style={s.wrap}>
            <img src={avatar} alt={`${name} GitHub avatar`} style={s.avatar} />
            <h2 style={s.name}>{name}</h2>
            <p style={s.role}>{role}</p>
            <ul style={s.list}>
                {lines.map((t, i) => (
                    <li key={i} style={s.li}>• {t}</li>
                ))}
            </ul>
            <div style={s.links}>
                <a href={gh} target="_blank" rel="noreferrer" style={s.link}>
                    GitHub 프로필 →
                </a>
            </div>
        </aside>
    );
}


const s = {
    wrap: {
        position: "sticky",
        top: 88,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,.04)",
    },
    avatar: { width: 96, height: 96, borderRadius: "50%", objectFit: "cover" },
    name: { margin: "12px 0 4px", fontSize: 20 },
    role: { margin: 0, color: "#6b7280", fontSize: 14 },
    list: { margin: 12, marginLeft: 2, listStyleType: "none" },
    li: { color: "#374151", lineHeight: 1.6 },
    links: { marginTop: 8 },
    link: { color: "#2563eb", textDecoration: "none", fontWeight: 600 },
};