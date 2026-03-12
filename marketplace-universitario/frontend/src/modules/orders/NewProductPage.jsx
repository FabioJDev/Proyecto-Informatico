import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import Navbar from '../../components/layout/Navbar.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency } from '../../utils/formatters.js';

const MAX_IMAGES = 5;
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Client-side icon map — schema has no icon/slug fields
const CATEGORY_ICONS = {
  'Alimentos y Bebidas': '🍕',
  'Ropa y Accesorios': '👕',
  'Arte y Artesanías': '🎨',
  'Tecnología': '💻',
  'Servicios Digitales': '🖥️',
  'Servicios y Tutorías': '📚',
  'Tutorías y Clases': '📚',
  'Belleza y Cuidado': '💄',
  'Otros': '📦',
};
const getIcon = (name) => CATEGORY_ICONS[name] || '📦';

// ── Input style helper ────────────────────────────────────────────────────────
const inputClass = (hasError) => `
  w-full px-4 py-3 rounded-xl text-sm
  bg-white text-[#1A1A1A]
  border-[1.5px] ${hasError ? 'border-[#990100] bg-[rgba(153,1,0,0.04)]' : 'border-[#E8E8E8]'}
  placeholder:text-[#999999]
  hover:border-[#CCCCCC]
  focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
  transition-all duration-200
`;

const InlineError = ({ msg }) => msg ? (
  <p className="mt-1.5 text-sm text-[#990100] flex items-center gap-1.5">
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    {msg}
  </p>
) : null;

