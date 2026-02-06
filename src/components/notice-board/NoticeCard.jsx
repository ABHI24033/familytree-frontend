// import { Link } from "react-router-dom";
// import "./notice.css";
// import { formatDate } from "../../helper/DateFormatter";

// export default function NoticeCard({ notice }) {
//   return (
//     <div
//       className="card h-100 radius-8 border shadow-sm overflow-hidden"
//       style={{ minHeight: "280px" }}
//     >
//       <div className="card-body p-24 d-flex flex-column">

//         {/* Category + Date */}
//         <div className="d-flex align-items-center justify-content-between flex-wrap gap-6 mb-16">
//           <span className="px-20 py-6 bg-neutral-100 rounded-pill text-neutral-600 fw-medium">
//             {notice.category || "General"}
//           </span>

//           <div className="d-flex align-items-center gap-8 text-neutral-500 fw-medium">
//             <i className="ri-calendar-2-line" />
//             {formatDate(notice.createdAt) || ""}
//           </div>
//         </div>

//         {/* Title */}
//         <h6 className="text-xl fw-bold mb-12 text-truncate-2">
//           <Link
//             to={`/notices/${notice.slug || notice._id}`}
//             className="text-hover-primary-600 transition-2 text-decoration-none text-dark"
//           >
//             {notice.title}
//           </Link>
//         </h6>

//         {/* Description */}
//         <p className="text-neutral-500 text-truncate-3 mb-16 flex-grow-0" style={{ minHeight: "66px" }}>
//           {notice.shortDescription || notice.description}
//         </p>

//         <div className="flex-grow-1"></div>

//         {/* Read More */}
//         <Link
//           to={`/notices/${notice.slug || notice._id}`}
//           className="d-flex align-items-center gap-8 fw-semibold text-neutral-900 text-hover-primary-600 transition-2 mt-auto"
//         >
//           Read More
//           <i className="ri-arrow-right-double-line text-xl" />
//         </Link>
//       </div>
//     </div>
//   );
// }

import { Link } from "react-router-dom";
import "./notice.css";
import { formatDate } from "../../helper/DateFormatter";

export default function NoticeCard({ notice }) {
  return (
    <div className="notice-card-wrapper">

      {/* Pin on top */}
      <div className="notice-pin"></div>

      <div className="notice-card-paper">
        {/* Category + Date */}
        <div className="notice-header">
          <span className="notice-category">
            {notice.category || "General"}
          </span>

          <span className="notice-date">
            <i className="ri-calendar-2-line"></i>
            {formatDate(notice.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h4 className="notice-title">
          <Link to={`/notices/${notice.slug || notice._id}`}>
            {notice.title}
          </Link>
        </h4>

        {/* Description */}
        <p className="notice-description">
          {notice.shortDescription || notice.description}
        </p>

        {/* Read More */}
        <Link
          to={`/notice/${notice.slug || notice._id}`}
          className="notice-readmore"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}


