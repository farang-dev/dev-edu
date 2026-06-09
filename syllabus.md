# Dev-Edu: Master Curriculum & Syllabus (体系的ロードマップ)

Dev-Eduは、プログラミング初心者から大学院生・研究者レベル（PhD）のエンジニアまでが、表層的なフレームワークの利用（Black Box）にとどまらず、**「なぜその技術がそう動くのか」「低レイヤーや言語仕様では何が起きているのか」**をノーブルシット（No-BS）で本質的に理解するための体系的知識ベースです。

以下に、開発における主要4領域（**Frontend, Backend, Infrastructure, DevOps**）の包括的な目次・シラバスを定義します。

---

## 1. Frontend (フロントエンド領域)

### Level 1: Foundation (基礎・ブラウザ動作原理)
*   **Web標準とHTML5/CSS3の本質**
    *   DOM (Document Object Model) / CSSOM (CSS Object Model) ツリーの構築プロセス
    *   Critical Rendering Path (ブラウザのレンダリングパイプライン): 解析(Parsing) → 構築(Tree Construction) → レイアウト(Layout) → ペイント(Paint) → コンポジット(Composite)
    *   CSS設計手法 (BEM, Utility-First) とCSS変数、CSS Houdini
*   **ブラウザランタイムの仕組み**
    *   Event Loop (Call Stack, Task Queue, Microtask Queue) の優先順位と挙動
    *   V8/Javascriptエンジンの内部構造 (JITコンパイラ, Ignition, TurboFan, ガベージコレクションアルゴリズム - Scavenger/Mark-Sweep)
    *   ブラウザセキュリティ: Same-Origin Policy (SOP), CORS, CSP (Content Security Policy), XSS対策, CSRF対策

### Level 2: Modern Language Core (JavaScript & TypeScript)
*   **JavaScript (ES6+) の言語仕様**
    *   プロトタイプチェーン、クロージャ(Closures)、実行コンテキストとスコープチェーン
    *   非同期処理のメカニズム: Promise (State, Queueing), async/await (Generator / Iterator の糖衣構文としての分解)
    *   メタプログラミング: Proxy, Reflect, Symbols
*   **TypeScriptの静的型システム**
    *   型推論、構造的部分型 (Structural Typing) vs 公称型 (Nominal Typing)
    *   高度な型演算: Conditional Types (`T extends U ? X : Y`), Mapped Types, Template Literal Types, Utility Types (`Extract`, `Exclude`, `ReturnType` 等の自作)
    *   TypeScriptコンパイラ (`tsc`) の動作フェーズと `tsconfig.json` の最適化

### Level 3: Framework & UI Architecture
*   **仮想DOMとReactivityの仕組み**
    *   Reconciliation (調停アルゴリズム) と Diffing Algorithm (O(n)への近似アルゴリズム)
    *   React Fiber Architecture: 非同期レンダリング、優先度制御、Concurrent Mode
    *   細粒度リアクティビティ (Fine-grained Reactivity): Signals (Solid.js, Vue 3, Svelte 5) の依存関係追跡メカニズム
*   **コンポーネント設計とステート管理**
    *   状態管理トポロジー: 単一方向データフロー (Redux/Zustand), 双方向/Proxyベース (Valtio/MobX), アトミック (Jotai/Recoil)
    *   クリーンアーキテクチャのフロントエンド適用 (UI Presenter, Service, UseCase, Repository パターンの実装例)
    *   コンポーネントのデザインパターン: Compound Components, Render Props, HOC, Hooksパターン

### Level 4: Rendering Strategy & Performance
*   **レンダリング戦略の使い分け**
    *   CSR (Client-Side Rendering)
    *   SSR (Server-Side Rendering): ハイドレーション (Hydration) / ストリーミングハイドレーション / 部分ハイドレーション (Islands Architecture - Astro)
    *   SSG (Static Site Generation) & ISR (Incremental Static Regeneration)
    *   RSC (React Server Components): クライアント・サーバーの境界線のシリアライズ仕様
