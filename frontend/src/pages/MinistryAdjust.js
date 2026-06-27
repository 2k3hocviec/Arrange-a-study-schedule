import React from "react";
import "../styles/MinistryAdjust.css";
const MinistryAdjust = () => {
  return <div>
      <h2>🛠️ ĐIỀU CHỈNH LỊCH HỌC (MẪU BMCL)</h2>
      <div className="ministry-adjust__inline-7">

        
        <div className="ministry-adjust__inline-10">





          
          <input type="text" placeholder="Mã lớp học" className="ministry-adjust__input" />
          <input type="text" placeholder="Giảng viên thay thế" className="ministry-adjust__input" />

          
          <input type="text" placeholder="Phòng học mới" className="ministry-adjust__input" />
          <input type="date" placeholder="Ngày học mới" className="ministry-adjust__input" />
        </div>
        <button className="ministry-adjust__inline-26">







          
          Cập nhật lịch học
        </button>
      </div>
    </div>;
};
export default MinistryAdjust;
