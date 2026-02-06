import { useState } from "react";
import { useNavigate } from "react-router-dom";
import indiaData from "../data/indiaData.json";
import { useMutation } from "@tanstack/react-query";
import { submitProfile } from "../api/profile";
import { useAuth } from "../context/AuthContext";

export const useProfileForm = () => {
    const navigate = useNavigate();
    const { refetch: refetchAuth, user } = useAuth();
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        // PERSONAL INFO
        profileImage: null,
        prefix: "",
        firstname: user?.firstname || "",
        lastname: user?.lastname || "",
        gender: "",
        dob: "",
        age: "",
        dateOfDeath: "",
        birthPlace: "",
        deathPlace: "",
        marital_status: "",
        marriageDate: "",

        // ACCOUNT INFO
        phone: user?.phone || "",
        whatsappNo: "",
        email: "",
        address: "",
        country: "India",
        state: "",
        city: "",
        postalCode: "",

        // EDUCATION
        education: [
            { level: "Class 10th", year: "", institution: "" },
            { level: "Class 12th", year: "", institution: "" },
            { level: "Graduation", year: "", institution: "" },
            { level: "Post Graduation", year: "", institution: "" }
        ],

        // EMPLOYMENT
        jobCategory: "",
        employmentHistory: [
            { fromYear: "", toYear: "", company: "", designation: "" }
        ],

        // OTHER DETAILS
        foodPreference: "",
        bloodGroup: "",
        religion: "",
        parish: "",
        church: "",
        parishPriest: "",
        parishCoordinator: "",
        parishContact: "",
        lifeHistory: "",
        religionDetails: "", // For non-Christian
        burialPlace: "",
    });

    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ type: "", message: "" });

    // ---------------------------
    // HANDLE INPUT CHANGE
    // ---------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedValue = value;

        // Auto-calc age
        if (name === "dob") {
            const dob = new Date(value);
            if (!isNaN(dob)) {
                const diff = new Date().getFullYear() - dob.getFullYear();
                updatedValue = value;

                setForm((prev) => ({
                    ...prev,
                    dob: value,
                    age: diff.toString(),
                }));
                return;
            }
        }

        setForm((prev) => ({
            ...prev,
            [name]: updatedValue,
            ...(name === "state" ? { city: "" } : {}),
        }));
        setErrors({});
    };

    // ---------------------------
    // HANDLE EDUCATION CHANGE
    // ---------------------------
    const handleEducationChange = (index, field, value) => {
        setForm((prev) => {
            const updatedEducation = [...prev.education];
            updatedEducation[index] = { ...updatedEducation[index], [field]: value };
            return { ...prev, education: updatedEducation };
        });
        setErrors((prev) => ({ ...prev, education: undefined }));
    };

    // ---------------------------
    // HANDLE EMPLOYMENT CHANGE
    // ---------------------------
    const handleEmploymentChange = (index, field, value) => {
        setForm((prev) => {
            const updatedHistory = [...prev.employmentHistory];
            updatedHistory[index] = { ...updatedHistory[index], [field]: value };
            return { ...prev, employmentHistory: updatedHistory };
        });
    };

    const addEmploymentRow = () => {
        setForm((prev) => ({
            ...prev,
            employmentHistory: [
                ...prev.employmentHistory,
                { fromYear: "", toYear: "", company: "", designation: "" }
            ]
        }));
    };

    const removeEmploymentRow = (index) => {
        setForm((prev) => {
            const updatedHistory = prev.employmentHistory.filter((_, i) => i !== index);
            return { ...prev, employmentHistory: updatedHistory };
        });
    };
    const handleFileUpload = (file) => {
        setForm((prev) => ({
            ...prev,
            profileImage: file,
        }));
    };

    // ---------------------------
    // VALIDATION PER STEP
    // ---------------------------
    const validateStep = (currentStep) => {
        const newErrors = {};

        // PERSONAL INFO
        if (currentStep === 1) {
            if (!form?.profileImage) newErrors.profileImage = "Profile picture is required"
            if (!form.prefix) newErrors.prefix = "Required";
            if (!form.firstname) newErrors.firstname = "Required";
            if (!form.gender) newErrors.gender = "Required";
            if (!form.dob) newErrors.dob = "Required";
            if (!form.marital_status) newErrors.marital_status = "Required";
        }

        // ADDRESS INFO
        if (currentStep === 2) {
            if (!form.whatsappNo) newErrors.whatsappNo = "Required";
            if (!form.email) newErrors.email = "Required";
            if (!form.address) newErrors.address = "Required";
            if (!form.state) newErrors.state = "Required";
            if (!form.country) newErrors.country = "Required";
            if (!form.city) newErrors.city = "Required";
            if (!form.postalCode) newErrors.postalCode = "Required";
        }

        // EDUCATION + EMPLOYMENT
        if (currentStep === 3) {
            // Example: Check if Class 10th institution is filled if strictly required
            // const class10 = form.education.find(e => e.level === "Class 10th");
            // if (!class10?.institution) newErrors.education = "Class 10th Institution is required";

            // Keeping it open for now based on user request style
            //   if (!form.occupation) newErrors.occupation = "Required";
            //   if (!form.jobType) newErrors.jobType = "Required";
        }

        // OTHERS
        if (currentStep === 4) {
            if (!form.foodPreference) newErrors.foodPreference = "Required";
            if (!form.bloodGroup) newErrors.bloodGroup = "Required";
            if (!form.religion) newErrors.religion = "Required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    // STATE / CITY OPTIONS
    const states = indiaData.states.map((s) => s.state);
    const selectedStateObj = indiaData.states.find((s) => s.state === form.state);
    const cities = selectedStateObj ? selectedStateObj.cities : [];

    //   Handle submit form
    const submitProfileMutation = useMutation({
        mutationFn: submitProfile,
        onSuccess: async (data) => {
            console.log(data);
            // Refetch auth data to refresh user state
            await refetchAuth();
            setAlert({
                type: "success",
                message: data?.message || "Profile created successfully!",
            });
            // Redirect to home after successful profile creation
            setTimeout(() => {
                navigate("/");
            }, 1000);
        },
        onError: (error) => {
            setAlert({
                type: "danger",
                message: error?.message || "Something went wrong!, please retry.",
            });
            console.log(error);
        }

    })
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateStep(step)) submitProfileMutation.mutate(form);
    }

    return {
        step,
        form,
        errors,
        states,
        cities,
        handleChange,
        handleEducationChange,
        handleEmploymentChange,
        addEmploymentRow,
        removeEmploymentRow,
        handleFileUpload,
        nextStep,
        prevStep,
        handleSubmit,
        isPending: submitProfileMutation?.isPending,
        alert,
        setAlert,
    };
};
