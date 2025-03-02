import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

export default function CurrentCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3500/api/current-campaigns"
      );
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      alert("خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleShowModal = (campaign = {}, mode = "add") => {
    setSelectedCampaign(campaign);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCampaign({});
  };

  const handleSaveCampaign = async () => {
    setLoading(true);
    const formData = new FormData();

    try {
      // Validate required fields
      const requiredFields = {
        title: "العنوان بالإنجليزية",
        titleAr: "العنوان بالعربية",
        description: "الوصف بالإنجليزية",
        descriptionAr: "الوصف بالعربية",
        category: "التصنيف بالإنجليزية",
        categoryAr: "التصنيف بالعربية",
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!selectedCampaign[field]) {
          missingFields.push(label);
        }
      });

      // Details validation
      const requiredDetailsFields = {
        title: "عنوان التفاصيل بالإنجليزية",
        titleAr: "عنوان التفاصيل بالعربية",
        description1: "الوصف الأول بالإنجليزية",
        description1Ar: "الوصف الأول بالعربية",
        description2: "الوصف الثاني بالإنجليزية",
        description2Ar: "الوصف الثاني بالعربية",
      };

      Object.entries(requiredDetailsFields).forEach(([field, label]) => {
        if (!selectedCampaign.details?.[field]) {
          missingFields.push(label);
        }
      });

      if (modalMode === "add" && !selectedCampaign.image) {
        missingFields.push("صورة الحملة");
      }

      if (missingFields.length > 0) {
        alert(`الرجاء إكمال الحقول التالية:\n${missingFields.join("\n")}`);
        setLoading(false);
        return;
      }

      // Append main fields
      Object.entries(requiredFields).forEach(([field]) => {
        formData.append(field, selectedCampaign[field] || "");
      });

      // Append image if new one is selected
      if (selectedCampaign.image instanceof File) {
        formData.append("image", selectedCampaign.image);
      }

      // Append details
      formData.append("details", JSON.stringify(selectedCampaign.details));

      const url = modalMode === "add"
        ? "http://localhost:3500/api/current-campaigns"
        : `http://localhost:3500/api/current-campaigns/${selectedCampaign._id}`;

      await axios({
        method: modalMode === "add" ? "post" : "put",
        url,
        data: formData,
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });

      fetchCampaigns();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3500/api/current-campaigns/${id}`);
        fetchCampaigns();
      } catch (error) {
        console.error("Error deleting campaign:", error);
        alert("خطأ في حذف الحملة");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleShowViewModal = (campaign) => {
    setViewCampaign(campaign);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewCampaign(null);
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">الحملات الحالية</h1>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة حملة جديدة
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
                <th>الوصف</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td>
                    <img
                      src={`http://localhost:3500/uploads/current-campaigns/${campaign.image}`}
                      alt={campaign.title}
                      style={{ width: "100px", height: "60px", objectFit: "cover" }}
                    />
                  </td>
                  <td>
                    <div>{campaign.titleAr}</div>
                    <small className="text-muted">{campaign.title}</small>
                  </td>
                  <td>
                    <div>{campaign.categoryAr}</div>
                    <small className="text-muted">{campaign.category}</small>
                  </td>
                  <td>
                    <div>{campaign.descriptionAr?.substring(0, 100)}...</div>
                    <small className="text-muted">{campaign.description?.substring(0, 100)}...</small>
                  </td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowViewModal(campaign)}
                    >
                      عرض
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(campaign, "edit")}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign._id)}
                    >
                      حذف
                    </Button>
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
            {modalMode === "add" ? "إضافة حملة جديدة" : "تعديل الحملة"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">الصورة</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  image: e.target.files[0],
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">العنوان بالعربية</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.titleAr || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  titleAr: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Title in English</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.title || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">التصنيف بالعربية</label>
            <input
              className="form-control"
              value={selectedCampaign.categoryAr || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  categoryAr: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Category in English</label>
            <input
              className="form-control"
              value={selectedCampaign.category || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  category: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف</label>
            <textarea
              className="form-control"
              value={selectedCampaign.description || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  description: e.target.value,
                })
              }
            />
          </div>

          {/* Details Section */}
          <h5 className="mt-4">تفاصيل الحملة</h5>
          <div className="mb-3">
            <label className="form-label">عنوان التفاصيل بالعربية</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.details?.titleAr || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  details: {
                    ...selectedCampaign.details,
                    titleAr: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Details Title in English</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.details?.title || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  details: {
                    ...selectedCampaign.details,
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
              value={selectedCampaign.details?.description1 || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  details: {
                    ...selectedCampaign.details,
                    description1: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الأول بالعربية</label>
            <textarea
              className="form-control"
              value={selectedCampaign.details?.description1Ar || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  details: {
                    ...selectedCampaign.details,
                    description1Ar: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الثاني</label>
            <textarea
              className="form-control"
              value={selectedCampaign.details?.description2 || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  details: {
                    ...selectedCampaign.details,
                    description2: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف الثاني بالعربية</label>
            <textarea
              className="form-control"
              value={selectedCampaign.details?.description2Ar || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  details: {
                    ...selectedCampaign.details,
                    description2Ar: e.target.value,
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
          <Button variant="primary" onClick={handleSaveCampaign}>
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
          <Modal.Title>تفاصيل الحملة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewCampaign && (
            <div className="view-campaign-details">
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:3500/uploads/current-campaigns/${viewCampaign.image}`}
                  alt={viewCampaign.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">معلومات الحملة</h5>
                <div className="row">
                  <div className="col-12">
                    <p>
                      <strong>العنوان:</strong> {viewCampaign.title}
                    </p>
                    <p>
                      <strong>التصنيف:</strong> {viewCampaign.category}
                    </p>
                    <p>
                      <strong>الوصف:</strong>
                    </p>
                    <p className="text-muted">{viewCampaign.description}</p>
                  </div>
                </div>
              </div>

              {viewCampaign.details && (
                <div className="campaign-details mt-4">
                  <h5 className="border-bottom pb-2">التفاصيل</h5>
                  <p>
                    <strong>عنوان التفاصيل:</strong>{" "}
                    {viewCampaign.details.title}
                  </p>
                  <div className="mt-3">
                    <p>
                      <strong>الوصف الأول:</strong>
                    </p>
                    <p className="text-muted">
                      {viewCampaign.details.description1}
                    </p>
                  </div>
                  <div className="mt-3">
                    <p>
                      <strong>الوصف الثاني:</strong>
                    </p>
                    <p className="text-muted">
                      {viewCampaign.details.description2}
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