*   **パフォーマンスとWeb Vitals**
    *   Core Web Vitalsの計測と最適化: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), CLS (Cumulative Layout Shift)
    *   ネットワーク層の最適化: リソースヒンティング (`dns-prefetch`, `preconnect`, `prefetch`, `preload`), HTTP/3, Brotli圧縮
    *   コード分割 (Code Splitting) & 遅延読み込み (Lazy Loading) の実装パターン

### Level 5: Repository & Build Tooling
*   **ビルド・バンドルツールの仕組み**
    *   ES Modules (ESM) と CommonJS (CJS) の相互運用性と動的/静的解決の違い
    *   Bundlerメカニズム: 依存関係グラフの構築、Tree Shaking (デッドコード削除)、HMR (Hot Module Replacement)
    *   ツールチェーンの比較と選定: Webpack, Vite (esbuild/Rollup), Turbopack, Rspack (Rustベースツール)
*   **リポジトリ構造とアーキテクチャ**
    *   Monorepo管理 (Turborepo, Lerna, pnpm workspaces): 依存関係の共有、キャッシュ、タスクパイプライン
    *   フロントエンドにおけるディレクトリ構造 (Feature-driven structure, Layered structure)
    *   UI/デザインシステムの構築とパッケージング (Storybook, コンポーネントライブラリのNPM公開フロー)

---

## 2. Backend (バックエンド領域)

### Level 1: Runtime & Memory Models (言語・ランタイム深層)
*   **言語ランタイムの並行処理モデル**
    *   **Node.js**: シングルスレッド・イベントループ、Libuvによるスレッドプール管理
    *   **Go**: Go Scheduler (G-M-Pモデル)、Work Stealingアルゴリズム、Goroutines
    *   **Rust**: Ownership/Borrowingシステム、Thread-safety (`Send`/`Sync`), Tokio (非同期エグゼキュータ)
    *   **Python/Ruby**: GIL (Global Interpreter Lock) の限界と非同期I/O (`asyncio`, `Fiber`)
    *   **Java**: JVMメモリ構造 (Heap/Stack/Metaspace), ガベージコレクション (G1GC, ZGC)
*   **I/O モデル**
    *   ブロッキングI/O vs ノンブロッキングI/O
    *   I/Oマルチプレキシング (select, poll, epoll, kqueue)
    *   非同期I/O (io_uring)

### Level 2: API Architecture & Communication
*   **API設計と通信プロトコル**
    *   **REST**: 冪等性、ステートレス、HATEOAS、HTTPメソッドとステータスコードの厳密な定義
    *   **GraphQL**: スキーマ駆動開発、AST解析、N+1問題の解決 (DataLoader)、Query/Mutation/Subscription
    *   **gRPC / Protocol Buffers**: バイナリシリアライズ、HTTP/2マルチプレキシング、Streaming RPCs (Unary, Server, Client, Bidirectional)
    *   **Realtime**: WebSockets (プロトコルアップグレードメカニズム), Server-Sent Events (SSE), WebRTC
*   **APIゲートウェイ & プロキシ**
    *   リバースプロキシ (Nginx, Envoy) の役割と設定
    *   レートリミッティングアルゴリズム (Token Bucket, Leaky Bucket, Sliding Window Log)

### Level 3: Database & Storage Engine (データ永続化)
*   **RDBMSの内包メカニズム**
    *   ストレージエンジン (InnoDB等) の構造: B+Treeインデックス、LSM-Treeの仕組み
    *   トランザクションとACID特性: WAL (Write-Ahead Logging), MVCC (Multi-Version Concurrency Control)
    *   分離レベル (Read Uncommitted, Read Committed, Repeatable Read, Serializable) と各種アノマリー (Dirty Read, Non-repeatable Read, Phantom Read, Write Skew)
*   **NoSQL & 分散データベース**
    *   **Document-store**: MongoDBのシャーディングとレプリケーション
    *   **Key-Value**: Redisのメモリモデル、永続化（RDB/AOF）、クラスタリング、分散ロック (Redlock)
    *   **分散システム理論**: CAP定理, PACELC定理, イベント一貫性 (Eventual Consistency)
*   **キャッシュ戦略**
    *   Cache-aside, Write-through, Write-behind
    *   キャッシュフラグメンテーションと Cache Stampede 対策

