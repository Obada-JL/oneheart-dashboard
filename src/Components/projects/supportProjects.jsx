import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from 'sweetalert2';

export default function SupportProjects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewProject, setViewProject] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://oneheart.team.com/api/support-projects"
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
    // Reset validation states
    setValidated(false);
    setFormErrors({});
    setTouched({});
    
    if (mode === "edit") {
      const details = project.details || {};
      setSelectedProject({
        ...project,
        title: project.title || "",
        titleAr: project.titleAr || "",
        description: project.description || "",
        descriptionAr: project.descriptionAr || "",
        category: project.category || "",
        categoryAr: project.categoryAr || "",
        // total: project.total || "",
        // paid: project.paid || "",
        details: {
          title: details.title || "",
          titleAr: details.titleAr || "",
          description1: details.description1 || "",
          description1Ar: details.description1Ar || "",
          description2: details.description2 || "",
          description2Ar: details.description2Ar || "",
          image: details.image || null
        }
      });
    } else {
      setSelectedProject({
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        category: "",
        categoryAr: "",
        // total: "",
        // paid: "",
        details: {
          title: "",
          titleAr: "",
          description1: "",
          description1Ar: "",
          description2: "",
          description2Ar: "",
          image: null
        }
      });
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setValidated(false);
    setFormErrors({});
    setTouched({});
  };

  // Field change handler with validation
  const handleFieldChange = (field, value, isDetailsField = false) => {
    let updatedProject;
    
    if (isDetailsField) {
      updatedProject = {
        ...selectedProject,
        details: {
          ...selectedProject.details,
          [field]: value
        }
      };
    } else {
      updatedProject = {
        ...selectedProject,
        [field]: value
      };
    }
    
    setSelectedProject(updatedProject);
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [isDetailsField ? `details.${field}` : field]: true
    }));
    
    // Validate the field
    validateField(field, value, isDetailsField);
  };

  // Validate a single field
  const validateField = (field, value, isDetailsField = false) => {
    const errors = { ...formErrors };
    const fieldPath = isDetailsField ? `details.${field}` : field;
    
    // Clear previous error
    delete errors[fieldPath];
    
    // Required fields validation
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr',];
    if (requiredFields.includes(field) && (!value || value.trim() === '')) {
      errors[fieldPath] = 'This field is required';
    }
    
    // Numeric fields validation
    
    setFormErrors(errors);
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['title', 'titleAr', 'description', 'descriptionAr'];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (selectedProject[field] === undefined || selectedProject[field] === null || 
          (typeof selectedProject[field] === 'string' && selectedProject[field].trim() === '')) {
        errors[field] = 'This field is required';
      }
    });
    
    // Check numeric fields
    // ['total', 'paid'].forEach(field => {
    //   if (selectedProject[field] !== undefined && selectedProject[field] !== '') {
    //     if (isNaN(Number(selectedProject[field]))) {
    //       errors[field] = 'Must be a valid number';
    //     } else if (Number(selectedProject[field]) < 0) {
    //       errors[field] = 'Cannot be negative';
    //     }
    //   }
    // });
    
    // Check business logic
    // if (
    //   !isNaN(Number(selectedProject.paid)) && 
    //   !isNaN(Number(selectedProject.total)) && 
    //   Number(selectedProject.paid) > Number(selectedProject.total)
    // ) {
    //   errors['paid'] = 'Cannot exceed total amount';
    // }
    
    // Check image in add mode only
    if (modalMode === 'add' && !selectedProject.image) {
      errors['image'] = 'Main image is required';
    }
    
    setFormErrors(errors);
    setTouched(requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    return Object.keys(errors).length === 0;
  };

  const handleSaveProject = async () => {
    // Validate all fields before submission
    const isValid = validateForm();
    setValidated(true);
    
    if (!isValid) {
      // Debug which fields are missing
      const missingFields = Object.entries(formErrors)
        .map(([field, error]) => `${field}: ${error}`)
        .join('<br>');
      
      console.log("Form validation failed. Current project data:", selectedProject);
      console.log("Validation errors:", formErrors);
      
      await Swal.fire({
        title: 'Validation Error',
        html: `Please correct the following errors:<br>${missingFields}`,
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setLoading(true);
    const formData = new FormData();

    try {
      // Prepare form data with proper type conversion
      const fieldsToSend = {
        title: selectedProject.title?.trim() || "",
        titleAr: selectedProject.titleAr?.trim() || "",
        description: selectedProject.description?.trim() || "",
        descriptionAr: selectedProject.descriptionAr?.trim() || "",
        category: selectedProject.category?.trim() || "",
        categoryAr: selectedProject.categoryAr?.trim() || "",
        // total: Number(selectedProject.total || 0),
        // paid: Number(selectedProject.paid || 0),
      };

      console.log("Sending data to server:", fieldsToSend);

      // Append main fields with proper type conversion
      Object.entries(fieldsToSend).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Handle image field - critical for both add and edit modes
      if (selectedProject.image instanceof File) {
        formData.append("image", selectedProject.image);
        console.log("Appending image file to form data:", selectedProject.image.name);
      } else if (modalMode === "edit" && selectedProject.image) {
        // For edit mode, if image is not a File but exists (string path), we don't need to send it
        // The backend will keep the existing image
        console.log("Using existing image:", selectedProject.image);
      }

      // Handle details object
      if (selectedProject.details) {
        const details = {
          title: selectedProject.details.title?.trim() || "",
          titleAr: selectedProject.details.titleAr?.trim() || "",
          description1: selectedProject.details.description1?.trim() || "",
          description1Ar: selectedProject.details.description1Ar?.trim() || "",
          description2: selectedProject.details.description2?.trim() || "",
          description2Ar: selectedProject.details.description2Ar?.trim() || "",
        };

        // Handle details image separately
        if (selectedProject.details.image instanceof File) {
          formData.append("detailsImage", selectedProject.details.image);
          console.log("Appending details image file:", selectedProject.details.image.name);
        } else if (selectedProject.details.image) {
          // If details image exists but is not a File (string path), include it in the details object
          details.image = selectedProject.details.image;
          console.log("Using existing details image:", selectedProject.details.image);
        }

        formData.append("details", JSON.stringify(details));
      }

      // Log all form data entries for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      const url = modalMode === "add"
        ? "https://oneheart.team.com/api/support-projects"
        : `https://oneheart.team.com/api/support-projects/${selectedProject._id}`;

      const method = modalMode === "add" ? "post" : "put";

      console.log(`Sending ${method.toUpperCase()} request to ${url}`);
      
      const response = await axios[method](url, formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });

      if (response.data) {
        await Swal.fire({
          title: 'Success',
          text: modalMode === "add" ? 'Project added successfully' : 'Project updated successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });

        fetchProjects();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving project:", error);
      let errorMessage = "Error saving project";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.response?.data?.errors) {
        // Handle validation errors from server
        const serverErrors = error.response.data.errors;
        console.log("Server validation errors:", serverErrors);
        
        const errorList = Object.entries(serverErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('<br>');
        
        await Swal.fire({
          title: 'Validation Error',
          html: `Server validation failed:<br>${errorList}`,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لا يمكن التراجع عن هذا الإجراء!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف!',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`https://oneheart.team.com/api/support-projects/${id}`);
        await Swal.fire({
          title: 'تم الحذف!',
          text: 'تم حذف المشروع بنجاح.',
          icon: 'success',
          confirmButtonText: 'حسناً'
        });
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        await Swal.fire({
          title: 'خطأ',
          text: 'حدث خطأ أثناء حذف المشروع',
          icon: 'error',
          confirmButtonText: 'حسناً'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShowViewModal = (project) => {
    console.log(project);
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
        <h1 className="fw-bold">مشاريع الدعم</h1>
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
                      src={`https://oneheart.team.com/uploads/support-projects/${project.image}`}
                      alt={project.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>
                    <div>
                      <div>{project.titleAr}</div>
                      <div className="text-muted small">{project.title}</div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div>{project.descriptionAr?.substring(0, 100)}{project.descriptionAr?.length > 100 ? "..." : ""}</div>
                      <div className="text-muted small">{project.description?.substring(0, 100)}{project.description?.length > 100 ? "..." : ""}</div>
                    </div>
                  </td>
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
            {modalMode === "add" ? "Add Support Project" : "Edit Project"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Form.Group className="mb-4">
              <Form.Label>
                Project Image <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  handleFieldChange('image', e.target.files[0])
                }
                isInvalid={validated && formErrors.image}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.image}
              </Form.Control.Feedback>
              {selectedProject.image && !(selectedProject.image instanceof File) && (
                <div className="mt-2">
                  <img
                    src={`https://oneheart.team.com/uploads/support-projects/${selectedProject.image}`}
                    alt="Current"
                    style={{ height: "100px", objectFit: "contain" }}
                  />
                  <p className="text-muted small">Current image</p>
                </div>
              )}
              {selectedProject.image instanceof File && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(selectedProject.image)}
                    alt="Preview"
                    style={{ height: "100px", objectFit: "contain" }}
                  />
                  <p className="text-muted small">New image preview</p>
                </div>
              )}
            </Form.Group>

            <Tabs
              activeKey={activeLanguage}
              onSelect={(k) => setActiveLanguage(k)}
              className="mb-4"
            >
              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.title || ""}
                    onChange={(e) =>
                      handleFieldChange('title', e.target.value)
                    }
                    isInvalid={validated && formErrors.title}
                    isValid={touched.title && !formErrors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.category || ""}
                    onChange={(e) =>
                      handleFieldChange('category', e.target.value)
                    }
                    isValid={touched.category && !formErrors.category}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedProject.description || ""}
                    onChange={(e) =>
                      handleFieldChange('description', e.target.value)
                    }
                    isInvalid={validated && formErrors.description}
                    isValid={touched.description && !formErrors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* English Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">Additional Details</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>Details Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedProject.details?.title || ""}
                      onChange={(e) =>
                        handleFieldChange('title', e.target.value, true)
                      }
                      isValid={touched['details.title'] && !formErrors['details.title']}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Details Description 1</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedProject.details?.description1 || ""}
                      onChange={(e) =>
                        handleFieldChange('description1', e.target.value, true)
                      }
                      isValid={touched['details.description1'] && !formErrors['details.description1']}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Details Description 2</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedProject.details?.description2 || ""}
                      onChange={(e) =>
                        handleFieldChange('description2', e.target.value, true)
                      }
                      isValid={touched['details.description2'] && !formErrors['details.description2']}
                    />
                  </Form.Group>
                </div>
              </Tab>

              <Tab eventKey="ar" title="Arabic">
                <Form.Group className="mb-3">
                  <Form.Label>
                    Title (Arabic) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.titleAr || ""}
                    onChange={(e) =>
                      handleFieldChange('titleAr', e.target.value)
                    }
                    isInvalid={validated && formErrors.titleAr}
                    isValid={touched.titleAr && !formErrors.titleAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.titleAr}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category (Arabic)</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedProject.categoryAr || ""}
                    onChange={(e) =>
                      handleFieldChange('categoryAr', e.target.value)
                    }
                    isValid={touched.categoryAr && !formErrors.categoryAr}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Description (Arabic) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={selectedProject.descriptionAr || ""}
                    onChange={(e) =>
                      handleFieldChange('descriptionAr', e.target.value)
                    }
                    isInvalid={validated && formErrors.descriptionAr}
                    isValid={touched.descriptionAr && !formErrors.descriptionAr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.descriptionAr}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Arabic Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">Additional Details (Arabic)</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>Details Title (Arabic)</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedProject.details?.titleAr || ""}
                      onChange={(e) =>
                        handleFieldChange('titleAr', e.target.value, true)
                      }
                      isValid={touched['details.titleAr'] && !formErrors['details.titleAr']}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Details Description 1 (Arabic)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedProject.details?.description1Ar || ""}
                      onChange={(e) =>
                        handleFieldChange('description1Ar', e.target.value, true)
                      }
                      isValid={touched['details.description1Ar'] && !formErrors['details.description1Ar']}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Details Description 2 (Arabic)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedProject.details?.description2Ar || ""}
                      onChange={(e) =>
                        handleFieldChange('description2Ar', e.target.value, true)
                      }
                      isValid={touched['details.description2Ar'] && !formErrors['details.description2Ar']}
                    />
                  </Form.Group>
                </div>
              </Tab>
            </Tabs>

            {/* Details Image */}
            <Form.Group className="mb-3 mt-3">
              <Form.Label>Details Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  handleFieldChange('image', e.target.files[0], true)
                }
              />
              {selectedProject.details?.image && !(selectedProject.details.image instanceof File) && (
                <div className="mt-2">
                  <img
                    src={`https://oneheart.team.com/uploads/support-projects/${selectedProject.details.image}`}
                    alt="Current details"
                    style={{ height: "100px", objectFit: "contain" }}
                  />
                  <p className="text-muted small">Current details image</p>
                </div>
              )}
              {selectedProject.details?.image instanceof File && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(selectedProject.details.image)}
                    alt="Preview details"
                    style={{ height: "100px", objectFit: "contain" }}
                  />
                  <p className="text-muted small">New details image preview</p>
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveProject} disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : modalMode === "add" ? (
              "Add"
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل المشروع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewProject && (
            <div className="view-project-details">
              <div className="text-center mb-4">
                <img
                  src={`https://oneheart.team.com/uploads/support-projects/${viewProject.image}`}
                  alt={viewProject.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">العنوان</h5>
                <p className="text-muted mb-1">بالعربية: {viewProject.titleAr}</p>
                <p>بالإنجليزية: {viewProject.title}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">التصنيف</h5>
                <p className="text-muted mb-1">بالعربية: {viewProject.categoryAr}</p>
                <p>بالإنجليزية: {viewProject.category}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">الوصف</h5>
                <p className="text-muted mb-1">بالعربية: {viewProject.descriptionAr}</p>
                <p>بالإنجليزية: {viewProject.description}</p>
              </div>

              {/* <div className="mb-4">
                <h5 className="border-bottom pb-2">المبالغ</h5>
                <p className="mb-1">المبلغ المطلوب: {viewProject.total}</p>
                <p>المبلغ المدفوع: {viewProject.paid}</p>
              </div> */}

              <div className="mb-4">
                <h5 className="border-bottom pb-2">تفاصيل إضافية</h5>
                <div className="mb-3">
                  <h6>العنوان</h6>
                  <p className="text-muted mb-1">بالعربية: {viewProject.details?.titleAr}</p>
                  <p>بالإنجليزية: {viewProject.details?.title}</p>
                </div>

                <div className="mb-3">
                  <h6>الوصف الأول</h6>
                  <p className="text-muted mb-1">بالعربية: {viewProject.details?.description1Ar}</p>
                  <p>بالإنجليزية: {viewProject.details?.description1}</p>
                </div>

                <div className="mb-3">
                  <h6>الوصف الثاني</h6>
                  <p className="text-muted mb-1">بالعربية: {viewProject.details?.description2Ar}</p>
                  <p>بالإنجليزية: {viewProject.details?.description2}</p>
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
