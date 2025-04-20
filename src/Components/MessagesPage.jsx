import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://oneheart.team/api/messages");
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "حدث خطأ أثناء تحميل الرسائل",
        confirmButtonText: "حسناً",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDeleteMessage = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الرسالة نهائياً",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://oneheart.team/api/messages/${id}`);
        Swal.fire({
          icon: "success",
          title: "تم الحذف!",
          text: "تم حذف الرسالة بنجاح",
          confirmButtonText: "حسناً",
        });
        fetchMessages();
      } catch (error) {
        console.error("Error deleting message:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: "حدث خطأ أثناء حذف الرسالة",
          confirmButtonText: "حسناً",
        });
      }
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    try {
      await axios.put(`https://oneheart.team/api/messages/${id}`, {
        isRead: !isRead,
      });

      // Add success alert
      Swal.fire({
        icon: "success",
        title: "تم بنجاح!",
        text: isRead
          ? "تم تحديد الرسالة كغير مقروءة"
          : "تم تحديد الرسالة كمقروءة",
        confirmButtonText: "حسناً",
      });

      // Refresh messages list after update
      fetchMessages();
    } catch (error) {
      console.error("Error updating message status:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "حدث خطأ أثناء تحديث حالة الرسالة",
        confirmButtonText: "حسناً",
      });
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <h1 className="fw-bold mb-4">الرسائل</h1>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">جاري التحميل...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>الحالة</th>
                <th>اسم المرسل</th>
                <th>البريد الإلكتروني</th>
                <th>الرسالة</th>
                <th>اللغة</th>
                <th>التاريخ</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr
                  key={message._id}
                  className={!message.isRead ? "table-light" : ""}
                >
                  <td>
                    <Button
                      variant={
                        message.isRead ? "outline-secondary" : "outline-primary"
                      }
                      size="sm"
                      onClick={() =>
                        handleMarkAsRead(message._id, message.isRead)
                      }
                    >
                      {message.isRead ? "مقروءة" : "غير مقروءة"}
                    </Button>
                  </td>
                  <td>{message.senderName}</td>
                  <td>
                    <a href={`mailto:${message.senderEmail}`}>
                      {message.senderEmail}
                    </a>
                  </td>
                  <td>{message.recievedMessage}</td>
                  <td>{message.language === "ar" ? "العربية" : "English"}</td>
                  <td dir="rtl">{formatDateTime(message.timestamp)}</td>
                  <td>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteMessage(message._id)}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {messages.length === 0 && (
            <div className="text-center p-4">
              <p className="text-muted">لا توجد رسائل</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
