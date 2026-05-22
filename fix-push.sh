#!/bin/bash
# Ejecutar en Git Bash: bash fix-push.sh

cd "$(dirname "$0")"

echo "📁 Directorio: $(pwd)"
echo ""

# 1. Eliminar lock file
if [ -f ".git/index.lock" ]; then
  echo "🔓 Eliminando index.lock..."
  rm -f .git/index.lock
  echo "   ✓ Lock eliminado"
else
  echo "   ℹ️  No hay lock file"
fi

# 2. Verificar estado
echo ""
echo "📋 Estado actual:"
git status --short

# 3. Stagear archivos modificados
echo ""
echo "➕ Stageando archivos..."
git add src/app/api/gastos/route.ts
git add src/app/api/inventario/route.ts
git add src/app/api/obras/route.ts
git add src/app/api/tareas/route.ts
git add src/app/api/prospectos/route.ts
git add src/app/inventario/NuevoMaterialBtn.tsx
git add src/app/prospectos/NuevoProspectoBtn.tsx

# 4. Verificar qué va a entrar
echo ""
echo "📦 Archivos listos para commit:"
git diff --cached --stat

# 5. Commit
echo ""
echo "💾 Haciendo commit..."
git commit -m "fix: columnas reales en todos los API routes + prospectos con fallback Supabase"

# 6. Push
echo ""
echo "🚀 Haciendo push..."
git push origin main

echo ""
echo "✅ LISTO — Ve a EasyPanel y presiona Implementar para redesplegar."
