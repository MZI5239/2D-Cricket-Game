import { useEffect, useMemo, useRef, useState } from 'react'
import './index.css'
import './App.css'

const TOTAL_OVERS = 2
const BALLS_PER_OVER = 6
const TOTAL_BALLS = TOTAL_OVERS * BALLS_PER_OVER
const MAX_WICKETS = 2

const STYLE_TABLE = {
  aggressive: [
    { label: 'Wicket', value: 'W', prob: 0.35, color: '#d7263d' },
    { label: '0', value: 0, prob: 0.1, color: '#64748b' },
    { label: '1', value: 1, prob: 0.12, color: '#0ea5e9' },
    { label: '2', value: 2, prob: 0.12, color: '#22c55e' },
    { label: '3', value: 3, prob: 0.06, color: '#eab308' },
    { label: '4', value: 4, prob: 0.1, color: '#f97316' },
    { label: '6', value: 6, prob: 0.15, color: '#7c3aed' },
  ],
  defensive: [
    { label: 'Wicket', value: 'W', prob: 0.15, color: '#d7263d' },
    { label: '0', value: 0, prob: 0.2, color: '#64748b' },
    { label: '1', value: 1, prob: 0.22, color: '#0ea5e9' },
    { label: '2', value: 2, prob: 0.15, color: '#22c55e' },
    { label: '3', value: 3, prob: 0.06, color: '#eab308' },
    { label: '4', value: 4, prob: 0.12, color: '#f97316' },
    { label: '6', value: 6, prob: 0.1, color: '#7c3aed' },
  ],
}

const commentaryBank = {
  W: ['Feather to the keeper! That is a wicket.', 'Gone! The gamble did not pay off.', 'Edged and taken. Pack your bags.'],
  0: ['Solid defense. No run.', 'Beaten on length; dot ball.', 'Soft hands, straight to the fielder.'],
  1: ['Nudged for a quick single.', 'Smart tap-and-run.', 'Rotating the strike nicely.'],
  2: ['Timed into the gap for two.', 'Hard running gets a couple.', 'Good placement, they steal two.'],
  3: ['Misfield allows three!', 'Long chase, they come back for three.', 'Deep corner, three runs.'],
  4: ['Cracking drive for four!', 'Pierced the infield to the rope.', 'That raced away to the boundary.'],
  6: ['That is out of the park! Six!', 'Clean swing over the ropes.', 'Downtown! Maximum.'],
}

const buildSegments = (entries) => {
  let acc = 0
  return entries.map((entry) => {
    const start = acc
    const end = acc + entry.prob
    acc = end
    return { ...entry, start, end }
  })
}

const clamp01 = (value) => Math.min(Math.max(value, 0), 0.9999)

const formatOvers = (balls) => `${Math.floor(balls / BALLS_PER_OVER)}.${balls % BALLS_PER_OVER}`

const pickCommentary = (value) => {
  const options = commentaryBank[value] || commentaryBank[0]
  const index = Math.floor(Math.random() * options.length)
  return options[index]
}

const findOutcome = (segments, slider) => {
  const target = clamp01(slider)
  return segments.find((segment) => target >= segment.start && target < segment.end) || segments[segments.length - 1]
}

