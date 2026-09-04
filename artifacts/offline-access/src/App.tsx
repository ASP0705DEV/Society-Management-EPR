import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight, Ban, Check, CheckCircle2, Clipboard, Clock3, Copy, Database,
  KeyRound, Menu, Package, QrCode, RefreshCw, ScanLine, ShieldCheck, UserRound,
  Wifi, WifiOff, X, XCircle,
} from 'lucide-react';
import {
  useCreatePass, useGetDashboardSummary, useGetGatePublicKey, useListGateEvents,
  useListPasses, useListRevocations, useRevokePass, useSyncEvents,
} from '@workspace/api-client-react';
import type { AccessPass, AccessPassInput, GateEvent } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');
const dateValue = (d: Date) => {
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
};
const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : 'Not synced yet';
const formatTime = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : '—';

function BrandMark() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-gatepass">
      <div className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#f6c945] text-[#1b2638] shadow-[4px_4px_0_#0e1725]">
        <ShieldCheck size={21} strokeWidth={2.6} />
      </div>
      <div>
        <div className="text-[15px] font-extrabold tracking-[-0.03em] text-white">gatepass</div>
        <div className="font-mono text-[9px] uppercase tracking-[.2em] text-slate-400">offline access</div>
      </div>
    </div>
  );
}

