import { useState } from 'react';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useCreateEmployee } from '../hooks/useHr';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'ON_LEAVE', label: 'Con permiso' },
  { value: 'SUSPENDED', label: 'Suspendido' },
];

const EMPTY = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  hireDate: '',
  departmentId: '',
  status: 'ACTIVE',
};

export default function EmployeeFormModal({ open, onClose, organizationId, departments = [] }) {
  const { handleError } = useApiError();
  const { toast } = useToast();
  const createMutation = useCreateEmployee();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.employeeCode.trim()) errs.employeeCode = 'Requerido';
    if (!form.firstName.trim()) errs.firstName = 'Requerido';
    if (!form.lastName.trim()) errs.lastName = 'Requerido';
    if (!form.hireDate) errs.hireDate = 'Requerido';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await createMutation.mutateAsync({
        organizationId,
        employeeCode: form.employeeCode.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        hireDate: form.hireDate,
        departmentId: form.departmentId || undefined,
        status: form.status,
      });
      toast.success(`Empleado "${form.firstName} ${form.lastName}" creado`);
      setForm(EMPTY);
      setErrors({});
      onClose();
    } catch (err) {
      handleError(err);
    }
  }

  function handleClose() {
    setForm(EMPTY);
    setErrors({});
    onClose();
  }

  const deptOptions = departments.map((d) => ({ value: d.id, label: d.name }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nuevo empleado"
      description="Ingresa los datos del colaborador para agregarlo al directorio"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="employee-form"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Guardando…' : 'Guardar empleado'}
          </Button>
        </div>
      }
    >
      <form id="employee-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Código de empleado"
            value={form.employeeCode}
            onChange={(e) => set('employeeCode', e.target.value)}
            error={errors.employeeCode}
            placeholder="EMP-001"
            required
          />
          <Select
            label="Estado"
            value={form.status}
            onValueChange={(v) => set('status', v)}
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre(s)"
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            error={errors.firstName}
            required
          />
          <Input
            label="Apellido(s)"
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Correo electrónico"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="nombre@empresa.com"
          />
          <Input
            label="Teléfono"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+52 55 0000 0000"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Fecha de ingreso"
            type="date"
            value={form.hireDate}
            onChange={(e) => set('hireDate', e.target.value)}
            error={errors.hireDate}
            required
          />
          {deptOptions.length > 0 && (
            <Select
              label="Departamento"
              value={form.departmentId}
              onValueChange={(v) => set('departmentId', v)}
              options={deptOptions}
              placeholder="Sin departamento"
            />
          )}
        </div>
      </form>
    </Modal>
  );
}
