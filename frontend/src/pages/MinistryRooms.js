import React, { useEffect, useState } from "react";
import { roomsAPI, schedulesAPI } from "../services/api";
import toast from "react-hot-toast";
import { MdMeetingRoom, MdAdd, MdEdit, MdDelete, MdCheckCircle, MdBuild } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import "../styles/MinistryRooms.css";
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
  if (
    lowerMessage.includes("number of students must be greater than zero") ||
    lowerMessage.includes("capacity")
  ) {
    return "Sức chứa không được âm.";
  }
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate") || lowerMessage.includes("already exists")) {
    return "Mã phòng học này đã tồn tại trong hệ thống. Vui lòng nhập một mã phòng khác (không được phép trùng lặp mã).";
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
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState({
    classroom_id: "",
    capacity: 0,
    type: "",
    description: "",
    status: ""
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
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData({
      ...formData,
      [name]: name === "capacity" ? Number(value) : value
    });
  };
  const handleClickCreateRoom = () => {
    setRepair(false);
    setFormData({
      classroom_id: "",
      capacity: 0,
      type: "",
      description: "",
      status: ""
    });
    setShowForm(!showForm);
  };
  const handleOpenFormUpdate = room => {
    setRepair(true);
    setShowForm(true);
    setFormData(room);
  };
  const handleSubmit = async e => {
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
  const handleDeleteRoom = async room => {
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
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredRooms = normalizedKeyword ? rooms.filter(room => [room.classroom_id, room.capacity, room.type, room.description, room.status].filter(value => value !== undefined && value !== null).join(" ").toLowerCase().includes(normalizedKeyword)) : rooms;
  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const paginatedRooms = filteredRooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const scheduledRoomIds = new Set(schedules.map(s => s.classroom_id));
  const isScheduledRepair = repair && scheduledRoomIds.has(formData.classroom_id);
  const readyRooms = rooms.filter(r => r.status === "Ready").length;
  const maintenanceRooms = rooms.filter(r => r.status !== "Ready").length;
  return <div className="ministry-rooms__page">
      {/* BREADCRUMB */}
      <div className="ministry-rooms__breadcrumb">
        <span className="ministry-rooms__breadcrumb-home">Dashboard</span>
        <span className="ministry-rooms__breadcrumb-sep">›</span>
        <span className="ministry-rooms__breadcrumb-current">Quản lý phòng học</span>
      </div>

      {/* HEADER */}
      <div className="ministry-rooms__header">
        <h1 className="ministry-rooms__title">QUẢN LÝ PHÒNG HỌC</h1>
        <button onClick={handleClickCreateRoom} className="ministry-rooms__add-button">
          <MdAdd size={16} />
          {showForm ? "Đóng form" : "Thêm phòng học mới"}
        </button>
      </div>

      {/* BIG BLUE BANNER */}
      <div className="ministry-rooms__total-banner">
        <div>
          <div className="ministry-rooms__total-label">Tổng số phòng</div>
          <div className="ministry-rooms__total-value">{rooms.length}</div>
          <div className="ministry-rooms__total-subtext">
            Hệ thống hiện có {readyRooms} phòng sẵn sàng và {maintenanceRooms}{" "}
            phòng đang bảo trì
          </div>
        </div>
        <div className="ministry-rooms__total-icon">
          <MdMeetingRoom size={48} />
        </div>
      </div>

      {/* SMALL BLUE BOXES */}
      <div className="ministry-rooms__stats-grid">
        <div className="ministry-rooms__stat-card">
          <div>
            <div className="ministry-rooms__stat-label">Sẵn sàng</div>
            <div className="ministry-rooms__stat-value">{readyRooms}</div>
          </div>
          <div className="ministry-rooms__stat-icon-box">
            <MdCheckCircle size={28} />
          </div>
        </div>

        <div className="ministry-rooms__stat-card">
          <div>
            <div className="ministry-rooms__stat-label">Đang bảo trì</div>
            <div className="ministry-rooms__stat-value">{maintenanceRooms}</div>
          </div>
          <div className="ministry-rooms__stat-icon-box">
            <MdBuild size={28} />
          </div>
        </div>
      </div>

      {/* FORM */}
      {/* FORM */}
      {showForm && <div className="ministry-rooms__modal-overlay">
          <div className="ministry-rooms__modal-box">
            {/* HEADER */}
            <div className="ministry-rooms__modal-header">
              <div className="ministry-rooms__form-title">
                {repair ? "Cập nhật phòng học" : "Thêm phòng học mới"}
              </div>

              <button onClick={() => setShowForm(false)} type="button" className="ministry-rooms__close-btn">
              
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ministry-rooms__form-grid">
                <div>
                  <label className="ministry-rooms__label">Mã phòng</label>

                  <input name="classroom_id" value={formData.classroom_id} onChange={handleInputChange} disabled={repair} placeholder="VD: A2-301" required className={`ministry-rooms__input ${repair ? "ministry-rooms__input-disabled" : ""}`} />
                
                </div>

                <div>
                  <label className="ministry-rooms__label">Sức chứa</label>

                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} disabled={isScheduledRepair} required className={`ministry-rooms__input ${isScheduledRepair ? "ministry-rooms__input-disabled" : ""}`} />
                
                </div>

                <div>
                  <label className="ministry-rooms__label">Loại phòng</label>

                  <select name="type" value={formData.type} onChange={handleInputChange} disabled={isScheduledRepair} required className={`ministry-rooms__input ${isScheduledRepair ? "ministry-rooms__input-disabled" : ""}`}>
                  
                    <option value="">-- Chọn loại --</option>
                    <option value="Theory">Theory</option>
                    <option value="Practice">Practice</option>
                  </select>
                </div>

                <div>
                  <label className="ministry-rooms__label">Thiết bị</label>

                  <input name="description" value={formData.description} onChange={handleInputChange} placeholder="Máy chiếu, loa..." required className="ministry-rooms__input" />
                
                </div>

                <div>
                  <label className="ministry-rooms__label">Trạng thái</label>

                  <select name="status" value={formData.status} onChange={handleInputChange} disabled={isScheduledRepair} required className={`ministry-rooms__input ${isScheduledRepair ? "ministry-rooms__input-disabled" : ""}`}>
                  
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="Ready">Ready</option>
                    <option value="Maintaince">Maintaince</option>
                  </select>
                </div>
              </div>

              {isScheduledRepair && <div className="ministry-rooms__locked-notice">
                  Phòng đã được xếp lịch nên không thể đổi sức chứa, loại phòng hoặc trạng thái.
                </div>}

              {/* FOOTER */}
              <div className="ministry-rooms__modal-footer">
                <button type="button" onClick={() => setShowForm(false)} className="ministry-rooms__cancel-btn">

                
                  Hủy
                </button>

                <button type="submit" className="ministry-rooms__submit-btn">
                  {repair ? "Cập nhật dữ liệu" : "Lưu phòng học"}
                </button>
              </div>
            </form>
          </div>
        </div>}

      {/* TABLE */}
      <div className="ministry-rooms__table-wrapper">
        <div className="ministry-rooms__table-header">
          <span className="ministry-rooms__table-title">Danh sách phòng học</span>
          <div className="ministry-rooms__search-wrap">
            <FiSearch size={15} color="#94a3b8" />
            <input value={keyword} onChange={e => {
            setKeyword(e.target.value);
            setPage(1);
          }} placeholder="Tim ma phong, loai, thiet bi, trang thai..." className="ministry-rooms__search-input" />

            
          </div>
        </div>

        <div className="ministry-rooms__inline-364">
          <table className="ministry-rooms__table">
            <thead>
              <tr className="ministry-rooms__thead-row">
                <th className="ministry-rooms__th">STT</th>
                <th className="ministry-rooms__th">MÃ PHÒNG</th>
                <th className="ministry-rooms__th">SỨC CHỨA</th>
                <th className="ministry-rooms__th">LOẠI PHÒNG</th>
                <th className="ministry-rooms__th">THIẾT BỊ</th>
                <th className="ministry-rooms__th">TRẠNG THÁI</th>
                <th className="ministry-rooms__th">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRooms.map((room, index) => <tr key={room.classroom_id} className="ministry-rooms__tbody-row">
                  <td className="ministry-rooms__td">
                    {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                  </td>
                  <td className="ministry-rooms__td ministry-rooms__inline-386">
                    {room.classroom_id}
                  </td>
                  <td className="ministry-rooms__td">{room.capacity} sinh viên</td>
                  <td className="ministry-rooms__td">
                    <span className="ministry-rooms__type-badge">{room.type}</span>
                  </td>
                  <td className="ministry-rooms__td">{room.description}</td>
                  <td className="ministry-rooms__td">
                    <span className={room.status === "Ready" ? "ministry-rooms__ready-badge" : "ministry-rooms__maintenance-badge"}>
                    
                      ● {room.status === "Ready" ? "Ready" : "Maintaince"}
                    </span>
                  </td>
                  <td className="ministry-rooms__td">
                    <div className="ministry-rooms__action-group">
                      <button onClick={() => handleOpenFormUpdate(room)} className="ministry-rooms__edit-btn">
                      
                        <MdEdit size={16} />
                      </button>
                      <button onClick={() => handleDeleteRoom(room)} className="ministry-rooms__delete-btn">
                      
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>

        <div className="ministry-rooms__table-footer">
          <span>
            Hiển thị {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filteredRooms.length)} trên {filteredRooms.length} phòng học
          </span>
          <div className="ministry-rooms__page-controls">
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`ministry-rooms__page-btn ${page === 1 ? "ministry-rooms__page-btn-disabled" : ""}`}>
              
              Trước
            </button>
            <span className="ministry-rooms__page-info">{page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={`ministry-rooms__page-btn ${page === totalPages ? "ministry-rooms__page-btn-disabled" : ""}`}>
              
              Tiếp
            </button>
          </div>
        </div>
      </div>
    </div>;
};

// ==================== STYLES ĐÃ CẬP NHẬT ====================
export default MinistryRooms;
