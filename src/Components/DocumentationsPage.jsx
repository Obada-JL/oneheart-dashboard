import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form, Tabs, Tab } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useSafeApi, ensureArray, safeMap } from "../utils/apiUtils";

export default function DocumentationsPage() {
  const [documentations, setDocumentations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('ar');
  const navigate = useNavigate();

  // Initialize the safe API utility with our state setters
  const api = useSafeApi(setDocumentations, setLoading, "خطأ في جلب بيانات التوثيقات");

  const fetchDocumentations = async () => {
    await api.safeGet('documentations');
  };

  useEffect(() => {
    fetchDocumentations();
  }, []);

  const handleShowModal = (doc = {}, mode = "add") => {
    // Create a deep copy of the doc to avoid modifying the original
    const docCopy = mode === "edit" ? JSON.parse(JSON.stringify(doc)) : {};

    // Initialize empty objects for nested properties if they don't exist
    if (mode === "add") {
      docCopy.title = { en: "", ar: "" };
      docCopy.description = { en: "", ar: "" };
      docCopy.images = [];
      docCopy.hasNewImages = false;
    } else {
      // For edit mode, ensure we have the hasNewImages flag
      docCopy.hasNewImages = false;
    }

    setSelectedDoc(docCopy);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDoc({});
  };

  const handleSaveDoc = async () => {
    try {
      // Validate required fields
      const requiredFields = {
        'title.en': 'Title in English',
        'title.ar': 'العنوان بالعربية',
        'description.en': 'Description in English',
        'description.ar': 'الوصف بالعربية'
      };

      console.log("Selected Doc:", selectedDoc);

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        const value = field.split('.').reduce((obj, key) => obj && obj[key], selectedDoc);
        console.log(`Field ${field}: ${value}`);
        if (!value || value.trim() === '') {
          missingFields.push(label);
        }
      });

      // Image validation for new documentations
      if (modalMode === "add" && (!selectedDoc.images || selectedDoc.images.length === 0)) {
        missingFields.push("Documentation Images/صور التوثيق");
      }

      if (selectedDoc.images && selectedDoc.images.length > 3) {
        await Swal.fire({
          icon: "warning",
          title: "عدد الصور غير صحيح",
          text: "يمكنك رفع 3 صور كحد أقصى",
          confirmButtonText: "حسناً"
        });
        return;
      }

      if (missingFields.length > 0) {
        await Swal.fire({
          icon: "warning",
          title: "حقول مطلوبة",
          html: `الرجاء إكمال الحقول التالية:<br>${missingFields.join("<br>")}`,
          confirmButtonText: "حسناً"
        });
        return;
      }

      const formData = new FormData();

      // Append nested fields directly as objects
      formData.append('title', JSON.stringify({
        en: selectedDoc.title?.en?.trim() || '',
        ar: selectedDoc.title?.ar?.trim() || ''
      }));

      formData.append('description', JSON.stringify({
        en: selectedDoc.description?.en?.trim() || '',
        ar: selectedDoc.description?.ar?.trim() || ''
      }));

      // Append images - handle both File objects and existing image filenames
      if (selectedDoc.hasNewImages && selectedDoc.images instanceof FileList) {
        // New files uploaded via input
        Array.from(selectedDoc.images).forEach((image) => {
          formData.append('images', image);
        });
        console.log("Appending new images:", selectedDoc.images.length);
      } else if (modalMode === "edit" && Array.isArray(selectedDoc.images) && selectedDoc.images.length > 0) {
        // No new images in edit mode, but we need to inform the backend
        formData.append('keepExistingImages', 'true');
        console.log("Keeping existing images:", selectedDoc.images);
      }

      // Log form data for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      let response;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (modalMode === "add") {
        console.log("Creating new documentation");
        response = await api.safePost('documentations', formData, config);
      } else {
        console.log(`Updating documentation ${selectedDoc._id}`);
        response = await api.safePut('documentations', selectedDoc._id, formData, config);
      }

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "تم بنجاح!",
          text: modalMode === "add" ? "تمت إضافة التوثيق بنجاح" : "تم تحديث التوثيق بنجاح",
        });
        fetchDocumentations();
        handleCloseModal();
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: response.error || "حدث خطأ أثناء حفظ التوثيق",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: error.message || "حدث خطأ أثناء حفظ التوثيق",
      });
    }
  };

  const handleDeleteDoc = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      const response = await api.safeDelete('documentations', id);

      if (response.success) {
        Swal.fire("تم الحذف!", "تم حذف التوثيق بنجاح.", "success");
        fetchDocumentations();
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: response.error || "حدث خطأ أثناء حذف التوثيق",
        });
      }
    }
  };

  const navigateToPhotos = (docId) => {
    navigate(`/documentation-photos/${docId}`);
  };

  const navigateToVideos = (docId) => {
    navigate(`/documentation-videos/${docId}`);
  };

  return (
    <div className="container-fluid p-4" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>التوثيقات</h2>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة توثيق جديد
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">جاري التحميل...</p>
        </div>
      ) : (
        <Table hover className="align-middle">
          <thead>
            <tr>
              <th>الصور</th>
              <th>العنوان</th>
              <th>الوصف</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {safeMap(
              documentations,
              (doc) => (
                <tr key={doc._id}>
                  <td>
                    <div className="d-flex gap-2">
                      {safeMap(
                        ensureArray(doc.images),
                        (img, index) => (
                          <img
                            key={index}
                            src={`http://localhost:5000/uploads/documentations/${img}`}
                            alt={`توثيق ${index + 1}`}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        ),
                        <span className="text-muted">لا توجد صور</span>
                      )}
                    </div>
                  </td>
                  <td>{doc.title?.ar || doc.title}</td>
                  <td>{doc.description?.ar ? doc.description.ar.substring(0, 100) + '...' : ''}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => navigateToPhotos(doc._id)}
                      >
                        الصور
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => navigateToVideos(doc._id)}
                      >
                        الفيديوهات
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleShowModal(doc, "edit")}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteDoc(doc._id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ),
              <tr>
                <td colSpan="4" className="text-center">
                  لا توجد توثيقات متاحة أو حدث خطأ في تحميل البيانات.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "إضافة توثيق جديد" : "تعديل التوثيق"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">صور التوثيق</Form.Label>
              {modalMode === "edit" && selectedDoc.images && Array.isArray(selectedDoc.images) && selectedDoc.images.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1">الصور الحالية:</p>
                  <div className="d-flex gap-2 mb-2">
                    {selectedDoc.images.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000/uploads/documentations/${img}`}
                        alt={`توثيق ${index + 1}`}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <Form.Control
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    setSelectedDoc({
                      ...selectedDoc,
                      images: e.target.files,
                      hasNewImages: true // Flag to indicate new images were selected
                    });
                  } else {
                    // If user cancels file selection, keep existing images
                    const existingImages = selectedDoc.images;
                    setSelectedDoc({
                      ...selectedDoc,
                      hasNewImages: false
                    });
                  }
                }}
              />
              <Form.Text className="text-muted">
                يمكنك اختيار حتى 3 صور كحد أقصى
              </Form.Text>
            </Form.Group>

            <Tabs
              activeKey={activeLanguage}
              onSelect={(k) => setActiveLanguage(k)}
              className="mb-4"
            >
              <Tab eventKey="ar" title="العربية">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">العنوان</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedDoc.title?.ar || ""}
                    onChange={(e) =>
                      setSelectedDoc({
                        ...selectedDoc,
                        title: {
                          ...selectedDoc.title,
                          ar: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">الوصف</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedDoc.description?.ar || ""}
                    onChange={(e) =>
                      setSelectedDoc({
                        ...selectedDoc,
                        description: {
                          ...selectedDoc.description,
                          ar: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>
              </Tab>

              <Tab eventKey="en" title="English">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedDoc.title?.en || ""}
                    onChange={(e) =>
                      setSelectedDoc({
                        ...selectedDoc,
                        title: {
                          ...selectedDoc.title,
                          en: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedDoc.description?.en || ""}
                    onChange={(e) =>
                      setSelectedDoc({
                        ...selectedDoc,
                        description: {
                          ...selectedDoc.description,
                          en: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Group>
              </Tab>
            </Tabs>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handleSaveDoc}>
            {modalMode === "add" ? "إضافة" : "حفظ التغييرات"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