function App() {
  const [styleKey, setStyleKey] = useState('aggressive')
  const [runs, setRuns] = useState(0)
  const [wickets, setWickets] = useState(0)
  const [balls, setBalls] = useState(0)
  const [sliderPos, setSliderPos] = useState(0)
  const [locked, setLocked] = useState(false)
  const [ballKey, setBallKey] = useState(0)
  const [swinging, setSwinging] = useState(false)
  const [lastOutcome, setLastOutcome] = useState(null)
  const [commentary, setCommentary] = useState('Tap "Play Shot" to start the innings.')
  const [flash, setFlash] = useState(null)

  const dirRef = useRef(1)
  const frameRef = useRef(null)

  const segments = useMemo(() => buildSegments(STYLE_TABLE[styleKey]), [styleKey])
  const gameOver = wickets >= MAX_WICKETS || balls >= TOTAL_BALLS
  const ballsRemaining = Math.max(TOTAL_BALLS - balls, 0)

  useEffect(() => {
    let last = performance.now()
    const tick = (now) => {
      const deltaSeconds = (now - last) / 1000
      last = now
      setSliderPos((prev) => {
        let next = prev + deltaSeconds * 0.6 * dirRef.current
        if (next > 1) {
          next = 1
          dirRef.current = -1
        } else if (next < 0) {
          next = 0
          dirRef.current = 1
        }
        return next
      })
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  useEffect(() => {
    if (gameOver) {
      setLocked(true)
      setCommentary('Innings complete. Hit restart to play again.')
    }
  }, [gameOver])

  const handleShot = () => {
    if (locked || gameOver) return
    const outcome = findOutcome(segments, sliderPos)
    setLocked(true)
    setSwinging(true)
    setBallKey((key) => key + 1)

    setTimeout(() => {
      setSwinging(false)
      setBalls((prev) => prev + 1)
      if (outcome.value === 'W') {
        setWickets((prev) => prev + 1)
        setFlash('wicket')
      } else {
        setRuns((prev) => prev + outcome.value)
        setFlash('hit')
      }
      setLastOutcome(outcome)
      setCommentary(pickCommentary(outcome.value))
      setLocked(false)
      setTimeout(() => setFlash(null), 480)
    }, 900)
  }

  const resetGame = () => {
    setStyleKey('aggressive')
    setRuns(0)
    setWickets(0)
    setBalls(0)
    setLastOutcome(null)
    setBallKey((key) => key + 1)
    setCommentary('New innings. Choose a style and play your shot.')
    setLocked(false)
  }

  const currentStatus = gameOver
    ? wickets >= MAX_WICKETS
      ? 'All out'
      : 'Overs finished'
    : 'In progress'

  return (
    <div className="app">
      <div className="sticky-note" aria-label="Student details sticky note">
        <p className="sticky-title">Muhammad Zain Imran</p>
        <p className="sticky-line">Roll: 23i-0855</p>
        <p className="sticky-line">Section: CS-D</p>
      </div>
      <header className="topbar">
        <div>
          <p className="eyebrow">CS-4032 · 2D Cricket Web App</p>
          <h1>Probability Power Batting</h1>
          <p className="lede">
            Pick a batting style, watch the slider sweep the probability bar, and time your click to decide every ball.
          </p>
        </div>
        <div className="style-switch">
          <button
            type="button"
            className={styleKey === 'aggressive' ? 'pill active aggressive' : 'pill aggressive'}
            onClick={() => setStyleKey('aggressive')}
            disabled={locked}
          >
            Aggressive
            <span className="note">High risk · High reward</span>
          </button>
          <button
            type="button"
            className={styleKey === 'defensive' ? 'pill active defensive' : 'pill defensive'}
            onClick={() => setStyleKey('defensive')}
            disabled={locked}
          >
            Defensive
            <span className="note">Low risk · Steady</span>
          </button>
        </div>
      </header>

      <section className="dashboard">
        <div className="ground-card">
          <div className="score-bubble">
            <div>
              <p className="label">Runs</p>
              <p className="score">{runs}</p>
            </div>
            <div>
              <p className="label">Wickets</p>
              <p className="score">{wickets}/{MAX_WICKETS}</p>
            </div>
            <div>
              <p className="label">Overs</p>
              <p className="score">{formatOvers(balls)} / {TOTAL_OVERS}</p>
            </div>
            <div>
              <p className="label">Balls left</p>
              <p className="score">{ballsRemaining}</p>
            </div>
            <div>
              <p className="label">Status</p>
              <p className="score status">{currentStatus}</p>
            </div>
          </div>

          <div className="stadium">
            <div className="stands"></div>
            <div className="crowd"></div>
            <div className={`field ${flash ? `flash-${flash}` : ''}`}>
              <div className="boundary-rope" aria-hidden="true"></div>
              <div className="inner-ring" aria-hidden="true"></div>
              <div className="pitch">
                <div className="crease front" aria-hidden="true"></div>
                <div className="crease back" aria-hidden="true"></div>
                <div className={`bat ${swinging ? 'swing' : ''}`}></div>
                <div className="stumps" aria-hidden="true">
                  <div className="bails"></div>
                  <div className="stump left"></div>
                  <div className="stump mid"></div>
                  <div className="stump right"></div>
                </div>
                <div key={ballKey} className="ball" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="control-panel">
          <div>
            <h2>Probability Power Bar</h2>
            <p className="hint">Segments are sized exactly by their probability. The slider decides the result.</p>
          </div>
          <div className="power-bar" role="presentation">
            {segments.map((segment) => (
              <div
                key={segment.label}
                className="power-segment"
                style={{ width: `${segment.prob * 100}%`, backgroundColor: segment.color }}
                title={`${segment.label === 'Wicket' ? 'Wicket' : `${segment.label} runs`} · ${(segment.prob * 100).toFixed(0)}%`}
              >
                <span>{segment.label}</span>
                <span className="pct">{Math.round(segment.prob * 100)}%</span>
              </div>
            ))}
            <div className="slider" style={{ left: `${sliderPos * 100}%` }}></div>
          </div>

          <div className="controls">
            <button
              type="button"
              className="primary"
              onClick={handleShot}
              disabled={locked || gameOver}
            >
              {gameOver ? 'Innings Over' : locked ? 'Ball in flight...' : 'Play Shot'}
            </button>
            <button type="button" className="ghost" onClick={resetGame}>
              Restart Game
            </button>
            {lastOutcome && (
              <div className="result-tag">
                Last ball: {lastOutcome.label === 'Wicket' ? 'Wicket' : `${lastOutcome.label} run${lastOutcome.label === 1 ? '' : 's'}`}
              </div>
            )}
          </div>

          <div className="prob-table">
            <h3>Current style probabilities</h3>
            <div className="prob-grid">
              {segments.map((segment) => (
                <div key={segment.label} className="prob-row">
                  <span className="dot" style={{ backgroundColor: segment.color }}></span>
                  <span className="outcome">{segment.label === 'Wicket' ? 'Wicket' : `${segment.label} run${segment.label === 1 ? '' : 's'}`}</span>
                  <span className="value">{(segment.prob * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="commentary">
            <h3>Commentary</h3>
            <p>{commentary}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
