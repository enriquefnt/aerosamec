# TODO - Reporte individual de traslados (vista imprimible legal + PDF nativo)

- [x] Ajustar permisos/filtrado en API de traslados por rol:
  - [x] COORDINADOR/ADMIN ven todos
  - [x] OPERARIO ve solo traslados asignados (`usuarioAsignadoId`)
- [x] Crear endpoint de reporte individual:
  - [x] `GET /api/traslados/[id]/reporte`
  - [x] HTML con estilos de impresión legal (`@page size: legal`)
  - [x] Botón para imprimir/guardar PDF desde navegador
- [x] Actualizar listado de traslados en frontend:
  - [x] Agregar icono/botón para abrir reporte individual en nueva pestaña
  - [x] Habilitar acceso de OPERARIO en la página de traslados
- [ ] Verificación final de consistencia

## Ajuste visual del informe (compacto tipo formulario papel)
- [ ] Rediseñar layout a 3 columnas y estilo más compacto
- [ ] Unificar registros clínicos en una sola tabla cronológica
- [ ] Mantener epicrisis integrada al final del informe
