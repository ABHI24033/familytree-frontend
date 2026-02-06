import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import AddFriendRelativeModal from "../modals/AddFriendRelativeModal";
import UserMultiSelect from "./SearchableMultiSelect";
import Input from "../common/Input";
import TextArea from "../common/TextArea";
import { useEvent } from "../../hooks/event/useEvent";
import AlertBox from "../ui/Alert";

export default function CreateEvent() {
    const {
        allGuests,
        allExternalContacts, // [NEW]
        coverPreview,
        eventType,
        selectedGuests,
        guestListName,
        setGuestListName,
        savedGuestLists,
        selectedGuestList,
        showSaveList,
        setEventType,
        setShowSaveList,
        selectedExternalContacts, // [NEW]
        setSelectedExternalContacts, // [NEW]
        setEventName,
        setLocation,
        setVirtualLink,
        setStartDate,
        setStartTime,
        setEndDate,
        setEndTime,
        setEventDetails,
        eventName,
        location,
        googleMapLink,
        setGoogleMapLink,
        virtualLink,
        startDate,
        startTime,
        endDate,
        endTime,
        eventDetails,
        handleCover,
        handleSelectSavedList,
        handleSaveGuestList,
        handleCreateEvent,
        alert,
        setAlert,
        createEventMutation,
        setSelectedGuests,
        sendWhatsAppToFamily,
        setSendWhatsAppToFamily,
        sendWhatsAppToFriends,
        setSendWhatsAppToFriends,
        inviteWithFamily,
        setInviteWithFamily,
        friendsInviteWithFamily,
        setFriendsInviteWithFamily
    } = useEvent();

    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="container py-4 py-md-5">
            <button className="btn btn-link d-flex align-items-center text-decoration-none ps-0 text-muted fw-medium inner-shadow-sm" onClick={() => navigate(-1)}>
                <Icon icon="mdi:arrow-left" className="me-2" width="28" height="28" /> Back
            </button>
            <div className="row justify-content-center">
                <div className="col-12">
                    {/* Header Card */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-3 p-md-4">
                            <div className="d-flex align-items-center">
                                <Icon icon="mdi:calendar-plus" width={32} className="text-primary me-3" />
                                <div>
                                    <h4 className="mb-0 fw-bold">Create New Event</h4>
                                    <p className="text-muted mb-0 small">Plan and share your special moments</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-3 p-md-5">
                            <div className="row g-4">
                                {/* LEFT COLUMN */}
                                <div className="col-lg-6">
                                    {/* Cover Photo Section */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold mb-2 d-flex align-items-center">
                                            <Icon icon="mdi:image" className="me-4 text-lg" />
                                            Event Cover Photo
                                        </label>
                                        <div
                                            className="border rounded-3 overflow-hidden position-relative bg-light"
                                            style={{ height: "240px", cursor: "pointer" }}
                                            onClick={() => document.getElementById("coverInput").click()}
                                        >
                                            {coverPreview ? (
                                                <img
                                                    src={coverPreview}
                                                    alt="cover"
                                                    className="w-100 h-100"
                                                    style={{ objectFit: "cover" }}
                                                />
                                            ) : (
                                                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                                    <Icon icon="mdi:cloud-upload" width={48} className="text-muted mb-2" />
                                                    <p className="text-muted mb-0">Click to upload cover photo</p>
                                                    <small className="text-muted">Recommended: 1200x600px</small>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="coverInput"
                                            accept="image/*"
                                            onChange={handleCover}
                                            style={{ display: "none" }}
                                        />
                                    </div>

                                    {/* Event Name */}
                                    <Input
                                        label={
                                            <span className="d-flex align-items-center">
                                                <Icon icon="mdi:text" className="me-4 text-lg" />
                                                Event Name
                                            </span>
                                        }
                                        type="text"
                                        placeholder="Birthday Party, Wedding, Anniversary..."
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                        inputClassName="form-control-lg"
                                        required={true}
                                    />

                                    {/* Event Type */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold d-flex align-items-center">
                                            <Icon icon="mdi:format-list-bulleted" className="me-4 text-lg" />
                                            Event Type
                                            <span className="text-danger">*</span>
                                        </label>
                                        <div className="btn-group w-100" role="group">
                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="eventType"
                                                id="inperson"
                                                checked={eventType === "inperson"}
                                                onChange={() => setEventType("inperson")}
                                            />
                                            <label className="btn btn-outline-primary d-flex align-items-center" htmlFor="inperson">
                                                <Icon icon="mdi:map-marker" className="me-4 text-lg" />
                                                In-Person
                                            </label>

                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="eventType"
                                                id="virtual"
                                                checked={eventType === "virtual"}
                                                onChange={() => setEventType("virtual")}
                                            />
                                            <label className="btn btn-outline-primary d-flex align-items-center" htmlFor="virtual">
                                                <Icon icon="mdi:video" className="me-4 text-lg" />
                                                Virtual
                                            </label>
                                        </div>
                                    </div>

                                    {/* Location or Virtual Link */}
                                    {eventType === "inperson" ? (
                                        <>
                                            <Input
                                                label={
                                                    <span className="d-flex align-items-center">
                                                        <Icon icon="mdi:map-marker" className="me-4 text-lg" />
                                                        Venue Address
                                                    </span>
                                                }
                                                type="text"
                                                placeholder="Enter event location or venue address"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                            />
                                            <Input
                                                label={
                                                    <span className="d-flex align-items-center">
                                                        <Icon icon="mdi:google-maps" className="me-4 text-lg" />
                                                        Google Map Link <span className="text-muted fw-normal fs-6 ms-2">(Optional)</span>
                                                    </span>
                                                }
                                                type="url"
                                                placeholder="https://maps.app.goo.gl/..."
                                                value={googleMapLink}
                                                onChange={(e) => setGoogleMapLink(e.target.value)}
                                            />
                                        </>
                                    ) : (
                                        <Input
                                            label={
                                                <span className="d-flex align-items-center">
                                                    <Icon icon="mdi:link-variant" className="me-4 text-lg" />
                                                    Meeting Link
                                                </span>
                                            }
                                            type="url"
                                            placeholder="https://zoom.us/j/..."
                                            value={virtualLink}
                                            onChange={(e) => setVirtualLink(e.target.value)}
                                            required={true}
                                        />
                                    )}

                                    {/* Event Details Textarea */}
                                    <TextArea
                                        label={
                                            <span className="d-flex align-items-center">
                                                <Icon icon="mdi:text-box-outline" className="me-4 text-lg" />
                                                Event Description
                                            </span>
                                        }
                                        placeholder="Share more details about your event..."
                                        value={eventDetails}
                                        onChange={(e) => setEventDetails(e.target.value)}
                                        rows={3}
                                        required={true}
                                    />

                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="col-lg-6">
                                    {/* Date & Time Section */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold mb-3 d-flex align-items-center">
                                            <Icon icon="mdi:clock-outline" className="me-4 text-lg" />
                                            Event Schedule
                                        </label>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <div className="border rounded-3 p-3 bg-light">
                                                    <p className="small text-muted mb-2 fw-semibold">
                                                        Start Date & Time <span className="text-danger">*</span>
                                                    </p>
                                                    <div className="row g-2">
                                                        <div className="col-7">
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={startDate}
                                                                onChange={(e) => setStartDate(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-5">
                                                            <input
                                                                type="time"
                                                                className="form-control"
                                                                value={startTime}
                                                                onChange={(e) => setStartTime(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="border rounded-3 p-3 bg-light">
                                                    <p className="small text-muted mb-2 fw-semibold">End Date & Time <span className="text-danger">*</span></p>
                                                    <div className="row g-2">
                                                        <div className="col-7">
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={endDate}
                                                                onChange={(e) => setEndDate(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-5">
                                                            <input
                                                                type="time"
                                                                className="form-control"
                                                                value={endTime}
                                                                onChange={(e) => setEndTime(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invitation Section */}
                                    <div className="mb-0">
                                        <label className="form-label fw-semibold mb-3 d-flex align-items-center">
                                            <Icon icon="mdi:email-outline" className="me-4 text-lg" />
                                            Guest Invitation
                                        </label>

                                        {/* WhatsApp Selection Radios */}
                                        <div className="border rounded-4 p-20 bg-white shadow-sm mb-4">
                                            <div className="row g-4">
                                                <div className="col-md-6 border-end-md">
                                                    <label className="form-label fw-bold small mb-3 d-flex align-items-center">
                                                        <Icon icon="mdi:whatsapp" className="text-success me-2 text-lg" />
                                                        Family Invite Format
                                                    </label>
                                                    <div className="d-flex flex-column gap-2">
                                                        <div className="form-check custom-radio-card p-0">
                                                            <input
                                                                className="btn-check"
                                                                type="radio"
                                                                name="familyInvite"
                                                                id="famNone"
                                                                checked={!sendWhatsAppToFamily}
                                                                onChange={() => setSendWhatsAppToFamily(false)}
                                                            />
                                                            <label className="btn btn-outline-secondary w-100 text-start py-2 px-3 rounded-3" htmlFor="famNone">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:bell-off-outline" className="me-2" />
                                                                    <span>None (No WhatsApp)</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                        <div className="form-check custom-radio-card p-0">
                                                            <input
                                                                className="btn-check"
                                                                type="radio"
                                                                name="familyInvite"
                                                                id="famInd"
                                                                checked={sendWhatsAppToFamily && !inviteWithFamily}
                                                                onChange={() => {
                                                                    setSendWhatsAppToFamily(true);
                                                                    setInviteWithFamily(false);
                                                                }}
                                                            />
                                                            <label className="btn btn-outline-primary w-100 text-start py-2 px-3 rounded-3" htmlFor="famInd">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:account-outline" className="me-2" />
                                                                    <span>Invite without Family (Individual)</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                        <div className="form-check custom-radio-card p-0">
                                                            <input
                                                                className="btn-check"
                                                                type="radio"
                                                                name="familyInvite"
                                                                id="famWith"
                                                                checked={sendWhatsAppToFamily && inviteWithFamily}
                                                                onChange={() => {
                                                                    setSendWhatsAppToFamily(true);
                                                                    setInviteWithFamily(true);
                                                                }}
                                                            />
                                                            <label className="btn btn-outline-primary w-100 text-start py-2 px-3 rounded-3" htmlFor="famWith">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:account-group-outline" className="me-2" />
                                                                    <span>Invite with Full Family</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label fw-bold small mb-3 d-flex align-items-center">
                                                        <Icon icon="mdi:whatsapp" className="text-info me-2 text-lg" />
                                                        Friends Invite Format
                                                    </label>
                                                    <div className="d-flex flex-column gap-2">
                                                        <div className="form-check custom-radio-card p-0">
                                                            <input
                                                                className="btn-check"
                                                                type="radio"
                                                                name="friendInvite"
                                                                id="friNone"
                                                                checked={!sendWhatsAppToFriends}
                                                                onChange={() => setSendWhatsAppToFriends(false)}
                                                            />
                                                            <label className="btn btn-outline-secondary w-100 text-start py-2 px-3 rounded-3" htmlFor="friNone">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:bell-off-outline" className="me-2" />
                                                                    <span>None (No WhatsApp)</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                        <div className="form-check custom-radio-card p-0">
                                                            <input
                                                                className="btn-check"
                                                                type="radio"
                                                                name="friendInvite"
                                                                id="friInd"
                                                                checked={sendWhatsAppToFriends && !friendsInviteWithFamily}
                                                                onChange={() => {
                                                                    setSendWhatsAppToFriends(true);
                                                                    setFriendsInviteWithFamily(false);
                                                                }}
                                                            />
                                                            <label className="btn btn-outline-primary w-100 text-start py-2 px-3 rounded-3" htmlFor="friInd">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:account-outline" className="me-2" />
                                                                    <span>Invite without Family (Individual)</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                        <div className="form-check custom-radio-card p-0">
                                                            <input
                                                                className="btn-check"
                                                                type="radio"
                                                                name="friendInvite"
                                                                id="friWith"
                                                                checked={sendWhatsAppToFriends && friendsInviteWithFamily}
                                                                onChange={() => {
                                                                    setSendWhatsAppToFriends(true);
                                                                    setFriendsInviteWithFamily(true);
                                                                }}
                                                            />
                                                            <label className="btn btn-outline-primary w-100 text-start py-2 px-3 rounded-3" htmlFor="friWith">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:account-group-outline" className="me-2" />
                                                                    <span>Invite with Full Family</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 1. Quick Select From Group */}
                                        <div className="border rounded-3 p-3 bg-light mb-3">
                                            <label className="form-label fw-semibold small d-flex align-items-center">
                                                <Icon icon="mdi:bookmark-multiple" className="me-2 text-lg" />
                                                Quick Select from Saved Group
                                            </label>
                                            <select
                                                className="form-select"
                                                value={selectedGuestList}
                                                onChange={handleSelectSavedList}
                                            >
                                                <option value="">-- Choose a saved group --</option>
                                                {savedGuestLists.map((list, index) => (
                                                    <option key={index} value={list._id}>
                                                        {list.name} ({list.members.length + (list.externalMembers?.length || 0)} guests)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* 2. Manual Selection Container */}
                                        <div className="border rounded-3 p-3 bg-white border-secondary border-opacity-25">
                                            {/* Family Selection */}
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold small d-flex align-items-center mb-2">
                                                    <Icon icon="mdi:account-search" className="me-2 text-lg" />
                                                    Select Family Members
                                                </label>
                                                <UserMultiSelect
                                                    options={allGuests}
                                                    selected={selectedGuests}
                                                    onChange={setSelectedGuests}
                                                />
                                                <div className="form-text text-muted mt-1">
                                                    {selectedGuests.length} family members selected
                                                </div>
                                            </div>

                                            {/* Friends Selection */}
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold small d-flex align-items-center mb-2">
                                                    <Icon icon="mdi:account-group-outline" className="me-2 text-lg" />
                                                    Select Friends & Relatives
                                                </label>
                                                <UserMultiSelect
                                                    options={allExternalContacts}
                                                    selected={selectedExternalContacts}
                                                    onChange={setSelectedExternalContacts}
                                                />
                                                <div className="form-text text-muted mt-1">
                                                    {selectedExternalContacts.length} friends/relatives selected
                                                </div>
                                            </div>

                                            {/* Save List Option */}
                                            {(selectedGuests.length > 0 || selectedExternalContacts.length > 0) && (
                                                <div className="mt-3 border-top pt-3">
                                                    <div
                                                        className="text-primary fw-semibold small d-flex align-items-center mb-2"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => setShowSaveList(!showSaveList)}
                                                    >
                                                        <Icon icon={showSaveList ? "mdi:chevron-down" : "mdi:chevron-right"} className="me-2 text-lg" />
                                                        Save this combination as a new group?
                                                    </div>

                                                    {showSaveList && (
                                                        <div className="p-3 bg-light rounded-3 mt-2">
                                                            <Input
                                                                label="Group Name"
                                                                placeholder="e.g., Close Family & Friends..."
                                                                value={guestListName}
                                                                onChange={(e) => setGuestListName(e.target.value)}
                                                                className="mb-2"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-success w-100 btn-sm d-flex align-items-center justify-content-center mt-3"
                                                                onClick={handleSaveGuestList}
                                                            >
                                                                <Icon icon="mdi:content-save" className="me-2 text-lg" />
                                                                Save Group
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                className="btn btn-primary w-100 py-3 fw-semibold mt-10 d-flex align-item-center justify-content-center"
                                onClick={handleCreateEvent}
                                type="button"
                                disabled={createEventMutation?.isPending}
                            >
                                <Icon icon="mdi:calendar-check" className="me-4 text-lg mt-1" />
                                {createEventMutation?.isPending ? "Creating..." : "Create Event"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <AlertBox
                alert={alert}
                setAlert={setAlert}
            />
            <AddFriendRelativeModal
                show={showAddFriendModal}
                onHide={() => setShowAddFriendModal(false)}
            />
        </div >
    );
}
