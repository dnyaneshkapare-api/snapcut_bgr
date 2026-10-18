import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Copy,
  CreditCard,
  Download,
  FileImage,
  FileKey2,
  Gauge,
  History,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Rocket,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { createQuickCut, validateImageDimensions, validateImageFile } from './lib/backgroundRemoval'
import type { AppView, UploadRecord, UploadStage } from './lib/types'

const navItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard; badge?: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workspace', label: 'Upload workspace', icon: ImagePlus, badge: 'NEW' },
  { id: 'history', label: 'Upload history', icon: History },
  { id: 'billing', label: 'Billing & credits', icon: CreditCard },
  { id: 'api', label: 'API keys', icon: KeyRound },
  { id: 'admin', label: 'Admin analytics', icon: BarChart3 },
]

const initialRecords: UploadRecord[] = [
  { id: 'sc_01', name: 'studio-product-hero.png', size: '2.4 MB', createdAt: 'Today, 10:42 AM', status: 'Complete', type: 'PNG' },
  { id: 'sc_02', name: 'summer-lookbook-04.jpg', size: '1.8 MB', createdAt: 'Today, 9:16 AM', status: 'Complete', type: 'JPG' },
  { id: 'sc_03', name: 'creator-kit.webp', size: '886 KB', createdAt: 'Yesterday, 6:04 PM', status: 'Complete', type: 'WEBP' },
  { id: 'sc_04', name: 'coffee-packaging.png', size: '3.1 MB', createdAt: 'Yesterday, 2:28 PM', status: 'Complete', type: 'PNG' },
]

