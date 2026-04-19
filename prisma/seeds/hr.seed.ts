import { PrismaClient } from '@prisma/client';

export async function seedHr(prisma: PrismaClient, organizationId: string) {
  const departments = [
    { name: 'Administración', description: 'Gestión administrativa y financiera' },
    { name: 'Ventas', description: 'Equipo comercial y atención a clientes' },
    { name: 'Operaciones', description: 'Logística y operaciones diarias' },
    { name: 'Tecnología', description: 'Desarrollo y soporte de sistemas' },
    { name: 'Recursos Humanos', description: 'Gestión del capital humano' },
  ];

  const createdDepts: Record<string, string> = {};

  for (const dept of departments) {
    const existing = await prisma.department.findFirst({
      where: { organizationId, name: dept.name },
    });
    const created =
      existing ??
      (await prisma.department.create({
        data: { organizationId, ...dept },
      }));
    createdDepts[dept.name] = created.id;
  }

  const positions = [
    { department: 'Administración', name: 'Director General' },
    { department: 'Administración', name: 'Contador' },
    { department: 'Ventas', name: 'Gerente de Ventas' },
    { department: 'Ventas', name: 'Ejecutivo de Ventas' },
    { department: 'Operaciones', name: 'Coordinador de Operaciones' },
    { department: 'Tecnología', name: 'Desarrollador Senior' },
    { department: 'Tecnología', name: 'Desarrollador Junior' },
    { department: 'Recursos Humanos', name: 'Gerente de RH' },
  ];

  const createdPositions: Record<string, string> = {};

  for (const pos of positions) {
    const departmentId = createdDepts[pos.department];
    const existing = await prisma.position.findFirst({
      where: { organizationId, departmentId, name: pos.name },
    });
    const created =
      existing ??
      (await prisma.position.create({
        data: { organizationId, departmentId, name: pos.name },
      }));
    createdPositions[pos.name] = created.id;
  }

  const employees = [
    {
      employeeCode: 'EMP-001',
      firstName: 'Carlos',
      lastName: 'García López',
      email: 'carlos.garcia@demo.com',
      hireDate: new Date('2020-01-15'),
      department: 'Administración',
      position: 'Director General',
      rfc: 'GALC800115ABC',
    },
    {
      employeeCode: 'EMP-002',
      firstName: 'María',
      lastName: 'Hernández Ruiz',
      email: 'maria.hernandez@demo.com',
      hireDate: new Date('2021-03-01'),
      department: 'Ventas',
      position: 'Gerente de Ventas',
      rfc: 'HERM910301XYZ',
    },
    {
      employeeCode: 'EMP-003',
      firstName: 'Juan',
      lastName: 'Martínez Torres',
      email: 'juan.martinez@demo.com',
      hireDate: new Date('2022-06-15'),
      department: 'Tecnología',
      position: 'Desarrollador Senior',
      rfc: 'MATJ850615DEF',
    },
  ];

  for (const emp of employees) {
    const existing = await prisma.employee.findFirst({
      where: { organizationId, employeeCode: emp.employeeCode },
    });
    if (!existing) {
      const created = await prisma.employee.create({
        data: {
          organizationId,
          employeeCode: emp.employeeCode,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          hireDate: emp.hireDate,
          departmentId: createdDepts[emp.department],
          positionId: createdPositions[emp.position],
          rfc: emp.rfc,
        },
      });

      await prisma.contract.create({
        data: {
          organizationId,
          employeeId: created.id,
          contractType: 'PERMANENT',
          baseSalary: 25000,
          startDate: emp.hireDate,
        },
      });

      await prisma.leaveBalance.create({
        data: {
          organizationId,
          employeeId: created.id,
          leaveType: 'VACATION',
          year: 2026,
          totalDays: 12,
          usedDays: 0,
        },
      });
    }
  }
}
