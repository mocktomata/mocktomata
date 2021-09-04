# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 7.0.0-beta.7 (2021-09-04)


### Bug Fixes

* old/spec/package.json to reduce vulnerabilities ([#311](https://github.com/mocktomata/mocktomata/issues/311)) ([d8cc30f](https://github.com/mocktomata/mocktomata/commit/d8cc30fa1f9e678757b4c00333b527d4e2a8d93e))





# 7.0.0-beta.6 (2021-06-08)

**Note:** Version bump only for package @mocktomata/io-fs





# 7.0.0-beta.5 (2020-05-01)

**Note:** Version bump only for package @mocktomata/io-fs





# 7.0.0-beta.4 (2020-04-01)


### Bug Fixes

* upgrade ramda from 0.26.1 to 0.27.0 ([#297](https://github.com/mocktomata/mocktomata/issues/297)) ([fb67aaa](https://github.com/mocktomata/mocktomata/commit/fb67aaaff56bf9d30a68d937c55603a86dc959cf))





# 7.0.0-beta.3 (2020-03-31)


### Bug Fixes

* upgrade ramda from 0.26.1 to 0.27.0 ([#296](https://github.com/mocktomata/mocktomata/issues/296)) ([2d0e735](https://github.com/mocktomata/mocktomata/commit/2d0e735e22bf8cfc96605b957852ded677c69794))





# 7.0.0-beta.2 (2020-03-24)


### Bug Fixes

* libm should be es2017 ([#295](https://github.com/mocktomata/mocktomata/issues/295)) ([f8a1ce7](https://github.com/mocktomata/mocktomata/commit/f8a1ce73f7a5bb163ecbe96f9e779c73f5a86656))





# 7.0.0-beta.1 (2020-03-23)

**Note:** Version bump only for package @mocktomata/io-fs





# 7.0.0-beta.0 (2020-03-23)


### Bug Fixes

* update deps ([c9b3f34](https://github.com/mocktomata/mocktomata/commit/c9b3f3400e887b13271179efd3dbdca70fc899e6))
* **io-fs:** expose only FileRepository ([3c1200e](https://github.com/mocktomata/mocktomata/commit/3c1200e9b07faa42eea2e285a2210ae626cce16b))
* **io-fs:** throws PluginNotFound ([162012f](https://github.com/mocktomata/mocktomata/commit/162012fa2e9a88386f2d33258a3defc58e194aae))
* error trace ([5b3c950](https://github.com/mocktomata/mocktomata/commit/5b3c9500f657616e182e8654023cc9cb32eaf996))
* stop timer when throw ([644d438](https://github.com/mocktomata/mocktomata/commit/644d438626c3278cddb6bf54015a021e98db315b))
* upgrade to global-store@beta ([ce8f869](https://github.com/mocktomata/mocktomata/commit/ce8f8693930108656403e57984d00597573b74ac))
* **io-fs:** add missing global-store dep ([e1716e8](https://github.com/mocktomata/mocktomata/commit/e1716e8a3cc25cb3d1c19e06d13a5928d87bc256))
* **io-fs:** read/write conflict ([82c5ada](https://github.com/mocktomata/mocktomata/commit/82c5ada95dd5aa370fd236c306912b7e611b782d))


### Features

* **io-fs:** export details instead of createFileRepository ([cb34219](https://github.com/mocktomata/mocktomata/commit/cb342197555632014d23d76b8c9436a24680c67a))
* add invokePath to spec ([b0f3c3f](https://github.com/mocktomata/mocktomata/commit/b0f3c3f29f19e540af927cc91c541c0f4b7e1f8f))
* change io-fs to expose createSpecIO and createScenarioIO instead ([b7ff2e1](https://github.com/mocktomata/mocktomata/commit/b7ff2e16fcd99702b8839ebbc2f8b8dfcf40cd0e))
* filter spec mode with spec name and file path ([c3626b5](https://github.com/mocktomata/mocktomata/commit/c3626b5f2ed5ed54e4635641e11ca9b73ce8e75c))
* further remove all mention of komondor ([7cac8fe](https://github.com/mocktomata/mocktomata/commit/7cac8febdd247fcc26ed630795f220c9d553eb00))
* move io-fs to moctomata ([68a9add](https://github.com/mocktomata/mocktomata/commit/68a9add3e79c73c80ec5b771ac3048df8a70c001))
* move loadConfig to io-fs ([2f77c10](https://github.com/mocktomata/mocktomata/commit/2f77c10b6dbd1320b24b6164b32125ccf65ae807))
* remove scenario ([a2d0a1e](https://github.com/mocktomata/mocktomata/commit/a2d0a1e8d6d8607ab37c46dc9895b2973a023cc0))
* rename core to framework ([e9c4666](https://github.com/mocktomata/mocktomata/commit/e9c4666a6e2ae75985b5a931e6f5136ee94cb54c))
* rename to mocktomata ([17ffe41](https://github.com/mocktomata/mocktomata/commit/17ffe41eec572337ce683fd4cdb613a3d6394e19))
* use MocktomataError as base error ([3472688](https://github.com/mocktomata/mocktomata/commit/34726889bad478b5eda9be639b379dbc6696497d))
* **io-fs:** add loadPlugin() ([a683826](https://github.com/mocktomata/mocktomata/commit/a6838267a2e3f6a3f45b3e167da8fdd14a596fd2))
* **io-fs:** change create fn signature ([b481fb8](https://github.com/mocktomata/mocktomata/commit/b481fb8c76ad413523744905d4f2d641ad7253ea))
* **io-fs:** expose Repository type ([ba6e9ce](https://github.com/mocktomata/mocktomata/commit/ba6e9cef0059ee0f5d32f4431c8c849ab48c39fb))
* **io-fs:** get function back to async ([91b4333](https://github.com/mocktomata/mocktomata/commit/91b433303b4f287eb3b7da1a1505cc1a228c826a))
* **io-fs:** rename createFileIO to createFileRepository ([0ae00d0](https://github.com/mocktomata/mocktomata/commit/0ae00d00ad819c914341923f70b668198ea37abd))
* **io-fs:** rename createIO to createFileIO ([1e10e84](https://github.com/mocktomata/mocktomata/commit/1e10e8452c7d991f05cc5068280312510a857e54))
* **io-fs:** update package to support get plugin list. ([0f1a5c4](https://github.com/mocktomata/mocktomata/commit/0f1a5c456343ac54774cfd0d23937655d4046fe7))