// ── Custom category dropdown ──────────────────────────────────────────────────
function CategorySelect({ categories, value, onChange, error, isLoading: loading }) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <div>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left
          border-[1.5px] ${error ? 'border-[#990100] bg-[rgba(153,1,0,0.04)]' : open ? 'border-[#990100]' : 'border-[#E8E8E8] bg-white'}
          hover:border-[#CCCCCC]
          focus:outline-none
          transition-all duration-200
        `}
      >
        {loading ? (
          <span className="text-[#999999]">Cargando categorías…</span>
        ) : selected ? (
          <span className="flex items-center gap-2 text-[#1A1A1A]">
            <span>{getIcon(selected.name)}</span>
            <span>{selected.name}</span>
          </span>
        ) : (
          <span className="text-[#999999]">Seleccionar categoría…</span>
        )}
        <svg
          className={`w-4 h-4 text-[#999999] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Inline list — expands in document flow, nothing overlaps */}
      {open && (
        <div className="mt-1 border border-[#E8E8E8] rounded-xl bg-white overflow-hidden">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { onChange(cat.id); setOpen(false); }}
              className={`
                w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left
                border-b border-[#F6F6F6] last:border-b-0
                transition-colors duration-150
                ${value === cat.id
                  ? 'bg-[rgba(153,1,0,0.06)] text-[#990100] font-medium'
                  : 'text-[#333333] hover:bg-[#F6F6F6]'
                }
              `}
            >
              <span className="text-base">{getIcon(cat.name)}</span>
              <span>{cat.name}</span>
              {value === cat.id && (
                <svg className="w-4 h-4 ml-auto text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      <InlineError msg={error} />
    </div>
  );
}

// ── Multi-image upload zone + thumbnail grid ──────────────────────────────────
function MultiImageUpload({ imageItems, onAdd, onRemove, onReorder, error }) {
  const [draggingFile, setDraggingFile] = useState(false);
  const [draggedThumb, setDraggedThumb] = useState(null);
  const inputRef = useRef(null);

  const processFiles = useCallback((files) => {
    const filesArr = Array.from(files);
    const remaining = MAX_IMAGES - imageItems.length;

    if (filesArr.length > remaining) {
      onAdd(filesArr.slice(0, remaining), `Solo se permiten hasta ${MAX_IMAGES} imágenes por publicación.`);
      return;
    }

    const valid = [];
    const errs = [];
    for (const f of filesArr) {
      if (!ALLOWED_TYPES.includes(f.type)) { errs.push(`${f.name}: solo JPG o PNG.`); continue; }
      if (f.size > MAX_BYTES) { errs.push(`${f.name}: supera los 2 MB.`); continue; }
      valid.push(f);
    }
    onAdd(valid, errs.length ? errs[0] : null);
  }, [imageItems.length, onAdd]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDraggingFile(false);
    if (imageItems.length >= MAX_IMAGES) return;
    processFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  // Thumbnail drag-to-reorder
  const handleThumbDrop = (targetIndex) => {
    if (draggedThumb === null || draggedThumb === targetIndex) { setDraggedThumb(null); return; }
    onReorder(draggedThumb, targetIndex);
    setDraggedThumb(null);
  };

  return (
    <div className="space-y-3">
      {/* Counter */}
      {imageItems.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#999999] uppercase tracking-widest">
            {imageItems.length}/{MAX_IMAGES} imágenes
          </span>
          {imageItems.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-mono font-medium text-[#990100] hover:text-[#B90504] flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Agregar más
            </button>
          )}
        </div>
      )}

      {/* Thumbnail grid */}
      {imageItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imageItems.map((item, i) => (
            <div
              key={item.previewUrl}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing
                ${draggedThumb === i ? 'opacity-40 border-[#990100]' : 'border-[#E8E8E8] hover:border-[#CCCCCC]'}
                transition-all duration-150
              `}
              draggable
              onDragStart={() => setDraggedThumb(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleThumbDrop(i)}
              onDragEnd={() => setDraggedThumb(null)}
            >
              <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#E8A045] text-white text-[9px] font-mono font-bold uppercase text-center py-0.5">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Eliminar imagen"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone — shown when no images OR always as additional area */}
      {imageItems.length < MAX_IMAGES && (
        <div
          className={`
            relative w-full h-36 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer
            border-2 border-dashed transition-all duration-200
            ${draggingFile
              ? 'border-[#990100] bg-[rgba(153,1,0,0.06)] scale-[1.01]'
              : 'border-[#CCCCCC] bg-[#F6F6F6] hover:border-[#990100] hover:bg-[rgba(153,1,0,0.04)]'
            }
          `}
          onClick={() => inputRef.current?.click()}
          onDrop={handleFileDrop}
          onDragOver={(e) => { e.preventDefault(); setDraggingFile(true); }}
          onDragLeave={() => setDraggingFile(false)}
          onDragEnter={(e) => { e.preventDefault(); setDraggingFile(true); }}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${draggingFile ? 'bg-[rgba(153,1,0,0.12)]' : 'bg-[#E8E8E8]'}`}>
            <svg className={`w-5 h-5 ${draggingFile ? 'text-[#990100]' : 'text-[#999999]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[#666666]">
              {draggingFile ? 'Suelta aquí' : imageItems.length === 0 ? 'Arrastra tus imágenes aquí o haz clic' : 'Agregar más imágenes'}
            </p>
            <p className="text-xs text-[#999999] mt-0.5">JPG o PNG · Máx. 2 MB por imagen · Hasta {MAX_IMAGES} imágenes</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {error && <InlineError msg={error} />}
    </div>
  );
}

// ── Live product preview card ─────────────────────────────────────────────────
function ProductPreviewCard({ name, price, categoryName, firstImage, sellerName }) {
  const formattedPrice = price && parseFloat(price) > 0
    ? formatCurrency(parseFloat(price))
    : null;

  return (
    <article
      className="overflow-hidden bg-white border border-[#E8E8E8] relative"
      style={{ borderRadius: '4px 16px 4px 16px' }}
    >
      {/* Red triangle notch */}
      <div
        className="absolute top-0 left-0 z-10 pointer-events-none"
        style={{
          width: 0, height: 0,
          borderStyle: 'solid',
          borderWidth: '22px 22px 0 0',
          borderColor: '#990100 transparent transparent transparent',
        }}
      />

      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-[#F6F6F6] flex items-center justify-center relative">
        {firstImage ? (
          <img src={firstImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#CCCCCC]">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-xs font-mono">Sin imagen</span>
          </div>
        )}
        {/* Category chip */}
        {categoryName && (
          <span
            className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-widest bg-[#E8E8E8] text-[#333333] border border-[#CCCCCC]"
            style={{ borderRadius: '2px 8px 2px 8px' }}
          >
            {getIcon(categoryName)} {categoryName}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="px-4 pt-3 pb-2">
        <p className="font-display font-semibold text-sm text-[#1A1A1A] line-clamp-2 leading-snug min-h-[2.5rem]">
          {name || <span className="text-[#CCCCCC]">Nombre del producto</span>}
        </p>
      </div>

      {/* Price band */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F6F6F6] border-t border-[#E8E8E8]">
        <span className="font-mono font-semibold text-sm text-[#990100]">
          {formattedPrice || <span className="text-[#CCCCCC]">$ 0 COP</span>}
        </span>
        {sellerName && (
          <span className="text-[10px] font-mono text-[#999999] truncate max-w-[80px]">{sellerName}</span>
        )}
      </div>
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewProductPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = useAuthStore((s) => s.user);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '' });
  const [imageItems, setImageItems] = useState([]); // [{ file: File, previewUrl: string }]
  const [imageError, setImageError] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const sellerName = user?.profile?.businessName || user?.email;

  // Fetch categories (CAUSE C + D: loading state + robust response parsing)
  useEffect(() => {
    api.get('/products/categories')
      .then((res) => {
        const data = res.data;
        // Handle both { data: [] } and bare [] response shapes
        const cats = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setCategories(cats);
      })
      .catch(() => { setCategories([]); })
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Revoke preview URLs on unmount
  useEffect(() => {
    return () => { imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl)); };
  }, []);

  // Field change
  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  // Image handlers
  const handleAddImages = useCallback((files, errMsg) => {
    if (errMsg) {
      addToast(errMsg, 'error');
      setImageError(errMsg);
    } else {
      setImageError('');
    }
    const newItems = files.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    setImageItems((prev) => [...prev, ...newItems]);
  }, [addToast]);

  const handleRemoveImage = (index) => {
    setImageItems((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    setImageError('');
  };

  const handleReorder = (from, to) => {
    setImageItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  // Validation
  const validate = () => {
    const errs = {};

    if (!form.name.trim()) {
      errs.name = 'El nombre del producto es obligatorio.';
    } else if (form.name.trim().length < 3) {
      errs.name = 'El nombre debe tener al menos 3 caracteres.';
    }

    // CA-02: price empty
    if (!form.price && form.price !== 0) {
      errs.price = 'El precio es obligatorio y debe ser mayor a $0';
    } else {
      const priceVal = parseFloat(form.price);
      // CA-03: negative or zero
      if (isNaN(priceVal) || priceVal <= 0) {
        errs.price = 'El precio debe ser un valor positivo mayor a cero';
      }
    }

    // CA-06
    if (!form.categoryId) {
      errs.categoryId = 'Debes seleccionar una categoría';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('price', form.price);
      formData.append('categoryId', form.categoryId);
      imageItems.forEach((item) => formData.append('images', item.file));

      const res = await api.post('/products', formData);
      const productId = res.data.data?.id;
      addToast('¡Producto publicado exitosamente!', 'success');
      navigate(productId ? `/products/${productId}` : '/my-products');
    } catch (err) {
      if (err.validationErrors?.length) {
        const fe = {};
        err.validationErrors.forEach(({ field, message }) => { fe[field] = message; });
        setErrors(fe);
      } else {
        addToast(err.userMessage || 'Error al publicar el producto.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8 animate-in">
          <p className="text-xs font-mono uppercase tracking-widest text-[#990100] mb-2">
            EPIC-02 · US-07
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] leading-tight">
            Publicar producto o servicio
          </h1>
          <p className="text-[#999999] mt-2 text-sm">
            Completa la información para aparecer en el catálogo universitario.
          </p>
        </div>

        {/* Two-column layout */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

            {/* ── LEFT: Form ── */}
            <div className="space-y-6">

              {/* GROUP 1 — Información básica */}
              <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 animate-in delay-1">
                <p className="text-xs font-mono uppercase tracking-widest text-[#990100] mb-4">
                  01 · Información básica
                </p>

                {/* Name */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[#666666]">
                      Nombre del producto o servicio <span className="text-[#990100]">*</span>
                    </label>
                    <span className={`text-xs font-mono ${form.name.length > 130 ? 'text-[#990100]' : 'text-[#CCCCCC]'}`}>
                      {form.name.length}/150
                    </span>
                  </div>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    maxLength={150}
                    placeholder="Ej: Brownies caseros de chocolate, Tutoría de cálculo…"
                    className={inputClass(!!errors.name)}
                  />
                  <InlineError msg={errors.name} />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-[#666666]">Descripción</label>
                    <span className={`text-xs font-mono ${form.description.length > 900 ? 'text-[#990100]' : 'text-[#CCCCCC]'}`}>
                      {form.description.length}/1000
                    </span>
                  </div>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    rows={5}
                    maxLength={1000}
                    placeholder="Describe materiales, tallas, tiempo de entrega, qué incluye el servicio…"
                    className={`${inputClass(!!errors.description)} resize-none`}
                  />
                  <InlineError msg={errors.description} />
                </div>
              </div>

              {/* GROUP 2 — Precio y categoría */}
              <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 animate-in delay-2">
                <p className="text-xs font-mono uppercase tracking-widest text-[#990100] mb-4">
                  02 · Precio y categoría
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Price */}
                  <div>
                    <label className="text-sm font-medium text-[#666666] block mb-1.5">
                      Precio <span className="text-[#990100]">*</span>
                    </label>
                    <div className="flex">
                      <span className={`
                        flex items-center px-3 text-sm font-mono font-medium text-[#666666]
                        bg-[#F6F6F6] border-[1.5px] rounded-l-xl border-r-0
                        ${errors.price ? 'border-[#990100]' : 'border-[#E8E8E8]'}
                        transition-colors duration-200
                      `}>
                        COP $
                      </span>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setField('price', e.target.value)}
                        min="1"
                        step="any"
                        placeholder="25000"
                        className={`
                          flex-1 px-4 py-3 text-sm rounded-r-xl
                          bg-white text-[#1A1A1A]
                          border-[1.5px] ${errors.price ? 'border-[#990100] bg-[rgba(153,1,0,0.04)]' : 'border-[#E8E8E8]'}
                          placeholder:text-[#999999]
                          hover:border-[#CCCCCC]
                          focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
                          transition-all duration-200
                        `}
                      />
                    </div>
                    <InlineError msg={errors.price} />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium text-[#666666] block mb-1.5">
                      Categoría <span className="text-[#990100]">*</span>
                    </label>
                    <CategorySelect
                      categories={categories}
                      value={form.categoryId}
                      onChange={(val) => { setField('categoryId', val); }}
                      error={errors.categoryId}
                      isLoading={categoriesLoading}
                    />
                  </div>
                </div>
              </div>

              {/* GROUP 3 — Imágenes */}
              <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 animate-in delay-2">
                <p className="text-xs font-mono uppercase tracking-widest text-[#990100] mb-1">
                  03 · Imágenes
                </p>
                <p className="text-xs text-[#999999] mb-4">
                  La primera imagen será la portada del producto. Arrastra para reordenar.
                </p>
                <MultiImageUpload
                  imageItems={imageItems}
                  onAdd={handleAddImages}
                  onRemove={handleRemoveImage}
                  onReorder={handleReorder}
                  error={imageError}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pb-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    flex-1 inline-flex items-center justify-center gap-2
                    px-6 py-3.5 text-sm font-semibold text-white
                    bg-[#990100]
                    hover:bg-[#B90504] hover:-translate-y-0.5
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                    shadow-[0_4px_15px_rgba(153,1,0,0.25)]
                    hover:shadow-[0_4px_25px_rgba(185,5,4,0.40)]
                    transition-all duration-200 rounded-xl
                  `}
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)' }}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="w-4 h-4 rounded-full border-2 border-white/30"
                        style={{ borderTopColor: 'white', animation: 'spin 0.6s linear infinite' }}
                      />
                      Publicando…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                      Publicar producto
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/my-products')}
                  disabled={isLoading}
                  className="
                    px-5 py-3.5 text-sm font-medium text-[#333333] rounded-xl
                    border border-[#333333]
                    hover:border-[#990100] hover:text-[#990100]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                >
                  Cancelar
                </button>
              </div>
            </div>

            {/* ── RIGHT: Live preview ── */}
            <div className="animate-in delay-3 sticky top-24 space-y-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#999999] mb-2">
                  Vista previa
                </p>
                <p className="text-[10px] text-[#999999] mb-3">
                  Así verán tu producto los compradores
                </p>
                <ProductPreviewCard
                  name={form.name}
                  price={form.price}
                  categoryName={selectedCategory?.name || null}
                  firstImage={imageItems[0]?.previewUrl || null}
                  sellerName={sellerName}
                />
              </div>

              {/* Tips */}
              <div className="bg-[rgba(153,1,0,0.04)] border border-[rgba(153,1,0,0.15)] rounded-xl p-4 space-y-2">
                <p className="text-xs font-mono font-semibold text-[#990100] uppercase tracking-wider">
                  Consejos para vender más
                </p>
                {[
                  'Usa fotos claras con buena iluminación',
                  'Describe materiales, tallas o tiempo de entrega',
                  '¿El precio incluye o excluye envío?',
                ].map((tip) => (
                  <p key={tip} className="text-xs text-[#666666] flex items-start gap-1.5">
                    <span className="text-[#990100] mt-0.5">▸</span>
                    {tip}
                  </p>
                ))}
              </div>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
