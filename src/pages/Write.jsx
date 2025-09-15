// src/pages/Write.jsx
import React, { useMemo, useState } from "react";

const CATEGORIES = [
  { key: "club", label: "동아리" },
  { key: "hackathon", label: "해커톤" },
  { key: "project", label: "프로젝트" },
  { key: "etc", label: "기타" },
];

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const nl2br = (s) =>
  String(s || "")
    .split("\n")
    .map((line) => line.trim())
    .join("<br/>");

export default function Write() {
  // 공통 필드
  const [category, setCategory] = useState("club");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [image, setImage] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [excerpt, setExcerpt] = useState("");

  // 동아리
  const [clubPeriod, setClubPeriod] = useState("");
  const [clubBody, setClubBody] = useState("");
  const [clubReview, setClubReview] = useState("");

  // 해커톤
  const [hackPeriod, setHackPeriod] = useState("");
  const [hackWhy, setHackWhy] = useState("");
  const [hackTopic, setHackTopic] = useState("");
  const [hackImpl, setHackImpl] = useState("");
  const [hackResult, setHackResult] = useState("");

  // 프로젝트(고정 6개)
  const [projPeriod, setProjPeriod] = useState("");
  const [projTopic, setProjTopic] = useState("");
  const [projRole, setProjRole] = useState("");
  const [projImpl, setProjImpl] = useState("");
  const [projHard, setProjHard] = useState("");
  const [projResult, setProjResult] = useState("");

  // 기타 : 자유 섹션
  const [sections, setSections] = useState([{ heading: "", body: "" }]);
  const addSection = () => setSections((prev) => [...prev, { heading: "", body: "" }]);
  const removeSection = (idx) => setSections((prev) => prev.filter((_, i) => i !== idx));
  const updateSection = (idx, key, val) =>
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: val } : s)));

  // 이미지 경로 처리 useMemo (컴포넌트 내부로 이동)
  const imageForJson = useMemo(() => {
    const raw = (image || "").trim();
    if (!raw) return "";
    // http(s)나 data: 같은 원격/인라인 이미지는 그대로 유지
    if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    // 중복 접두사 제거 후 붙이기
    const name = raw
      .replace(/^public\/img\//i, "")
      .replace(/^\/?img\//i, "")
      .replace(/^\/+/, "");
    return `public/img/${name}`;
  }, [image]);

  // content HTML 빌드 (모든 제목을 h2로)
  const contentHTML = useMemo(() => {
    if (category === "club") {
      return [
        `<h2>1. 활동 기간</h2> ${nl2br(clubPeriod)}`,
        `<h2>2. 활동 내용</h2> ${nl2br(clubBody)}`,
        `<h2>3. 활동 후기</h2> ${nl2br(clubReview)}`,
      ].join(" <br/> ");
    }
    if (category === "hackathon") {
      return [
        `<h2>1. 대회 기간</h2> ${nl2br(hackPeriod)}`,
        `<h2>2. 참가 동기</h2> ${nl2br(hackWhy)}`,
        `<h2>3. 프로젝트 주제</h2> ${nl2br(hackTopic)}`,
        `<h2>4. 구현 내용</h2> ${nl2br(hackImpl)}`,
        `<h2>5. 결과 및 소감</h2> ${nl2br(hackResult)}`,
      ].join(" <br/> ");
    }
    if (category === "project") {
      return [
        `<h2>1. 프로젝트 기간</h2> ${nl2br(projPeriod)}`,
        `<h2>2. 주제</h2> ${nl2br(projTopic)}`,
        `<h2>3. 맡은 역할</h2> ${nl2br(projRole)}`,
        `<h2>4. 주요 구현 내용</h2> ${nl2br(projImpl)}`,
        `<h2>5. 어려웠던 점</h2> ${nl2br(projHard)}`,
        `<h2>6. 결과 및 소감</h2> ${nl2br(projResult)}`,
      ].join(" <br/> ");
    }
    // 기타(etc) : 자유 섹션
    return sections
      .map((s, i) => `<h2>${i + 1}. ${s.heading || "소제목"}</h2> ${nl2br(s.body)}`)
      .join(" <br/> ");
  }, [
    category,
    // club
    clubPeriod,
    clubBody,
    clubReview,
    // hackathon
    hackPeriod,
    hackWhy,
    hackTopic,
    hackImpl,
    hackResult,
    // project
    projPeriod,
    projTopic,
    projRole,
    projImpl,
    projHard,
    projResult,
    // etc
    sections,
  ]);

  const jsonOutput = useMemo(() => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const selectedCategory = CATEGORIES.find(c => c.key === category);

    const obj = {
      id: "", // 신규 추가이므로 빈 문자열
      title: title.trim(),
      excerpt: excerpt.trim(),
      date,
      image: imageForJson,
      content: contentHTML,
      tags,
      category: selectedCategory ? { key: selectedCategory.key, label: selectedCategory.label } : { key: category, label: category }
    };
    return JSON.stringify(obj, null, 2);
  }, [title, excerpt, date, image, contentHTML, tagsText, category]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      alert("JSON이 복사되었습니다. posts.json에 붙여 넣으세요!");
    } catch {
      alert("복사 실패. 수동으로 복사해 주세요.");
    }
  };

  return (
    <div style={st.wrap}>
      <h1 style={st.h1}>글쓰기 (JSON 생성)</h1>

      {/* 공통 필드 */}
      <div style={st.row}>
        <label style={st.label}>카테고리</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={st.select}>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div style={st.row}>
        <label style={st.label}>제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예) 캡스톤 디자인 모집 안내"
          style={st.input}
        />
      </div>

      <div style={st.row}>
        <label style={st.label}>날짜</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={st.input} />
      </div>

      <div style={st.row}>
        <label style={st.label}>이미지 파일명</label>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="예) my-photo.jpg (자동으로 public/img/ 접두사 추가, https:// 가능)"
          style={st.input}
        />
      </div>

      <div style={st.row}>
        <label style={st.label}>태그(쉼표로 구분)</label>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="Notice, Project"
          style={st.input}
        />
      </div>

      <div style={st.row}>
        <label style={st.label}>미리보기(excerpt)</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="카드에 보일 짧은 설명"
          rows={3}
          style={st.textarea}
        />
      </div>

      {/* 카테고리별 섹션 */}
      {category === "club" && (
        <fieldset style={st.fieldset}>
          <legend style={st.legend}>동아리</legend>
          <div style={st.row}>
            <label style={st.label}>1. 활동 기간</label>
            <textarea value={clubPeriod} onChange={(e) => setClubPeriod(e.target.value)} rows={2} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>2. 활동 내용</label>
            <textarea value={clubBody} onChange={(e) => setClubBody(e.target.value)} rows={4} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>3. 활동 후기</label>
            <textarea value={clubReview} onChange={(e) => setClubReview(e.target.value)} rows={3} style={st.textarea} />
          </div>
        </fieldset>
      )}

      {category === "hackathon" && (
        <fieldset style={st.fieldset}>
          <legend style={st.legend}>해커톤</legend>
          <div style={st.row}>
            <label style={st.label}>1. 대회 기간</label>
            <textarea value={hackPeriod} onChange={(e) => setHackPeriod(e.target.value)} rows={2} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>2. 참가 동기</label>
            <textarea value={hackWhy} onChange={(e) => setHackWhy(e.target.value)} rows={3} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>3. 프로젝트 주제</label>
            <textarea value={hackTopic} onChange={(e) => setHackTopic(e.target.value)} rows={2} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>4. 구현 내용</label>
            <textarea value={hackImpl} onChange={(e) => setHackImpl(e.target.value)} rows={4} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>5. 결과 및 소감</label>
            <textarea value={hackResult} onChange={(e) => setHackResult(e.target.value)} rows={3} style={st.textarea} />
          </div>
        </fieldset>
      )}

      {category === "project" && (
        <fieldset style={st.fieldset}>
          <legend style={st.legend}>프로젝트</legend>
          <div style={st.row}>
            <label style={st.label}>1. 프로젝트 기간</label>
            <textarea value={projPeriod} onChange={(e) => setProjPeriod(e.target.value)} rows={2} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>2. 주제</label>
            <textarea value={projTopic} onChange={(e) => setProjTopic(e.target.value)} rows={2} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>3. 맡은 역할</label>
            <textarea value={projRole} onChange={(e) => setProjRole(e.target.value)} rows={3} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>4. 주요 구현 내용</label>
            <textarea value={projImpl} onChange={(e) => setProjImpl(e.target.value)} rows={4} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>5. 어려웠던 점</label>
            <textarea value={projHard} onChange={(e) => setProjHard(e.target.value)} rows={3} style={st.textarea} />
          </div>
          <div style={st.row}>
            <label style={st.label}>6. 결과 및 소감</label>
            <textarea value={projResult} onChange={(e) => setProjResult(e.target.value)} rows={3} style={st.textarea} />
          </div>
        </fieldset>
      )}

      {category === "etc" && (
        <fieldset style={st.fieldset}>
          <legend style={st.legend}>기타</legend>
          {sections.map((s, i) => (
            <div key={i} style={st.sectionItem}>
              <div style={st.row}>
                <label style={st.label}>{i + 1}. 소제목</label>
                <input
                  value={s.heading}
                  onChange={(e) => updateSection(i, "heading", e.target.value)}
                  placeholder="예) 기간 / 역할 / 구현 내용 ..."
                  style={st.input}
                />
              </div>
              <div style={st.row}>
                <label style={st.label}>내용</label>
                <textarea
                  value={s.body}
                  onChange={(e) => updateSection(i, "body", e.target.value)}
                  rows={3}
                  style={st.textarea}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => removeSection(i)} style={st.btnGhost}>
                  섹션 삭제
                </button>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "12px 0" }} />
            </div>
          ))}
          <button type="button" onClick={addSection} style={st.btnGhost}>
            + 섹션 추가
          </button>
        </fieldset>
      )}

      {/* 결과 JSON */}
      <div style={st.actions}>
        <button onClick={copyToClipboard} style={st.btnPrimary}>JSON 복사</button>
      </div>

      <div style={st.outputWrap}>
        <div style={st.outputHeader}>생성 결과 (posts.json에 붙여넣기)</div>
        <textarea readOnly value={jsonOutput} rows={18} style={st.output} />
      </div>
    </div>
  );
}


const st = {
  wrap: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 },
  h1: { marginTop: 0, fontSize: 22 },
  row: { display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "start", margin: "10px 0" },
  label: { color: "#374151", paddingTop: 8, fontSize: 14 },
  input: { height: 40, padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: 10 },
  select: { height: 40, padding: "0 10px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fff" },
  textarea: { padding: 12, border: "1px solid #e5e7eb", borderRadius: 10, resize: "vertical" },
  fieldset: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginTop: 12 },
  legend: { padding: "0 6px", color: "#6b7280" },
  sectionItem: { marginBottom: 8 },
  actions: { marginTop: 12, display: "flex", gap: 8 },
  btnPrimary: { height: 40, padding: "0 14px", borderRadius: 10, border: "1px solid #2563eb", background: "#2563eb", color: "#fff", cursor: "pointer" },
  btnGhost: { height: 36, padding: "0 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" },
  outputWrap: { marginTop: 12 },
  outputHeader: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  output: { width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", border: "1px solid #e5e7eb", borderRadius: 10, padding: 12 },
};
