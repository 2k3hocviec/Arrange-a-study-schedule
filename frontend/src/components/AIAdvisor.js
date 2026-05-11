import React, { useMemo } from "react";
import {
  availableCourses,
  MAX_CREDITS,
  hasTimeConflict,
  formatTime,
} from "../pages/studentData";

const AIAdvisor = ({ registeredIds = [] }) => {
  const registeredCourses = useMemo(
    () =>
      availableCourses.filter((course) => registeredIds.includes(course.id)),
    [registeredIds],
  );

  const analysis = useMemo(() => {
    const totalCredits = registeredCourses.reduce(
      (sum, c) => sum + c.credits,
      0,
    );
    const remainingCredits = MAX_CREDITS - totalCredits;

    // Các môn còn có thể đăng ký
    const availableToRegister = availableCourses.filter((course) => {
      if (registeredIds.includes(course.id)) return false;
      if (course.registered >= course.capacity) return false;
      if (hasTimeConflict(course, registeredCourses)) return false;
      if (course.credits > remainingCredits) return false;
      return true;
    });

    // Các môn bị chặn vì lý do gì
    const blockedCourses = availableCourses
      .filter((course) => {
        if (registeredIds.includes(course.id)) return false;
        return true;
      })
      .map((course) => {
        let reason = "";
        if (course.registered >= course.capacity) reason = "Lớp đã hết chỗ";
        else if (hasTimeConflict(course, registeredCourses))
          reason = "Trùng giờ học";
        else if (course.credits > remainingCredits)
          reason = `Thiếu ${course.credits - remainingCredits} tín chỉ`;

        return reason ? { course, reason } : null;
      })
      .filter(Boolean);

    // Đề xuất tối ưu
    const recommendations = availableToRegister
      .sort((a, b) => {
        // Ưu tiên: chỗ ít, tín chỉ cao
        const aScore = (a.capacity - a.registered) / a.credits;
        const bScore = (b.capacity - b.registered) / b.credits;
        return bScore - aScore;
      })
      .slice(0, 3);

    // Nhận xét lịch
    let scheduleComment = "";
    if (totalCredits === 0) {
      scheduleComment =
        "📚 Bạn chưa đăng ký môn nào. Hãy bắt đầu đăng ký để có lịch học hợp lý!";
    } else if (totalCredits < 12) {
      scheduleComment = `📊 Bạn mới đăng ký ${totalCredits} tín chỉ, nên thêm một số môn để có lịch cân bằng.`;
    } else if (totalCredits >= MAX_CREDITS - 2) {
      scheduleComment = `⚠️ Bạn gần đạt tối đa tín chỉ (${totalCredits}/${MAX_CREDITS}). Chỉ còn ${remainingCredits} tín chỉ!`;
    } else {
      scheduleComment = `✅ Lịch học của bạn cân bằng. Còn ${remainingCredits} tín chỉ để đăng ký.`;
    }

    return {
      totalCredits,
      remainingCredits,
      registeredCount: registeredCourses.length,
      availableToRegister,
      blockedCourses,
      recommendations,
      scheduleComment,
    };
  }, [registeredIds]);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px",
        boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "15px",
        }}
      >
        <span style={{ fontSize: "24px" }}>🤖</span>
        <h3 style={{ margin: 0, fontSize: "20px" }}>
          AI Advisor - Trợ Lý Đăng Ký
        </h3>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "15px",
          borderLeft: "4px solid #ffd700",
        }}
      >
        <p style={{ margin: "0 0 10px 0", fontSize: "15px", lineHeight: 1.6 }}>
          {analysis.scheduleComment}
        </p>
        <div style={{ display: "flex", gap: "15px", fontSize: "14px" }}>
          <span>
            📌 Đã đăng ký: <strong>{analysis.registeredCount} môn</strong>
          </span>
          <span>
            🎓 Tín chỉ:{" "}
            <strong>
              {analysis.totalCredits}/{MAX_CREDITS}
            </strong>
          </span>
          <span>
            ✨ Còn lại: <strong>{analysis.remainingCredits}</strong>
          </span>
        </div>
      </div>

      {analysis.recommendations.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <h4
            style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#ffd700" }}
          >
            💡 Đề xuất cho bạn:
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {analysis.recommendations.map((course) => (
              <div
                key={course.id}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  {course.id} - {course.name}
                </div>
                <div style={{ fontSize: "13px", color: "#e0e0e0" }}>
                  🕐 {formatTime(course)} | 👨‍🏫 {course.teacher} | 📍{" "}
                  {course.room}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#ffeb3b",
                    marginTop: "4px",
                  }}
                >
                  ⭐ {course.credits} tín chỉ | 📊 Còn{" "}
                  {course.capacity - course.registered}/{course.capacity} chỗ
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.blockedCourses.length > 0 && (
        <div>
          <h4
            style={{ margin: "0 0 10px 0", fontSize: "15px", color: "#ff6b6b" }}
          >
            ⛔ Các môn không thể đăng ký:
          </h4>
          <div
            style={{
              fontSize: "13px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {analysis.blockedCourses.slice(0, 3).map(({ course, reason }) => (
              <div key={course.id} style={{ opacity: 0.9 }}>
                <strong>{course.id}</strong> - {course.name}
                <span style={{ color: "#ff6b6b", marginLeft: "8px" }}>
                  ❌ {reason}
                </span>
              </div>
            ))}
            {analysis.blockedCourses.length > 3 && (
              <div style={{ fontSize: "12px", color: "#ffd700" }}>
                ... và {analysis.blockedCourses.length - 3} môn khác
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
