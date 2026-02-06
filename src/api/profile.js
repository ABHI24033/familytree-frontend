import axiosInstance from "./axiosInstance";

export const submitProfile = async (form) => {
    // Create FormData object
    const formData = new FormData();

    // Add file with correct field name 'profilePicture' (backend expects this)
    if (form.profileImage) {
        formData.append('profilePicture', form.profileImage);
    }

    // Add all other form fields
    Object.keys(form).forEach((key) => {
        // Skip profileImage as we already added it as profilePicture
        if (key !== 'profileImage' && form[key] !== null && form[key] !== undefined && form[key] !== '') {
            if (Array.isArray(form[key]) && (key === 'education' || key === 'employmentHistory')) {
                formData.append(key, JSON.stringify(form[key]));
            } else {
                formData.append(key, form[key]);
            }
        }
    });

    console.log('Submitting profile with FormData');

    try {
        const res = await axiosInstance.post("/profile/create", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error) {
        console.error("Profile Submit Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to Submit profile data");
    }
};

export const updateProfile = async (formData) => {
    console.log('Updating profile with FormData');

    try {
        const res = await axiosInstance.put("/profile/update", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error) {
        console.error("Profile Update Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to update profile data");
    }
};

export const updateUserProfileById = async (userId, formData) => {
    console.log(`Updating profile for user ${userId} with FormData`);

    try {
        const res = await axiosInstance.put(`/profile/update/${userId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (error) {
        console.error("Profile Update By ID Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to update user profile data");
    }
};

export const getUserProfile = async () => {
    console.log("Hello");

    try {
        const res = await axiosInstance.get("/profile/me");
        console.log(res);

        return res?.data;
    } catch (error) {
        console.error("Profile Update Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to update profile data");
    }
}

// Get full user profile + posts
export const getUserProfileById = async (userId, cursor) => {
    try {
        const res = await axiosInstance.get(`/profile/${userId}`,
            {
                params: {
                    cursor: cursor || "",
                    limit: 10,
                },
            });
        return res.data;
    } catch (err) {
        console.error("Error fetching profile:", err);
        throw err.response?.data || err;
    }
};

// Get upcoming birthdays and anniversaries
export const getUpcomingCelebrations = async () => {
    try {
        const res = await axiosInstance.get("/profile/birthdays-anniversaries");
        console.log(res);
        return res.data;
    } catch (err) {
        console.error("Error fetching celebrations:", err);
        throw err.response?.data || err;
    }
};