### Level 4: Software Architecture Patterns
*   **設計原則とパターン**
    *   SOLID原則の具現化とアンチパターン
    *   DDD (Domain-Driven Design): ドメインモデル、境界づけられたコンテキスト、エンティティ/値オブジェクト/集約/リポジトリ
    *   Clean Architecture / Hexagonal Architecture (Ports and Adapters): ドメインロジックのフレームワーク・DBからの分離
*   **非同期・イベント駆動アーキテクチャ**
    *   メッセージブローカー: RabbitMQ (AMQP), Apache Kafka (ログアペンド構造, コンシューマーグループ, パーティショニング)
    *   Event Sourcing & CQRS (Command Query Responsibility Segregation)

### Level 5: Security, Auth & Repository Structure
*   **認可と認証**
    *   OAuth 2.0 / OpenID Connect (OIDC) の各種フロー (Authorization Code Flow with PKCE)
    *   JWT (JSON Web Token) のセキュリティ特性、署名検証、セキュリティリスクとベストプラクティス
    *   暗号技術: 対称鍵暗号/非対称鍵暗号、パスワードハッシュ (Argon2, bcrypt), TLSハンドシェイク
*   **バックエンドリポジトリのディレクトリ構造**
    *   Go/TypeScript/Python等における典型的なクリーン/DDD構造
    *   データベースマイグレーションの自動化と無停止デプロイ (Blue-Green / Expand-Contractパターン)

---

## 3. Infrastructure (インフラ領域)

### Level 1: Linux & OS Internals
*   **Linuxカーネルとシステムコール**
    *   プロセス管理: Fork, Exec, スレッドと軽量プロセス (LWP)
    *   メモリ管理: 仮想メモリ、ページテーブル、MMU、OOM (Out Of Memory) Killerの挙動
    *   ファイルシステム: VFS (Virtual File System), i-node, ページキャッシュの仕組み
*   **ネットワーク低レイヤー**
    *   TCP/IP プロトコルスタック: 3ウェイハンドシェイク、4ウェイ切断、フロー制御 (Window Size)、混雑制御
    *   DNS解決フロー: ルートサーバーからTLD、再帰的リゾルバ、DNSレコードの伝播

### Level 2: Networking & Traffic Management
*   **ルーティング & ロードバランシング**
    *   L4 (TCP/UDP) vs L7 (HTTP/HTTPS) ロードバランシングアルゴリズム
    *   IP Anycast と BGP (Border Gateway Protocol) ルーティング
    *   CDN (Content Delivery Network) のキャッシュパージ、エッジコンピューティング (Cloudflare Workers, Lambda@Edge)
*   **仮想ネットワーク**
    *   VPC (Virtual Private Cloud) 設計: サブネット分割、ルートテーブル、NATゲートウェイ、VPCピアリング/Transit Gateway

### Level 3: Computing & Virtualization
*   **仮想化技術の歴史と実装**
    *   ハイパーバイザ型仮想化 (Type-1 / Type-2)
    *   コンテナ仮想化: Linux Namespaces (PID, Net, IPC, Mnt, UTS, User), Cgroups (資源制限), Union File System (OverlayFS)
*   **サーバーレス・コンピュートプラットフォーム**
    *   FaaS (Function as a Service) のコールドスタート対策、マイクロVM技術 (Firecracker)

### Level 4: Cloud Architecture & High Availability
*   **クラウドプロバイダーのコアアーキテクチャ (AWS / GCP / Azure)**
    *   IAM (Identity and Access Management): 最小特権の原則、ロールベースアクセス制御 (RBAC)、一時クレデンシャル
    *   高可用性 (HA) 設計: マルチAZ / マルチリージョン展開、アクティブ-アクティブ vs アクティブ-パッシブ
    *   ディザスタリカバリ (DR) 戦略: RPO (目標復旧時点) と RTO (目標復旧時間) に基づく設計 (Pilot Light, Warm Standby, Multi-Site)

### Level 5: Security & Compliance
*   **ゼロトラストネットワーク**
    *   境界型防御の限界と、ID中心の認証・認可 (Zero Trust Network Architecture)
    *   KMS (Key Management Service) / ハードウェアセキュリティモジュール (HSM) によるデータ暗号化キー (DEK/KEK) の管理
    *   コンプライアンス要件 (SOC 2, ISO 27001, PCI-DSS, GDPR) とインフラ実装への落とし込み

