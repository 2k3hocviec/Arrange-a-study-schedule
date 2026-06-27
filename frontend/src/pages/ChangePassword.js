import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
import "../styles/ChangePassword.css";
const StudentChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      await authAPI.changePassword(formData.currentPassword, formData.newPassword);
      toast.success("Đổi mật khẩu thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại!");
    }
  };
  return <div className="change-password__inline-47">








      
      <h2 className="change-password__inline-57">





        
        ĐỔI MẬT KHẨU
      </h2>

      <p className="change-password__inline-67">





        
        Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="change-password__inline-78">
          <label className="change-password__inline-79">






            
            Mật khẩu hiện tại
          </label>

          <div className="change-password__inline-90">
            <input type={showPassword.current ? "text" : "password"} name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Nhập mật khẩu hiện tại" required className="change-password__inline-91" />








            

            <button type="button" onClick={() => setShowPassword({
            ...showPassword,
            current: !showPassword.current
          })} className="change-password__inline-108">










              
              {showPassword.current ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="change-password__inline-132">
          <label className="change-password__inline-133">






            
            Mật khẩu mới
          </label>

          <div className="change-password__inline-144">
            <input type={showPassword.new ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Nhập mật khẩu mới" required className="change-password__inline-145" />








            

            <button type="button" onClick={() => setShowPassword({
            ...showPassword,
            new: !showPassword.new
          })} className="change-password__inline-162">










              
              {showPassword.new ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="change-password__inline-186">
          <label className="change-password__inline-187">






            
            Xác nhận mật khẩu mới
          </label>

          <div className="change-password__inline-198">
            <input type={showPassword.confirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu mới" required className="change-password__inline-199" />








            

            <button type="button" onClick={() => setShowPassword({
            ...showPassword,
            confirm: !showPassword.confirm
          })} className="change-password__inline-216">










              
              {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button type="submit" onMouseOver={e => {
        e.target.style.background = "#2980b9";
      }} onMouseOut={e => {
        e.target.style.background = "#3498db";
      }} className="change-password__inline-240">
          
          ĐỔI MẬT KHẨU
        </button>
      </form>
    </div>;
};
export default StudentChangePassword;
