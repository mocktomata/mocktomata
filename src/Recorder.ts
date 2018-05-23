// istanbul ignore file
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'

import { KOMONDOR_FOLDER } from './constants'
import { SpecNotFound, ScenarioNotFound } from './errors'
import { SpecRecord } from './interfaces'


export class Recorder {
  record
  filepath: string
  private loading: Promise<void>
  private creatingFolder: Promise<void>
  private savePending?: NodeJS.Timer

  // TODO: new Recorder({ purge: true })
  // during purge, mark all get and set and when process exit, remove the untouched.
  // This should be set manually by the user to ensure it is used only when all tests are executed.
  constructor(public options = { saveDelay: 500 }) {
    process.on('exit', this.save.bind(this))
  }
  load(folder: string = KOMONDOR_FOLDER) {
    if (!this.loading) {
      this.filepath = `./${folder}/records.json`
      this.loading = new Promise((a, r) => {
        fs.readFile(this.filepath, 'UTF-8', (err, data) => {
          if (!err || err.code === 'ENOENT') {
            this.record = data ? JSON.parse(data) : { specs: {}, scenarios: {} }
            a()
          }
          else
            r(err)
        })
      })
    }
    return this.loading
  }
  async save() {
    await this.loading
    await this.mkdir()
    return new Promise((a, r) => {
      fs.writeFile(this.filepath, JSON.stringify(this.record), err => {
        if (err) r(err)
        else a()
      })
    })
  }
  async getSpec(specId: string) {
    await this.loading
    const record = this.record.specs[specId]
    if (!record) {
      throw new SpecNotFound(specId)
    }
    return record as SpecRecord
  }
  async setSpec(specId: string, record: SpecRecord) {
    await this.loading
    this.record.specs[specId] = record
    this.delaySave()
  }
  async getScenario(scenarioId: string) {
    await this.loading
    const record = this.record.scenarios[scenarioId]
    if (!record) {
      throw new ScenarioNotFound(scenarioId)
    }
    return record
  }
  async setScenario(scenarioId: string, record) {
    await this.loading
    this.record.scenarios[scenarioId] = record
    this.delaySave()
  }
  private delaySave() {
    if (!this.savePending)
      this.savePending = setTimeout(async () => {
        await this.save()
        this.savePending = undefined
      }, this.options.saveDelay)
  }
  private mkdir() {
    if (!this.creatingFolder) {
      this.creatingFolder = new Promise((a, r) => {
        mkdirp(path.dirname(this.filepath), err => {
          if (err) r(err)
          else a()
        })
      })
    }
    return this.creatingFolder
  }
}
