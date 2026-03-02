import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createEvent } from "../../api/event";
import { getMyContacts } from "../../api/externalContact";
import { createGuestList, getMyGuestLists } from "../../api/guestList";
import { getContactGroups } from "../../api/group";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export const useEvent = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // -------- Fetch Family Members --------
    const { data: familyMembersData } = useQuery({
        queryKey: ["familyMembers"],
        queryFn: async () => {
            const res = await axiosInstance.get("/family-tree/members");
            return res.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Transform to options format for MultiSelect
    const allGuests = familyMembersData?.map(member => ({
        id: member.userId,
        name: member.fullName,
        avatar: member.profilePicture,
        phone: member.phone
    })).sort((a, b) => a.name.localeCompare(b.name)) || [];

    // -------- Fetch External Contacts (Friends/Relatives) --------
    const { data: externalContactsData } = useQuery({
        queryKey: ["externalContacts"],
        queryFn: getMyContacts,
    });

    const allExternalContacts = externalContactsData?.map(contact => ({
        id: contact._id,
        name: contact.name,
        avatar: null, // No avatar for external guests usually, or placeholder
        mobile: contact.mobile,
        phone: contact.mobile, // Alias for consistency
        email: contact.email,
        relation: contact.relation
    })).sort((a, b) => a.name.localeCompare(b.name)) || [];

    // -------- Fetch Saved Contact Groups --------
    const { data: contactGroupsData } = useQuery({
        queryKey: ["contact-groups"],
        queryFn: getContactGroups,
    });

    const savedGuestLists = contactGroupsData?.data || [];

    // --------- STATES ---------
    const [currentStep, setCurrentStep] = useState(1);
    const [createdEventId, setCreatedEventId] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [eventType, setEventType] = useState("inperson");
    const [selectedGuests, setSelectedGuests] = useState([]);
    const [selectedExternalContacts, setSelectedExternalContacts] = useState([]); // [NEW]
    const [guestListName, setGuestListName] = useState("");
    // const [savedGuestLists, setSavedGuestLists] = useState([]); // Local state removed
    const [selectedGuestList, setSelectedGuestList] = useState("");
    const [showSaveList, setShowSaveList] = useState(false);
    const [sendWhatsAppToFamily, setSendWhatsAppToFamily] = useState(true); // Default to true
    const [sendWhatsAppToFriends, setSendWhatsAppToFriends] = useState(true); // Default to true
    const [inviteWithFamily, setInviteWithFamily] = useState(false); // Default to individual
    const [friendsInviteWithFamily, setFriendsInviteWithFamily] = useState(false); // Default to individual


    // Form states
    const [eventName, setEventName] = useState("");
    const [location, setLocation] = useState("");
    const [googleMapLink, setGoogleMapLink] = useState(""); // [NEW]
    const [virtualLink, setVirtualLink] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");
    const [eventDetails, setEventDetails] = useState("");
    const [alert, setAlert] = useState({
        type: "",
        message: ""
    });

    // ========== REACT QUERY MUTATION: CREATE EVENT ==========
    const createEventMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: (data) => {
            // Invalidate and refetch events list
            queryClient.invalidateQueries({ queryKey: ["events"] });
            setAlert({
                type: "success",
                message: data?.message || "Event created successfully!"
            });

            // Instead of resetting and navigating, store ID and go to Step 3
            setCreatedEventId(data?._id || data?.id);
            setCurrentStep(3);
        },
        onError: (error) => {
            const errorMessage = error.message || "Failed to create event";
            setAlert({
                type: "danger",
                message: errorMessage || "Failed to create event"
            });
            console.error("Create Event Error:", error);
        },
    });

    // ========== REACT QUERY MUTATION: CREATE CONTACT GROUP ==========
    const createContactGroupMutation = useMutation({
        mutationFn: (data) => axiosInstance.post("/contact-groups", data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["contact-groups"] });
            setShowSaveList(false);
            setGuestListName("");
            toast.success("Group saved successfully!");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to save group");
        }
    });

    // --------- FUNCTIONS ---------
    const handleCover = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverPreview(URL.createObjectURL(file));
            setCoverFile(file);
        }
    };

    const handleSelectSavedList = (e) => {
        const listId = e.target.value;

        const list = savedGuestLists.find((x) => x._id === listId);
        if (list) {
            setSelectedGuestList(listId);

            // Map ContactGroup members to selectedGuests and selectedExternalContacts
            const familyMembers = [];
            const externalPeople = [];

            list.members.forEach(member => {
                if (member.memberType === "User") {
                    // Find member details from allGuests
                    const guest = allGuests.find(g => g.id === member.memberId);
                    if (guest) familyMembers.push(guest);
                } else {
                    // Find member details from allExternalContacts
                    const contact = allExternalContacts.find(c => c.id === member.memberId);
                    if (contact) externalPeople.push(contact);
                }
            });

            setSelectedGuests(familyMembers);
            setSelectedExternalContacts(externalPeople);
            setGuestListName(list.name);
        } else {
            setSelectedGuestList("");
            setSelectedGuests([]);
            setSelectedExternalContacts([]);
            setGuestListName("");
        }
    };

    const handleSaveGuestList = () => {
        if (!guestListName.trim()) {
            setAlert({
                type: "danger",
                message: "Please enter a group name"
            });
            return;
        }

        // Prepare data for backend in ContactGroup format
        const groupData = {
            name: guestListName,
            members: [
                ...selectedGuests.map(g => ({ memberId: g.id, memberType: "User" })),
                ...selectedExternalContacts.map(g => ({ memberId: g.id, memberType: "ExternalContact" }))
            ]
        };

        createContactGroupMutation.mutate(groupData);
    };

    // Bulk selection helpers
    const toggleAllFamily = () => {
        if (selectedGuests.length === allGuests.length) {
            setSelectedGuests([]);
        } else {
            setSelectedGuests([...allGuests]);
        }
    };

    const toggleAllExternal = () => {
        if (selectedExternalContacts.length === allExternalContacts.length) {
            setSelectedExternalContacts([]);
        } else {
            setSelectedExternalContacts([...allExternalContacts]);
        }
    };

    const handleCreateEvent = async () => {

        // Final Validation (most done in Step 1/2)
        if (!eventName.trim()) {
            setCurrentStep(1);
            setAlert({ type: "danger", message: "Event name is required" });
            return;
        }

        // Prepare event data
        const eventData = {
            eventName,
            eventType,
            location: eventType === "inperson" ? location : null,
            googleMapLink: eventType === "inperson" ? googleMapLink : null,
            virtualLink: eventType === "virtual" ? virtualLink : null,
            startDate,
            startTime,
            endDate,
            endTime,
            eventDetails,
            guests: selectedGuests.map(g => g.id), // Just IDs for backend
            externalGuests: selectedExternalContacts.map(g => ({
                name: g.name,
                mobile: g.mobile,
                email: g.email || "",
                relation: g.relation || "Friend"
            })),
            guestListId: null,
            coverImage: coverFile,
            sendWhatsAppToFamily,
            sendWhatsAppToFriends,
            inviteWithFamily,
            friendsInviteWithFamily,
        };

        // Trigger mutation
        createEventMutation.mutate(eventData);
    };

    // Navigation logic
    const nextStep = () => {
        if (currentStep === 1) {
            if (!eventName.trim()) {
                setAlert({ type: "danger", message: "Event name is required" });
                return;
            }

            if (eventType === "inperson" && !location.trim()) {
                setAlert({ type: "danger", message: "Venue address is required for in-person events" });
                return;
            }

            if (eventType === "virtual" && !virtualLink.trim()) {
                setAlert({ type: "danger", message: "Meeting link is required for virtual events" });
                return;
            }

            if (!startDate || !startTime || !endDate || !endTime) {
                setAlert({ type: "danger", message: "Please fill in all date and time fields" });
                return;
            }

            // Check if end is before start
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);

            if (end <= start) {
                setAlert({ type: "danger", message: "Event end time must be after the start time" });
                return;
            }
        }
        setAlert({ type: "", message: "" });
        setCurrentStep(prev => prev + 1);
    };

    const downloadQRCode = (canvasSelector = "canvas", filename = "event-qr") => {
        const canvas = document.querySelector(canvasSelector);
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = `${filename}-${createdEventId}.png`;
            link.href = url;
            link.click();
        }
    };

    const prevStep = () => setCurrentStep(prev => prev - 1);

    // ========== RESET FORM ==========
    const resetForm = () => {
        setCurrentStep(1);
        setCreatedEventId(null);
        setEventName("");
        setLocation("");
        setGoogleMapLink("");
        setVirtualLink("");
        setStartDate("");
        setStartTime("");
        setEndDate("");
        setEndTime("");
        setEventDetails("");
        setSelectedGuests([]);
        setSelectedExternalContacts([]);
        setSelectedGuestList("");
        setCoverPreview(null);
        setCoverFile(null);
        setSendWhatsAppToFamily(true);
        setSendWhatsAppToFriends(true);
        setInviteWithFamily(false);
        setFriendsInviteWithFamily(false);
    };

    return {
        // Data
        allGuests,
        allExternalContacts, // [NEW]

        // States
        currentStep,
        createdEventId,
        coverPreview,
        eventType,
        selectedGuests,
        selectedExternalContacts, // [NEW]
        guestListName,
        savedGuestLists,
        selectedGuestList,
        showSaveList,
        eventName,
        location,
        googleMapLink,
        virtualLink,
        startDate,
        startTime,
        endDate,
        endTime,
        eventDetails,
        sendWhatsAppToFamily,
        sendWhatsAppToFriends,
        inviteWithFamily,
        friendsInviteWithFamily,

        // React Query states
        isLoading: createEventMutation.isPending,
        error: createEventMutation.error,
        isSuccess: createEventMutation.isSuccess,

        // Setters
        setCurrentStep,
        setEventType,
        setSelectedGuests,
        setSelectedExternalContacts, // [NEW]
        setGuestListName,
        setSelectedGuestList,
        setShowSaveList,
        setEventName,
        setLocation,
        setGoogleMapLink,
        setVirtualLink,
        setStartDate,
        setStartTime,
        setEndDate,
        setEndTime,
        setEventDetails,
        setSendWhatsAppToFamily,
        setSendWhatsAppToFriends,
        setInviteWithFamily,
        setFriendsInviteWithFamily,

        // Functions
        nextStep,
        prevStep,
        toggleAllFamily,
        toggleAllExternal,
        handleCover,
        handleSelectSavedList,
        handleSaveGuestList,
        handleCreateEvent,
        resetForm,
        downloadQRCode,

        // Mutation object (for advanced usage)
        createEventMutation,
        alert,
        setAlert,
    };
};
