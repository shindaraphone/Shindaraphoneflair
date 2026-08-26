import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function Admin() {
  /* =========================================================
     AUTH
  ========================================================= */

  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  /* =========================================================
     DASHBOARD
  ========================================================= */

  const [activeSection, setActiveSection] = useState("dashboard");

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [message, setMessage] = useState("");

  /* =========================================================
     PRODUCT
  ========================================================= */

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

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = [
    "Phones",
    "Phone Cases",
    "Chargers",
    "Cables",
    "Power Banks",
    "Earphones",
    "Headphones",
    "Smart Watches",
    "Speakers",
    "Screen Protectors",
    "Phone Accessories",
    "Gadgets",
    "Other Electronics",
  ];

  /* =========================================================
     INITIAL AUTH CHECK
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      setAuthLoading(true);

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.log("No active auth session:", error.message);

          if (mounted) {
            setAuthenticated(false);
            setAdminUser(null);
          }

          return;
        }

        if (!user) {
          if (mounted) {
            setAuthenticated(false);
            setAdminUser(null);
          }

          return;
        }

        const isAdmin = await checkAdminProfile(user);

        if (!mounted) return;

        if (isAdmin) {
          setAdminUser(user);
          setAuthenticated(true);
        } else {
          await supabase.auth.signOut();

          setAuthenticated(false);
          setAdminUser(null);
          setAuthMessage(
            "This account does not have administrator access."
          );
        }
      } catch (error) {
        console.error("Auth check error:", error);

        if (mounted) {
          setAuthenticated(false);
          setAdminUser(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT" || !session?.user) {
          setAuthenticated(false);
          setAdminUser(null);
          setAuthLoading(false);
          return;
        }

        const user = session.user;

        const isAdmin = await checkAdminProfile(user);

        if (!mounted) return;

        if (isAdmin) {
          setAdminUser(user);
          setAuthenticated(true);
        } else {
          await supabase.auth.signOut();

          setAuthenticated(false);
          setAdminUser(null);
          setAuthMessage(
            "This account does not have administrator access."
          );
        }

        setAuthLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     CHECK ADMIN PROFILE
  ========================================================= */

  async function checkAdminProfile(user) {
    if (!user?.id) return false;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Admin profile error:", error);
      return false;
    }

    return Boolean(data?.is_admin);
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  async function handleAdminLogin(event) {
    event.preventDefault();

    if (loginLoading) return;

    setLoginLoading(true);
    setAuthMessage("");

    const email = loginEmail.trim();
    const password = loginPassword;

    if (!email || !password) {
      setAuthMessage(
        "Please enter your admin email and password."
      );
      setLoginLoading(false);
      return;
    }

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.user) {
        throw new Error(
          "Login was unsuccessful. No user session was returned."
        );
      }

      const isAdmin = await checkAdminProfile(
        data.user
      );

      if (!isAdmin) {
        await supabase.auth.signOut();

        throw new Error(
          "Login successful, but this account is not an admin. Set is_admin to true for this account in the profiles table."
        );
      }

      setAdminUser(data.user);
      setAuthenticated(true);
      setLoginPassword("");
      setAuthMessage("");
      setActiveSection("dashboard");

      await loadEverything();
    } catch (error) {
      console.error("Admin login error:", error);

      setAuthMessage(
        error?.message ||
          "Unable to sign in. Please check your details."
      );

      setAuthenticated(false);
      setAdminUser(null);
    } finally {
      setLoginLoading(false);
    }
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  async function handleLogout() {
    const confirmed = window.confirm(
      "Log out of the admin dashboard?"
    );

    if (!confirmed) return;

    await supabase.auth.signOut();

    setAuthenticated(false);
    setAdminUser(null);
    setOrders([]);
    setProducts([]);
    setCustomers([]);
    setActiveSection("dashboard");
    setMessage("");
    setAuthMessage("");
  }

  /* =========================================================
     LOAD EVERYTHING
  ========================================================= */

  async function loadEverything() {
    await Promise.all([
      loadOrders(),
      loadProducts(),
      loadCustomers(),
    ]);
  }

  /* =========================================================
     LOAD ORDERS
  ========================================================= */

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
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Orders error:", error);
      setMessage(
        `Orders could not be loaded: ${error.message}`
      );
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  async function loadProducts() {
    setProductsLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Products error:", error);

      setMessage(
        `Products could not be loaded: ${error.message}`
      );

      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setProductsLoading(false);
  }

  /* =========================================================
     LOAD CUSTOMERS
  ========================================================= */

  async function loadCustomers() {
    setCustomersLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select(
        "user_id, customer_name, customer_phone, delivery_address, delivery_city, delivery_state, created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Customers error:", error);

      setMessage(
        `Customers could not be loaded: ${error.message}`
      );

      setCustomers([]);
      setCustomersLoading(false);
      return;
    }

    const uniqueCustomers = [];

    for (const customer of data || []) {
      const key =
        customer.user_id ||
        customer.customer_phone ||
        customer.customer_name;

      const exists = uniqueCustomers.some(
        (item) =>
          (
            item.user_id ||
            item.customer_phone ||
            item.customer_name
          ) === key
      );

      if (!exists) {
        uniqueCustomers.push(customer);
      }
    }

    setCustomers(uniqueCustomers);
    setCustomersLoading(false);
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

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

  /* =========================================================
     PRODUCT FORM
  ========================================================= */

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
    if (
      savingProduct ||
      processingProduct
    ) {
      return;
    }

    setProductModal(false);
    setEditingProduct(null);
    resetProductForm();
  }

  /* =========================================================
     COMPRESS IMAGE
  ========================================================= */

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
          const maxSize = 1200;

          let width = img.width;
          let height = img.height;

          if (
            width > maxSize ||
            height > maxSize
          ) {
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

          const canvas =
            document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const context =
            canvas.getContext("2d");

          context.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(
                  new Error(
                    "Unable to compress image."
                  )
                );

                return;
              }

              resolve(blob);
            },
            "image/jpeg",
            0.82
          );
        };

        img.onerror = () => {
          reject(
            new Error(
              "Unable to process this image."
            )
          );
        };

        img.src = reader.result;
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read this image."
          )
        );
      };

      reader.readAsDataURL(file);
    });
  }

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  async function uploadProductImage(file) {
    if (!file) return null;

    const compressedBlob =
      await compressImage(file);

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.jpg`;

    const filePath = `products/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("product-images")
        .upload(
          filePath,
          compressedBlob,
          {
            contentType: "image/jpeg",
            upsert: false,
          }
        );

    if (uploadError) {
      throw new Error(
        `Product image upload failed: ${uploadError.message}`
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    if (
      !publicUrlData?.publicUrl
    ) {
      throw new Error(
        "Image uploaded but a public image URL could not be created."
      );
    }

    return publicUrlData.publicUrl;
  }

  /* =========================================================
     IMAGE CHANGE
  ========================================================= */

  async function handleImageChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      setMessage(
        "Please select an image file."
      );

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setMessage(
        "Image is too large. Please choose an image below 10MB."
      );

      return;
    }

    setMessage("");
    setProcessingProduct(true);

    try {
      const previewBlob =
        await compressImage(file);

      const previewUrl =
        URL.createObjectURL(
          previewBlob
        );

      setImageFile(file);
      setImagePreview(previewUrl);
    } catch (error) {
      console.error(
        "Image processing error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to process product image."
      );
    } finally {
      setProcessingProduct(false);
    }
  }

  /* =========================================================
     SAVE PRODUCT
  ========================================================= */

  async function saveProduct(event) {
    event.preventDefault();

    if (
      savingProduct ||
      processingProduct
    ) {
      return;
    }

    setSavingProduct(true);
    setMessage("");

    try {
      /* Make absolutely sure admin is still logged in */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          `Authentication error: ${authError.message}`
        );
      }

      if (!user) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      const isAdmin =
        await checkAdminProfile(user);

      if (!isAdmin) {
        throw new Error(
          "This account no longer has admin permission."
        );
      }

      const name =
        productForm.name.trim();

      const description =
        productForm.description.trim();

      const category =
        productForm.category.trim();

      const price =
        Number(productForm.price);

      const stock =
        Number(productForm.stock);

      if (!name) {
        throw new Error(
          "Please enter a product name."
        );
      }

      if (!category) {
        throw new Error(
          "Please select or enter a category."
        );
      }

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
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

      let imageUrl =
        productForm.image_url ||
        null;

      /* Upload new image if selected */
      if (imageFile) {
        setMessage(
          "Uploading product image..."
        );

        imageUrl =
          await uploadProductImage(
            imageFile
          );
      }

      const productData = {
        name,
        description,
        price,
        category,
        stock,
        image_url: imageUrl,
        featured: Boolean(
          productForm.featured
        ),
      };

      /* =====================================================
         UPDATE
      ===================================================== */

      if (editingProduct) {
        setMessage(
          "Updating product..."
        );

        const {
          data,
          error,
        } = await supabase
          .from("products")
          .update(productData)
          .eq(
            "id",
            editingProduct.id
          )
          .select("*");

        if (error) {
          throw new Error(
            `Product could not be updated: ${error.message}`
          );
        }

        if (
          !data ||
          data.length === 0
        ) {
          throw new Error(
            "Product was not updated. Check your Supabase policies."
          );
        }

        setProducts(
          (current) =>
            current.map(
              (product) =>
                product.id ===
                editingProduct.id
                  ? data[0]
                  : product
            )
        );

        setMessage(
          "Product updated successfully."
        );
      }

      /* =====================================================
         INSERT
      ===================================================== */

      else {
        setMessage(
          "Adding product..."
        );

        const {
          data,
          error,
        } = await supabase
          .from("products")
          .insert(
            productData
          )
          .select("*");

        if (error) {
          throw new Error(
            `Product could not be added: ${error.message}`
          );
        }

        if (
          !data ||
          data.length === 0
        ) {
          throw new Error(
            "Product was not added. Check your Supabase INSERT policy."
          );
        }

        setProducts(
          (current) => [
            data[0],
            ...current,
          ]
        );

        setMessage(
          "Product added successfully."
        );
      }

      setProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      setActiveSection("products");

      await loadProducts();
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      setMessage(
        error?.message ||
          "Unable to save product."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  async function deleteProduct(product) {
    const confirmed =
      window.confirm(
        `Delete "${product.name}"?\n\nThis cannot be undone.`
      );

    if (!confirmed) return;

    setMessage(
      "Checking admin access..."
    );

    try {
      const {
        data: {
          user,
        },
        error: authError,
      } =
        await supabase.auth.getUser();

      if (authError) {
        throw new Error(
          `Authentication error: ${authError.message}`
        );
      }

      if (!user) {
        throw new Error(
          "Your admin session is missing. Please log in again."
        );
      }

      const isAdmin =
        await checkAdminProfile(user);

      if (!isAdmin) {
        throw new Error(
          "This account is not an admin."
        );
      }

      setMessage(
        "Deleting product..."
      );

      const {
        data: deletedProduct,
        error: deleteError,
      } =
        await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            product.id
          )
          .select(
            "id, name"
          );

      if (deleteError) {
        console.error(
          "DELETE ERROR:",
          deleteError
        );

        throw new Error(
          `Product could not be deleted: ${deleteError.message}`
        );
      }

      if (
        !deletedProduct ||
        deletedProduct.length === 0
      ) {
        throw new Error(
          "Supabase did not delete the product. Check your DELETE policy."
        );
      }

      setProducts(
        (current) =>
          current.filter(
            (item) =>
              Number(item.id) !==
              Number(product.id)
          )
      );

      setMessage(
        `Product "${product.name}" deleted successfully.`
      );

      await loadProducts();
    } catch (error) {
      console.error(
        "PRODUCT DELETE ERROR:",
        error
      );

      setMessage(
        error?.message ||
          "Product could not be deleted."
      );
    }
  }

  /* =========================================================
     UPDATE ORDER STATUS
  ========================================================= */

  async function updateStatus(
    orderId,
    status
  ) {
    const {
      data: {
        user,
      },
    } =
      await supabase.auth.getUser();

    if (!user) {
      setMessage(
        "Your admin session has expired. Please log in again."
      );

      return;
    }

    const { error } =
      await supabase
        .from("orders")
        .update({
          status,
        })
        .eq(
          "id",
          orderId
        );

    if (error) {
      setMessage(
        `Order status could not be updated: ${error.message}`
      );

      return;
    }

    setOrders(
      (current) =>
        current.map(
          (order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                }
              : order
        )
    );

    setMessage(
      "Order status updated."
    );
  }

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(date) {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleString(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  /* =========================================================
     DASHBOARD DATA
  ========================================================= */

  const totalRevenue =
    orders
      .filter(
        (order) =>
          order.status !==
          "cancelled"
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(
            order.total || 0
          ),
        0
      );

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "pending"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status ===
        "delivered"
    ).length;

  const lowStockProducts =
    products.filter(
      (product) => {
        const stock =
          Number(
            product.stock || 0
          );

        return (
          stock > 0 &&
          stock <= 5
        );
      }
    ).length;

  const featuredProducts =
    products.filter(
      (product) =>
        product.featured
    ).length;

  /* =========================================================
     AUTH LOADING SCREEN
  ========================================================= */

  if (authLoading) {
    return (
      <>
        <style>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .auth-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(
                circle at 20% 0%,
                rgba(124,58,237,.25),
                transparent 35%
              ),
              #09090b;
            color: white;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "SF Pro Display",
              sans-serif;
          }

          .auth-loading-box {
            text-align: center;
          }

          .auth-spinner {
            width: 42px;
            height: 42px;
            border: 3px solid rgba(255,255,255,.2);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 18px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="auth-loading">
          <div className="auth-loading-box">
            <div className="auth-spinner" />
            <strong>
              Shindara Phoneflair
            </strong>
            <p style={{ opacity: 0.55 }}>
              Securing admin dashboard...
            </p>
          </div>
        </div>
      </>
    );
  }

  /* =========================================================
     LOGIN SCREEN
  ========================================================= */

  if (!authenticated) {
    return (
      <>
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
          }

          .admin-login-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background:
              radial-gradient(
                circle at 10% 0%,
                rgba(124,58,237,.35),
                transparent 35%
              ),
              radial-gradient(
                circle at 90% 100%,
                rgba(168,85,247,.20),
                transparent 35%
              ),
              #09090b;
            color: white;
          }

          .admin-login-card {
            width: min(440px, 100%);
            padding: 34px;
            border-radius: 30px;
            background: rgba(255,255,255,.075);
            border: 1px solid rgba(255,255,255,.12);
            backdrop-filter: blur(25px);
            box-shadow:
              0 30px 100px rgba(0,0,0,.45);
          }

          .login-logo {
            width: 62px;
            height: 62px;
            border-radius: 19px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            background:
              linear-gradient(
                135deg,
                #7c3aed,
                #a855f7
              );
            font-size: 28px;
            box-shadow:
              0 15px 40px rgba(124,58,237,.35);
          }

          .login-eyebrow {
            font-size: 10px;
            letter-spacing: 2px;
            font-weight: 900;
            opacity: .5;
            margin-bottom: 8px;
          }

          .admin-login-card h1 {
            font-size: 38px;
            letter-spacing: -2px;
            margin: 0 0 8px;
          }

          .login-subtitle {
            color: rgba(255,255,255,.55);
            margin: 0 0 28px;
            line-height: 1.6;
          }

          .login-form {
            display: grid;
            gap: 13px;
          }

          .login-form label {
            font-size: 12px;
            font-weight: 800;
            color: rgba(255,255,255,.65);
          }

          .login-input-wrap {
            position: relative;
          }

          .login-form input {
            width: 100%;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.07);
            color: white;
            padding: 15px;
            border-radius: 14px;
            outline: none;
          }

          .login-form input:focus {
            border-color: #a855f7;
            background: rgba(255,255,255,.1);
          }

          .password-toggle {
            position: absolute;
            right: 7px;
            top: 7px;
            height: calc(100% - 14px);
            padding: 0 12px;
            border: 0;
            border-radius: 10px;
            background: rgba(255,255,255,.08);
            color: white;
          }

          .login-button {
            margin-top: 8px;
            border: 0;
            border-radius: 15px;
            padding: 15px;
            background:
              linear-gradient(
                135deg,
                #7c3aed,
                #a855f7
              );
            color: white;
            font-weight: 900;
            font-size: 15px;
            box-shadow:
              0 15px 35px rgba(124,58,237,.25);
          }

          .login-button:disabled {
            opacity: .55;
          }

          .login-error {
            padding: 13px 14px;
            border-radius: 13px;
            background: rgba(239,68,68,.12);
            border: 1px solid rgba(239,68,68,.2);
            color: #fca5a5;
            font-size: 13px;
            line-height: 1.5;
          }

          .login-footer {
            text-align: center;
            margin-top: 25px;
            font-size: 11px;
            color: rgba(255,255,255,.35);
          }

          @media (max-width: 480px) {
            .admin-login-page {
              padding: 15px;
            }

            .admin-login-card {
              padding: 25px 20px;
              border-radius: 24px;
            }

            .admin-login-card h1 {
              font-size: 32px;
            }
          }
        `}</style>

        <div className="admin-login-page">
          <div className="admin-login-card">

            <div className="login-logo">
              🛍️
            </div>

            <div className="login-eyebrow">
              SHINDARA PHONEFLAIR
            </div>

            <h1>
              Admin Login
            </h1>

            <p className="login-subtitle">
              Sign in to securely manage
              your store, products,
              orders and customers.
            </p>

            {authMessage && (
              <div className="login-error">
                {authMessage}
              </div>
            )}

            <form
              className="login-form"
              onSubmit={
                handleAdminLogin
              }
            >

              <label>
                Admin email
              </label>

              <input
                type="email"
                placeholder="admin@example.com"
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
                required
              />

              <label>
                Password
              </label>

              <div className="login-input-wrap">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={
                    loginPassword
                  }
                  onChange={(event) =>
                    setLoginPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              <button
                className="login-button"
                type="submit"
                disabled={
                  loginLoading
                }
              >
                {loginLoading
                  ? "Signing in..."
                  : "Enter Admin Dashboard →"}
              </button>

            </form>

            <div className="login-footer">
              Authorized administrators only
            </div>

          </div>
        </div>
      </>
    );
  }

  /* =========================================================
     ADMIN DASHBOARD
  ========================================================= */

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
          padding: 25px 18px 70px;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(124,58,237,.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 100% 20%,
              rgba(168,85,247,.08),
              transparent 25%
            ),
            #f5f5f7;
        }

        .admin-container {
          max-width: 1280px;
          margin: auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
        }

        .admin-eyebrow {
          margin: 0 0 7px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
          opacity: .45;
        }

        .admin-header h1 {
          margin: 0;
          font-size: clamp(34px,6vw,58px);
          letter-spacing: -3px;
        }

        .admin-header p {
          opacity: .55;
          margin: 8px 0 0;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .admin-refresh,
        .logout-button,
        .secondary-button {
          border: 1px solid rgba(0,0,0,.09);
          background: rgba(255,255,255,.85);
          color: #111;
          border-radius: 13px;
          padding: 12px 15px;
          font-weight: 750;
        }

        .logout-button {
          color: #b91c1c;
          background: rgba(255,255,255,.7);
        }

        .admin-nav {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          padding: 7px;
          background: rgba(255,255,255,.8);
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 18px;
          margin-bottom: 20px;
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 30px rgba(0,0,0,.03);
        }

        .admin-nav button {
          border: 0;
          background: transparent;
          padding: 12px 15px;
          border-radius: 12px;
          font-weight: 750;
        }

        .admin-nav-active {
          background:
            linear-gradient(
              135deg,
              #111,
              #292929
            ) !important;
          color: white;
          box-shadow:
            0 8px 18px rgba(0,0,0,.12);
        }

        .admin-message {
          padding: 14px 16px;
          background:
            linear-gradient(
              135deg,
              rgba(124,58,237,.10),
              rgba(168,85,247,.06)
            );
          border: 1px solid rgba(124,58,237,.10);
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
          background: rgba(255,255,255,.9);
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 20px;
          padding: 21px;
          box-shadow:
            0 10px 30px rgba(0,0,0,.035);
        }

        .admin-stat span {
          display: block;
          font-size: 11px;
          opacity: .5;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .admin-stat strong {
          font-size: 25px;
          letter-spacing: -.8px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns:
            repeat(4,1fr);
          gap: 12px;
          margin-bottom: 25px;
        }

        .quick-action {
          border: 1px solid rgba(0,0,0,.06);
          background: white;
          border-radius: 18px;
          padding: 17px;
          text-align: left;
          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .quick-action:hover {
          transform: translateY(-2px);
          box-shadow:
            0 15px 35px rgba(0,0,0,.07);
        }

        .quick-action-icon {
          font-size: 22px;
          margin-bottom: 10px;
        }

        .quick-action strong {
          display: block;
          margin-bottom: 4px;
        }

        .quick-action span {
          font-size: 11px;
          opacity: .5;
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
          letter-spacing: -.8px;
        }

        .primary-button {
          border: 0;
          background:
            linear-gradient(
              135deg,
              #111,
              #292929
            );
          color: white;
          padding: 13px 17px;
          border-radius: 13px;
          font-weight: 800;
          box-shadow:
            0 8px 20px rgba(0,0,0,.12);
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
          grid-template-columns:
            repeat(4,minmax(0,1fr));
          gap: 16px;
        }

        .admin-product-card {
          background: white;
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 10px 30px rgba(0,0,0,.04);
        }

        .admin-product-image {
          height: 220px;
          background:
            linear-gradient(
              135deg,
              #f5f5f7,
              #ededf0
            );
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
          grid-template-columns:
            1fr 1fr;
          gap: 8px;
          margin-top: 15px;
        }

        .featured-badge {
          display: inline-block;
          margin-top: 8px;
          padding: 5px 8px;
          border-radius: 999px;
          background:
            rgba(124,58,237,.1);
          color: #6d28d9;
          font-size: 10px;
          font-weight: 800;
        }

        .orders-grid {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 16px;
        }

        .order-card {
          background: white;
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 22px;
          padding: 20px;
          box-shadow:
            0 10px 30px rgba(0,0,0,.035);
        }

        .order-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
          padding-bottom: 15px;
          border-bottom:
            1px solid rgba(0,0,0,.07);
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
          border-bottom:
            1px solid rgba(0,0,0,.07);
        }

        .order-customer h3,
        .order-products h3 {
          margin: 0 0 10px;
          font-size: 11px;
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
          grid-template-columns:
            repeat(3,minmax(0,1fr));
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
          background:
            rgba(0,0,0,.6);
          backdrop-filter:
            blur(8px);
        }

        .admin-modal {
          width: min(620px,100%);
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 25px;
          padding: 27px;
          position: relative;
          box-shadow:
            0 30px 100px rgba(0,0,0,.3);
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
        .admin-form textarea,
        .admin-form select {
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
        .admin-form textarea:focus,
        .admin-form select:focus {
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
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
          margin-top: 8px;
        }

        .uploading-text {
          text-align: center;
          font-size: 13px;
          opacity: .6;
          margin-top: 8px;
        }

        @media (max-width:1050px) {
          .products-grid {
            grid-template-columns:
              repeat(3,minmax(0,1fr));
          }

          .customers-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .quick-actions {
            grid-template-columns:
              repeat(2,1fr);
          }
        }

        @media (max-width:760px) {
          .admin-page {
            padding: 18px 12px 50px;
          }

          .admin-header {
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }

          .admin-stats {
            grid-template-columns:
              repeat(2,1fr);
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

          .header-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .admin-stats {
            gap: 9px;
          }

          .admin-stat {
            padding: 16px;
          }

          .admin-stat strong {
            font-size: 21px;
          }

          .quick-actions {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .quick-action {
            padding: 14px;
          }

          .admin-modal {
            padding: 22px 16px;
          }

          .modal-actions {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

      <div className="admin-container">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="admin-header">

          <div>
            <p className="admin-eyebrow">
              SHINDARA PHONEFLAIR
            </p>

            <h1>
              Control Center
            </h1>

            <p>
              Welcome back,{" "}
              {adminUser?.email ||
                "Administrator"}
            </p>
          </div>

          <div className="header-actions">

            <button
              className="admin-refresh"
              onClick={
                loadEverything
              }
            >
              ↻ Refresh
            </button>

            <button
              className="logout-button"
              onClick={
                handleLogout
              }
            >
              ↪ Logout
            </button>

          </div>

        </header>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="admin-nav">

          <button
            className={
              activeSection ===
              "dashboard"
                ? "admin-nav-active"
                : ""
            }
            onClick={
              openDashboard
            }
          >
            📊 Dashboard
          </button>

          <button
            className={
              activeSection ===
              "products"
                ? "admin-nav-active"
                : ""
            }
            onClick={
              openProducts
            }
          >
            📦 Products
          </button>

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

        {/* ===================================================
            MESSAGE
        =================================================== */}

        {message && (
          <div className="admin-message">
            {message}
          </div>
        )}

        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {activeSection ===
          "dashboard" && (
          <>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>
                  Total products
                </span>

                <strong>
                  {products.length}
                </strong>
              </div>

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
                  Customers
                </span>

                <strong>
                  {customers.length}
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

            <div className="admin-stats">

              <div className="admin-stat">
                <span>
                  Pending orders
                </span>

                <strong>
                  {pendingOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  Delivered
                </span>

                <strong>
                  {deliveredOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  Low stock
                </span>

                <strong>
                  {lowStockProducts}
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  Featured
                </span>

                <strong>
                  {featuredProducts}
                </strong>
              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div className="quick-actions">

              <button
                className="quick-action"
                onClick={
                  openAddProduct
                }
              >
                <div className="quick-action-icon">
                  ➕
                </div>

                <strong>
                  Add Product
                </strong>

                <span>
                  Add something new
                  to your store
                </span>
              </button>

              <button
                className="quick-action"
                onClick={
                  openOrders
                }
              >
                <div className="quick-action-icon">
                  🛒
                </div>

                <strong>
                  View Orders
                </strong>

                <span>
                  Manage customer
                  orders
                </span>
              </button>

              <button
                className="quick-action"
                onClick={
                  openCustomers
                }
              >
                <div className="quick-action-icon">
                  👥
                </div>

                <strong>
                  Customers
                </strong>

                <span>
                  View your customer
                  directory
                </span>
              </button>

              <button
                className="quick-action"
                onClick={
                  openProducts
                }
              >
                <div className="quick-action-icon">
                  ⚙️
                </div>

                <strong>
                  Store
                </strong>

                <span>
                  Manage products
                  and inventory
                </span>
              </button>

            </div>

            <div className="admin-empty">

              <div>
                🚀
              </div>

              <h2>
                Your store is ready
                to grow.
              </h2>

              <p>
                Manage products,
                orders and customers
                from your dashboard.
              </p>

              <button
                className="primary-button"
                onClick={
                  openAddProduct
                }
              >
                + Add Product
              </button>

            </div>

          </>
        )}

        {/* ===================================================
            PRODUCTS
        =================================================== */}

        {activeSection ===
          "products" && (
          <>

            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  STORE INVENTORY
                </p>

                <h2>
                  Products
                </h2>
              </div>

              <button
                className="primary-button"
                onClick={
                  openAddProduct
                }
              >
                + Add Product
              </button>

            </div>

            <div className="admin-stats">

              <div className="admin-stat">
                <span>
                  All products
                </span>

                <strong>
                  {products.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  In stock
                </span>

                <strong>
                  {
                    products.filter(
                      (p) =>
                        Number(
                          p.stock || 0
                        ) > 0
                    ).length
                  }
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  Out of stock
                </span>

                <strong>
                  {
                    products.filter(
                      (p) =>
                        Number(
                          p.stock || 0
                        ) <= 0
                    ).length
                  }
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  Low stock
                </span>

                <strong>
                  {lowStockProducts}
                </strong>
              </div>

            </div>

            {productsLoading ? (
              <div className="admin-empty">
                Loading products...
              </div>
            ) : products.length ===
              0 ? (
              <div className="admin-empty">

                <div>
                  📦
                </div>

                <h2>
                  No products yet
                </h2>

                <p>
                  Add your first
                  product.
                </p>

                <button
                  className="primary-button"
                  onClick={
                    openAddProduct
                  }
                >
                  + Add Product
                </button>

              </div>
            ) : (
              <div className="products-grid">

                {products.map(
                  (product) => {

                    const stock =
                      Number(
                        product.stock ||
                          0
                      );

                    return (
                      <article
                        className="admin-product-card"
                        key={
                          product.id
                        }
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
                                fontSize:
                                  55,
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
                                : stock <=
                                  5
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
                            >
                              🗑️ Delete
                            </button>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

          </>
        )}

        {/* ===================================================
            ORDERS
        =================================================== */}

        {activeSection ===
          "orders" && (
          <>

            <div className="section-heading">

              <div>
                <p className="admin-eyebrow">
                  STORE ORDERS
                </p>

                <h2>
                  Orders
                </h2>
              </div>

              <button
                className="secondary-button"
                onClick={
                  loadOrders
                }
              >
                ↻ Refresh
              </button>

            </div>

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
                  {pendingOrders}
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  Delivered
                </span>

                <strong>
                  {deliveredOrders}
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
                  🛒
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
                            {String(
                              order.id
                            )
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
                          (item) => (

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
        )}

        {/* ===================================================
            CUSTOMERS
        =================================================== */}

        {activeSection ===
          "customers" && (
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
                onClick={
                  loadCustomers
                }
              >
                ↻ Refresh
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
                  (customer, index) => (

                    <article
                      className="customer-card"
                      key={
                        customer.user_id ||
                        customer.customer_phone ||
                        index
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

      {/* =====================================================
          PRODUCT MODAL
      ===================================================== */}

      {productModal && (

        <div
          className="admin-modal-backdrop"
          onClick={
            closeProductModal
          }
        >

          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="admin-modal-close"
              onClick={
                closeProductModal
              }
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
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p
              style={{
                opacity: 0.6,
                marginTop: 0,
              }}
            >
              Add the product details
              below.
            </p>

            <form
              className="admin-form"
              onSubmit={
                saveProduct
              }
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
                  setProductForm(
                    (current) => ({
                      ...current,
                      name:
                        event.target
                          .value,
                    })
                  )
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
                  setProductForm(
                    (current) => ({
                      ...current,
                      description:
                        event.target
                          .value,
                    })
                  )
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
                  setProductForm(
                    (current) => ({
                      ...current,
                      price:
                        event.target
                          .value,
                    })
                  )
                }
                required
              />

              <label>
                Category
              </label>

              <select
                value={
                  productForm.category
                }
                onChange={(event) =>
                  setProductForm(
                    (current) => ({
                      ...current,
                      category:
                        event.target
                          .value,
                    })
                  )
                }
                required
              >

                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      value={
                        category
                      }
                      key={
                        category
                      }
                    >
                      {category}
                    </option>
                  )
                )}

              </select>

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
                  setProductForm(
                    (current) => ({
                      ...current,
                      stock:
                        event.target
                          .value,
                    })
                  )
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
                      src={
                        imagePreview
                      }
                      alt="Product preview"
                    />

                  </div>

                ) : (

                  <div className="image-preview">

                    <span
                      style={{
                        fontSize: 50,
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
                  📷 Choose Product
                  Image
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
                    setProductForm(
                      (current) => ({
                        ...current,
                        featured:
                          event.target
                            .checked,
                      })
                    )
                  }
                />

                <label
                  htmlFor="featured"
                  style={{
                    margin: 0,
                    opacity: 1,
                  }}
                >
                  ⭐ Featured Product
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
                    ? "Processing..."
                    : savingProduct
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Add Product"}
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