# Planificador — Sistema de planificación diaria

## Setup completo (20 minutos, una sola vez)

### Paso 1: Crear base de datos en Supabase (GRATIS)
1. Ve a **https://supabase.com** → crea cuenta
2. Click **"New Project"** → nombre: `planificador` → elige una contraseña → Create
3. Espera ~2 minutos a que se cree
4. Ve a **SQL Editor** (menú izquierdo)
5. Pega el contenido de `supabase-setup.sql` → click **"Run"**
6. Ve a **Settings → API** → copia tu:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public key** (la larga que empieza con `eyJ...`)

### Paso 2: Subir código a GitHub
1. Ve a **https://github.com** → crea cuenta si no tienes
2. Click **"New repository"** → nombre: `planificador` → Create
3. Sube todos los archivos de esta carpeta al repositorio

### Paso 3: Deploy en Vercel (GRATIS)
1. Ve a **https://vercel.com** → regístrate con GitHub
2. Click **"New Project"** → selecciona tu repo `planificador`
3. Framework: **Vite**
4. **IMPORTANTE** → Expande "Environment Variables" y agrega:
   - `VITE_SUPABASE_URL` = tu Project URL
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
5. Click **Deploy**

### Paso 4: Instalar en tu teléfono
**Android (Chrome):**
- Abre tu URL de Vercel → Menú ⋮ → "Añadir a pantalla de inicio"

**iPhone (Safari):**
- Abre tu URL de Vercel → Botón compartir ↑ → "Añadir a pantalla de inicio"

**Computadora (Chrome):**
- Icono de instalar aparece en la barra de URL

---

## ¿Cómo funcionan los datos?
- **Supabase** (nube) = base de datos principal, segura, con respaldo automático
- **localStorage** (respaldo) = si Supabase falla, guarda local temporalmente
- Los datos se sincronizan entre teléfono y computadora automáticamente
- Supabase hace respaldos automáticos diarios

## Costo
- **Supabase**: GRATIS (hasta 500MB)
- **Vercel**: GRATIS (uso personal)
- **Total: $0/mes**

## Stack
- React 18 + Vite
- Supabase (PostgreSQL)
- PWA con vite-plugin-pwa
