/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { useAuth } from "../context/AuthContext";
import NotificationDropdown from '../components/header/NotificationDropdown';

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route
  const { logout, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };


  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        <div>
          <Link to='/' className='sidebar-logo'>
            <img
              src='/assets/images/auth/logo.png'
              alt='site logo'
              className='light-logo'
            />
            <img
              src='/assets/images/auth/logo.png'
              alt='site logo'
              className='dark-logo'
            />
            <img
              src='/assets/images/auth/logo-mobile.png'
              alt='site logo'
              className='logo-icon'
            />
          </Link>
        </div>
        <div className='sidebar-menu-area mb-4 pb-5'>
          <ul className='sidebar-menu' id='sidebar-menu'>

            {/* <li className='sidebar-menu-group-title'>Block 1</li> */}
            {!user?.isSuperAdmin && (
              <>
                <li className=''>
                  <NavLink
                    to='/'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:graph-up-outline'
                      className='menu-icon'
                    />
                    <span>My Wall</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/events"
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon icon="solar:calendar-outline" className="menu-icon" />
                    <span>Events</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/notice"
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon icon="solar:document-text-outline" className="menu-icon" />
                    <span>Notice Board</span>
                  </NavLink>
                </li>
              </>
            )}


            {user?.isAdmin && (
              <li className='dropdown' style={{ marginBottom: '-12px' }}>
                <Link to='#'>
                  <Icon
                    icon='icon-park-outline:setting-two'
                    className='menu-icon'
                  />
                  <span>Admin Notices</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink
                      to='/add-notice'
                      className={(navData) =>
                        navData.isActive ? "active-page" : ""
                      }
                    >
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                      Add Notice
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to='/admin-notices'
                      className={(navData) =>
                        navData.isActive ? "active-page" : ""
                      }
                    >
                      <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                      Manage Notices
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}


            {user?.isSuperAdmin && (
              <li className='dropdown' style={{ marginBottom: '-12px' }}>
                <Link to='#'>
                  <Icon
                    icon='solar:shield-user-bold-duotone'
                    className='menu-icon'
                  />
                  <span>Super Admin</span>
                </Link>
                <ul className='sidebar-submenu'>
                  <li>
                    <NavLink
                      to='/admin/knowledge-bank'
                      className={(navData) => {
                        const isEdit = location.pathname.startsWith('/edit-knowledge-bank');
                        return (navData.isActive || isEdit) ? "active-page" : "";
                      }}
                    >
                      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                      Manage Knowledge Bank
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to='/create-knowledge-bank'
                      className={(navData) =>
                        navData.isActive ? "active-page" : ""
                      }
                    >
                      <i className='ri-circle-fill circle-icon text-success-main w-auto' />{" "}
                      Add Knowledge Bank
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to='/admin/settings'
                      className={(navData) =>
                        navData.isActive ? "active-page" : ""
                      }
                    >
                      <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                      System Settings
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to='/admin/user-ips'
                      className={(navData) =>
                        navData.isActive ? "active-page" : ""
                      }
                    >
                      <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                      User IPs
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}


            {!user?.isSuperAdmin && (
              <>
                <li>
                  <NavLink
                    to='/notifications'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <div className='position-relative d-inline-block'>
                      <Icon
                        icon='solar:bell-outline'
                        className='menu-icon'
                      />
                      {/* <span className='position-absolute translate-middle badge rounded-circle bg-warning text-dark' style={{ fontSize: '0.65rem', padding: '2px 5px', minWidth: '18px', height: '18px', lineHeight: '14px', top: '3px', right: '-8px' }}>
                    1
                  </span> */}
                    </div>
                    <span>Notifications</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to='/family-tree'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:users-group-rounded-outline'
                      className='menu-icon'
                    />
                    <span>Family Tree</span>
                  </NavLink>
                </li>
                {/* 
            <li>
              <NavLink
                to='/my-guests'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon
                  icon='solar:users-group-two-rounded-outline'
                  className='menu-icon'
                />
                <span>My Guests</span>
              </NavLink>
            </li> */}

                <li>
                  <NavLink
                    to='/invitations'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:letter-unread-outline'
                      className='menu-icon'
                    />
                    <span>Invitations</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to='/friends-relatives'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:users-group-two-rounded-outline'
                      className='menu-icon'
                    />
                    <span>Friends and Relatives</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to='/knowledge-bank'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:library-outline'
                      className='menu-icon'
                    />
                    <span>Community Rituals</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to='/reports'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    {/* <Icon
                  icon='solar:database-outline'
                  className='menu-icon'
                /> */}
                    <Icon
                      icon='solar:users-group-two-rounded-outline'
                      className='menu-icon'
                    />
                    {/* <span>Reports</span> */}
                    <span>My Guests</span>
                  </NavLink>
                </li>

                {/* <li>
              <Link
                to='#'
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
                    console.log('Delete profile');
                  }
                }}
                className='text-danger'
              >
                <Icon
                  icon='solar:trash-bin-trash-outline'
                  className='menu-icon'
                />
                <span>Delete My Profile</span>
              </Link>
            </li> */}

                <li>
                  <NavLink
                    to='/my-subscription'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:crown-linear'
                      className='menu-icon'
                    />
                    <span>My Subscription</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to={`/profile?userId=${user?.id}`}
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:user-linear'
                      className='menu-icon'
                    />
                    <span>View Profile</span>
                  </NavLink>
                </li>



                <li>
                  <NavLink
                    to='/follow-us'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:share-bold'
                      className='menu-icon'
                    />
                    <span>Follow Us</span>
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to='/help'
                    className={(navData) => (navData.isActive ? "active-page" : "")}
                  >
                    <Icon
                      icon='solar:question-circle-outline'
                      className='menu-icon'
                    />
                    <span>Help</span>
                  </NavLink>
                </li>
              </>
            )}

            {/* Settings Dropdown */}
            {/* <li className='dropdown'>
              <Link to='#'>
                <Icon
                  icon='icon-park-outline:setting-two'
                  className='menu-icon'
                />
                <span>Settings</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink
                    to='/company'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Company
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/notifications'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                    Notification
                  </NavLink>
                </li>
              </ul>
            </li> */}

            <li>
              <Link
                to='#'
                onClick={(e) => {
                  e.preventDefault();
                  setShowLogoutModal(true);
                }}
                className='d-flex align-items-center text-danger'
              >
                <Icon icon='solar:logout-2-outline' className='menu-icon' />
                <span>Log Out</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="p-3 w-100 mt-4 bg-white text-start position-absolute bottom-0 start-0">
          <span className="text-secondary small" style={{ fontSize: '14px', opacity: 0.8 }}>Version 1.0.0</span>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  className='sidebar-toggle'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
                {/* <form className='navbar-search'>
                  <input type='text' name='search' placeholder='Search' />
                  <Icon icon='ion:search-outline' className='icon' />
                </form> */}
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* <ThemeToggleButton /> */}
                {/* <div className='dropdown d-none d-sm-inline-block'>
                  <button
                    className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <img
                      src='assets/images/lang-flag.png'
                      alt='Sanyojan'
                      className='w-24 h-24 object-fit-cover rounded-circle'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-0'>
                          Choose Your Language
                        </h6>
                      </div>
                    </div>
                    <div className='max-h-400-px overflow-y-auto scroll-sm pe-8'>
                      <div className='form-check style-check d-flex align-items-center justify-content-between mb-16'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='english'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/flag1.png'
                              alt='Sanyojan'
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              English
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='english'
                        />
                      </div>
                      <div className='form-check style-check d-flex align-items-center justify-content-between mb-16'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='japan'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/flag2.png'
                              alt='Sanyojan'
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              Japan
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='japan'
                        />
                      </div>
                      <div className='form-check style-check d-flex align-items-center justify-content-between mb-16'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='france'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/flag3.png'
                              alt='Sanyojan'
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              France
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='france'
                        />
                      </div>
                      <div className='form-check style-check d-flex align-items-center justify-content-between mb-16'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='germany'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/flag4.png'
                              alt='Sanyojan'
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              Germany
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='germany'
                        />
                      </div>
                      <div className='form-check style-check d-flex align-items-center justify-content-between mb-16'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='korea'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/flag5.png'
                              alt='Sanyojan'
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              South Korea
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='korea'
                        />
                      </div>
                      <div className='form-check style-check d-flex align-items-center justify-content-between mb-16'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='bangladesh'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/flag6.png'
                              alt='Sanyojan'
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              Bangladesh
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='bangladesh'
                        />
                      </div>
                      <div className='form-check style-check d-flex align-items-center justify-content-between mb-16'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='india'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/flag7.png'
                              alt='Sanyojan'
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              India
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='india'
                        />
                      </div>
                      <div className='form-check style-check d-flex align-items-center justify-content-between'>
                        <label
                          className='form-check-label line-height-1 fw-medium text-secondary-light'
                          htmlFor='canada'
                        >
                          <span className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                            <img
                              src='assets/images/flags/flag8.png'
                              alt='Sanyojan'
                              className='w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0'
                            />
                            <span className='text-md fw-semibold mb-0'>
                              Canada
                            </span>
                          </span>
                        </label>
                        <input
                          className='form-check-input'
                          type='radio'
                          name='crypto'
                          id='canada'
                        />
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* Language dropdown end */}
                {/* <div className='dropdown'>
                  <button
                    className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <Icon
                      icon='mage:email'
                      className='text-primary-light text-xl'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-lg p-0'>
                    <div className='m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-0'>
                          Message
                        </h6>
                      </div>
                      <span className='text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center'>
                        05
                      </span>
                    </div>
                    <div className='max-h-400-px overflow-y-auto scroll-sm pe-4'>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-3.png'
                              alt='Sanyojan'
                            />
                            <span className='w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle'>
                            8
                          </span>
                        </div>
                      </Link>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-4.png'
                              alt='Sanyojan'
                            />
                            <span className='w-8-px h-8-px  bg-neutral-300 rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle'>
                            2
                          </span>
                        </div>
                      </Link>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-5.png'
                              alt='Sanyojan'
                            />
                            <span className='w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-neutral-400 rounded-circle'>
                            0
                          </span>
                        </div>
                      </Link>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-6.png'
                              alt='Sanyojan'
                            />
                            <span className='w-8-px h-8-px bg-neutral-300 rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-neutral-400 rounded-circle'>
                            0
                          </span>
                        </div>
                      </Link>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-40-px h-40-px rounded-circle flex-shrink-0 position-relative'>
                            <img
                              src='assets/images/notification/profile-7.png'
                              alt='Sanyojan'
                            />
                            <span className='w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0' />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Kathryn Murphy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-100-px'>
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className='d-flex flex-column align-items-end'>
                          <span className='text-sm text-secondary-light flex-shrink-0'>
                            12:30 PM
                          </span>
                          <span className='mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle'>
                            8
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className='text-center py-12 px-16'>
                      <Link
                        to='#'
                        className='text-primary-600 fw-semibold text-md'
                      >
                        See All Message
                      </Link>
                    </div>
                  </div>
                </div> */}
                {/* Message dropdown end */}
                {/* Notification dropdown start */}
                <NotificationDropdown />
                {/* Notification dropdown end */}
                {/* Notification dropdown end */}
                <div className='dropdown'>
                  <button
                    className='d-flex justify-content-center align-items-center border rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="User"
                        className="w-40-px h-40-px object-fit-cover rounded-circle"
                      />
                    ) : (
                      <div
                        className="w-40-px h-40-px rounded-circle d-flex justify-content-center align-items-center bg-primary text-white fw-bold"
                        style={{ fontSize: "14px" }}
                      >
                        {(
                          (user?.firstname?.[0] || "") +
                          (user?.lastname?.[0] || "")
                        ).toUpperCase()}
                      </div>
                    )}
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                          {user?.firstname + " " + user?.lastname}
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                          {user?.isAdmin ? "Admin" : "User"}
                        </span>
                      </div>
                      <button type='button' className='hover-text-danger'>
                        <Icon
                          icon='radix-icons:cross-1'
                          className='icon text-xl'
                        />
                      </button>
                    </div>
                    <ul className='to-top-list'>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/profile'
                        >
                          <Icon
                            icon='solar:user-linear'
                            className='icon text-xl'
                          />{" "}
                          My Profile
                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/email'
                        >
                          <Icon
                            icon='tabler:message-check'
                            className='icon text-xl'
                          />{" "}
                          Inbox
                        </Link>
                      </li> */}
                      {/* <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/company'
                        >
                          <Icon
                            icon='icon-park-outline:setting-two'
                            className='icon text-xl'
                          />
                          Setting
                        </Link>
                      </li> */}
                      <li>
                        <button
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3 w-100 border-0 bg-transparent text-start'
                          onClick={() => setShowLogoutModal(true)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Icon icon='lucide:power' className='icon text-xl' />{" "}
                          Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>{children}</div>

        {/* Footer section */}
        <footer className='d-footer'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <p className='mb-0'>© {new Date().getFullYear()} Sanyojan. All Rights Reserved.</p>
            </div>
            <div className='col-auto'>
              <p className='mb-0'>
                {/* Made by <span className='text-primary-600'>Sanyojan</span> */}
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered size="sm">
        <Modal.Body className="p-24 text-center">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-16"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fee2e2'
            }}
          >
            <Icon icon="solar:logout-2-bold" style={{ fontSize: '32px', color: '#ef4444' }} />
          </div>
          <h5 className="fw-bold text-neutral-900 mb-8">Log Out</h5>
          <p className="text-neutral-600 mb-24 text-sm">
            Are you sure you want to log out?
          </p>
          <div className="d-flex gap-12 justify-content-center">
            <button
              type="button"
              className="btn btn-light text-sm px-20 py-10 radius-8 flex-grow-1"
              onClick={() => setShowLogoutModal(false)}
            >
              No
            </button>
            <button
              type="button"
              className="btn btn-danger text-sm px-20 py-10 radius-8 flex-grow-1"
              onClick={handleLogout}
              style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
            >
              Yes, Log Out
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default MasterLayout;
