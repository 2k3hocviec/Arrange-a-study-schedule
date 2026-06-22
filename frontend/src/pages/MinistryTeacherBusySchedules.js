import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { teacherBusySchedulesAPI } from "../services/api";
import "../styles/MinistryTeacherBusySchedules.css";
const FILTERS = [{
  value: "pending",
  label: "Cần duyệt"
}, {
  value: "approved",
  label: "Đã duyệt"
}, {
  value: "rejected",
  label: "Từ chối"
}, {
  value: "all",
  label: "Tất cả"
}];
const STATUS_LABEL = {
  pending: "Cần duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối"
};
const STATUS_STYLE = {
  pending: {
    background: "#fef3c7",
    color: "#92400e"
  },
  approved: {
    background: "#dcfce7",
    color: "#166534"
  },
  rejected: {
    background: "#fee2e2",
    color: "#991b1b"
  }
};
const getErrorMessage = err => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
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
  const [keyword, setKeyword] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const fetchData = useCallback(() => teacherBusySchedulesAPI.getAll("all").then(res => setItems(res.data || [])).catch(() => toast.error("Không thể tải danh sách lịch bận.")), []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const counts = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      acc.all += 1;
      return acc;
    }, {
      pending: 0,
      approved: 0,
      rejected: 0,
      all: 0
    });
  }, [items]);
  const displayedItems = useMemo(() => {
    const statusItems = status === "all" ? items : items.filter(item => item.status === status);
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return statusItems;
    return statusItems.filter(item => [item.busy_id, item.teacher_id, item.teacher?.name, item.teacher?.user?.email, item.busy_date ? new Date(item.busy_date).toLocaleDateString("vi-VN") : "", item.start_slot, item.end_slot, item.reason, STATUS_LABEL[item.status], item.status, item.reject_reason].filter(value => value !== undefined && value !== null).join(" ").toLowerCase().includes(normalizedKeyword));
  }, [items, status, keyword]);
  const approve = async busyId => {
    try {
      await teacherBusySchedulesAPI.approve(busyId);
      toast.success("Đã duyệt đơn lịch bận.");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), {
        id: "ministry-busy-error"
      });
    }
  };
  const reject = async busyId => {
    try {
      await teacherBusySchedulesAPI.reject(busyId, rejectReason);
      toast.success("Đã từ chối đơn lịch bận.");
      setRejectingId(null);
      setRejectReason("");
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err), {
        id: "ministry-busy-error"
      });
    }
  };
  return <div className="ministry-teacher-busy-schedules__page">
      <div className="ministry-teacher-busy-schedules__breadcrumb">
        <span className="ministry-teacher-busy-schedules__breadcrumb-home">Dashboard Overview</span>
        <span className="ministry-teacher-busy-schedules__breadcrumb-sep">/</span>
        <span className="ministry-teacher-busy-schedules__breadcrumb-current">Duyệt lịch bận</span>
      </div>

      <div className="ministry-teacher-busy-schedules__header">
        <div>
          <h2 className="ministry-teacher-busy-schedules__title">Duyệt lịch bận giáo viên</h2>
          <p className="ministry-teacher-busy-schedules__subtitle">
            Chỉ đơn đã duyệt mới có hiệu lực chặn xếp lịch học.
          </p>
        </div>
      </div>

      <div className="ministry-teacher-busy-schedules__filter-row">
        {FILTERS.map(filter => <button key={filter.value} type="button" onClick={() => setStatus(filter.value)} style={{
        ...(status === filter.value ? S.filterBtnActive : {})
      }} className="ministry-teacher-busy-schedules__filter-btn">
          
            {filter.label}
            <span className="ministry-teacher-busy-schedules__filter-count">{counts[filter.value] || 0}</span>
          </button>)}
      </div>

      <div className="ministry-teacher-busy-schedules__search-row">
        <div className="ministry-teacher-busy-schedules__search-wrap">
          <FiSearch size={15} color="#94a3b8" />
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tim giao vien, ngay, tiet, ly do, trang thai..." className="ministry-teacher-busy-schedules__search-input" />

          
        </div>
      </div>

      <div className="ministry-teacher-busy-schedules__table-card">
        <div className="ministry-teacher-busy-schedules__inline-171">
          <table className="ministry-teacher-busy-schedules__table">
            <thead>
              <tr>
                <th className="ministry-teacher-busy-schedules__th">Giáo viên</th>
                <th className="ministry-teacher-busy-schedules__th">Ngày</th>
                <th className="ministry-teacher-busy-schedules__th">Tiết</th>
                <th className="ministry-teacher-busy-schedules__th">Lý do</th>
                <th className="ministry-teacher-busy-schedules__th">Trạng thái</th>
                <th className="ministry-teacher-busy-schedules__th">Lý do từ chối</th>
                <th className="ministry-teacher-busy-schedules__th">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map(item => <tr key={item.busy_id}>
                  <td className="ministry-teacher-busy-schedules__td">
                    <div className="ministry-teacher-busy-schedules__teacher-name">{item.teacher?.name || "-"}</div>
                    <div className="ministry-teacher-busy-schedules__teacher-meta">
                      {item.teacher_id} · {item.teacher?.user?.email || ""}
                    </div>
                  </td>
                  <td className="ministry-teacher-busy-schedules__td">
                    {new Date(item.busy_date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="ministry-teacher-busy-schedules__td">
                    Tiết {item.start_slot}-{item.end_slot}
                  </td>
                  <td className="ministry-teacher-busy-schedules__td">{item.reason || "-"}</td>
                  <td className="ministry-teacher-busy-schedules__td">
                    <span style={{
                  ...(STATUS_STYLE[item.status] || {})
                }} className="ministry-teacher-busy-schedules__badge">
                      {STATUS_LABEL[item.status] || item.status}
                    </span>
                  </td>
                  <td className="ministry-teacher-busy-schedules__td">{item.reject_reason || "-"}</td>
                  <td className="ministry-teacher-busy-schedules__td">
                    {item.status === "pending" ? <div className="ministry-teacher-busy-schedules__action-group">
                        <button type="button" onClick={() => approve(item.busy_id)} title="Duyệt" className="ministry-teacher-busy-schedules__approve-btn">
                      
                          <FaCheck />
                        </button>
                        <button type="button" onClick={() => {
                    setRejectingId(item.busy_id);
                    setRejectReason("");
                  }} title="Từ chối" className="ministry-teacher-busy-schedules__reject-btn">
                      
                          <FaTimes />
                        </button>
                      </div> : <span className="ministry-teacher-busy-schedules__locked-text">Đã khóa</span>}
                  </td>
                </tr>)}
              {displayedItems.length === 0 && <tr>
                  <td colSpan={7} className="ministry-teacher-busy-schedules__empty-td">
                    Không có đơn lịch bận phù hợp.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {rejectingId && <div style={S.overlay} onClick={() => setRejectingId(null)}>
          <div onClick={e => e.stopPropagation()} className="ministry-teacher-busy-schedules__modal">
            <h3 className="ministry-teacher-busy-schedules__modal-title">Từ chối đơn lịch bận</h3>
            <label className="ministry-teacher-busy-schedules__label">Lý do từ chối</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} maxLength={255} placeholder="Nhập lý do để giáo viên biết nguyên nhân" className="ministry-teacher-busy-schedules__textarea" />
          
            <div className="ministry-teacher-busy-schedules__modal-actions">
              <button type="button" onClick={() => setRejectingId(null)} className="ministry-teacher-busy-schedules__cancel-btn">
              
                Hủy
              </button>
              <button type="button" onClick={() => reject(rejectingId)} className="ministry-teacher-busy-schedules__confirm-reject-btn">
              
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
const S = {
  filterBtnActive: {
    background: "#4f46e5",
    color: "#fff",
    borderColor: "#4f46e5"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  }
};
export default MinistryTeacherBusySchedules;
