import { useEffect, useState } from "react";

import api from "../api/axios";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import "./stock.css";

export default function Stock() {

  const [stockItems, setStockItems] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [visibleItems,
    setVisibleItems] =
    useState(50);

  const [form, setForm] =
    useState({
      product_name: "",
      sku: "",
      quantity: "",
      price: "",
      description: "",
      status: "active",
    });

  const [popup, setPopup] =
    useState({
      show: false,
      message: "",
      type: "success",
    });

  // ================= POPUP =================

  const showPopup = (
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

    }, 3000);
  };

  // ================= FETCH =================

  const fetchStock = async () => {

    try {

      setLoading(true);

      const res =
        await api.get(
          "/stocks",
          {
            params: {
              search,
            },
          }
        );

      const items =
        Array.isArray(
          res.data?.data?.data
        )
          ? res.data.data.data
          : Array.isArray(
              res.data?.data
            )
          ? res.data.data
          : [];

      setStockItems(items);

    } catch (error) {

      console.error(error);

      showPopup(
        "Failed to load stock",
        "error"
      );

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [search]);

  // ================= SUBMIT =================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      if (
        !form.product_name ||
        !form.quantity ||
        !form.price
      ) {

        showPopup(
          "Please fill required fields",
          "error"
        );

        return;
      }

      try {

        await api.post(
          "/stocks",
          form
        );

        showPopup(
          "✅ Stock Added Successfully"
        );

        setForm({
          product_name: "",
          sku: "",
          quantity: "",
          price: "",
          description: "",
          status: "active",
        });

        fetchStock();

      } catch (error) {

        console.error(error);

        showPopup(
          "Failed to add stock",
          "error"
        );
      }
    };

  // ================= DELETE =================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this stock item?"
        );

      if (!confirmDelete)
        return;

      try {

        await api.delete(
          `/stocks/${id}`
        );

        showPopup(
          "Stock deleted successfully"
        );

        fetchStock();

      } catch (error) {

        console.error(error);

        showPopup(
          "Delete failed",
          "error"
        );
      }
    };

  // ================= UPDATE =================

  const handleUpdate =
    async (item) => {

      try {

        await api.put(
          `/stocks/${item.id}`,
          {
            quantity:
              item.quantity,

            price:
              item.price,

            status:
              item.status,
          }
        );

        showPopup(
          "✅ Stock Updated"
        );

        fetchStock();

      } catch (error) {

        console.error(error);

        showPopup(
          "Update failed",
          "error"
        );
      }
    };

  // ================= INPUT CHANGE =================

  const handleInlineChange = (
    id,
    field,
    value
  ) => {

    setStockItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  // ================= PDF =================

  const downloadPDF = () => {

    if (stockItems.length === 0) {

      showPopup(
        "No stock available",
        "error"
      );

      return;
    }

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

    doc.setFontSize(24);

    doc.text(
      "Full Stock Report",
      105,
      18,
      {
        align: "center",
      }
    );

    doc.setFontSize(11);

    doc.text(
      `Generated: ${new Date().toLocaleDateString(
        "en-IN"
      )}`,
      105,
      30,
      {
        align: "center",
      }
    );

    const totalQty =
      stockItems.reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity || 0
          ),
        0
      );

    autoTable(doc, {

      startY: 50,

      head: [[
        "#",
        "Product",
        "SKU",
        "Qty",
        "Price",
        "Status",
      ]],

      body:
        stockItems.map(
          (item, index) => [

            index + 1,

            item.product_name,

            item.sku || "-",

            item.quantity,

            `₹${item.price}`,

            item.status,
          ]
        ),

      foot: [[
        "",
        "",
        "TOTAL",
        totalQty,
        "",
        "",
      ]],

      theme: "grid",

      headStyles: {
        fillColor: [
          37,
          99,
          235,
        ],
      },

      footStyles: {
        fillColor: [
          22,
          163,
          74,
        ],
      },

      styles: {
        fontSize: 10,
      },
    });

    doc.save(
      `Full_Stock_Report_${
        new Date()
          .toISOString()
          .split("T")[0]
      }.pdf`
    );

    showPopup(
      "PDF Downloaded Successfully"
    );
  };
    return (
    <div className="stock-container">

      {/* HEADER */}
      <div className="page-header">

        <div>

          <h1>
            📦 Stock Management
          </h1>

          <p>
            Total Products:
            {" "}
            <strong>
              {stockItems.length}
            </strong>

            {" "} | {" "}

            Total Quantity:
            {" "}
            <strong>
              {
                stockItems.reduce(
                  (sum, item) =>
                    sum +
                    Number(
                      item.quantity || 0
                    ),
                  0
                )
              }
            </strong>
          </p>
        </div>

        <button
          className="btn-download"
          onClick={downloadPDF}
        >
          📥 Download Full PDF
        </button>
      </div>

      {/* SEARCH */}
      <div className="search-card">

        <input
          type="text"
          placeholder="Search Product..."
          className="customer-input"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />
      </div>

      {/* FORM */}
      <div className="customer-card">

        <h2 className="card-title">
          Add New Stock
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <input
              placeholder="Product Name *"
              className="customer-input"
              value={form.product_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  product_name:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="SKU"
              className="customer-input"
              value={form.sku}
              onChange={(e) =>
                setForm({
                  ...form,
                  sku:
                    e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Quantity *"
              className="customer-input"
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity:
                    e.target.value,
                })
              }
            />

            <input
              type="number"
              placeholder="Price *"
              className="customer-input"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price:
                    e.target.value,
                })
              }
            />

            <select
              className="customer-input"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status:
                    e.target.value,
                })
              }
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <input
              placeholder="Description"
              className="customer-input"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />
          </div>

          <button
            type="submit"
            className="btn-add"
          >
            + Add Stock
          </button>

        </form>
      </div>

      {/* TABLE */}
      <div className="table-card">

        {loading ? (

          <p className="loading">
            Loading stock...
          </p>

        ) : (

          <>
            <div className="table-responsive">

              <table>

                <thead>

                  <tr>
                    <th>S.No</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>

                </thead>

                <tbody>

                  {stockItems.length > 0 ? (

                    stockItems
                      .slice(
                        0,
                        visibleItems
                      )
                      .map(
                        (
                          item,
                          index
                        ) => (

                          <tr
                            key={item.id}
                          >

                            <td>
                              {index + 1}
                            </td>

                            <td>

                              <strong>
                                {
                                  item.product_name
                                }
                              </strong>

                            </td>

                            <td>
                              {item.sku ||
                                "-"}
                            </td>

                            {/* QUANTITY */}
                            <td>

                              <input
                                type="number"
                                className="table-input"
                                value={
                                  item.quantity
                                }
                                onChange={(e) =>
                                  handleInlineChange(
                                    item.id,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />

                            </td>

                            {/* PRICE */}
                            <td>

                              <input
                                type="number"
                                className="table-input"
                                value={
                                  item.price
                                }
                                onChange={(e) =>
                                  handleInlineChange(
                                    item.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                              />

                            </td>

                            {/* STATUS */}
                            <td>

                              <select
                                className="table-select"
                                value={
                                  item.status
                                }
                                onChange={(e) =>
                                  handleInlineChange(
                                    item.id,
                                    "status",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="active">
                                  Active
                                </option>

                                <option value="inactive">
                                  Inactive
                                </option>
                              </select>

                            </td>

                            {/* ACTION */}
                            <td>

                              <div className="action-buttons">

                                <button
                                  className="btn-update"
                                  onClick={() =>
                                    handleUpdate(
                                      item
                                    )
                                  }
                                >
                                  Update
                                </button>

                                <button
                                  className="btn-delete"
                                  onClick={() =>
                                    handleDelete(
                                      item.id
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="no-data"
                      >
                        No stock found
                      </td>

                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* VIEW MORE */}
            {stockItems.length >
              visibleItems && (

              <div className="load-more">

                <button
                  className="btn-view-more"
                  onClick={() =>
                    setVisibleItems(
                      (prev) =>
                        prev + 50
                    )
                  }
                >
                  View More
                </button>

              </div>
            )}
          </>
        )}
      </div>

      {/* POPUP */}
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