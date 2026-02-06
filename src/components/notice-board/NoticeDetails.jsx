import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { formatDate } from "../../helper/DateFormatter";
import "./notice.css";

export default function NoticeDetails({ notice, isLoading }) {

    if (isLoading) {
        return <h2 className="text-center mt-5">Loading...</h2>;
    }

    if (!notice) {
        return <h2 className="text-center mt-5">Notice Not Found</h2>;
    }

    return (
        <div className="notice-details-container">

            <div className="notice-back-btn mb-40">
                <Link to="/notice">
                    <Icon icon="ri:arrow-left-line" /> Back to Notices
                </Link>
            </div>

            {/* Header Section */}
            <div className="notice-details-header">
                <div className="notice-pin-large"></div>

                <h1 className="notice-details-title">{notice.title}</h1>

                <div className="notice-meta-info">
                    {/* <span className="notice-tag">{notice.category}</span> */}

                    <span className="notice-date-info">
                        <Icon icon="ri:calendar-2-line" />
                        {formatDate(notice.createdAt)}
                    </span>
                </div>
            </div>

            {/* Paper Body */}
            <div className="notice-paper-body">
                <p className="notice-full-description">
                    {notice.description}
                </p>

                {notice?.pdfUrl && (
                    <div className="mt-24">
                        {/* PDF Preview Iframe */}
                        <div className="pdf-preview-wrapper bg-light rounded overflow-hidden" style={{ height: "600px", border: "1px solid #eee" }}>
                            <iframe
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(notice.pdfUrl)}&embedded=true`}
                                width="100%"
                                height="100%"
                                title="PDF Preview"
                                style={{ border: "none" }}
                            />
                        </div>
                    </div>
                )}



            </div>
        </div>
    );
}
