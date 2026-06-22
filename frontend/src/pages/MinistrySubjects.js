import React, { useEffect, useState } from "react";
import { majorsAPI, subjectsAPI } from "../services/api";
import toast from "react-hot-toast";
import { MdMenuBook } from "react-icons/md";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import "../styles/MinistrySubjects.css";
const PAGE_SIZE = 5;
const getSubjectErrorMessage = (err, action = "save") => {
  const rawMessage = err?.response?.data?.message || err?.message || "";
  const message = Array.isArray(rawMessage) ? rawMessage.join(" ") : String(rawMessage);
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("cannot delete subject that has courses")) {
    return "Không thể xóa môn học vì đã có khóa học thuộc môn này.";
  }
  if (lowerMessage.includes("unique") || lowerMessage.includes("duplicate")) {
    return "Mã môn học đã tồn tại. Vui lòng kiểm tra lại.";
  }
  if (action === "delete") return "Không thể xóa môn học.";
  return "Thao tác thất bại. Vui lòng kiểm tra lại dữ liệu.";
};
const MinistrySubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [majors, setMajors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [repair, setRepair] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState({
    subject_id: "",
    name: "",
    credits: 0,
    major_id: "",
    allow_same_major: false,
    allow_same_department: false
  });
  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      setSubjects(response.data);
    } catch (e) {
      toast.error("Không thể tải dữ liệu môn học");
    }
  };
  const fetchMajors = async () => {
    try {
      const response = await majorsAPI.getAll();
      setMajors(response.data || []);
    } catch (e) {
      toast.error("Không thể tải danh sách chuyên ngành");
    }
  };
  useEffect(() => {
    fetchSubjects();
    fetchMajors();
  }, []);
  const handleInputChange = e => {
    const {
      name,
      value,
      checked,
      type
    } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : name === "credits" ? Number(value) : value
    });
  };
  const handleClickCreateSubject = () => {
    setFormData({
      subject_id: "",
      name: "",
      credits: 0,
      major_id: "",
      allow_same_major: false,
      allow_same_department: false
    });
    setRepair(false);
    setShowForm(!showForm);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.subject_id || !formData.name || formData.credits === 0 || !formData.major_id) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await subjectsAPI.create(formData);
      setFormData({
        subject_id: "",
        name: "",
        credits: 0,
        major_id: "",
        allow_same_major: false,
        allow_same_department: false
      });
      setShowForm(false);
      await fetchSubjects();
      toast.success("Tạo môn học thành công!");
    } catch (err) {
      toast.error(getSubjectErrorMessage(err));
    }
  };
  const handleSubmitUpdate = async e => {
    e.preventDefault();
    if (!formData.subject_id || !formData.name || formData.credits === 0 || !formData.major_id) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      await subjectsAPI.update(formData.subject_id, formData);
      setFormData({
        subject_id: "",
        name: "",
        credits: 0,
        major_id: "",
        allow_same_major: false,
        allow_same_department: false
      });
      setShowForm(false);
      setRepair(false);
      await fetchSubjects();
      toast.success("Cập nhật môn học thành công!");
    } catch (err) {
      toast.error(getSubjectErrorMessage(err));
    }
  };
  const handleOpenFormUpdateSubject = subject => {
    setFormData(subject);
    setRepair(true);
    setShowForm(true);
  };
  const handleDeleteSubject = async subject => {
    if (!window.confirm(`Bạn có chắc muốn xóa môn học ${subject.subject_id} - ${subject.name}?`)) {
      return;
    }
    try {
      await subjectsAPI.delete(subject.subject_id);
      await fetchSubjects();
      toast.success("Xóa môn học thành công!");
    } catch (err) {
      toast.error(getSubjectErrorMessage(err, "delete"));
    }
  };
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredSubjects = normalizedKeyword ? subjects.filter(subject => [subject.subject_id, subject.name, subject.credits, subject.major_id, subject.major?.name, subject.major?.department_id, subject.major?.department?.name, subject.allow_same_major ? "same major cung nganh" : "public", subject.allow_same_department ? "same department cung khoa" : "public"].filter(value => value !== undefined && value !== null).join(" ").toLowerCase().includes(normalizedKeyword)) : subjects;
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / PAGE_SIZE));
  const paginatedSubjects = filteredSubjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <div className="ministry-subjects__page-wrapper">
      {/* BREADCRUMB */}
      <div className="ministry-subjects__breadcrumb">
        <span className="ministry-subjects__breadcrumb-home">Dashboard</span>
        <span className="ministry-subjects__breadcrumb-sep">/</span>
        <span className="ministry-subjects__breadcrumb-current">QUẢN LÝ MÔN HỌC</span>
      </div>

      {/* PAGE HEADER */}
      <div className="ministry-subjects__page-header">
        <div className="ministry-subjects__page-header-left">
          <div>
            <h1 className="ministry-subjects__page-title">QUẢN LÝ DANH SÁCH MÔN HỌC</h1>
          </div>
        </div>
        <button onClick={handleClickCreateSubject} className="ministry-subjects__add-btn">
          <FiPlus size={16} />
          {showForm ? "Đóng Form" : "Thêm môn học mới"}
        </button>
      </div>

      {/* STAT BANNER */}
      <div className="ministry-subjects__stat-banner">
        <div className="ministry-subjects__stat-banner-inner">
          <div>
            <p className="ministry-subjects__stat-label">Tổng số môn học</p>
            <p className="ministry-subjects__stat-number">{subjects.length}</p>
          </div>
          <div className="ministry-subjects__banner-icon-bg">
            <MdMenuBook size={48} color="rgba(255,255,255,0.25)" />
          </div>
        </div>
      </div>

      {/* FORM */}
      {/* MODAL FORM */}
      {showForm && <div style={modalOverlay}>
          <div style={modalContainer}>
            <div className="ministry-subjects__form-card">
              <h3 className="ministry-subjects__form-title">
                {repair ? "Cập nhật môn học" : "Thêm môn học mới"}
              </h3>

              <form onSubmit={repair ? handleSubmitUpdate : handleSubmit}>
                <div className="ministry-subjects__form-grid">
                  <div className="ministry-subjects__field-group">
                    <label className="ministry-subjects__field-label">Mã Môn Học</label>

                    <input type="text" name="subject_id" placeholder="Nhập mã môn (VD: INT1306)" value={formData.subject_id} onChange={handleInputChange} required disabled={repair} style={{
                  ...(repair ? {
                    background: "#f1f5f9",
                    cursor: "not-allowed",
                    color: "#94a3b8"
                  } : {})
                }} className="ministry-subjects__field-input" />
                  
                  </div>

                  <div className="ministry-subjects__field-group">
                    <label className="ministry-subjects__field-label">Tên Môn Học</label>

                    <input type="text" name="name" placeholder="Nhập tên môn học" value={formData.name} onChange={handleInputChange} required className="ministry-subjects__field-input" />

                  
                  </div>

                  <div className="ministry-subjects__field-group">
                    <label className="ministry-subjects__field-label">Số Tín Chỉ</label>

                    <input type="number" name="credits" placeholder="Nhập số tín chỉ" value={formData.credits} onChange={handleInputChange} required min="1" max="10" className="ministry-subjects__field-input" />

                  
                  </div>
                  <div className="ministry-subjects__field-group">
                    <label className="ministry-subjects__field-label">Chuyên ngành</label>
                    <select name="major_id" value={formData.major_id || ""} onChange={handleInputChange} required className="ministry-subjects__field-input">

                    
                      <option value="">-- Chọn chuyên ngành --</option>
                      {majors.map(major => <option key={major.major_id} value={major.major_id}>
                          {major.major_id} - {major.name}
                        </option>)}
                    </select>
                  </div>

                  <label className="ministry-subjects__field-group ministry-subjects__inline-319">







                  
                    <input type="checkbox" name="allow_same_major" checked={!!formData.allow_same_major} onChange={handleInputChange} />
                  
                    Cho phép cùng chuyên ngành đăng ký
                  </label>

                  <label className="ministry-subjects__field-group ministry-subjects__inline-337">







                  
                    <input type="checkbox" name="allow_same_department" checked={!!formData.allow_same_department} onChange={handleInputChange} />
                  
                    Cho phép cùng khoa đăng ký
                  </label>
                </div>

                <div className="ministry-subjects__inline-356">





                
                  <button type="submit" style={{
                background: repair ? "#4f46e5" : "#16a34a"
              }} className="ministry-subjects__submit-btn ministry-subjects__inline-363">
                  
                    {repair ? "Cập nhật Môn Học" : "Tạo Môn Học"}
                  </button>

                  <button type="button" onClick={() => {
                setShowForm(false);
                setRepair(false);
              }} className="ministry-subjects__cancel-btn">

                  
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>}
      {/* TABLE */}
      <div className="ministry-subjects__table-card">
        <div className="ministry-subjects__table-header">
          <h3 className="ministry-subjects__table-title">Danh sách môn học hiện tại</h3>
          <div className="ministry-subjects__search-wrap">
            <FiSearch size={15} color="#94a3b8" />
            <input value={keyword} onChange={e => {
            setKeyword(e.target.value);
            setPage(1);
          }} placeholder="Tim ma mon, ten mon, khoa, chuyen nganh..." className="ministry-subjects__search-input" />

            
          </div>
        </div>

        <div className="ministry-subjects__inline-408">
          <table className="ministry-subjects__table">
            <thead>
              <tr className="ministry-subjects__thead-row">
                <th className="ministry-subjects__th">STT</th>
                <th className="ministry-subjects__th">MÃ MÔN</th>
                <th className="ministry-subjects__th">TÊN MÔN HỌC</th>
                <th className="ministry-subjects__th">SỐ TÍN CHỈ</th>
                <th className="ministry-subjects__th">CHUYÊN NGÀNH</th>
                <th className="ministry-subjects__th">KHOA</th>
                <th className="ministry-subjects__th">CÙNG NGÀNH</th>
                <th className="ministry-subjects__th">CÙNG KHOA</th>
                <th className="ministry-subjects__th">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubjects.map((subject, index) => <tr key={subject.subject_id} className="ministry-subjects__tbody-row">
                  <td className="ministry-subjects__td ministry-subjects__inline-426">
                    {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                  </td>
                  <td className="ministry-subjects__td ministry-subjects__inline-432">
                    {subject.subject_id}
                  </td>
                  <td className="ministry-subjects__td">{subject.name}</td>
                  <td className="ministry-subjects__td">
                    <span className="ministry-subjects__credit-badge">{subject.credits}</span>
                  </td>
                  <td className="ministry-subjects__td">
                    {subject.major ? `${subject.major.major_id} - ${subject.major.name}` : subject.major_id || "-"}
                  </td>
                  <td className="ministry-subjects__td">
                    {subject.major?.department ? `${subject.major.department.department_id} - ${subject.major.department.name}` : "-"}
                  </td>
                  <td className="ministry-subjects__td">
                    {subject.allow_same_major ? "Có" : "Không"}
                  </td>
                  <td className="ministry-subjects__td">
                    {subject.allow_same_department ? "Có" : "Không"}
                  </td>
                  <td className="ministry-subjects__td ministry-subjects__inline-455">
                    <button onClick={() => handleOpenFormUpdateSubject(subject)} className="ministry-subjects__edit-btn">

                    
                      <FiEdit2 size={13} /> Sửa
                    </button>
                    <button onClick={() => handleDeleteSubject(subject)} className="ministry-subjects__delete-btn">

                    
                      <FiTrash2 size={13} /> Xóa
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>

        {filteredSubjects.length > 0 && <div className="ministry-subjects__table-footer">
            <span className="ministry-subjects__inline-477">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredSubjects.length)} trên{" "}
              {filteredSubjects.length} môn học
            </span>
            <div className="ministry-subjects__page-controls">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={"ministry-subjects__page-btn" + (page === 1 ? " ministry-subjects__page-btn-disabled" : "")}>
              
                Trước
              </button>
              <span className="ministry-subjects__page-info">
                {page} / {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={"ministry-subjects__page-btn" + (page === totalPages ? " ministry-subjects__page-btn-disabled" : "")}>
              
                Tiếp
              </button>
            </div>
          </div>}
      </div>
    </div>;
};

// STYLES

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
  padding: "20px"
};
const modalContainer = {
  width: "100%",
  maxWidth: "700px",
  animation: "fadeIn 0.2s ease"
};
export default MinistrySubjects;
