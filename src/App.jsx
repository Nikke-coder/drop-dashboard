import { useState, useEffect } from 'react'

import {
  ComposedChart, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const PASSWORD    = 'droppool2026!'
const SESSION_KEY = 'droppool_auth'
const ACCENT      = '#38bdf8'   // sky blue

// ─── MONTHS ───────────────────────────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_DATA = {
  2024: {
    revenue:          [91489,152183,164134,251858,375204,388835,325198,398035,203527,289851,160549,70078],
    materials:        [-69773,-98744,-112343,-149627,-257611,-321232,-254433,-220547,-221162,-168593,-127665,-154223],
    employee_cost:    [-48759,-44677,-46677,-67829,-54987,-55011,-36261,-51752,-64491,-59246,-65473,-63470],
    ebitda:           [-42202,-10561,-24997,11581,35470,-22313,3711,85246,-103318,12876,-130199,-189280],
    ebit:             [-45925,-14284,-28650,8146,32036,-25747,277,81853,-106710,9933,-132956,-192038],
    profit_loss:      [-47690,-14281,-33061,4813,32327,-29779,14,80657,-106675,10228,-132886,-214958],
    total_assets:     [231094,198648,295295,464419,758906,811145,622495,812408,724624,660313,513897,642687],
    total_equity:     [-34358,-48638,-56822,-48992,18645,-11134,-11120,69537,-37138,-26910,-159797,-374755],
    cash:             [-330557,-355810,-381360,-252258,13772,19624,29611,50630,39868,16026,36031,16505],
    trade_receivables:[212433,211464,312604,329293,369105,481078,330231,458553,340044,257838,196739,251352],
    trade_payables:   [40402,64507,114895,82742,212087,313159,179351,279457,257405,219261,238060,372818],
  },
  2025: {
    revenue:          [117992,69050,213816,305810,255257,317231,333750,168428,279078,442820,220370,313216],
    materials:        [-60722,-86234,-178513,-175148,-201146,-220002,-206075,-134130,-220409,-318596,-174993,-251095],
    employee_cost:    [-63665,-47763,-46760,-47292,-49444,-52543,-42311,-41182,-37785,-50227,-50678,-39983],
    ebitda:           [-59686,-89700,-43870,59873,-19267,26345,65614,-27087,7478,57498,-26780,-8151],
    ebit:             [-62337,-92351,-46448,57509,-21631,23981,63250,-29451,5114,54972,-29306,-11151],
    profit_loss:      [-64837,-93518,-51007,59763,-35159,85,71143,-35557,-722,48835,-35219,40632],
    total_assets:     [612603,732194,645307,748801,724248,849158,770333,747761,784553,900485,730764,740325],
    total_equity:     [-439592,-533110,-584117,-524354,-559512,-559427,-488284,-523841,-524563,-475728,-510947,-470316],
    cash:             [4462,172724,144942,364013,339948,381117,265686,303691,189888,416372,226873,154398],
    trade_receivables:[237968,218038,181355,122512,171226,265432,312816,206756,364728,255556,279345,307417],
    trade_payables:   [414046,235853,185369,129622,106519,197595,140508,145378,197766,248493,122847,174906],
  },
  2026: {
    // JAN = ACT, FEB–DEC = BUD
    revenue:          [154371,140000,170000,407437,479002,527232,438213,396769,402853,430217,262802,216327],
    materials:        [-126097,-102279,-123006,-297146,-349478,-384648,-319523,-289292,-293708,-313709,-191357,-157370],
    employee_cost:    [-40196,-43086,-44923,-51070,-52989,-54389,-10401,-51542,-51813,-52546,-47951,-67381],
    ebitda:           [-24119,-42424,-31809,24405,42986,50011,73806,20363,21054,30183,-10317,-55134],
    ebit:             [-26699,-45124,-34509,21705,40286,47311,71106,17663,18354,27483,-13017,-57834],
    profit_loss:      [-26706,-45124,-34509,21705,40286,47311,71106,17663,18354,27483,-13017,-57834],
    total_assets:     [627830,523321,527952,872321,1009195,1124220,1073123,1035349,1062474,1126071,886366,771753],
    total_equity:     [-500632,-545755,-580264,-558559,-518273,-470962,-399856,217807,836162,1463645,1450628,1392794],
    cash:             [113763,89405,49351,47108,91843,119004,213523,236971,264776,277981,295472,235604],
    trade_receivables:[189173,166667,191667,389531,449168,489360,415178,380640,385711,408514,269002,230272],
    trade_payables:   [110030,65024,73544,155216,179031,197637,165519,151919,154324,162491,105394,95553],
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const sum  = arr => (arr||[]).reduce((a,b) => a + (b||0), 0)
const fmt  = (n, short=false) => {
  if (n === null || n === undefined || isNaN(n)) return '–'
  const abs = Math.abs(n)
  if (short && abs >= 1000000) return (n/1000000).toFixed(2) + 'M'
  if (short && abs >= 1000)    return (n/1000).toFixed(0) + 'k'
  return new Intl.NumberFormat('fi-FI', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n)
}
const pct      = n => (n === null || isNaN(n)) ? '–' : (n*100).toFixed(1) + '%'
const valColor = n => (n||0) >= 0 ? '#34d399' : '#f87171'

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, color=ACCENT }) => (
  <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'14px 18px', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:color }} />
    <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', color:'#475569', textTransform:'uppercase', marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:20, fontWeight:700, color:'#f1f5f9', fontFamily:'monospace' }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:'#475569', marginTop:3 }}>{sub}</div>}
  </div>
)

