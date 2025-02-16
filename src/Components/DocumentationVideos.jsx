import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Spinner, Card } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

export default function DocumentationVideos() {
  const { docId } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3500/api/videos/${docId}`
      );
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      Swal.fire("خطأ!", "حدث خطأ أثناء تحميل الفيديوهات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [docId]);

  const handleVideoUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("videos", file);
    });
    formData.append("docId", docId);

    try {
      setLoading(true);
      await axios.post("http://localhost:3500/api/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire("تم!", "تم رفع الفيديوهات بنجاح", "success");
      fetchVideos();
    } catch (error) {
      console.error("Error uploading videos:", error);
      Swal.fire("خطأ!", "حدث خطأ أثناء رفع الفيديوهات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من استعادة هذا الفيديو!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف!",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3500/api/videos/${videoId}`);
        fetchVideos();
        Swal.fire("تم الحذف!", "تم حذف الفيديو بنجاح.", "success");
      } catch (error) {
        console.error("Error deleting video:", error);
        Swal.fire("خطأ!", "حدث خطأ أثناء حذف الفيديو", "error");
      }
    }
  };

  return (
    <div className="p-4 bg-light" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>فيديوهات التوثيق</h1>
        <div>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: "none" }}
            id="video-upload"
          />
          <label htmlFor="video-upload">
            <Button as="span">إضافة فيديوهات</Button>
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
          {videos.map((video) => (
            <div key={video._id} className="col-md-6">
              <Card>
                <video
                  controls
                  className="card-img-top"
                  style={{ height: "300px", objectFit: "cover" }}
                >
                  <source
                    src={`http://localhost:3500/uploads/documentation/${video.video}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <Card.Body className="text-center">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteVideo(video._id)}
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
