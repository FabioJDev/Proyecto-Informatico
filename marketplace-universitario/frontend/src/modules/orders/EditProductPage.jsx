import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', status: 'ACTIVE' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${id}`),
      api.get('/products/categories'),
    ]).then(([productRes, catRes]) => {
      const p = productRes.data.data;
      setForm({ name: p.name, description: p.description, price: String(p.price), categoryId: p.categoryId, status: p.status });
      setCategories(catRes.data.data);
    }).finally(() => setIsFetching(false));
  }, [id]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put(`/products/${id}`, form);
      addToast('Producto actualizado.', 'success');
      navigate('/my-products');
    } catch (err) {
      addToast(err.userMessage || 'Error al actualizar.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar producto</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Nombre" name="name" value={form.name} onChange={handleChange} required />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Descripción</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
            </div>
            <Input label="Precio (COP)" name="price" type="number" min="1" value={form.price} onChange={handleChange} required />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Categoría</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Estado</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>Guardar cambios</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
