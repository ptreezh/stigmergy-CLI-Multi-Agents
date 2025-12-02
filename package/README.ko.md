# 🔧 Stigmergy CLI - 멀티에이전트 AI CLI 도구 협업 시스템

> **⚠️ 중요 안내: 이는 독립형 CLI 도구가 아닌 확장 시스템입니다!**
>
> Stigmergy CLI는 기존 AI CLI 도구들이 플러그인 시스템을 통해 서로 협업할 수 있도록 하는 것이지, 이를 대체하는 것이 아닙니다.

[![Node.js](https://img.shields.io/badge/node-16+-green.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-stigmergy-cli-blue.svg)](https://www.npmjs.com/package/stigmergy-cli)
[![라이선스](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![플랫폼](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-lightgrey.svg)]()

## 🚀 빠른 시작

### 원클릭 배포 (권장)

```bash
# 완전한 협업 시스템의 원클릭 배포 (감지 + 설치 + 구성)
npx -y git+https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git#main quick-deploy
```

또는 이미 stigmergy-cli를 전역으로 설치한 경우:

```bash
# 설치된 CLI를 통해 실행
npx stigmergy-cli quick-deploy
```

### 수동 설치

```bash
# NPM을 통해 전역 설치
npm install -g stigmergy-cli

# 프로젝트 초기화
stigmergy-cli init

# 지능형 배포 (환경 스캔 + 프롬프트 + 자동 설치)
stigmergy-cli deploy

# 또는 npx 사용 (설치 불필요)
npx stigmergy-cli init
npx stigmergy-cli deploy
```

## ✨ 핵심 기능

### 🎯 CLI 간 직접 협업
- **자연어 호출**: 지원되는 CLI에서 다른 AI 도구를 직접 호출
- **무결성 통합**: 기존 CLI 도구 사용 방식을 변경하지 않음
- **스마트 라우팅**: 협업 의도를 자동으로 식별하고 적절한 도구에 위임

### 📋 지원되는 CLI 도구

#### 핵심 도구 (필수)
- **Claude CLI** - Anthropic Claude CLI 도구
- **Gemini CLI** - Google Gemini CLI 도구

#### 확장 도구 (선택사항)
- **QwenCode CLI** - 알리바바 클라우드 QwenCode CLI 도구
- **iFlow CLI** - iFlow 워크플로우 CLI 도구
- **Qoder CLI** - Qoder 코드 생성 CLI 도구
- **CodeBuddy CLI** - CodeBuddy 프로그래밍 어시스턴트 CLI 도구
- **GitHub Copilot CLI** - GitHub Copilot CLI 도구
- **Codex CLI** - OpenAI Codex 코드 분석 CLI 도구

### 🧩 지능형 배포 시스템

```bash
# 지능형 배포 (권장)
stigmergy-cli deploy

# 출력 예시:
🔍 시스템 CLI 도구 상태 스캔 중...

  🔴 ❌ Claude CLI           | CLI: 미설치 | 통합: 미설치
  🟢 ✅ Gemini CLI          | CLI: 사용 가능 | 통합: 설치됨
  🔴 ❌ QwenCode CLI       | CLI: 미설치 | 통합: 미설치

📋 다음 미설치 도구 감지:

🔴 미설치 CLI 도구:
  - Claude CLI (필수) - Anthropic Claude CLI 도구
  - QwenCode CLI (선택사항) - 알리바바 클라우드 QwenCode CLI 도구

2개의 CLI 도구 자동 설치를 시도하시겠습니까? (Y/n): Y
```

## 🎯 CLI 간 협업 예시

설치 후, 지원되는 CLI에서 다른 도구를 직접 호출할 수 있습니다:

### Claude CLI에서
```bash
# 다른 AI 도구 호출
gemini를 사용하여 이 코드 번역을 도와주세요
qwen을 호출하여 이 요구사항을 분석해 주세요
iflow를 사용하여 워크플로우를 생성해 주세요
qoder가 Python 코드를 생성하도록 하세요
codebuddy 어시스턴트를 시작하세요
```

### Gemini CLI에서
```bash
# 도구 간 협업
claude를 사용하여 코드 품질을 확인해 주세요
qwen이 문서 작성을 도와주도록 하세요
copilot을 사용하여 코드 스니펫을 생성해 주세요
```

## 🛠️ 전체 명령어 목록

```bash
# 기본 명령어
stigmergy-cli init          # 프로젝트 초기화
stigmergy-cli status        # 상태 보기
stigmergy-cli scan          # 환경 스캔

# 배포 명령어
stigmergy-cli deploy        # 지능형 배포 (기본값)
stigmergy-cli deploy-all    # 전체 배포

# 프로젝트 관리
stigmergy-cli check-project # 프로젝트 확인
stigmergy-cli validate      # 구성 검증
stigmergy-cli clean         # 환경 정리

# 개발 명령어
npm run build              # 프로젝트 빌드
npm run publish-to-npm     # NPM에 게시
npm run test               # 테스트 실행
```

## 📁 프로젝트 구조

```
stigmergy-CLI-Multi-Agents/
├── package.json          # NPM 패키지 구성
├── src/
│   ├── main.js          # 메인 진입 파일
│   ├── deploy.js        # 지능형 배포 스크립트
│   ├── adapters/        # CLI 어댑터
│   │   ├── claude/
│   │   ├── gemini/
│   │   ├── qwencode/
│   │   └── ...
│   └── core/            # 핵심 모듈
├── adapters/            # CLI 설치 스크립트
│   ├── claude/install_claude_integration.py
│   ├── gemini/install_gemini_integration.py
│   └── ...
└── templates/           # 구성 템플릿
```

## 🔧 CLI 도구 자동 설치

지능형 배포 스크립트는 모든 CLI 도구의 자동 설치를 지원합니다:

### 핵심 도구
```bash
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
```

### 확장 도구
```bash
npm install -g @qwen-code/qwen-code@latest
npm install -g @iflow-ai/iflow-cli@latest
npm install -g @qoder-ai/qodercli
npm install -g @tencent-ai/codebuddy-code
npm install -g @github/copilot
npm i -g @openai/codex --registry=https://registry.npmmirror.com
```

## 🎯 사용 시나리오

### 시나리오 1: 개인 개발자 환경
```bash
# 새로운 개발 환경 빠른 설정
git clone my-project
cd my-project
stigmergy-cli deploy

# 이제 어떤 CLI에서도 도구 간 협업이 가능
claude-cli "gemini를 사용하여 이 코드의 성능을 최적화하는 것을 도와주세요"
```

### 시나리오 2: 팀 협업
```bash
# 팀 공유 프로젝트 구성
git clone team-project
cd team-project
stigmergy-cli init

# 모든 팀 구성원이 동일한 협업 컨텍스트 사용
gemini-cli "claude를 사용하여 이 모듈의 디자인 패턴을 확인해 주세요"
```

### 시나리오 3: 다국어 개발
```bash
# 다양한 AI 도구 전문성 보완
qwen-cli "copilot을 사용하여 프론트엔드 컴포넌트를 생성해 주세요"
iflow-cli "gemini가 API 문서를 생성하도록 하세요"
```

## 🔧 개발 환경 설정

```bash
# 프로젝트 클론
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 종속성 설치
npm install

# 개발 모드 실행
npm run start
npm run status
npm run scan

# 빌드 및 게시
npm run build
npm run publish-to-npm
```

## 🚀 새 버전 발행

```bash
# 버전 번호 업데이트
npm version patch    # 패치 버전
npm version minor    # 마이너 버전
npm version major    # 메이저 버전

# NPM에 발행
npm run publish-to-npm

# 발행 확인
npx stigmergy-cli --version
```

## 🛠️ 문제 해결

### 일반적인 문제

1. **Node.js 버전 호환되지 않음**
   ```bash
   # Node.js 16+ 사용 확인
   node --version
   ```

2. **권한 오류**
   ```bash
   # 관리자 권한 사용
   sudo npm install -g stigmergy-cli
   ```

3. **네트워크 연결 문제**
   ```bash
   # NPM 미러 설정
   npm config set registry https://registry.npmmirror.com
   ```

4. **CLI 도구 설치 실패**
   ```bash
   # 특정 도구 수동 설치
   npm install -g @anthropic-ai/claude-code
   ```

### 디버그 모드

```bash
# 상세 디버그 출력
DEBUG=stigmergy:* stigmergy-cli deploy

# 상태 스캔만
stigmergy-cli scan
```

## 📚 추가 정보

- **GitHub**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents
- **NPM**: https://www.npmjs.com/package/stigmergy-cli
- **문서**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents#readme
- **문제 피드백**: https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/issues

## 🤝 기여

풀 리퀘스트와 이슈 제출을 환영합니다!

1. 프로젝트 포크
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경 사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. 풀 리퀘스트 열기

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**🎯 Stigmergy CLI - 진정한 CLI 간 협업으로 각 AI 도구가 최대 가치를 발휘하도록!