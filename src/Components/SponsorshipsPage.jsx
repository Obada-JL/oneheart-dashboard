import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";
import Swal from "sweetalert2"; // Add this import

export default function SponsorshipsPage() {
  const [sponsorships, setSponsorships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSponsorship, setSelectedSponsorship] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSponsorship, setViewSponsorship] = useState(null);

  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3500/api/sponsorships"
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
    if (mode === "edit") {
      setSelectedSponsorship({
        ...sponsorship,
        details: sponsorship.details || {
          title: "",
          titleAr: "",
          description1: "",
          description1Ar: "",
          description2: "",
          description2Ar: "",
        }
      });
    } else {
      setSelectedSponsorship({
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        donationLink: "",
        category: "",
        categoryAr: "",
        total: "",
        remaining: "",
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
    setShowModal(false);
    setSelectedSponsorship({});
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
      donationLink: "رابط التبرع",
      category: "التصنيف بالإنجليزية",
      categoryAr: "التصنيف بالعربية",
      total: "المبلغ الكلي",
      remaining: "المبلغ المتبقي",
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
      if (!value || value.trim() === '') {
        missingFields.push(label);
      }
    });

    // Check image for new sponsorships
    if (modalMode === "add" && !selectedSponsorship.sponsorshipImage) {
      missingFields.push("الصورة");
    }

    if (missingFields.length > 0) {
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

      // Prepare the data
      const data = {
        title: selectedSponsorship.title,
        titleAr: selectedSponsorship.titleAr,
        description: selectedSponsorship.description,
        descriptionAr: selectedSponsorship.descriptionAr,
        donationLink: selectedSponsorship.donationLink,
        category: selectedSponsorship.category,
        categoryAr: selectedSponsorship.categoryAr,
        total: selectedSponsorship.total,
        remaining: selectedSponsorship.remaining,
      };

      // Append main fields to formData
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append details as JSON string
      formData.append("details", JSON.stringify(details));

      // Append image if new one is selected
      if (selectedSponsorship.sponsorshipImage instanceof File) {
        formData.append("sponsorshipImage", selectedSponsorship.sponsorshipImage);
      }

      if (modalMode === "add") {
        await axios.post("http://localhost:3500/api/sponsorships", formData);
        Swal.fire({
          icon: "success",
          title: "تم بنجاح!",
          text: "تمت إضافة الكفالة بنجاح",
          confirmButtonText: "حسناً",
        });
      } else {
        await axios.put(
          `http://localhost:3500/api/sponsorships/${selectedSponsorship._id}`,
          formData
        );
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
        await axios.delete(`http://localhost:3500/api/sponsorships/${id}`);
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
                <th>المبلغ الكلي</th>
                <th>المبلغ المتبقي</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((sponsorship) => (
                <tr key={sponsorship._id}>
                  <td>
                    <img
                      src={`http://localhost:3500/uploads/sponsorships/${sponsorship.sponsorshipImage}`}
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
          {/* Image Upload */}
          <div className="mb-4">
            <label className="form-label fw-bold">صورة الكفالة</label>
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
          </div>

          {/* Title Section */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">العنوان</h6>
            <div className="mb-3">
              <label className="form-label">بالعربية</label>
              <input
                type="text"
                className="form-control"
                value={selectedSponsorship.titleAr || ""}
                onChange={(e) =>
                  setSelectedSponsorship({
                    ...selectedSponsorship,
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
                value={selectedSponsorship.title || ""}
                onChange={(e) =>
                  setSelectedSponsorship({
                    ...selectedSponsorship,
                    title: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">الوصف</h6>
            <div className="mb-3">
              <label className="form-label">بالعربية</label>
              <textarea
                className="form-control"
                value={selectedSponsorship.descriptionAr || ""}
                onChange={(e) =>
                  setSelectedSponsorship({
                    ...selectedSponsorship,
                    descriptionAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">بالإنجليزية</label>
              <textarea
                className="form-control"
                value={selectedSponsorship.description || ""}
                onChange={(e) =>
                  setSelectedSponsorship({
                    ...selectedSponsorship,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Category Section */}
          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">التصنيف</h6>
            <div className="mb-3">
              <label className="form-label">التصنيف بالعربية</label>
              <input
                type="text"
                className="form-control"
                value={selectedSponsorship.categoryAr || ""}
                onChange={(e) =>
                  setSelectedSponsorship({
                    ...selectedSponsorship,
                    categoryAr: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">التصنيف بالإنجليزية</label>
              <input
                type="text"
                className="form-control"
                value={selectedSponsorship.category || ""}
                onChange={(e) =>
                  setSelectedSponsorship({
                    ...selectedSponsorship,
                    category: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">رابط التبرع</label>
            <input
              type="text"
              className="form-control"
              value={selectedSponsorship.donationLink || ""}
              onChange={(e) =>
                setSelectedSponsorship({
                  ...selectedSponsorship,
                  donationLink: e.target.value,
                })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">المبلغ الكلي</label>
            <input
              type="number"
              className="form-control"
              value={selectedSponsorship.total || ""}
              onChange={(e) =>
                setSelectedSponsorship({
                  ...selectedSponsorship,
                  total: e.target.value,
                })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">المبلغ المتبقي</label>
            <input
              type="number"
              className="form-control"
              value={selectedSponsorship.remaining || ""}
              onChange={(e) =>
                setSelectedSponsorship({
                  ...selectedSponsorship,
                  remaining: e.target.value,
                })
              }
            />
          </div>

          <div className="mb-4">
            <h6 className="mb-3 border-bottom pb-2">تفاصيل إضافية</h6>
            <div className="mb-3">
              <label className="form-label">عنوان التفاصيل بالعربية</label>
              <input
                type="text"
                className="form-control"
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
            </div>
            <div className="mb-3">
              <label className="form-label">عنوان التفاصيل بالإنجليزية</label>
              <input
                type="text"
                className="form-control"
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
            </div>
            <div className="mb-3">
              <label className="form-label">الوصف الأول بالعربية</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="mb-3">
              <label className="form-label">الوصف الأول بالإنجليزية</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="mb-3">
              <label className="form-label">الوصف الثاني بالعربية</label>
              <textarea
                className="form-control"
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
            </div>
            <div className="mb-3">
              <label className="form-label">الوصف الثاني بالإنجليزية</label>
              <textarea
                className="form-control"
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
                <img
                  src={`http://localhost:3500/uploads/sponsorships/${viewSponsorship.sponsorshipImage}`}
                  alt={viewSponsorship.title}
                  className="img-fluid"
                  style={{ maxHeight: "300px", objectFit: "contain" }}
                />
              </div>

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
                <h5 className="border-bottom pb-2">رابط التبرع</h5>
                <a href={viewSponsorship.donationLink} target="_blank" rel="noopener noreferrer">
                  {viewSponsorship.donationLink}
                </a>
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
