# 2D Cricket Probability Batting Game

Single-player 2D cricket batting app built with React and Vite. Each delivery is decided by a probability-based power bar instead of RNG. Timing your click on the moving slider determines the outcome.

## Features
- Probability power bar with proportional segments (0,1,2,3,4,6, wicket) and two styles (Aggressive, Defensive).
- Moving slider chooses the result — no random selection.
- Bowling flight and bat swing animations per ball.
- Scoreboard with runs, wickets, overs (2 overs = 12 balls) and balls remaining; innings ends on wickets or overs.
- Restart option plus optional commentary lines for outcomes.

## Quick start
1) Install dependencies: `npm install`
2) Run dev server: `npm run dev`
3) Open the local URL from the terminal.

## How to play
- Pick a batting style (Aggressive = more boundaries and wickets, Defensive = safer, fewer boundaries).
- Watch the slider sweep across the power bar; click **Play Shot** to lock the current position.
- The segment under the slider decides the ball outcome; bowling animation plays before the score updates.
- Innings finishes after 12 balls or 2 wickets. Use **Restart Game** to begin again.

## Probability tables
- Aggressive: Wicket 35%, 0 10%, 1 12%, 2 12%, 3 6%, 4 10%, 6 15% (total 1.00)
- Defensive: Wicket 15%, 0 20%, 1 22%, 2 15%, 3 6%, 4 12%, 6 10% (total 1.00)

## Tech stack
- React 19 + Vite
- CSS animations and DOM-based rendering (no external canvas libs)
