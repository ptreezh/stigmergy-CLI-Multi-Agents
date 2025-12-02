# 🔧 Stigmergy CLI - Sistema de Colaboración de Herramientas CLI de IA Multi-Agentes

> **⚠️ Aclaración Importante: ¡Esta no es una herramienta CLI independiente, sino un sistema de mejora!**
>
> Stigmergy CLI permite que las herramientas CLI de IA existentes colaboren entre sí a través de un sistema de complementos, en lugar de reemplazarlas.

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-cli-blue.svg)](https://www.npmjs.com/package/stigmergy-cli)
[![Licencia](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Plataforma](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## 🚀 Inicio Rápido

### Despliegue con Un Solo Clic (Recomendado)

```bash
# Despliegue con un solo clic del sistema completo de colaboración (detección + instalación + configuración)
npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy
```

O, si ya ha instalado stigmergy-cli globalmente:

```bash
# Ejecutar a través de la CLI instalada
npx stigmergy-cli quick-deploy
```

### Instalación Manual

```bash
# Instalar globalmente mediante NPM
npm install -g stigmergy-cli

# Inicializar proyecto
stigmergy-cli init

# Despliegue inteligente (escanear entorno + preguntar + instalación automática)
stigmergy-cli deploy

# O usar npx (sin necesidad de instalación)
npx stigmergy-cli init
npx stigmergy-cli deploy
```

## ✨ Características Principales

### 🎯 Colaboración Directa entre CLI
- **Invocación por Lenguaje Natural**: Invocar directamente otras herramientas de IA en cualquier CLI compatible
- **Integración Fluida**: No cambia el uso existente de las herramientas CLI
- **Enrutamiento Inteligente**: Identifica automáticamente la intención de colaboración y delega a la herramienta adecuada

### 📋 Herramientas CLI Soportadas

#### Herramientas Principales (Requeridas)
- **Claude CLI** - Herramienta CLI de Anthropic Claude
- **Gemini CLI** - Herramienta CLI de Google Gemini

#### Herramientas Extendidas (Opcionales)
- **QwenCode CLI** - Herramienta CLI de Alibaba Cloud QwenCode
- **iFlow CLI** - Herramienta CLI de flujo de trabajo iFlow
- **Qoder CLI** - Herramienta CLI de generación de código Qoder
- **CodeBuddy CLI** - Herramienta CLI de asistente de programación CodeBuddy
- **GitHub Copilot CLI** - Herramienta CLI de GitHub Copilot
- **Codex CLI** - Herramienta CLI de análisis de código OpenAI Codex

### 🧩 Sistema de Despliegue Inteligente

```bash
# Despliegue inteligente (recomendado)
stigmergy-cli deploy

# Ejemplo de salida:
🔍 Escaneando estado de herramientas CLI del sistema...

  🔴 ❌ Claude CLI           | CLI: No instalado | Integración: No instalada
  🟢 ✅ Gemini CLI          | CLI: Disponible | Integración: Instalada
  🔴 ❌ QwenCode CLI       | CLI: No instalado | Integración: No instalada

📋 Se detectaron las siguientes herramientas no instaladas:

🔴 Herramientas CLI no instaladas:
  - Claude CLI (requerida) - Herramienta CLI de Anthropic Claude
  - QwenCode CLI (opcional) - Herramienta CLI de Alibaba Cloud QwenCode

¿Desea intentar instalar automáticamente 2 herramientas CLI? (Y/n): Y
```

## 🎯 Ejemplos de Colaboración entre CLI

Después de la instalación, puede invocar directamente otras herramientas en cualquier CLI compatible:

### En Claude CLI
```bash
# Invocar otras herramientas de IA
Por favor, usa gemini para ayudarme a traducir este código
Llama a qwen para analizar este requisito
Usa iflow para crear un flujo de trabajo
Haz que qoder genere código Python
Inicia el asistente codebuddy
```

### En Gemini CLI
```bash
# Colaboración entre herramientas
Usa claude para verificar la calidad del código
Deja que qwen me ayude a escribir documentación
Usa copilot para generar fragmentos de código
```

## 🛠️ Lista Completa de Comandos

```bash
# Comandos básicos
stigmergy-cli init          # Inicializar proyecto
stigmergy-cli status        # Ver estado
stigmergy-cli scan          # Escanear entorno

# Comandos de despliegue
stigmergy-cli deploy        # Despliegue inteligente (por defecto)
stigmergy-cli deploy-all    # Despliegue completo

# Gestión de proyectos
stigmergy-cli check-project # Verificar proyecto
stigmergy-cli validate      # Validar configuración
stigmergy-cli clean         # Limpiar entorno

# Comandos de desarrollo
npm run build              # Construir proyecto
npm run publish-to-npm     # Publicar en NPM
npm run test               # Ejecutar pruebas
```

## 📁 Estructura del Proyecto

```
stigmergy-CLI-Multi-Agents/
├── package.json          # Configuración del paquete NPM
├── src/
│   ├── main.js          # Archivo de entrada principal
│   ├── deploy.js        # Script de despliegue inteligente
│   ├── adapters/        # Adaptadores CLI
│   │   ├── claude/
│   │   ├── gemini/
│   │   ├── qwencode/
│   │   └── ...
│   └── core/            # Módulos principales
├── adapters/            # Scripts de instalación CLI
│   ├── claude/install_claude_integration.py
│   ├── gemini/install_gemini_integration.py
│   └── ...
└── templates/           # Plantillas de configuración
```

## 🔧 Instalación Automática de Herramientas CLI

El script de despliegue inteligente admite la instalación automática de todas las herramientas CLI:

### Herramientas Principales
```bash
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
```

### Herramientas Extendidas
```bash
npm install -g @qwen-code/qwen-code@latest
npm install -g @iflow-ai/iflow-cli@latest
npm install -g @qoder-ai/qodercli
npm install -g @tencent-ai/codebuddy-code
npm install -g @github/copilot
npm i -g @openai/codex --registry=https://registry.npmmirror.com
```

## 🎯 Casos de Uso

### Escenario 1: Entorno de Desarrollador Individual
```bash
# Configuración rápida para nuevo entorno de desarrollo
git clone my-project
cd my-project
stigmergy-cli deploy

# Ahora puede colaborar entre herramientas en cualquier CLI
claude-cli "Por favor, usa gemini para ayudarme a optimizar el rendimiento de este código"
```

### Escenario 2: Colaboración en Equipo
```bash
# Configuración de proyecto compartida por equipo
git clone team-project
cd team-project
stigmergy-cli init

# Todos los miembros del equipo usan el mismo contexto de colaboración
gemini-cli "Usa claude para verificar los patrones de diseño de este módulo"
```

### Escenario 3: Desarrollo Multi-Lenguaje
```bash
# Complementando especializaciones de diferentes herramientas de IA
qwen-cli "Usa copilot para generar componentes front-end"
iflow-cli "Haz que gemini cree documentación API"
```

## 🔧 Configuración del Entorno de Desarrollo

```bash
# Clonar proyecto
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# Instalar dependencias
npm install

# Ejecutar en modo de desarrollo
npm run start
npm run status
npm run scan

# Construir y publicar
npm run build
npm run publish-to-npm
```

## 🚀 Publicación de Nuevas Versiones

```bash
# Actualizar número de versión
npm version patch    # Versión de parche
npm version minor    # Versión menor
npm version major    # Versión mayor

# Publicar en NPM
npm run publish-to-npm

# Verificar publicación
npx stigmergy-cli --version
```

## 🛠️ Solución de Problemas

### Problemas Comunes

1. **Versión de Node.js incompatible**
   ```bash
   # Asegurarse de usar Node.js 16+
   node --version
   ```

2. **Errores de permisos**
   ```bash
   # Usar privilegios de administrador
   sudo npm install -g stigmergy-cli
   ```

3. **Problemas de conexión de red**
   ```bash
   # Establecer espejo NPM
   npm config set registry https://registry.npmmirror.com
   ```

4. **Fallo en la instalación de herramientas CLI**
   ```bash
   # Instalar herramienta específica manualmente
   npm install -g @anthropic-ai/claude-code
   ```

### Modo de Depuración

```bash
# Salida detallada de depuración
DEBUG=stigmergy:* stigmergy-cli deploy

# Solo escaneo de estado
stigmergy-cli scan
```

## 📚 Más Información

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **NPM**: https://www.npmjs.com/package/stigmergy-cli
- **Documentación**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
- **Feedback de Problemas**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues

## 🤝 Contribuciones

¡Se aceptan Pull Requests e Issues!

1. Hacer fork del proyecto
2. Crear una rama de función (`git checkout -b feature/AmazingFeature`)
3. Confirmar cambios (`git commit -m 'Add some AmazingFeature'`)
4. Subir a la rama (`git push origin feature/AmazingFeature`)
5. Abrir una Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**🎯 Stigmergy CLI - Verdadera colaboración entre CLI, ¡permitiendo que cada herramienta de IA maximice su valor!