import { useState } from 'react';
import { Card, Stat, Callout, Table, money, num } from '../components/ui';
import { capitalRequirement, bandAssessment, CAPITAL_BANDS } from '../model/capital';
import { cashCalendar } from '../model/cash';
import { costs } from '../data/costs';
import { defaultScenario, SALARY_TEST_POINTS } from '../model/defaults';

export function Capital() {
  const [preRevenueMonths, setPre] = useState(6);
  const [startingCash, setCash] = useState(75000);
  const [salary, setSalary] = useState(SALARY_TEST_POINTS[1].value);

  const scenario = { ...defaultScenario(), clinicianSalary: salary };
  const req = capitalRequirement(costs, scenario, preRevenueMonths);
  const calendar = cashCalendar({
    scenario, oneTimeStartup: req.oneTimeStartup.typical,
    monthlyOverhead: req.monthlyBurn.typical, preRevenueMonths,
    rampMonths: 6, startingCash, horizonMonths: 24,
  });

  return (
    <>
      <p className="lead">
        A single "startup cost" number hides the thing that actually kills businesses: when the cash is
        needed versus when it arrives.
      </p>

      <Callout tone="bad" title="This model is knowingly incomplete">
        {req.completeness} Unpriced required lines include: {[...req.oneTimeStartup.unknownItems, ...req.monthlyBurn.unknownItems].join('; ')}.
      </Callout>

      <Card title="Inputs">
        <div className="ctl">
          <label><span>Pre-revenue months (licensure + enrollment)</span><span>{preRevenueMonths}</span></label>
          <input type="range" min={1} max={18} value={preRevenueMonths} onChange={(e) => setPre(Number(e.target.value))} />
          <div className="src">UNKNOWN — the real CDPHE licensure timeline was not established (Q-002)</div>
        </div>
        <div className="ctl">
          <label><span>Starting cash</span><span>{money(startingCash)}</span></label>
          <input type="range" min={10000} max={250000} step={5000} value={startingCash} onChange={(e) => setCash(Number(e.target.value))} />
          <div className="src">What you actually put in</div>
        </div>
        <div className="ctl">
          <label><span>Clinician salary (test point)</span><span>{money(salary)}</span></label>
          <input type="range" min={60000} max={160000} step={1000} value={salary} onChange={(e) => setSalary(Number(e.target.value))} />
          <div className="src">AS-003 · UNKNOWN — this is a test value, not an estimate</div>
        </div>
      </Card>

      <Card title="The five buckets">
        <div className="grid">
          <Stat label="One-time startup" value={money(req.oneTimeStartup.typical)} note={`Range ${money(req.oneTimeStartup.low)}–${money(req.oneTimeStartup.high)}`} />
          <Stat label="Monthly operating burn" value={money(req.monthlyBurn.typical)} note="Excludes clinician payroll" />
          <Stat label="Pre-revenue burn" value={money(req.preRevenueBurn.typical)} note={`${preRevenueMonths} months`} />
          <Stat label="Working capital" value={money(req.workingCapital)} note="Care delivered but not yet paid" />
          <Stat label="Contingency (20%)" value={money(req.contingency)} />
          <Stat label="Total modelled requirement" value={money(req.totalRequired.typical)} note="Known lines only — the real figure is higher" />
        </div>
      </Card>

      <Card title="Capital bands">
        <Table head={<tr><th className="num">Band</th><th>Verdict</th><th>Note</th></tr>}>
          {CAPITAL_BANDS.map((b) => {
            const a = bandAssessment(b, req);
            const tone = a.verdict === 'Insufficient' ? 'bad' : a.verdict === 'Tight' ? 'warn' : 'good';
            return (
              <tr key={b}>
                <td className="num">{money(b)}</td>
                <td><span className={`pill ${tone}`}>{a.verdict}</span></td>
                <td className="muted">{a.note}</td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Card title="Cash calendar — 24 months">
        <div className="grid">
          <Stat label="Cash trough month" value={`Month ${calendar.troughMonth}`} note="Maximum cash pressure" />
          <Stat label="Balance at trough" value={money(calendar.troughBalance)} />
          <Stat label="Minimum capital to survive" value={money(calendar.minimumCapitalToSurvive)} />
          <Stat
            label="Months to positive cash flow"
            value={calendar.monthsToPositiveCashFlow === null ? 'NEVER' : `Month ${calendar.monthsToPositiveCashFlow}`}
            unknown={calendar.monthsToPositiveCashFlow === null}
            note={calendar.monthsToPositiveCashFlow === null ? 'Operations never turn cash positive at these inputs' : undefined}
          />
        </div>

        {calendar.troughBalance < 0 && (
          <Callout tone="bad" title="You run out of money">
            At {money(startingCash)} starting cash, the balance goes negative and bottoms out at{' '}
            {money(calendar.troughBalance)} in month {calendar.troughMonth}. You would need at least{' '}
            {money(calendar.minimumCapitalToSurvive)} to survive — and that is before the unpriced cost
            lines above are added.
          </Callout>
        )}

        <Callout tone="warn" title="The trough is not month one">
          Cash keeps falling after the first patient, not before. Payroll starts the moment care starts,
          while collections lag {scenario.daysToCash} days behind — so the worst month arrives well into
          operations, exactly when it feels like things are going well.
        </Callout>

        <Table head={<tr><th>Month</th><th>Phase</th><th className="num">Out</th><th className="num">In</th><th className="num">Net</th><th className="num">Balance</th></tr>}>
          {calendar.months.map((m) => (
            <tr key={m.month} style={m.month === calendar.troughMonth ? { background: 'rgba(255,107,107,0.10)' } : undefined}>
              <td>{m.month}</td>
              <td className="muted">{m.phase}</td>
              <td className="num">{money(m.cashOut)}</td>
              <td className="num">{money(m.cashIn)}</td>
              <td className="num" style={{ color: m.netMovement < 0 ? 'var(--bad)' : 'var(--good)' }}>{money(m.netMovement)}</td>
              <td className="num" style={{ color: m.cumulativeCash < 0 ? 'var(--bad)' : undefined }}>{money(m.cumulativeCash)}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Annual cost lines feeding this model">
        <Table head={<tr><th>Item</th><th>Required</th><th>Frequency</th><th className="num">Typical</th></tr>}>
          {costs.map((c) => (
            <tr key={c.id}>
              <td>{c.item}<div className="muted mono" style={{ fontSize: 10.5 }}>{c.id}</div></td>
              <td><span className={`pill ${c.required === 'Required' ? 'bad' : c.required === 'Recommended' ? 'warn' : 'neutral'}`}>{c.required}</span></td>
              <td className="muted">{c.frequency}</td>
              <td className="num">{c.actualQuote !== null ? money(c.actualQuote) : c.typical !== null ? money(c.typical) : <span className="pill unknown">Unknown</span>}</td>
            </tr>
          ))}
        </Table>
        <p className="small muted">
          {num(costs.filter((c) => c.typical === null && c.actualQuote === null).length, 0)} of {costs.length} lines
          have no established figure. No actual quotes have been obtained yet.
        </p>
      </Card>
    </>
  );
}
