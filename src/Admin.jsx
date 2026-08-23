import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function Admin() {
  const [activeSection, setActiveSection] =
    useState("orders");

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);
  const [customersLoading, setCustomersLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          product_name,
          price,
          quantity,
          image_url
        )
      `)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      setMessage(error.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  async function loadCustomers() {
    setCustomersLoading(true);
    setMessage("");

    /*
      Supabase does not allow the browser
      to directly read auth.users.

      We therefore load customer information
      from orders, which safely gives us the
      customers who have actually placed orders.
    */

    const { data, error } = await supabase
      .from("orders")
      .select(
        "user_id, customer_name, customer_phone, delivery_city, delivery_state, created_at"
      )
      .order("created_at", {
        ascending: false
      });

    if (error) {
      setMessage(error.message);
      setCustomers([]);
      setCustomersLoading(false);
      return;
    }

    const uniqueCustomers = [];

    for (const customer of data || []) {
      const exists =
        uniqueCustomers.some(
          (item) =>
            item.user_id ===
            customer.user_id
        );

      if (!exists) {
        uniqueCustomers.push(
          customer
        );
      }
    }

    setCustomers(
      uniqueCustomers
    );

    setCustomersLoading(false);
  }

  function openCustomers() {
    setActiveSection(
      "customers"
    );
    loadCustomers();
  }

  function openOrders() {
    setActiveSection("orders");
    loadOrders();
  }

  async function updateStatus(
    orderId,
    status
  ) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      alert(error.message);
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status
            }
          : order
      )
    );
  }

  function formatDate(date) {
    return new Date(
      date
    ).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  const totalRevenue =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total || 0
        ),
      0
    );

  return (
    <div className="admin-page">

      <div className="admin-container">

        <header className="admin-header">

          <div>

            <p className="admin-eyebrow">
              SHINDARA PHONEFLAIR
            </p>

            <h1>
              Control Center
            </h1>

            <p>
              Manage your store
              from one place.
            </p>

          </div>

          <button
            className="admin-refresh"
            onClick={
              activeSection ===
              "orders"
                ? loadOrders
                : loadCustomers
            }
          >
            ↻ Refresh
          </button>

        </header>

        <nav className="admin-nav">

          <button
            className={
              activeSection ===
              "orders"
                ? "admin-nav-active"
                : ""
            }
            onClick={
              openOrders
            }
          >
            🛒 Orders
          </button>

          <button
            className={
              activeSection ===
              "customers"
                ? "admin-nav-active"
                : ""
            }
            onClick={
              openCustomers
            }
          >
            👥 Customers
          </button>

        </nav>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {activeSection ===
        "orders" ? (

          <>
            <div className="admin-stats">

              <div className="admin-stat">
                <span>
                  Total orders
                </span>

                <strong>
                  {orders.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  Pending
                </span>

                <strong>
                  {
                    orders.filter(
                      (order) =>
                        order.status ===
                        "pending"
                    ).length
                  }
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  Revenue
                </span>

                <strong>
                  {money(
                    totalRevenue
                  )}
                </strong>
              </div>

            </div>

            {loading ? (

              <div className="admin-empty">
                Loading orders...
              </div>

            ) : orders.length ===
              0 ? (

              <div className="admin-empty">

                <div>
                  📦
                </div>

                <h2>
                  No orders yet
                </h2>

                <p>
                  New customer
                  orders will
                  appear here.
                </p>

              </div>

            ) : (

              <div className="orders-grid">

                {orders.map(
                  (order) => (

                    <article
                      className="order-card"
                      key={
                        order.id
                      }
                    >

                      <div className="order-top">

                        <div>

                          <span className="order-number">
                            #
                            {order.id
                              .slice(
                                0,
                                8
                              )
                              .toUpperCase()}
                          </span>

                          <p className="order-date">
                            {formatDate(
                              order.created_at
                            )}
                          </p>

                        </div>

                        <select
                          value={
                            order.status ||
                            "pending"
                          }
                          onChange={(
                            event
                          ) =>
                            updateStatus(
                              order.id,
                              event
                                .target
                                .value
                            )
                          }
                          className={`order-status status-${order.status}`}
                        >

                          <option value="pending">
                            Pending
                          </option>

                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>

                        </select>

                      </div>

                      <div className="order-customer">

                        <h3>
                          Customer
                        </h3>

                        <p>
                          👤{" "}
                          {
                            order.customer_name
                          }
                        </p>

                        <p>
                          📱{" "}
                          {
                            order.customer_phone
                          }
                        </p>

                        <p>
                          📍{" "}
                          {
                            order.delivery_address
                          }
                        </p>

                        <p>
                          {
                            order.delivery_city
                          }

                          {order.delivery_city &&
                          order.delivery_state
                            ? ", "
                            : ""}

                          {
                            order.delivery_state
                          }
                        </p>

                      </div>

                      <div className="order-products">

                        <h3>
                          Products
                        </h3>

                        {order.order_items?.map(
                          (
                            item
                          ) => (

                            <div
                              className="order-product"
                              key={
                                item.id
                              }
                            >

                              <div className="order-product-image">

                                {item.image_url ? (

                                  <img
                                    src={
                                      item.image_url
                                    }
                                    alt={
                                      item.product_name
                                    }
                                  />

                                ) : (

                                  <span>
                                    📦
                                  </span>

                                )}

                              </div>

                              <div>

                                <strong>
                                  {
                                    item.product_name
                                  }
                                </strong>

                                <p>
                                  {
                                    item.quantity
                                  }
                                  {" × "}
                                  {money(
                                    item.price
                                  )}
                                </p>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                      <div className="order-total">

                        <span>
                          Total
                        </span>

                        <strong>
                          {money(
                            order.total
                          )}
                        </strong>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </>

        ) : (

          <>
            <div className="admin-stats">

              <div className="admin-stat">

                <span>
                  Customers
                </span>

                <strong>
                  {
                    customers.length
                  }
                </strong>

              </div>

            </div>

            {customersLoading ? (

              <div className="admin-empty">
                Loading customers...
              </div>

            ) : customers.length ===
              0 ? (

              <div className="admin-empty">

                <div>
                  👥
                </div>

                <h2>
                  No customers yet
                </h2>

                <p>
                  Customers who place
                  orders will appear
                  here.
                </p>

              </div>

            ) : (

              <div className="customers-grid">

                {customers.map(
                  (
                    customer
                  ) => (

                    <article
                      className="customer-card"
                      key={
                        customer.user_id
                      }
                    >

                      <div className="customer-avatar">
                        👤
                      </div>

                      <div>

                        <h3>
                          {
                            customer.customer_name
                          }
                        </h3>

                        <p>
                          📱{" "}
                          {
                            customer.customer_phone
                          }
                        </p>

                        <p>
                          📍{" "}
                          {
                            customer.delivery_city
                          }

                          {customer.delivery_city &&
                          customer.delivery_state
                            ? ", "
                            : ""}

                          {
                            customer.delivery_state
                          }
                        </p>

                        <small>
                          Last order:{" "}
                          {formatDate(
                            customer.created_at
                          )}
                        </small>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </>

        )}

      </div>

    </div>
  );
}

export default Admin;