---

## 4. DevOps (デボプス領域)

### Level 1: Containerization & Local Dev Experience
*   **Dockerエンジンの仕組み**
    *   Dockerデーモンと Containerd, runc (OCI標準仕様)
    *   Dockerfileの最適化: マルチステージビルド、キャッシュレイヤー、ディストロレスイメージによる脆弱性の最小化
    *   ローカル開発環境のコンテナ標準化 (Docker Compose, Devcontainers)

### Level 2: Container Orchestration (Kubernetes)
*   **Kubernetes (K8s) 内部アーキテクチャ**
    *   Control Plane: kube-apiserver, etcd, kube-scheduler, kube-controller-manager
    *   Worker Node: kubelet, kube-proxy, Container Runtime (CRI)
*   **K8s リソース設計と制御**
    *   Podライフサイクル、Deployment, StatefulSet, DaemonSetの使い分け
    *   Networking: CNI (Container Network Interface), Service (ClusterIP, NodePort, LoadBalancer), Ingressコントローラ
    *   オートスケーリング: HPA (Horizontal Pod Autoscaler), VPA (Vertical Pod Autoscaler), Cluster Autoscaler / Karpenter

### Level 3: Infrastructure as Code (IaC) & GitOps
*   **IaC (Infrastructure as Code) の設計と運用**
    *   宣言型 (Declarative) vs 手続き型 (Imperative)
    *   Terraform / OpenTofu: 状態管理 (Stateファイル, ロック機構)、モジュール設計、プロバイダの仕組み
    *   Pulumi: 汎用プログラミング言語を用いたインフラ定義の長所と短所
*   **GitOps プラクティス**
    *   プル型 (Pull-based) デプロイメントの利点
    *   ArgoCD, Flux による継続的デリバリーと状態乖離 (Drift) の自動修復

### Level 4: Continuous Integration & Delivery (CI/CD)
*   **CI/CD パイプライン設計**
    *   GitHub Actions, GitLab CI のワークフロー設計とセキュアなシークレット管理 (OIDC連携によるキーレス認証)
    *   デプロイ戦略: Blue-Green デプロイメント、カナリアデプロイメント、ローリングアップデート
    *   フィーチャーフラグ (Feature Flags) によるデプロイとリリースの分離

### Level 5: Observability & Reliability (SRE)
*   **Observability (可観測性) の3つの柱**
    *   **Metrics**: Prometheus (プル型) / Grafana による視覚化、時系列データベース (TSDB)
    *   **Logs**: 構造化ログ (JSON), ELK (Elasticsearch/Logstash/Kibana) または PLG (Promtail/Loki/Grafana) スタック
    *   **Distributed Tracing**: OpenTelemetry 標準、W3C Trace Context 伝播、Jaeger/Zipkin による分散追跡
*   **SRE (Site Reliability Engineering) プラクティス**
    *   SLI (サービスレベル指標) と SLO (サービスレベル目標) の定義、Error Budget (エラー予算) の管理
    *   ポストモーテム (障害報告書) の文化と Blameless (非難のない) 分析
    *   カオスエンジニアリング (Chaos Engineering) の概念と耐障害性テスト

---

## 💡 AI駆動開発（Cursor/Copilot等）時代における「Dev-Edu」の学習効果

現代の開発現場では、AIコード生成により「動くコード」が瞬時に手に入ります。しかし、**「なぜ動くのか」「どのようなアーキテクチャや低レイヤーの制約に基づいて選択されたコードなのか」**を説明・評価できるエンジニアと、そうでないエンジニアとの間で大きな二極化が発生しています。

Dev-Eduのこのシラバスは、以下の能力を身につけることを目的としています。
1.  **AIが提示したコードの脆弱性・アンチパターンを瞬時に見抜く力**（言語シンタックスの深層やセキュリティ標準の理解）
2.  **AIに指示する「プロンプト」や「文脈」をシステム設計レベルで定義する力**（クリーンアーキテクチャ、インフラ・DevOps設計の理解）
3.  **モダンプラットフォームでのボトルネックを発見・解消する力**（ブラウザレンダリングパイプライン、DB分離レベル、I/Oモデルの理解）
