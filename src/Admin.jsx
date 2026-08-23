import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const CATEGORIES = [
  "Smartphones",
  "Phone Cases",
  "Chargers",
  "Cables",
  "Audio",
  "Power Banks",
  "Gadgets",
  "Other Electronics"
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Smartphones",
  stock: "",
  featured: false
};

export default function Admin() {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("not-authenticated");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

      if (profileError || !profile?.is_admin) {
        setStatus("not-admin");
        return;
      }

      setUser(user);
      setStatus("admin");

      await loadProducts();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  async function loadProducts() {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      setMessage(error.message);
    } else {
      setProducts(data || []);
    }

    setLoadingProducts(false);
  }

  function openAddForm() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setCurrentImage("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      category: product.category || "Smartphones",
      stock: product.stock ?? "",
      featured: product.featured || false
    });

    setImageFile(null);
    setCurrentImage(product.image_url || "");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setCurrentImage("");
    setMessage("");
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function uploadImage() {
    if (!imageFile) {
      return currentImage || null;
    }

    const extension =
      imageFile.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const fileName =
      `${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data } =
      supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function saveProduct(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      if (!form.name.trim()) {
        throw new Error(
          "Please enter a product name."
        );
      }

      const price = Number(form.price);
      const stock = Number(form.stock);

      if (
        Number.isNaN(price) ||
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

      const imageUrl = await uploadImage();

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        category: form.category,
        stock,
        featured: form.featured,
        image_url: imageUrl
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) {
          throw error;
        }

        setMessage(
          "Product updated successfully."
        );
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) {
          throw error;
        }

        setMessage(
          "Product added successfully."
        );
      }

      await loadProducts();

      setTimeout(() => {
        closeForm();
      }, 700);

    } catch (error) {
      console.error(error);

      setMessage(
        error?.message ||
        "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Product deleted.");

    await loadProducts();
  }

  async function logout() {
    await supabase.auth.signOut();

    window.location.href = "/";
  }

  if (status === "checking") {
    return (
      <div className="admin-screen">
        <div className="admin-screen-card">
          <h2>
            Checking admin access...
          </h2>
        </div>
      </div>
    );
  }

  if (status === "not-authenticated") {
    return (
      <div className="admin-screen">
        <div className="admin-screen-card">
          <h1>Shindara Admin</h1>

          <p>
            Please sign in to access the
            admin dashboard.
          </p>

          <a
            href="/"
            className="admin-primary-button"
          >
            Back to store
          </a>
        </div>
      </div>
    );
  }

  if (status === "not-admin") {
    return (
      <div className="admin-screen">
        <div className="admin-screen-card">
          <h1>Access denied 🔒</h1>

          <p>
            This account does not have
            administrator permissions.
          </p>

          <a
            href="/"
            className="admin-primary-button"
          >
            Back to store
          </a>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="admin-screen">
        <div className="admin-screen-card">
          <h1>
            Something went wrong
          </h1>

          <p>
            We couldn't verify your
            administrator account.
          </p>

          <a
            href="/"
            className="admin-primary-button"
          >
            Back to store
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      <header className="admin-header">

        <div>
          <p className="admin-eyebrow">
            SHINDARA PHONEFLAIR
          </p>

          <h1>
            Admin Dashboard
          </h1>
        </div>

        <div className="admin-header-actions">

          <a
            href="/"
            className="admin-store-link"
          >
            View store
          </a>

          <button
            className="admin-logout"
            onClick={logout}
          >
            Log out
          </button>

        </div>

      </header>

      <main className="admin-main">

        <section className="admin-welcome">

          <p className="admin-eyebrow">
            CONTROL CENTER
          </p>

          <h2>
            Welcome, Admin 👑
          </h2>

          <p>
            {user?.email}
          </p>

        </section>

        <section className="admin-stats">

          <div className="admin-stat">
            <span>📦</span>

            <strong>
              {products.length}
            </strong>

            <small>
              Total products
            </small>
          </div>

          <div className="admin-stat">
            <span>⭐</span>

            <strong>
              {
                products.filter(
                  (product) =>
                    product.featured
                ).length
              }
            </strong>

            <small>
              Featured products
            </small>
          </div>

          <div className="admin-stat">
            <span>📦</span>

            <strong>
              {
                products.reduce(
                  (total, product) =>
                    total +
                    Number(
                      product.stock || 0
                    ),
                  0
                )
              }
            </strong>

            <small>
              Total stock
            </small>
          </div>

        </section>

        <section className="admin-section">

          <div className="admin-section-heading">

            <div>
              <p className="admin-eyebrow">
                INVENTORY
              </p>

              <h2>
                Products
              </h2>
            </div>

            <button
              className="admin-primary-button"
              onClick={openAddForm}
            >
              + Add product
            </button>

          </div>

          {message && !showForm && (
            <div className="admin-message">
              {message}
            </div>
          )}

          {loadingProducts ? (

            <div className="admin-empty">
              Loading products...
            </div>

          ) : products.length === 0 ? (

            <div className="admin-empty">

              <div className="empty-icon">
                📦
              </div>

              <h3>
                No products yet
              </h3>

              <p>
                Add your first
                Shindara Phoneflair product.
              </p>

              <button
                className="admin-primary-button"
                onClick={openAddForm}
              >
                Add your first product
              </button>

            </div>

          ) : (

            <div className="admin-products">

              {products.map((product) => (

                <article
                  className="admin-product"
                  key={product.id}
                >

                  <div className="admin-product-image">

                    {product.image_url ? (

                      <img
                        src={product.image_url}
                        alt={product.name}
                      />

                    ) : (

                      <span>
                        📦
                      </span>

                    )}

                  </div>

                  <div className="admin-product-info">

                    {product.featured && (
                      <span className="featured-badge">
                        ⭐ Featured
                      </span>
                    )}

                    <p className="product-category">
                      {product.category}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <strong className="admin-price">
                      ₦
                      {Number(
                        product.price || 0
                      ).toLocaleString(
                        "en-NG"
                      )}
                    </strong>

                    <p className="stock">
                      Stock: {product.stock}
                    </p>

                  </div>

                  <div className="admin-product-actions">

                    <button
                      onClick={() =>
                        openEditForm(product)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteProduct(product)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

      {showForm && (

        <div
          className="admin-modal-backdrop"
          onClick={closeForm}
        >

          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>
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
              </div>

              <button
                className="admin-close"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form
              className="product-form"
              onSubmit={saveProduct}
            >

              <label>
                Product name

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="e.g. iPhone 15 Pro"
                  required
                />
              </label>

              <label>
                Description

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe the product..."
                  rows="4"
                />
              </label>

              <div className="form-row">

                <label>
                  Price (₦)

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateField(
                        "price",
                        event.target.value
                      )
                    }
                    placeholder="15000"
                    required
                  />
                </label>

                <label>
                  Stock

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) =>
                      updateField(
                        "stock",
                        event.target.value
                      )
                    }
                    placeholder="10"
                    required
                  />
                </label>

              </div>

              <label>
                Category

                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value
                    )
                  }
                >

                  {CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </label>

              <label className="image-upload">

                Product image

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setImageFile(
                      event.target.files?.[0] ||
                      null
                    )
                  }
                />

                <small>
                  On iPhone, choose a photo
                  from your Photos library.
                </small>

              </label>

              {currentImage &&
                !imageFile && (

                  <div className="current-image">

                    <img
                      src={currentImage}
                      alt="Current product"
                    />

                    <small>
                      Current product image
                    </small>

                  </div>

                )}

              {imageFile && (

                <div className="selected-file">
                  📷 {imageFile.name}
                </div>

              )}

              <label className="featured-toggle">

                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    updateField(
                      "featured",
                      event.target.checked
                    )
                  }
                />

                <span>
                  Mark as featured product ⭐
                </span>

              </label>

              {message && (
                <div className="admin-message">
                  {message}
                </div>
              )}

              <div className="form-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                  disabled={saving}
                >
                  {saving
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
