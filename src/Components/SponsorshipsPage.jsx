import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner, Tabs, Tab, Form } from "react-bootstrap";
import Swal from "sweetalert2"; // Add this import

export default function SponsorshipsPage() {
  const [sponsorships, setSponsorships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSponsorship, setSelectedSponsorship] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSponsorship, setViewSponsorship] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState('ar');

  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://oneheart.team.com/api/sponsorships"
      );
      setSponsorships(response.data);
    } catch (error) {
      console.error("Error fetching sponsorships:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsorships();
  }, []);

  const handleShowModal = (sponsorship = {}, mode = "add") => {
    console.log("Opening modal with sponsorship:", sponsorship);
    
    if (mode === "edit") {
      // Ensure details object exists and has all required fields
      const details = sponsorship.details || {};
      
      setSelectedSponsorship({
        _id: sponsorship._id,
        title: sponsorship.title || "",
        titleAr: sponsorship.titleAr || "",
        description: sponsorship.description || "",
        descriptionAr: sponsorship.descriptionAr || "",
        category: sponsorship.category || "",
        categoryAr: sponsorship.categoryAr || "",
        total: sponsorship.total || "",
        remaining: sponsorship.remaining || "",
        sponsorshipImage: sponsorship.sponsorshipImage || "",
        detailsImage: sponsorship.detailsImage || "",
        details: {
          title: details.title || "",
          titleAr: details.titleAr || "",
          description1: details.description1 || "",
          description1Ar: details.description1Ar || "",
          description2: details.description2 || "",
          description2Ar: details.description2Ar || "",
        }
      });
      console.log("Set selected sponsorship for edit:", sponsorship);
    } else {
      setSelectedSponsorship({
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        category: "",
        categoryAr: "",
        total: "",
        remaining: "",
        sponsorshipImage: "",
        detailsImage: "",
        details: {
          title: "",
          titleAr: "",
          description1: "",
          description1Ar: "",
          description2: "",
          description2Ar: "",
        }
      });
    }
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal and resetting form");
    setShowModal(false);
    setSelectedSponsorship({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      category: "",
      categoryAr: "",
      total: "",
      remaining: "",
      sponsorshipImage: "",
      detailsImage: "",
      details: {
        title: "",
        titleAr: "",
        description1: "",
        description1Ar: "",
        description2: "",
        description2Ar: "",
      }
    });
  };

  const handleShowViewModal = (sponsorship) => {
    setViewSponsorship(sponsorship);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewSponsorship(null);
  };

  const validateForm = () => {
    const missingFields = [];
    
    // Check main fields
    const mainFields = {
      title: "العنوان بالإنجليزية",
      titleAr: "العنوان بالعربية",
      description: "الوصف بالإنجليزية",
      descriptionAr: "الوصف بالعربية",
      category: "التصنيف بالإنجليزية",
      categoryAr: "التصنيف بالعربية",
      total: "المبلغ الكلي",
      remaining: "المبلغ المتبقي"
    };

    Object.entries(mainFields).forEach(([field, label]) => {
      const value = selectedSponsorship[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(label);
      }
    });

    // Check details fields
    const details = selectedSponsorship.details || {};
    const detailsFields = {
      title: "عنوان التفاصيل بالإنجليزية",
      titleAr: "عنوان التفاصيل بالعربية",
      description1: "الوصف الأول بالإنجليزية",
      description1Ar: "الوصف الأول بالعربية",
      description2: "الوصف الثاني بالإنجليزية",
      description2Ar: "الوصف الثاني بالعربية",
    };

    Object.entries(detailsFields).forEach(([field, label]) => {
      const value = details[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(label);
      }
    });

    // Check main image for new sponsorships
    if (modalMode === "add" && !selectedSponsorship.sponsorshipImage) {
      missingFields.push("الصورة الرئيسية");
    }

    // Check details image for new sponsorships (optional)
    // if (modalMode === "add" && !selectedSponsorship.detailsImage) {
    //   missingFields.push("صورة التفاصيل");
    // }

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      Swal.fire({
        icon: "error",
        title: "حقول مفقودة!",
        html: `يرجى إكمال الحقول التالية:<br>${missingFields.join("<br>")}`,
        confirmButtonText: "حسناً",
      });
      return false;
    }

    return true;
  };

  const handleSaveSponsorship = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const formData = new FormData();

      // Ensure details object exists and has all required fields
      const details = {
        title: selectedSponsorship.details?.title || "",
        titleAr: selectedSponsorship.details?.titleAr || "",
        description1: selectedSponsorship.details?.description1 || "",
        description1Ar: selectedSponsorship.details?.description1Ar || "",
        description2: selectedSponsorship.details?.description2 || "",
        description2Ar: selectedSponsorship.details?.description2Ar || "",
      };

      console.log("Saving sponsorship with details:", details);

      // Prepare the data
      const data = {
        title: selectedSponsorship.title,
        titleAr: selectedSponsorship.titleAr,
        description: selectedSponsorship.description,
        descriptionAr: selectedSponsorship.descriptionAr,
        category: selectedSponsorship.category,
        categoryAr: selectedSponsorship.categoryAr,
        total: selectedSponsorship.total,
        remaining: selectedSponsorship.remaining,
      };

      console.log("Saving sponsorship with data:", data);

      // Append main fields to formData
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append details as JSON string
      formData.append("details", JSON.stringify(details));

      // Append main image if new one is selected
      if (selectedSponsorship.sponsorshipImage instanceof File) {
        formData.append("sponsorshipImage", selectedSponsorship.sponsorshipImage);
        console.log("Appending main image file:", selectedSponsorship.sponsorshipImage.name);
      }

      // Append details image if new one is selected
      if (selectedSponsorship.detailsImage instanceof File) {
        formData.append("detailsImage", selectedSponsorship.detailsImage);
        console.log("Appending details image file:", selectedSponsorship.detailsImage.name);
      }

      let response;
      if (modalMode === "add") {
        console.log("Creating new sponsorship");
        response = await axios.post("https://oneheart.team.com/api/sponsorships", formData);
        console.log("Created sponsorship:", response.data);
        
        Swal.fire({
          icon: "success",
          title: "تم بنجاح!",
          text: "تمت إضافة الكفالة بنجاح",
          confirmButtonText: "حسناً",
        });
      } else {
        console.log(`Updating sponsorship with ID: ${selectedSponsorship._id}`);
        response = await axios.put(
          `https://oneheart.team.com/api/sponsorships/${selectedSponsorship._id}`,
          formData
        );
        console.log("Updated sponsorship:", response.data);
        
        Swal.fire({
          icon: "success",
          title: "تم بنجاح!",
          text: "تم تحديث الكفالة بنجاح",
          confirmButtonText: "حسناً",
        });
      }

      fetchSponsorships();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving sponsorship:", error);
      console.error("Error response:", error.response?.data);
      
      Swal.fire({
        icon: "error",
        title: "خطأ!",
        text: error.response?.data?.message || "حدث خطأ أثناء الحفظ",
        confirmButtonText: "حسناً",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSponsorship = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لا يمكن التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(`https://oneheart.team.com/api/sponsorships/${id}`);
        Swal.fire({
          icon: "success",
          title: "تم الحذف!",
          text: "تم حذف الكفالة بنجاح",
          confirmButtonText: "حسناً",
        });
        fetchSponsorships();
      } catch (error) {
        console.error("Error deleting sponsorship:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: "حدث خطأ أثناء حذف الكفالة",
          confirmButtonText: "حسناً",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">الكفالات</h1>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة كفالة جديدة
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
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((sponsorship) => (
                <tr key={sponsorship._id}>
                  <td>
                    <img
                      src={`https://oneheart.team.com/uploads/sponsorships/${sponsorship.sponsorshipImage}`}
                      alt={sponsorship.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td>{sponsorship.title}</td>
                  <td>{sponsorship.category}</td>
                  <td>{sponsorship.total}</td>
                  <td>{sponsorship.remaining}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowViewModal(sponsorship)}
                      >
                        عرض
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(sponsorship, "edit")}
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteSponsorship(sponsorship._id)}
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
            {modalMode === "add" ? "إضافة كفالة جديدة" : "تعديل الكفالة"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Main Image Upload */}
          <div className="mb-4">
            <label className="form-label fw-bold">صورة الكفالة الرئيسية</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedSponsorship({
                  ...selectedSponsorship,
                  sponsorshipImage: e.target.files[0],
                })
              }
            />
            {modalMode === "edit" && selectedSponsorship.sponsorshipImage && typeof selectedSponsorship.sponsorshipImage === 'string' && (
              <div className="mt-2">
                <img
                  src={`https://oneheart.team.com/uploads/sponsorships/${selectedSponsorship.sponsorshipImage}`}
                  alt="Current main"
                  style={{ width: "100px", height: "60px", objectFit: "cover" }}
                />
                <small className="d-block mt-1">الصورة الرئيسية الحالية</small>
              </div>
            )}
          </div>

          {/* Details Image Upload */}
          <div className="mb-4">
            <label className="form-label fw-bold">صورة تفاصيل الكفالة</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedSponsorship({
                  ...selectedSponsorship,
                  detailsImage: e.target.files[0],
                })
              }
            />
            {modalMode === "edit" && selectedSponsorship.detailsImage && typeof selectedSponsorship.detailsImage === 'string' && (
              <div className="mt-2">
                <img
                  src={`https://oneheart.team.com/uploads/sponsorships/${selectedSponsorship.detailsImage}`}
                  alt="Current details"
                  style={{ width: "100px", height: "60px", objectFit: "cover" }}
                />
                <small className="d-block mt-1">صورة التفاصيل الحالية</small>
              </div>
            )}
          </div>

          <Tabs
            activeKey={activeLanguage}
            onSelect={(k) => setActiveLanguage(k)}
            className="mb-4"
          >
            <Tab eventKey="ar" title="العربية">
              <Form>
                {/* Arabic Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">العنوان</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedSponsorship.titleAr || ""}
                    onChange={(e) =>
                      setSelectedSponsorship({
                        ...selectedSponsorship,
                        titleAr: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* Arabic Description */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">الوصف</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedSponsorship.descriptionAr || ""}
                    onChange={(e) =>
                      setSelectedSponsorship({
                        ...selectedSponsorship,
                        descriptionAr: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* Arabic Category */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">التصنيف</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedSponsorship.categoryAr || ""}
                    onChange={(e) =>
                      setSelectedSponsorship({
                        ...selectedSponsorship,
                        categoryAr: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* Arabic Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">تفاصيل إضافية</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>عنوان التفاصيل</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedSponsorship.details?.titleAr || ""}
                      onChange={(e) =>
                        setSelectedSponsorship({
                          ...selectedSponsorship,
                          details: {
                            ...selectedSponsorship.details,
                            titleAr: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>الوصف الأول</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedSponsorship.details?.description1Ar || ""}
                      onChange={(e) =>
                        setSelectedSponsorship({
                          ...selectedSponsorship,
                          details: {
                            ...selectedSponsorship.details,
                            description1Ar: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>الوصف الثاني</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedSponsorship.details?.description2Ar || ""}
                      onChange={(e) =>
                        setSelectedSponsorship({
                          ...selectedSponsorship,
                          details: {
                            ...selectedSponsorship.details,
                            description2Ar: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </div>
              </Form>
            </Tab>

            <Tab eventKey="en" title="English">
              <Form>
                {/* English Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedSponsorship.title || ""}
                    onChange={(e) =>
                      setSelectedSponsorship({
                        ...selectedSponsorship,
                        title: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* English Description */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={selectedSponsorship.description || ""}
                    onChange={(e) =>
                      setSelectedSponsorship({
                        ...selectedSponsorship,
                        description: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* English Category */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={selectedSponsorship.category || ""}
                    onChange={(e) =>
                      setSelectedSponsorship({
                        ...selectedSponsorship,
                        category: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* English Details */}
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">Additional Details</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>Details Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={selectedSponsorship.details?.title || ""}
                      onChange={(e) =>
                        setSelectedSponsorship({
                          ...selectedSponsorship,
                          details: {
                            ...selectedSponsorship.details,
                            title: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>First Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedSponsorship.details?.description1 || ""}
                      onChange={(e) =>
                        setSelectedSponsorship({
                          ...selectedSponsorship,
                          details: {
                            ...selectedSponsorship.details,
                            description1: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Second Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={selectedSponsorship.details?.description2 || ""}
                      onChange={(e) =>
                        setSelectedSponsorship({
                          ...selectedSponsorship,
                          details: {
                            ...selectedSponsorship.details,
                            description2: e.target.value,
                          },
                        })
                      }
                    />
                  </Form.Group>
                </div>
              </Form>
            </Tab>
          </Tabs>

          {/* Common Fields */}
          <div className="border rounded p-3">
            <h6 className="mb-3">المبالغ / Amounts</h6>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">المبلغ المطلوب / Required Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={selectedSponsorship.total || ""}
                    onChange={(e) =>
                      setSelectedSponsorship({
                        ...selectedSponsorship,
                        total: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">المبلغ المدفوع / Paid Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={selectedSponsorship.remaining || ""}
                    onChange={(e) =>
                      setSelectedSponsorship({
                        ...selectedSponsorship,
                        remaining: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handleSaveSponsorship}>
            {modalMode === "add" ? "إضافة" : "حفظ التغييرات"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg" dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل الكفالة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewSponsorship && (
            <div className="view-sponsorship-details">
              <div className="text-center mb-4">
                <h6 className="mb-2">الصورة الرئيسية</h6>
                <img
                  src={`https://oneheart.team.com/uploads/sponsorships/${viewSponsorship.sponsorshipImage}`}
                  alt={viewSponsorship.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

              {viewSponsorship.detailsImage && (
                <div className="text-center mb-4">
                  <h6 className="mb-2">صورة التفاصيل</h6>
                  <img
                    src={`https://oneheart.team.com/uploads/sponsorships/${viewSponsorship.detailsImage}`}
                    alt={`${viewSponsorship.title} details`}
                    className="img-fluid"
                    style={{ maxHeight: "300px", objectFit: "contain" }}
                  />
                </div>
              )}

              <div className="mb-4">
                <h5 className="border-bottom pb-2">العنوان</h5>
                <p className="text-muted mb-1">بالعربية: {viewSponsorship.titleAr}</p>
                <p>بالإنجليزية: {viewSponsorship.title}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">الوصف</h5>
                <p className="text-muted mb-1">بالعربية: {viewSponsorship.descriptionAr}</p>
                <p>بالإنجليزية: {viewSponsorship.description}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">التصنيف</h5>
                <p className="text-muted mb-1">بالعربية: {viewSponsorship.categoryAr}</p>
                <p>بالإنجليزية: {viewSponsorship.category}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">المبالغ</h5>
                <p className="mb-1">المبلغ الكلي: {viewSponsorship.total}</p>
                <p>المبلغ المتبقي: {viewSponsorship.remaining}</p>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">تفاصيل إضافية</h5>
                
                <div className="mb-3">
                  <h6>العنوان</h6>
                  <p className="text-muted mb-1">بالعربية: {viewSponsorship.details?.titleAr}</p>
                  <p>بالإنجليزية: {viewSponsorship.details?.title}</p>
                </div>

                <div className="mb-3">
                  <h6>الوصف الأول</h6>
                  <p className="text-muted mb-1">بالعربية: {viewSponsorship.details?.description1Ar}</p>
                  <p>بالإنجليزية: {viewSponsorship.details?.description1}</p>
                </div>

                <div className="mb-3">
                  <h6>الوصف الثاني</h6>
                  <p className="text-muted mb-1">بالعربية: {viewSponsorship.details?.description2Ar}</p>
                  <p>بالإنجليزية: {viewSponsorship.details?.description2}</p>
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
