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
        "http://localhost:3500/api/completed-campaigns"
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

  // Handle modal display
  const handleShowModal = (campaign = {}, mode = "add") => {
    if (mode === "edit") {
      const details = campaign.details?.[0] || {};
      setSelectedCampaign({
        _id: campaign._id,
        title: campaign.title || '',
        titleAr: campaign.titleAr || '',
        category: campaign.category || '',
        categoryAr: campaign.categoryAr || '',
        image: campaign.image || '',
        fund: details.fund || '',
        fundAr: details.fundAr || '',
        location: details.location || '',
        locationAr: details.locationAr || '',
        duration: details.duration || '',
        durationAr: details.durationAr || '',
        Beneficiary: details.Beneficiary || '',
        BeneficiaryAr: details.BeneficiaryAr || '',
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
      // Append main fields
      formData.append('title', selectedCampaign.title || '');
      formData.append('titleAr', selectedCampaign.titleAr || '');
      formData.append('category', selectedCampaign.category || '');
      formData.append('categoryAr', selectedCampaign.categoryAr || '');

      // Append image if new one is selected
      if (selectedCampaign.image instanceof File) {
        formData.append("image", selectedCampaign.image);
      }

      // Create details object
      const details = {
        fund: selectedCampaign.fund || '',
        fundAr: selectedCampaign.fundAr || '',
        location: selectedCampaign.location || '',
        locationAr: selectedCampaign.locationAr || '',
        duration: selectedCampaign.duration || '',
        durationAr: selectedCampaign.durationAr || '',
        Beneficiary: selectedCampaign.Beneficiary || '',
        BeneficiaryAr: selectedCampaign.BeneficiaryAr || '',
      };

      // Append details as JSON string
      formData.append("details", JSON.stringify([details]));

      const url = modalMode === "add"
        ? "http://localhost:3500/api/completed-campaigns"
        : `http://localhost:3500/api/completed-campaigns/${selectedCampaign._id}`;

      await axios({
        method: modalMode === "add" ? "post" : "put",
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
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

  // Delete campaign
  const handleDeleteCampaign = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3500/api/completed-campaigns/${id}`);
        fetchCampaigns();
      } catch (error) {
        console.error("Error deleting campaign:", error);
        alert("خطأ في حذف الحملة");
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
        <h1 className="fw-bold">الحملات المكتملة</h1>
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
                <th>التفاصيل</th>
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
                    {campaign.details.map((detail, index) => (
                      <div key={index} className="mb-2">
                        <div>المستفيدون: {detail.BeneficiaryAr}</div>
                        <div>الموقع: {detail.locationAr}</div>
                        <div>المدة: {detail.durationAr}</div>
                      </div>
                    ))}
                  </td>
                  <td>
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
              type="text"
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
              type="text"
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

          {/* Details Section */}
          <h5 className="mt-4">تفاصيل الحملة</h5>
          {selectedCampaign.details?.map((detail, index) => (
            <div key={index} className="border p-3 mb-3 rounded">
              <h6>التفاصيل {index + 1}</h6>
              
              {/* Fund fields */}
              <div className="mb-3">
                <label className="form-label">التمويل بالعربية</label>
                <input
                  type="text"
                  className="form-control"
                  value={detail.fundAr || ""}
                  onChange={(e) => {
                    const newDetails = [...selectedCampaign.details];
                    newDetails[index] = { ...detail, fundAr: e.target.value };
                    setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                  }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Fund in English</label>
                <input
                  type="text"
                  className="form-control"
                  value={detail.fund || ""}
                  onChange={(e) => {
                    const newDetails = [...selectedCampaign.details];
                    newDetails[index] = { ...detail, fund: e.target.value };
                    setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                  }}
                />
              </div>

              {/* Location fields */}
              <div className="mb-3">
                <label className="form-label">الموقع بالعربية</label>
                <input
                  type="text"
                  className="form-control"
                  value={detail.locationAr || ""}
                  onChange={(e) => {
                    const newDetails = [...selectedCampaign.details];
                    newDetails[index] = { ...detail, locationAr: e.target.value };
                    setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                  }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Location in English</label>
                <input
                  type="text"
                  className="form-control"
                  value={detail.location || ""}
                  onChange={(e) => {
                    const newDetails = [...selectedCampaign.details];
                    newDetails[index] = { ...detail, location: e.target.value };
                    setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                  }}
                />
              </div>

              {/* Duration fields */}
              <div className="mb-3">
                <label className="form-label">المدة بالعربية</label>
                <input
                  type="text"
                  className="form-control"
                  value={detail.durationAr || ""}
                  onChange={(e) => {
                    const newDetails = [...selectedCampaign.details];
                    newDetails[index] = { ...detail, durationAr: e.target.value };
                    setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                  }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Duration in English</label>
                <input
                  type="text"
                  className="form-control"
                  value={detail.duration || ""}
                  onChange={(e) => {
                    const newDetails = [...selectedCampaign.details];
                    newDetails[index] = { ...detail, duration: e.target.value };
                    setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                  }}
                />
              </div>

              {/* Beneficiary fields */}
              <div className="mb-3">
                <label className="form-label">المستفيدون بالعربية</label>
                <input
                  type="text"
                  className="form-control"
                  value={detail.BeneficiaryAr || ""}
                  onChange={(e) => {
                    const newDetails = [...selectedCampaign.details];
                    newDetails[index] = { ...detail, BeneficiaryAr: e.target.value };
                    setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                  }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Beneficiaries in English</label>
                <input
                  type="text"
                  className="form-control"
                  value={detail.Beneficiary || ""}
                  onChange={(e) => {
                    const newDetails = [...selectedCampaign.details];
                    newDetails[index] = { ...detail, Beneficiary: e.target.value };
                    setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                  }}
                />
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  const newDetails = selectedCampaign.details.filter((_, i) => i !== index);
                  setSelectedCampaign({ ...selectedCampaign, details: newDetails });
                }}
              >
                حذف هذه التفاصيل
              </Button>
            </div>
          ))}

          <Button
            variant="success"
            onClick={() => {
              const newDetails = [...(selectedCampaign.details || []), {
                fund: "",
                fundAr: "",
                location: "",
                locationAr: "",
                duration: "",
                durationAr: "",
                Beneficiary: "",
                BeneficiaryAr: ""
              }];
              setSelectedCampaign({ ...selectedCampaign, details: newDetails });
            }}
          >
            إضافة تفاصيل جديدة
          </Button>
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
