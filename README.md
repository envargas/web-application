# Marmota

Sitio personal sobre Marmota, desarrollado en React y Vite.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre la dirección que indique Vite (normalmente `http://localhost:5173`).

## Libro de visitas

El formulario pide tres datos: nombre, nombre/descripción de la mascota y mensaje para Marmota.

**Sin configuración adicional:** funciona en **modo de prueba local**. Los mensajes se guardan en `localStorage` y solo aparecen en ese navegador. Se indica claramente en la interfaz; **no son comentarios públicos**.

**Para activar los comentarios compartidos** (Supabase):

1. Crea un proyecto de Supabase y abre **SQL Editor**.
2. Ejecuta el contenido de `supabase/comentarios.sql`.
3. Copia `.env.example` a `.env.local`.
4. Rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con los valores de **Project Settings > API** de Supabase. También se acepta una clave pública `anon` antigua en `VITE_SUPABASE_ANON_KEY`.
5. Reinicia `npm run dev`. Ahora los mensajes se obtienen y guardan mediante la API de Supabase.
6. Para el sitio en Vercel, configura esas **mismas variables públicas** en **Project Settings > Environment Variables** y vuelve a desplegar.

**Seguridad y moderación:** el SQL habilita RLS. Los visitantes solo pueden ver mensajes visibles e insertar otros; no pueden modificarlos ni eliminarlos. Para ocultar un mensaje, cambia el valor `visible` desde Supabase. El formulario incluye validación y un campo trampa para bots sencillos, pero **antes de anunciarlo como libro de visitas público conviene habilitar CAPTCHA y límites de envío** para reducir spam. Nunca uses `service_role` ni claves `sb_secret_...` en variables `VITE_`: quedan expuestas al navegador.

## Notas de mantenimiento

- `src/App.jsx`: contenido y secciones.
- `src/App.css`: estilos generales.
- `src/components/Comentarios.jsx`: formulario, lectura de mensajes y vista previa.
- `src/components/Comentarios.css`: estilos del libro de visitas.
- `supabase/comentarios.sql`: tabla y políticas RLS.

Los archivos personales (fotos adicionales y datos locales) que todavía no estén subidos al repositorio deben respaldarse antes de reemplazar ramas o trabajar en otra máquina.
