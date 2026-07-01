import {
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

import jsPDF from "jspdf";

import "./call.css";

export default function Calls() {

  // ================= STATES =================

  const [customers,
    setCustomers] =
    useState([]);

  const [calls,
    setCalls] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  const [currentTime,
    setCurrentTime] =
    useState(new Date());

  // ================= COUNTS =================

  const [dailyCalls,
    setDailyCalls] =
    useState(0);

  const [monthlyCalls,
    setMonthlyCalls] =
    useState(0);

  const [totalCalls,
    setTotalCalls] =
    useState(0);

  // ================= VIEW MORE =================

  const [visibleCalls,
    setVisibleCalls] =
    useState(15);

  // ================= FILTERS =================

  const [searchTerm,
    setSearchTerm] =
    useState("");

  const [customerSearch,
    setCustomerSearch] =
    useState("");

  const [fromDate,
    setFromDate] =
    useState("");

  const [toDate,
    setToDate] =
    useState("");

  // ================= FORM =================

  const [form,
    setForm] =
    useState({

      customer_id: "",

      notes: "",

      status:
        "pending",

      follow_up_date:
        "",
    });

  // ================= MODALS =================

  const [editModal,
    setEditModal] =
    useState({

      show: false,

      call: null,
    });

  const [editForm,
    setEditForm] =
    useState({

      notes: "",

      status:
        "pending",

      follow_up_date:
        "",
    });

  const [noteModal,
    setNoteModal] =
    useState({

      show: false,

      note: "",
    });

  const [historyModal,
    setHistoryModal] =
    useState({

      show: false,

      customer: null,

      customerCalls:
        [],
    });

  // ================= CLOCK =================

  useEffect(() => {

    const timer =
      setInterval(() => {

        setCurrentTime(
          new Date()
        );

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  // ================= FETCH =================

  const fetchData =
    async () => {

      try {

        setLoading(true);

        const [

          customerRes,

          callsRes,

        ] = await Promise.all([

          api.get(
            "/customers?per_page=50000"
          ),

          api.get(
            "/calls?per_page=50000"
          ),
        ]);

        const customerData =

          customerRes.data
            ?.data?.data ||

          customerRes.data
            ?.data ||

          [];

        setCustomers(
          customerData
        );

        const allCalls =

          callsRes.data
            ?.data?.data ||

          callsRes.data
            ?.data ||

          [];

        setCalls(allCalls);

        // ================= TOTAL =================

        setTotalCalls(

          callsRes.data?.data
            ?.meta?.total ||

          allCalls.length
        );

        // ================= TODAY =================

        const today =
          new Date()
            .toISOString()
            .split("T")[0];

        const todayData =
          allCalls.filter(
            (c) =>

              c.created_at
                ?.split("T")[0] ===
              today
          );

        setDailyCalls(
          todayData.length
        );

        // ================= MONTHLY =================

        const currentMonth =
          new Date().getMonth();

        const currentYear =
          new Date().getFullYear();

        const monthData =
          allCalls.filter(
            (c) => {

              if (
                !c.created_at
              )
                return false;

              const d =
                new Date(
                  c.created_at
                );

              return (

                d.getMonth() ===
                  currentMonth &&

                d.getFullYear() ===
                  currentYear
              );
            }
          );

        setMonthlyCalls(
          monthData.length
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchData();

  }, []);
    // ================= FILTERED CALLS =================

  const filteredCalls =
    calls.filter(
      (call) => {

        const term =
          searchTerm.toLowerCase();

        const matchSearch =

          !searchTerm ||

          call.customer?.name
            ?.toLowerCase()
            .includes(term) ||

          call.customer?.phone
            ?.includes(term);

        const callDate =
          call.created_at
            ?.split("T")[0];

        const matchFrom =

          !fromDate ||

          callDate >= fromDate;

        const matchTo =

          !toDate ||

          callDate <= toDate;

        return (

          matchSearch &&

          matchFrom &&

          matchTo
        );
      }
    );

  // ================= POPUP =================

  const showPopup =
    (
      message,
      type = "success"
    ) => {

      const popup =
        document.createElement(
          "div"
        );

      popup.className =
        `success-popup ${type}`;

      popup.innerHTML = `
        <div class="success-popup-content">
          ${message}
        </div>
      `;

      document.body.appendChild(
        popup
      );

      setTimeout(() => {

        popup.remove();

      }, 3000);
    };

  // ================= SAVE CALL =================

  const handleSaveCall =
    async () => {

      if (
        !form.customer_id
      ) {

        return showPopup(
          "Please Select Customer",
          "error"
        );
      }

      try {

        const payload = {

          customer_id:
            form.customer_id,

          notes:
            form.notes,

          status:
            form.status,

          follow_up_date:
            form.follow_up_date ||
            null,
        };

        await api.post(
          "/calls",
          payload
        );

        // ================= REMINDER =================

        if (

          form.status ===
            "follow_up" &&

          form.follow_up_date

        ) {

          await api.post(
            "/reminders",
            {

              customer_id:
                form.customer_id,

              type:
                "call",

              reminder_datetime:
                form.follow_up_date,

              notes:
                form.notes,
            }
          );
        }

        showPopup(
          "✅ Call Saved Successfully!"
        );

        setForm({

          customer_id: "",

          notes: "",

          status:
            "pending",

          follow_up_date:
            "",
        });

        setCustomerSearch(
          ""
        );

        fetchData();

      } catch (error) {

        console.error(error);

        showPopup(
          "Failed To Save Call",
          "error"
        );
      }
    };

  // ================= EDIT =================

  const handleEditCall =
    (call) => {

      setEditModal({

        show: true,

        call,
      });

      setEditForm({

        notes:
          call.notes || "",

        status:
          call.status ||
          "pending",

        follow_up_date:
          call.follow_up_date
            ? call.follow_up_date.split(
                "T"
              )[0]
            : "",
      });
    };

  // ================= UPDATE =================

  const handleUpdateCall =
    async () => {

      try {

        await api.put(

          `/calls/${editModal.call.id}`,

          editForm
        );

        showPopup(
          "✅ Updated Successfully!"
        );

        setEditModal({

          show: false,

          call: null,
        });

        fetchData();

      } catch (error) {

        console.error(error);

        showPopup(
          "Update Failed",
          "error"
        );
      }
    };

  // ================= NOTE =================

  const showFullNote =
    (note) => {

      setNoteModal({

        show: true,

        note:
          note ||
          "No Notes",
      });
    };

  // ================= WHATSAPP =================

  const openWhatsApp =
    (phone) => {

      if (!phone)
        return;

      window.open(

        `https://wa.me/${phone.replace(
          /[^0-9]/g,
          ""
        )}`,

        "_blank"
      );
    };
      // ================= HISTORY =================

  const showCallHistory =
    (customer) => {

      const customerCalls =

        calls
          .filter(
            (c) =>

              c.customer_id ===
              customer.id
          )
          .sort(
            (a, b) =>

              new Date(
                b.created_at
              ) -

              new Date(
                a.created_at
              )
          );

      setHistoryModal({

        show: true,

        customer,

        customerCalls,
      });
    };

  // ================= USER INFO =================

  const getUserInfo =
    () => {

      let name =
        "Admin";

      let email =
        "";

      const savedUser =
        localStorage.getItem(
          "user"
        );

      if (savedUser) {

        try {

          const user =
            JSON.parse(
              savedUser
            );

          name =
            user.name ||
            name;

          email =
            user.email ||
            email;

        } catch (e) {

          console.error(e);
        }
      }

      return {
        name,
        email,
      };
    };

  // ================= PDF GENERATOR =================

  const generatePDF =
    (
      title,
      pdfData
    ) => {

      if (
        pdfData.length === 0
      ) {

        return showPopup(
          "No Data Found!",
          "error"
        );
      }

      const doc =
        new jsPDF();

      let y = 65;

      // ================= HEADER =================

      doc.setFillColor(
        0,
        102,
        204
      );

      doc.rect(
        0,
        0,
        210,
        55,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(20);

      doc.text(
        "SINGHANIA MED PVT LTD",
        105,
        18,
        {
          align:
            "center",
        }
      );

      doc.setFontSize(16);

      doc.text(
        title,
        105,
        30,
        {
          align:
            "center",
        }
      );

      const userInfo =
        getUserInfo();

      doc.setFontSize(11);

      doc.text(
        `Generated By: ${userInfo.name}`,
        20,
        45
      );

      doc.text(
        `Email: ${userInfo.email}`,
        20,
        52
      );

      doc.text(

        `Generated On: ${new Date().toLocaleDateString(
          "en-IN"
        )}`,

        135,

        45
      );

      doc.text(

        `Total Calls: ${pdfData.length}`,

        135,

        52
      );

      // ================= TABLE HEADER =================

      y = 72;

      doc.setFillColor(
        15,
        23,
        42
      );

      doc.rect(
        10,
        y - 8,
        190,
        12,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(11);

      doc.text(
        "S.No",
        14,
        y
      );

      doc.text(
        "Customer",
        28,
        y
      );

      doc.text(
        "Phone",
        72,
        y
      );

      doc.text(
        "Status",
        106,
        y
      );

      doc.text(
        "Date",
        136,
        y
      );

      doc.text(
        "Notes",
        165,
        y
      );

      y += 13;

      // ================= BODY =================

      doc.setTextColor(
        0,
        0,
        0
      );

      doc.setFontSize(9);

      pdfData.forEach(
        (
          call,
          i
        ) => {

          if (y > 275) {

            doc.addPage();

            y = 25;
          }

          const customerName =

            call.customer
              ?.name
              ?.length > 18

              ? call.customer.name.substring(
                  0,
                  16
                ) + "..."

              : call.customer
                  ?.name ||
                "-";

          const notes =

            call.notes
              ?.length > 18

              ? call.notes.substring(
                  0,
                  15
                ) + "..."

              : call.notes ||
                "-";

          doc.text(
            `${i + 1}`,
            14,
            y
          );

          doc.text(
            customerName,
            28,
            y
          );

          doc.text(

            call.customer
              ?.phone || "-",

            72,

            y
          );

          doc.text(

            (
              call.status ||
              "-"
            ).toUpperCase(),

            106,

            y
          );

          doc.text(

            call.created_at

              ? new Date(
                  call.created_at
                ).toLocaleDateString(
                  "en-IN"
                )

              : "-",

            136,

            y
          );

          doc.text(
            notes,
            165,
            y
          );

          y += 10;
        }
      );
            // ================= FOOTER =================

      const pages =
        doc.internal.getNumberOfPages();

      for (
        let i = 1;
        i <= pages;
        i++
      ) {

        doc.setPage(i);

        doc.setFontSize(9);

        doc.text(

          `Page ${i} of ${pages}`,

          105,

          290,

          {
            align:
              "center",
          }
        );
      }

      doc.save(
        `${title}_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`
      );

      showPopup(
        "✅ PDF Downloaded!"
      );
    };

  // ================= PDF FUNCTIONS =================

  const downloadAllCallsPDF =
    () => {

      generatePDF(
        "ALL_CALLS_REPORT",
        calls
      );
    };

  const downloadTodayCallsPDF =
    () => {

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const todayCalls =

        calls.filter(
          (c) =>

            c.created_at
              ?.split("T")[0] ===
            today
        );

      generatePDF(
        "TODAY_CALLS_REPORT",
        todayCalls
      );
    };

  // ================= MONTHLY PDF =================

  const downloadMonthlyPDF =
    () => {

      const currentMonth =
        new Date().getMonth();

      const currentYear =
        new Date().getFullYear();

      const monthCalls =

        calls.filter((c) => {

          if (!c.created_at)
            return false;

          const d =
            new Date(
              c.created_at
            );

          return (

            d.getMonth() ===
              currentMonth &&

            d.getFullYear() ===
              currentYear
          );
        });

      generatePDF(
        "MONTHLY_CALLS_REPORT",
        monthCalls
      );
    };

  // ================= CUSTOMER HISTORY PDF =================

  const downloadCustomerHistoryPDF =
    (
      customer,
      customerCalls
    ) => {

      generatePDF(
        `${customer.name}_CALL_HISTORY`,
        customerCalls
      );
    };

  // ================= DATE PDF =================

  const downloadDateWisePDF =
    () => {

      generatePDF(
        "DATE_WISE_CALLS_REPORT",
        filteredCalls
      );
    };

  // ================= JSX =================

  return (

    <div className="call-container">

      {/* ================= HEADER ================= */}

      <div className="page-header">

        <div>

          <h1>
            📞 Call Management
          </h1>

          <p>
            Track Calls & Follow Ups
          </p>

        </div>

        <div className="live-time">

          {currentTime.toLocaleTimeString(
            "en-IN",
            {
              hour:
                "2-digit",

              minute:
                "2-digit",

              second:
                "2-digit",
            }
          )}

        </div>

      </div>

      {/* ================= LOG NEW CALL ================= */}

      <div className="call-card">

        <div className="call-card-top">

          <h2 className="card-title">
            Log New Call
          </h2>

          <button
            className="mini-pdf-btn"
            onClick={
              downloadAllCallsPDF
            }
          >
            📥 All Calls PDF
          </button>

        </div>

        <div className="form-grid">

          {/* ================= CUSTOMER SEARCH ================= */}

          <div className="customer-search-box">

            <input
              type="text"
              className="call-input"
              placeholder="Search Customer by Name or Mobile..."
              value={
                customerSearch
              }
              onChange={(e) =>
                setCustomerSearch(
                  e.target.value
                )
              }
            />
                        {customerSearch && (

              <div className="customer-dropdown">

                {customers
                  .filter((c) => {

                    const term =
                      customerSearch.toLowerCase();

                    return (

                      c.name
                        ?.toLowerCase()
                        .includes(term) ||

                      c.phone
                        ?.includes(term)
                    );
                  })
                  .slice(0, 10)
                  .map((c) => (

                    <div
                      key={c.id}
                      className="customer-option"
                      onClick={() => {

                        setForm({
                          ...form,
                          customer_id:
                            c.id,
                        });

                        setCustomerSearch(
                          `${c.name} (${c.phone})`
                        );
                      }}
                    >

                      <strong>
                        {c.name}
                      </strong>

                      <br />

                      <small>
                        {c.phone}
                      </small>

                    </div>

                  ))}

              </div>

            )}

          </div>

          {/* ================= NOTES ================= */}

          <input
            className="call-input"
            placeholder="Call Notes"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes:
                  e.target.value,
              })
            }
          />

          {/* ================= STATUS ================= */}

          <select
            className="call-input"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status:
                  e.target.value,
              })
            }
          >

            <option value="pending">
              Pending
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="follow_up">
              Follow Up
            </option>

          </select>

          {/* ================= FOLLOWUP DATE ================= */}

          <input
            type="date"
            className="call-input"
            value={
              form.follow_up_date
            }
            onChange={(e) =>
              setForm({
                ...form,
                follow_up_date:
                  e.target.value,
              })
            }
          />

        </div>

        <button
          className="call-btn"
          onClick={
            handleSaveCall
          }
        >
          Save Call
        </button>

      </div>

      {/* ================= OVERVIEW ================= */}

      <div className="overview-grid">

        {/* TODAY */}

        <div className="overview-card daily">

          <div className="overview-top">

            <h3>
              Today's Calls
            </h3>

            <button
              className="mini-pdf-btn"
              onClick={
                downloadTodayCallsPDF
              }
            >
              PDF
            </button>

          </div>

          <h2>
            {dailyCalls}
          </h2>

        </div>

        {/* MONTHLY */}

        <div className="overview-card monthly">

          <div className="overview-top">

            <h3>
              Monthly Calls
            </h3>

            <button
              className="mini-pdf-btn"
              onClick={
                downloadMonthlyPDF
              }
            >
              PDF
            </button>

          </div>

          <h2>
            {monthlyCalls}
          </h2>

        </div>

        {/* TOTAL */}

        <div className="overview-card total">

          <h3>
            Total Calls
          </h3>

          <h2>
            {totalCalls}
          </h2>

        </div>

      </div>
            {/* ================= FILTER SECTION ================= */}

      <div className="filter-section">

        <input
          type="text"
          className="call-input"
          placeholder="Search Name or Mobile..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
        />

        <input
          type="date"
          className="call-input"
          value={fromDate}
          onChange={(e) =>
            setFromDate(
              e.target.value
            )
          }
        />

        <input
          type="date"
          className="call-input"
          value={toDate}
          onChange={(e) =>
            setToDate(
              e.target.value
            )
          }
        />

        {/* DATE PDF */}

        <button
          className="mini-pdf-btn"
          onClick={
            downloadDateWisePDF
          }
        >
          📥 Date PDF
        </button>

      </div>

      {/* ================= TABLE ================= */}

      <div className="call-table-card">

        {loading ? (

          <p className="loading">
            Loading Calls...
          </p>

        ) : (

          <>

            <table className="call-table">

              <thead>

                <tr>

                  <th>
                    Customer
                  </th>

                  <th>
                    Notes
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Follow Up
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredCalls.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="call-empty"
                    >
                      No Calls Found
                    </td>

                  </tr>

                ) : (

                  filteredCalls
                    .slice(
                      0,
                      visibleCalls
                    )
                    .map(
                      (call) => (

                        <tr
                          key={call.id}
                        >

                          {/* CUSTOMER */}

                          <td>

                            <strong>
                              {
                                call.customer
                                  ?.name
                              }
                            </strong>

                            <br />

                            <small>
                              {
                                call.customer
                                  ?.phone
                              }
                            </small>

                          </td>

                          {/* NOTES */}

                          <td>

                            <div className="notes-cell">

                              <span>

                                {call.notes
                                  ? call.notes.substring(
                                      0,
                                      60
                                    )
                                  : "-"}

                                {call.notes?.length >
                                60
                                  ? "..."
                                  : ""}

                              </span>

                              {call.notes && (

                                <button
                                  className="view-more-btn"
                                  onClick={() =>
                                    showFullNote(
                                      call.notes
                                    )
                                  }
                                >
                                  View More
                                </button>

                              )}

                            </div>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`status-badge ${call.status}`}
                            >

                              {
                                call.status
                              }

                            </span>

                          </td>

                          {/* FOLLOWUP */}

                          <td>

                            {call.follow_up_date

                              ? new Date(
                                  call.follow_up_date
                                ).toLocaleDateString(
                                  "en-IN"
                                )

                              : "-"}

                          </td>

                          {/* DATE */}

                          <td>

                            {call.created_at

                              ? new Date(
                                  call.created_at
                                ).toLocaleString(
                                  "en-IN"
                                )

                              : "-"}

                          </td>

                          {/* ACTIONS */}

                          <td className="action-buttons">

                            {/* WHATSAPP */}

                            <button
                              className="action-btn whatsapp"
                              onClick={() =>
                                openWhatsApp(
                                  call.customer
                                    ?.phone
                                )
                              }
                            >
                              💬
                            </button>

                            {/* EDIT */}

                            <button
                              className="action-btn edit"
                              onClick={() =>
                                handleEditCall(
                                  call
                                )
                              }
                            >
                              ✏️
                            </button>

                            {/* HISTORY */}

                            <button
                              className="action-btn history"
                              onClick={() =>
                                showCallHistory(
                                  call.customer
                                )
                              }
                            >
                              📜
                            </button>

                          </td>

                        </tr>
                      )
                    )

                )}

              </tbody>

            </table>
            
                        {/* ================= VIEW MORE CALLS ================= */}

            {filteredCalls.length >
              visibleCalls && (

              <div className="load-more">

                <button
                  className="btn-add"
                  onClick={() =>

                    setVisibleCalls(
                      (prev) =>
                        prev + 15
                    )
                  }
                >
                  View More Calls
                </button>

              </div>

            )}

          </>

        )}

      </div>

      {/* ================= EDIT MODAL ================= */}

      {editModal.show && (

        <div className="popup-overlay">

          <div className="popup modal">

            <h3>
              Edit Call
            </h3>

            <div className="modal-content">

              <textarea
                rows="5"
                placeholder="Call Notes"
                value={
                  editForm.notes
                }
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    notes:
                      e.target.value,
                  })
                }
              />

              <select
                value={
                  editForm.status
                }
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    status:
                      e.target.value,
                  })
                }
              >

                <option value="pending">
                  Pending
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="follow_up">
                  Follow Up
                </option>

              </select>

              <input
                type="date"
                value={
                  editForm.follow_up_date
                }
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    follow_up_date:
                      e.target.value,
                  })
                }
              />

            </div>

            <div className="modal-buttons">

              <button
                className="btn-cancel"
                onClick={() =>
                  setEditModal({

                    show: false,

                    call: null,
                  })
                }
              >
                Cancel
              </button>

              <button
                className="btn-add"
                onClick={
                  handleUpdateCall
                }
              >
                Update Call
              </button>

            </div>

          </div>

        </div>

      )}
            {/* ================= NOTE MODAL ================= */}

      {noteModal.show && (

        <div className="popup-overlay">

          <div className="popup modal">

            <h3>
              Full Note
            </h3>

            <p
              style={{
                whiteSpace:
                  "pre-wrap",

                lineHeight:
                  "1.8",

                color:
                  "#334155",
              }}
            >
              {
                noteModal.note
              }
            </p>

            <button
              className="btn-cancel"
              onClick={() =>
                setNoteModal({

                  show: false,

                  note: "",
                })
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* ================= HISTORY MODAL ================= */}

      {historyModal.show && (

        <div className="popup-overlay">

          <div className="popup modal history-modal">

            <div className="call-card-top">

              <h3>

                Call History
                {" - "}

                {
                  historyModal
                    .customer?.name
                }

              </h3>

              {/* CUSTOMER PDF */}

              <button
                className="mini-pdf-btn"
                onClick={() =>

                  downloadCustomerHistoryPDF(

                    historyModal.customer,

                    historyModal.customerCalls
                  )
                }
              >
                📥 PDF
              </button>

            </div>

            <div className="history-list">

              {historyModal.customerCalls
                .length === 0 ? (

                <div className="empty-history">

                  No Call History Found

                </div>

              ) : (

                historyModal.customerCalls.map(
                  (
                    call,
                    i
                  ) => (

                    <div
                      key={i}
                      className="history-item"
                    >

                      <div className="history-top">

                        <div className="history-date">

                          {new Date(
                            call.created_at
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </div>

                        <span
                          className={`status-badge ${call.status}`}
                        >

                          {
                            call.status
                          }

                        </span>

                      </div>

                      <div className="history-note">

                        {call.notes ||
                          "No Notes"}

                      </div>

                      {call.follow_up_date && (

                        <div className="history-followup">

                          Follow Up:
                          {" "}

                          {new Date(
                            call.follow_up_date
                          ).toLocaleDateString(
                            "en-IN"
                          )}

                        </div>

                      )}

                    </div>
                  )
                )

              )}

            </div>

            <button
              className="btn-cancel"
              onClick={() =>
                setHistoryModal({

                  show: false,

                  customer: null,

                  customerCalls:
                    [],
                })
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}