function StatusPill({ online, compact = false }: { online: boolean; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide', online ? 'border-[#9ed9ce] bg-[#e7f5f1] text-[#1d6d61]' : 'border-[#f1d17b] bg-[#fff7dd] text-[#9a7116]')} data-testid="status-connectivity">
      {online ? <Wifi size={12} /> : <WifiOff size={12} />}
      {!compact && (online ? 'Online' : 'Offline mode')}
    </span>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentGate = location === '/gate';
  return (
    <div className="noise min-h-[100dvh] bg-[#eef2f5]">
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[255px] flex-col bg-[#172234] px-5 py-6 text-white transition-transform duration-300 md:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full')} data-testid="sidebar-navigation">
        <BrandMark />
        <div className="mt-14 px-2 font-mono text-[10px] uppercase tracking-[.22em] text-slate-500">Workspace</div>
        <nav className="mt-3 space-y-1">
          <Link href="/" onClick={() => setMobileOpen(false)} data-testid="link-resident-home" className={cn('group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors', !currentGate ? 'bg-[#28384d] text-white' : 'text-slate-400 hover:bg-[#213149] hover:text-white')}>
            <ShieldCheck size={17} className={!currentGate ? 'text-[#f6c945]' : ''} /> Resident home
          </Link>
          <Link href="/gate" onClick={() => setMobileOpen(false)} data-testid="link-gate-console" className={cn('group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors', currentGate ? 'bg-[#28384d] text-white' : 'text-slate-400 hover:bg-[#213149] hover:text-white')}>
            <ScanLine size={17} className={currentGate ? 'text-[#f6c945]' : ''} /> Gate console
          </Link>
        </nav>
        <div className="mt-auto rounded-2xl border border-slate-700/80 bg-[#1d2b40] p-4">
          <div className="flex items-center gap-2 text-[#f6c945]"><Database size={15} /><span className="font-mono text-[10px] uppercase tracking-[.15em]">Local first</span></div>
          <p className="mt-2 text-xs leading-5 text-slate-400">Passes and entry decisions keep working when the connection does not.</p>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-slate-700/70 pt-5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#a9d9cf] text-xs font-extrabold text-[#172234]">MR</div>
          <div><div className="text-xs font-bold">Maya Rivera</div><div className="text-[10px] text-slate-500">Apt 4B · resident</div></div>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-30 bg-[#172234]/50 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation" />}
      <main className="min-h-[100dvh] md:pl-[255px]">
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-[#dce3e8] bg-[#eef2f5]/90 px-5 backdrop-blur-md md:px-10">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#d7e0e6] bg-white text-[#172234] md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={19} /></button>
          <div className="hidden md:block"><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#788693]">{currentGate ? 'Operations / gate console' : 'Resident / home'}</div><div className="mt-1 text-sm font-semibold text-[#172234]">{currentGate ? 'North entry checkpoint' : 'Good afternoon, Maya'}</div></div>
          <div className="ml-auto flex items-center gap-3"><StatusPill online={true} compact /><span className="hidden text-xs text-[#788693] sm:inline">Last checked just now</span><div className="grid h-9 w-9 place-items-center rounded-full bg-[#a9d9cf] text-xs font-extrabold text-[#172234] md:hidden">MR</div></div>
        </header>
        {children}
      </main>
    </div>
  );
}

function Skeleton({ className }: { className: string }) { return <div className={cn('animate-pulse rounded-xl bg-[#dfe7ec]', className)} />; }

function StatusTag({ status }: { status: AccessPass['status'] }) {
  const style = {
    active: 'bg-[#e7f5f1] text-[#267467] border-[#b1ddd4]',
    used: 'bg-[#edf0f3] text-[#697683] border-[#d6dee4]',
    revoked: 'bg-[#fdebea] text-[#a53e39] border-[#efc5c2]',
    expired: 'bg-[#fff3d6] text-[#9b741b] border-[#f1d799]',
  }[status];
  return <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.12em]', style)} data-testid={`status-pass-${status}`}>{status}</span>;
}

function CreatePassModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createPass = useCreatePass();
  const now = new Date();
  const [form, setForm] = useState({ type: 'guest' as AccessPassInput['type'], label: '', validFrom: dateValue(now), validTo: dateValue(new Date(now.getTime() + 3 * 60 * 60 * 1000)) });
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.label.trim()) { setError('Add a name so the gate team knows who is arriving.'); return; }
    if (new Date(form.validTo) <= new Date(form.validFrom)) { setError('The end time must be after the start time.'); return; }
    setError('');
    createPass.mutate({ data: { ...form, label: form.label.trim(), validFrom: new Date(form.validFrom).toISOString(), validTo: new Date(form.validTo).toISOString() } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/passes'] }); queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] }); onClose(); },
      onError: () => setError('We could not issue that pass. Check your connection and try again.'),
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#172234]/55 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" data-testid="dialog-create-pass">
      <div className="w-full max-w-[520px] rounded-t-[26px] bg-[#fffefa] p-6 shadow-[0_24px_80px_rgba(23,34,52,.25)] sm:rounded-[26px] sm:p-8">
        <div className="flex items-start justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#a57d15]">New signed pass</div><h2 className="mt-2 text-2xl font-extrabold tracking-[-.04em] text-[#172234]">Who should we expect?</h2><p className="mt-1 text-sm text-[#697683]">The pass will be verifiable at the gate without internet.</p></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#edf1f3] text-[#536371]" aria-label="Close create pass" data-testid="button-close-create-pass"><X size={17} /></button></div>
        <form className="mt-7 space-y-5" onSubmit={submit}>
          <div><label className="text-xs font-bold text-[#41515e]">Pass type</label><div className="mt-2 grid grid-cols-2 gap-2">
            {(['guest', 'delivery'] as const).map(type => <button type="button" key={type} onClick={() => setForm(v => ({ ...v, type }))} className={cn('flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-bold', form.type === type ? 'border-[#d5a918] bg-[#fff5ce] text-[#172234]' : 'border-[#dce3e8] bg-white text-[#697683]')} data-testid={`button-type-${type}`}>{type === 'guest' ? <UserRound size={16} /> : <Package size={16} />}{type === 'guest' ? 'Guest' : 'Delivery'}</button>)}
          </div></div>
          <div><label htmlFor="pass-label" className="text-xs font-bold text-[#41515e]">Name or delivery note</label><input id="pass-label" autoFocus value={form.label} onChange={e => setForm(v => ({ ...v, label: e.target.value }))} placeholder={form.type === 'guest' ? 'e.g. Jordan Lee' : 'e.g. Green Basket order'} className="mt-2 h-12 w-full rounded-xl border border-[#dce3e8] bg-white px-4 text-sm outline-none transition focus:border-[#d5a918] focus:ring-4 focus:ring-[#f6c945]/20" data-testid="input-pass-label" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label htmlFor="valid-from" className="text-xs font-bold text-[#41515e]">Valid from</label><input id="valid-from" type="datetime-local" value={form.validFrom} onChange={e => setForm(v => ({ ...v, validFrom: e.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-[#dce3e8] bg-white px-3 text-xs outline-none focus:border-[#d5a918]" data-testid="input-valid-from" /></div><div><label htmlFor="valid-to" className="text-xs font-bold text-[#41515e]">Valid until</label><input id="valid-to" type="datetime-local" value={form.validTo} onChange={e => setForm(v => ({ ...v, validTo: e.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-[#dce3e8] bg-white px-3 text-xs outline-none focus:border-[#d5a918]" data-testid="input-valid-to" /></div></div>
          {error && <div className="rounded-xl border border-[#efc5c2] bg-[#fdebea] px-3 py-2 text-xs font-semibold text-[#a53e39]" data-testid="error-create-pass">{error}</div>}
          <button type="submit" disabled={createPass.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#172234] text-sm font-extrabold text-[#fffefa] transition hover:bg-[#26384e] disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-pass">{createPass.isPending ? 'Signing pass…' : <><ShieldCheck size={17} className="text-[#f6c945]" /> Issue signed pass</>}</button>
        </form>
      </div>
    </div>
  );
}

function PassCard({ pass, onRevoke, onSelect }: { pass: AccessPass; onRevoke: (pass: AccessPass) => void; onSelect: (pass: AccessPass) => void }) {
  const delivery = pass.type === 'delivery';
  return (
    <div className="group relative rounded-2xl border border-[#dce3e8] bg-white p-5 shadow-[0_3px_10px_rgba(23,34,52,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(23,34,52,.09)]" data-testid={`card-pass-${pass.id}`}>
      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className={cn('grid h-10 w-10 place-items-center rounded-xl', delivery ? 'bg-[#e6edf8] text-[#3c6595]' : 'bg-[#fff2c8] text-[#a57d15]')}>{delivery ? <Package size={18} /> : <UserRound size={18} />}</div><div><div className="font-bold text-[#172234]" data-testid={`text-pass-label-${pass.id}`}>{pass.label}</div><div className="mt-0.5 text-[11px] text-[#82909b]">{delivery ? 'Delivery access' : 'Guest access'}</div></div></div><StatusTag status={pass.status} /></div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#edf0f2] pt-4"><div><div className="font-mono text-[9px] uppercase tracking-[.15em] text-[#9aa6af]">Window</div><div className="mt-1 text-xs font-semibold text-[#41515e]">{formatTime(pass.validFrom)} — {formatTime(pass.validTo)}</div></div><div><div className="font-mono text-[9px] uppercase tracking-[.15em] text-[#9aa6af]">Issued</div><div className="mt-1 text-xs font-semibold text-[#41515e]">{formatDate(pass.createdAt)}</div></div></div>
      <div className="mt-4 flex gap-2"><button onClick={() => onSelect(pass)} className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#f0f4f5] text-xs font-bold text-[#41515e] transition hover:bg-[#e7ecef]" data-testid={`button-view-pass-${pass.id}`}><QrCode size={14} /> View pass</button>{pass.status === 'active' && <button onClick={() => onRevoke(pass)} className="grid h-9 w-10 place-items-center rounded-lg text-[#a53e39] transition hover:bg-[#fdebea]" aria-label={`Revoke ${pass.label}`} data-testid={`button-revoke-pass-${pass.id}`}><Ban size={15} /></button>}</div>
    </div>
  );
}

function PassDetail({ pass, onClose }: { pass: AccessPass; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#172234]/55 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" data-testid="dialog-pass-detail"><div className="w-full max-w-[450px] rounded-t-[26px] bg-[#fffefa] p-6 shadow-2xl sm:rounded-[26px] sm:p-8"><div className="flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#a57d15]">Gate-ready pass</div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#edf1f3]" aria-label="Close pass detail" data-testid="button-close-pass-detail"><X size={17} /></button></div><div className="mt-5 flex items-center justify-between"><div><h2 className="text-2xl font-extrabold tracking-[-.04em]">{pass.label}</h2><div className="mt-2"><StatusTag status={pass.status} /></div></div><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#fff1bd] text-[#a57d15]"><ShieldCheck size={28} /></div></div><TokenVisual token={pass.token} /><div className="mt-4 rounded-xl bg-[#f1f4f5] p-3"><div className="font-mono text-[9px] uppercase tracking-[.15em] text-[#89959d]">Access window</div><div className="mt-1 text-sm font-bold">{formatDate(pass.validFrom)} <span className="font-normal text-[#8a969e]">to</span> {formatDate(pass.validTo)}</div></div><button onClick={() => navigator.clipboard?.writeText(pass.token)} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#172234] text-xs font-extrabold text-white" data-testid="button-copy-token"><Copy size={15} /> Copy pass token</button></div></div>;
}

function TokenVisual({ token }: { token: string }) {
  const cells = useMemo(() => { let seed = 0; for (let i = 0; i < token.length; i++) seed = (seed * 31 + token.charCodeAt(i)) >>> 0; return Array.from({ length: 169 }, (_, i) => { seed = (seed * 1664525 + 1013904223 + i) >>> 0; return (seed % 10) > 4; }); }, [token]);
  return <div className="mx-auto mt-6 grid w-[174px] grid-cols-13 gap-[3px] rounded-xl border border-[#e5d38b] bg-[#fff8dc] p-3" data-testid="visual-pass-token" aria-label="QR-like visual for pass token">{cells.map((on, i) => <span key={i} className={cn('aspect-square rounded-[1px]', on ? 'bg-[#172234]' : 'bg-[#f1d985]')} />)}</div>;
}

function ResidentHome() {
  const { data: passes, isLoading: passesLoading, isError: passesError, refetch: refetchPasses } = useListPasses();
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: events, isLoading: eventsLoading } = useListGateEvents();
  const revokePass = useRevokePass();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<AccessPass | null>(null);
  const activePasses = (passes ?? []).filter(pass => pass.status === 'active');
  const recentEvents = (events ?? []).slice(0, 5);
  const stats = [
    { label: 'Active passes', value: summary?.activePasses ?? activePasses.length, note: 'Currently valid', icon: ShieldCheck },
    { label: 'Entries today', value: summary?.entriesToday ?? 0, note: 'Across all gates', icon: CheckCircle2 },
    { label: 'Pending sync', value: summary?.revokedPendingSync ?? 0, note: 'Revocations to share', icon: RefreshCw },
  ];
  const revoke = (pass: AccessPass) => { if (window.confirm(`Revoke ${pass.label}'s pass?`)) revokePass.mutate({ id: pass.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/passes'] }) }); };
  return <div className="mx-auto max-w-[1240px] px-5 py-8 md:px-10 md:py-11">
    <section className="fade-up flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><div className="inline-flex items-center gap-2 rounded-full bg-[#dceeea] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.17em] text-[#267467]"><span className="h-1.5 w-1.5 rounded-full bg-[#55a998]" /> Home access is ready</div><h1 className="mt-5 max-w-[650px] text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold leading-[.98] tracking-[-.075em] text-[#172234]">Let good people<br /><span className="text-[#ad831a]">through.</span></h1><p className="mt-5 max-w-[470px] text-sm leading-6 text-[#697683]">Issue a pass in seconds. Your gate team can verify it even when the building is offline.</p></div><button onClick={() => setCreateOpen(true)} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#172234] px-5 text-sm font-extrabold text-white shadow-[4px_4px_0_#f6c945] transition hover:-translate-y-0.5 hover:shadow-[5px_6px_0_#f6c945]" data-testid="button-create-pass"><span className="grid h-5 w-5 place-items-center rounded-md bg-[#f6c945] text-[#172234]"><span className="text-lg leading-none">+</span></span> Create a pass <ArrowUpRight size={16} /></button></section>
    <section className="fade-up-delay mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat, i) => { const Icon = stat.icon; return <div key={stat.label} className={cn('rounded-2xl border p-5', i === 0 ? 'border-[#e4cc75] bg-[#fff8dd]' : 'border-[#dce3e8] bg-white')} data-testid={`stat-${stat.label.toLowerCase().replaceAll(' ', '-')}`}><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#788693]">{stat.label}</span><Icon size={16} className={i === 0 ? 'text-[#a57d15]' : 'text-[#78909d]'} /></div><div className="mt-3 text-3xl font-extrabold tracking-[-.06em] text-[#172234]">{summaryLoading ? '—' : stat.value}</div><div className="mt-1 text-xs text-[#788693]">{stat.note}</div></div>; })}
    </section>
    <section className="mt-11"><div className="mb-4 flex items-end justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#a57d15]">Your passes</div><h2 className="mt-1 text-xl font-extrabold tracking-[-.04em]">Active access</h2></div><span className="text-xs text-[#788693]">{activePasses.length} ready now</span></div>
      {passesLoading ? <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div> : passesError ? <div className="rounded-2xl border border-[#efc5c2] bg-[#fdebea] p-6"><div className="font-bold text-[#a53e39]">Passes are taking a moment.</div><button onClick={() => refetchPasses()} className="mt-3 text-xs font-bold underline" data-testid="button-retry-passes">Try again</button></div> : activePasses.length === 0 ? <div className="rounded-2xl border border-dashed border-[#cbd6dd] bg-[#f8faf9] p-10 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff1bd] text-[#a57d15]"><QrCode size={22} /></div><h3 className="mt-4 font-bold">No active passes yet</h3><p className="mx-auto mt-1 max-w-[330px] text-sm text-[#788693]">Create one for a guest or delivery. It will appear here ready to share.</p><button onClick={() => setCreateOpen(true)} className="mt-5 text-xs font-extrabold text-[#9b741b] underline underline-offset-4" data-testid="button-create-first-pass">Issue your first pass</button></div> : <div className="grid gap-4 md:grid-cols-2">{activePasses.map(pass => <PassCard key={pass.id} pass={pass} onRevoke={revoke} onSelect={setSelected} />)}</div>}
    </section>
    <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_300px]"><div><div className="mb-4 flex items-end justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#a57d15]">The paper trail</div><h2 className="mt-1 text-xl font-extrabold tracking-[-.04em]">Recent access activity</h2></div><Link href="/gate" className="text-xs font-bold text-[#6d7b86] underline underline-offset-4" data-testid="link-view-gate-history">View gate console</Link></div>{eventsLoading ? <Skeleton className="h-56" /> : recentEvents.length === 0 ? <div className="rounded-2xl border border-dashed border-[#cbd6dd] bg-[#f8faf9] p-8 text-center text-sm text-[#788693]" data-testid="empty-activity">No entries recorded yet.</div> : <div className="overflow-hidden rounded-2xl border border-[#dce3e8] bg-white">{recentEvents.map(event => <EventRow key={event.id} event={event} />)}</div>}</div><div className="rounded-2xl bg-[#172234] p-6 text-white"><div className="flex items-center gap-2 text-[#f6c945]"><KeyRound size={17} /><span className="font-mono text-[10px] uppercase tracking-[.16em]">Trust, by design</span></div><p className="mt-5 text-lg font-bold leading-7 tracking-[-.03em]">Signed passes.<br />Local decisions.<br />A clear record.</p><p className="mt-4 text-xs leading-5 text-slate-400">GatePass keeps the access decision close to the gate. Sync fills in the story when the connection returns.</p></div></section>
    {createOpen && <CreatePassModal onClose={() => setCreateOpen(false)} />}{selected && <PassDetail pass={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function EventRow({ event }: { event: GateEvent }) {
  const granted = event.decision === 'granted';
  return <div className="flex items-center gap-3 border-b border-[#edf0f2] px-4 py-4 last:border-0 sm:px-5" data-testid={`row-event-${event.id}`}><div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', granted ? 'bg-[#e7f5f1] text-[#267467]' : 'bg-[#fdebea] text-[#a53e39]')}>{granted ? <Check size={16} /> : <X size={16} />}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-[#31414f]">{event.passLabel}</div><div className="mt-0.5 text-[11px] text-[#89959e]">{granted ? 'Access granted' : event.reason} · {event.gate}</div></div><div className="text-right"><div className="font-mono text-[10px] text-[#89959e]">{formatTime(event.occurredAt)}</div><div className={cn('mt-1 text-[9px] font-bold uppercase tracking-[.12em]', event.synced ? 'text-[#529c8d]' : 'text-[#b4861c')}>{event.synced ? 'Synced' : 'Local'}</div></div></div>;
}

function GatePage() {
  const { data: passes, isLoading: passesLoading } = useListPasses();
  const { data: revocations, isLoading: revocationsLoading } = useListRevocations();
  const { data: publicKey, isLoading: keyLoading, isError: keyError } = useGetGatePublicKey();
  const { data: apiEvents, isLoading: eventsLoading } = useListGateEvents();
  const { data: summary } = useGetDashboardSummary();
  const syncEvents = useSyncEvents();
  const [token, setToken] = useState('');
  const [result, setResult] = useState<{ ok: boolean; pass?: AccessPass; reason?: string } | null>(null);
  const [localEvents, setLocalEvents] = useState<GateEvent[]>([]);
  const [usedTokens, setUsedTokens] = useState<string[]>([]);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [syncNote, setSyncNote] = useState('');
  useEffect(() => { try { setLocalEvents(JSON.parse(localStorage.getItem('gatepass-events') ?? '[]')); setUsedTokens(JSON.parse(localStorage.getItem('gatepass-used') ?? '[]')); } catch { setLocalEvents([]); } const goOnline = () => setOnline(true); const goOffline = () => setOnline(false); window.addEventListener('online', goOnline); window.addEventListener('offline', goOffline); return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); }; }, []);
  const events = [...localEvents, ...(apiEvents ?? []).filter(remote => !localEvents.some(local => local.id === remote.id))].slice(0, 12);
  const pendingEvents = localEvents.filter(event => !event.synced);
  const validate = () => {
    const cleanToken = token.trim();
    if (!cleanToken) { setResult({ ok: false, reason: 'Paste or scan a token to begin.' }); return; }
    const pass = (passes ?? []).find(item => item.token === cleanToken);
    const revoked = (revocations ?? []).some(item => item.tokenId === cleanToken || item.tokenId === pass?.id || item.tokenId === pass?.token);
    const alreadyUsed = usedTokens.includes(cleanToken);
    let reason = '';
    if (!pass) reason = 'Token is not recognized by this gate.';
    else if (revoked || pass.status === 'revoked') reason = 'This pass has been revoked.';
    else if (alreadyUsed || pass.status === 'used') reason = 'This pass has already been used.';
    else if (pass.status === 'expired' || new Date(pass.validTo) < new Date()) reason = 'This pass has expired.';
    else if (new Date(pass.validFrom) > new Date()) reason = 'This pass is not active yet.';
    const ok = Boolean(pass && !reason);
    setResult({ ok, pass, reason: reason || undefined });
    const event: GateEvent = { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`, tokenId: pass?.id ?? cleanToken.slice(0, 20), passLabel: pass?.label ?? 'Unknown token', decision: ok ? 'granted' : 'denied', reason: reason || 'Valid signed pass', gate: 'North entry', occurredAt: new Date().toISOString(), synced: false };
    const nextEvents = [event, ...localEvents].slice(0, 50);
    setLocalEvents(nextEvents); localStorage.setItem('gatepass-events', JSON.stringify(nextEvents));
    if (ok) { const nextUsed = [...new Set([...usedTokens, cleanToken])]; setUsedTokens(nextUsed); localStorage.setItem('gatepass-used', JSON.stringify(nextUsed)); }
  };
  const sync = () => { if (!pendingEvents.length || !online) return; syncEvents.mutate({ data: { events: pendingEvents } }, { onSuccess: (response) => { const ids = new Set(pendingEvents.map(event => event.id)); const updated = localEvents.map(event => ids.has(event.id) ? { ...event, synced: true } : event); setLocalEvents(updated); localStorage.setItem('gatepass-events', JSON.stringify(updated)); setSyncNote(`${response.accepted} event${response.accepted === 1 ? '' : 's'} synced at ${formatTime(response.syncedAt)}`); }, onError: () => setSyncNote('Sync could not complete. Events remain safely on this device.') }); };
  const canValidate = !passesLoading && !revocationsLoading && !keyLoading;
  return <div className="mx-auto max-w-[1240px] px-5 py-8 md:px-10 md:py-11">
    <section className="fade-up flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><div className="inline-flex items-center gap-2 rounded-full bg-[#dceeea] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.17em] text-[#267467]"><span className="h-1.5 w-1.5 rounded-full bg-[#55a998]" /> Checkpoint online</div><h1 className="mt-5 text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold leading-[.98] tracking-[-.075em] text-[#172234]">Make the call<br /><span className="text-[#ad831a]">at the gate.</span></h1><p className="mt-5 max-w-[470px] text-sm leading-6 text-[#697683]">Verify a signed pass locally. No network round-trip, no guesswork — just a clear decision and a record to sync later.</p></div><div className="flex items-center gap-3 rounded-2xl border border-[#dce3e8] bg-white px-4 py-3"><div className={cn('grid h-9 w-9 place-items-center rounded-xl', online ? 'bg-[#e7f5f1] text-[#267467]' : 'bg-[#fff3d6] text-[#9b741b]')}>{online ? <Wifi size={17} /> : <WifiOff size={17} />}</div><div><div className="text-xs font-extrabold">{online ? 'Connected' : 'Offline mode'}</div><div className="text-[11px] text-[#788693]">{online ? 'Sync available' : 'Decisions stay on this gate'}</div></div></div></section>
    <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="rounded-[24px] border border-[#dce3e8] bg-white p-5 shadow-[0_8px_24px_rgba(23,34,52,.05)] sm:p-7"><div className="flex items-center justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#a57d15]">Local validator</div><h2 className="mt-1 text-xl font-extrabold tracking-[-.04em]">Present a pass</h2></div><div className="flex items-center gap-2 text-[10px] font-bold text-[#788693]"><KeyRound size={14} /> {keyError ? 'Key unavailable' : publicKey ? `Key ${publicKey.kid}` : 'Loading key…'}</div></div><div className="mt-7 rounded-2xl border-2 border-dashed border-[#cbd6dd] bg-[#f8faf9] p-5 sm:p-7"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[22px] bg-[#172234] text-[#f6c945] shadow-[6px_6px_0_#dce9e7]"><ScanLine size={36} strokeWidth={1.5} /></div><div className="mt-5 text-center"><div className="text-sm font-bold text-[#31414f]">Scan a QR or paste its token</div><div className="mt-1 text-xs text-[#89959e]">Validation happens on this device</div></div><div className="mt-6 flex flex-col gap-2 sm:flex-row"><input value={token} onChange={e => setToken(e.target.value)} onKeyDown={e => e.key === 'Enter' && validate()} placeholder="Paste signed token…" className="h-12 min-w-0 flex-1 rounded-xl border border-[#dce3e8] bg-white px-4 font-mono text-xs outline-none focus:border-[#d5a918] focus:ring-4 focus:ring-[#f6c945]/20" data-testid="input-gate-token" /><button onClick={validate} disabled={!canValidate} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f6c945] px-5 text-sm font-extrabold text-[#172234] transition hover:bg-[#eabb30] disabled:opacity-50" data-testid="button-validate-token"><ScanLine size={17} /> Validate locally</button></div></div>{result && <div className={cn('mt-5 flex items-start gap-4 rounded-2xl border p-5', result.ok ? 'border-[#a9d9cf] bg-[#e7f5f1]' : 'border-[#efc5c2] bg-[#fdebea]')} data-testid="validation-result"><div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', result.ok ? 'bg-[#267467] text-white' : 'bg-[#a53e39] text-white')}>{result.ok ? <CheckCircle2 size={23} /> : <XCircle size={23} />}</div><div className="min-w-0"><div className={cn('font-mono text-[10px] font-bold uppercase tracking-[.18em]', result.ok ? 'text-[#267467]' : 'text-[#a53e39]')}>{result.ok ? 'Access granted' : 'Access denied'}</div><div className="mt-1 text-lg font-extrabold tracking-[-.03em]">{result.pass?.label ?? 'Unknown pass'}</div><div className="mt-1 text-xs leading-5 text-[#5e707a]">{result.ok ? 'Signed locally · one-time pass marked used' : result.reason}</div></div></div>}</div>
      <aside className="space-y-6"><div className="rounded-[24px] bg-[#172234] p-6 text-white"><div className="flex items-center justify-between"><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#f6c945]">Device status</div><StatusPill online={online} /></div><div className="mt-7 flex items-end justify-between"><div><div className="text-3xl font-extrabold tracking-[-.06em]">{pendingEvents.length}</div><div className="mt-1 text-xs text-slate-400">decisions waiting to sync</div></div><div className="text-right"><div className="font-mono text-[10px] uppercase tracking-[.13em] text-slate-500">Last sync</div><div className="mt-1 text-xs font-bold text-slate-300">{formatDate(summary?.lastSyncAt)}</div></div></div><button onClick={sync} disabled={!online || !pendingEvents.length || syncEvents.isPending} className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f6c945] text-xs font-extrabold text-[#172234] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-sync-events"><RefreshCw size={15} className={syncEvents.isPending ? 'animate-spin' : ''} /> {syncEvents.isPending ? 'Syncing events…' : 'Sync event trail'}</button>{syncNote && <div className="mt-3 text-center text-[11px] text-[#a9d9cf]" data-testid="text-sync-feedback">{syncNote}</div>}</div><div className="rounded-[24px] border border-[#dce3e8] bg-white p-6"><div className="flex items-center gap-2"><KeyRound size={16} className="text-[#a57d15]" /><span className="font-mono text-[10px] uppercase tracking-[.18em] text-[#788693]">Verification key</span></div><div className="mt-4 break-all rounded-xl bg-[#f1f4f5] p-3 font-mono text-[10px] leading-5 text-[#697683]" data-testid="text-public-key">{keyLoading ? 'Fetching the latest trusted key…' : publicKey?.publicKey ?? 'Key is not available'}</div><div className="mt-3 flex items-center gap-2 text-[11px] text-[#788693]"><Clock3 size={13} /> Fetched {publicKey ? formatDate(publicKey.fetchedAt) : 'when connected'}</div></div></aside></section>
    <section className="mt-12"><div className="mb-4 flex items-end justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[.2em] text-[#a57d15]">Decision ledger</div><h2 className="mt-1 text-xl font-extrabold tracking-[-.04em]">Gate activity</h2></div><div className="text-xs text-[#788693]">{events.length} recent decisions</div></div>{eventsLoading ? <Skeleton className="h-60" /> : events.length === 0 ? <div className="rounded-2xl border border-dashed border-[#cbd6dd] bg-[#f8faf9] p-10 text-center text-sm text-[#788693]" data-testid="empty-gate-events">Validated passes will appear here, including offline decisions.</div> : <div className="overflow-hidden rounded-2xl border border-[#dce3e8] bg-white">{events.map(event => <EventRow key={event.id} event={event} />)}</div>}</section>
  </div>;
}

function Router() {
  return <RoutedErrorBoundary><Shell><Switch><Route path="/" component={ResidentHome} /><Route path="/gate" component={GatePage} /><Route component={NotFound} /></Switch></Shell></RoutedErrorBoundary>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function App() { return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>; }
export default App;