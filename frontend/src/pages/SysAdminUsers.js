import React, { useEffect, useState } from "react";
import { usersAPI } from "../services/api";
import toast from "react-hot-toast";
import { FaUserAlt } from "react-icons/fa";

const SysAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [repair, setRepair] = useState(false);
  const [idUpdate, setIdUpdate] = useState(0);
  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll(`?_t=${Date.now()}`);
      setUsers(response.data);
    } catch (error) {
      toast.error("Don't load sucess data");
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
    phone: "",
    address: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("The data cannot be blank.");
      return;
    }

    try {
      await usersAPI.create(formData);
      setFormData({
        email: "",
        password: "",
        role: "student",
        phone: "",
        address: "",
      });
      setShowForm(false);
      await fetchUsers();
      window.location.reload();
      toast.success("Create user success!");
    } catch (err) {
      console.log(err);
      toast.error("Create user false!");
    }
  };

  function handleClickCreateUser() {
    setShowForm(!showForm);
  }

  const handleDeleteUser = async (id) => {
    try {
      console.log(id);
      await usersAPI.delete(id);
      await fetchUsers();
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Xóa thất bại!");
    }
  };

  const handleOpenFormUpdateUser = async (id) => {
    setRepair(!repair);
    setShowForm(!showForm);
    setIdUpdate(id);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("The data cannot be blank.");
      return;
    }

    try {
      await usersAPI.update(idUpdate, formData);
      setFormData({
        email: "",
        password: "",
        role: "student",
        phone: "",
        address: "",
      });
      setShowForm(!showForm);
      setRepair(!repair);
      await fetchUsers();
      window.location.reload();
      toast.success("Update user success!");
    } catch (err) {
      console.log(err);
      toast.error("Update user false!");
    }
  };

  return (
    <div>
      <h2>
        <FaUserAlt /> QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG
      </h2>
      <button
        style={{
          marginBottom: "20px",
          padding: "10px",
          background: "#2ecc71",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleClickCreateUser}
      >
        + Thêm người dùng mới
      </button>

      {showForm && (
        <form
          onSubmit={repair ? handleSubmitUpdate : handleSubmit}
          style={{
            marginBottom: "30px",
            border: "1px solid #ccc",
            padding: "20px",
          }}
        >
          <h3>{repair ? "Cập nhật lại User" : "Tạo User Mới"} </h3>
          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Email: </label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Password: </label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Role: </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="sysadmin">System Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Phone: </label>
            <input
              type="tel"
              name="phone"
              placeholder="0123456789"
              value={formData.phone}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px", marginRight: "20px" }}>
            <label>Address: </label>
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: "10px 20px", cursor: "pointer" }}
          >
            {repair ? "Cập nhật User" : "Tạo User"}
          </button>
        </form>
      )}

      <table
        border="1"
        style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
      >
        <thead style={{ background: "#243fc5", color: "white" }}>
          <tr>
            <th style={{ padding: "12px 0px 12px 12px" }}>ID</th>
            <th>Email</th>
            <th>Password</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Function</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ border: "1px solid #eee" }}>
              <td style={{ padding: "12px 0px 12px 12px" }}>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.password}</td>
              <td>{user.role}</td>
              <td>{user.phone}</td>
              <td>{user.address}</td>
              <td>
                <button
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOpenFormUpdateUser(user.id)}
                >
                  Sửa
                </button>
                <button
                  style={{ color: "red", cursor: "pointer" }}
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default SysAdminUsers;
