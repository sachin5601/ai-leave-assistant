# 🤖 AI Leave Assistant

> **Your leave, simplified. Your questions, answered. Your request, automated.**

An AI-powered employee leave assistant that brings **leave information, HR policies, and leave requests** into one simple conversational experience.

Instead of searching through HR documents or manually figuring out whom to contact, employees can simply **ask the AI assistant** what they need.

---

## ✨ What Can It Do?

### 💬 Ask in Natural Language

Employees can interact with the assistant just like they would with an HR representative.

```text
"How many leaves do I have?"
```

```text
"What is the leave policy?"
```

```text
"I want leave from 15 September to 18 September."
```

The assistant understands the request and uses available employee and policy information to determine the appropriate next step.

### 🏖️ Leave Management

- 📊 View leave balance and summary
- 📅 Check leave history
- 📖 Understand HR leave policies
- 👤 View employee profile
- 👨‍💼 View reporting manager
- 🤖 Interact with an AI leave assistant
- 📝 Initiate leave requests through conversation
- 📧 Notify the reporting manager
- ✅ Support manager approval/rejection workflow

---

## 🧠 How It Works

```text
                    👤 Employee
                         │
                         ▼
              ┌─────────────────────┐
              │   React Web Portal  │
              │     + AI Chat       │
              └──────────┬──────────┘
                         │
                         ▼
                 🤖 n8n AI Agent
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        🏖️ Leave      📖 Policy   👤 Employee
         Balance       Rules       Data
              │          │          │
              └──────────┼──────────┘
                         ▼
                🔍 Eligibility Check
                         │
                         ▼
                  📝 Leave Request
                         │
                         ▼
                   📧 Manager Email
                         │
                         ▼
                ✅ Approve / ❌ Reject
```

---

## 🚀 Why AI?

Traditional HR portals often make employees navigate multiple pages just to answer a simple question.

With AI Leave Assistant, the interaction becomes:

**Employee asks → AI understands → AI checks → AI assists → Workflow continues**

This makes routine leave assistance faster, simpler, and more conversational.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | React + TypeScript |
| ⚡ Build Tool | Vite |
| 🎨 Styling | Tailwind CSS |
| 🤖 AI & Automation | n8n |
| 🔗 Communication | Webhooks / APIs |
| 📦 Version Control | Git + GitHub |
| ☁️ Deployment | Netlify |

---

## 📁 Project Structure

```text
ai-leave-assistant/
│
├── frontend/
│   ├── src/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── config/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── ...
│
├── .gitignore
└── README.md
```

> The n8n workflow can be added under `n8n/` as the automation layer evolves.

---

## ⚡ Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Sachin5601/ai-leave-assistant.git
```

### 2️⃣ Open the frontend

```bash
cd ai-leave-assistant/frontend
```

### 3️⃣ Install dependencies

```bash
npm install
```

### 4️⃣ Configure environment variables

Create:

```text
frontend/.env
```

Add the environment variables required by your backend/deployment configuration.

> ⚠️ Never commit `.env` files, API keys, passwords, or other sensitive credentials to GitHub.

### 5️⃣ Start the development server

```bash
npm run dev
```

### 6️⃣ Build for production

```bash
npm run build
```

---

## ☁️ Deployment

The frontend is deployed through **Netlify** and connected to GitHub.

```text
        GitHub
           │
           ▼
        Netlify
           │
           ▼
     npm run build
           │
           ▼
    🚀 Live Application
```

Every new change pushed to the configured branch can trigger a new Netlify deployment.

---

## 🔐 Security

Environment-specific configuration is kept outside the public repository.

Ignored files include:

```text
frontend/.env
frontend/node_modules/
frontend/dist/
```

Sensitive credentials should be stored using secure environment variables or credential management rather than being committed to source control.

---

## 🗺️ Roadmap

Possible future improvements:

- [ ] 👨‍💼 Dedicated manager dashboard
- [ ] 🏢 HR administration dashboard
- [ ] 📆 Calendar integration
- [ ] 🔍 Leave conflict detection
- [ ] 📊 Approval and leave analytics
- [ ] 🧾 Audit logs
- [ ] 🔔 Automated status notifications
- [ ] 🌐 Multi-language AI assistance
- [ ] 🔌 Integration with existing HR platforms

---

## 🎯 Project Vision

**AI Leave Assistant** aims to turn leave management from a multi-step HR task into a simple conversation.

> **Ask. Understand. Request. Approve.**

One assistant. One conversation. A simpler leave experience.

---

## 👨‍💻 Project

**AI Leave Assistant**  
AI-powered employee leave assistance and workflow automation.

Built with ❤️ using **React, TypeScript, Vite, Tailwind CSS & n8n**.
