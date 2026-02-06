import { useNoticeList } from "../../hooks/useNoticeList";
import Pagination from "../common/Pagination";
import NoticeCard from "./NoticeCard";

export default function NoticeList() {
    const {
        noticesQuery,
        page,
        setPage,
        search,
        setSearch,
        date,
        setDate,
    } = useNoticeList("user");

    const data = noticesQuery.data;

    return (
        <div className="bg-white rounded m-lg-10 p-lg-40 p-20">
            <h4 className="fs-4 mb-20">Notices</h4>

            {/* Filters */}
            <div className="row g-3 mb-20 align-items-end">
                <div className="col-md-6">
                    <label className="form-label text-sm fw-medium text-secondary-light">Search</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search notice..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label text-sm fw-medium text-secondary-light">Date</label>
                    <input
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Loader */}
            {noticesQuery.isLoading && <p>Loading notices...</p>}

            {/* Notices Grid */}
            <div className="row g-4">
                {data?.notices?.length > 0 ? (
                    data?.notices?.map((item) => (
                        <div className="col-md-4" key={item._id}>
                            <NoticeCard notice={item} />
                        </div>
                    ))
                ) : (
                    <p>No notices found.</p>
                )}
            </div>

            {/* Pagination */}
            <div className="mt-5">
                <Pagination
                    page={page}
                    setPage={setPage}
                    totalPages={data?.totalPages}
                />
            </div>

        </div>
    );
}
