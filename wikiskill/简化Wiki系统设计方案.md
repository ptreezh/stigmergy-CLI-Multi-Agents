# 简化版Wiki系统设计方案

## 🎯 系统定位
专门为技能协同编辑设计的简化Wiki系统，初期只支持通过我们的技能参与编辑。

## 🏗️ 核心架构

### 技术栈
- **前端**: Vue.js 3 + Monaco Editor
- **后端**: Node.js + Express
- **数据库**: MongoDB + Redis
- **协同**: Yjs + WebSocket
- **权限**: JWT + RBAC

### 系统边界
```
┌─────────────────────────────────────────────┐
│              简化Wiki系统                     │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐           │
│  │  词条管理    │  │  协同编辑    │           │
│  │             │  │             │           │
│  │ • 创建词条   │  │ • 实时编辑   │           │
│  │ • 版本控制   │  │ • 冲突解决   │           │
│  │ • 权限管理   │  │ • 用户状态   │           │
│  └─────────────┘  └─────────────┘           │
│         │                │                  │
│         ▼                ▼                  │
│  ┌─────────────────────────────────────┐   │
│  │           技能集成层                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  Wiki技能    │  │  编辑权限    │  │   │
│  │  │  接口        │  │  控制        │  │   │
│  │  │             │  │             │  │   │
│  │  │ • 词条操作   │  │ • 用户认证   │  │   │
│  │  │ • 内容同步   │  │ • 权限验证   │  │   │
│  │  │ • 变更通知   │  │ • 审计日志   │  │   │
│  │  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 📦 数据模型

### 词条模型
```javascript
const entrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  collaborators: [{
    userId: String,
    userName: String,
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  versions: [{
    version: String,
    content: String,
    author: String,
    timestamp: Date,
    changes: String
  }],
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    tags: [String],
    viewCount: {
      type: Number,
      default: 0
    }
  }
});
```

### 编辑会话模型
```javascript
const sessionSchema = new mongoose.Schema({
  entryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true
  },
  participants: [{
    userId: String,
    userName: String,
    socketId: String,
    cursor: {
      line: Number,
      column: Number
    },
    selection: {
      start: { line: Number, column: Number },
      end: { line: Number, column: Number }
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  yjsState: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

## 🔧 核心API设计

### 词条管理API
```javascript
// 创建词条
POST /api/entries
{
  "title": "技能名称",
  "category": "技能分类",
  "content": "词条内容"
}

// 获取词条
GET /api/entries/:id

// 更新词条
PUT /api/entries/:id
{
  "content": "更新内容",
  "changes": "变更说明"
}

// 获取词条版本历史
GET /api/entries/:id/versions

// 恢复到指定版本
POST /api/entries/:id/restore/:version
```

### 协同编辑API
```javascript
// 加入编辑会话
POST /api/sessions/:entryId/join
{
  "userId": "用户ID",
  "userName": "用户名"
}

// 获取会话状态
GET /api/sessions/:entryId

// 同步编辑操作
WebSocket /ws/sessions/:entryId
{
  "type": "operation",
  "operation": {
    "type": "insert|delete|replace",
    "position": Number,
    "content": String
  },
  "userId": "用户ID"
}
```

### 权限控制API
```javascript
// 添加协作者
POST /api/entries/:id/collaborators
{
  "userId": "用户ID",
  "userName": "用户名",
  "role": "editor"
}

// 更新权限
PUT /api/entries/:id/collaborators/:userId
{
  "role": "editor"
}

// 移除协作者
DELETE /api/entries/:id/collaborators/:userId
```

## 🚀 技能集成接口

### Wiki技能接口
```javascript
class WikiSkillInterface {
  // 参与词条创建
  async createEntry(title, category, initialContent) {
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        title,
        category,
        content: initialContent
      })
    });
    
    return response.json();
  }
  
  // 参与协同编辑
  async joinEditSession(entryUrl) {
    const entryId = this.extractEntryId(entryUrl);
    
    // 建立WebSocket连接
    const socket = io(`/ws/sessions/${entryId}`);
    
    // 处理编辑操作
    socket.on('operation', (operation) => {
      this.handleRemoteOperation(operation);
    });
    
    return socket;
  }
  
  // 提交编辑内容
  async submitEdit(entryUrl, content, changes) {
    const entryId = this.extractEntryId(entryUrl);
    
    const response = await fetch(`/api/entries/${entryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        content,
        changes
      })
    });
    
    return response.json();
  }
  
  // 获取词条信息
  async getEntryInfo(entryUrl) {
    const entryId = this.extractEntryId(entryUrl);
    
    const response = await fetch(`/api/entries/${entryId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    return response.json();
  }
  
  private extractEntryId(url) {
    // 从URL中提取词条ID
    const match = url.match(/\/entries\/([a-f0-9]{24})/);
    return match ? match[1] : null;
  }
  
  private handleRemoteOperation(operation) {
    // 处理远程编辑操作
    switch (operation.type) {
      case 'insert':
        this.editor.insert(operation.position, operation.content);
        break;
      case 'delete':
        this.editor.delete(operation.position, operation.length);
        break;
      case 'replace':
        this.editor.replace(operation.position, operation.length, operation.content);
        break;
    }
  }
}
```

## 🔒 权限控制机制

### 访问控制
```javascript
class AccessController {
  // 检查用户是否有权限访问词条
  async checkEntryAccess(userId, entryId, action) {
    const entry = await Entry.findById(entryId);
    
    // 检查是否是协作者
    const collaborator = entry.collaborators.find(
      c => c.userId === userId
    );
    
    if (!collaborator) {
      throw new Error('用户无权访问此词条');
    }
    
    // 检查操作权限
    const permissions = {
      'owner': ['read', 'write', 'delete', 'manage'],
      'editor': ['read', 'write'],
      'viewer': ['read']
    };
    
    if (!permissions[collaborator.role].includes(action)) {
      throw new Error('用户权限不足');
    }
    
    return true;
  }
  
  // 添加协作者
  async addCollaborator(entryId, userId, role, requesterId) {
    // 检查请求者是否有管理权限
    await this.checkEntryAccess(requesterId, entryId, 'manage');
    
    const entry = await Entry.findById(entryId);
    
    // 检查用户是否已经是协作者
    if (entry.collaborators.find(c => c.userId === userId)) {
      throw new Error('用户已经是协作者');
    }
    
    // 添加协作者
    entry.collaborators.push({
      userId,
      userName: await this.getUserName(userId),
      role
    });
    
    await entry.save();
    
    return entry;
  }
}
```

## 📱 用户界面设计

### 词条编辑界面
```html
<div class="wiki-editor">
  <!-- 顶部工具栏 -->
  <div class="editor-toolbar">
    <div class="toolbar-left">
      <h1 class="entry-title" contenteditable="true">{{ entry.title }}</h1>
      <span class="entry-status">{{ entry.status }}</span>
    </div>
    
    <div class="toolbar-right">
      <button class="btn-save" @click="save">保存</button>
      <button class="btn-preview" @click="preview">预览</button>
      <button class="btn-publish" @click="publish">发布</button>
      
      <div class="active-users">
        <div v-for="user in activeUsers" 
             :key="user.userId" 
             class="user-avatar"
             :style="{backgroundColor: user.color}">
          {{ user.userName.charAt(0) }}
        </div>
      </div>
    </div>
  </div>
  
  <!-- 主编辑区域 -->
  <div class="editor-main">
    <div class="editor-pane">
      <div id="monaco-editor" class="monaco-editor"></div>
    </div>
    
    <div class="sidebar">
      <!-- 协作者列表 -->
      <div class="collaborators">
        <h3>协作者</h3>
        <div v-for="collaborator in entry.collaborators" 
             :key="collaborator.userId"
             class="collaborator-item">
          <span class="collaborator-name">{{ collaborator.userName }}</span>
          <span class="collaborator-role">{{ collaborator.role }}</span>
        </div>
      </div>
      
      <!-- 版本历史 -->
      <div class="version-history">
        <h3>版本历史</h3>
        <div v-for="version in entry.versions" 
             :key="version.version"
             class="version-item">
          <span class="version-number">{{ version.version }}</span>
          <span class="version-author">{{ version.author }}</span>
          <span class="version-time">{{ formatTime(version.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 🚀 部署方案

### Docker配置
```yaml
version: '3.8'

services:
  wiki-frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://wiki-backend:3001
    depends_on:
      - wiki-backend

  wiki-backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/wiki
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-secret-key
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - wiki_mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - wiki_redis_data:/data

volumes:
  wiki_mongodb_data:
  wiki_redis_data:
```

---

**设计团队**：Wiki系统设计团队  
**设计日期**：2025年12月14日  
**版本**：v1.0