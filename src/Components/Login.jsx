import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/OneHeart team logo  EN PNG.png";
import { Form, Button, Container, Card, Alert, Row, Col, InputGroup } from "react-bootstrap";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        "http://localhost:3500/api/auth/login",
        {
          username,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.location.href = "/";
    } catch (error) {
      setError(error.response?.data?.message || "حدث خطأ في تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <Container
        className="d-flex align-items-center justify-content-center min-vh-100"
        dir="rtl"
      >
        <Row className="w-100 justify-content-center">
          <Col xs={12} md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0 rounded-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <img 
                    src={Logo} 
                    alt="OneHeart Logo" 
                    className="mb-4" 
                    style={{ width: "150px" }} 
                  />
                  <h2 className="fw-bold mb-3">مرحباً بك في لوحة التحكم</h2>
                  <p className="text-muted">الرجاء إدخال بيانات الدخول للمتابعة</p>
                </div>
                
                {error && (
                  <Alert variant="danger" className="text-center">
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">اسم المستخدم</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light">
                        <FaUser />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="أدخل اسم المستخدم"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="py-2"
                      />
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">كلمة المرور</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light">
                        <FaLock />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="py-2"
                      />
                      <Button 
                        variant="light" 
                        onClick={togglePasswordVisibility}
                        className="border"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 mt-3 fw-bold"
                    disabled={loading}
                    style={{ 
                      background: 'linear-gradient(to right, #47a896, #3a8a7a)',
                      border: 'none'
                    }}
                  >
                    {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </Form>
                
                <div className="text-center mt-4">
                  <p className="text-muted small">
                    © {new Date().getFullYear()} One Heart. جميع الحقوق محفوظة
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
