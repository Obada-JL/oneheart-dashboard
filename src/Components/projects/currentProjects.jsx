import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

export default function CurrentProjects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProject, setViewProject] = useState(null);

  // Fetch Projects from API
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3500/api/current-projects"
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
        !selectedProject.description ||
        !selectedProject.buttonLink
      ) {
        alert("جميع الحقول مطلوبة");
        setLoading(false);
        return;
      }

      // Main project data
      formData.append("title", selectedProject.title);
      formData.append("description", selectedProject.description);
      formData.append("buttonLink", selectedProject.buttonLink);

      // Main image
      if (modalMode === "add" && !selectedProject.image) {
        alert("الصورة مطلوبة");
        setLoading(false);
        return;
      }
      if (selectedProject.image instanceof File) {
        formData.append("image", selectedProject.image);
      }

      // Details data
      if (selectedProject.details) {
        const detailsData = {
          title: selectedProject.details.title,
          description1: selectedProject.details.description1,
          description2: selectedProject.details.description2,
        };

        // Validate details
        if (
          !detailsData.title ||
          !detailsData.description1 ||
          !detailsData.description2
        ) {
          alert("جميع حقول التفاصيل مطلوبة");
          setLoading(false);
          return;
        }

        formData.append("details", JSON.stringify(detailsData));

        // Details image
        if (modalMode === "add" && !selectedProject.details.image) {
          alert("صورة التفاصيل مطلوبة");
          setLoading(false);
          return;
        }
        if (selectedProject.details.image instanceof File) {
          formData.append("detailsImage", selectedProject.details.image);
        }
      }

      if (modalMode === "add") {
        await axios.post(
          "http://localhost:3500/api/current-projects",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axios.put(
          `http://localhost:3500/api/current-projects/${selectedProject._id}`,
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
        await axios.delete(`http://localhost:3500/api/current-projects/${id}`);
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
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">المشاريع الحالية</h1>
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
                <th>الوصف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>
                    <img
                      src={`http://localhost:3500/uploads/current-projects/${project.image}`}
                      alt={project.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>{project.title}</td>
                  <td>{project.description.substring(0, 100)}...</td>
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
            <label className="form-label">الوصف</label>
            <textarea
              className="form-control"
              value={selectedProject.description || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">رابط الزر</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.buttonLink || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  buttonLink: e.target.value,
                })
              }
            />
          </div>

          {/* Details Section */}
          <h5 className="mt-4">تفاصيل المشروع</h5>
          <div className="mb-3">
            <label className="form-label">صورة التفاصيل</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    image: e.target.files[0],
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">عنوان التفاصيل</label>
            <input
              type="text"
              className="form-control"
              value={selectedProject.details?.title || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الأول</label>
            <textarea
              className="form-control"
              value={selectedProject.details?.description1 || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    description1: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الثاني</label>
            <textarea
              className="form-control"
              value={selectedProject.details?.description2 || ""}
              onChange={(e) =>
                setSelectedProject({
                  ...selectedProject,
                  details: {
                    ...selectedProject.details,
                    description2: e.target.value,
                  },
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
          <Modal.Title>تفاصيل المشروع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewProject && (
            <div className="view-project-details">
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:3500/uploads/current-projects/${viewProject.image}`}
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
                      <strong>رابط الزر:</strong> {viewProject.buttonLink}
                    </p>
                  </div>
                  <div className="col-md-12">
                    <p>
                      <strong>الوصف:</strong>
                    </p>
                    <p className="text-muted">{viewProject.description}</p>
                  </div>
                </div>
              </div>

              {viewProject.details && (
                <div className="project-details mt-4">
                  <h5 className="border-bottom pb-2">تفاصيل إضافية</h5>
                  {viewProject.details.image && (
                    <div className="text-center my-3">
                      <img
                        src={`http://localhost:3500/uploads/current-projects/${viewProject.details.image}`}
                        alt="تفاصيل"
                        className="img-fluid"
                        style={{ maxHeight: "200px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                  <p>
                    <strong>عنوان التفاصيل:</strong> {viewProject.details.title}
                  </p>
                  <div className="mt-3">
                    <p>
                      <strong>الوصف الأول:</strong>
                    </p>
                    <p className="text-muted">
                      {viewProject.details.description1}
                    </p>
                  </div>
                  <div className="mt-3">
                    <p>
                      <strong>الوصف الثاني:</strong>
                    </p>
                    <p className="text-muted">
                      {viewProject.details.description2}
                    </p>
                  </div>
                </div>
              )}
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
