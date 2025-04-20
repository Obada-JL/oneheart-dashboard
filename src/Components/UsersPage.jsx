import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [modalMode, setModalMode] = useState("add");

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://oneheart.team/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء جلب المستخدمين",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle show modal
  const handleShowModal = (user = {}, mode = "add") => {
    setSelectedUser(user);
    setModalMode(mode);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser({});
  };

  // Handle save user
  const handleSaveUser = async () => {
    // Validate form
    if (!selectedUser.username) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "يرجى إدخال اسم المستخدم",
      });
      return;
    }

    if (modalMode === "add" && !selectedUser.password) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "يرجى إدخال كلمة المرور",
      });
      return;
    }

    setLoading(true);
    try {
      if (modalMode === "add") {
        // Create new user
        await axios.post(
          "https://oneheart.team/api/users",
          selectedUser,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تمت إضافة المستخدم بنجاح",
        });
      } else {
        // Update user
        const userData = { ...selectedUser };
        if (!userData.password) {
          delete userData.password; // Don't send empty password
        }

        await axios.put(
          `https://oneheart.team/api/users/${selectedUser._id}`,
          userData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        Swal.fire({
          icon: "success",
          title: "تم",
          text: "تم تحديث المستخدم بنجاح",
        });
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "حدث خطأ أثناء حفظ المستخدم",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await axios.delete(`https://oneheart.team/api/users/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          Swal.fire({
            icon: "success",
            title: "تم",
            text: "تم حذف المستخدم بنجاح",
          });
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء حذف المستخدم",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="container py-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>إدارة المستخدمين</h2>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة مستخدم جديد
        </Button>
      </div>

      {loading && !showModal ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table hover className="align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>اسم المستخدم</th>
              <th>الدور</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.role === "admin" ? "مدير" : user.role}</td>
                <td>{new Date(user.createdAt).toLocaleDateString("ar-EG")}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleShowModal(user, "edit")}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      حذف
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={handleCloseModal} dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة مستخدم جديد" : "تعديل المستخدم"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>اسم المستخدم</Form.Label>
              <Form.Control
                type="text"
                value={selectedUser.username || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, username: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {modalMode === "add" ? "كلمة المرور" : "كلمة المرور (اتركها فارغة للاحتفاظ بالحالية)"}
              </Form.Label>
              <Form.Control
                type="password"
                value={selectedUser.password || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, password: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الدور</Form.Label>
              <Form.Select
                value={selectedUser.role || "user"}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
              >
                <option value="admin">مدير</option>
                <option value="user">مستخدم</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveUser}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                جاري الحفظ...
              </>
            ) : (
              "حفظ"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersPage; 