# ReportBack

Feedback and bug report *à la* YouTube — a draggable, in-page widget that
captures a screenshot, page metadata, cookies, and a user-written description.

## Demo

Try it here: **<https://filipegarcia.github.io/ReportBack/>** — press the
**Feedback** button in the bottom-right corner and take it out for a spin.

## Screenshots

| Desktop | Phone (iPhone 13) |
|---------|-------------------|
| ![Home](docs/screenshots/01-home.png)                 | ![iPhone home](docs/screenshots/06-iphone-home.png)   |
| ![Step 1](docs/screenshots/02-step1-description.png)  | ![iPhone step 1](docs/screenshots/07-iphone-step1.png) |
| ![Step 2](docs/screenshots/03-step2-highlight.png)    | ![iPhone step 2](docs/screenshots/08-iphone-step2.png) |
| ![Step 3](docs/screenshots/04-step3-review.png)       | ![iPhone step 3](docs/screenshots/09-iphone-step3.png) |
| ![Step 4](docs/screenshots/05-step4-done.png)         | ![iPhone step 4](docs/screenshots/10-iphone-step4.png) |

## Run it locally

```bash
git clone https://github.com/filipegarcia/ReportBack.git
cd ReportBack
npm install
npm start
```

Then open <http://127.0.0.1:8080>.

## Tests & screenshots

```bash
npm run screenshots   # regenerates the PNGs above
npm run test:e2e      # full Playwright suite
```

## Author

ReportBack was created by [Filipe Garcia](mailto:hello@evolving.in).

## License

Code licensed under the [Apache License v2.0](https://www.apache.org/licenses/LICENSE-2.0).
