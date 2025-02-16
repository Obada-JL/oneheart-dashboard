import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../assets/OneHeart team logo  EN PNG.png";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center min-vh-100"
      dir="rtl"
    >
      <Card style={{ width: "400px" }}>
        <div className="d-flex justify-content-center">
          <img src={Logo} alt="OneHeart Logo" width={100} />
        </div>
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">تسجيل الدخول</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>اسم المستخدم</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              دخول
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