function routeToView(path: string): AppView {
  if (path.includes('workspace')) return 'workspace'
  if (path.includes('history')) return 'history'
  if (path.includes('billing')) return 'billing'
  if (path.includes('api-keys')) return 'api'
  if (path.includes('admin')) return 'admin'
  return 'dashboard'
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileType(file: File) {
  return file.type.split('/')[1]?.toUpperCase() ?? 'IMAGE'
}

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<AppView>(() => routeToView(window.location.pathname))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [toast, setToast] = useState('')
  const [records, setRecords] = useState<UploadRecord[]>(initialRecords)
  const [isDragging, setIsDragging] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  useEffect(() => {
    const onHashChange = () => setView(routeToView(window.location.hash.replace('#', '') || window.location.pathname))
    const onPopState = () => setView(routeToView(window.location.pathname))
    window.addEventListener('hashchange', onHashChange)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  useEffect(() => {
    const titles: Record<AppView, string> = {
      dashboard: 'Dashboard',
      workspace: 'Upload workspace',
      history: 'Upload history',
      billing: 'Billing & credits',
      api: 'API keys',
      admin: 'Admin analytics',
    }
    document.title = `${titles[view]} · SnapCut AI`
  }, [view])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
  }, [sourceUrl, resultUrl])

  const setActiveView = (nextView: AppView) => {
    setView(nextView)
    setMobileNavOpen(false)
    const path = nextView === 'dashboard' ? '/' : `/${nextView === 'api' ? 'api-keys' : nextView}`
    window.history.replaceState({}, '', path)
  }

  const clearOutput = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setSelectedFile(null)
    setSourceUrl(null)
    setResultUrl(null)
    setUploadStage('idle')
    setErrorMessage('')
  }

  const handleFiles = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setErrorMessage('')
    setUploadStage('validating')
    const typeError = validateImageFile(file)
    if (typeError) {
      setUploadStage('error')
      setErrorMessage(typeError)
      return
    }
    let dimensionError: string | null = null
    try {
      dimensionError = await validateImageDimensions(file)
    } catch {
      dimensionError = 'We could not read that image. Try exporting it again as JPG, PNG, or WEBP.'
    }
    if (dimensionError) {
      setUploadStage('error')
      setErrorMessage(dimensionError)
      return
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setSelectedFile(file)
    setSourceUrl(URL.createObjectURL(file))
    setResultUrl(null)
    setUploadStage('idle')
    setToast('Image ready — clean cut is one click away.')
  }

  const processSelected = async () => {
    if (!selectedFile) {
      inputRef.current?.click()
      return
    }
    setUploadStage('processing')
    setErrorMessage('')
    try {
      const resultBlob = await createQuickCut(selectedFile)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(URL.createObjectURL(resultBlob))
      setUploadStage('complete')
      const newRecord: UploadRecord = {
        id: `sc_${Date.now()}`,
        name: selectedFile.name,
        size: formatBytes(selectedFile.size),
        createdAt: 'Just now',
        status: 'Complete',
        type: fileType(selectedFile),
        resultUrl: URL.createObjectURL(resultBlob),
      }
      setRecords((current) => [newRecord, ...current])
      setToast('Background removed. Your transparent PNG is ready.')
    } catch (error) {
      setUploadStage('error')
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong while processing this image.')
    }
  }

  const downloadResult = () => {
    if (!resultUrl || !selectedFile) return
    const anchor = document.createElement('a')
    anchor.href = resultUrl
    anchor.download = `${selectedFile.name.replace(/\.[^.]+$/, '')}-snapcut.png`
    anchor.click()
    setToast('Download started — your file is ready to use.')
  }

  const downloadRecord = (record: UploadRecord) => {
    if (!record.resultUrl) {
      setToast('This older asset is metadata-only in the preview. Process a new upload to download it here.')
      return
    }
    const anchor = document.createElement('a')
    anchor.href = record.resultUrl
    anchor.download = `${record.name.replace(/\.[^.]+$/, '')}-snapcut.png`
    anchor.click()
    setToast('Download started — your file is ready to use.')
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    void handleFiles(Array.from(event.dataTransfer.files))
  }

  const copyApiKey = async () => {
    await navigator.clipboard?.writeText('sc_live_••••••••••••••••')
    setCopiedKey(true)
    setToast('API key copied to clipboard.')
    window.setTimeout(() => setCopiedKey(false), 1800)
  }

  const viewTitle = useMemo(() => navItems.find((item) => item.id === view)?.label ?? 'Dashboard', [view])

  return (
    <div className="app-shell">
      <div className={`mobile-overlay ${mobileNavOpen ? 'is-visible' : ''}`} onClick={() => setMobileNavOpen(false)} />
      <Sidebar activeView={view} isOpen={mobileNavOpen} onNavigate={setActiveView} />
      <main className="app-main">
        <Topbar title={viewTitle} onMenu={() => setMobileNavOpen(true)} />
        <div className="page-content">
          {view === 'dashboard' && (
            <DashboardView
              sourceUrl={sourceUrl}
              resultUrl={resultUrl}
              selectedFile={selectedFile}
              uploadStage={uploadStage}
              errorMessage={errorMessage}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              inputRef={inputRef}
              onFiles={handleFiles}
              onDrop={handleDrop}
              onProcess={processSelected}
              onDownload={downloadResult}
              onClear={clearOutput}
              onNavigate={setActiveView}
              records={records}
            />
          )}
          {view === 'workspace' && (
            <WorkspaceView
              sourceUrl={sourceUrl}
              resultUrl={resultUrl}
              selectedFile={selectedFile}
              uploadStage={uploadStage}
              errorMessage={errorMessage}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              inputRef={inputRef}
              onFiles={handleFiles}
              onDrop={handleDrop}
              onProcess={processSelected}
              onDownload={downloadResult}
              onClear={clearOutput}
            />
          )}
          {view === 'history' && <HistoryView records={records} onNavigate={setActiveView} onDownload={downloadRecord} />}
          {view === 'billing' && <BillingView onToast={setToast} />}
          {view === 'api' && <ApiView copiedKey={copiedKey} onCopy={copyApiKey} />}
          {view === 'admin' && <AdminView />}
        </div>
      </main>
      {toast && <div className="toast"><CheckCircle2 size={17} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button></div>}
    </div>
  )
}