const ST = ({ children, mt=28 }) => (
  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'#334155', marginBottom:12, marginTop:mt, paddingBottom:6, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>{children}</div>
)

const YBtn = ({ year, label, active, onClick }) => (
  <button onClick={onClick} style={{ padding:'4px 14px', borderRadius:16, border:'none', cursor:'pointer', background:active ? ACCENT : 'rgba(255,255,255,0.05)', color:active ? '#080b12' : '#64748b', fontWeight:700, fontSize:12, fontFamily:'inherit', transition:'all 0.12s' }}>{label||year}</button>
)

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 14px', fontSize:11 }}>
      <div style={{ color:'#64748b', marginBottom:5, fontWeight:700 }}>{label}</div>
      {payload.map(p => <div key={p.dataKey} style={{ color:p.color||p.fill, marginBottom:2 }}>{p.name}: <strong>{fmt(p.value, true)}</strong></div>)}
    </div>
  )
}

// ─── P&L VIEW ─────────────────────────────────────────────────────────────────
function PLView({ data }) {
  const [yr, setYr] = useState(2025)
  const d = data[yr] || SEED_DATA[yr] || {}

  const tRev   = sum(d.revenue)
  const tMat   = sum(d.materials)
  const tEmp   = sum(d.employee_cost)
  const tEbitda= sum(d.ebitda)
  const tEbit  = sum(d.ebit)
  const tNet   = sum(d.profit_loss)
  const grossPct = tRev !== 0 ? (tRev + tMat) / tRev : 0
  const netPct   = tRev !== 0 ? tNet / tRev : 0

  const prevD   = data[yr-1] || SEED_DATA[yr-1] || {}
  const prevRev = sum(prevD.revenue||[])
  const revGrowth = prevRev !== 0 ? ((tRev - prevRev) / Math.abs(prevRev)) * 100 : null

  const chartData = MONTHS.map((m,i) => ({
    month: m,
    Revenue:       (d.revenue||[])[i]||0,
    EBITDA:        (d.ebitda||[])[i]||0,
    EBIT:          (d.ebit||[])[i]||0,
    'Net Profit':  (d.profit_loss||[])[i]||0,
  }))

  const costData = MONTHS.map((m,i) => ({
    month: m,
    'Materials':     Math.abs((d.materials||[])[i]||0),
    'Employee Cost': Math.abs((d.employee_cost||[])[i]||0),
  }))

  const plLines = [
    { l:'Revenue',              v:tRev,                         c:ACCENT },
    { l:'Materials & Services', v:tMat,                         c:'#f87171' },
    { l:'Employee Cost',        v:tEmp,                         c:'#f87171' },
    { l:'Gross Margin',         v:tRev+tMat,                    c:valColor(tRev+tMat), b:true },
    { l:'EBITDA',               v:tEbitda,                      c:valColor(tEbitda), b:true },
    { l:'EBIT',                 v:tEbit,                        c:valColor(tEbit),   b:true },
    { l:'Net Profit / Loss',    v:tNet,                         c:valColor(tNet),    b:true },
  ]

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center' }}>
        <YBtn year={2024} active={yr===2024} onClick={() => setYr(2024)}/>
        <YBtn year={2025} active={yr===2025} onClick={() => setYr(2025)}/>
        <YBtn year={2026} label="2026 BUD" active={yr===2026} onClick={() => setYr(2026)}/>
        {revGrowth !== null && (
          <span style={{ fontSize:11, color:revGrowth>=0?'#34d399':'#f87171', marginLeft:4 }}>
            {revGrowth>=0?'▲':'▼'} {Math.abs(revGrowth).toFixed(1)}% vs {yr-1}
          </span>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:22 }}>
        <KPI label="Revenue"     value={fmt(tRev,true)}    color={ACCENT}/>
        <KPI label="Gross %"     value={pct(grossPct)}     color={valColor(grossPct)}/>
        <KPI label="EBITDA"      value={fmt(tEbitda,true)} color={valColor(tEbitda)}/>
        <KPI label="EBIT"        value={fmt(tEbit,true)}   color={valColor(tEbit)}/>
        <KPI label="Net Profit"  value={fmt(tNet,true)}    color={valColor(tNet)} sub={pct(netPct)+' margin'}/>
      </div>

      <ST>Monthly Revenue & Profitability — {yr}{yr===2026?' (JAN ACT + BUD)':' (ACT)'}</ST>
      <div style={{ height:230, marginBottom:22 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Bar dataKey="Revenue" fill={ACCENT} opacity={0.7} radius={[2,2,0,0]}/>
            <Line type="monotone" dataKey="EBITDA"     stroke="#f59e0b" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="EBIT"       stroke="#34d399" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="Net Profit" stroke="#f87171" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ST>Cost Breakdown — {yr}</ST>
      <div style={{ height:200, marginBottom:22 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={costData} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Bar dataKey="Materials"     fill="#f87171" opacity={0.85} stackId="c"/>
            <Bar dataKey="Employee Cost" fill="#f59e0b" opacity={0.85} stackId="c" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ST>Year-on-Year Revenue Comparison</ST>
      <div style={{ height:180, marginBottom:22 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MONTHS.map((m,i) => ({
            month: m,
            '2024 ACT': (SEED_DATA[2024].revenue||[])[i]||0,
            '2025 ACT': (SEED_DATA[2025].revenue||[])[i]||0,
            '2026 BUD': (SEED_DATA[2026].revenue||[])[i]||0,
          }))} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Line type="monotone" dataKey="2024 ACT" stroke="#475569" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
            <Line type="monotone" dataKey="2025 ACT" stroke="#64748b" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="2026 BUD" stroke={ACCENT}  strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ST>P&L Summary — {yr}{yr===2026?' BUD':' ACT'}</ST>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:22 }}>
        {plLines.map(({ l, v, c, b }) => (
          <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 12px', background:b?'rgba(255,255,255,0.04)':'transparent', borderRadius:6, border:b?'1px solid rgba(255,255,255,0.07)':'none' }}>
            <span style={{ fontSize:12, color:b?'#e2e8f0':'#64748b', fontWeight:b?700:400 }}>{l}</span>
            <span style={{ fontSize:12, color:c, fontWeight:b?700:400, fontFamily:'monospace' }}>{fmt(v,true)}</span>
          </div>
        ))}
      </div>

      <ST>Monthly P&L Table — {yr}</ST>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', fontSize:11, fontFamily:'monospace' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <th style={{ textAlign:'left', padding:'7px 10px', color:'#475569', minWidth:160 }}>Line</th>
              {MONTHS.map(m => <th key={m} style={{ textAlign:'right', padding:'7px 5px', color:'#475569', minWidth:60 }}>{m}</th>)}
              <th style={{ textAlign:'right', padding:'7px 10px', color:'#475569' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {[
              { l:'Revenue',    a:d.revenue,       c:'#e2e8f0' },
              { l:'Materials',  a:d.materials,     c:'#94a3b8' },
              { l:'Emp. Cost',  a:d.employee_cost, c:'#94a3b8' },
              { l:'EBITDA',     a:d.ebitda,        c:null, b:true },
              { l:'EBIT',       a:d.ebit,          c:null, b:true },
              { l:'Net Profit', a:d.profit_loss,   c:null, b:true },
            ].map(({ l, a, c, b }) => {
              const tot = sum(a||[])
              const isDyn = c === null
              const clr = isDyn ? valColor(tot) : c
              return (
                <tr key={l} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', background:b?'rgba(255,255,255,0.02)':'transparent' }}>
                  <td style={{ padding:'5px 10px', color:clr, fontWeight:b?700:400 }}>{l}</td>
                  {(a||[]).map((v,i) => {
                    const vc = isDyn ? valColor(v) : c
                    return <td key={i} style={{ textAlign:'right', padding:'5px 5px', color:vc, fontWeight:b?700:400 }}>{v!==0 ? fmt(v,true) : '–'}</td>
                  })}
                  <td style={{ textAlign:'right', padding:'5px 10px', color:isDyn?valColor(tot):c, fontWeight:700 }}>{fmt(tot,true)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── BALANCE SHEET VIEW ───────────────────────────────────────────────────────
function BSView({ data }) {
  const [yr, setYr] = useState(2025)
  const d = data[yr] || SEED_DATA[yr] || {}
  const li = 11

  const lastA  = (d.total_assets||[])[li]||0
  const lastE  = (d.total_equity||[])[li]||0
  const lastC  = (d.cash||[])[li]||0
  const lastAR = (d.trade_receivables||[])[li]||0
  const lastAP = (d.trade_payables||[])[li]||0
  const eqRatio = lastA !== 0 ? lastE / lastA : 0

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center' }}>
        <YBtn year={2024} active={yr===2024} onClick={() => setYr(2024)}/>
        <YBtn year={2025} active={yr===2025} onClick={() => setYr(2025)}/>
        <YBtn year={2026} label="2026 BUD" active={yr===2026} onClick={() => setYr(2026)}/>
        <span style={{ fontSize:11, color:'#334155', marginLeft:4 }}>Dec snapshot</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:22 }}>
        <KPI label="Total Assets"    value={fmt(lastA,true)}   color={ACCENT}/>
        <KPI label="Total Equity"    value={fmt(lastE,true)}   color={valColor(lastE)}/>
        <KPI label="Equity Ratio"    value={pct(eqRatio)}      color={valColor(eqRatio)}/>
        <KPI label="Cash"            value={fmt(lastC,true)}   color="#f59e0b"/>
        <KPI label="Trade Rec."      value={fmt(lastAR,true)}  color="#94a3b8"/>
      </div>

      <ST>Balance Sheet — {yr} DEC</ST>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:22 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#475569', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.1em' }}>Assets</div>
          {[
            { l:'Trade Receivables', v:lastAR },
            { l:'Cash & Equivalents',v:lastC },
            { l:'TOTAL ASSETS',      v:lastA, b:true },
          ].map(({ l, v, b }) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 10px', background:b?'rgba(255,255,255,0.04)':'transparent', borderRadius:4, marginBottom:2 }}>
              <span style={{ fontSize:11, color:'#94a3b8', fontWeight:b?700:400 }}>{l}</span>
              <span style={{ fontSize:11, color:b?'#f1f5f9':'#64748b', fontFamily:'monospace', fontWeight:b?700:400 }}>{fmt(v,true)}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'#475569', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.1em' }}>Equity & Liabilities</div>
          {[
            { l:'Total Equity',   v:lastE,  b:true, color:valColor(lastE) },
            { l:'Trade Payables', v:lastAP },
          ].map(({ l, v, b, color }) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'5px 10px', background:b?'rgba(255,255,255,0.04)':'transparent', borderRadius:4, marginBottom:2 }}>
              <span style={{ fontSize:11, color:'#94a3b8', fontWeight:b?700:400 }}>{l}</span>
              <span style={{ fontSize:11, color:color||(b?'#f1f5f9':'#64748b'), fontFamily:'monospace', fontWeight:b?700:400 }}>{fmt(v,true)}</span>
            </div>
          ))}
        </div>
      </div>

      <ST>Assets & Cash — Monthly {yr}</ST>
      <div style={{ height:200, marginBottom:22 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MONTHS.map((m,i) => ({
            month:m,
            'Total Assets':      (d.total_assets||[])[i]||0,
            Cash:                (d.cash||[])[i]||0,
            'Trade Receivables': (d.trade_receivables||[])[i]||0,
          }))} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Line type="monotone" dataKey="Total Assets"      stroke={ACCENT}   strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="Cash"              stroke="#f59e0b"  strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="Trade Receivables" stroke="#94a3b8"  strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ST>2024 vs 2025 Key Metrics</ST>
      <div style={{ height:220, marginBottom:22 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[
            { name:'Revenue',    '2024':sum(SEED_DATA[2024].revenue||[]),          '2025':sum(SEED_DATA[2025].revenue||[]) },
            { name:'Materials',  '2024':Math.abs(sum(SEED_DATA[2024].materials||[])), '2025':Math.abs(sum(SEED_DATA[2025].materials||[])) },
            { name:'EBIT',       '2024':sum(SEED_DATA[2024].ebit||[]),             '2025':sum(SEED_DATA[2025].ebit||[]) },
            { name:'Net P/L',    '2024':sum(SEED_DATA[2024].profit_loss||[]),      '2025':sum(SEED_DATA[2025].profit_loss||[]) },
          ]} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="name" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Bar dataKey="2024" fill="#475569" opacity={0.8} radius={[2,2,0,0]}/>
            <Bar dataKey="2025" fill={ACCENT}  opacity={0.8} radius={[2,2,0,0]}/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onSuccess }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState(false)
  const attempt = () => {
    if (pw === PASSWORD) { sessionStorage.setItem(SESSION_KEY, '1'); onSuccess() }
    else { setErr(true); setTimeout(() => setErr(false), 1500) }
  }
  return (
    <div style={{ minHeight:'100vh', background:'#080b12', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Mono','Courier New',monospace" }}>
      <div style={{ width:340, textAlign:'center' }}>
        <div style={{ fontSize:11, letterSpacing:'0.3em', color:'#334155', marginBottom:12, textTransform:'uppercase' }}>Board Dashboard</div>
        <div style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.03em', color:'#f1f5f9', marginBottom:4 }}>Drop Design Pool</div>
        <div style={{ width:40, height:2, background:ACCENT, margin:'0 auto 32px' }}/>
        <input
          type="password" placeholder="Enter password" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          style={{ width:'100%', padding:'13px 16px', background:'rgba(255,255,255,0.04)', border:`1px solid ${err?'#f87171':'rgba(255,255,255,0.1)'}`, borderRadius:8, color:'#f1f5f9', fontSize:14, outline:'none', fontFamily:'inherit', marginBottom:10 }}
          autoFocus
        />
        <button onClick={attempt} style={{ width:'100%', padding:'13px', background:ACCENT, border:'none', borderRadius:8, color:'#080b12', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>ENTER</button>
        {err && <div style={{ marginTop:10, color:'#f87171', fontSize:13 }}>Incorrect password</div>}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  { id:'pl', label:'P & L' },
  { id:'bs', label:'Balance Sheet' },
]

export default function App() {
  const [authed,   setAuthed]   = useState(!!sessionStorage.getItem(SESSION_KEY))
  const [tab,      setTab]      = useState('pl')
  const [dbStatus, setDbStatus] = useState('idle')
  const [liveData, setLiveData] = useState(null)

  useEffect(() => { if (authed) loadFromSupabase() }, [authed])

  const loadFromSupabase = async () => {
    if (!supabase) { setDbStatus('offline'); return }
    setDbStatus('loading')
    try {
      const { data, error } = await supabase.from('dashboard_pnl').select('*').eq('client', CLIENT)
      if (error) throw error
      if (!data || data.length === 0) { setDbStatus('ok'); await seedDatabase(); return }
      const structured = {}
      data.forEach(row => {
        if (!structured[row.year]) structured[row.year] = {}
        if (!structured[row.year][row.line_item]) structured[row.year][row.line_item] = Array(12).fill(0)
        structured[row.year][row.line_item][row.month_index] = row.value
      })
      setLiveData(structured)
      setDbStatus('ok')
    } catch (e) { console.error(e); setDbStatus('error') }
  }

  const seedDatabase = async () => {
    if (!supabase) return
    const rows = []
    Object.entries(SEED_DATA).forEach(([year, yd]) => {
      Object.entries(yd).forEach(([line_item, arr]) => {
        ;(arr||[]).forEach((value, month_index) => {
          if (value !== 0 && value !== null && value !== undefined)
            rows.push({ client: CLIENT, entity: '', year: parseInt(year), line_item, month_index, value })
        })
      })
    })
    if (rows.length > 0) {
      const { error } = await supabase.from('dashboard_pnl').upsert(rows, { onConflict:'client,entity,year,line_item,month_index' })
      if (!error) await loadFromSupabase()
    }
  }

  const data = liveData || SEED_DATA
  if (!authed) return <Login onSuccess={() => setAuthed(true)}/>

  return (
    <div style={{ minHeight:'100vh', background:'#080b12', color:'#e2e8f0', fontFamily:"'DM Mono','Courier New',monospace" }}>
      <header style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', height:52, position:'sticky', top:0, zIndex:100, background:'rgba(8,11,18,0.97)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:16, fontWeight:800, letterSpacing:'-0.02em', color:'#f1f5f9' }}>Drop Design Pool</div>
          <div style={{ width:1, height:16, background:'rgba(255,255,255,0.08)' }}/>
          <div style={{ fontSize:11, color:'#334155', letterSpacing:'0.05em' }}>Board Dashboard</div>
        </div>
        <nav style={{ display:'flex', gap:2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:'5px 14px', borderRadius:6, border:'none', cursor:'pointer', background:tab===t.id?`${ACCENT}20`:'transparent', color:tab===t.id?ACCENT:'#475569', fontWeight:tab===t.id?700:400, fontSize:12, fontFamily:'inherit', transition:'all 0.12s' }}>{t.label}</button>
          ))}
        </nav>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#334155' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:dbStatus==='ok'?'#34d399':dbStatus==='loading'?'#f59e0b':dbStatus==='offline'?'#475569':'#f87171', display:'inline-block' }}/>
          {dbStatus==='ok'?'Supabase':dbStatus==='loading'?'Syncing…':dbStatus==='offline'?'Offline':'Error'}
        </div>
      </header>

      <main style={{ padding:'24px 28px', maxWidth:1400, margin:'0 auto' }}>
        <h1 style={{ fontSize:18, fontWeight:800, color:'#f1f5f9', marginBottom:22, letterSpacing:'-0.02em' }}>
          {TABS.find(t => t.id === tab)?.label}
          <span style={{ fontSize:12, color:'#334155', fontWeight:400, marginLeft:10 }}>2024–2026 · ACT + BUD</span>
        </h1>
        {tab === 'pl' && <PLView data={data}/>}
        {tab === 'bs' && <BSView data={data}/>}
      </main>

      <div style={{ textAlign:'center', padding:'18px', borderTop:'1px solid rgba(255,255,255,0.04)', fontSize:11, color:'#1e293b' }}>
        Drop Design Pool · Board Dashboard · Confidential · {new Date().getFullYear()}
      </div>
    </div>
  )
}
