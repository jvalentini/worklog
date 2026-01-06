# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0](https://github.com/jvalentini/worklog/compare/worklog-v3.1.0...worklog-v4.0.0) (2026-01-06)


### ⚠ BREAKING CHANGES

* Source-centric output mode removed. Project-centric is now the only mode. This simplifies the codebase and provides a better user experience with enhanced one-liners by default and full details via --verbose flag.
* This release introduces v2.0.0 with improved install.sh and binary distribution

### Features

* add --last flag and disable LLM by default ([59d9947](https://github.com/jvalentini/worklog/commit/59d994759a36fda16e69ace6c8038dd92c1b34fd))
* add 6 new dashboard themes and refactor to modular structure ([ff20374](https://github.com/jvalentini/worklog/commit/ff2037493b6234fdcaab81331861180921c2457b))
* add bash completion for worklog commands ([1700241](https://github.com/jvalentini/worklog/commit/1700241e904ff8700eee68af3ec4a682bf116311))
* add calendar integration source ([e662cc1](https://github.com/jvalentini/worklog/commit/e662cc1eb5905eb1951aa7f3da65286e1933bef6))
* add context recovery for session resumption ([b029f2f](https://github.com/jvalentini/worklog/commit/b029f2f88b05d586e365cc470e7d7a4ba01953a3))
* add cron subcommand for scheduled daily reports ([9d4060d](https://github.com/jvalentini/worklog/commit/9d4060dec128ddc1c0a634bf18d3cdfc1b2d126f))
* add cross-platform support and improved config validation ([962d324](https://github.com/jvalentini/worklog/commit/962d324b80678dc16622b3b003ca5ba6b9f0d2a8))
* add dark mode toggle to dashboard ([bf5eca8](https://github.com/jvalentini/worklog/commit/bf5eca8ba0bafc11b635718432f8c0f70e7975a9))
* add GitHub Packages publishing support ([3749f94](https://github.com/jvalentini/worklog/commit/3749f94f48b3538e6353396cae0fba8324d9d417))
* add interactive dashboard with --dashboard flag ([1346a7d](https://github.com/jvalentini/worklog/commit/1346a7d990d4516f80a695715506b8a1ad8140ec))
* add interactive source filter to dashboard ([cebb483](https://github.com/jvalentini/worklog/commit/cebb483394a80188d240d97846e22c3669ebb372))
* add Jira/Linear ticket correlation ([5b178db](https://github.com/jvalentini/worklog/commit/5b178dba23ecf2bc802cdf3f52b660a71142db74))
* add make install target for local binary installation ([8792ae3](https://github.com/jvalentini/worklog/commit/8792ae342e4ea9f15e7ebd07d73be8e15b485e81))
* add make target for bash completion setup ([3700f93](https://github.com/jvalentini/worklog/commit/3700f9354779c73841d36e11946c250a90385a52))
* Add Misc bucket for unattributed items in project aggregation ([9f28ea0](https://github.com/jvalentini/worklog/commit/9f28ea0260c35c2c59160f9c6348d2de8704b5bd))
* add Misc bucket rendering tests and null path in JSON output ([0bdab2e](https://github.com/jvalentini/worklog/commit/0bdab2e9e2fefe67653ed493f1a2cad5e10818d4))
* add monthly/quarterly summary reports with weekly rollups ([03cb98d](https://github.com/jvalentini/worklog/commit/03cb98dbfcaee6a97122d85b11d3e775ca03a7fa))
* add mountain layers with pine trees to Forest theme ([0c7e49e](https://github.com/jvalentini/worklog/commit/0c7e49e66490924a06e00ddce29a739d94d920ce))
* add one-liner install script ([67bb2f7](https://github.com/jvalentini/worklog/commit/67bb2f7020e63e12cbe2fb0b246d01c4054b1477))
* add parallax descent effect to Forest theme ([4b663cb](https://github.com/jvalentini/worklog/commit/4b663cbc46ee19f7c29da5009c1a63156c259220))
* add productivity pattern analysis ([c142480](https://github.com/jvalentini/worklog/commit/c1424808164d1908e93a77b9bb8c1165eac7069a))
* add productivity pattern analysis ([d7ccc23](https://github.com/jvalentini/worklog/commit/d7ccc233df1db441db176d10f32162da68061965))
* add project attribution resolver for repo-or-misc mapping ([c1056c8](https://github.com/jvalentini/worklog/commit/c1056c8007c793eb818eac8058aca075b4d8ad86))
* add project-centric summaries with LLM support ([01406bc](https://github.com/jvalentini/worklog/commit/01406bc375ccaebb6136ac22f0923fc36f51d2b9))
* Add repo attribution for Codex sessions ([8d2af97](https://github.com/jvalentini/worklog/commit/8d2af976c99c04a222a00411f7640219bddba27b))
* Add repo attribution for OpenCode sessions via file path evidence ([5637bda](https://github.com/jvalentini/worklog/commit/5637bda1ca2add1cec34cb4ea35fa1d1b6be75c2))
* add scheduled snapshots, dashboard, and backfill ([46de1bf](https://github.com/jvalentini/worklog/commit/46de1bf786cf33f6bfb1cb1761126873c24a2feb))
* add Slack thread summaries source ([bd49a32](https://github.com/jvalentini/worklog/commit/bd49a325c3388c6864878bc30910d67c3bd459e1))
* add smart context summarization with semantic clustering ([2b21eba](https://github.com/jvalentini/worklog/commit/2b21eba8299f4a6315917ece976de12a0c421ce1))
* add smarter concise summaries ([ad32218](https://github.com/jvalentini/worklog/commit/ad32218e20d50812f905b43cc58908278221f55f))
* add smarter concise summaries ([451f299](https://github.com/jvalentini/worklog/commit/451f299bb824aa1a10fe9f1454b12c318b41544e))
* add support for merged PRs via gh search prs command ([b6bdfbf](https://github.com/jvalentini/worklog/commit/b6bdfbfb8eeeee7031468e38b648a8da5aca654a))
* add terminal attribution via cd timeline tracking ([3d33ed1](https://github.com/jvalentini/worklog/commit/3d33ed15f7995ae458495337923b2113c91ff0ca))
* add theme system to dashboard (default + chaos) ([0aaa631](https://github.com/jvalentini/worklog/commit/0aaa631a1fc1bf8257abb0b7902b201b8d70cedb))
* add timezone configuration ([bdd1997](https://github.com/jvalentini/worklog/commit/bdd1997014f6641430998cc4175cbeff904e70fa))
* add VS Code, Cursor, terminal, and filesystem data sources ([ce219ae](https://github.com/jvalentini/worklog/commit/ce219ae5eddb395ed74cb0acb706814f12d19074))
* collect opened+merged GitHub PRs with URLs and extracted summaries ([a160bb0](https://github.com/jvalentini/worklog/commit/a160bb0a3e16849f3dde441a062692459f108746))
* enhance Forest theme with rich atmospheric parallax layers ([3262f50](https://github.com/jvalentini/worklog/commit/3262f50450aac9410bb41076d23b21f90e0a5efb))
* implement end-to-end --trends functionality ([3c5d1a2](https://github.com/jvalentini/worklog/commit/3c5d1a273f513597d877caf336799d6a4fad9bf2))
* implement enhanced project reporting with verbose mode ([0913b94](https://github.com/jvalentini/worklog/commit/0913b9479e70beea9f39de2d86e6e2014131cccc))
* implement historical search for past standups ([340ec0b](https://github.com/jvalentini/worklog/commit/340ec0bb97a7108682caf6d86da15fec0195a817))
* implement trend analytics with --trends flag ([9416e85](https://github.com/jvalentini/worklog/commit/9416e854d0b96835c5f8637b16ee1903da182ecf))
* implement weekly project rollup with PR/branch lines first ([8a53564](https://github.com/jvalentini/worklog/commit/8a5356432ae372a695d9ad625771b93cfa59f5b4))
* improve dashboard port selection with automatic fallback ([d43b820](https://github.com/jvalentini/worklog/commit/d43b82019fb37af3e53615b04229456345960c44))
* Initial worklog CLI implementation ([f155af3](https://github.com/jvalentini/worklog/commit/f155af3278230c41543fe8a58138417132431518))
* **llm:** add Gemini as a supported LLM provider ([479ae7e](https://github.com/jvalentini/worklog/commit/479ae7e985972edd061a0457e156e78562b3ee89))
* **llm:** add merged PR summarization and improve formatting ([360cd9a](https://github.com/jvalentini/worklog/commit/360cd9a37dcf4e4df2acc47e8db2337682ab25b5))
* make concise output default with --verbose flag ([2f9c20a](https://github.com/jvalentini/worklog/commit/2f9c20a36e30686c9a019ee11f239467bab213dd))
* make cron run Slack posting testable and add unit tests ([48c6edd](https://github.com/jvalentini/worklog/commit/48c6edd4eb615bb8cfcd343a40810b7b71414446))
* prepare for v2.0.0 major release ([529199a](https://github.com/jvalentini/worklog/commit/529199af0c9c8c3f0700c0059aedf2c3cd8aa685))
* redesign dashboard themes with bold visual orientations ([039f1f4](https://github.com/jvalentini/worklog/commit/039f1f4ddceb38ef0ef13335f892f2f956ea0801))
* redesign dashboard with nerdy max-info professional theme ([857755d](https://github.com/jvalentini/worklog/commit/857755dadf99467adb6c792364702d5ae7986808))
* redesign theme layouts with distinct visual styles ([717541b](https://github.com/jvalentini/worklog/commit/717541b3f0bb1e69a150c7764ec7016def765887))
* **sources:** attribute VS Code and Cursor workspaces to repos ([a3686f0](https://github.com/jvalentini/worklog/commit/a3686f028bba53283470e6246fbb3ce882e033b7))
* standup-grade weekly summaries with PR/branch lines ([78dbda1](https://github.com/jvalentini/worklog/commit/78dbda1889543eac3273c83fc74f2dd3cfa86f91))
* use PR summary from body in weekly reports ([772a2c5](https://github.com/jvalentini/worklog/commit/772a2c59061162de7f99aa6e3e87e6c92767bb89))


### Bug Fixes

* add missing calendar config to test mocks ([fed88ac](https://github.com/jvalentini/worklog/commit/fed88ac8b7d0be9a4daf9e44e4f67edf09d241aa))
* add missing isSingleDay function and fix test type error ([a32d1ca](https://github.com/jvalentini/worklog/commit/a32d1ca59d3c5f493d05bc004121678b87b6ee71))
* apply lint fix for template literal in summary test ([12d101b](https://github.com/jvalentini/worklog/commit/12d101b9786cbb0557dce2afe94bed4aa8bf1a2c))
* correct JSON formatting in generated config.json ([f439812](https://github.com/jvalentini/worklog/commit/f439812fe0e45418408cd78ab41bf9432e635f2f))
* **dashboard:** handle empty summary without NaN ([9bc3c4a](https://github.com/jvalentini/worklog/commit/9bc3c4a1dda51ac415dd092b2127c81cfa680e3d))
* ensure release-please triggers on PR merges ([9ca10c3](https://github.com/jvalentini/worklog/commit/9ca10c394156706f1091f5f469bdc49446248ffd))
* handle empty repos array with set -u in install.sh ([6900160](https://github.com/jvalentini/worklog/commit/690016030dc7595a675076cbf96c6ef595da41fd))
* improve bash completion script ([71d3048](https://github.com/jvalentini/worklog/commit/71d3048b6a94ce10501a05ff9d4663ec992ee924))
* improve binary path detection for cron jobs ([0db6b32](https://github.com/jvalentini/worklog/commit/0db6b328a476f8af0613cc7d3cc6e2054e0c1d79))
* make editor workspace parsing cross-platform ([148ccf8](https://github.com/jvalentini/worklog/commit/148ccf85727ca034e7b0e3186ecdaeabf4c1d494))
* make snapshot ranges timezone-aware ([7baece6](https://github.com/jvalentini/worklog/commit/7baece67849b9b0acf2e8d1d0c7a344a88f2cf3e))
* remove duplicate config declaration in dashboard command ([3661b80](https://github.com/jvalentini/worklog/commit/3661b80252f8d61020d27b9a2f4d7db47b76ff3e))
* remove duplicate isSingleDay function ([6fcdd60](https://github.com/jvalentini/worklog/commit/6fcdd603bfcd951dd33b7c644f4cb6d7361d9239))
* remove non-null assertions to satisfy lint rules ([b047b2e](https://github.com/jvalentini/worklog/commit/b047b2e798e3eb2fa53968f9d28eceecbb4b9e4f))
* remove unused import in config.test.ts ([e6441b1](https://github.com/jvalentini/worklog/commit/e6441b17e798c9352d404c4167579965074eaca9))
* remove unused isSameDay import ([4414525](https://github.com/jvalentini/worklog/commit/44145259cef418ec8a7087e09e9e46aaba6c8828))
* replace Bun.$ with node:fs/promises mkdir ([0118111](https://github.com/jvalentini/worklog/commit/0118111dd785f677552091aa938d70f2803c1fd0))
* replace non-null assertions with optional chaining and add missing slack path config ([d83b44e](https://github.com/jvalentini/worklog/commit/d83b44ee08f6c66a94d0bf7b8e6f48a32606f51c))
* resolve agent session detection and GitHub PR title issues ([565b404](https://github.com/jvalentini/worklog/commit/565b404dee5f6e4c9842526d5f5eaa376f15f749))
* resolve lint and type errors ([741faef](https://github.com/jvalentini/worklog/commit/741faef616d97a21062250bb028126a276b12d22))
* resolve lint error in codex.test.ts ([a0661a4](https://github.com/jvalentini/worklog/commit/a0661a4aa6dc754ac80c148b6eb2394c91e72ab8))
* resolve TypeScript type errors in fallback token extraction ([1a7eaa1](https://github.com/jvalentini/worklog/commit/1a7eaa1662efe8401781856dac4237f611ae2382))
* resolve TypeScript type errors in theme generation ([1c3eed1](https://github.com/jvalentini/worklog/commit/1c3eed12ee5790957ed0b79cf8b8466da4a71bba))
* resolve variable name collision in generateThemeLabel function ([06fcdb7](https://github.com/jvalentini/worklog/commit/06fcdb7acab479dd1bb884fd12063d0224adac12))
* strip trailing slashes when extracting project names from repo paths ([c76e04f](https://github.com/jvalentini/worklog/commit/c76e04f1195cdae1288b59036543d0f60500ecd0))
* update integration test to match v2.0 output format ([2e08bfa](https://github.com/jvalentini/worklog/commit/2e08bfad24525a2a042ec1c5f0c666a682a2a31e))
* update release-please manifest to match current version ([6b83748](https://github.com/jvalentini/worklog/commit/6b83748ce6f3274499ea055c08379b59ddf3a3de))
* update test expectations to match implementation behavior ([28afc51](https://github.com/jvalentini/worklog/commit/28afc5184a80ee67aa6ba5ce90ff0f71b98cc25a))
* use bullet points in concise mode instead of semicolons ([2ecb801](https://github.com/jvalentini/worklog/commit/2ecb801c5a3df95eec06771434080fa7e896714c))
* warn when no sources configured instead of defaulting ([116a54f](https://github.com/jvalentini/worklog/commit/116a54f63953913c473839fe07d969f27f5aeaa5))


### Documentation

* add banner image and update README badges ([310ace9](https://github.com/jvalentini/worklog/commit/310ace94e74a980ce3e19b5e5f69a03bb6fb91ae))
* add changelog entries for PR [#12](https://github.com/jvalentini/worklog/issues/12) ([080b55a](https://github.com/jvalentini/worklog/commit/080b55af46438f5bd0bdf008f87aea24209dd974))
* add changelog entry for GitHub performance improvements ([434ada6](https://github.com/jvalentini/worklog/commit/434ada63ce20d10520a3d01ad5693a7c16d39d48))
* add changelog entry for PR [#20](https://github.com/jvalentini/worklog/issues/20) ([e0373e6](https://github.com/jvalentini/worklog/commit/e0373e6a76d823fe9dc6c9ae0ac2a618fc825926))
* add comprehensive examples directory with user stories ([3c88c1a](https://github.com/jvalentini/worklog/commit/3c88c1ad63feedb5c9a7c87e248ea152858e8f6d))
* add comprehensive README with usage, configuration, and examples ([de2bdc7](https://github.com/jvalentini/worklog/commit/de2bdc721ce93fa19353d19c0b788c45e25ddd05))
* add npm and bun installation instructions to README ([140991c](https://github.com/jvalentini/worklog/commit/140991c04ace16bf4cd5292f59e6680203ef00ae))
* add repo URL to README ([ed17fc4](https://github.com/jvalentini/worklog/commit/ed17fc48e33a11a459ecd224e6fe9d847870bdbd))
* add repository stats badges to README ([1238309](https://github.com/jvalentini/worklog/commit/1238309d469ead70fe1747525d9176d44d85d54b))
* clarify sources, fix output example, update URL ([4ba143d](https://github.com/jvalentini/worklog/commit/4ba143d54ce8a79bf6a96c8b71e7cd3dfe32728d))
* consolidate badges onto fewer rows ([7df6fdb](https://github.com/jvalentini/worklog/commit/7df6fdb2ce34b6da4aa634fed6506f6bacf0f9d3))
* remove outdated 'trends disabled' notice from README ([5eaa266](https://github.com/jvalentini/worklog/commit/5eaa266e45bb37cc35d74552d4e2867b043364d9))
* update changelog for bash completion feature ([4bcbad6](https://github.com/jvalentini/worklog/commit/4bcbad63fdedeb6b87cc6e4fa2965db88cae9d1c))
* update changelog for make completion target ([0fc4c7e](https://github.com/jvalentini/worklog/commit/0fc4c7e3770888591bdbb8a74e38b2edd1555be6))
* update changelog for PR [#11](https://github.com/jvalentini/worklog/issues/11) ([1ab1334](https://github.com/jvalentini/worklog/commit/1ab1334659ef85a6f07f3d9cc46fbc36da275920))
* update changelog for PR [#16](https://github.com/jvalentini/worklog/issues/16) ([61d5164](https://github.com/jvalentini/worklog/commit/61d516420ec399c9331e1a4bf8515374cc1a9c80))
* update changelog for PR [#21](https://github.com/jvalentini/worklog/issues/21) ([87e5c73](https://github.com/jvalentini/worklog/commit/87e5c7363b9883de7908a031c70196c8dbc81a6e))
* update changelog for release-please setup ([4f4c24d](https://github.com/jvalentini/worklog/commit/4f4c24d4d1e0e149e867c5aa2092a575f7af8d5f))
* update CHANGELOG for theme redesign ([84eab33](https://github.com/jvalentini/worklog/commit/84eab33ce00d485436ce21b86b33f8c596f1f78f))
* update documentation for new features ([82a6ebb](https://github.com/jvalentini/worklog/commit/82a6ebb304c004e76873e25bac001368bcdea567))
* update README and CHANGELOG for v2.x features ([803db13](https://github.com/jvalentini/worklog/commit/803db1316523bff612271be1fad47fd05a63bc2b))
* update README with concise output examples ([a6a30dc](https://github.com/jvalentini/worklog/commit/a6a30dcf8d6a15e88b71dd7637f8cedd83d4702e))
* update README with make install/deps/uninstall targets ([9269417](https://github.com/jvalentini/worklog/commit/92694174c963a65aaef9ac510cc8fce7cc5bf3eb))


### Styles

* add secondary-metrics styling to Papercut theme ([d10f64e](https://github.com/jvalentini/worklog/commit/d10f64e25dd77fe48fc03078d150948fc96756f5))
* apply biome formatting to tsconfig.json ([c5be4a7](https://github.com/jvalentini/worklog/commit/c5be4a7c486337b9a5133199fe92a9a8e5c78c45))
* fix biome formatting issues in analyzer.ts ([4f57ad5](https://github.com/jvalentini/worklog/commit/4f57ad526f1c711094027df18adcda4672963b39))
* fix lint warnings in merged polecat code ([6d023ee](https://github.com/jvalentini/worklog/commit/6d023ee319e32fd04b621b9e23a0d092db7dca12))


### Code Refactoring

* deduplicate JSONL traversal and subject cleaning helpers ([05e4ae8](https://github.com/jvalentini/worklog/commit/05e4ae8e458fcb1363a729f1ffb73dd67bccabae))
* extract port selection logic into reusable utility module ([0935237](https://github.com/jvalentini/worklog/commit/093523741223d3261ca3b15c987e078d65ef6a47))
* make filesystem source repo-centric ([3d76add](https://github.com/jvalentini/worklog/commit/3d76addc5292c8d5532fa90d4d2d779ee7c0c152))
* remove unsafe type casts in CLI option parsing ([b24367a](https://github.com/jvalentini/worklog/commit/b24367abecef51174526f8ecea1807d34d1e8b38))


### Performance Improvements

* dramatically improve GitHub source performance and add progress reporting ([86808e6](https://github.com/jvalentini/worklog/commit/86808e6e191c859eb5b024b44d8bfb7343b48d94))


### Tests

* add comprehensive test coverage for data sources ([8a4cda0](https://github.com/jvalentini/worklog/commit/8a4cda0661f043f26f1172351fa07af06128e08a))
* add comprehensive testing infrastructure ([60d589b](https://github.com/jvalentini/worklog/commit/60d589b014e0f9bd3df3f9e12c238813b6460808))
* Add comprehensive unit tests for trends calculations ([38fc3d8](https://github.com/jvalentini/worklog/commit/38fc3d8f304efc209bf72becc00941f5c2ce9d7a))
* add end-to-end tests for GitHub PR workflow ([7dc6dda](https://github.com/jvalentini/worklog/commit/7dc6dda4d3e1787abd524213e1c8192861247072))
* add unit tests for date utilities ([e5ba1e9](https://github.com/jvalentini/worklog/commit/e5ba1e9a7a33c89d8c43ee47425c4639699d7b96))
* cover trends and cron Slack posting ([076c56a](https://github.com/jvalentini/worklog/commit/076c56a171dfe6a84fb47beac38f7d5e93a4c83d))
* improve opencode.ts coverage from 36% to 90% ([a0063d0](https://github.com/jvalentini/worklog/commit/a0063d04b52b32d6688ddae2886ea14a0cf64a64))
* update test expectations for new project heading format ([1dcd19f](https://github.com/jvalentini/worklog/commit/1dcd19f5caf3199aa28a4b1830243d2db6a54090))


### Chores

* add beads deletion records from git history backfill ([9655bbf](https://github.com/jvalentini/worklog/commit/9655bbf183504b79ba742a041c9cf2995d73df34))
* add biome and oxlint to mise tools ([d8d6a14](https://github.com/jvalentini/worklog/commit/d8d6a147c50fb5db2cf9616711bb1fd46775d544))
* add issues permission and PAT support for release-please ([0f58945](https://github.com/jvalentini/worklog/commit/0f5894576d171672b08e1b97595b9b8d4be963d2))
* add linting, pre-commit hooks, and CI/CD workflows ([9b86628](https://github.com/jvalentini/worklog/commit/9b86628e0f5873197e0c4c3046bb3d24e9d2ff71))
* add release-please manifest file ([0387695](https://github.com/jvalentini/worklog/commit/03876958924213681e4d23b2c7511d003b6cef49))
* Close bead wl-idh (unit tests for trends) ([f9d7d46](https://github.com/jvalentini/worklog/commit/f9d7d46128fa355594153e217f6d90ca4bdc08d7))
* close completed task wl-v9i.4 ([b60d982](https://github.com/jvalentini/worklog/commit/b60d982154b592bb1aa06275db83e8037ffbe902))
* configure release-please to skip releases, use tags-only approach ([0669359](https://github.com/jvalentini/worklog/commit/0669359555725840ae10100090c07266e93e1ed7))
* finalize standup-grade summaries epic ([cee6b90](https://github.com/jvalentini/worklog/commit/cee6b90b82aec472612b7c53e6f5c35b677471d3))
* force release-please to run ([094a10b](https://github.com/jvalentini/worklog/commit/094a10b5e23aa0a204ba01410ef0127a51a0b9da))
* **main:** release worklog 1.1.0 ([5a4e712](https://github.com/jvalentini/worklog/commit/5a4e712f01fb050179311833b00e1d5d4e5470ed))
* **main:** release worklog 2.0.0 ([1eedd9a](https://github.com/jvalentini/worklog/commit/1eedd9ad4e909de9445448389609183b17b73441))
* migrate bd from no-db mode to default SQLite mode ([db40d05](https://github.com/jvalentini/worklog/commit/db40d05ed3ad3d2facb4429835b85d624fa6ba67))
* release v1.0.0 ([9a98f61](https://github.com/jvalentini/worklog/commit/9a98f61fbc4aacd6ed0852614e5c27aa64815d22))
* remove install.sh ([1472d05](https://github.com/jvalentini/worklog/commit/1472d0549ae9f0e720317ca695d3ed6273eea89c))
* setup release-please for automated releases ([29da1e0](https://github.com/jvalentini/worklog/commit/29da1e0073ad64d284def369250bd6c38b3ef001))
* skip Biome format for markdown-only commits ([f162ea7](https://github.com/jvalentini/worklog/commit/f162ea728244d51106767f6e45d338b0c8df03c3))
* sync beads database state ([ea0ca30](https://github.com/jvalentini/worklog/commit/ea0ca30156a949af31210a4cf6fca820c0f05738))
* sync beads database with main branch ([864a602](https://github.com/jvalentini/worklog/commit/864a602ee661a2db487dd7976c53a4324d83ab91))
* update bd issue wl-59 status to in_progress ([aae62f3](https://github.com/jvalentini/worklog/commit/aae62f370f11bd911f946186470ee380f0bb5fac))
* update beads - close wl-wb1.9 ([5cb5678](https://github.com/jvalentini/worklog/commit/5cb5678bf56c36056a10e5b741f08c324e059434))
* update beads database state ([134028f](https://github.com/jvalentini/worklog/commit/134028f6b29fe4135410d571b8e49ce1a2dbc339))
* update beads database state ([50980e6](https://github.com/jvalentini/worklog/commit/50980e69de7b7bbc4626e35f9435bdc0c67dd374))
* update beads database state ([2e8da51](https://github.com/jvalentini/worklog/commit/2e8da513d59d57882f77e830543396dd5dec23bd))
* Update beads status for wl-wb1.10 ([3b14186](https://github.com/jvalentini/worklog/commit/3b14186561ad6a7a55f57b8ee8c18e86ad27ff6c))
* update beads task status for wl-wb1.4 ([124c5b6](https://github.com/jvalentini/worklog/commit/124c5b6bbeb88e5169cf19c1a72b6cdbf783fdd8))
* update beads tracker - close wl-wb1.12 ([7385ab3](https://github.com/jvalentini/worklog/commit/7385ab3cd4e3f3914b12f05069d04abff82ecdfd))
* update release-please action to correct name ([9cc2055](https://github.com/jvalentini/worklog/commit/9cc2055b9d5ed9cd84ebb9c88e892f16030a02e8))
* update release-please config to handle non-conventional commits ([3e05078](https://github.com/jvalentini/worklog/commit/3e05078e968f55ab3b9eeac96aaff099ab98989b))


### Continuous Integration

* add Docker integration test for install.sh ([f33ad66](https://github.com/jvalentini/worklog/commit/f33ad66814f24f4615b0f3a42a91b8317ef06ef0))
* improve release-please workflow configuration ([b7f9246](https://github.com/jvalentini/worklog/commit/b7f9246dbdc47106dd0dc0d99214f2e20b6c5d00))

## [Unreleased]

### Performance

* dramatically improve GitHub source performance and add progress reporting (#19) — thanks @jvalentini

### Features

* Redesign dashboard themes with distinct visual layouts (#34) — thanks @jvalentini
* Standup-grade weekly summaries with PR/branch lines (#21) — thanks @jvalentini
* add Beads issue tracking, project attribution, and trends analysis (#20) — thanks @jvalentini
* add project-centric summaries with LLM support (#16) — thanks @jvalentini
* add interactive dashboard with dark mode and source filtering (#11) — thanks @jvalentini
* add VS Code, Cursor, terminal, and filesystem data sources (#11) — thanks @jvalentini
* add trend analytics via `--trends` for previous-period comparisons (#11) — thanks @jvalentini
* add cross-platform support including Windows binaries (#11) — thanks @jvalentini
* add bash completion support for worklog commands
* add make target for automated bash completion setup
* add `gitIdentityEmails` config for git identity filtering in merge detection (#21)

### Bug Fixes

* Fix Windows path handling in VS Code and Cursor workspace tracking (#12) — thanks @jvalentini
* Deduplicate Cursor workspace storage results across candidates (#12) — thanks @jvalentini

## [2.0.0](https://github.com/jvalentini/worklog/compare/worklog-v1.1.0...worklog-v2.0.0) (2026-01-01)


### ⚠ BREAKING CHANGES

* This release introduces v2.0.0 with improved install.sh and binary distribution

### Features

* prepare for v2.0.0 major release ([529199a](https://github.com/jvalentini/worklog/commit/529199af0c9c8c3f0700c0059aedf2c3cd8aa685))


### Bug Fixes

* correct JSON formatting in generated config.json ([f439812](https://github.com/jvalentini/worklog/commit/f439812fe0e45418408cd78ab41bf9432e635f2f))


### Chores

* configure release-please to skip releases, use tags-only approach ([0669359](https://github.com/jvalentini/worklog/commit/0669359555725840ae10100090c07266e93e1ed7))

## [1.1.0](https://github.com/jvalentini/worklog/compare/worklog-v1.0.0...worklog-v1.1.0) (2026-01-01)


### Features

* add one-liner install script ([67bb2f7](https://github.com/jvalentini/worklog/commit/67bb2f7020e63e12cbe2fb0b246d01c4054b1477))
* Initial worklog CLI implementation ([f155af3](https://github.com/jvalentini/worklog/commit/f155af3278230c41543fe8a58138417132431518))


### Documentation

* add comprehensive README with usage, configuration, and examples ([de2bdc7](https://github.com/jvalentini/worklog/commit/de2bdc721ce93fa19353d19c0b788c45e25ddd05))
* add repo URL to README ([ed17fc4](https://github.com/jvalentini/worklog/commit/ed17fc48e33a11a459ecd224e6fe9d847870bdbd))
* add repository stats badges to README ([1238309](https://github.com/jvalentini/worklog/commit/1238309d469ead70fe1747525d9176d44d85d54b))
* clarify sources, fix output example, update URL ([4ba143d](https://github.com/jvalentini/worklog/commit/4ba143d54ce8a79bf6a96c8b71e7cd3dfe32728d))
* update changelog for release-please setup ([4f4c24d](https://github.com/jvalentini/worklog/commit/4f4c24d4d1e0e149e867c5aa2092a575f7af8d5f))


### Styles

* apply biome formatting to tsconfig.json ([c5be4a7](https://github.com/jvalentini/worklog/commit/c5be4a7c486337b9a5133199fe92a9a8e5c78c45))


### Tests

* add unit tests for date utilities ([e5ba1e9](https://github.com/jvalentini/worklog/commit/e5ba1e9a7a33c89d8c43ee47425c4639699d7b96))


### Chores

* add biome and oxlint to mise tools ([d8d6a14](https://github.com/jvalentini/worklog/commit/d8d6a147c50fb5db2cf9616711bb1fd46775d544))
* add issues permission and PAT support for release-please ([0f58945](https://github.com/jvalentini/worklog/commit/0f5894576d171672b08e1b97595b9b8d4be963d2))
* add linting, pre-commit hooks, and CI/CD workflows ([9b86628](https://github.com/jvalentini/worklog/commit/9b86628e0f5873197e0c4c3046bb3d24e9d2ff71))
* add release-please manifest file ([0387695](https://github.com/jvalentini/worklog/commit/03876958924213681e4d23b2c7511d003b6cef49))
* release v1.0.0 ([9a98f61](https://github.com/jvalentini/worklog/commit/9a98f61fbc4aacd6ed0852614e5c27aa64815d22))
* remove install.sh ([1472d05](https://github.com/jvalentini/worklog/commit/1472d0549ae9f0e720317ca695d3ed6273eea89c))
* setup release-please for automated releases ([29da1e0](https://github.com/jvalentini/worklog/commit/29da1e0073ad64d284def369250bd6c38b3ef001))
* update release-please action to correct name ([9cc2055](https://github.com/jvalentini/worklog/commit/9cc2055b9d5ed9cd84ebb9c88e892f16030a02e8))


### Continuous Integration

* add Docker integration test for install.sh ([f33ad66](https://github.com/jvalentini/worklog/commit/f33ad66814f24f4615b0f3a42a91b8317ef06ef0))

## [1.0.0] - 2026-01-01

### Features
- Initial worklog CLI implementation
- One-liner install script
- Support for multiple AI agent sessions (OpenCode, Claude Code, Codex, Factory)
- Git commit history integration
- GitHub activity fetching (PRs, issues, reviews, comments)
- Flexible date ranges (today, yesterday, week, month, custom dates)
- Multiple output formats (Markdown, JSON, plain text, Slack)
- Comprehensive configuration system

### Tests
- Unit tests for date utilities
- Docker integration test for install.sh

### Chores
- Setup automated releases with release-please (#4) — thanks @jvalentini
- Linting, pre-commit hooks, and CI/CD workflows
- Biome and oxlint to mise tools

### Styles
- Apply biome formatting to tsconfig.json

### Documentation
- Add comprehensive README with usage, configuration, and examples
- Add repo URL to README

### Removed
- install.sh script
