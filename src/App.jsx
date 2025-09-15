import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useParams, useNavigate, Outlet } from "react-router-dom";
import PostCard from "./components/PostCard.jsx";
import Container from "./components/Container.jsx";
import SidebarProfile from "./components/SidebarProfile.jsx";
import Write from "./pages/Write.jsx";

function Layout() {
  return (
    <Container>
      <div style={styles.pageLayout} className="pageLayout">
        {/* ✅ 사이드바: 여기서 딱 1번만 렌더 */}
        <SidebarProfile
          username="dmseong"
          name="김성희"
          role="Sookmyung Woman's Univ CS 23"
          lines={["코딩 교육봉사 동아리 CNTO 7기", "알고리즘 학회 ALGOS 14기", "중앙 프로그래밍 동아리 SOLUX 30기"]}
        />
        {/* 여기에 페이지 콘텐츠가 꽂힘 */}
        <div style={styles.pageMain}>
          <Outlet />
        </div>
      </div>
    </Container>
  );
}

export default function App() {
  return (
    <div style={styles.app}>
      <Style />

      <header style={styles.header}>
        <div style={styles.headerRow}>
          <Link to="/" style={styles.logo}>Seonghui Kim's Home</Link>
          <nav style={styles.nav}>
            <Link to="/write" style={styles.navLink}>글쓰기</Link>
            <Link to="/" style={styles.navLink}>홈</Link>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          {/* ✅ Layout 아래에 자식 라우트로 Home/Detail 배치 */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/write" element={<Write />} />
          </Route>
        </Routes>
      </main>

      <footer style={styles.footer}>
        <small>© 2025 My Page Built by React + Vite</small>
      </footer>
    </div>
  );
}


function Home() {
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");


  useEffect(() => {
    // public/posts.json에서 정적 로드
    fetch("/posts.json")
      .then((r) => r.json())
      .then(setPosts)
      .catch((e) => console.error("posts.json 로드 실패", e));
  }, []);


  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = posts; // posts.json에서 가져온 배열
    if (term) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) || // 제목
          p.excerpt.toLowerCase().includes(term) || // 미리보기
          (p.tags || []).some((t) => t.toLowerCase().includes(term)) // 태그
      );
    }
    // 정렬 옵션
    list = [...list].sort((a, b) => {
      if (sort === "new") return new Date(b.date) - new Date(a.date);
      if (sort === "old") return new Date(a.date) - new Date(b.date);
      return 0;
    });
    return list;
  }, [posts, q, sort]);


  return (
    <>
      <section style={styles.controls}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)} // 입력 상태로 검색어 보관
          placeholder="검색: 제목/미리보기/태그"
          style={styles.input}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={styles.select}>
          <option value="new">최신순</option>
          <option value="old">오래된순</option>
        </select>
      </section>

      <section style={styles.grid} className="grid">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

    </>
  );
}


function PostDetail() {
  // 이미지 경로 보정 함수
  const getImageSrc = (src) => src ? src.replace(/^public\//, '/') : '';
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch("/posts.json")
      .then((r) => r.json())
      .then((all) => all.find((p) => String(p.id) === String(id)))
      .then((found) => setPost(found || null))
      .finally(() => setLoading(false));
  }, [id]);


  if (loading) return <p>불러오는 중…</p>;
  if (!post) return (
    <>
      <p>게시글을 찾을 수 없어요.</p>
      <button onClick={() => navigate(-1)} style={styles.btn}>뒤로가기</button>
    </>
  );


  // 카테고리 뱃지 색상 매핑
  const categoryColors = {
    club: "#2563eb",
    hackathon: "#059669",
    project: "#d97706",
    etc: "#6b7280"
  };
  const badgeStyle = (key) => ({
    display: "inline-block",
    marginLeft: 12,
    padding: "2px 12px",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    background: categoryColors[key] || "#6b7280"
  });

  return (
    <article style={styles.detail}>
      <button onClick={() => navigate(-1)} style={styles.backLink}>← 목록으로</button>
      <img src={getImageSrc(post.image)} alt="thumbnail" style={styles.detailThumb} />
      <h1 style={{ margin: "40px 10px 4px", fontSize: 38 }}>
        {post.title}
        {post.category && post.category.key && post.category.label && (
          <span style={badgeStyle(post.category.key)}>{post.category.label}</span>
        )}
      </h1>
      <p style={styles.meta}>{formatDate(post.date)}</p>
      <div style={{ lineHeight: 1.8, marginTop: 12 }} dangerouslySetInnerHTML={{ __html: post.content }} />
      <div style={{ marginTop: 12 }}>
        {(post.tags || []).map((t) => <span key={t} style={styles.tag}>#{t}</span>)}
      </div>
    </article>
  );
}

// -------------------------------
// 공용 유틸/스타일
// -------------------------------
function formatDate(iso) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

const styles = {
  app: { background: "#f8fafc", minHeight: "100vh", color: "#111827" },
  header: {
    position: "sticky",
    top: 0,
    background: "rgba(255,255,255,.8)",
    backdropFilter: "saturate(180%) blur(10px)",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 10,
  },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, padding: "0 32px" },
  logo: { fontWeight: 700, fontSize: 18, color: "#111827", textDecoration: "none" },
  nav: { display: "flex", gap: 16 },
  navLink: { color: "#374151", textDecoration: "none" },
  footer: { marginTop: 48, padding: "20px 0", borderTop: "1px solid #e5e7eb", color: "#6b7280", textAlign: "center" },

  controls: { display: "flex", gap: 8, alignItems: "center", margin: "20px 0" },
  input: { flex: 1, height: 40, padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: 10 },
  select: { height: 40, padding: "0 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" },

  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  detail: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, marginTop: 20, fontSize: 20 },
  detailThumb: { width: "100%", borderRadius: 12, display: "block", margin: "0 auto" },
  meta: { color: "#6b7280", fontSize: 19, marginTop: 11, marginLeft: 10 },
  tag: {
    display: "inline-block",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    color: "#374151",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    marginRight: 6,
  },
  btn: { height: 36, padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" },
  backLink: { background: "transparent", border: "none", color: "#2563eb", cursor: "pointer", marginBottom: 8 },
  pageLayout: { display: "grid", gridTemplateColumns: "360px 1fr", gap: 32, alignItems: "start" },
  pageMain: { minWidth: 0 },
};

function Style() {
  return (
    <style>{`
      @media (max-width: 640px) { .grid { grid-template-columns: 1fr !important; } }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Apple SD Gothic Neo, 'Malgun Gothic', sans-serif; }
      a { color: inherit }
      img { display: block }
      ::selection { background: #dbeafe }
    `}</style>
  );
}