import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function DocumentationsPage() {
  const [documentations, setDocumentations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDocumentations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3500/api/documentations"
      );
      setDocumentations(response.data);
    } catch (error) {
      console.error("Error fetching documentations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentations();
  }, []);

  const handleShowModal = (doc = {}, mode = "add") => {
    setSelectedDoc(doc);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDoc({});
  };

  const handleSaveDoc = async () => {
    try {
      const formData = new FormData();

      // Append text fields
      formData.append("title", selectedDoc.title);
      formData.append("titleAr", selectedDoc.titleAr);
      formData.append("description", selectedDoc.description);
      formData.append("descriptionAr", selectedDoc.descriptionAr);
      formData.append("detailsLink", selectedDoc.detailsLink);

      // Append images
      if (selectedDoc.images) {
        Array.from(selectedDoc.images).forEach((image) => {
          formData.append("images", image);
        });
      }

      if (modalMode === "add") {
        await axios.post("http://localhost:3500/api/documentations", formData);
        Swal.fire({
          icon: "success",
          title: "تم بنجاح!",
          text: "تمت إضافة التوثيق بنجاح",
        });
      } else {
        await axios.put(
          `http://localhost:3500/api/documentations/${selectedDoc._id}`,
          formData
        );
        Swal.fire({
          icon: "success",
          title: "تم بنجاح!",
          text: "تم تحديث التوثيق بنجاح",
        });
      }

      fetchDocumentations();
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: "حدث خطأ أثناء حفظ التوثيق",
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
      try {
        await axios.delete(`http://localhost:3500/api/documentations/${id}`);
        Swal.fire("تم الحذف!", "تم حذف التوثيق بنجاح.", "success");
        fetchDocumentations();
      } catch (error) {
        Swal.fire("خطأ!", "حدث خطأ أثناء الحذف.", "error");
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
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">التوثيقات</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
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
            {documentations.map((doc) => (
              <tr key={doc._id}>
                <td>
                  <div className="d-flex gap-2">
                    {doc.images.slice(0, 1).map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:3500/uploads/documentations/${img}`}
                        alt={`توثيق ${index + 1}`}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    ))}
                  </div>
                </td>
                <td>{doc.title}</td>
                <td>{doc.description.substring(0, 100)}...</td>
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
            ))}
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
          <div className="mb-3">
            <label className="form-label">العنوان بالعربية</label>
            <input
              type="text"
              className="form-control"
              value={selectedDoc.titleAr || ""}
              onChange={(e) =>
                setSelectedDoc({ ...selectedDoc, titleAr: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Title in English</label>
            <input
              type="text"
              className="form-control"
              value={selectedDoc.title || ""}
              onChange={(e) =>
                setSelectedDoc({ ...selectedDoc, title: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">الوصف بالعربية</label>
            <textarea
              className="form-control"
              value={selectedDoc.descriptionAr || ""}
              onChange={(e) =>
                setSelectedDoc({
                  ...selectedDoc,
                  descriptionAr: e.target.value,
                })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description in English</label>
            <textarea
              className="form-control"
              value={selectedDoc.description || ""}
              onChange={(e) =>
                setSelectedDoc({ ...selectedDoc, description: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">رابط التفاصيل</label>
            <input
              type="text"
              className="form-control"
              value={selectedDoc.detailsLink || ""}
              onChange={(e) =>
                setSelectedDoc({ ...selectedDoc, detailsLink: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">الصور (حد أقصى 3 صور)</label>
            <input
              type="file"
              className="form-control"
              multiple
              accept="image/*"
              onChange={(e) =>
                setSelectedDoc({ ...selectedDoc, images: e.target.files })
              }
            />
          </div>
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
