import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import Swal from "sweetalert2";

const ProfilePage = () => {
  const [user, setUser] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      
      console.log("Fetching profile for user ID:", userId);

      if (!token || !userId) {
        setError("لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.");
        setLoading(false);
        return;
      }

      // Try to get user info from stored user object first
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.username) {
            setUser({
              _id: parsedUser.id,
              username: parsedUser.username,
              role: parsedUser.role,
              newPassword: "",
              confirmPassword: "",
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }

      // If we couldn't get from stored user, try API
      const response = await axios.get(`https://oneheart.team/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({
        ...response.data,
        newPassword: "",
        confirmPassword: "",
      });
      
      // Store username in localStorage for NavBar to use if API fails
      localStorage.setItem("username", response.data.username);
      
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("حدث خطأ أثناء جلب بيانات الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Reset messages
    setError("");
    setSuccess("");

    // Check if username is provided
    if (!user.username.trim()) {
      setError("يرجى إدخال اسم المستخدم");
      return false;
    }

    // If new password is provided, check if it matches confirmation
    if (user.newPassword) {
      if (user.newPassword.length < 6) {
        setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
        return false;
      }

      if (user.newPassword !== user.confirmPassword) {
        setError("كلمات المرور غير متطابقة");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setError("لم يتم العثور على بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.");
        setSaving(false);
        return;
      }

      console.log("Updating user with ID:", userId);

      // Prepare update data
      const updateData = {
        username: user.username,
      };

      // Only include password if a new one is provided
      if (user.newPassword) {
        updateData.password = user.newPassword;
      }

      await axios.put(
        `https://oneheart.team/api/users/${userId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update localStorage with new username
      localStorage.setItem("username", user.username);
      
      // Update the stored user object
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.username = user.username;
          localStorage.setItem("user", JSON.stringify(parsedUser));
        } catch (e) {
          console.error("Error updating stored user:", e);
        }
      }

      setSuccess("تم تحديث الملف الشخصي بنجاح");
      
      // Reset password fields
      setUser({
        ...user,
        newPassword: "",
        confirmPassword: "",
      });

      Swal.fire({
        icon: "success",
        title: "تم",
        text: "تم تحديث الملف الشخصي بنجاح",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.message || "حدث خطأ أثناء تحديث الملف الشخصي");
      
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "حدث خطأ أثناء تحديث الملف الشخصي",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container py-5" dir="rtl">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">الملف الشخصي</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم المستخدم</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={user.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>الدور</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.role === "admin" ? "مدير" : "مستخدم"}
                    disabled
                    className="bg-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>كلمة المرور الجديدة (اتركها فارغة إذا لم ترغب في تغييرها)</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={user.newPassword}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    يجب أن تكون كلمة المرور 6 أحرف على الأقل
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>تأكيد كلمة المرور الجديدة</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={user.confirmPassword}
                    onChange={handleChange}
                    disabled={!user.newPassword}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? (
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
                      "حفظ التغييرات"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 