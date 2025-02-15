import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404</h1>
      <p style={styles.message}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <button style={styles.button} onClick={() => navigate("/")}>
        Go Back Home
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily: "'Arial', sans-serif",
    textAlign: "center",
  },
  heading: {
    fontSize: "10rem",
    fontWeight: "bold",
    margin: 0,
    color: "#343a40",
  },
  message: {
    fontSize: "1.5rem",
    color: "#6c757d",
    margin: "1rem 0",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

export default NotFound;