function Sidebar({ activeView, isOpen, onNavigate }: { activeView: AppView; isOpen: boolean; onNavigate: (view: AppView) => void }) {
  return (
    <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="sidebar-head">
        <button className="brand" onClick={() => onNavigate('dashboard')} aria-label="Go to dashboard">
          <span className="brand-mark"><span>SC</span></span>
          <span className="brand-copy"><strong>SnapCut</strong><em>AI</em></span>
        </button>
        <button className="icon-button sidebar-close" onClick={() => onNavigate(activeView)} aria-label="Close navigation"><PanelLeftClose size={18} /></button>
      </div>
      <div className="workspace-switcher">
        <div className="workspace-avatar">NC</div>
        <div><span className="eyebrow">Workspace</span><strong>Northstar Creative</strong></div>
        <ChevronDown size={15} />
      </div>
      <nav className="primary-nav" aria-label="Primary navigation">
        <span className="nav-label">Workspace</span>
        {navItems.slice(0, 3).map((item) => <NavItem key={item.id} item={item} active={activeView === item.id} onClick={() => onNavigate(item.id)} />)}
        <span className="nav-label nav-label-spaced">Manage</span>
        {navItems.slice(3).map((item) => <NavItem key={item.id} item={item} active={activeView === item.id} onClick={() => onNavigate(item.id)} />)}
      </nav>
      <div className="sidebar-foot">
        <div className="usage-mini">
          <div className="usage-mini-head"><span>Free plan</span><strong>4 / 5 credits</strong></div>
          <div className="meter"><span style={{ width: '80%' }} /></div>
          <p>Resets tomorrow at 12:00 AM</p>
          <button className="upgrade-link" onClick={() => onNavigate('billing')}>Upgrade to Pro <ArrowUpRight size={14} /></button>
        </div>
        <button className="support-link"><LifeBuoy size={16} /> Help center <ArrowUpRight size={13} /></button>
        <button className="user-row"><span className="user-avatar">AM</span><span className="user-meta"><strong>Alex Morgan</strong><small>Owner</small></span><MoreHorizontal size={17} /></button>
      </div>
    </aside>
  )
}

function NavItem({ item, active, onClick }: { item: typeof navItems[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}><Icon size={17} /><span>{item.label}</span>{item.badge && <small>{item.badge}</small>}</button>
}

function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  return <header className="topbar">
    <div className="topbar-title"><button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={19} /></button><span className="breadcrumb">SnapCut AI <span>/</span></span><strong>{title}</strong></div>
    <div className="topbar-actions"><button className="icon-button topbar-search" aria-label="Search"><Search size={18} /></button><button className="icon-button" aria-label="Notifications"><Bell size={18} /><i className="notification-dot" /></button><div className="topbar-divider" /><button className="topbar-profile"><span className="user-avatar">AM</span><ChevronDown size={15} /></button></div>
  </header>
}

interface WorkspaceProps {
  sourceUrl: string | null
  resultUrl: string | null
  selectedFile: File | null
  uploadStage: UploadStage
  errorMessage: string
  isDragging: boolean
  setIsDragging: (value: boolean) => void
  inputRef: React.RefObject<HTMLInputElement>
  onFiles: (files: File[]) => void | Promise<void>
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onProcess: () => void | Promise<void>
  onDownload: () => void
  onClear: () => void
}

function DashboardView(props: WorkspaceProps & { onNavigate: (view: AppView) => void; records: UploadRecord[] }) {
  return <>
    <section className="page-intro dashboard-intro"><div><span className="eyebrow accent-eyebrow"><Sparkles size={13} /> AI background removal</span><h1>Backgrounds, gone.</h1><p>Clean cutouts for your next launch, campaign, or scroll-stopper.</p></div><button className="secondary-button" onClick={() => props.onNavigate('history')}><History size={16} /> View history</button></section>
    <WorkspaceCard compact {...props} />
    <div className="stats-grid"><StatCard label="Processed this month" value="42" trend="+18%" helper="vs. last month" icon={Zap} tone="pink" /><StatCard label="Avg. processing time" value="3.8s" trend="-12%" helper="faster than last month" icon={Gauge} tone="aqua" /><StatCard label="Credits remaining" value="1 / 5" trend="80%" helper="daily quota used" icon={Activity} tone="violet" /></div>
    <div className="dashboard-bottom"><RecentActivity records={props.records.slice(0, 4)} onNavigate={props.onNavigate} /><ProductSignal /></div>
  </>
}

