# Profile assets

Every image in the profile README is generated. Text is converted to vector outlines (Inter +
JetBrains Mono) so it renders identically on every OS: GitHub shows README SVGs inside `<img>`,
where web fonts can't load. Every animation respects `prefers-reduced-motion`, and every asset has
a `-dark` and a `-light` file, picked by `<picture>` and `prefers-color-scheme`.

```bash
cd assets/src
npm install
npm run build                            # static cards → ../*.svg (commit them)
node live.mjs --out /tmp/live --sample   # preview the live cards with made-up data
```

**Static** (`build.mjs`): the banner, status pill, project cards (EchoAndAura, shortn, noOverlap)
and toolbox. Edit the `CONTENT` block at the top to change the text; colours live in `theme.mjs`.

**Live** (`live.mjs`): the status board, GitHub activity and Codeforces cards.
`.github/workflows/live.yml` runs it hourly. It checks each project's health endpoint (status code
and response time only), fetches GitHub and Codeforces stats, and force-pushes the SVGs plus the
check history (`data.json`) as a single commit to the `output` branch. The README loads them from
`raw.githubusercontent.com/.../output/`. A source that fails keeps its previous data. Edit `CONFIG`
at the top of `live.mjs` to change the handles, the sites, or which repos and languages count.

Optional: a personal access token saved as the `STATS_TOKEN` repository secret (scope `read:user`)
lets the GitHub card count private contributions; without it the card shows public activity.
