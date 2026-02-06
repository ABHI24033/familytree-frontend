import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";

const EventRSVPForm = ({
    isAuthenticated,
    userStatus = "pending",
    userTotalAttendees = 1,
    userVegAttendees = 0,
    userNonVegAttendees = 0,
    userCity = "",
    onSubmit,
    isExternal = false,
    isLoading = false
}) => {
    // Initial View Mode: If user has already responded (not pending), show Summary. Else Form.
    const [viewMode, setViewMode] = useState(userStatus && userStatus !== "pending" ? "summary" : "form");

    // Form State
    const [status, setStatus] = useState(userStatus === "pending" ? "" : userStatus);
    const [total, setTotal] = useState(userTotalAttendees || 1);
    const [veg, setVeg] = useState(userVegAttendees || 0);
    const [nonVeg, setNonVeg] = useState(userNonVegAttendees || (userTotalAttendees - userVegAttendees) || 0);
    const [city, setCity] = useState(userCity || "");

    // Autocomplete State
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFetchingCities, setIsFetchingCities] = useState(false);

    // Guest fields for non-auth users
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");

    // Fetch Indian Cities
    useEffect(() => {
        const fetchCities = async () => {
            setIsFetchingCities(true);
            try {
                const response = await axios.post("https://countriesnow.space/api/v0.1/countries/cities", {
                    country: "India"
                });
                if (response.data && !response.data.error) {
                    setCities(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            } finally {
                setIsFetchingCities(false);
            }
        };
        fetchCities();
    }, []);

    // Effect to filter cities
    useEffect(() => {
        if (city.trim().length > 1) {
            const filtered = cities.filter(c =>
                c.toLowerCase().startsWith(city.toLowerCase())
            ).slice(0, 10);
            setFilteredCities(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setFilteredCities([]);
            setShowSuggestions(false);
        }
    }, [city, cities]);

    // Effect to sync Veg/Non-Veg with Total
    useEffect(() => {
        // If total changes and current sum doesn't match, adjust Non-Veg as default
        if (veg + nonVeg !== total) {
            if (veg > total) {
                setVeg(total);
                setNonVeg(0);
            } else {
                setNonVeg(total - veg);
            }
        }
    }, [total]);

    // Update state if props change (e.g. re-fetch)
    useEffect(() => {
        if (userStatus && userStatus !== 'pending') {
            setStatus(userStatus);
            // If we receive a status update and we are in form mode (but not dirty? handling dirty state is complex, 
            // for now let's not force viewMode change unless it was pending)
            if (viewMode === 'form' && status === "") { // Only if form was empty/clean
                setViewMode("summary");
            }
        }
    }, [userStatus]);

    const handleVegChange = (val) => {
        const v = parseInt(val);
        setVeg(v);
        setNonVeg(total - v);
    };

    const handleNonVegChange = (val) => {
        const nv = parseInt(val);
        setNonVeg(nv);
        setVeg(total - nv);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (status === "") {
            alert("Please select your attendance status");
            return;
        }

        if (status !== "rejected" && !city.trim()) {
            alert("Please provide your city");
            return;
        }

        const data = {
            status,
            totalAttendees: status === "rejected" ? 0 : total,
            vegAttendees: status === "rejected" ? 0 : veg,
            nonVegAttendees: status === "rejected" ? 0 : nonVeg,
            city: status === "rejected" ? "" : city,
            name,
            mobile
        };

        onSubmit(data);
    };

    // --- VIEW: SUMMARY (Already Responded) ---
    if (viewMode === "summary") {
        const isYes = status === "accepted";
        const isMaybe = status === "maybe";
        const isNo = status === "rejected";

        return (
            <div className={`text-center bg-white border rounded-4 animation-fade-in p-4 ${isNo ? 'border-danger-subtle' : isMaybe ? 'border-warning-subtle' : 'border-success-subtle'}`}>
                {/* Icon */}
                <div className={`mb-3 d-inline-flex p-3 rounded-circle ${isNo ? 'bg-danger-subtle' : isMaybe ? 'bg-warning-subtle' : 'bg-success-subtle'}`}>
                    <Icon
                        icon={isNo ? "solar:sad-square-linear" : isMaybe ? "solar:question-circle-linear" : "solar:check-circle-linear"}
                        width={40}
                        className={isNo ? "text-danger" : isMaybe ? "text-warning" : "text-success"}
                    />
                </div>

                {/* Title */}
                <p className="text-uppercase text-muted fw-bold small mb-1" style={{ letterSpacing: "1px" }}>Response Submitted</p>
                <h5 className="fw-bold text-dark mb-2">
                    {isNo ? "You're not attending" : isMaybe ? "You might attend" : "You are attending"}
                </h5>

                {/* Status Badge */}
                <div className="mb-3">
                    <span className={`badge ${isNo ? 'bg-danger' : isMaybe ? 'bg-warning text-dark' : 'bg-success'} px-3 py-2 rounded-pill`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </div>

                {/* City */}
                {status !== "rejected" && city && (
                    <div className="mb-3 d-flex align-items-center justify-content-center gap-1 text-muted small">
                        <Icon icon="solar:map-point-linear" />
                        <span>{city}</span>
                    </div>
                )}

                {/* Message */}
                <p className="text-secondary small mb-4">
                    {isNo
                        ? "We're sorry you won't be able to join us. Your response has been noted."
                        : "Thank you for letting us know. We look forward to seeing you!"}
                </p>

                {/* Edit Button */}
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-4 fw-semibold border"
                    onClick={() => setViewMode("form")}
                >
                    <Icon icon="mdi:pencil" className="me-1" /> Change Response
                </button>
            </div>
        );
    }

    // --- VIEW: FORM ---
    return (
        <form onSubmit={handleSubmit} className="animation-fade-in">
            {/* Public Guest Fields - Visible initially if external */}
            {isExternal && (
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <label className="small fw-bold text-dark mb-1">Your Name <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control border-light-dark shadow-xs"
                            placeholder="Full name"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="col-12">
                        <label className="small fw-bold text-dark mb-1">Mobile Number <span className="text-danger">*</span></label>
                        <input
                            type="tel"
                            className="form-control border-light-dark shadow-xs"
                            placeholder="Contact number"
                            required
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Status Selection */}
            <div className="mb-4">
                <label className="fw-bold small mb-2 d-block text-secondary">Aттending the event?</label>
                <div className="btn-group w-100" role="group">
                    <input type="radio" className="btn-check" name="status" id="rsvp-yes" checked={status === "accepted"} onChange={() => setStatus("accepted")} />
                    <label className="btn btn-outline-success py-10 fw-bold" htmlFor="rsvp-yes">Yes</label>

                    <input type="radio" className="btn-check" name="status" id="rsvp-maybe" checked={status === "maybe"} onChange={() => setStatus("maybe")} />
                    <label className="btn btn-outline-warning py-10 fw-bold" htmlFor="rsvp-maybe">Maybe</label>

                    <input type="radio" className="btn-check" name="status" id="rsvp-no" checked={status === "rejected"} onChange={() => setStatus("rejected")} />
                    <label className="btn btn-outline-danger py-10 fw-bold" htmlFor="rsvp-no">No</label>
                </div>
            </div>

            {status !== 'rejected' && (
                <div className="attendance-details border-top pt-3 mt-3 animation-fade-in">
                    {/* City Field */}
                    <div className="mb-3 position-relative">
                        <label className="small fw-bold text-dark mb-1 d-block">
                            <Icon icon="solar:map-point-linear" className="me-1 text-primary" />
                            Your City <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control shadow-sm"
                            placeholder="Type to search your city..."
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            onFocus={() => { if (filteredCities.length > 0) setShowSuggestions(true); }}
                            autoComplete="off"
                        />
                        {showSuggestions && (
                            <div className="position-absolute w-100 shadow-lg border border-light mt-1 rounded-3 overflow-hidden bg-white" style={{ zIndex: 100, maxHeight: "200px", overflowY: "auto" }}>
                                {filteredCities.map((c, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className="btn btn-white w-100 text-start border-0 border-bottom p-2 small hover-bg-light"
                                        onClick={() => {
                                            setCity(c);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                        {isFetchingCities && city.length === 0 && (
                            <div className="position-absolute end-0 top-50 translate-middle-y me-3">
                                <span className="spinner-border spinner-border-sm text-muted" role="status"></span>
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="small fw-bold text-dark mb-1 d-block">
                            <Icon icon="solar:users-group-two-rounded-linear" className="me-1 text-primary" />
                            Total Attendees
                        </label>
                        <select
                            className="form-select shadow-sm"
                            value={total}
                            onChange={(e) => setTotal(parseInt(e.target.value))}
                        >
                            {[...Array(20)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1} Person{i > 0 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row g-2 mb-4">
                        <div className="col-6">
                            <label className="small fw-bold text-success mb-1 d-block">Vegetarian</label>
                            <select
                                className="form-select shadow-sm border-success-subtle"
                                value={veg}
                                onChange={(e) => handleVegChange(e.target.value)}
                            >
                                {[...Array(total + 1)].map((_, i) => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-6">
                            <label className="small fw-bold text-danger mb-1 d-block">Non-Vegetarian</label>
                            <select
                                className="form-select shadow-sm border-danger-subtle"
                                value={nonVeg}
                                onChange={(e) => handleNonVegChange(e.target.value)}
                            >
                                {[...Array(total + 1)].map((_, i) => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            <div className="d-flex gap-2 mt-4">
                {/* Cancel/Back Button if we are editing an existing response */}
                {userStatus && userStatus !== 'pending' && (
                    <button
                        type="button"
                        className="btn btn-light flex-grow-1 fw-bold rounded-3"
                        onClick={() => setViewMode("summary")}
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    className="btn btn-primary flex-grow-1 py-10 fw-bold rounded-3 shadow-sm"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (userStatus && userStatus !== 'pending' ? "Update RSVP" : "Submit RSVP")}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .border-light-dark { border-color: #dee2e6; }
                .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .animation-fade-in {
                    animation: fadeIn 0.3s ease-in-out;
                }
                .hover-bg-light:hover { background-color: #f8f9fa !ve; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            ` }} />
        </form>
    );
};

export default EventRSVPForm;

