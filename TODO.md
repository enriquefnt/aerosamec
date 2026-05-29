# TODO - Asignación de personal por ID (médico/enfermero)

- [x] Analizar flujo actual de asignación y filtro de operario.
- [x] Actualizar `prisma/schema.prisma` para guardar `medicoUsuarioId` y `enfermeroUsuarioId` en `Traslado`.
- [x] Actualizar API `src/app/api/traslados/equipo/route.ts` para recibir/guardar IDs y nombres.
- [x] Actualizar UI `src/app/dashboard/traslados/page.tsx` para enviar IDs reales en la asignación.
- [x] Actualizar API `src/app/api/traslados/operario/route.ts` para filtrar por `userId` (no por nombre).
- [x] Ajustar fallback robusto en `src/app/api/traslados/operario/route.ts` para contemplar función no estándar.
- [x] Agregar logs temporales de diagnóstico en `/api/traslados/operario`.
- [ ] Crear script SQL de backfill para completar IDs desde nombres existentes.
- [x] Validar build (`npm run build`).
- [x] Ajustar `/api/traslados/operario` para mostrar asignados sin filtrar por estado.
- [ ] Validar critical-path:
  - [x] Asignar médico/enfermero desde UI.
  - [ ] Login médico: ve traslados por `medicoUsuarioId` en cualquier estado.
  - [ ] Login enfermero: ve traslados por `enfermeroUsuarioId` en cualquier estado.
