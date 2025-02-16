import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

export default function CompletedCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState(null);

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3500/api/completed-campagins"
      );
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle modal display
  const handleShowModal = (campaign = {}, mode = "add") => {
    if (mode === "edit") {
      setSelectedCampaign({
        ...campaign,
        details: {
          ...campaign.details,
        },
      });
    } else {
      setSelectedCampaign({});
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCampaign({});
  };

  // Save campaign (create/update)
  const handleSaveCampaign = async () => {
    setLoading(true);
    const formData = new FormData();

    try {
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

      // Validate required fields
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!selectedCampaign[key]) {
          alert(`${value} مطلوب`);
          setLoading(false);
          return;
        }
      }

      // Main campaign data
      formData.append("title", selectedCampaign.title);
      formData.append("titleAr", selectedCampaign.titleAr);
      formData.append("category", selectedCampaign.category);
      formData.append("categoryAr", selectedCampaign.categoryAr);

      // Image validation for new campaigns
      if (modalMode === "add" && !selectedCampaign.image) {
        alert("الصورة مطلوبة");
        setLoading(false);
        return;
      }
      if (selectedCampaign.image instanceof File) {
        formData.append("image", selectedCampaign.image);
      }

      // Details data
      const details = [
        {
          fund: selectedCampaign.fund,
          fundAr: selectedCampaign.fundAr,
          location: selectedCampaign.location,
          locationAr: selectedCampaign.locationAr,
          duration: selectedCampaign.duration,
          durationAr: selectedCampaign.durationAr,
          Beneficiary: selectedCampaign.Beneficiary,
          BeneficiaryAr: selectedCampaign.BeneficiaryAr,
        },
      ];

      formData.append("details", JSON.stringify(details));

      if (modalMode === "add") {
        await axios.post(
          "http://localhost:3500/api/completed-campagins",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.put(
          `http://localhost:3500/api/completed-campagins/${selectedCampaign._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      fetchCampaigns();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      setLoading(true);
      try {
        await axios.delete(
          `http://localhost:3500/api/completed-campagins/${id}`
        );
        fetchCampaigns();
      } catch (error) {
        console.error("Error deleting campaign:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // View modal handlers
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
        <h1 className="fw-bold">الحملات المنجزة</h1>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة حملة منجزة
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
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td>
                    <img
                      src={`http://localhost:3500/uploads/completed-campaigns/${campaign.image}`}
                      alt={campaign.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>{campaign.title}</td>
                  <td>{campaign.category}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleShowViewModal(campaign)}
                      >
                        عرض
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
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
            {modalMode === "add" ? "إضافة حملة منجزة" : "تعديل الحملة"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">صورة الحملة</label>
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
            <label className="form-label">عنوان الحملة (بالإنجليزية)</label>
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
            <label className="form-label">عنوان الحملة (بالعربية)</label>
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
            <label className="form-label">التصنيف (بالإنجليزية)</label>
            <select
              className="form-select"
              value={selectedCampaign.category || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  category: e.target.value,
                })
              }
            >
              <option value="">اختر التصنيف</option>
              <option value="صحة">صحة</option>
              <option value="تعليم">تعليم</option>
              <option value="إغاثة">إغاثة</option>
              <option value="تنمية">تنمية</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">التصنيف (بالعربية)</label>
            <select
              className="form-select"
              value={selectedCampaign.categoryAr || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  categoryAr: e.target.value,
                })
              }
            >
              <option value="">اختر التصنيف</option>
              <option value="صحة">صحة</option>
              <option value="تعليم">تعليم</option>
              <option value="إغاثة">إغاثة</option>
              <option value="تنمية">تنمية</option>
            </select>
          </div>

          {/* Details Section */}
          <h5 className="mt-4">تفاصيل الحملة</h5>
          <div className="mb-3">
            <label className="form-label">قيمة التمويل (بالإنجليزية)</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.fund || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  fund: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">قيمة التمويل (بالعربية)</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.fundAr || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  fundAr: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الموقع (بالإنجليزية)</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.location || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  location: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الموقع (بالعربية)</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.locationAr || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  locationAr: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">المدة (بالإنجليزية)</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.duration || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  duration: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">المدة (بالعربية)</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.durationAr || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  durationAr: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">المستفيدون (بالإنجليزية)</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.Beneficiary || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  Beneficiary: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">المستفيدون (بالعربية)</label>
            <input
              type="text"
              className="form-control"
              value={selectedCampaign.BeneficiaryAr || ""}
              onChange={(e) =>
                setSelectedCampaign({
                  ...selectedCampaign,
                  BeneficiaryAr: e.target.value,
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
          <Modal.Title>تفاصيل الحملة المنجزة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewCampaign && (
            <div className="view-campaign-details">
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:3500/uploads/completed-campaigns/${viewCampaign.image}`}
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
                      <strong>العنوان (بالعربية):</strong>{" "}
                      {viewCampaign.titleAr}
                    </p>
                    <p>
                      <strong>التصنيف:</strong> {viewCampaign.category}
                    </p>
                    <p>
                      <strong>التصنيف (بالعربية):</strong>{" "}
                      {viewCampaign.categoryAr}
                    </p>
                  </div>
                </div>
              </div>

              {viewCampaign.details && viewCampaign.details[0] && (
                <div className="campaign-details mt-4">
                  <h5 className="border-bottom pb-2">التفاصيل</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>قيمة التمويل:</strong>{" "}
                        {viewCampaign.details[0].fund}
                      </p>
                      <p>
                        <strong>قيمة التمويل (بالعربية):</strong>{" "}
                        {viewCampaign.details[0].fundAr}
                      </p>
                      <p>
                        <strong>الموقع:</strong>{" "}
                        {viewCampaign.details[0].location}
                      </p>
                      <p>
                        <strong>الموقع (بالعربية):</strong>{" "}
                        {viewCampaign.details[0].locationAr}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>المدة:</strong>{" "}
                        {viewCampaign.details[0].duration}
                      </p>
                      <p>
                        <strong>المدة (بالعربية):</strong>{" "}
                        {viewCampaign.details[0].durationAr}
                      </p>
                      <p>
                        <strong>المستفيدون:</strong>{" "}
                        {viewCampaign.details[0].Beneficiary}
                      </p>
                      <p>
                        <strong>المستفيدون (بالعربية):</strong>{" "}
                        {viewCampaign.details[0].BeneficiaryAr}
                      </p>
                    </div>
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
