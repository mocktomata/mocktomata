export type ScenarioIO = {
  readScenario(id: string): Promise<ScenarioRecord>,
  writeScenario(id: string, record: ScenarioRecord): Promise<void>
}

export type ScenarioRecord = {}
