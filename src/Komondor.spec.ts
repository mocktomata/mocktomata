test('no test yet', () => { return })
// import { Komondor } from './Komondor'
// import { artifact } from '.';

// class BackStageGateway {

// }

// test('Connected Caverns are Traversable', async () => {
//   const k = komondor('Connected Caverns are Traversable', async spec => {
//     const server = artifact('gameServer')
//     const s = await spec(BackStageGateway)
//     const backstage = new s.subject(server.host)
//     await backstage.login('admin', 'pwd')
//     const game = new HuntTheWumpus(backstage)
//     return { backstage, game }
//   })
//   k.given('donut map')
//   k.given(`the player is in cavern1`)


//   k.define(`connects @cavern1 to @cavern2 going @direction`, ({ game }, cavern1, cavern2, direction) => {
//     return game.connectCavern(cavern1, cavern2, direction)
//   })
//   k.define(`the player is in @cavern`, ({ game }, cavern) => {
//     return game.setPlayerCavern(cavern)
//   })
//   k.define(`the player goes @direction`, ({ game }, direction) => {
//     return game.movePlayer(direction)
//   })
//   k.then(`the player is in @cavern`, async ({ game }, cavern) => {
//     t.strictEqual(await game.getPlayerCavern(), cavern)
//   })
// })
