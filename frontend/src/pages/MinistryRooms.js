import React, { useEffect, useState } from "react";
import { roomsAPI, schedulesAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  MdMeetingRoom,
  MdAdd,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdBuild,
} from "react-icons/md";

const PAGE_SIZE = 5;

const getRoomErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot delete classroom that has schedules")) {
    return "Không thể xóa phòng vì đã có lịch học sử dụng phòng này.";
  }
  if (lowerMessage.includes("cannot update classroom that has schedule")) {
    return "Không thể cập nhật sức chứa, loại phòng hoặc trạng thái vì phòng đã được xếp lịch.";
  }
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate")) {
    return "Mã phòng đã tồn tại. Vui lòng kiểm tra lại.";
  }
  if (action === "delete") return "Không thể xóa phòng học.";
  return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
};

const MinistryRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    classroom_id: "",
    capacity: 0,
    type: "",
    description: "",
    status: "",
  });

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getAll();
      setRooms(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu phòng học");
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await schedulesAPI.getAll();
      setSchedules(response.data);
    } catch (e) {
      toast.error("Khong the tai du lieu lich hoc");
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchSchedules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? Number(value) : value,
    });
  };

  const handleClickCreateRoom = () => {
    setRepair(false);
    setFormData({
      classroom_id: "",
      capacity: 0,
      type: "",
      description: "",
      status: "",
    });
    setShowForm(!showForm);
  };

  const handleOpenFormUpdate = (room) => {
    setRepair(true);
    setShowForm(true);
    setFormData(room);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (repair) {
        await roomsAPI.update(formData.classroom_id, formData);
        toast.success("Cập nhật phòng thành công!");
      } else {
        await roomsAPI.create(formData);
        toast.success("Thêm phòng mới thành công!");
      }
      setShowForm(false);
      fetchRooms();
      fetchSchedules();
    } catch (err) {
      toast.error(getRoomErrorMessage(err));
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng học ${room.classroom_id}?`)) {
      return;
    }

    try {
      await roomsAPI.delete(room.classroom_id);
      toast.success("Xóa phòng thành công!");
      fetchRooms();
      fetchSchedules();
    } catch (err) {
      toast.error(getRoomErrorMessage(err, "delete"));
    }
  };

  const totalPages = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE));
  const paginatedRooms = rooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const scheduledRoomIds = new Set(schedules.map((s) => s.classroom_id));
  const isScheduledRepair = repair && scheduledRoomIds.has(formData.classroom_id);
  const readyRooms = rooms.filter((r) => r.status === "Ready").length;
  const maintenanceRooms = rooms.filter((r) => r.status !== "Ready").length;

  return (
    <div style={S.page}>
      {/* BREADCRUMB */}
      <div style={S.breadcrumb}>
        <span style={S.breadcrumbHome}>Dashboard</span>
        <span style={S.breadcrumbSep}>›</span>
        <span style={S.breadcrumbCurrent}>Quản lý phòng học</span>
      </div>

      {/* HEADER */}
      <div style={S.header}>
        <h1 style={S.title}>QUẢN LÝ PHÒNG HỌC</h1>
        <button onClick={handleClickCreateRoom} style={S.addButton}>
          <MdAdd size={16} />
          {showForm ? "Đóng form" : "Thêm phòng học mới"}
        </button>
      </div>

      {/* BIG BLUE BANNER */}
      <div style={S.totalBanner}>
        <div>
          <div style={S.totalLabel}>Tổng số phòng</div>
          <div style={S.totalValue}>{rooms.length}</div>
          <div style={S.totalSubtext}>
            Hệ thống hiện có {readyRooms} phòng sẵn sàng và {maintenanceRooms}{" "}
            phòng đang bảo trì
          </div>
        </div>
        <div style={S.totalIcon}>
          <MdMeetingRoom size={48} />
        </div>
      </div>

      {/* SMALL BLUE BOXES */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <div>
            <div style={S.statLabel}>Sẵn sàng</div>
            <div style={S.statValue}>{readyRooms}</div>
          </div>
          <div style={S.statIconBox}>
            <MdCheckCircle size={28} />
          </div>
        </div>

        <div style={S.statCard}>
          <div>
            <div style={S.statLabel}>Đang bảo trì</div>
            <div style={S.statValue}>{maintenanceRooms}</div>
          </div>
          <div style={S.statIconBox}>
            <MdBuild size={28} />
          </div>
        </div>
      </div>

      {/* FORM */}
      {/* FORM */}
      {showForm && (
        <div style={S.modalOverlay}>
          <div style={S.modalBox}>
            {/* HEADER */}
            <div style={S.modalHeader}>
              <div style={S.formTitle}>
                {repair ? "Cập nhật phòng học" : "Thêm phòng học mới"}
              </div>

              <button
                onClick={() => setShowForm(false)}
                style={S.closeBtn}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={S.formGrid}>
                <div>
                  <label style={S.label}>Mã phòng</label>

                  <input
                    name="classroom_id"
                    value={formData.classroom_id}
                    onChange={handleInputChange}
                    disabled={repair}
                    style={{
                      ...S.input,
                      ...(repair ? S.inputDisabled : {}),
                    }}
                    placeholder="VD: A2-301"
                    required
                  />
                </div>

                <div>
                  <label style={S.label}>Sức chứa</label>

                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    disabled={isScheduledRepair}
                    style={{
                      ...S.input,
                      ...(isScheduledRepair ? S.inputDisabled : {}),
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={S.label}>Loại phòng</label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={isScheduledRepair}
                    style={{
                      ...S.input,
                      ...(isScheduledRepair ? S.inputDisabled : {}),
                    }}
                    required
                  >
                    <option value="">-- Chọn loại --</option>
                    <option value="Theory">Theory</option>
                    <option value="Practice">Practice</option>
                  </select>
                </div>

                <div>
                  <label style={S.label}>Thiết bị</label>

                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    style={S.input}
                    placeholder="Máy chiếu, loa..."
                    required
                  />
                </div>

                <div>
                  <label style={S.label}>Trạng thái</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={isScheduledRepair}
                    style={{
                      ...S.input,
                      ...(isScheduledRepair ? S.inputDisabled : {}),
                    }}
                    required
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="Ready">Ready</option>
                    <option value="Maintaince">Maintaince</option>
                  </select>
                </div>
              </div>

              {isScheduledRepair && (
                <div style={S.lockedNotice}>
                  Phòng đã được xếp lịch nên không thể đổi sức chứa, loại phòng hoặc trạng thái.
                </div>
              )}

              {/* FOOTER */}
              <div style={S.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={S.cancelBtn}
                >
                  Hủy
                </button>

                <button type="submit" style={S.submitBtn}>
                  {repair ? "Cập nhật dữ liệu" : "Lưu phòng học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div style={S.tableWrapper}>
        <div style={S.tableHeader}>
          <span style={S.tableTitle}>Danh sách phòng học</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr style={S.theadRow}>
                <th style={S.th}>STT</th>
                <th style={S.th}>MÃ PHÒNG</th>
                <th style={S.th}>SỨC CHỨA</th>
                <th style={S.th}>LOẠI PHÒNG</th>
                <th style={S.th}>THIẾT BỊ</th>
                <th style={S.th}>TRẠNG THÁI</th>
                <th style={S.th}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRooms.map((room, index) => (
                <tr key={room.classroom_id} style={S.tbodyRow}>
                  <td style={S.td}>
                    {String((page - 1) * PAGE_SIZE + index + 1).padStart(
                      2,
                      "0",
                    )}
                  </td>
                  <td style={{ ...S.td, fontWeight: 700, color: "#4f46e5" }}>
                    {room.classroom_id}
                  </td>
                  <td style={S.td}>{room.capacity} sinh viên</td>
                  <td style={S.td}>
                    <span style={S.typeBadge}>{room.type}</span>
                  </td>
                  <td style={S.td}>{room.description}</td>
                  <td style={S.td}>
                    <span
                      style={
                        room.status === "Ready"
                          ? S.readyBadge
                          : S.maintenanceBadge
                      }
                    >
                      ● {room.status === "Ready" ? "Ready" : "Maintaince"}
                    </span>
                  </td>
                  <td style={S.td}>
                    <div style={S.actionGroup}>
                      <button
                        style={S.editBtn}
                        onClick={() => handleOpenFormUpdate(room)}
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        style={S.deleteBtn}
                        onClick={() => handleDeleteRoom(room)}
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={S.tableFooter}>
          <span>
            Hiển thị {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, rooms.length)} trên {rooms.length} phòng học
          </span>
          <div style={S.pageControls}>
            <button
              style={{ ...S.pageBtn, ...(page === 1 ? S.pageBtnDisabled : {}) }}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>
            <span style={S.pageInfo}>{page} / {totalPages}</span>
            <button
              style={{
                ...S.pageBtn,
                ...(page === totalPages ? S.pageBtnDisabled : {}),
              }}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STYLES ĐÃ CẬP NHẬT ====================
const S = {
  page: {
    padding: "28px 32px",
    fontFamily: "'Segoe UI', sans-serif", // ← Font đồng nhất
    background: "#f8fafc",
    minHeight: "100vh",
  },

  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
    fontSize: "13px",
  },
  breadcrumbHome: { color: "#64748b" },
  breadcrumbSep: { color: "#94a3b8" },
  breadcrumbCurrent: { color: "#4f46e5", fontWeight: 600 },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    color: "#0f172a",
  },

  addButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 18px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13.5px",
  },

  // Big Banner
  totalBanner: {
    background: "#4f46e5",
    color: "#fff",
    borderRadius: "12px",
    padding: "28px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  totalLabel: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    opacity: 0.95,
  },
  totalValue: {
    fontSize: "52px",
    fontWeight: 800,
    lineHeight: 1,
    margin: "8px 0",
  },
  totalSubtext: { fontSize: "14px", opacity: 0.9 },
  totalIcon: { opacity: 0.9 },

  // Small Blue Boxes
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#4f46e5",
    color: "#fff",
    borderRadius: "12px",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.3)",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.6px",
    opacity: 0.9,
    marginBottom: "6px",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 800,
  },
  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: "10px",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Form
  form: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
  },
  formTitle: {
    marginBottom: "20px",
    fontSize: "17px",
    fontWeight: 700,
    color: "#1e293b",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
  },
  inputDisabled: {
    background: "#f1f5f9",
    color: "#94a3b8",
    cursor: "not-allowed",
  },
  lockedNotice: {
    marginTop: "14px",
    padding: "10px 12px",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    background: "#fffbeb",
    color: "#92400e",
    fontSize: "13px",
    fontWeight: 600,
  },
  submitBtn: {
    marginTop: "20px",
    padding: "12px 28px",
    borderRadius: "8px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },

  // Table
  tableWrapper: {
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  tableHeader: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9" },
  tableTitle: { fontSize: "16px", fontWeight: 700, color: "#1e293b" },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { background: "#f1f5f9" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.5px",
  },
  tbodyRow: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "15px 16px", fontSize: "14px", color: "#334155" },

  typeBadge: {
    padding: "4px 12px",
    borderRadius: "9999px",
    background: "#e0e7ff",
    color: "#4f46e5",
    fontSize: "12.5px",
    fontWeight: 600,
  },
  readyBadge: {
    padding: "4px 12px",
    borderRadius: "9999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12.5px",
    fontWeight: 600,
  },
  maintenanceBadge: {
    padding: "4px 12px",
    borderRadius: "9999px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontSize: "12.5px",
    fontWeight: 600,
  },

  actionGroup: { display: "flex", gap: "8px" },
  editBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "#e0e7ff",
    color: "#4f46e5",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tableFooter: {
    padding: "16px 24px",
    color: "#64748b",
    fontSize: "13px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  pageControls: { display: "flex", alignItems: "center", gap: "8px" },
  pageInfo: { color: "#334155", fontWeight: 600 },
  pageBtn: {
    padding: "6px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
  },
  pageBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },

  modalBox: {
    width: "100%",
    maxWidth: "850px",
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.2s ease",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  closeBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "none",
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    color: "#64748b",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
  },

  cancelBtn: {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};

export default MinistryRooms;
