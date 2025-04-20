import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Spinner, Card } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

export default function DocumentationPhotos() {
  const { docId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3500/api/photos/${docId}`
      );
      setPhotos(response.data);
    } catch (error) {
      console.error("Error fetching photos:", error);
      Swal.fire("خطأ!", "حدث خطأ أثناء تحميل الصور", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [docId]);

  const handlePhotoUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });
    formData.append("docId", docId);

    try {
      setLoading(true);
      await axios.post("http://localhost:3500/api/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("تم!", "تم رفع الصور بنجاح", "success");
      fetchPhotos();
    } catch (error) {
      console.error("Error uploading photos:", error);
      Swal.fire("خطأ!", "حدث خطأ أثناء رفع الصور", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استعادة هذه الصورة!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3500/api/photos/${photoId}`);
        fetchPhotos();
        Swal.fire("تم الحذف!", "تم حذف الصورة بنجاح.", "success");
      } catch (error) {
        console.error("Error deleting photo:", error);
        Swal.fire("خطأ!", "حدث خطأ أثناء حذف الصورة", "error");
      }
    }
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>صور التوثيق</h1>
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button as="span">إضافة صور</Button>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">جاري التحميل...</p>
        </div>
      ) : (
        <div className="row g-4">
          {photos.map((photo) => (
            <div key={photo._id} className="col-md-4">
              <Card>
                <Card.Img
                  variant="top"
                  src={`http://localhost:3500/uploads/documentation/${photo.image}`}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body className="text-center">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePhoto(photo._id)}
                  >
                    حذف
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
