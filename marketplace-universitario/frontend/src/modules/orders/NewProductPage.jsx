import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export default function NewProductPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '' });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data.data));
  }, []);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es requerido.';
    if (!form.description.trim()) errs.description = 'La descripción es requerida.';
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) errs.price = 'Precio válido requerido.';
    if (!form.categoryId) errs.categoryId = 'Selecciona una categoría.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.slice(0, 5).forEach((f) => formData.append('images', f));

      await api.post('/products', formData);
      addToast('Producto publicado exitosamente.', 'success');
      navigate('/my-products');
    } catch (err) {
      if (err.validationErrors) {
        const fe = {};
        err.validationErrors.forEach(({ field, message }) => { fe[field] = message; });
        setErrors(fe);
      } else {
        addToast(err.userMessage || 'Error al publicar producto.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Publicar producto</h1>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Nombre del producto" name="name" value={form.name} onChange={handleChange} placeholder="Ej: Brownies caseros" required error={errors.name} />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Descripción <span className="text-red-500">*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} maxLength={1000}
                placeholder="Describe tu producto en detalle…"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            </div>
            <Input label="Precio (COP)" name="price" type="number" min="1" step="100" value={form.price} onChange={handleChange} placeholder="25000" required error={errors.price} />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Categoría <span className="text-red-500">*</span></label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none ${errors.categoryId ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                <option value="">Seleccionar categoría…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-red-600 mt-1">{errors.categoryId}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Imágenes (máx. 5)</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
              {images.length > 0 && <p className="text-xs text-gray-500 mt-1">{images.length} imagen(es) seleccionada(s)</p>}
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>Publicar producto</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
