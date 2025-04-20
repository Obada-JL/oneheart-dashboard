import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";
import { Modal, Form } from "react-bootstrap";

const SupportCampaigns = () => {
    const [selectedCampaign, setSelectedCampaign] = useState({
        title: "",
        titleAr: "",
        description: "",
        descriptionAr: "",
        category: "",
        categoryAr: "",
        image: null,
        total: 0,
        paid: 0,
        donationLinks: []
    });

    const [modalMode, setModalMode] = useState("add");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Add helper functions for donation links
    const addDonationLink = () => {
        setSelectedCampaign(prev => ({
            ...prev,
            donationLinks: [...(prev.donationLinks || []), { methodName: "", link: "" }]
        }));
    };

    const updateDonationLink = (index, field, value) => {
        setSelectedCampaign(prev => {
            const newLinks = [...(prev.donationLinks || [])];
            newLinks[index] = { ...newLinks[index], [field]: value };
            return { ...prev, donationLinks: newLinks };
        });
    };

    const removeDonationLink = (index) => {
        setSelectedCampaign(prev => {
            const newLinks = [...(prev.donationLinks || [])];
            newLinks.splice(index, 1);
            return { ...prev, donationLinks: newLinks };
        });
    };

    // Update handleShowModal to handle donation links
    const handleShowModal = (campaign = {}, mode = "add") => {
        setModalMode(mode);
        setShowModal(true);

        if (mode === "add") {
            setSelectedCampaign({
                title: "",
                titleAr: "",
                description: "",
                descriptionAr: "",
                category: "",
                categoryAr: "",
                image: null,
                total: 0,
                paid: 0,
                donationLinks: []
            });
        } else {
            // Parse donation links if they exist
            let parsedDonationLinks = [];
            if (campaign.donationLinks) {
                try {
                    parsedDonationLinks = typeof campaign.donationLinks === 'string'
                        ? JSON.parse(campaign.donationLinks)
                        : campaign.donationLinks;
                } catch (error) {
                    console.error("Error parsing donation links:", error);
                    parsedDonationLinks = [];
                }
            }

            setSelectedCampaign({
                ...campaign,
                donationLinks: parsedDonationLinks
            });
        }
    };

    // Update handleSaveCampaign to handle donation links
    const handleSaveCampaign = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();

        try {
            // Validate all required fields
            const requiredFields = {
                title: "العنوان بالإنجليزية",
                titleAr: "العنوان بالعربية",
                description: "الوصف بالإنجليزية",
                descriptionAr: "الوصف بالعربية",
                category: "التصنيف بالإنجليزية",
                categoryAr: "التصنيف بالعربية",
                total: "المبلغ المطلوب",
                paid: "المبلغ المدفوع"
            };

            const missingFields = [];
            Object.entries(requiredFields).forEach(([field, label]) => {
                if (!selectedCampaign[field]) {
                    missingFields.push(label);
                }
            });

            if (modalMode === "add" && !selectedCampaign.image) {
                missingFields.push("الصورة الرئيسية");
            }

            if (missingFields.length > 0) {
                await Swal.fire({
                    title: 'حقول مطلوبة',
                    html: `الرجاء إكمال الحقول التالية:<br>${missingFields.join("<br>")}`,
                    icon: 'warning',
                    confirmButtonText: 'حسناً'
                });
                setLoading(false);
                return;
            }

            // Append main fields
            Object.entries(requiredFields).forEach(([field]) => {
                formData.append(field, selectedCampaign[field] || "");
            });

            // Append main image
            if (selectedCampaign.image instanceof File) {
                formData.append("image", selectedCampaign.image);
            }

            // Handle donation links
            if (selectedCampaign.donationLinks && selectedCampaign.donationLinks.length > 0) {
                // Filter out incomplete donation links
                const validLinks = selectedCampaign.donationLinks.filter(
                    link => link.methodName && link.link
                );

                if (validLinks.length > 0) {
                    formData.append("donationLinks", JSON.stringify(validLinks));
                }
            }

            const url =
                modalMode === "add"
                    ? "http://localhost:3500/api/support-campaigns"
                    : `http://localhost:3500/api/support-campaigns/${selectedCampaign._id}`;

            const method = modalMode === "add" ? "post" : "put";

            await axios[method](url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            await Swal.fire({
                title: 'تم بنجاح',
                text: modalMode === "add" ? 'تم إضافة الحملة بنجاح' : 'تم تحديث الحملة بنجاح',
                icon: 'success',
                confirmButtonText: 'حسناً'
            });

            fetchCampaigns();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving campaign:", error);
            await Swal.fire({
                title: 'خطأ',
                text: error.response?.data?.message || "حدث خطأ أثناء حفظ الحملة",
                icon: 'error',
                confirmButtonText: 'حسناً'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* ... existing code ... */}
        </div>
    );
};

export default SupportCampaigns; 