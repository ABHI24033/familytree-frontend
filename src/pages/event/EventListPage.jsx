import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import EventList from "../../components/event/EventList";
import { useEventList } from "../../hooks/event/useEventList";
import MasterLayout from "../../masterLayout/MasterLayout";

export default function EventListPage() {
    const {
        events,
        error,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        refetch,
    } = useEventList({ limit: 9 });

    return (
        <MasterLayout>
            <div className="container py-4 py-md-5">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div>
                                <h2 className="fw-bold mb-1 fs-3 d-flex align-items-center">
                                    <Icon icon="mdi:calendar-multiple" width={32} className="text-primary me-3" />
                                    All Events
                                </h2>
                                <p className="text-muted mb-0">
                                    Browse and discover upcoming family events
                                </p>
                            </div>
                            <Link
                                to="/events/create-event"
                                className="btn btn-primary px-5 py-10 d-flex align-items-center"
                            >
                                <Icon icon="mdi:plus" width={20} className="me-2" />
                                Create Event
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filter Section (Optional - can be added later) */}
                {/* <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-body p-3">
                        <div className="row g-3 align-items-center">
                            <div className="col-12 col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text bg-transparent">
                                        <Icon icon="mdi:magnify" width={20} />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search events..."
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-3">
                                <select className="form-select">
                                    <option value="">All Types</option>
                                    <option value="inperson">In-Person</option>
                                    <option value="virtual">Virtual</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-3">
                                <button
                                    className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                                    onClick={() => refetch()}
                                >
                                    <Icon icon="mdi:refresh" width={18} className="me-2" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Error State */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <Icon icon="mdi:alert-circle" width={24} className="me-2" />
                        <div>
                            <strong>Error:</strong> {error.message || "Failed to load events"}
                        </div>
                    </div>
                )}

                {/* Event List */}
                <div className="mt-40">
                    <EventList
                        events={events}
                        isLoading={isLoading}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        onLoadMore={() => fetchNextPage()}
                    />
                </div>
            </div>
        </MasterLayout>
    );
}
