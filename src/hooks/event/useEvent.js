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


    console.log(selectedExternalContacts);


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
            resetForm();
            navigate("/events");
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

    // ========== HANDLE CREATE EVENT ==========
    const handleCreateEvent = async () => {
        console.log("handleCreateEvent");
        // Validation
        if (!eventName.trim()) {
            setAlert({
                type: "danger",
                message: "Event name is required"
            });
            return;
        }

        if (!startDate || !startTime || !endDate || !endTime) {
            setAlert({
                type: "danger",
                message: "Please fill in all date and time fields"
            });
            return;
        }

        if (eventType === "inperson" && !location.trim()) {
            setAlert({
                type: "danger",
                message: "Location is required for in-person events"
            });
            return;
        }

        if (eventType === "virtual" && !virtualLink.trim()) {
            setAlert({
                type: "danger",
                message: "Virtual link is required for virtual events"
            });
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
            guests: selectedGuests,
            externalGuests: selectedExternalContacts,
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

    // ========== RESET FORM ==========
    const resetForm = () => {
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
        handleCover,
        handleSelectSavedList,
        handleSaveGuestList,
        handleCreateEvent,
        resetForm,

        // Mutation object (for advanced usage)
        createEventMutation,
        alert,
        setAlert,
    };
};
