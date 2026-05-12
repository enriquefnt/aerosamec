# TODO - Corrección endpoint `/api/traslados/operario` + testing thorough

- [x] Revisar y ajustar extracción de `operarioId/userId` para GET y POST en `src/app/api/traslados/operario/route.ts`
- [x] Implementar normalización/validación de identificador y respuestas 400/500 consistentes
- [x] Unificar lógica de filtrado de traslados para evitar duplicación entre métodos
- [x] Soportar `POST /api/traslados/operario` además de `GET`
- [ ] Ejecutar pruebas curl (thorough):
  - [ ] GET con `operarioId`
  - [ ] GET con `userId`
  - [ ] POST con `operarioId`
  - [ ] POST con `userId`
  - [ ] Faltante de ID => 400
  - [ ] ID vacío/inválido => 400
- [ ] Documentar resultados finales de testing
