import React, { useEffect, useRef, useState } from "react";
import FeedCard from "./FeedCard";
import PostCard from "./PostCard";
import PollCard from "./PollCard";
import "./feed.css";
import "./profile.css"
import { useUserProfile } from "../../hooks/useUserProfile";
import { useLocation, useNavigate } from "react-router-dom";
import { usePosts } from "../../hooks/usePost";
import { Icon } from "@iconify/react/dist/iconify.js";
import AlertBox from "../ui/Alert";
import ProfileCard from "./ProfileCard";
import AboutTab from "./AboutTab";


export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('about');

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get("userId");
    const navigate = useNavigate();
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useUserProfile(userId);

    // Profile: use FIRST PAGE
    const profile = data?.pages?.[0]?.data?.profile;
    const user = data?.pages?.[0]?.data?.user;

    // Flatten infinite posts
    const posts =
        data?.pages?.flatMap((page) => page?.data?.posts || []) || [];

    const bottomRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1 }
        );

        if (bottomRef.current) observer.observe(bottomRef.current);

        return () => observer.disconnect();
    }, [hasNextPage]);


    const {
        text,
        setText,
        files,
        handleFileSelect,
        removeFile,
        handlePost,
        isPosting,
        // Poll props
        pollQuestion,
        setPollQuestion,
        pollOptions,
        handlePollOptionChange,
        addPollOption,
        removePollOption,
        pollDuration,
        setPollDuration,
        handlePollPost,
        isPostingPoll,

        likeMutation,
        handleAddComment,
        handleCommentChange,
        commentText,
        isCommenting,
        setAlert,
        alert,

        editModalOpen,
        openEditModal,
        closeEditModal,
        handleUpdatePost,
        editPostMutation,
        // Poll voting
        handleVote,
        isVoting,
    } = usePosts();
    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="profile-page w-100 bg-light pb-5">

            <div className="container " style={{
                // height: "calc(100vh - 80px)",   // adjust based on header height
                overflow: "hidden",
            }}>
                <div className="row profile-layout" style={{
                    display: "flex",
                    height: "100%",
                    gap: "20px",
                    overflow: "hidden",
                }}>

                    {/* LEFT SIDEBAR */}
                    <div className="col-lg-4 " style={{
                        height: "100%",
                        overflowY: "auto",
                        paddingRight: "10px",
                    }}>
                        <div style={{
                            position: 'sticky',
                            top: '20px',
                            maxHeight: 'calc(100vh - 10px)',
                            overflowY: 'auto'
                        }}>
                            <ProfileCard
                                profile={profile}
                                user={user}
                                onViewProfile={() => console.log("View Profile")}
                                onEdit={() => navigate(`/profile/edit-profile?userId=${user?.id}`)}
                                onAdd={() => console.log("Add Relative")}
                            />
                        </div>
                    </div>

                    {/* MAIN FEED */}
                    <div className="col-lg-6 " style={{
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        paddingRight: "10px",
                    }}
                    >
                        <div className="profile-tabs-container d-flex gap-4 mb-3 flex-shrink-0">
                            <button
                                className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                                onClick={() => setActiveTab('about')}
                            >
                                About
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                Posts
                            </button>
                        </div>

                        <div className="feed-scroll" style={{ flex: 1, overflowY: "auto", paddingRight: "5px" }}>


                            {activeTab === 'posts' && (
                                <>
                                    <FeedCard
                                        text={text}
                                        setText={setText}
                                        files={files}
                                        handleFileSelect={handleFileSelect}
                                        removeFile={removeFile}
                                        handlePost={handlePost}
                                        isPosting={isPosting}
                                        // Poll props
                                        pollQuestion={pollQuestion}
                                        setPollQuestion={setPollQuestion}
                                        pollOptions={pollOptions}
                                        handlePollOptionChange={handlePollOptionChange}
                                        addPollOption={addPollOption}
                                        removePollOption={removePollOption}
                                        pollDuration={pollDuration}
                                        setPollDuration={setPollDuration}
                                        handlePollPost={handlePollPost}
                                        isPostingPoll={isPostingPoll}
                                    />

                                    {posts?.map(item => (
                                        <div key={item._id}>
                                            {item.isPoll ? (
                                                <PollCard
                                                    poll={item}
                                                    handleVote={handleVote}
                                                    isVoting={isVoting}
                                                />
                                            ) : (
                                                <PostCard
                                                    key={item._id}
                                                    post={item}
                                                    likeMutation={likeMutation}
                                                    handleAddComment={handleAddComment}
                                                    handleCommentChange={handleCommentChange}
                                                    commentText={commentText}
                                                    isCommenting={isCommenting}
                                                    setAlert={setAlert}
                                                    text={text}
                                                    setText={setText}
                                                    files={files}

                                                    editModalOpen={editModalOpen}
                                                    openEditModal={openEditModal}
                                                    closeEditModal={closeEditModal}
                                                    handleUpdatePost={handleUpdatePost}
                                                    editPostMutation={editPostMutation}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {/* Infinite Scroll Loader */}
                                    <div ref={bottomRef} className="text-center py-3" style={{ height: "40vh" }}>
                                        {isFetchingNextPage && <p>Loading more posts...</p>}
                                    </div>
                                </>
                            )}

                            {activeTab === 'about' && (
                                // <div className="card w-100 p-20 border-0 shadow-sm mt-4">
                                //     {/* <h5 className="fw-bold fs-4 mb-4 text-dark">About</h5> */}

                                //     {/* PERSONAL INFO */}
                                //     <div className="about-section">
                                //         <h6 className="about-section-title">Personal Information</h6>
                                //         <div className="about-grid">
                                //             <AboutItem
                                //                 icon="mdi:account"
                                //                 label="Name"
                                //                 value={`${profile?.prefix || ""} ${profile?.user?.firstname || ""} ${profile?.user?.lastname || ""}`}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:gender-male-female"
                                //                 label="Gender"
                                //                 value={profile?.gender}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:cake-variant"
                                //                 label="Age"
                                //                 value={profile?.age}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:calendar-range"
                                //                 label="Date of Birth"
                                //                 value={profile?.dob ? new Date(profile?.dob).toLocaleDateString() : null}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:human-male-female"
                                //                 label="Marital Status"
                                //                 value={profile?.marital_status}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:account-tie"
                                //                 label="Father's Name"
                                //                 value={`${profile?.father?.firstname || ""} ${profile?.father?.lastname || ""}`}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:map-marker-radius"
                                //                 label="Birthplace"
                                //                 value={profile?.birthPlace}
                                //             />
                                //         </div>
                                //     </div>

                                //     {/* CONTACT INFO */}
                                //     <div className="about-section">
                                //         <h6 className="about-section-title">Contact Details</h6>
                                //         <div className="about-grid">
                                //             <AboutItem
                                //                 icon="mdi:phone"
                                //                 label="Phone"
                                //                 value={profile?.user?.phone}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:email"
                                //                 label="Email"
                                //                 value={profile?.email}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:whatsapp"
                                //                 label="WhatsApp"
                                //                 value={profile?.whatsappNo}
                                //             />
                                //         </div>
                                //     </div>

                                //     {/* LOCATION */}
                                //     <div className="about-section">
                                //         <h6 className="about-section-title">Location</h6>
                                //         <div className="about-grid">
                                //             <AboutItem
                                //                 icon="mdi:home-map-marker"
                                //                 label="Address"
                                //                 value={profile?.address}
                                //                 fullWidth
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:city"
                                //                 label="City"
                                //                 value={profile?.city}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:map-marker"
                                //                 label="State"
                                //                 value={profile?.state}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:earth"
                                //                 label="Country"
                                //                 value={profile?.country}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:mailbox"
                                //                 label="Pincode"
                                //                 value={profile?.postalCode}
                                //             />
                                //         </div>
                                //     </div>

                                //     {/* OTHER INFO */}
                                //     <div className="about-section">
                                //         <h6 className="about-section-title">Other Information</h6>
                                //         <div className="about-grid">
                                //             <AboutItem
                                //                 icon="mdi:school"
                                //                 label="Qualification"
                                //                 value={profile?.qualification}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:book-education"
                                //                 label="Education"
                                //                 value={`${profile?.educationDetails_institution || ""} ${profile?.educationDetails_yearOfCompletion ? `(${profile?.educationDetails_yearOfCompletion})` : ""}`}
                                //             />
                                //             <AboutItem
                                //                 icon="mdi:food"
                                //                 label="Food Preference"
                                //                 value={profile?.foodPreference}
                                //             />
                                //         </div>
                                //     </div>

                                //     {/* STORY */}
                                //     {profile?.lifeHistory && (
                                //         <div className="about-section">
                                //             <h6 className="about-section-title">Life Story</h6>
                                //             <div className="about-grid">
                                //                 <AboutItem
                                //                     icon="mdi:file-document-edit"
                                //                     label="Story"
                                //                     value={profile?.lifeHistory}
                                //                     fullWidth
                                //                 />
                                //             </div>
                                //         </div>
                                //     )}

                                // </div>
                                <AboutTab
                                    activeTab={activeTab}
                                    profile={profile}
                                    user={user}
                                />
                            )}
                        </div>
                    </div>
                </div>

            </div>
            <AlertBox alert={alert} setAlert={setAlert} />
        </div>
    );
}
