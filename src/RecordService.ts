import { Recorder } from './Recorder'
import serializeError from 'serialize-error'

const recorder = new Recorder()

// tslint:disable-next-line
recorder.load(process.argv.length > 1 ? process.argv[1] : undefined)

process.on('message', action => {
  recorder[action.name](...action.args)
    .then(result => {
      process.send!({ id: action.id, result })
    }, error => {
      process.send!({ id: action.id, error: serializeError(error) })
    })
})
