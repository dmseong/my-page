import React from "react";
import { Link } from "react-router-dom";


export default function PostCard({ post }) {
        // 카테고리 뱃지 색상 매핑
        const categoryColors = {
            club: "#2563eb",
            hackathon: "#059669",
            project: "#d97706",
            etc: "#6b7280"
        };
        const badgeStyle = (key) => ({
            display: "inline-block",
            marginLeft: 8,
            padding: "2px 10px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: categoryColors[key] || "#6b7280"
        });

        return (
                <article style={card.card}>
                        <Link to={`/post/${post.id}`} style={card.thumbWrap} aria-label={`${post.title} 상세보기`}>
                            <img src={post.image} alt="thumbnail" style={card.thumb} />
                        </Link>
                        <div style={card.body}>
                                <h3 style={card.title}>
                                     <Link to={`/post/${post.id}`} style={card.titleLink}>{post.title}</Link>
                                     {post.category && post.category.key && post.category.label && (
                                         <span style={badgeStyle(post.category.key)}>{post.category.label}</span>
                                     )}
                                </h3>
                                <p style={card.meta}>{formatDate(post.date)}</p>
                                <p style={card.excerpt}>{post.excerpt}</p>
                        </div>
                </article>
        );
}


function formatDate(iso) {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
}


const card = {
    card: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,.04)",
        display: "flex",
        flexDirection: "column",
    },
    thumbWrap: { display: "block" },
    thumb: { width: "100%", height: 180, objectFit: "cover" },
    body: { padding: 14 },
    title: { margin: 0, fontSize: 18, lineHeight: 1.3 },
    titleLink: { color: "#111827", textDecoration: "none" },
    meta: { color: "#6b7280", fontSize: 13, marginTop: 6 },
    excerpt: { color: "#374151", marginTop: 8 },
};