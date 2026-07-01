import { useEffect, useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api/axios";

import jsPDF from "jspdf";

import "./customers.css";

export default function Customers() {

  const navigate =
    useNavigate();

  // ================= STATES =================

  const [customers,
    setCustomers] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  const [loadingMore,
    setLoadingMore] =
    useState(false);

  const [currentTime,
    setCurrentTime] =
    useState(new Date());

  const [search,
    setSearch] =
    useState("");

  const [filterCity,
    setFilterCity] =
    useState("");

  const [filterLocality,
    setFilterLocality] =
    useState("");

  const [fromDate,
    setFromDate] =
    useState("");

  const [toDate,
    setToDate] =
    useState("");

  const [page,
    setPage] =
    useState(1);

  const [hasMore,
    setHasMore] =
    useState(true);

  const [totalCustomers,
    setTotalCustomers] =
    useState(0);

  const [editingId,
    setEditingId] =
    useState(null);

  const [
    isEditModalOpen,
    setIsEditModalOpen,
  ] = useState(false);

  // ================= FORM =================

  const [form,
    setForm] =
    useState({
      name: "",
      phone: "",
      city: "",
      locality: "",
      address: "",
    });

  // ================= POPUP =================

  const [popup,
    setPopup] =
    useState({
      show: false,
      message: "",
      type: "success",
    });

  const showPopup =
    (
      message,
      type = "success"
    ) => {

      setPopup({
        show: true,
        message,
        type,
      });

      setTimeout(() => {

        setPopup({
          show: false,
          message: "",
          type: "success",
        });

      }, 4000);
    };

  // ================= CITIES =================

  const citiesData = {

    Delhi: [
      "Laxmi Nagar",
      "Mayur Vihar",
      "Karol Bagh",
      "Dwarka",
      "Saket",
      "Lajpat Nagar",
    ],

    Noida: [
      "Sector 62",
      "Sector 18",
      "Sector 76",
      "Sector 137",
      "Greater Noida West",
    ],

    Ghaziabad: [
      "Indirapuram",
      "Vaishali",
      "Raj Nagar",
      "Wave City",
    ],

    Gurugram: [
      "DLF Phase 1",
      "DLF Phase 2",
      "Cyber City",
      "Sohna Road",
    ],
  };

  const [localities,
    setLocalities] =
    useState([]);

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

  // ================= FETCH CUSTOMERS =================

  const fetchCustomers =
    async (
      reset = false
    ) => {

      try {

        if (reset) {

          setPage(1);

          setCustomers([]);
        }

        setLoading(reset);

        if (!reset)
          setLoadingMore(true);

        const res =
          await api.get(
            "/customers",
            {
              params: {
                search:
                  search ||
                  undefined,

                city:
                  filterCity ||
                  undefined,

                locality:
                  filterLocality ||
                  undefined,

                from_date:
                  fromDate ||
                  undefined,

                to_date:
                  toDate ||
                  undefined,

                page:
                  reset
                    ? 1
                    : page,

                per_page: 10,
              },
            }
          );

        const newCustomers =
          res.data?.data
            ?.data || [];

        const meta =
          res.data?.data
            ?.meta || {};

        if (reset) {

          setCustomers(
            newCustomers
          );

        } else {

          setCustomers(
            (prev) => [
              ...prev,
              ...newCustomers,
            ]
          );
        }

        setTotalCustomers(
          meta.total || 0
        );

        setHasMore(

          meta.current_page <
            meta.last_page
        );

        if (reset) {

          setPage(2);

        } else {

          setPage(
            (prev) =>
              prev + 1
          );
        }

      } catch (error) {

        console.error(error);
      } finally {

        setLoading(false);

        setLoadingMore(false);
      }
    };

  // ================= INITIAL =================

  useEffect(() => {

    fetchCustomers(true);

  }, [
    search,
    filterCity,
    filterLocality,
    fromDate,
    toDate,
  ]);

  // ================= CITY CHANGE =================

  const handleCityChange =
    (e) => {

      const selected =
        e.target.value;

      setFilterCity(selected);

      setFilterLocality("");

      setLocalities(
        citiesData[
          selected
        ] || []
      );
    };

  // ================= RESET =================

  const resetForm =
    () => {

      setForm({
        name: "",
        phone: "",
        city: "",
        locality: "",
        address: "",
      });

      setLocalities([]);

      setEditingId(null);

      setIsEditModalOpen(
        false
      );
    };
      // ================= SUBMIT =================

  const handleSubmit =
    async () => {

      if (
        !form.name ||
        !form.phone ||
        !form.city
      ) {

        showPopup(
          "Name, Phone aur City required hai!",
          "error"
        );

        return;
      }

      try {

        if (editingId) {

          await api.put(
            `/customers/${editingId}`,
            form
          );

          showPopup(
            "✅ Customer Updated Successfully!"
          );

        } else {

          await api.post(
            "/customers",
            form
          );

          showPopup(
            "✅ Customer Added Successfully!"
          );
        }

        resetForm();

        fetchCustomers(true);

      } catch (error) {

        showPopup(

          error.response?.data
            ?.message ||

          "Something went wrong!",

          "error"
        );
      }
    };

  // ================= EDIT =================

  const handleEdit =
    (customer) => {

      setEditingId(
        customer.id
      );

      setForm({

        name:
          customer.name ||
          "",

        phone:
          customer.phone ||
          "",

        city:
          customer.city ||
          "",

        locality:
          customer.locality ||
          "",

        address:
          customer.address ||
          "",
      });

      if (customer.city) {

        setLocalities(

          citiesData[
            customer.city
          ] || []
        );
      }

      setIsEditModalOpen(
        true
      );
    };

  // ================= WHATSAPP =================

  const openWhatsApp =
    (phone) => {

      if (!phone) {

        return showPopup(
          "No phone number available",
          "error"
        );
      }

      const cleanPhone =
        phone.replace(
          /[^0-9]/g,
          ""
        );

      window.open(
        `https://wa.me/${cleanPhone}`,
        "_blank"
      );
    };

  // ================= CALL PAGE =================

  const openCallPage =
    (customer) => {

      navigate(
        "/calls",
        {
          state: {
            customer_id:
              customer.id,

            customer_name:
              customer.name,

            phone:
              customer.phone,
          },
        }
      );
    };

  // ================= ORDER PAGE =================

  const openOrderPage =
    (customer) => {

      navigate(
        "/orders",
        {
          state: {
            customer_id:
              customer.id,

            customer_name:
              customer.name,

            phone:
              customer.phone,
          },
        }
      );
    };

// ================= PDF =================

const downloadPDF =
  async () => {

    if (
      customers.length === 0
    ) {

      return showPopup(
        "No customers found!",
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
      220,
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
      "CUSTOMERS REPORT",
      105,
      30,
      {
        align:
          "center",
      }
    );

    // ================= USER INFO =================

    const savedUser =
      JSON.parse(
        localStorage.getItem(
          "user"
        ) || "{}"
      );

    const userName =
      savedUser.name ||
      "Admin";

    const userEmail =
      savedUser.email ||
      "admin@gmail.com";

    doc.setFontSize(11);

    doc.text(
      `Generated By: ${userName}`,
      20,
      45
    );

    doc.text(
      `Email: ${userEmail}`,
      20,
      52
    );

    doc.text(

      `Generated On: ${new Date().toLocaleDateString(
        "en-IN"
      )}`,

      145,

      45
    );

    doc.text(

      `Total Customers: ${customers.length}`,

      145,

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
      "Customer Name",
      30,
      y
    );

    doc.text(
      "Phone",
      90,
      y
    );

    doc.text(
      "City",
      130,
      y
    );

    doc.text(
      "Locality",
      165,
      y
    );

    y += 13;

    // ================= TABLE BODY =================

    doc.setTextColor(
      0,
      0,
      0
    );

    doc.setFontSize(10);

    customers.forEach(
      (c, i) => {

        if (y > 275) {

          doc.addPage();

          y = 25;

          // TABLE HEADER AGAIN

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

          doc.text(
            "S.No",
            14,
            y
          );

          doc.text(
            "Customer Name",
            30,
            y
          );

          doc.text(
            "Phone",
            90,
            y
          );

          doc.text(
            "City",
            130,
            y
          );

          doc.text(
            "Locality",
            165,
            y
          );

          y += 13;

          doc.setTextColor(
            0,
            0,
            0
          );
        }

        const customerName =
          c.name?.length > 24

            ? c.name.substring(
                0,
                24
              ) + "..."

            : c.name || "-";

        const city =
          c.city?.length > 12

            ? c.city.substring(
                0,
                12
              ) + "..."

            : c.city || "-";

        const locality =
          c.locality?.length > 14

            ? c.locality.substring(
                0,
                14
              ) + "..."

            : c.locality || "-";

        doc.text(
          `${i + 1}`,
          14,
          y
        );

        doc.text(
          customerName,
          30,
          y
        );

        doc.text(
          c.phone || "-",
          90,
          y
        );

        doc.text(
          city,
          130,
          y
        );

        doc.text(
          locality,
          165,
          y
        );

        y += 10;
      }
    );

    // ================= FOOTER =================

    const pageCount =
      doc.internal.getNumberOfPages();

    for (
      let i = 1;
      i <= pageCount;
      i++
    ) {

      doc.setPage(i);

      doc.setFontSize(9);

      doc.setTextColor(
        100,
        100,
        100
      );

      doc.text(

        `Page ${i} of ${pageCount}`,

        105,

        290,

        {
          align:
            "center",
        }
      );
    }

    // ================= SAVE =================

    doc.save(
      `Customers_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
    );

    showPopup(
      "✅ PDF Downloaded Successfully!"
    );
  };

  return (

    <div className="customers-container">

      {/* ================= HEADER ================= */}

      <div className="page-header">

        <div>

          <h1>
            👥 Customers Management
          </h1>

          <p>

            Total Customers:
            {" "}

            <strong>
              {totalCustomers}
            </strong>

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


      {/* ================= ADD CUSTOMER ================= */}

      <div className="customer-card">

        <h2 className="card-title">
          Add New Customer
        </h2>

        <div className="form-grid">

          {/* NAME */}

          <input
            placeholder="Customer Name *"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name:
                  e.target.value,
              })
            }
            className="customer-input"
          />

          {/* PHONE */}

          <input
            placeholder="Phone Number *"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone:
                  e.target.value,
              })
            }
            className="customer-input"
          />

          {/* CITY */}

          <select
            className="customer-input"
            value={form.city}
            onChange={(e) => {

              const selected =
                e.target.value;

              setForm({
                ...form,
                city: selected,
                locality: "",
              });

              setLocalities(
                citiesData[
                  selected
                ] || []
              );
            }}
          >

            <option value="">
              Select City *
            </option>

            {Object.keys(
              citiesData
            ).map((city) => (

              <option
                key={city}
                value={city}
              >
                {city}
              </option>

            ))}

          </select>

          {/* LOCALITY */}

          <select
            className="customer-input"
            value={
              form.locality
            }
            onChange={(e) =>
              setForm({
                ...form,
                locality:
                  e.target.value,
              })
            }
            disabled={!form.city}
          >

            <option value="">
              Select Locality
            </option>

            {localities.map(
              (loc) => (

                <option
                  key={loc}
                  value={loc}
                >
                  {loc}
                </option>
              )
            )}

          </select>

          {/* ADDRESS */}

          <input
            placeholder="Full Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address:
                  e.target.value,
              })
            }
            className="customer-input"
          />

        </div>

        <button
          className="btn-add"
          onClick={
            handleSubmit
          }
        >
          Add Customer
        </button>

      </div>

     {/* ================= FILTER SECTION ================= */}

<div className="filter-section compact-filter">

  {/* SEARCH */}

  <input
    placeholder="Search by Name or Phone..."
    value={search}
    onChange={(e) =>
      setSearch(
        e.target.value
      )
    }
    className="search-input"
  />

  {/* CITY */}

  <select
    className="customer-input"
    value={filterCity}
    onChange={
      handleCityChange
    }
  >

    <option value="">
      All Cities
    </option>

    {Object.keys(
      citiesData
    ).map((city) => (

      <option
        key={city}
        value={city}
      >
        {city}
      </option>

    ))}

  </select>

  {/* LOCALITY */}

  <select
    className="customer-input"
    value={
      filterLocality
    }
    onChange={(e) =>
      setFilterLocality(
        e.target.value
      )
    }
    disabled={!filterCity}
  >

    <option value="">
      All Localities
    </option>

    {localities.map(
      (loc) => (

        <option
          key={loc}
          value={loc}
        >
          {loc}
        </option>
      )
    )}

  </select>

  {/* FROM */}

  <input
    type="date"
    className="customer-input"
    value={fromDate}
    onChange={(e) =>
      setFromDate(
        e.target.value
      )
    }
  />

  {/* TO */}

  <input
    type="date"
    className="customer-input"
    value={toDate}
    onChange={(e) =>
      setToDate(
        e.target.value
      )
    }
  />

  {/* PDF */}

  <button
    className="btn-download"
    onClick={
      downloadPDF
    }
  >
    📥 PDF
  </button>

</div>
            {/* ================= TABLE ================= */}

      <div className="table-card">

        {loading ? (

          <p className="loading">
            Loading customers...
          </p>

        ) : (

          <>

            <table>

              <thead>

                <tr>

                  <th>
                    Name
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    City
                  </th>

                  <th>
                    Locality
                  </th>

                  <th>
                    Address
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {customers.map(
                  (c) => (

                    <tr key={c.id}>

                      {/* NAME */}

                      <td>

                        <strong>
                          {c.name}
                        </strong>

                      </td>

                      {/* PHONE */}

                      <td>
                        {c.phone}
                      </td>

                      {/* CITY */}

                      <td>
                        {c.city || "-"}
                      </td>

                      {/* LOCALITY */}

                      <td>
                        {c.locality || "-"}
                      </td>

                      {/* ADDRESS */}

                      <td>
                        {c.address || "-"}
                      </td>

                      {/* ACTIONS */}

                      <td className="action-cell">

                        {/* EDIT */}

                        <button
                          className="btn-edit"
                          onClick={() =>
                            handleEdit(c)
                          }
                        >
                          Edit
                        </button>

                        {/* WHATSAPP */}

                        <button
                          className="btn-whatsapp"
                          onClick={() =>
                            openWhatsApp(
                              c.phone
                            )
                          }
                        >
                          💬
                        </button>

                        {/* CALL */}

                        <button
                          className="btn-call"
                          onClick={() =>
                            openCallPage(c)
                          }
                          title="Add Call"
                        >
                          📞
                        </button>

                        {/* ORDER */}

                        <button
                          className="btn-order"
                          onClick={() =>
                            openOrderPage(c)
                          }
                          title="Create Order"
                        >
                          🛒
                        </button>

                      </td>

                    </tr>
                  )
                )}

                {customers.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan="6"
                      className="no-data"
                    >
                      No customers found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

            {/* ================= VIEW MORE ================= */}

            {hasMore &&
              customers.length >
                0 && (

                <div className="load-more">

                  <button
                    className="btn-add"
                    onClick={() =>
                      fetchCustomers()
                    }
                    disabled={
                      loadingMore
                    }
                  >

                    {loadingMore
                      ? "Loading..."
                      : "View More"}

                  </button>

                </div>

              )}

          </>

        )}

      </div>

      {/* ================= EDIT MODAL ================= */}

      {isEditModalOpen && (

        <div className="popup-overlay">

          <div className="popup modal">

            <h3>
              Edit Customer
            </h3>

            <div className="modal-content">

              <input
                placeholder="Customer Name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name:
                      e.target.value,
                  })
                }
                className="customer-input"
              />

              <input
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone:
                      e.target.value,
                  })
                }
                className="customer-input"
              />

              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address:
                      e.target.value,
                  })
                }
                className="customer-input"
              />

            </div>

            <div className="modal-buttons">

              <button
                className="btn-cancel"
                onClick={
                  resetForm
                }
              >
                Cancel
              </button>

              <button
                className="btn-add"
                onClick={
                  handleSubmit
                }
              >
                Update Customer
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= POPUP ================= */}

      {popup.show && (

        <div className="popup-overlay">

          <div
            className={`popup ${popup.type}`}
          >

            <p>
              {popup.message}
            </p>

          </div>

        </div>

      )}

    </div>
  );
}