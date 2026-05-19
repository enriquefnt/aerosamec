- [x] Agregar estado `isSubmitting` en `src/screens/MedicacionScreen.tsx`
- [x] Bloquear doble envío al inicio de `submitMedicacion`
- [x] Implementar `try/catch/finally` en guardado para restaurar estado
- [x] Deshabilitar botón y mostrar texto `Guardando...`
- [x] Agregar estilo `buttonDisabled`
- [x] Actualizar TODO marcando tareas completadas

- [x] Agregar estado `isSubmitting` en `src/screens/SignosVitalesScreen.tsx`
- [x] Bloquear doble envío al inicio de `submitSignos`
- [x] Implementar `try/catch/finally` en guardado para restaurar estado
- [x] Deshabilitar botón y mostrar texto `Guardando...`
- [x] Agregar estilo `buttonDisabled`
- [x] Actualizar TODO marcando tareas completadas

- [ ] Revisar `src/screens/SeguimientoScreen.tsx` para evitar side-effects durante render/update
- [ ] Separar `setTrasladoId` de `onTrasladoChange` (evitar callback dentro de updater)
- [ ] Agregar `useEffect` para propagar selección (`trasladoId` -> `onTrasladoChange`)
- [ ] Mantener autoselección de traslado único sin disparar updates cruzados en render
- [ ] Probar con `npx expo start` y verificar que desaparezca el warning de React
- [ ] Actualizar TODO marcando tareas completadas

- [x] Extender tipo `TrasladoOperario` para incluir `hospitalOrigen.nombre`
- [x] Mostrar en lista de traslados: nombre, hospital origen, número y fecha/hora de salida
- [x] Inhabilitar botones de carga de seguimiento si no hay traslado seleccionado
- [x] Aplicar estilo visual para botón deshabilitado y guard clause en `onPress`
- [ ] Probar escenarios: sin traslados, varios sin seleccionar, traslado seleccionado
- [ ] Actualizar TODO marcando tareas completadas
