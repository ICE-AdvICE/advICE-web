import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/codingzone/Codingzone_setting.css";
import "../css/codingzone/codingzone-main.css";
import CodingZoneNavigation from "../../shared/ui/navigation/CodingZoneNavigation.js";
import Banner from "../../shared/ui/Banner/Banner";
import CodingZoneBoardbar from "../../shared/ui/boardbar/CodingZoneBoardbar.js";
import { useCookies } from "react-cookie";
import { registerSubjectMapping } from "../../features/api/Admin/Codingzone/ClassApi.js";
import {
  fetchAllSubjects,
  deleteSubjectMappingBySubjectId,
} from "../../entities/api/CodingZone/AdminApi";
import {
  loadIdColorMap,
  saveIdColorMap,
  getCodingZoneColor,
} from "./subjectColors";
import { useRef } from "react";

const ClassSetting = () => {
  const [cookies, setCookie] = useCookies(["accessToken"]);
  const accessToken = cookies.accessToken;
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const idSeq = useRef(0);
  const newRowId = () => {
    idSeq.current += 1;
    return `row-${idSeq.current}`;
  };

  // 삭제 핸들러
  const handleDeleteExisting = async (m) => {
    const ok = window.confirm(
      `[${m.subjectId}] [${m.subjectName}]를 정말 삭제하시겠습니까?\n\n` +
        "※ 안내: 삭제시 해당과목에 등록된 조교도 함께 삭제됩니다.\n조교 등록을 다시 해주세요."
    );
    if (!ok) return;

    // 타입 혼선 방지
    setDeletingId(String(m.subjectId));

    const result = await deleteSubjectMappingBySubjectId(
      Number(m.subjectId), // path param이면 숫자로
      accessToken,
      setCookie,
      navigate
    );

    setDeletingId(null);

    if (result?.ok) {
      // 즉시 UI 반영 (새로고침 필요 없음)
      setExistingMappings((prev) =>
        prev
          .filter((x) => String(x.subjectId) !== String(m.subjectId))
          .sort(sortBySubjectId)
      );
      setExistingOrig((prev) =>
        prev
          .filter((x) => String(x.subjectId) !== String(m.subjectId))
          .sort(sortBySubjectId)
      );
    } else if (result) {
      if (result.code === "DELETE_NOT_ALLOW") {
        alert(result.message);
      } else {
        alert(`삭제 실패: ${result.message || "알 수 없는 오류"}`);
      }
    } else {
      alert("삭제 실패: 알 수 없는 오류");
    }
  };

  // 기존(서버 저장된) 매핑 리스트
  const [existingMappings, setExistingMappings] = useState([]); // [{subjectId, subjectName}]
  const [existingOrig, setExistingOrig] = useState([]); // ✅ 원본 스냅샷
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState(() => []);
  const [mappingsLoaded, setMappingsLoaded] = useState(false);

  // 깊은 곳에 숨어있는 첫 번째 배열을 찾아서 반환
  const findFirstArray = (v) => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const found = findFirstArray(v[k]);
        if (found) return found;
      }
    }
    return null;
  };

  // 서버 키 -> 프론트 표준 키로 통일
  const normalizeMappingItem = (m) => ({
    // 서버가 어떤 키를 주든 subjectId/subjectName으로 맞춰줌
    subjectId: String(
      m?.subjectId ?? m?.codingZone ?? m?.zone ?? m?.id ?? m?.code ?? ""
    ),
    subjectName: String(
      m?.subjectName ?? m?.name ?? m?.title ?? m?.label ?? ""
    ),
  });
  const sortBySubjectId = (a, b) => {
    const ai = parseInt(a.subjectId, 10);
    const bi = parseInt(b.subjectId, 10);
    if (Number.isNaN(ai) || Number.isNaN(bi)) {
      // 혹시 숫자가 아닌 값이 섞여 있으면 문자열 기준으로도 안전하게
      return String(a.subjectId).localeCompare(String(b.subjectId), undefined, {
        numeric: true,
      });
    }
    return ai - bi;
  };

  // 매핑 리스트 불러오기
  const loadMappings = async () => {
    try {
      setLoading(true);
      const res = await fetchAllSubjects(accessToken, setCookie, navigate);

      // 바로 배열이면 성공
      // 성공 응답 처리 (code: "SU")
      if (res && res.code === "SU" && res.data && res.data.subjectList) {
        const list = res.data.subjectList
          .map(normalizeMappingItem)
          .sort(sortBySubjectId);
        console.debug("[subjects] parsed list (success response):", list);
        setExistingMappings(list);
        setExistingOrig(list);
        setMappingsLoaded(true);
        return;
      }

      // 바로 배열이면 성공 (기존 호환성)
      if (Array.isArray(res)) {
        const list = res.map(normalizeMappingItem).sort(sortBySubjectId);
        console.debug("[subjects] parsed list (top-level array):", list);
        setExistingMappings(list);
        setExistingOrig(list);
        setMappingsLoaded(true);
        return;
      }

      // 객체 응답: 어디든 숨은 배열 찾아서 사용
      if (res && typeof res === "object") {
        // 실패 응답일 수도 있으니 우선 code 체크
        if ("code" in res && res.code === "NOT_ANY_MAPPINGSET") {
          console.debug("[subjects] empty mapping set from server");
          setExistingMappings([]);
          setExistingOrig([]);
          setMappingsLoaded(true);
          return;
        }

        const arr = findFirstArray(res) || [];
        const list = arr.map(normalizeMappingItem);

        console.debug("[subjects] parsed list (deep scan):", list);

        setExistingMappings(list);
        setExistingOrig(list);
        setMappingsLoaded(true);
        return;
      }

      // 예상치 못한 형태 → 안전하게 비움
      console.warn("[subjects] unexpected response shape; fallback to empty");
      setExistingMappings([]);
      setExistingOrig([]);
      setMappingsLoaded(true);
    } catch (error) {
      console.error("[subjects] error loading mappings:", error);
      setExistingMappings([]);
      setExistingOrig([]);
      setMappingsLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    loadMappings();
  }, [accessToken]);

  useEffect(() => {
    if (!mappingsLoaded) return; // 서버 매핑 다 받아오기 전엔 아무 것도 안 함

    setRows((prev) => {
      const free = getAvailableZonesStrict("new");

      // 남는 존이 없으면 추가행 자체 비우기
      if (free.length === 0) return [];

      // 기존 행이 없으면 1줄만 만들어 주기
      if (prev.length === 0) {
        return [{ id: newRowId(), codingZone: free[0], subjectName: "" }];
      }

      // 기존 행이 있으면 유효성만 재조정
      return reconcileRows(prev);
    });
  }, [mappingsLoaded, existingMappings]);

  const handleAddRow = () => {
    const id = newRowId();
    setRows((prev) =>
      reconcileRows([...prev, { id, codingZone: "", subjectName: "" }])
    );
  };

  const handleRemoveRow = (id) => {
    setRows((prev) => reconcileRows(prev.filter((row) => row.id !== id)));
  };

  const handleChange = (id, field, value) => {
    setRows((prev) =>
      reconcileRows(
        prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
      )
    );
  };

  const handleExistingChange = (subjectId, nextName) => {
    setExistingMappings((prev) =>
      prev.map((m) =>
        String(m.subjectId) === String(subjectId)
          ? { ...m, subjectName: nextName }
          : m
      )
    );
  };

  const ALL_ZONES = ["1", "2", "3", "4"];

  // 행들을 한 번에 유효/서로-다른 코딩존으로 재배치
  const reconcileRows = (inputRows) => {
    const usedByExisting = new Set(
      (Array.isArray(existingMappings) ? existingMappings : []).map((m) =>
        String(m.subjectId)
      )
    );
    const chosen = new Set(); // 이번 패스에서 이미 배정한 값

    return inputRows.map((r) => {
      const desired = String(r.codingZone ?? "");
      // 이번 행에서 선택 가능한 후보 = 전체 - (서버에 이미 사용중) - (앞서 배정된 값)
      const allowed = ALL_ZONES.filter(
        (z) => !usedByExisting.has(z) && !chosen.has(z)
      );
      const next = allowed.includes(desired) ? desired : allowed[0] ?? "";
      if (next) chosen.add(next);
      return { ...r, codingZone: next };
    });
  };

  // ✅ 현재 선택값을 '유지'하지 않는 버전 (기본값 계산용)
  const getAvailableZonesStrict = (rowId) => {
    const safeExisting = Array.isArray(existingMappings)
      ? existingMappings
      : [];
    const usedByExisting = new Set(
      safeExisting.map((m) => String(m.subjectId))
    );
    const usedByOtherNewRows = new Set(
      rows.filter((r) => r.id !== rowId).map((r) => String(r.codingZone))
    );
    return ALL_ZONES.filter(
      (z) => !(usedByExisting.has(z) || usedByOtherNewRows.has(z))
    );
  };

  const getAvailableZones = (rowId) => getAvailableZonesStrict(rowId);

  //신규 없어도 제출 허용
  const getEditedPayload = () => {
    const origMap = new Map(
      (existingOrig ?? []).map((o) => [
        String(o.subjectId),
        (o.subjectName ?? "").trim(),
      ])
    );
    return existingMappings
      .map((m) => ({
        subjectId: Number(m.subjectId),
        subjectName: (m.subjectName ?? "").trim(),
      }))
      .filter((m) => {
        const orig = origMap.get(String(m.subjectId));
        return typeof orig === "string" && orig !== m.subjectName; // 내용이 바뀐 것만
      });
  };

  const handleSubmit = async () => {
    // 신규(추가)만 추려냄: 과목명 있고, 코딩존 선택돼 있어야 함
    const cleaned = rows
      .map((r) => ({ ...r, subjectName: r.subjectName.trim() }))
      .filter((r) => r.subjectName !== "" && r.codingZone);

    // ID→COLOR만 저장
    const idColor = loadIdColorMap();
    cleaned.forEach((r) => {
      const id = String(parseInt(r.codingZone, 10));
      const color = getCodingZoneColor(id);
      idColor[id] = color;
    });
    saveIdColorMap(idColor);

    // 백엔드로 보낼 payload 생성(색상 제외)
    const createPayload = cleaned.map((r) => ({
      subjectId: parseInt(r.codingZone, 10),
      subjectName: r.subjectName,
    }));

    const editPayload = getEditedPayload();

    if (createPayload.length === 0 && editPayload.length === 0) {
      alert("추가/변경된 내용이 없습니다.");
      return;
    }

    // subjectId 기준 병합(동일 ID가 양쪽에 있으면 마지막 값으로)
    const merged = (() => {
      const map = new Map();
      [...createPayload, ...editPayload].forEach((p) => {
        map.set(String(p.subjectId), p);
      });
      return Array.from(map.values());
    })();

    const result = await registerSubjectMapping(
      merged,
      accessToken,
      setCookie,
      navigate
    );

    if (result.success) {
      alert("등록 완료!");
      const nextExisting = (() => {
        const map = new Map(
          existingMappings.map((x) => [String(x.subjectId), x])
        );
        merged.forEach((p) =>
          map.set(String(p.subjectId), {
            subjectId: p.subjectId,
            subjectName: p.subjectName,
          })
        );
        return Array.from(map.values()).sort(sortBySubjectId);
      })();

      // 2) existing/원본 동기 갱신
      setExistingMappings(nextExisting);
      setExistingOrig(nextExisting);

      // 3) 남은 슬롯으로 "항상 1줄만" 초기화
      const used = new Set(nextExisting.map((m) => String(m.subjectId)));
      const free = ALL_ZONES.filter((z) => !used.has(z));
      if (free.length === 0) {
        setRows([]);
      } else {
        setRows([{ id: newRowId(), codingZone: free[0], subjectName: "" }]);
      }
    } else {
      alert(`등록 실패: ${result.message}`);
    }
  };

  const noZoneAvailable = getAvailableZonesStrict("new").length === 0;

  return (
    <div className="class-regist-main-container">
      <div className="codingzone-container">
        <CodingZoneNavigation />
        <Banner src="/codingzone_attendance4.png" />
        <div className="main-body-container">
          <div className="cza_button_container" style={{ textAlign: "center" }}>
            <CodingZoneBoardbar />
          </div>
          <div className="setting-label">
            <span className="column-label1">코딩존</span>
            <span className="column-label2">과목명</span>
          </div>
          <div className="setting-table-container">
            <table className="form-table">
              {/* 이미 등록된 매핑: 항상 리스트에 남김(읽기 전용) */}
              {loading ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: "center" }}>
                    불러오는 중…
                  </td>
                </tr>
              ) : (
                existingMappings.map((m) => (
                  <tr
                    key={`existing-${m.subjectId}`}
                    className="registered-row"
                  >
                    <td>
                      <input value={m.subjectId} disabled />
                    </td>
                    <td className="subject-cell">
                      <input
                        type="text"
                        value={m.subjectName}
                        onChange={(e) =>
                          handleExistingChange(m.subjectId, e.target.value)
                        }
                      />
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteExisting(m)}
                        disabled={String(deletingId) === String(m.subjectId)}
                      >
                        {deletingId === m.subjectId ? (
                          "삭제중…"
                        ) : (
                          <span className="delete-btn1">X</span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {rows.map((row) => {
                const opts = getAvailableZones(row.id);
                const noOpts = opts.length === 0;

                return (
                  <tr key={row.id}>
                    <td>
                      <select
                        value={noOpts ? "" : row.codingZone} // 옵션 없으면 빈 값
                        onChange={(e) =>
                          handleChange(row.id, "codingZone", e.target.value)
                        }
                        disabled={noOpts} // 옵션 없으면 비활성
                      >
                        {noOpts ? (
                          <option value="">사용 가능한 코딩존 없음</option>
                        ) : (
                          opts.map((z) => (
                            <option key={z} value={z}>
                              {z}
                            </option>
                          ))
                        )}
                      </select>
                    </td>

                    <td className="subject-cell">
                      <input
                        type="text"
                        placeholder="과목명을 입력해주세요.."
                        value={row.subjectName}
                        onChange={(e) =>
                          handleChange(row.id, "subjectName", e.target.value)
                        }
                      />
                      <button
                        className="delete-btn"
                        onClick={() => handleRemoveRow(row.id)}
                      >
                        <span className="delete-btn1">X</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </table>

            <div className="button-group">
              <button
                className="add-btn"
                onClick={handleAddRow}
                disabled={getAvailableZonesStrict("new").length === 0}
              >
                추가
              </button>
              <button className="submit-btn" onClick={handleSubmit}>
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSetting;
