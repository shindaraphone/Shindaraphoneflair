import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders"
        },
        () => {
          loadOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      console.error(error);
      setMessage(
        error.message ||
          "Unable to load orders."
      );
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
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
    return new Date(date).toLocaleString(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      <div className="admin-container">

        <header className="admin-header">

          <div>
            <p className="admin-eyebrow">
              SHINDARA PHONEFLAIR
            </p>

            <h1>
              Orders
            </h1>

            <p>
              Manage customer orders
              and delivery status.
            </p>
          </div>

          <button
            className="admin-refresh"
            onClick={loadOrders}
          >
            ↻ Refresh
          </button>

        </header>

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

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
              Delivered
            </span>

            <strong>
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    "delivered"
                ).length
              }
            </strong>
          </div>

        </div>

        {orders.length === 0 ? (

          <div className="admin-empty">

            <div>
              📦
            </div>

            <h2>
              No orders yet
            </h2>

            <p>
              New customer orders
              will appear here.
            </p>

          </div>

        ) : (

          <div className="orders-grid">

            {orders.map((order) => (

              <article
                className="order-card"
                key={order.id}
              >

                <div className="order-top">

                  <div>

                    <span className="order-number">
                      #
                      {order.id
                        .slice(0, 8)
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
                    onChange={(event) =>
                      updateStatus(
                        order.id,
                        event.target
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
                    {order.customer_name}
                  </p>

                  <p>
                    📱{" "}
                    {order.customer_phone}
                  </p>

                  <p>
                    📍{" "}
                    {order.delivery_address}
                  </p>

                  <p>
                    {order.delivery_city}
                    {order.delivery_city &&
                    order.delivery_state
                      ? ", "
                      : ""}
                    {order.delivery_state}
                  </p>

                </div>

                <div className="order-products">

                  <h3>
                    Products
                  </h3>

                  {order.order_items?.map(
                    (item) => (

                      <div
                        className="order-product"
                        key={item.id}
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
                            {item.quantity}
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

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Admin;
