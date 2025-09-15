import React from "react";
export default function Container({ children }) {
    return <div className="container" style={{ maxWidth: 1700, margin: "0 auto", padding: "0 16px" }}>{children}</div>;
}