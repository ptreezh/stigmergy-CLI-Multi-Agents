# 🔧 Stigmergy CLI - Multi-Agents KI CLI Tool Zusammenarbeitssystem

> **⚠️ Wichtige Klärung: Dies ist kein eigenständiges CLI-Tool, sondern ein Verbesserungssystem!**
>
> Stigmergy CLI ermöglicht es vorhandenen KI CLI-Tools durch ein Plugin-System zusammenzuarbeiten, anstatt sie zu ersetzen.

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-cli-blue.svg)](https://www.npmjs.com/package/stigmergy-cli)
[![Lizenz](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Plattform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## 🚀 Schnellstart

### Ein-Klick-Bereitstellung (Empfohlen)

```bash
# Ein-Klick-Bereitstellung des vollständigen Zusammenarbeitssystems (Erkennung + Installation + Konfiguration)
npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy
```

Oder, wenn Sie stigmergy-cli bereits global installiert haben:

```bash
# Über die installierte CLI ausführen
npx stigmergy-cli quick-deploy
```

### Manuelles Setup

```bash
# Globale Installation über NPM
npm install -g stigmergy-cli

# Projekt initialisieren
stigmergy-cli init

# Intelligente Bereitstellung (Umgebung scannen + nachfragen + Auto-Installation)
stigmergy-cli deploy

# Oder npx verwenden (keine Installation erforderlich)
npx stigmergy-cli init
npx stigmergy-cli deploy
```

## ✨ Hauptfunktionen

### 🎯 Direkte CLI-übergreifende Zusammenarbeit
- **Natürliche Sprachaufrufe**: Andere KI-Tools direkt in jeder unterstützten CLI aufrufen
- **Nahtlose Integration**: Ändert nicht die bestehende Nutzung von CLI-Tools
- **Intelligente Weiterleitung**: Erkennt automatisch Zusammenarbeitsabsichten und leitet an das geeignete Tool weiter

### 📋 Unterstützte CLI-Tools

#### Kern-Tools (Erforderlich)
- **Claude CLI** - Anthropic Claude CLI-Tool
- **Gemini CLI** - Google Gemini CLI-Tool

#### Erweiterte Tools (Optional)
- **QwenCode CLI** - Alibaba Cloud QwenCode CLI-Tool
- **iFlow CLI** - iFlow Workflow CLI-Tool
- **Qoder CLI** - Qoder Codegenerierungs-CLI-Tool
- **CodeBuddy CLI** - CodeBuddy Programmierassistent CLI-Tool
- **GitHub Copilot CLI** - GitHub Copilot CLI-Tool
- **Codex CLI** - OpenAI Codex Codeanalyse CLI-Tool

### 🧩 Intelligente Bereitstellungsplattform

```bash
# Intelligente Bereitstellung (empfohlen)
stigmergy-cli deploy

# Beispielausgabe:
🔍 Scanne System-CLI-Tool-Status...

  🔴 ❌ Claude CLI           | CLI: Nicht installiert | Integration: Nicht installiert
  🟢 ✅ Gemini CLI          | CLI: Verfügbar | Integration: Installiert
  🔴 ❌ QwenCode CLI       | CLI: Nicht installiert | Integration: Nicht installiert

📋 Folgende nicht installierte Tools erkannt:

🔴 Nicht installierte CLI-Tools:
  - Claude CLI (erforderlich) - Anthropic Claude CLI-Tool
  - QwenCode CLI (optional) - Alibaba Cloud QwenCode CLI-Tool

Möchten Sie versuchen, 2 CLI-Tools automatisch zu installieren? (Y/n): Y
```

## 🎯 CLI-übergreifende Zusammenarbeitsbeispiele

Nach der Installation können Sie in jeder unterstützten CLI andere Tools direkt aufrufen:

### In Claude CLI
```bash
# Andere KI-Tools aufrufen
Bitte verwende gemini, um mir bei der Übersetzung dieses Codes zu helfen
Rufe qwen auf, um diese Anforderung zu analysieren
Verwende iflow, um einen Workflow zu erstellen
Lass qoder Python-Code generieren
Starte den codebuddy-Assistenten
```

### In Gemini CLI
```bash
# Werkzeugübergreifende Zusammenarbeit
Verwende claude, um die Codequalität zu prüfen
Lass qwen mir bei der Dokumentation helfen
Nutze copilot, um Code-Schnipsel zu generieren
```

## 🛠️ Vollständige Befehlsliste

```bash
# Grundbefehle
stigmergy-cli init          # Projekt initialisieren
stigmergy-cli status        # Status anzeigen
stigmergy-cli scan          # Umgebung scannen

# Bereitstellungsbefehle
stigmergy-cli deploy        # Intelligente Bereitstellung (Standard)
stigmergy-cli deploy-all    # Vollständige Bereitstellung

# Projektmanagement
stigmergy-cli check-project # Projekt prüfen
stigmergy-cli validate      # Konfiguration validieren
stigmergy-cli clean         # Umgebung bereinigen

# Entwicklungsbefehle
npm run build              # Projekt bauen
npm run publish-to-npm     # Auf NPM veröffentlichen
npm run test               # Tests ausführen
```

## 📁 Projektstruktur

```
stigmergy-CLI-Multi-Agents/
├── package.json          # NPM-Paketkonfiguration
├── src/
│   ├── main.js          # Haupt-Einstiegsdatei
│   ├── deploy.js        # Intelligenter Bereitstellungsskript
│   ├── adapters/        # CLI-Adapter
│   │   ├── claude/
│   │   ├── gemini/
│   │   ├── qwencode/
│   │   └── ...
│   └── core/            # Kernmodule
├── adapters/            # CLI-Installationsskripte
│   ├── claude/install_claude_integration.py
│   ├── gemini/install_gemini_integration.py
│   └── ...
└── templates/           # Konfigurationsvorlagen
```

## 🔧 Automatische CLI-Tool-Installation

Das intelligente Bereitstellungsskript unterstützt die automatische Installation aller CLI-Tools:

### Kerntools
```bash
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
```

### Erweiterte Tools
```bash
npm install -g @qwen-code/qwen-code@latest
npm install -g @iflow-ai/iflow-cli@latest
npm install -g @qoder-ai/qodercli
npm install -g @tencent-ai/codebuddy-code
npm install -g @github/copilot
npm i -g @openai/codex --registry=https://registry.npmmirror.com
```

## 🎯 Anwendungsfälle

### Szenario 1: Persönliche Entwicklerumgebung
```bash
# Schnelles Setup für neue Entwicklungsumgebung
git clone my-project
cd my-project
stigmergy-cli deploy

# Jetzt können Sie in jeder CLI werkzeugübergreifend zusammenarbeiten
claude-cli "Bitte verwende gemini, um mir bei der Leistungsoptimierung dieses Codes zu helfen"
```

### Szenario 2: Teamzusammenarbeit
```bash
# Teamweite Projektkonfiguration
git clone team-project
cd team-project
stigmergy-cli init

# Alle Teammitglieder verwenden denselben Zusammenarbeitskontext
gemini-cli "Verwende claude, um die Designmuster dieses Moduls zu prüfen"
```

### Szenario 3: Mehrsprachige Entwicklung
```bash
# Ergänzung verschiedener KI-Tool-Spezialisierungen
qwen-cli "Verwende copilot, um Frontend-Komponenten zu generieren"
iflow-cli "Lass gemini API-Dokumentation erstellen"
```

## 🔧 Entwicklungsumgebung einrichten

```bash
# Projekt klonen
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# Abhängigkeiten installieren
npm install

# Im Entwicklungsmodus ausführen
npm run start
npm run status
npm run scan

# Bauen und veröffentlichen
npm run build
npm run publish-to-npm
```

## 🚀 Neue Versionen veröffentlichen

```bash
# Versionsnummer aktualisieren
npm version patch    # Patch-Version
npm version minor    # Unterversion
npm version major    # Hauptversion

# Auf NPM veröffentlichen
npm run publish-to-npm

# Veröffentlichung verifizieren
npx stigmergy-cli --version
```

## 🛠️ Fehlerbehebung

### Häufige Probleme

1. **Node.js-Version inkompatibel**
   ```bash
   # Sicherstellen, dass Node.js 16+ verwendet wird
   node --version
   ```

2. **Berechtigungsfehler**
   ```bash
   # Administratorrechte verwenden
   sudo npm install -g stigmergy-cli
   ```

3. **Netzwerkverbindungsprobleme**
   ```bash
   # NPM-Spiegel einstellen
   npm config set registry https://registry.npmmirror.com
   ```

4. **CLI-Tool-Installationsfehler**
   ```bash
   # Bestimmtes Tool manuell installieren
   npm install -g @anthropic-ai/claude-code
   ```

### Debug-Modus

```bash
# Detaillierte Debug-Ausgabe
DEBUG=stigmergy:* stigmergy-cli deploy

# Nur Status-Scan
stigmergy-cli scan
```

## 📚 Weitere Informationen

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **NPM**: https://www.npmjs.com/package/stigmergy-cli
- **Dokumentation**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
- **Problemfeedback**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues

## 🤝 Mitwirkung

Pull Requests und Issues sind willkommen!

1. Projekt forken
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Auf Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE)-Datei für Details.

---

**🎯 Stigmergy CLI - Wahre CLI-übergreifende Zusammenarbeit, die jedem KI-Tool ermöglicht, seinen Wert zu maximieren!