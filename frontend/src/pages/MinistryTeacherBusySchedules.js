import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaTimes } from "react-icons/fa";
import { teacherBusySchedulesAPI } from "../services/api";

const FILTERS = [
  { value: "pending", label: "Cần duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "all", label: "Tất cả" },
];

const STATUS_LABEL = {
  pending: "Cần duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};
const STATUS_STYLE = {
  pending: { background: "#fef3c7", color: "#92400e" },
  approved: { background: "#dcfce7", color: "#166534" },
  rejected: { background: "#fee2e2", color: "#991b1b" },
};

const getErrorMessage = (err) => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(" ")
    : String(rawMessage);

  if (message.includes("already been finalized")) {
    return "Đơn này đã được chuyển trạng thái, không thể đổi lại.";
  }

  if (message.includes("teaching schedule")) {
    return "Không thể duyệt vì giáo viên đã có lịch dạy trong khoảng tiết này.";
  }

  return "Thao tác thất bại. Vui lòng thử lại.";
};

const MinistryTeacherBusySchedules = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("pending");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = useCallback(() =>
    teacherBusySchedulesAPI
      .getAll("all")
      .then((res) => setItems(res.data || []))
      .catch(() => toast.error("Không thể tải danh sách lịch bận.")),
    [],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        acc.all += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, all: 0 },
    );
  }, [items]);

  const displayedItems = useMemo(
    () =>
      status === "all"
        ? items
        : items.filter((item) => item.status === status),
    [items, status],
  );

  const approve = async (busyId) => {
    try {
      await teacherBusySchedulesAPI.approve(busyId);
      toast.success("Đã duyệt đơn lịch bận.");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "ministry-busy-error" });
    }
  };

  const reject = async (busyId) => {
    try {
      await teacherBusySchedulesAPI.reject(busyId, rejectReason);
      toast.success("Đã từ chối đơn lịch bận.");
      setRejectingId(null);
      setRejectReason("");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: "ministry-busy-error" });
    }
  };

  return (
    <div style={S.page}>
      <div style={S.breadcrumb}>
        <span style={S.breadcrumbHome}>Dashboard Overview</span>
        <span style={S.breadcrumbSep}>/</span>
        <span style={S.breadcrumbCurrent}>Duyệt lịch bận</span>
      </div>

      <div style={S.header}>
        <div>
          <h2 style={S.title}>Duyệt lịch bận giáo viên</h2>
          <p style={S.subtitle}>
            Chỉ đơn đã duyệt mới có hiệu lực chặn xếp lịch học.
          </p>
        </div>
      </div>

      <div style={S.filterRow}>
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatus(filter.value)}
            style={{
              ...S.filterBtn,
              ...(status === filter.value ? S.filterBtnActive : {}),
            }}
          >
            {filter.label}
            <span style={S.filterCount}>{counts[filter.value] || 0}</span>
          </button>
        ))}
      </div>

      <div style={S.tableCard}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Giáo viên</th>
                <th style={S.th}>Ngày</th>
                <th style={S.th}>Tiết</th>
                <th style={S.th}>Lý do</th>
                <th style={S.th}>Trạng thái</th>
                <th style={S.th}>Lý do từ chối</th>
                <th style={S.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item) => (
                <tr key={item.busy_id}>
                  <td style={S.td}>
                    <div style={S.teacherName}>{item.teacher?.name || "-"}</div>
                    <div style={S.teacherMeta}>
                      {item.teacher_id} · {item.teacher?.user?.email || ""}
                    </div>
                  </td>
                  <td style={S.td}>
                    {new Date(item.busy_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={S.td}>
                    Tiết {item.start_slot}-{item.end_slot}
                  </td>
                  <td style={S.td}>{item.reason || "-"}</td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, ...(STATUS_STYLE[item.status] || {}) }}>
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </td>
                  <td style={S.td}>{item.reject_reason || "-"}</td>
                  <td style={S.td}>
                    {item.status === "pending" ? (
                      <div style={S.actionGroup}>
                        <button
                          type="button"
                          style={S.approveBtn}
                          onClick={() => approve(item.busy_id)}
                          title="Duyệt"
                        >
                          <FaCheck />
                        </button>
                        <button
                          type="button"
                          style={S.rejectBtn}
                          onClick={() => {
                            setRejectingId(item.busy_id);
                            setRejectReason("");
                          }}
                          title="Từ chối"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <span style={S.lockedText}>Đã khóa</span>
                    )}
                  </td>
                </tr>
              ))}
              {displayedItems.length === 0 && (
                <tr>
                  <td style={S.emptyTd} colSpan={7}>
                    Không có đơn lịch bận phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectingId && (
        <div style={S.overlay} onClick={() => setRejectingId(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Từ chối đơn lịch bận</h3>
            <label style={S.label}>Lý do từ chối</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={S.textarea}
              maxLength={255}
              placeholder="Nhập lý do để giáo viên biết nguyên nhân"
            />
            <div style={S.modalActions}>
              <button
                type="button"
                style={S.cancelBtn}
                onClick={() => setRejectingId(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                style={S.confirmRejectBtn}
                onClick={() => reject(rejectingId)}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  page: {
    padding: "24px 32px",
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  breadcrumb: { display: "flex", gap: 6, marginBottom: 18, fontSize: 13 },
  breadcrumbHome: { color: "#94a3b8" },
  breadcrumbSep: { color: "#cbd5e1" },
  breadcrumbCurrent: { color: "#4f46e5", fontWeight: 700 },
  header: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "18px 22px",
    marginBottom: 16,
  },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" },
  subtitle: { margin: "6px 0 0", color: "#64748b", fontSize: 13 },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  filterBtn: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    borderRadius: 8,
    padding: "9px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  filterBtnActive: { background: "#4f46e5", color: "#fff", borderColor: "#4f46e5" },
  filterCount: {
    marginLeft: 8,
    fontSize: 12,
    opacity: 0.8,
  },
  tableCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 1040 },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontSize: 12,
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "13px 14px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
    color: "#334155",
    verticalAlign: "middle",
  },
  teacherName: { fontWeight: 800, color: "#1e293b" },
  teacherMeta: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  badge: {
    display: "inline-block",
    borderRadius: 999,
    padding: "4px 9px",
    fontWeight: 800,
    fontSize: 12,
  },
  actionGroup: { display: "flex", gap: 6 },
  approveBtn: {
    width: 32,
    height: 32,
    border: "none",
    borderRadius: 7,
    background: "#dcfce7",
    color: "#15803d",
    cursor: "pointer",
  },
  rejectBtn: {
    width: 32,
    height: 32,
    border: "none",
    borderRadius: 7,
    background: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
  },
  lockedText: { color: "#94a3b8", fontSize: 12 },
  emptyTd: { padding: 26, textAlign: "center", color: "#94a3b8" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    width: 420,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 20px 50px rgba(15,23,42,0.2)",
  },
  modalTitle: { margin: "0 0 14px", fontSize: 18, fontWeight: 800 },
  label: { display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 },
  textarea: {
    width: "100%",
    minHeight: 110,
    resize: "vertical",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },
  cancelBtn: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: 8,
    padding: "9px 13px",
    cursor: "pointer",
  },
  confirmRejectBtn: {
    border: "none",
    background: "#dc2626",
    color: "#fff",
    borderRadius: 8,
    padding: "9px 13px",
    cursor: "pointer",
    fontWeight: 800,
  },
};

export default MinistryTeacherBusySchedules;
