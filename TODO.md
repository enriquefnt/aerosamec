# TODO - Seguimiento de traslados

- [x] Revisar modelo Prisma y flujo actual de seguimiento/traslados (DB + API + formulario).
- [ ] Agregar en DB el campo de texto libre obligatorio `diagnosticosIniciales` en seguimiento.
- [ ] Agregar en DB los campos de valoración inicial:
  - [ ] viaAerea
  - [ ] respiracion
  - [ ] hemodinamia
  - [ ] neurologico
- [ ] Crear endpoint nuevo `POST /api/seguimientos/valoracion-inicial`.
- [ ] Actualizar endpoint de operario para incluir `seguimientos`.
- [ ] Actualizar formulario de seguimiento:
  - [ ] Campo texto libre obligatorio "Diagnósticos"
  - [ ] Select obligatorio "Vía Aérea"
  - [ ] Select obligatorio "Respiración"
  - [ ] Select obligatorio "Hemodinamia"
  - [ ] Select obligatorio "Neurológico"
- [ ] Mostrar en grilla una fila "Valoración inicial" con resumen de 5 campos.
- [ ] Validar obligatoriedad en frontend y backend.
- [ ] Probar flujo crítico (guardar/consultar valoración inicial).
