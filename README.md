# IDEx — Professional Web-Based IDE

IDEx is a high-performance, browser-based Integrated Development Environment (IDE) powered by **WebContainers**. It provides a complete Node.js environment directly in your browser, enabling you to build, run, and deploy web applications without local setup.

## 🚀 Key Features

- **Real-Time Node.js Runtime**: Full WebContainer integration for running scripts, installing dependencies, and starting servers.
- **Advanced Code Editor**: Powered by **CodeMirror 6** with multi-language syntax highlighting, bracket matching, and intelligent auto-completion.
- **Integrated Terminal**: High-performance **xterm.js** terminal connected to the WebContainer's shell.
- **Live Preview**: Real-time browser preview with port detection and external window support.
- **Workspace Management**:
  - Full filesystem access (Read/Write/Delete/Create).
  - Directory tree with intelligent file-type icons.
  - Multi-tab editor experience.
  - Export workspace as a signed ZIP archive.
- **Premium Aesthetics**: A custom-crafted dark theme optimized for long coding sessions with high-visibility borders and refined typography.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS / Vanilla CSS
- **Runtime**: @webcontainer/api
- **Core Components**: CodeMirror 6, XTerm.js, Lucide Icons, JSZip

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or later
- Professional browser support (Chrome/Edge/Brave/Safari)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Suryanshu-Nabheet/IDEx.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed with ❤️ by Suryanshu Nabheet**
