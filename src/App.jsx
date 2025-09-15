import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import PostCard from "./components/PostCard.jsx";
import Container from "./components/Container.jsx";
import SidebarProfile from "./components/SidebarProfile.jsx";
import Write from "./pages/Write.jsx";

function Layout() {
  // 상세보기(PostDetail)에서는 사이드바 숨김 (모바일/데스크탑 모두)
  const location = useLocation();
  const isDetail = /^\/post\//.test(location.pathname);
  const isWrite = location.pathname === "/write" || location.pathname === "/my-page/write";
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const isMobile = windowWidth <= 640;
  const isPad = windowWidth <= 900;
  React.useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  // 상세보기: 데스크탑에서만 프로필, 글쓰기: 패드 이하에서는 프로필 숨김
  const showSidebar = (
    (!isDetail && !isWrite) ||
    (isDetail && !isMobile) ||
    (isWrite && !isPad)
  );
  return (
    <Container>
      <div style={styles.pageLayout} className="pageLayout">
        {showSidebar && (
          <div
            className={isMobile ? "sidebar-mobile" : undefined}
            style={{ marginTop: 20, ...(isMobile ? { width: "100%", maxWidth: "100%" } : {}) }}
          >
            <SidebarProfile
              username="dmseong"
              name="김성희"
              role="Sookmyung Woman's Univ CS 23"
              lines={["코딩 교육봉사 동아리 CNTO 7기", "알고리즘 학회 ALGOS 14기", "중앙 프로그래밍 동아리 SOLUX 30기"]}
            />
          </div>
        )}
        <div style={styles.pageMain} className="pageMain">
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
          <Link to="/my-page/" style={styles.logo}>Seonghui Kim's Home</Link>
          <nav style={styles.nav}>
            <Link to="/write" style={styles.navLink}>글쓰기</Link>
            <Link to="/my-page/" style={styles.navLink}>홈</Link>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          {/* ✅ Layout 아래에 자식 라우트로 Home/Detail 배치 */}
          <Route element={<Layout />}>
            <Route path="/my-page/" element={<Home />} />
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
    // /my-page/posts.json에서 정적 로드
    fetch("/my-page/posts.json")
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
  // 이미지 경로를 BASE_URL + img/로 보정 (gh-pages 대응)
  const getImageSrc = (src) => src ? (import.meta.env.BASE_URL + src.replace(/^\/?img\//, "img/")) : '';
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch("/my-page/posts.json")
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
    <article style={styles.detail} className="detail">
      <button onClick={() => navigate(-1)} style={styles.backLink}>← 목록으로</button>
      <img src={getImageSrc(post.image)} alt="thumbnail" style={styles.detailThumb} />
      <h1 className="detail-title" style={{ margin: "40px 10px 4px", fontSize: 38 }}>
        {post.title}
        {post.category && post.category.key && post.category.label && (
          <span style={badgeStyle(post.category.key)}>{post.category.label}</span>
        )}
      </h1>
      <p className="detail-meta" style={styles.meta}>{formatDate(post.date)}</p>
      <div className="detail-content" style={{ lineHeight: 1.8, marginTop: 12 }} dangerouslySetInnerHTML={{ __html: post.content }} />
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
  pageMain: { minWidth: 0, display: "flex", flexDirection: "column" },
};

function Style() {
  return (
    <style>{`
      /* 상세보기 내용이 남은 공간을 모두 채우도록 */
      .pageMain .detail {
        width: 100%;
        flex-grow: 1;
      }
      /* 상세보기 영역 중앙 정렬 및 반응형 크기 */
      .detail {
        width: 100%;
        max-width: none;
        margin-left: 0;
        margin-right: 0;
      }
      @media (max-width: 900px) {
        .detail {
          max-width: 100% !important;
          width: 100% !important;
        }
        .write-wrap {
          width: 100% !important;
          max-width: 100% !important;
        }
        .pageLayout {
          display: flex !important;
          flex-direction: column !important;
          gap: 0 !important;
        }
        .sidebar-mobile {
          margin-bottom: 24px !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .sidebar-mobile > aside {
          width: 100% !important;
          max-width: 100% !important;
          border-radius: 0 !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        .pageMain {
          min-width: 0;
        }
      }
      @media (max-width: 1200px) {
        .grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 640px) {
        /* 카드 상세보기 폰트 크기 조정 */
        .detail-content {
          font-size: 16px !important;
        }
        .detail-title {
          font-size: 26px !important;
          margin-top: 24px !important;
        }
        .detail-meta {
          font-size: 14px !important;
          margin-top: 8px !important;
        }
      }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Apple SD Gothic Neo, 'Malgun Gothic', sans-serif; }
      a { color: inherit }
      img { display: block }
      ::selection { background: #dbeafe }
    `}</style>
  );
}