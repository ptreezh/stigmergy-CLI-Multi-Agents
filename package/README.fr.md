# 🔧 Stigmergy CLI - Système de Collaboration d'Outils CLI d'IA Multi-Agents

> **⚠️ Clarification Importante : Ce n'est pas un outil CLI autonome, mais un système d'amélioration !**
>
> Stigmergy CLI permet aux outils CLI d'IA existants de collaborer entre eux via un système de plugins, plutôt que de les remplacer.

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-cli-blue.svg)](https://www.npmjs.com/package/stigmergy-cli)
[![Licence](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Plateforme](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## 🚀 Démarrage Rapide

### Déploiement en Un Clic (Recommandé)

```bash
# Déploiement en un clic du système complet de collaboration (détection + installation + configuration)
npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy
```

Ou, si vous avez déjà installé stigmergy-cli globalement :

```bash
# Exécuter via la CLI installée
npx stigmergy-cli quick-deploy
```

### Installation Manuelle

```bash
# Installer globalement via NPM
npm install -g stigmergy-cli

# Initialiser le projet
stigmergy-cli init

# Déploiement intelligent (analyse de l'environnement + invite + installation automatique)
stigmergy-cli deploy

# Ou utiliser npx (pas d'installation requise)
npx stigmergy-cli init
npx stigmergy-cli deploy
```

## ✨ Fonctionnalités Principales

### 🎯 Collaboration Directe entre CLI
- **Invocation par Langage Naturel** : Invoquer directement d'autres outils d'IA dans n'importe quel CLI pris en charge
- **Intégration Transparente** : Ne modifie pas l'utilisation existante des outils CLI
- **Routage Intelligent** : Identifie automatiquement l'intention de collaboration et délègue à l'outil approprié

### 📋 Outils CLI Pris en Charge

#### Outils Principaux (Requis)
- **Claude CLI** - Outil CLI Anthropic Claude
- **Gemini CLI** - Outil CLI Google Gemini

#### Outils Étendus (Optionnels)
- **QwenCode CLI** - Outil CLI Alibaba Cloud QwenCode
- **iFlow CLI** - Outil CLI de flux de travail iFlow
- **Qoder CLI** - Outil CLI de génération de code Qoder
- **CodeBuddy CLI** - Outil CLI d'assistant de programmation CodeBuddy
- **GitHub Copilot CLI** - Outil CLI GitHub Copilot
- **Codex CLI** - Outil CLI d'analyse de code OpenAI Codex

### 🧩 Système de Déploiement Intelligent

```bash
# Déploiement intelligent (recommandé)
stigmergy-cli deploy

# Exemple de sortie :
🔍 Analyse de l'état des outils CLI du système...

  🔴 ❌ Claude CLI           | CLI : Non installé | Intégration : Non installée
  🟢 ✅ Gemini CLI          | CLI : Disponible | Intégration : Installée
  🔴 ❌ QwenCode CLI       | CLI : Non installé | Intégration : Non installée

📋 Les outils non installés suivants ont été détectés :

🔴 Outils CLI non installés :
  - Claude CLI (requis) - Outil CLI Anthropic Claude
  - QwenCode CLI (optionnel) - Outil CLI Alibaba Cloud QwenCode

Voulez-vous essayer d'installer automatiquement 2 outils CLI ? (Y/n) : Y
```

## 🎯 Exemples de Collaboration entre CLI

Après l'installation, vous pouvez invoquer directement d'autres outils dans n'importe quel CLI pris en charge :

### Dans Claude CLI
```bash
# Invoquer d'autres outils d'IA
Veuillez utiliser gemini pour m'aider à traduire ce code
Appelez qwen pour analyser cette exigence
Utilisez iflow pour créer un flux de travail
Laissez qoder générer du code Python
Démarrer l'assistant codebuddy
```

### Dans Gemini CLI
```bash
# Collaboration inter-outils
Utilisez claude pour vérifier la qualité du code
Laissez qwen m'aider à écrire de la documentation
Utilisez copilot pour générer des extraits de code
```

## 🛠️ Liste Complète des Commandes

```bash
# Commandes de base
stigmergy-cli init          # Initialiser le projet
stigmergy-cli status        # Voir l'état
stigmergy-cli scan          # Analyser l'environnement

# Commandes de déploiement
stigmergy-cli deploy        # Déploiement intelligent (par défaut)
stigmergy-cli deploy-all    # Déploiement complet

# Gestion de projet
stigmergy-cli check-project # Vérifier le projet
stigmergy-cli validate      # Valider la configuration
stigmergy-cli clean         # Nettoyer l'environnement

# Commandes de développement
npm run build              # Construire le projet
npm run publish-to-npm     # Publier sur NPM
npm run test               # Exécuter les tests
```

## 📁 Structure du Projet

```
stigmergy-CLI-Multi-Agents/
├── package.json          # Configuration du paquet NPM
├── src/
│   ├── main.js          # Fichier d'entrée principal
│   ├── deploy.js        # Script de déploiement intelligent
│   ├── adapters/        # Adaptateurs CLI
│   │   ├── claude/
│   │   ├── gemini/
│   │   ├── qwencode/
│   │   └── ...
│   └── core/            # Modules principaux
├── adapters/            # Scripts d'installation CLI
│   ├── claude/install_claude_integration.py
│   ├── gemini/install_gemini_integration.py
│   └── ...
└── templates/           # Modèles de configuration
```

## 🔧 Installation Automatique des Outils CLI

Le script de déploiement intelligent prend en charge l'installation automatique de tous les outils CLI :

### Outils Principaux
```bash
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
```

### Outils Étendus
```bash
npm install -g @qwen-code/qwen-code@latest
npm install -g @iflow-ai/iflow-cli@latest
npm install -g @qoder-ai/qodercli
npm install -g @tencent-ai/codebuddy-code
npm install -g @github/copilot
npm i -g @openai/codex --registry=https://registry.npmmirror.com
```

## 🎯 Scénarios d'Utilisation

### Scénario 1 : Environnement de Développeur Individuel
```bash
# Configuration rapide pour un nouvel environnement de développement
git clone my-project
cd my-project
stigmergy-cli deploy

# Vous pouvez maintenant collaborer entre outils dans n'importe quel CLI
claude-cli "Veuillez utiliser gemini pour m'aider à optimiser les performances de ce code"
```

### Scénario 2 : Collaboration d'Équipe
```bash
# Configuration de projet partagée par l'équipe
git clone team-project
cd team-project
stigmergy-cli init

# Tous les membres de l'équipe utilisent le même contexte de collaboration
gemini-cli "Utilisez claude pour vérifier les modèles de conception de ce module"
```

### Scénario 3 : Développement Multi-Langages
```bash
# Complémentarité des spécialisations de différents outils d'IA
qwen-cli "Utilisez copilot pour générer des composants front-end"
iflow-cli "Laissez gemini créer de la documentation API"
```

## 🔧 Configuration de l'Environnement de Développement

```bash
# Cloner le projet
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# Installer les dépendances
npm install

# Exécuter en mode développement
npm run start
npm run status
npm run scan

# Construire et publier
npm run build
npm run publish-to-npm
```

## 🚀 Publication de Nouvelles Versions

```bash
# Mettre à jour le numéro de version
npm version patch    # Version correctif
npm version minor    # Version mineure
npm version major    # Version majeure

# Publier sur NPM
npm run publish-to-npm

# Vérifier la publication
npx stigmergy-cli --version
```

## 🛠️ Résolution de Problèmes

### Problèmes Courants

1. **Version de Node.js incompatible**
   ```bash
   # S'assurer d'utiliser Node.js 16+
   node --version
   ```

2. **Erreurs de permissions**
   ```bash
   # Utiliser les privilèges administrateur
   sudo npm install -g stigmergy-cli
   ```

3. **Problèmes de connexion réseau**
   ```bash
   # Définir le miroir NPM
   npm config set registry https://registry.npmmirror.com
   ```

4. **Échec de l'installation des outils CLI**
   ```bash
   # Installer manuellement un outil spécifique
   npm install -g @anthropic-ai/claude-code
   ```

### Mode Débogage

```bash
# Sortie de débogage détaillée
DEBUG=stigmergy:* stigmergy-cli deploy

# Analyse d'état uniquement
stigmergy-cli scan
```

## 📚 Plus d'Informations

- **GitHub** : https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **NPM** : https://www.npmjs.com/package/stigmergy-cli
- **Documentation** : https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
- **Retour sur Problèmes** : https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues

## 🤝 Contributions

Les Pull Requests et Issues sont les bienvenues !

1. Forker le projet
2. Créer une branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commiter les modifications (`git commit -m 'Add some AmazingFeature'`)
4. Pousser vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**🎯 Stigmergy CLI - Vraie collaboration entre CLI, permettant à chaque outil d'IA de maximiser sa valeur !