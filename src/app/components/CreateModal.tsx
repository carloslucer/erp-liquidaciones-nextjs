import { useState } from 'react';
import type { CreateModalProps, ProductoForm } from './types';

export default function CreateModal({ onCreate }: CreateModalProps) {
  const [form, setForm] = useState<ProductoForm>({ nombre: '', cantidad: '', precio: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate({ ...form, cantidad: +form.cantidad, precio: +form.precio });
    // Cerrar modal manualmente
    const modalEl = document.getElementById('createModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    setForm({ nombre: '', cantidad: '', precio: '' });
  };

  return (
    <div className="modal fade shadow-md sm:rounded-lg" id="createModal" tabIndex={-1}>
      <div className="modal-dialog ">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Nuevo Producto</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">
            <input
              name="nombre"
              className="form-control mb-2"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <input
              name="cantidad"
              type="number"
              className="form-control mb-2"
              placeholder="Cantidad"
              value={form.cantidad}
              onChange={handleChange}
              required
            />
            <input
              name="precio"
              type="number"
              className="form-control mb-2"
              placeholder="Precio"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" className="btn btn-primary">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}
