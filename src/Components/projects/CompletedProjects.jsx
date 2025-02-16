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
    // If editing, map the details array to the form fields
    if (mode === "edit" && project.details && project.details[0]) {
      setSelectedProject({
        ...project,
        fund: project.details[0].fund,
        fundAr: project.details[0].fundAr,
        location: project.details[0].location,
        locationAr: project.details[0].locationAr,
        duration: project.details[0].duration,
        durationAr: project.details[0].durationAr,
        Beneficiary: project.details[0].Beneficiary,
        BeneficiaryAr: project.details[0].BeneficiaryAr,
      });
    } else {
      setSelectedProject(project);
    }
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
      // Validate all required fields
      const requiredFields = {
        title: "العنوان بالإنجليزية",
        titleAr: "العنوان بالعربية",
        category: "التصنيف بالإنجليزية",
        categoryAr: "التصنيف بالعربية",
        fund: "التمويل بالإنجليزية",
        fundAr: "التمويل بالعربية",
        location: "الموقع بالإنجليزية",
        locationAr: "الموقع بالعربية",
        duration: "المدة بالإنجليزية",
        durationAr: "المدة بالعربية",
        Beneficiary: "المستفيدون بالإنجليزية",
        BeneficiaryAr: "المستفيدون بالعربية",
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!selectedProject[field]) {
          missingFields.push(label);
        }
      });

      if (modalMode === "add" && !selectedProject.image) {
        missingFields.push("صورة المشروع");
      }

      if (missingFields.length > 0) {
        alert(`الرجاء إكمال الحقول التالية:\n${missingFields.join("\n")}`);
        setLoading(false);
        return;
      }

      // Append all text fields to formData
      Object.entries(requiredFields).forEach(([field]) => {
        formData.append(field, selectedProject[field] || "");
      });

      // Append image if it exists
      if (selectedProject.image instanceof File) {
        formData.append("image", selectedProject.image);
      }

      // Create details object
      const details = [
        {
          fund: selectedProject.fund,
          fundAr: selectedProject.fundAr,
          location: selectedProject.location,
          locationAr: selectedProject.locationAr,
          duration: selectedProject.duration,
          durationAr: selectedProject.durationAr,
          Beneficiary: selectedProject.Beneficiary,
          BeneficiaryAr: selectedProject.BeneficiaryAr,
        },
      ];

      // Append details as JSON string
      formData.append("details", JSON.stringify(details));

      // Log formData for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

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
          {/* Image Upload */}
          <div className="mb-4">
            <label className="form-label fw-bold">صورة المشروع</label>
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

          {/* Title Section */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">العنوان</h6>
            <div className="mb-3">
              <label className="form-label">بالعربية</label>
              <input
                type="text"
                className="form-control"
                value={selectedProject.titleAr || ""}
                onChange={(e) =>
                  setSelectedProject({
                    ...selectedProject,
                    titleAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">بالإنجليزية</label>
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
          </div>

          {/* Category Section */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">التصنيف</h6>
            <div className="mb-3">
              <label className="form-label">بالعربية</label>
              <input
                type="text"
                className="form-control"
                value={selectedProject.categoryAr || ""}
                onChange={(e) =>
                  setSelectedProject({
                    ...selectedProject,
                    categoryAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">بالإنجليزية</label>
              <input
                type="text"
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
          </div>

          {/* Details Section */}
          <h5 className="mb-4">تفاصيل إضافية</h5>

          {/* Fund */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">التمويل</h6>
            <div className="mb-3">
              <label className="form-label">بالعربية</label>
              <input
                type="text"
                className="form-control"
                value={selectedProject.fundAr || ""}
                onChange={(e) =>
                  setSelectedProject({
                    ...selectedProject,
                    fundAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">بالإنجليزية</label>
              <input
                type="text"
                className="form-control"
                value={selectedProject.fund || ""}
                onChange={(e) =>
                  setSelectedProject({
                    ...selectedProject,
                    fund: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">الموقع</h6>
            <div className="mb-3">
              <label className="form-label">بالعربية</label>
              <input
                type="text"
                className="form-control"
                value={selectedProject.locationAr || ""}
                onChange={(e) =>
                  setSelectedProject({
                    ...selectedProject,
                    locationAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">بالإنجليزية</label>
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
          </div>

          {/* Duration */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">المدة</h6>
            <div className="mb-3">
              <label className="form-label">بالعربية</label>
              <input
                type="text"
                className="form-control"
                value={selectedProject.durationAr || ""}
                onChange={(e) =>
                  setSelectedProject({
                    ...selectedProject,
                    durationAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">بالإنجليزية</label>
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
          </div>

          {/* Beneficiary */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">المستفيدون</h6>
            <div className="mb-3">
              <label className="form-label">بالعربية</label>
              <input
                type="text"
                className="form-control"
                value={selectedProject.BeneficiaryAr || ""}
                onChange={(e) =>
                  setSelectedProject({
                    ...selectedProject,
                    BeneficiaryAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">بالإنجليزية</label>
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
                  <div className="col-12">
                    <div className="mb-3">
                      <h6>العنوان</h6>
                      <p className="text-muted">
                        بالعربية: {viewProject.titleAr}
                      </p>
                      <p className="text-muted">
                        بالإنجليزية: {viewProject.title}
                      </p>
                    </div>

                    <div className="mb-3">
                      <h6>التصنيف</h6>
                      <p className="text-muted">
                        بالعربية: {viewProject.categoryAr}
                      </p>
                      <p className="text-muted">
                        بالإنجليزية: {viewProject.category}
                      </p>
                    </div>

                    <div className="mb-3">
                      <h6>التمويل</h6>
                      <p className="text-muted">
                        بالعربية: {viewProject.details[0]?.fundAr}
                      </p>
                      <p className="text-muted">
                        بالإنجليزية: {viewProject.details[0]?.fund}
                      </p>
                    </div>

                    <div className="mb-3">
                      <h6>الموقع</h6>
                      <p className="text-muted">
                        بالعربية: {viewProject.details[0]?.locationAr}
                      </p>
                      <p className="text-muted">
                        بالإنجليزية: {viewProject.details[0]?.location}
                      </p>
                    </div>

                    <div className="mb-3">
                      <h6>المدة</h6>
                      <p className="text-muted">
                        بالعربية: {viewProject.details[0]?.durationAr}
                      </p>
                      <p className="text-muted">
                        بالإنجليزية: {viewProject.details[0]?.duration}
                      </p>
                    </div>

                    <div className="mb-3">
                      <h6>المستفيدون</h6>
                      <p className="text-muted">
                        بالعربية: {viewProject.details[0]?.BeneficiaryAr}
                      </p>
                      <p className="text-muted">
                        بالإنجليزية: {viewProject.details[0]?.Beneficiary}
                      </p>
                    </div>
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
