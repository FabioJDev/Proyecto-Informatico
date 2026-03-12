import { useState, useEffect, useRef, useCallback } from 'react';
import LivePreviewCard from './LivePreviewCard.jsx';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// ── Drag-and-drop photo zone ─────────────────────────────────────────────────
function PhotoUploadZone({ preview, onFile, error, onRemove }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      onFile(null, 'Solo se permiten imágenes JPG o PNG.');
      return;
    }
    if (file.size > MAX_BYTES) {
      onFile(null, 'La imagen no puede superar los 2 MB.');
      return;
    }
    onFile(file, null);
  }, [onFile]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleInputChange = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  return (
    <div>
      <label className="text-sm font-medium text-[#666666] block mb-1.5">
        Foto del emprendimiento{' '}
        <span className="text-[#999999] font-normal">(JPG o PNG · máx. 2 MB)</span>
      </label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-[#990100] w-full h-44">
          <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors duration-200 flex items-center justify-center group cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono font-semibold uppercase tracking-widest">
              Cambiar foto
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Eliminar foto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          className={`
            relative w-full h-44 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer
            border-2 border-dashed transition-all duration-200
            ${dragging
              ? 'border-[#990100] bg-[rgba(153,1,0,0.06)] scale-[1.01]'
              : 'border-[#CCCCCC] bg-[#F6F6F6] hover:border-[#990100] hover:bg-[rgba(153,1,0,0.04)]'
            }
          `}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${dragging ? 'bg-[rgba(153,1,0,0.12)]' : 'bg-[#E8E8E8]'}`}>
            <svg className={`w-6 h-6 transition-colors ${dragging ? 'text-[#990100]' : 'text-[#999999]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-[#666666]">
              {dragging ? 'Suelta aquí tu foto' : 'Arrastra tu foto aquí o haz clic'}
            </p>
            <p className="text-xs text-[#999999] mt-0.5">JPG, PNG · máx. 2 MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="mt-1.5 text-sm text-[#990100] flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main shared form ──────────────────────────────────────────────────────────
/**
 * Props:
 *   initialValues  – { businessName, description, contactInfo, photoUrl }
 *   onSubmit(payload) – async fn called with FormData or plain object; should return resolved promise on success
 *   onCancel()     – called when user cancels (parent decides navigation)
 *   isEditing      – bool; true = "Guardar cambios" + "Cancelar", false = "Guardar perfil" + cancel ghost btn
 *   pageTitle      – string
 *   pageSubtitle   – string
 *   pageBadge      – optional badge string shown above title
 */
export default function ProfileForm({
  initialValues = {},
  onSubmit,
  onCancel,
  isEditing = false,
  pageTitle,
  pageSubtitle,
  pageBadge,
}) {
  const originalValues = useRef({ ...initialValues });

  const [form, setForm] = useState({
    businessName: initialValues.businessName || '',
    description: initialValues.description || '',
    contactInfo: initialValues.contactInfo || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  // photoPreview holds either a blob URL (new selection) or the existing saved URL
  const [photoPreview, setPhotoPreview] = useState(initialValues.photoUrl || null);
  // isNewBlob tracks whether photoPreview is a revocable blob URL
  const isNewBlob = useRef(false);
  const [photoError, setPhotoError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(!!(initialValues.contactInfo));

  // When parent loads data asynchronously, re-initialize
  useEffect(() => {
    const { businessName = '', description = '', contactInfo = '', photoUrl = null } = initialValues;
    originalValues.current = { businessName, description, contactInfo, photoUrl };
    setForm({ businessName, description, contactInfo });
    if (!isNewBlob.current) {
      setPhotoPreview(photoUrl);
    }
    if (contactInfo) setContactOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.businessName, initialValues.description, initialValues.contactInfo, initialValues.photoUrl]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (isNewBlob.current && photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handlePhotoSelect = useCallback((file, err) => {
    setPhotoError(err || '');
    if (!file) return;
    if (isNewBlob.current && photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    isNewBlob.current = true;
  }, [photoPreview]);

  const handlePhotoRemove = () => {
    if (isNewBlob.current && photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError('');
    isNewBlob.current = false;
  };

  const validateName = (value) => {
    if (!value.trim()) {
      setNameError('El nombre del emprendimiento es obligatorio.');
      return false;
    }
    if (value.trim().length < 3) {
      setNameError('El nombre del emprendimiento debe tener entre 3 y 100 caracteres.');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateName(form.businessName)) return;

    setIsLoading(true);
    try {
      let payload;
      if (photoFile) {
        payload = new FormData();
        payload.append('businessName', form.businessName.trim());
        payload.append('description', form.description.trim());
        payload.append('contactInfo', form.contactInfo.trim());
        payload.append('photo', photoFile);
      } else {
        payload = {
          businessName: form.businessName.trim(),
          description: form.description.trim(),
          contactInfo: form.contactInfo.trim(),
        };
      }
      await onSubmit(payload);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      // CA-03: Reset to original values, no API call
      const orig = originalValues.current;
      setForm({
        businessName: orig.businessName || '',
        description: orig.description || '',
        contactInfo: orig.contactInfo || '',
      });
      if (isNewBlob.current && photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoFile(null);
      setPhotoPreview(orig.photoUrl || null);
      isNewBlob.current = false;
      setNameError('');
      setPhotoError('');
    }
    onCancel();
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8 animate-in">
        {pageBadge && (
          <p className="text-xs font-mono uppercase tracking-widest text-[#990100] mb-2">
            {pageBadge}
          </p>
        )}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A] leading-tight">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="text-[#999999] mt-2 text-sm">{pageSubtitle}</p>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

        {/* ── LEFT: Form ── */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6 animate-in delay-1">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Business name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#666666]">
                  Nombre del emprendimiento <span className="text-[#990100]">*</span>
                </label>
                <span className={`text-xs font-mono ${form.businessName.length > 90 ? 'text-[#990100]' : 'text-[#CCCCCC]'}`}>
                  {form.businessName.length}/100
                </span>
              </div>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => {
                  setForm((p) => ({ ...p, businessName: e.target.value }));
                  if (nameError) validateName(e.target.value);
                }}
                onBlur={(e) => validateName(e.target.value)}
                maxLength={100}
                placeholder="Ej: Delicias Uni, TechUAO, ArtesaníasCo…"
                className={`
                  w-full px-4 py-3 rounded-xl text-sm
                  bg-white text-[#1A1A1A]
                  border-[1.5px] ${nameError ? 'border-[#990100] bg-[rgba(153,1,0,0.04)]' : 'border-[#E8E8E8]'}
                  placeholder:text-[#999999]
                  hover:border-[#CCCCCC]
                  focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
                  transition-all duration-200
                `}
              />
              {nameError && (
                <p className="mt-1.5 text-sm text-[#990100] flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {nameError}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#666666]">Descripción</label>
                <span className={`text-xs font-mono ${form.description.length > 450 ? 'text-[#990100]' : 'text-[#CCCCCC]'}`}>
                  {form.description.length}/500
                </span>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                maxLength={500}
                placeholder="Cuéntanos qué vendes, cuál es tu historia, qué te hace diferente…"
                className="
                  w-full px-4 py-3 rounded-xl text-sm resize-none
                  bg-white text-[#1A1A1A]
                  border-[1.5px] border-[#E8E8E8]
                  placeholder:text-[#999999]
                  hover:border-[#CCCCCC]
                  focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
                  transition-all duration-200
                "
              />
            </div>

            {/* Photo upload zone */}
            <PhotoUploadZone
              preview={photoPreview}
              onFile={handlePhotoSelect}
              error={photoError}
              onRemove={handlePhotoRemove}
            />

            {/* Contact — collapsible */}
            <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setContactOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#666666] hover:bg-[#F6F6F6] transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#999999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Datos de contacto
                  <span className="text-xs text-[#999999] font-normal">(opcional)</span>
                </span>
                <svg
                  className={`w-4 h-4 text-[#999999] transition-transform duration-200 ${contactOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {contactOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-[#E8E8E8] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#999999] w-20 shrink-0">Contacto</span>
                    <input
                      type="text"
                      value={form.contactInfo}
                      onChange={(e) => setForm((p) => ({ ...p, contactInfo: e.target.value }))}
                      maxLength={200}
                      placeholder="+57 300 000 0000 · Instagram · email…"
                      className="
                        flex-1 px-3 py-2 rounded-lg text-sm
                        bg-[#F6F6F6] text-[#1A1A1A]
                        border border-[#E8E8E8]
                        placeholder:text-[#CCCCCC]
                        focus:outline-none focus:border-[#990100] focus:ring-[2px] focus:ring-[rgba(153,1,0,0.08)]
                        transition-all duration-200
                      "
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  flex-1 inline-flex items-center justify-center gap-2
                  px-6 py-3 text-sm font-semibold text-white
                  bg-[#990100]
                  hover:bg-[#B90504] hover:-translate-y-0.5
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                  shadow-[0_4px_15px_rgba(153,1,0,0.25)]
                  hover:shadow-[0_4px_25px_rgba(185,5,4,0.40)]
                  transition-all duration-200
                `}
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)' }}
              >
                {isLoading ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white/30"
                      style={{ borderTopColor: 'white', animation: 'spin 0.6s linear infinite' }}
                    />
                    Guardando…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {isEditing ? 'Guardar cambios' : 'Guardar perfil'}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="
                  px-5 py-3 text-sm font-medium text-[#333333]
                  border border-[#333333] rounded-xl
                  hover:border-[#990100] hover:text-[#990100]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Live preview ── */}
        <div className="animate-in delay-2 sticky top-24">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#999999] mb-2">
            Vista previa
          </p>
          <LivePreviewCard
            name={form.businessName}
            description={form.description}
            photo={photoPreview}
            contactInfo={form.contactInfo}
          />

          {/* Tips */}
          <div className="mt-4 bg-[rgba(153,1,0,0.04)] border border-[rgba(153,1,0,0.15)] rounded-xl p-4 space-y-2">
            <p className="text-xs font-mono font-semibold text-[#990100] uppercase tracking-wider">
              Consejos
            </p>
            {[
              'Usa una foto profesional o tu logo',
              'Describe qué vendes en las primeras palabras',
              'Agrega tu WhatsApp para recibir más pedidos',
            ].map((tip) => (
              <p key={tip} className="text-xs text-[#666666] flex items-start gap-1.5">
                <span className="text-[#990100] mt-0.5">▸</span>
                {tip}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
