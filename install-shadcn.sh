#!/bin/bash

# Instalar las dependencias necesarias para Shadcn UI
npm install clsx tailwind-merge tailwindcss-animate class-variance-authority

# Instalar la CLI de Shadcn UI como una dependencia de desarrollo
npm install -D @shadcn/ui

# Crea la carpeta de componentes si no existe
mkdir -p src/components/ui

# Mensaje final
echo "¡Configuración completada!"
echo "Ahora puedes instalar componentes individuales con:"
echo "npx shadcn-ui add button"
echo "npx shadcn-ui add card"
echo "npx shadcn-ui add etc..."
