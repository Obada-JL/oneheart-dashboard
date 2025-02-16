import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Spinner } from "react-bootstrap";

const SettingsComponents = () => {
  const [activeTab, setActiveTab] = useState("sliders");
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [modalMode, setModalMode] = useState("add");
  const [loading, setLoading] = useState(false);

  // Fetch items based on active tab
  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "sliders" ? "image-slider" : "counter";
      const response = await axios.get(`http://localhost:3500/api/${endpoint}`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleShowModal = (item = {}, mode = "add") => {
    setSelectedItem(item);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem({});
  };

  const handleSaveItem = async () => {
    setLoading(true);
    const formData = new FormData();
    const endpoint = activeTab === "sliders" ? "image-slider" : "counter";

    if (activeTab === "sliders") {
      formData.append("sliderTitle", selectedItem.sliderTitle || "");
      formData.append(
        "sliderDescription",
        selectedItem.sliderDescription || ""
      );
      formData.append("donationsLink", selectedItem.donationsLink || "");
      formData.append("detailsLink", selectedItem.detailsLink || "");
      if (selectedItem.sliderImage instanceof File) {
        formData.append("sliderImage", selectedItem.sliderImage);
      }
    } else {
      formData.append("counterTitle", selectedItem.counterTitle || "");
      formData.append("counterNumber", selectedItem.counterNumber || "");
      if (selectedItem.counterImage instanceof File) {
        formData.append("counterImage", selectedItem.counterImage);
      }
    }

    try {
      if (modalMode === "add") {
        await axios.post(`http://localhost:3500/api/${endpoint}`, formData);
      } else {
        await axios.put(
          `http://localhost:3500/api/${endpoint}/${selectedItem._id}`,
          formData
        );
      }
      fetchItems();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      setLoading(true);
      try {
        const endpoint = activeTab === "sliders" ? "image-slider" : "counter";
        await axios.delete(`http://localhost:3500/api/${endpoint}/${id}`);
        fetchItems();
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderForm = () => {
    if (activeTab === "sliders") {
      return (
        <>
          <div className="mb-3">
            <label className="form-label">العنوان</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.sliderTitle || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  sliderTitle: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الوصف</label>
            <textarea
              className="form-control"
              value={selectedItem.sliderDescription || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  sliderDescription: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">رابط التبرع</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.donationsLink || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  donationsLink: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">رابط التفاصيل</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.detailsLink || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  detailsLink: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الصورة</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  sliderImage: e.target.files[0],
                })
              }
            />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="mb-3">
            <label className="form-label">العنوان</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.counterTitle || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  counterTitle: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">العدد</label>
            <input
              type="text"
              className="form-control"
              value={selectedItem.counterNumber || ""}
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  counterNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">الأيقونة</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) =>
                setSelectedItem({
                  ...selectedItem,
                  counterImage: e.target.files[0],
                })
              }
            />
          </div>
        </>
      );
    }
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="btn-group" dir="rtl">
          <button
            className={`btn ${
              activeTab === "sliders" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setActiveTab("sliders")}
          >
            السلايدر
          </button>
          <button
            className={`btn ${
              activeTab === "counters" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setActiveTab("counters")}
          >
            العدادات
          </button>
        </div>
        <Button variant="primary" onClick={() => handleShowModal({}, "add")}>
          إضافة {activeTab === "sliders" ? "سلايد" : "عداد"} جديد
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table hover className="align-middle">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>العنوان</th>
              {activeTab === "counters" && <th>العدد</th>}
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={`http://localhost:3500/uploads/${
                      activeTab == "sliders" ? "sliderImages" : "counterImages"
                    }/${
                      activeTab === "sliders"
                        ? item.sliderImage
                        : item.counterImage
                    }`}
                    alt=""
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>
                  {activeTab === "sliders"
                    ? item.sliderTitle
                    : item.counterTitle}
                </td>
                {activeTab === "counters" && <td>{item.counterNumber}</td>}
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleShowModal(item, "edit")}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteItem(item._id)}
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
            {modalMode === "add" ? "إضافة" : "تعديل"}{" "}
            {activeTab === "sliders" ? "سلايد" : "عداد"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderForm()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handleSaveItem}>
            {modalMode === "add" ? "إضافة" : "حفظ التغييرات"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SettingsComponents;
