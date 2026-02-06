import React from "react";
import { Icon } from "@iconify/react";
import MasterLayout from "../../masterLayout/MasterLayout";
import { useEventReport } from "../../hooks/event/useEventReport";
import EventReportStats from "../../components/event/EventReportStats";
import EventGuestTable from "../../components/event/EventGuestTable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../api/axiosInstance";
import { useState } from "react";

const EventReportPage = () => {
    const {
        navigate,
        authLoading,
        event,
        eventLoading,
        guests,
        guestsLoading,
        stats,
        page,
        setPage,
        filterStatus,
        setFilterStatus,
        filterCity,
        setFilterCity,
        cities,
        searchQuery,
        setSearchQuery,
        pagination,
        totalGuestsCount,
        startEntry,
        endEntry,
        totalPages
    } = useEventReport();

    const { id } = useEventReport();
    const [downloadLoading, setDownloadLoading] = useState(false);

    const handleDownloadExcel = async () => {
        try {
            setDownloadLoading(true);
            const res = await axiosInstance.get(`/events/${id}/guests`, {
                params: {
                    limit: 10000,
                    status: filterStatus,
                    city: filterCity,
                    search: searchQuery
                }
            });
            const guestsData = res.data.data;

            // Create Workbook and Worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Guests");

            // Define Columns
            worksheet.columns = [
                { header: "Guest Name", key: "name", width: 25 },
                { header: "Type", key: "type", width: 15 },
                { header: "Status", key: "status", width: 15 },
                { header: "Total Attendees", key: "total", width: 18 },
                { header: "Veg", key: "veg", width: 10 },
                { header: "Non-Veg", key: "nonveg", width: 10 },
                { header: "City", key: "city", width: 20 },
                { header: "Mobile", key: "mobile", width: 15 },
                { header: "Acceptance Date & Time", key: "date", width: 25 },
            ];

            // Add Header Row for Title (Merged)
            worksheet.insertRow(1, [`Event Report: ${event.eventName}`]);
            worksheet.mergeCells('A1:I1');
            const titleRow = worksheet.getRow(1);
            titleRow.font = { name: 'Arial', family: 4, size: 16, bold: true };
            titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
            titleRow.height = 30;

            // Add Date Row (Merged)
            worksheet.insertRow(2, [`Date: ${new Date(event.startDate).toDateString()}`]);
            worksheet.mergeCells('A2:I2');
            const dateRow = worksheet.getRow(2);
            dateRow.font = { name: 'Arial', family: 4, size: 12, italic: true };
            dateRow.alignment = { vertical: 'middle', horizontal: 'center' };

            // Add empty row
            worksheet.insertRow(3, [""]);

            // Re-assign header row because inserting rows shifts things
            const headerRow = worksheet.getRow(4);
            headerRow.values = ["Guest Name", "Type", "Status", "Total Attendees", "Veg", "Non-Veg", "City", "Mobile", "Acceptance Date & Time"];

            // Style Header Row
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF4F46E5" }, // Primary Blue/Indigo color
                };
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
            headerRow.height = 25;

            // Add Data
            guestsData.forEach((guest) => {
                const rowData = {
                    name: guest.name || (guest.user ? `${guest.user.firstname} ${guest.user.lastname}` : "Guest"),
                    type: guest.isExternal ? "Friend/Relative" : "Family Member",
                    status: guest.status || "pending",
                    total: guest.totalAttendees || 1,
                    veg: guest.vegAttendees || 0,
                    nonveg: guest.nonVegAttendees || 0,
                    city: guest.city || "-",
                    mobile: guest.mobile || guest.user?.mobile || "-",
                    date: guest.respondedAt ? new Date(guest.respondedAt).toLocaleString() : (guest.status !== 'pending' ? new Date(guest.createdAt).toLocaleString() : "-")
                };
                const row = worksheet.addRow(rowData);

                // Style Data Rows (Borders)
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                    cell.alignment = { vertical: "middle", horizontal: "left" };
                });
                // Center align numbers
                row.getCell('total').alignment = { vertical: "middle", horizontal: "center" };
                row.getCell('veg').alignment = { vertical: "middle", horizontal: "center" };
                row.getCell('nonveg').alignment = { vertical: "middle", horizontal: "center" };
            });

            // Make Blob and Save
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, `Event_Report_${event.eventName}.xlsx`);

        } catch (error) {
            console.error("Error downloading excel:", error);
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setDownloadLoading(true);
            const res = await axiosInstance.get(`/events/${id}/guests`, {
                params: {
                    limit: 10000,
                    status: filterStatus,
                    city: filterCity,
                    search: searchQuery
                }
            });
            const guestsData = res.data.data;

            const doc = new jsPDF();
            doc.text(`Event Report: ${event.eventName}`, 14, 15);
            doc.setFontSize(10);
            doc.text(`Date: ${new Date(event.startDate).toDateString()}`, 14, 22);

            const tableColumn = ["Guest Name", "Type", "Status", "Total", "Veg", "Non-Veg", "City", "Mobile", "Acceptance Date & Time"];
            const tableRows = [];

            guestsData.forEach(guest => {
                const guestName = guest.name || (guest.user ? `${guest.user.firstname} ${guest.user.lastname}` : "Guest");
                const type = guest.isExternal ? "Friend/Relative" : "Family Member";
                const row = [
                    guestName,
                    type,
                    guest.status,
                    guest.totalAttendees,
                    guest.vegAttendees,
                    guest.nonVegAttendees,
                    guest.city || '-',
                    guest.mobile || guest.user?.mobile || '-',
                    guest.respondedAt ? new Date(guest.respondedAt).toLocaleString() : (guest.status !== 'pending' ? new Date(guest.createdAt).toLocaleString() : '-')
                ];
                tableRows.push(row);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 25,
            });

            doc.save(`Event_Report_${event.eventName}.pdf`);
        } catch (error) {
            console.error("Error downloading PDF:", error);
        } finally {
            setDownloadLoading(false);
        }
    };

    if (authLoading || eventLoading) {
        return (
            <MasterLayout>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            </MasterLayout>
        );
    }

    if (!event) {
        return (
            <MasterLayout>
                <div className="text-center py-5 text-danger">Error loading report</div>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <div className="container py-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-2">
                        <button
                            className="btn btn-link d-flex align-items-center text-decoration-none ps-0 text-muted fw-medium inner-shadow-sm"
                            onClick={() => navigate(-1)}
                        >
                            <Icon icon="mdi:arrow-left" width="28" height="28" />
                        </button>
                        <div>
                            <h4 className="mb-0 text-primary-600 fw-bold ms-2">Event Report: {event.eventName}</h4>
                            <p className="text-secondary-light text-sm ms-2 mb-0">{new Date(event.startDate).toDateString()}</p>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-success d-flex align-items-center gap-2"
                            onClick={handleDownloadExcel}
                            disabled={downloadLoading}
                        >
                            <Icon icon="mdi:microsoft-excel" width="20" height="20" />
                            {downloadLoading ? '...' : 'Excel'}
                        </button>
                        <button
                            className="btn btn-outline-danger d-flex align-items-center gap-2"
                            onClick={handleDownloadPDF}
                            disabled={downloadLoading}
                        >
                            <Icon icon="mdi:file-pdf-box" width="20" height="20" />
                            {downloadLoading ? '...' : 'PDF'}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <EventReportStats stats={stats} />

                {/* GUEST LIST TABLE section */}
                <EventGuestTable
                    guests={guests}
                    guestsLoading={guestsLoading}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    filterCity={filterCity}
                    setFilterCity={setFilterCity}
                    cities={cities}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setPage={setPage}
                    pagination={pagination}
                    totalGuestsCount={totalGuestsCount}
                    startEntry={startEntry}
                    endEntry={endEntry}
                    page={page}
                    totalPages={totalPages}
                />
            </div>
        </MasterLayout>
    );
};

export default EventReportPage;
