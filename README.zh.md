# dsh-vscode

DSH 的类 VSCode 工作区编辑器：会话视图里一个文件树 + 多标签 Monaco 编辑器，
一个会话一个文件夹，编辑器下方挂一个能对话的子智能体，键位对齐 VSCode。

本仓库是 [`@supanexus/dsh-plugin-file-explorer`](https://github.com/supanexus/dsh-plugin-file-explorer)
（v0.1.0）的分支，针对 DSH `0.2.0-rc.2` 做了大幅改动。改动清单见 `PATCH-NOTES.md`。

## 安装

直接从 GitHub 安装：

```bash
dsh plugin --profile desktop add "github:yeduwuren20000-del/dsh-vscode"
```

或者克隆到本地后以链接方式安装：

```bash
git clone https://github.com/yeduwuren20000-del/dsh-vscode.git
dsh plugin --profile desktop add "link:<本地路径>/dsh-vscode"
```

也可直接改 profile 的 `package.json`：

```json
{ "dependencies": { "dsh-vscode": "link:<本地路径>/dsh-vscode" } }
```

并把 `"dsh-vscode"` 加进 `dsh.profile.bundles`。**改完必须完全重启宿主** ——
插件列表只在启动时读一次。

## 功能

- **文件**视图：中间列为目录树 | 编辑器分栏；左侧仍是官方工作区 / 会话列表
- 一个会话一个文件夹，里面只放这个会话自己的文件（从会话日志里抽取），
  附 `相关文件.md` 索引与硬链接镜像
- 多标签编辑、dirty 标记、Ctrl/Cmd+S、Markdown 源码 / 预览切换
- 新建 / 重命名 / 删除（非空目录拒绝）
- Monaco（CDN）+ 小地图开关 + 导入本机 VSCode 主题与配色方案
- VSCode 键位：`Ctrl+P` 快速打开、`Ctrl+B` 折叠目录树、`Ctrl+Shift+E` 聚焦目录树、
  `Ctrl+W` 关标签、`Ctrl+Tab` / `Ctrl+PageUp/Down` 循环、`Ctrl+1..9` 跳标签；
  文件树支持方向键、`F2` 重命名和 `Delete` 删除确认
- 狭窄布局下文件树改为覆盖式侧栏；打开文件后自动收起，给编辑器留出空间
- 编辑器下方的子智能体席位，模型跟随当前会话

## 配置

见 `cordis.patch.yml`；设置 → 插件 → **dsh-vscode** 可热更新。

`root` 是文件树打开的根目录。仓库里的默认值指向作者本机，装好后请改成你自己的
目录；不建议留空或写相对路径 —— 在桌面宿主下它会解析到应用安装目录。

## 开发 / 重构建

当前版本的可编辑 JavaScript 源码在 `src/`，构建清单在 `src/parts.json`。
原本的 TS/TSX 源码未随分支保留，现有源码从已运行的产物恢复，
并把插件逻辑、样式和依赖快照分开。改源码后运行：

```bash
npm run build
npm test
```

无需 engine 工作区或联网安装。宿主加载 `lib/`，构建会重新生成这两个入口。
详细说明见 `src/README.md`。

## License

MIT。原始作品 © SupaNexus，修改部分 © yeduwuren。详见 `LICENSE`。
