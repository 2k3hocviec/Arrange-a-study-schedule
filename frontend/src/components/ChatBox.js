import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { RiRobot2Line } from "react-icons/ri";
import ReactMarkdown from "react-markdown";

const ChatBox = ({ studentInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Xin chào! 👋 Tôi là AI Advisor, có thể giúp bạn với việc đăng ký môn học. Bạn cần hỗ trợ gì?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!studentInfo || !studentInfo.student_id) {
      toast.error("Chưa lấy được thông tin sinh viên");
      return;
    }

    // Add user message
    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chatbot/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: input,
          studentId: studentInfo.student_id,
          history: messages
            .slice(1) // Bỏ initial greeting (messages[0])
            .map((msg) => ({
              role: msg.type === "user" ? "user" : "model",
              parts: [{ text: msg.text }],
            })),
        }),
      });

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (!response.ok) {
        console.error("Lỗi:", data);
        return;
      }

      // Lấy reply từ data
      console.log("Reply:", data.reply);

      if (data.success) {
        const botMessage = { type: "bot", text: data.reply };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        toast.error("Không thể nhận phản hồi từ AI");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Lỗi khi gửi tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          color: "white",
          fontSize: "28px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          transform: isOpen ? "scale(0.9)" : "scale(1)",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = isOpen ? "scale(0.85)" : "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = isOpen ? "scale(0.9)" : "scale(1)";
        }}
        title="Chat với AI Advisor"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "420px",
            height: "600px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 5px 40px rgba(0, 0, 0, 0.16)",
            display: "flex",
            flexDirection: "column",
            zIndex: 998,
            animation: "slideUp 0.3s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "20px",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                <RiRobot2Line /> AI Advisor
              </h3>
              <p
                style={{
                  margin: "5px 0 0 0",
                  fontSize: "12px",
                  opacity: 0.9,
                }}
              >
                Trợ lý đăng ký môn học
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "20px",
                cursor: "pointer",
                padding: "0",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              background: "#f7f7f7",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.type === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius:
                      msg.type === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.type === "user"
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "#e8e8e8",
                    color: msg.type === "user" ? "white" : "#333",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    wordWrap: "break-word",
                  }}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "18px",
                    background: "#e8e8e8",
                    color: "#333",
                  }}
                >
                  <span
                    style={{
                      animation: "blink 1.4s infinite",
                    }}
                  >
                    ⏳ Đang suy nghĩ...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              gap: "8px",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Viết câu hỏi của bạn..."
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: "20px",
                fontSize: "14px",
                fontFamily: "Arial, sans-serif",
                resize: "none",
                maxHeight: "80px",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#667eea";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ddd";
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background:
                  !loading && input.trim()
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#ccc",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: !loading && input.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Gửi"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blink {
          0%, 20%, 50%, 80%, 100% {
            opacity: 1;
          }
          40% {
            opacity: 0.5;
          }
          60% {
            opacity: 0.7;
          }
        }

        /* Custom scrollbar */
        div[style*="overflow-y: auto"]::-webkit-scrollbar {
          width: 6px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
