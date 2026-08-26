import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function Admin() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [processingProduct, setProcessingProduct] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image_url: "",
    featured: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    loadOrders();
    loadProducts();
    loadCustomers();
  }, []);

  /* =========================
     LOAD ORDERS
  ========================= */

  async function loadOrders() {
    setLoading(true);

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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders error:", error);
      setMessage(error.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  /* =========================
     LOAD PRODUCTS
  ========================= */

  async function loadProducts() {
    setProductsLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products error:", error);
      setMessage(`Products could not be loaded: ${error.message}`);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  }

  /* =========================
     LOAD CUSTOMERS
  ========================= */

  async function loadCustomers() {
    setCustomersLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        "user_id, customer_name, customer_phone, delivery_city, delivery_state, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Customers error:", error);
      setMessage(error.message);
      setCustomers([]);
      setCustomersLoading(false);
      return;
    }

    const uniqueCustomers = [];

    for (const customer of data || []) {
      const exists = uniqueCustomers.some(
        (item) => item.user_id === customer.user_id
      );

      if (!exists) {
        uniqueCustomers.push(customer);
      }
    }

    setCustomers(uniqueCustomers);
    setCustomersLoading(false);
  }

  /* =========================
     NAVIGATION
  ========================= */

  function openDashboard() {
    setActiveSection("dashboard");
  }

  function openProducts() {
    setActiveSection("products");
    loadProducts();
  }

  function openOrders() {
    setActiveSection("orders");
    loadOrders();
  }

  function openCustomers() {
    setActiveSection("customers");
    loadCustomers();
  }

  /* =========================
     PRODUCT FORM
  ========================= */

  function resetProductForm() {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image_url: "",
      featured: false,
    });

    setImageFile(null);
    setImagePreview("");
  }

  function openAddProduct() {
    setEditingProduct(null);
    resetProductForm();
    setMessage("");
    setProductModal(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);

    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "",
      stock: product.stock ?? "",
      image_url: product.image_url || "",
      featured: Boolean(product.featured),
    });

    setImageFile(null);
    setImagePreview(product.image_url || "");
    setMessage("");
    setProductModal(true);
  }

  function closeProductModal() {
    if (savingProduct || processingProduct) return;

    setProductModal(false);
    setEditingProduct(null);
    resetProductForm();
  }

  /* =========================
     IMAGE PROCESSING
     NO SUPABASE STORAGE
  ========================= */

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const maxSize = 1000;

          let width = img.width;
          let height = img.height;

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round(
                (height * maxSize) / width
              );
              width = maxSize;
            } else {
              width = Math.round(
                (width * maxSize) / height
              );
              height = maxSize;
            }
          }

          const canvas = document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          context.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          const compressed = canvas.toDataURL(
            "image/jpeg",
            0.78
          );

          resolve(compressed);
        };

        img.onerror = () => {
          reject(
            new Error("Unable to process this image.")
          );
        };

        img.src = reader.result;
      };

      reader.onerror = () => {
        reject(
          new Error("Unable to read this image.")
        );
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage(
        "Image is too large. Please choose an image below 10MB."
      );
      return;
    }

    setMessage("");
    setProcessingProduct(true);

    try {
      const compressedImage =
        await compressImage(file);

      if (!compressedImage) {
        throw new Error(
          "Image could not be processed."
        );
      }

      setImageFile(file);
      setImagePreview(compressedImage);

      setProductForm((current) => ({
        ...current,
        image_url: compressedImage,
      }));
    } catch (error) {
      console.error("Image error:", error);
      setMessage(
        error?.message ||
          "Unable to process product image."
      );
    } finally {
      setProcessingProduct(false);
    }
  }

  /* =========================
     SAVE PRODUCT
  ========================= */

  async function saveProduct(event) {
    event.preventDefault();

    if (savingProduct || processingProduct) return;

    setSavingProduct(true);
    setMessage("");

    try {
      const name = productForm.name.trim();
      const description =
        productForm.description.trim();
      const category =
        productForm.category.trim();

      const price = Number(productForm.price);
      const stock = Number(productForm.stock);

      if (!name) {
        throw new Error(
          "Please enter a product name."
        );
      }

      if (!category) {
        throw new Error(
          "Please enter a category."
        );
      }

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(
          "Please enter a valid price."
        );
      }

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        throw new Error(
          "Please enter a valid stock quantity."
        );
      }

      const productData = {
        name,
        description,
        price,
        category,
        stock,
        image_url:
          productForm.image_url || null,
        featured: Boolean(
          productForm.featured
        ),
      };

      /* =========================
         UPDATE EXISTING PRODUCT
      ========================= */

      if (editingProduct) {
        const { data, error } =
          await supabase
            .from("products")
            .update(productData)
            .eq("id", editingProduct.id)
            .select("*");

        if (error) {
          throw new Error(
            `Product could not be updated: ${error.message}`
          );
        }

        if (!data || data.length === 0) {
          throw new Error(
            "Product was not updated. Supabase did not return the updated product."
          );
        }

        const updatedProduct = data[0];

        setProducts((current) =>
          current.map((product) =>
            product.id === editingProduct.id
              ? updatedProduct
              : product
          )
        );

        setMessage(
          "Product updated successfully."
        );
      }

      /* =========================
         ADD NEW PRODUCT
      ========================= */

      else {
        const { data, error } =
          await supabase
            .from("products")
            .insert(productData)
            .select("*");

        if (error) {
          throw new Error(
            `Product could not be added: ${error.message}`
          );
        }

        if (!data || data.length === 0) {
          throw new Error(
            "Product was not added. Supabase did not return the new product."
          );
        }

        const newProduct = data[0];

        setProducts((current) => [
          newProduct,
          ...current,
        ]);

        setMessage(
          "Product added successfully."
        );
      }

      setProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      setActiveSection("products");

      /*
       * Final database refresh.
       * This makes sure the screen matches Supabase.
       */
      await loadProducts();
    } catch (error) {
      console.error("Save product error:", error);

      setMessage(
        error?.message ||
          "Unable to save product."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  /* =========================
     DELETE PRODUCT
  ========================= */

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setProcessingProduct(true);
    setMessage("");

    try {
      /*
       * Delete the product and ask Supabase
       * to return the deleted row.
       */
      const { data, error } =
        await supabase
          .from("products")
          .delete()
          .eq("id", product.id)
          .select("id");

      if (error) {
        throw new Error(
          `Product could not be deleted: ${error.message}`
        );
      }

      /*
       * If RLS blocks the delete, Supabase
       * normally returns zero rows.
       */
      if (!data || data.length === 0) {
        throw new Error(
          "Product could not be deleted. Supabase did not delete the selected product."
        );
      }

      /*
       * Remove it immediately from the screen.
       */
      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id
        )
      );

      setMessage(
        `"${product.name}" deleted successfully.`
      );

      /*
       * Confirm the database state.
       */
      await loadProducts();
    } catch (error) {
      console.error("Delete product error:", error);

      setMessage(
        error?.message ||
          "Product could not be deleted."
      );
    } finally {
      setProcessingProduct(false);
    }
  }

  /* =========================
     UPDATE ORDER STATUS
  ========================= */

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
          ? { ...order, status }
          : order
      )
    );
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  /* =========================
     DASHBOARD DATA
  ========================= */

  const totalRevenue = orders
    .filter(
      (order) =>
        order.status !== "cancelled"
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "delivered"
  ).length;

  const lowStockProducts =
    products.filter((product) => {
      const stock = Number(
        product.stock || 0
      );

      return stock > 0 && stock <= 5;
    }).length;

  const featuredProducts =
    products.filter(
      (product) => product.featured
    ).length;

  return (
    <div className="admin-page">
      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "SF Pro Display",
            "Segoe UI",
            sans-serif;
          background: #f5f5f7;
          color: #111;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .admin-page {
          min-height: 100vh;
          padding: 30px 18px 70px;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(124,58,237,.10),
              transparent 30%
            ),
            #f5f5f7;
        }

        .admin-container {
          max-width: 1250px;
          margin: auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .admin-eyebrow {
          margin: 0 0 7px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          opacity: .5;
        }

        .admin-header h1 {
          margin: 0;
          font-size: clamp(34px,6vw,58px);
          letter-spacing: -3px;
        }

        .admin-header p {
          opacity: .6;
        }

        .admin-refresh,
        .secondary-button {
          border: 1px solid rgba(0,0,0,.1);
          background: white;
          color: #111;
          border-radius: 13px;
          padding: 12px 16px;
          font-weight: 700;
        }

        .admin-nav {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding: 7px;
          background: rgba(255,255,255,.8);
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 18px;
          margin-bottom: 20px;
        }

        .admin-nav button {
          border: 0;
          background: transparent;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
        }

        .admin-nav-active {
          background: #111 !important;
          color: white;
        }

        .admin-message {
          padding: 14px 16px;
          background: rgba(124,58,237,.09);
          border-radius: 14px;
          margin-bottom: 20px;
          font-size: 14px;
          word-break: break-word;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 14px;
          margin-bottom: 25px;
        }

        .admin-stat {
          background: white;
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 10px 30px rgba(0,0,0,.04);
        }

        .admin-stat span {
          display: block;
          font-size: 12px;
          opacity: .55;
          margin-bottom: 8px;
        }

        .admin-stat strong {
          font-size: 25px;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 18px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 28px;
        }

        .primary-button {
          border: 0;
          background: #111;
          color: white;
          padding: 13px 17px;
          border-radius: 13px;
          font-weight: 700;
        }

        .danger-button {
          border: 1px solid rgba(220,38,38,.15);
          background: rgba(220,38,38,.06);
          color: #b91c1c;
          padding: 10px 13px;
          border-radius: 11px;
          font-weight: 700;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 16px;
        }

        .admin-product-card {
          background: white;
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,.04);
        }

        .admin-product-image {
          height: 220px;
          background: #f0f0f2;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .admin-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-product-content {
          padding: 17px;
        }

        .admin-product-category {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 800;
          opacity: .45;
        }

        .admin-product-content h3 {
          margin: 6px 0;
          font-size: 17px;
        }

        .admin-product-price {
          font-size: 19px;
          font-weight: 800;
          margin: 12px 0 5px;
        }

        .stock-good {
          color: #15803d;
        }

        .stock-low {
          color: #ca8a04;
        }

        .stock-out {
          color: #dc2626;
        }

        .product-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }

        .featured-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(124,58,237,.1);
          color: #6d28d9;
          font-size: 10px;
          font-weight: 800;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 16px;
        }

        .order-card {
          background: white;
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 22px;
          padding: 20px;
        }

        .order-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(0,0,0,.07);
        }

        .order-number {
          font-weight: 900;
        }

        .order-date {
          font-size: 12px;
          opacity: .5;
        }

        .order-status {
          border: 1px solid rgba(0,0,0,.1);
          border-radius: 999px;
          padding: 8px 10px;
          background: white;
          font-weight: 700;
          font-size: 12px;
        }

        .order-customer,
        .order-products {
          padding: 16px 0;
          border-bottom: 1px solid rgba(0,0,0,.07);
        }

        .order-customer h3,
        .order-products h3 {
          margin: 0 0 10px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: .5;
        }

        .order-customer p {
          margin: 6px 0;
          font-size: 14px;
        }

        .order-product {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .order-product-image {
          width: 55px;
          height: 55px;
          border-radius: 10px;
          overflow: hidden;
          background: #f1f1f1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .order-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .order-product p {
          margin: 4px 0 0;
          font-size: 12px;
          opacity: .55;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          font-size: 18px;
        }

        .customers-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 15px;
        }

        .customer-card {
          display: flex;
          gap: 14px;
          background: white;
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 20px;
          padding: 18px;
        }

        .customer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #f0f0f2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .customer-card h3 {
          margin: 0 0 8px;
        }

        .customer-card p {
          margin: 5px 0;
          font-size: 13px;
          opacity: .7;
        }

        .customer-card small {
          display: block;
          margin-top: 10px;
          opacity: .45;
        }

        .admin-empty {
          text-align: center;
          padding: 70px 20px;
          background: white;
          border-radius: 22px;
          border: 1px solid rgba(0,0,0,.06);
        }

        .admin-empty > div {
          font-size: 55px;
        }

        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(0,0,0,.6);
          backdrop-filter: blur(8px);
        }

        .admin-modal {
          width: min(620px,100%);
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 25px;
          padding: 27px;
          position: relative;
          box-shadow: 0 30px 100px rgba(0,0,0,.3);
        }

        .admin-modal-close {
          position: absolute;
          top: 17px;
          right: 17px;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #f1f1f1;
          font-size: 22px;
        }

        .admin-form {
          display: grid;
          gap: 13px;
        }

        .admin-form label {
          font-size: 12px;
          font-weight: 800;
          opacity: .6;
          margin-bottom: -7px;
        }

        .admin-form input,
        .admin-form textarea {
          width: 100%;
          border: 1px solid rgba(0,0,0,.12);
          background: #fafafa;
          border-radius: 12px;
          padding: 13px 14px;
          outline: none;
        }

        .admin-form textarea {
          min-height: 100px;
          resize: vertical;
        }

        .admin-form input:focus,
        .admin-form textarea:focus {
          border-color: #111;
          background: white;
        }

        .image-upload-box {
          border: 2px dashed rgba(0,0,0,.15);
          border-radius: 16px;
          padding: 18px;
          background: #fafafa;
        }

        .image-preview {
          width: 100%;
          height: 220px;
          border-radius: 14px;
          overflow: hidden;
          background: #eee;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .image-upload-label {
          display: block;
          text-align: center;
          padding: 13px;
          background: #111;
          color: white;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .image-upload-input {
          display: none;
        }

        .featured-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f7f7f8;
          border-radius: 12px;
        }

        .featured-toggle input {
          width: auto;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 8px;
        }

        .uploading-text {
          text-align: center;
          font-size: 13px;
          opacity: .6;
          margin-top: 8px;
        }

        @media (max-width:1000px) {
          .products-grid {
            grid-template-columns: repeat(3,minmax(0,1fr));
          }

          .customers-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width:760px) {
          .admin-page {
            padding: 20px 12px 50px;
          }

          .admin-header {
            align-items: flex-start;
          }

          .admin-stats {
            grid-template-columns: repeat(2,1fr);
          }

          .products-grid,
          .orders-grid,
          .customers-grid {
            grid-template-columns: 1fr;
          }

          .admin-nav {
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .admin-nav button {
            white-space: nowrap;
          }

          .section-heading {
            align-items: flex-start;
          }

          .admin-product-image {
            height: 250px;
          }
        }

        @media (max-width:450px) {
          .admin-header {
            flex-direction: column;
          }

          .admin-refresh {
            width: 100%;
          }

          .admin-modal {
            padding: 22px 16px;
          }
        }

      `}</style>

      <div className="admin-container">

        {/* HEADER */}

        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">
              SHINDARA PHONEFLAIR
            </p>

            <h1>Control Center</h1>

            <p>
              Manage your store from one place.
            </p>
          </div>

          <button
            className="admin-refresh"
            onClick={() => {
              loadOrders();
              loadProducts();
              loadCustomers();
            }}
          >
            ↻ Refresh
          </button>
        </header>

        {/* NAVIGATION */}

        <nav className="admin-nav">

          <button
            className={
              activeSection === "dashboard"
                ? "admin-nav-active"
                : ""
            }
            onClick={openDashboard}
          >
            📊 Dashboard
          </button>

          <button
            className={
              activeSection === "products"
                ? "admin-nav-active"
                : ""
            }
            onClick={openProducts}
          >
            📦 Products
          </button>

          <button
            className={
              activeSection === "orders"
                ? "admin-nav-active"
                : ""
            }
            onClick={openOrders}
          >
            🛒 Orders
          </button>

          <button
            className={
              activeSection === "customers"
                ? "admin-nav-active"
                : ""
            }
            onClick={openCustomers}
          >
            👥 Customers
          </button>

        </nav>

        {/* MESSAGE */}

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {/* =========================
            DASHBOARD
        ========================= */}

        {activeSection === "dashboard" && (
          <>
            <div className="admin-stats">

              <div className="admin-stat">
                <span>Total products</span>
                <strong>
                  {products.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Total orders</span>
                <strong>
                  {orders.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Customers</span>
                <strong>
                  {customers.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Revenue</span>
                <strong>
                  {money(totalRevenue)}
                </strong>
              </div>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>Pending orders</span>
                <strong>
                  {pendingOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Delivered orders</span>
                <strong>
                  {deliveredOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Low stock</span>
                <strong>
                  {lowStockProducts}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Featured products</span>
                <strong>
                  {featuredProducts}
                </strong>
              </div>

            </div>

            <div className="admin-empty">

              <div>🚀</div>

              <h2>
                Your store is ready to grow.
              </h2>

              <p>
                Add products, manage orders and
                keep track of your customers here.
              </p>

              <button
                className="primary-button"
                onClick={openAddProduct}
              >
                + Add product
              </button>

            </div>
          </>
        )}

        {/* =========================
            PRODUCTS
        ========================= */}

        {activeSection === "products" && (
          <>
            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  STORE INVENTORY
                </p>

                <h2>Products</h2>
              </div>

              <button
                className="primary-button"
                onClick={openAddProduct}
              >
                + Add product
              </button>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>All products</span>
                <strong>
                  {products.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>In stock</span>
                <strong>
                  {
                    products.filter(
                      (p) =>
                        Number(p.stock || 0) > 0
                    ).length
                  }
                </strong>
              </div>

              <div className="admin-stat">
                <span>Out of stock</span>
                <strong>
                  {
                    products.filter(
                      (p) =>
                        Number(p.stock || 0) <= 0
                    ).length
                  }
                </strong>
              </div>

              <div className="admin-stat">
                <span>Low stock</span>
                <strong>
                  {lowStockProducts}
                </strong>
              </div>

            </div>

            {productsLoading ? (
              <div className="admin-empty">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="admin-empty">

                <div>📦</div>

                <h2>
                  No products yet
                </h2>

                <p>
                  Add your first product.
                </p>

                <button
                  className="primary-button"
                  onClick={openAddProduct}
                >
                  + Add product
                </button>

              </div>
            ) : (
              <div className="products-grid">

                {products.map((product) => {

                  const stock = Number(
                    product.stock || 0
                  );

                  return (
                    <article
                      className="admin-product-card"
                      key={product.id}
                    >

                      <div className="admin-product-image">

                        {product.image_url ? (
                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.name
                            }
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 55
                            }}
                          >
                            📦
                          </span>
                        )}

                      </div>

                      <div className="admin-product-content">

                        <span className="admin-product-category">
                          {product.category ||
                            "Electronics"}
                        </span>

                        <h3>
                          {product.name}
                        </h3>

                        <div className="admin-product-price">
                          {money(
                            product.price
                          )}
                        </div>

                        <div
                          className={
                            stock <= 0
                              ? "stock-out"
                              : stock <= 5
                              ? "stock-low"
                              : "stock-good"
                          }
                        >
                          {stock <= 0
                            ? "Out of stock"
                            : `${stock} in stock`}
                        </div>

                        {product.featured && (
                          <span className="featured-badge">
                            ⭐ Featured
                          </span>
                        )}

                        <div className="product-actions">

                          <button
                            className="secondary-button"
                            onClick={() =>
                              openEditProduct(
                                product
                              )
                            }
                            disabled={
                              processingProduct
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="danger-button"
                            onClick={() =>
                              deleteProduct(
                                product
                              )
                            }
                            disabled={
                              processingProduct
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}
          </>
        )}

        {/* =========================
            ORDERS
        ========================= */}

        {activeSection === "orders" && (
          <>
            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  STORE ORDERS
                </p>

                <h2>Orders</h2>
              </div>

              <button
                className="secondary-button"
                onClick={loadOrders}
              >
                ↻ Refresh orders
              </button>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>Total orders</span>
                <strong>
                  {orders.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Pending</span>
                <strong>
                  {pendingOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Delivered</span>
                <strong>
                  {deliveredOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Revenue</span>
                <strong>
                  {money(totalRevenue)}
                </strong>
              </div>

            </div>

            {loading ? (
              <div className="admin-empty">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="admin-empty">

                <div>📦</div>

                <h2>
                  No orders yet
                </h2>

                <p>
                  New customer orders will
                  appear here.
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
                          {String(order.id)
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
                            event.target.value
                          )
                        }
                        className="order-status"
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

                ))}

              </div>
            )}
          </>
        )}

        {/* =========================
            CUSTOMERS
        ========================= */}

        {activeSection === "customers" && (
          <>
            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  CUSTOMER DIRECTORY
                </p>

                <h2>
                  Customers
                </h2>
              </div>

              <button
                className="secondary-button"
                onClick={loadCustomers}
              >
                ↻ Refresh customers
              </button>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>
                  Customers
                </span>

                <strong>
                  {customers.length}
                </strong>
              </div>

            </div>

            {customersLoading ? (
              <div className="admin-empty">
                Loading customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="admin-empty">

                <div>👥</div>

                <h2>
                  No customers yet
                </h2>

                <p>
                  Customers who place
                  orders will appear here.
                </p>

              </div>
            ) : (
              <div className="customers-grid">

                {customers.map(
                  (customer) => (

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

      {/* =========================
          PRODUCT MODAL
      ========================= */}

      {productModal && (

        <div
          className="admin-modal-backdrop"
          onClick={closeProductModal}
        >

          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="admin-modal-close"
              onClick={closeProductModal}
              disabled={
                savingProduct ||
                processingProduct
              }
            >
              ×
            </button>

            <p className="admin-eyebrow">
              {editingProduct
                ? "EDIT PRODUCT"
                : "NEW PRODUCT"}
            </p>

            <h2>
              {editingProduct
                ? "Edit product"
                : "Add product"}
            </h2>

            <p style={{ opacity: .6 }}>
              Add the product details below.
            </p>

            <form
              className="admin-form"
              onSubmit={saveProduct}
            >

              <label>
                Product name
              </label>

              <input
                type="text"
                placeholder="e.g. iPhone 15 Case"
                value={
                  productForm.name
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    name:
                      event.target.value,
                  })
                }
                required
              />

              <label>
                Description
              </label>

              <textarea
                placeholder="Describe the product..."
                value={
                  productForm.description
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    description:
                      event.target.value,
                  })
                }
              />

              <label>
                Price (₦)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="50000"
                value={
                  productForm.price
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    price:
                      event.target.value,
                  })
                }
                required
              />

              <label>
                Category
              </label>

              <input
                type="text"
                placeholder="Phones, Chargers, Cases..."
                value={
                  productForm.category
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    category:
                      event.target.value,
                  })
                }
                required
              />

              <label>
                Stock quantity
              </label>

              <input
                type="number"
                min="0"
                step="1"
                placeholder="10"
                value={
                  productForm.stock
                }
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    stock:
                      event.target.value,
                  })
                }
                required
              />

              <label>
                Product image
              </label>

              <div className="image-upload-box">

                {imagePreview ? (

                  <div className="image-preview">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                    />
                  </div>

                ) : (

                  <div className="image-preview">
                    <span
                      style={{
                        fontSize: 50
                      }}
                    >
                      📷
                    </span>
                  </div>

                )}

                <label
                  className="image-upload-label"
                  htmlFor="product-image"
                >
                  📷 Choose product image
                </label>

                <input
                  id="product-image"
                  className="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                />

                {processingProduct && (
                  <p className="uploading-text">
                    Processing image...
                  </p>
                )}

              </div>

              <div className="featured-toggle">

                <input
                  id="featured"
                  type="checkbox"
                  checked={
                    productForm.featured
                  }
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      featured:
                        event.target.checked,
                    })
                  }
                />

                <label
                  htmlFor="featured"
                  style={{
                    margin: 0,
                    opacity: 1
                  }}
                >
                  ⭐ Featured product
                </label>

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeProductModal
                  }
                  disabled={
                    savingProduct ||
                    processingProduct
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    savingProduct ||
                    processingProduct
                  }
                >
                  {processingProduct
                    ? "Processing image..."
                    : savingProduct
                    ? "Saving..."
                    : editingProduct
                    ? "Save changes"
                    : "Add product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Admin;