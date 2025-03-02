import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Form } from "react-bootstrap";

export default function SupportCampaigns() {
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
        "http://localhost:3500/api/support-campaigns"
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
        donateLink: "رابط التبرع",
        total: "المبلغ المطلوب",
        paid: "المبلغ المدفوع",
      };

      const missingFields = [];
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!selectedCampaign[field]) {
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

      // Append all fields to formData
      Object.entries(selectedCampaign).forEach(([key, value]) => {
        if (key !== 'image') {
          formData.append(key, value);
        }
      });

      // Append image if new one is selected
      if (selectedCampaign.image instanceof File) {
        formData.append("image", selectedCampaign.image);
      }

      const url = modalMode === "add"
          ? "http://localhost:3500/api/support-campagins"
          : `http://localhost:3500/api/support-campagins/${selectedCampaign._id}`;

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

  const handleDeleteCampaign = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3500/api/support-campagins/${id}`);
        fetchCampaigns();
      } catch (error) {
        console.error("Error deleting campaign:", error);
        alert("حدث خطأ أثناء الحذف");
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
        <h1 className="fw-bold">حملات تحتاج للدعم</h1>
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
                <th>المبلغ المطلوب</th>
                <th>المبلغ المدفوع</th>
                <th>رابط التبرع</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td>
                    <img
                      src={`http://localhost:3500/uploads/support-campaigns/${campaign.image}`}
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
                  <td>{campaign.total}</td>
                  <td>{campaign.paid}</td>
                  <td>
                    <a href={campaign.donateLink} target="_blank" rel="noopener noreferrer">
                      رابط التبرع
                    </a>
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
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>صورة الحملة</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  image: e.target.files[0]
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>العنوان (بالإنجليزية)</Form.Label>
              <Form.Control
                type="text"
                value={selectedCampaign.title || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  title: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>العنوان (بالعربية)</Form.Label>
              <Form.Control
                type="text"
                value={selectedCampaign.titleAr || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  titleAr: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الوصف (بالإنجليزية)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedCampaign.description || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  description: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الوصف (بالعربية)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedCampaign.descriptionAr || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  descriptionAr: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>التصنيف (بالإنجليزية)</Form.Label>
              <Form.Control
                type="text"
                value={selectedCampaign.category || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  category: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>التصنيف (بالعربية)</Form.Label>
              <Form.Control
                type="text"
                value={selectedCampaign.categoryAr || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  categoryAr: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>المبلغ المطلوب</Form.Label>
              <Form.Control
                type="number"
                value={selectedCampaign.total || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  total: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>المبلغ المدفوع</Form.Label>
              <Form.Control
                type="number"
                value={selectedCampaign.paid || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  paid: e.target.value
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>رابط التبرع</Form.Label>
              <Form.Control
                type="text"
                value={selectedCampaign.donateLink || ""}
                onChange={(e) => setSelectedCampaign({
                  ...selectedCampaign,
                  donateLink: e.target.value
                })}
              />
            </Form.Group>
          </Form>
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
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل الحملة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewCampaign && (
            <div className="view-campaign-details">
              <div className="text-center mb-4">
                <img
                  src={`http://localhost:3500/uploads/support-campaigns/${viewCampaign.image}`}
                  alt={viewCampaign.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>
              <h4>العنوان</h4>
              <p className="text-muted">{viewCampaign.titleAr}</p>
              <p>{viewCampaign.title}</p>

              <h4>الوصف</h4>
              <p className="text-muted">{viewCampaign.descriptionAr}</p>
              <p>{viewCampaign.description}</p>

              <h4>التصنيف</h4>
              <p className="text-muted">{viewCampaign.categoryAr}</p>
              <p>{viewCampaign.category}</p>

              <h4>المبلغ المطلوب</h4>
              <p>{viewCampaign.total}</p>

              <h4>المبلغ المدفوع</h4>
              <p>{viewCampaign.paid}</p>

              <h4>رابط التبرع</h4>
              <p>
                <a href={viewCampaign.donateLink} target="_blank" rel="noopener noreferrer">
                  {viewCampaign.donateLink}
                </a>
              </p>
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