function WorkspaceView(props: WorkspaceProps) {
  return <>
    <section className="page-intro"><div><span className="eyebrow accent-eyebrow"><UploadCloud size={13} /> Upload workspace</span><h1>Make the cut.</h1><p>Upload a product, portrait, or campaign asset. We’ll return a clean transparent PNG.</p></div><div className="status-pill"><span className="status-pulse" /> System operational</div></section>
    <WorkspaceCard {...props} />
    <div className="workflow-strip"><div><span className="workflow-number">01</span><strong>Upload an image</strong><small>JPG, PNG, or WEBP up to 10 MB</small></div><div className="workflow-line" /><div><span className="workflow-number">02</span><strong>SnapCut processes it</strong><small>Transparent edges in under 5 seconds</small></div><div className="workflow-line" /><div><span className="workflow-number">03</span><strong>Download & ship</strong><small>Export a ready-to-use PNG</small></div></div>
  </>
}

function WorkspaceCard({ sourceUrl, resultUrl, selectedFile, uploadStage, errorMessage, isDragging, setIsDragging, inputRef, onFiles, onDrop, onProcess, onDownload, onClear, compact = false }: WorkspaceProps & { compact?: boolean }) {
  const hasFile = Boolean(selectedFile && sourceUrl)
  const readyFile = selectedFile!
  return <section className={`workspace-card ${compact ? 'compact' : ''}`}>
    <div className="workspace-card-head"><div><span className="eyebrow">Quick cut</span><h2>{hasFile ? 'Your image is in the room.' : 'Drop it. We’ll handle the edges.'}</h2></div><div className="secure-note"><ShieldCheck size={15} /> Private & auto-deleted after 24h</div></div>
    <input ref={inputRef} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void onFiles([file]); event.currentTarget.value = '' }} />
    {!hasFile ? <div className={`drop-zone ${isDragging ? 'is-dragging' : ''} ${uploadStage === 'error' ? 'has-error' : ''}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
      <div className="drop-orbit"><UploadCloud size={27} /></div><strong>Drop your image here</strong><span>or <button type="button" onClick={(event) => { event.stopPropagation(); inputRef.current?.click() }}>browse files</button></span><small>JPG, PNG, WEBP <i>•</i> max 10 MB <i>•</i> 5000 × 5000 px</small>
      {errorMessage && <div className="inline-error"><X size={14} /> {errorMessage}</div>}
    </div> : <div className={`cut-preview ${uploadStage === 'processing' ? 'is-processing' : ''}`}>
      <div className="preview-topline"><span className="file-chip"><FileImage size={15} /> {readyFile.name}</span><button className="icon-button" onClick={onClear} aria-label="Remove selected file"><X size={17} /></button></div>
      <div className="preview-grid"><PreviewPane label="Original" src={sourceUrl} /><div className="preview-arrow"><ArrowUpRight size={17} /></div><PreviewPane label={uploadStage === 'complete' ? 'Transparent PNG' : 'Output preview'} src={resultUrl ?? sourceUrl} output={Boolean(resultUrl)} loading={uploadStage === 'processing'} /></div>
      {uploadStage === 'processing' && <div className="processing-label"><span className="spinner" /> Removing background · finding edges · exporting PNG</div>}
      {uploadStage === 'error' && <div className="inline-error"><X size={14} /> {errorMessage}</div>}
      <div className="preview-actions"><div><span className="file-meta">{formatBytes(readyFile.size)} <i>•</i> {fileType(readyFile)} <i>•</i> {uploadStage === 'complete' ? 'Ready to download' : 'Local quick cut preview'}</span><span className="privacy-line"><ShieldCheck size={13} /> Files auto-delete after 24 hours</span></div><div className="button-row">{uploadStage === 'complete' && <button className="secondary-button" onClick={onDownload}><Download size={16} /> Download PNG</button>}<button className="primary-button" onClick={() => void onProcess()} disabled={uploadStage === 'processing'}>{uploadStage === 'complete' ? <><Sparkles size={16} /> Run again</> : <><Sparkles size={16} /> {uploadStage === 'processing' ? 'Working…' : 'Remove background'}</>}</button></div></div>
    </div>}
    <div className="workspace-footer"><span><Check size={13} /> No account required for a quick preview</span><span><ShieldCheck size={13} /> Encrypted in transit</span><span><Clock3 size={13} /> Typical turnaround under 5 seconds</span></div>
  </section>
}

function PreviewPane({ label, src, output, loading }: { label: string; src: string | null; output?: boolean; loading?: boolean }) {
  return <div className={`preview-pane ${output ? 'output' : ''}`}><div className="preview-label"><span>{label}</span>{output && <span className="ready-tag"><Check size={11} /> ready</span>}</div><div className={`preview-image ${output ? 'checkerboard' : ''}`}>{loading ? <div className="preview-loading"><span className="spinner" /><small>Working on the edges</small></div> : src ? <img src={src} alt={label} /> : <div className="empty-preview"><ImagePlus size={23} /></div>}</div></div>
}

function StatCard({ label, value, trend, helper, icon: Icon, tone }: { label: string; value: string; trend: string; helper: string; icon: typeof Zap; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={17} /></div><div className="stat-copy"><span>{label}</span><div><strong>{value}</strong><em className={tone}>{trend}</em></div><small>{helper}</small></div><ArrowUpRight className="stat-arrow" size={16} /></div>
}

function RecentActivity({ records, onNavigate }: { records: UploadRecord[]; onNavigate: (view: AppView) => void }) {
  return <section className="panel activity-panel"><div className="panel-head"><div><span className="eyebrow">Recent activity</span><h2>Latest uploads</h2></div><button className="text-button" onClick={() => onNavigate('history')}>See all <ArrowUpRight size={14} /></button></div><div className="activity-list">{records.map((record) => <div className="activity-row" key={record.id}><div className="thumb-placeholder"><FileImage size={17} /></div><div className="activity-info"><strong>{record.name}</strong><small>{record.createdAt} <i>•</i> {record.size}</small></div><span className="complete-badge"><CheckCircle2 size={13} /> {record.status}</span><button className="icon-button more-button" aria-label={`More actions for ${record.name}`}><MoreHorizontal size={17} /></button></div>)}</div></section>
}

function ProductSignal() {
  return <section className="panel signal-panel"><div className="signal-orb"><Sparkles size={22} /></div><span className="eyebrow accent-eyebrow">SnapCut signal</span><h2>Your cleanest week yet.</h2><p>You’re processing <strong>18% more</strong> assets than last month. Keep shipping the sharp stuff.</p><div className="signal-chart"><span style={{ height: '37%' }} /><span style={{ height: '49%' }} /><span style={{ height: '45%' }} /><span style={{ height: '62%' }} /><span style={{ height: '58%' }} /><span style={{ height: '76%' }} /><span style={{ height: '91%' }} /></div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></section>
}

function HistoryView({ records, onNavigate, onDownload }: { records: UploadRecord[]; onNavigate: (view: AppView) => void; onDownload: (record: UploadRecord) => void }) {
  return <><section className="page-intro"><div><span className="eyebrow accent-eyebrow"><History size={13} /> Asset history</span><h1>Everything you’ve cut.</h1><p>Your last 7 days of processed images, organized and ready to download.</p></div><button className="primary-button" onClick={() => onNavigate('workspace')}><Plus size={16} /> New upload</button></section><section className="panel history-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input placeholder="Search uploads" /></div><button className="filter-button">Last 7 days <ChevronDown size={14} /></button><button className="icon-button"><MoreHorizontal size={17} /></button></div><div className="history-table"><div className="table-row table-heading"><span>Asset</span><span>Type</span><span>Added</span><span>Status</span><span /></div>{records.map((record) => <div className="table-row" key={record.id}><div className="asset-cell"><div className="thumb-placeholder"><FileImage size={16} /></div><strong>{record.name}</strong></div><span className="type-label">{record.type}</span><span className="table-muted">{record.createdAt}</span><span className="complete-badge"><CheckCircle2 size={13} /> {record.status}</span><button className="icon-button" onClick={() => onDownload(record)} aria-label={`Download ${record.name}`}><Download size={16} /></button></div>)}</div><div className="table-foot"><span>Showing {records.length} of {records.length} uploads</span><div><button className="pagination-button" disabled>Previous</button><button className="pagination-button">Next</button></div></div></section></>
}

function BillingView({ onToast }: { onToast: (message: string) => void }) {
  return <><section className="page-intro"><div><span className="eyebrow accent-eyebrow"><CreditCard size={13} /> Billing & credits</span><h1>Scale the clean cut.</h1><p>Start free, then unlock unlimited processing when your next sprint takes off.</p></div><div className="billing-cycle"><button className="active">Monthly</button><button>Yearly <em>save 20%</em></button></div></section><div className="plan-grid"><PlanCard label="Free" price="₹0" copy="For testing the waters" features={['5 images per day', '7-day upload history', 'Standard processing', 'PNG exports']} button="Current plan" current onClick={() => onToast('You are already on the Free plan.')} /><PlanCard label="Pro" price="₹799" suffix="/ month" copy="For creators who ship" features={['Unlimited images', 'Unlimited history', 'Priority processing', 'API access + keys']} button="Upgrade to Pro" featured onClick={() => onToast('Razorpay checkout is ready to connect.')} /><PlanCard label="Credit pack" price="₹299" suffix="/ 50 credits" copy="For one-off campaigns" features={['50 image credits', 'Credits never expire', 'Instant delivery', 'No subscription']} button="Buy credits" onClick={() => onToast('Credit pack order handoff opened.')} /></div><section className="panel billing-footnote"><div className="footnote-icon"><ShieldCheck size={18} /></div><div><strong>Payments secured by Razorpay</strong><p>We only store your plan status and transaction reference. Card details stay with Razorpay.</p></div><ArrowUpRight size={16} /></section></>
}

function PlanCard({ label, price, suffix, copy, features, button, featured, current, onClick }: { label: string; price: string; suffix?: string; copy: string; features: string[]; button: string; featured?: boolean; current?: boolean; onClick: () => void }) {
  return <article className={`plan-card ${featured ? 'featured' : ''}`}><div className="plan-top"><span className="eyebrow">{label}</span>{featured && <span className="popular-tag">Most popular</span>}</div><div className="plan-price"><strong>{price}</strong>{suffix && <span>{suffix}</span>}</div><p>{copy}</p><div className="plan-features">{features.map((feature) => <span key={feature}><Check size={14} /> {feature}</span>)}</div><button className={featured ? 'primary-button' : 'secondary-button'} disabled={current} onClick={onClick}>{current && <Check size={15} />}{button}</button></article>
}

function ApiView({ copiedKey, onCopy }: { copiedKey: boolean; onCopy: () => void }) {
  return <><section className="page-intro"><div><span className="eyebrow accent-eyebrow"><FileKey2 size={13} /> B2B API</span><h1>Ship the cut in your product.</h1><p>One endpoint for transparent assets, with usage controls that feel as clean as the output.</p></div><button className="secondary-button"><CircleHelp size={16} /> Read docs</button></section><div className="api-grid"><section className="panel api-key-panel"><div className="panel-head"><div><span className="eyebrow">Live credentials</span><h2>API keys</h2></div><button className="primary-button small"><Plus size={15} /> New key</button></div><div className="key-row"><div className="key-icon"><KeyRound size={17} /></div><div><strong>Production key</strong><small>sc_live_••••••••••••••••</small></div><span className="key-status"><span /> Active</span><button className="icon-button" onClick={onCopy} aria-label="Copy API key">{copiedKey ? <Check size={16} /> : <Copy size={16} />}</button></div><div className="key-note"><ShieldCheck size={16} /><span>Keys are shown once. Rotate credentials if you suspect they’ve been exposed.</span></div></section><section className="panel endpoint-panel"><div className="panel-head"><div><span className="eyebrow">Quick start</span><h2>Remove a background</h2></div><span className="method-tag">POST</span></div><pre><code><span className="code-muted">curl</span> https://api.snapcut.ai/v1/remove-background \
  -H <span className="code-string">"Authorization: Bearer $SNAPCUT_KEY"</span> \
  -F <span className="code-string">"image=@product.png"</span></code></pre><div className="endpoint-foot"><span><Activity size={14} /> 99.5% uptime target</span><span><Clock3 size={14} /> Avg. 3.8s</span></div></section></div><div className="api-stat-grid"><StatCard label="API calls this month" value="1,240" trend="+32%" helper="2,000 included" icon={Activity} tone="pink" /><StatCard label="Success rate" value="99.2%" trend="+0.4%" helper="last 30 days" icon={ShieldCheck} tone="aqua" /><StatCard label="Rate limit" value="60/min" trend="live" helper="per API key" icon={Gauge} tone="violet" /></div></>
}

function AdminView() {
  return <><section className="page-intro"><div><span className="eyebrow accent-eyebrow"><BarChart3 size={13} /> Admin analytics</span><h1>Control room.</h1><p>Keep an eye on usage, revenue, and the workflow health behind every clean cut.</p></div><div className="date-filter"><Clock3 size={15} /> Last 30 days <ChevronDown size={14} /></div></section><div className="admin-stat-grid"><AdminMetric label="Total users" value="8,492" trend="+14.8%" icon={Users} /><AdminMetric label="Images processed" value="124.6k" trend="+22.4%" icon={FileImage} /><AdminMetric label="MRR" value="₹4.82L" trend="+9.2%" icon={Rocket} /><AdminMetric label="Workflow health" value="99.98%" trend="All systems go" icon={ShieldCheck} /></div><div className="admin-grid"><section className="panel chart-panel"><div className="panel-head"><div><span className="eyebrow">Volume overview</span><h2>Processing activity</h2></div><span className="chart-legend"><i /> images processed</span></div><div className="large-chart"><div className="chart-gridlines"><span /><span /><span /><span /></div><svg viewBox="0 0 700 240" role="img" aria-label="Processing activity trend"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ff2bd6" stopOpacity="0.28" /><stop offset="100%" stopColor="#ff2bd6" stopOpacity="0" /></linearGradient></defs><path d="M0,192 C54,176 73,170 104,178 S156,149 191,157 S236,131 268,143 S319,105 358,124 S406,84 441,100 S493,81 526,89 S580,45 615,65 S662,28 700,38 L700,240 L0,240 Z" fill="url(#chartFill)" /><path d="M0,192 C54,176 73,170 104,178 S156,149 191,157 S236,131 268,143 S319,105 358,124 S406,84 441,100 S493,81 526,89 S580,45 615,65 S662,28 700,38" fill="none" stroke="#ff2bd6" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-xlabels"><span>Sep 18</span><span>Sep 23</span><span>Sep 28</span><span>Oct 03</span><span>Oct 08</span><span>Oct 13</span><span>Oct 18</span></div></div></section><section className="panel health-panel"><div className="panel-head"><div><span className="eyebrow">System health</span><h2>Workflow status</h2></div><span className="health-dot">Live</span></div>{['n8n processing workflow', 'Supabase metadata sync', 'Cloudinary temp storage', 'Razorpay webhooks'].map((label, index) => <div className="health-row" key={label}><div className="health-icon"><Activity size={15} /></div><span>{label}</span><strong><i />{index === 3 ? '99.9%' : '100%'}</strong></div>)}<button className="text-button">View workflow logs <ArrowUpRight size={14} /></button></section></div></>
}

function AdminMetric({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: typeof Users }) {
  return <div className="admin-metric"><div className="metric-icon"><Icon size={18} /></div><span>{label}</span><strong>{value}</strong><small><ArrowUpRight size={12} /> {trend}</small></div>
}

export default App
