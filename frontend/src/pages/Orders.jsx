import { useEffect, useMemo, useState } from "react";

import {
  getCustomers,
} from "../api/services/customerService";

import {
  getOrders,
  createOrder,
} from "../api/services/orderService";

import {
  getStocks,
} from "../api/services/stockService";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import "./orders.css";

export default function Orders() {

  // ================= STATES =================

  const [customers, setCustomers] =
    useState([]);

  const [orders, setOrders] =
    useState([]);

  const [stocks, setStocks] =
    useState([]);

  const [filteredCustomers,
    setFilteredCustomers] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [visibleOrders,
    setVisibleOrders] =
    useState(25);

  const [showSuccessPopup,
    setShowSuccessPopup] =
    useState(false);

  const [showHistoryModal,
    setShowHistoryModal] =
    useState(false);

  const [selectedCustomer,
    setSelectedCustomer] =
    useState(null);

  const [selectedCustomerOrders,
    setSelectedCustomerOrders] =
    useState([]);

  const [currentTime,
    setCurrentTime] =
    useState(new Date());

  const [selectedDay,
    setSelectedDay] =
    useState("all");

  const [form, setForm] =
    useState({
      customer_id: "",
      customer_search: "",

      items: [
        {
          product_name: "",
          quantity: 1,
          price: 0,
        },
      ],
    });

  // ================= LIVE CLOCK =================

  useEffect(() => {

    const timer =
      setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  // ================= FETCH =================

  const fetchData = async () => {

    try {

      setIsLoading(true);

      const [
        custRes,
        orderRes,
        stockRes,
      ] = await Promise.all([
        getCustomers(),
        getOrders(),
        getStocks(),
      ]);

      // CUSTOMERS
      const allCustomers =
        Array.isArray(
          custRes?.data?.data?.data
        )
          ? custRes.data.data.data
          : Array.isArray(
              custRes?.data?.data
            )
          ? custRes.data.data
          : [];

      // ORDERS
      const allOrders =
        Array.isArray(
          orderRes?.data?.data?.data
        )
          ? orderRes.data.data.data
          : Array.isArray(
              orderRes?.data?.data
            )
          ? orderRes.data.data
          : [];

      // STOCKS
      const allStocks =
        Array.isArray(
          stockRes?.data?.data?.data
        )
          ? stockRes.data.data.data
          : Array.isArray(
              stockRes?.data?.data
            )
          ? stockRes.data.data
          : [];

      setCustomers(allCustomers);

      setFilteredCustomers(
        allCustomers
      );

      setOrders(allOrders);

      setStocks(allStocks);

    } catch (error) {

      console.error(error);

    } finally {

      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= CUSTOMER SEARCH =================

  const handleCustomerSearch = (e) => {

    const term =
      e.target.value.toLowerCase();

    setForm({
      ...form,
      customer_search: term,
    });

    if (!term) {

      setFilteredCustomers(
        customers
      );

      return;
    }

    const filtered =
      customers.filter(
        (c) =>
          c.name
            ?.toLowerCase()
            .includes(term) ||

          c.phone
            ?.toLowerCase()
            .includes(term)
      );

    setFilteredCustomers(
      filtered
    );

    if (filtered.length === 1) {

      setForm((prev) => ({
        ...prev,
        customer_id:
          filtered[0].id,
      }));
    }
  };

  // ================= ADD ITEM =================

  const addItem = () => {

    setForm({
      ...form,

      items: [
        ...form.items,

        {
          product_name: "",
          quantity: 1,
          price: 0,
        },
      ],
    });
  };

  // ================= REMOVE ITEM =================

  const removeItem = (index) => {

    if (form.items.length === 1)
      return;

    setForm({
      ...form,

      items: form.items.filter(
        (_, i) => i !== index
      ),
    });
  };

  // ================= ITEM CHANGE =================

  const handleItemChange = (
    index,
    field,
    value
  ) => {

    const updated =
      [...form.items];

    updated[index][field] =
      value;

    setForm({
      ...form,
      items: updated,
    });
  };

  // ================= TOTAL =================

  const getTotal = () => {

    return form.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ) *
          Number(
            item.price || 0
          ),

      0
    );
  };

  // ================= SAVE ORDER =================

  const handleSave = async () => {

    if (!form.customer_id) {

      return alert(
        "Please select customer"
      );
    }

    try {

      await createOrder(form);

      setShowSuccessPopup(
        true
      );

      setTimeout(() => {
        setShowSuccessPopup(
          false
        );
      }, 1500);

      setForm({
        customer_id: "",
        customer_search: "",

        items: [
          {
            product_name: "",
            quantity: 1,
            price: 0,
          },
        ],
      });

      fetchData();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to save order"
      );
    }
  };

  // ================= DAY WISE GROUPING =================

  const groupedOrders =
    useMemo(() => {

      const grouped = {};

      orders.forEach((o) => {

        const day =
          o.date || "Unknown";

        if (!grouped[day]) {

          grouped[day] = [];
        }

        grouped[day].push(o);
      });

      return grouped;

    }, [orders]);

  // ================= FILTERED DAYS =================

  const displayedDays =
    selectedDay === "all"
      ? Object.keys(groupedOrders)
      : [selectedDay];

  // ================= CUSTOMER HISTORY =================

  const openCustomerHistory =
    (customerName) => {

      const customerOrders =
        orders.filter(
          (o) =>
            o.customer_name ===
            customerName
        );

      setSelectedCustomer(
        customerName
      );

      setSelectedCustomerOrders(
        customerOrders
      );

      setShowHistoryModal(
        true
      );
    };

  // ================= PDF DOWNLOAD =================

  const downloadCustomerPDF =
    (
      customerName,
      customerOrders
    ) => {

      const doc =
        new jsPDF();

      // HEADER
      doc.setFillColor(
        15,
        23,
        42
      );

      doc.rect(
        0,
        0,
        220,
        40,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(22);

      doc.text(
        "Customer Order Report",
        105,
        18,
        {
          align: "center",
        }
      );

      doc.setFontSize(12);

      doc.text(
        `Customer: ${customerName}`,
        14,
        32
      );

      doc.text(
        `Generated: ${new Date().toLocaleDateString(
          "en-IN"
        )}`,
        150,
        32
      );

      // TABLE
      autoTable(doc, {

        startY: 50,

        head: [[
          "#",
          "Product",
          "Qty",
          "Price",
          "Total",
          "Date",
        ]],

        body:
          customerOrders.map(
            (o, index) => [
              index + 1,
              o.product_name,
              o.quantity,
              `₹${o.price}`,
              `₹${o.total}`,
              o.date,
            ]
          ),

        theme: "grid",

        headStyles: {
          fillColor: [
            37,
            99,
            235,
          ],
        },

        styles: {
          fontSize: 10,
        },
      });

      doc.save(
        `${customerName}_Orders.pdf`
      );
    };
      return (
    <div className="orders-container">

      {/* HEADER */}
      <div className="page-header">

        <div>
          <h1>
            📋 Orders Management
          </h1>

          <p className="page-subtitle">
            Manage customer orders,
            history & reports
          </p>
        </div>

        <div className="live-time">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {/* CREATE ORDER */}
      <div className="order-card">

        <h2 className="card-title">
          Create New Order
        </h2>

        {/* CUSTOMER SEARCH */}
        <div className="customer-section">

          <label>
            Search Customer
          </label>

          <input
            type="text"
            className="input"
            placeholder="Search by name or phone"
            value={
              form.customer_search
            }
            onChange={
              handleCustomerSearch
            }
          />

          <select
            className="input mt-2"
            value={form.customer_id}
            onChange={(e) =>
              setForm({
                ...form,
                customer_id:
                  e.target.value,
              })
            }
          >
            <option value="">
              Select Customer
            </option>

            {filteredCustomers.map(
              (c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.name} - {c.phone}
                </option>
              )
            )}
          </select>
        </div>

        {/* ITEMS */}
        <div className="items-section">

          <div className="section-header">

            <h3>
              Order Items
            </h3>

            <button
              className="btn-add"
              onClick={addItem}
            >
              + Add Item
            </button>
          </div>

          {form.items.map(
            (item, i) => (

              <div
                key={i}
                className="item-row"
              >

                {/* PRODUCT */}
                <select
                  className="input"
                  value={
                    item.product_name
                  }
                  onChange={(e) => {

                    const selected =
                      stocks.find(
                        (s) =>
                          s.product_name ===
                          e.target.value
                      );

                    const updated = [
                      ...form.items,
                    ];

                    updated[
                      i
                    ].product_name =
                      e.target.value;

                    if (selected) {

                      updated[
                        i
                      ].price =
                        Number(
                          selected.price
                        ) || 0;
                    }

                    setForm({
                      ...form,
                      items: updated,
                    });
                  }}
                >
                  <option value="">
                    Select Product
                  </option>

                  {stocks.map((s) => (

                    <option
                      key={s.id}
                      value={
                        s.product_name
                      }
                    >
                      {s.product_name}
                      {" "}
                      (
                      Stock:
                      {" "}
                      {s.quantity}
                      )
                    </option>
                  ))}
                </select>

                {/* QTY */}
                <input
                  type="number"
                  className="input"
                  placeholder="Qty"
                  value={
                    item.quantity
                  }
                  onChange={(e) =>
                    handleItemChange(
                      i,
                      "quantity",
                      Number(
                        e.target.value
                      )
                    )
                  }
                />

                {/* PRICE */}
                <input
                  type="number"
                  className="input"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(
                      i,
                      "price",
                      Number(
                        e.target.value
                      )
                    )
                  }
                />

                {/* TOTAL */}
                <div className="item-total">
                  ₹
                  {(
                    item.quantity *
                    item.price
                  ).toFixed(2)}
                </div>

                {/* REMOVE */}
                <button
                  className="btn-remove"
                  onClick={() =>
                    removeItem(i)
                  }
                >
                  ✕
                </button>

              </div>
            )
          )}
        </div>

        {/* FOOTER */}
        <div className="order-footer">

          <div className="grand-total">

            <span>
              Grand Total
            </span>

            <strong>
              ₹
              {getTotal().toFixed(
                2
              )}
            </strong>
          </div>

          <button
            className="btn-save"
            onClick={handleSave}
          >
            Save Order
          </button>
        </div>
      </div>

      {/* LOADING */}
      {isLoading && (
        <p className="loading-text">
          Loading Orders...
        </p>
      )}

      {/* DAY FILTER */}
      <div className="day-filter-card">

        <label>
          Filter Orders By Date
        </label>

        <select
          className="input"
          value={selectedDay}
          onChange={(e) =>
            setSelectedDay(
              e.target.value
            )
          }
        >
          <option value="all">
            All Days
          </option>

          {Object.keys(
            groupedOrders
          ).map((day) => (
            <option
              key={day}
              value={day}
            >
              {day}
            </option>
          ))}
        </select>
      </div>

      {/* DAY WISE ORDERS */}
      {displayedDays.map((day) => (

        <div
          key={day}
          className="table-card"
        >

          <div className="table-header">

            <div>

              <h2>
                📅 {day}
              </h2>

              <p className="table-subtitle">
                Orders:
                {" "}
                <strong>
                  {
                    groupedOrders[
                      day
                    ]?.length
                  }
                </strong>
              </p>
            </div>
          </div>

          <div className="table-responsive">

            <table className="modern-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {groupedOrders[
                  day
                ]
                  ?.slice(
                    0,
                    visibleOrders
                  )
                  .map(
                    (o, i) => (

                      <tr
                        key={i}
                      >

                        <td>
                          {i + 1}
                        </td>

                        <td>

                          <button
                            className="customer-link-btn"
                            onClick={() =>
                              openCustomerHistory(
                                o.customer_name
                              )
                            }
                          >
                            👤
                            {" "}
                            {
                              o.customer_name
                            }
                          </button>

                        </td>

                        <td>
                          <span className="product-badge">
                            {
                              o.product_name
                            }
                          </span>
                        </td>

                        <td>
                          {o.quantity}
                        </td>

                        <td>
                          ₹{o.price}
                        </td>

                        <td>
                          <strong className="price-text">
                            ₹{o.total}
                          </strong>
                        </td>

                        <td>

                          <button
                            className="btn-download-pdf"
                            onClick={() =>
                              downloadCustomerPDF(
                                o.customer_name,
                                selectedCustomerOrders
                              )
                            }
                          >
                            PDF
                          </button>

                        </td>

                      </tr>
                    )
                  )}
              </tbody>
            </table>
          </div>

          {/* VIEW MORE */}
          {groupedOrders[
            day
          ]?.length >
            visibleOrders && (

            <div className="load-more">

              <button
                className="btn-view-more"
                onClick={() =>
                  setVisibleOrders(
                    prev =>
                      prev + 25
                  )
                }
              >
                View More Orders
              </button>

            </div>
          )}
        </div>
      ))}

      {/* CUSTOMER HISTORY MODAL */}
      {showHistoryModal && (

        <div className="modal-overlay">

          <div className="history-modal">

            <div className="history-header">

              <div>

                <h2>
                  👤
                  {" "}
                  {selectedCustomer}
                </h2>

                <p>
                  Total Orders:
                  {" "}
                  {
                    selectedCustomerOrders.length
                  }
                </p>
              </div>

              <div className="history-actions">

                <button
                  className="btn-download-pdf"
                  onClick={() =>
                    downloadCustomerPDF(
                      selectedCustomer,
                      selectedCustomerOrders
                    )
                  }
                >
                  Download PDF
                </button>

                <button
                  className="btn-close"
                  onClick={() =>
                    setShowHistoryModal(
                      false
                    )
                  }
                >
                  ✕
                </button>

              </div>
            </div>

            <div className="history-table">

              <table className="modern-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {selectedCustomerOrders.map(
                    (o, i) => (

                      <tr
                        key={i}
                      >

                        <td>
                          {i + 1}
                        </td>

                        <td>
                          {
                            o.product_name
                          }
                        </td>

                        <td>
                          {o.quantity}
                        </td>

                        <td>
                          ₹{o.price}
                        </td>

                        <td>
                          ₹{o.total}
                        </td>

                        <td>
                          {o.date}
                        </td>

                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {showSuccessPopup && (

        <div className="success-popup">

          <div className="success-popup-content">
            ✅ Order Saved Successfully!
          </div>

        </div>
      )}
    </div>
  );
}