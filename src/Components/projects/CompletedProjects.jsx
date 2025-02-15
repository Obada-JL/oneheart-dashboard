import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

export default function CompletedProjects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3500/api/completed-projects"
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleShowModal = (project = {}, mode = "add") => {
    setSelectedProject(project);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProject({});
  };

  const handleSaveProject = async () => {
    setLoading(true);
    const formData = new FormData();

    try {
      // Validate required fields
      if (
        !selectedProject.title ||
        !selectedProject.image ||
        !selectedProject.category
      ) {
        alert("الصورة والعنوان والتصنيف مطلوبة");
        setLoading(false);
        return;
      }

      formData.append("title", selectedProject.title);
      formData.append("category", selectedProject.category); // Add category to formData

      if (selectedProject.image instanceof File) {
        formData.append("image", selectedProject.image);
      }

      // Details fields
      const details = {
        fund: selectedProject.fund || "",
        location: selectedProject.location || "",
        duration: selectedProject.duration || "",
        Beneficiary: selectedProject.Beneficiary || "",
      };

      formData.append("details", JSON.stringify([details]));

      if (modalMode === "add") {
        await axios.post(
          "http://localhost:3500/api/completed-projects",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.put(
          `http://localhost:3500/api/completed-projects/${selectedProject._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }
      fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving project:", error);
      alert(error.response?.data?.message || "حدث خطأ أثناء حفظ المشروع");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
      setLoading(true);
      try {
        await axios.delete(
          `http://localhost:3500/api/completed-projects/${id}`
        );
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShowViewModal = (project) => {
    setViewProject(project);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewProject(null);
  };

  return (
    <div className="p-4 bg-light " dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">المشاريع المنجزة</h1>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة مشروع جديد
        </Button>
      </div>

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
                <th>الصورة</th>
                <th>العنوان</th>
                <th>التصنيف</th>
                <th>التمويل</th>
                <th>الموقع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>
                    <img
                      src={`http://localhost:3500/uploads/completed-projects/${project.image}`}
                      alt={project.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>{project.title}</td>
                  <td>{project.category}</td>
                  <td>{project.details[0]?.fund}</td>
                  <td>{project.details[0]?.location}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleShowViewModal(project)}
                      >
                        عرض
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleShowModal(project, "edit")}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProject(project._id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة مشروع جديد" : "تعديل المشروع"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">صورة المشروع</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  image: e.target.files[0],
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">العنوان</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.title || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">التصنيف</label>
            <input
              className="form-control"
              value={selectedProject.category || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  category: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">التمويل</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.fund || ""}
              onChange={(e) =>
                setSelectedProject({ ...selectedProject, fund: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الموقع</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.location || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  location: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">المدة</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.duration || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  duration: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">المستفيدون</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.Beneficiary || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  Beneficiary: e.target.value,
                })
              }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handleSaveProject}>
            {modalMode === "add" ? "إضافة" : "حفظ التغييرات"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={handleCloseViewModal}
        size="lg"
        dir="rtl"
      >
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل المشروع المنجز</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewProject && (
            <div className="view-project-details">
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:3500/uploads/completed-projects/${viewProject.image}`}
                  alt={viewProject.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">معلومات المشروع</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>العنوان:</strong> {viewProject.title}
                    </p>
                    <p>
                      <strong>التصنيف:</strong> {viewProject.category}
                    </p>
                    <p>
                      <strong>التمويل:</strong> {viewProject.details[0]?.fund}
                    </p>
                    <p>
                      <strong>الموقع:</strong>{" "}
                      {viewProject.details[0]?.location}
                    </p>
                    <p>
                      <strong>المدة:</strong> {viewProject.details[0]?.duration}
                    </p>
                    <p>
                      <strong>المستفيدون:</strong>{" "}
                      {viewProject.details[0]?.Beneficiary}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
