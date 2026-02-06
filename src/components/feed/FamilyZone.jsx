import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTopFamilyMembers } from '../../api/familyTree';

const FamilyZone = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['topFamilyMembers'],
        queryFn: getTopFamilyMembers,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });

    const members = data?.members || [];

    return (
        <div className="card shadow-sm border-0 mt-20 rounded-4">
            <div className="card-header bg-white border-0 pb-0 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold fs-4 mb-4 pb-4">Family Zone</h5>
                <Link to="/family-tree" className="text-decoration-none text-sm fw-semibold text-primary">
                    View All
                </Link>
            </div>
            <div className="card-body pt-2">
                {isLoading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : members.length > 0 ? (
                    <ul className="list-unstyled mb-4">
                        {members.map((member) => (
                            <li
                                key={member.id}
                                className="d-flex align-items-center p-2 mb-4 rounded-3 hover-bg"
                                style={{ transition: "0.2s" }}
                            >
                                <img
                                    src={member.profilePicture || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                    alt={member.name}
                                    width="40"
                                    height="40"
                                    className="rounded-circle me-3 border"
                                    style={{ objectFit: "cover" }}
                                />

                                <div className="flex-grow-1">
                                    <h6 className="mb-0 fw-semibold fs-6 text-dark">
                                        <Link to={`/profile?userId=${member.id}`} className="text-decoration-none text-dark">
                                            {member.name}
                                        </Link>
                                    </h6>
                                    <small className="text-muted">{member.relation}</small>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-muted mb-3 text-sm">No family created yet.</p>
                        <Link to="/family-tree" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                            Start Tree
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FamilyZone;
