import { Express, Router } from 'express'

import { getFileIO } from '../fileIO'
import { store } from '../store'

const baseDir = store.options.registry.path

export default {
  setup(_app: Express, router: Router) {
    const io = getFileIO(baseDir)
    router
      .get('/api/specs/:id',
        async (req, res) => {
          const id = req.params.id
          const spec = await io.readSpec(id)
          res.send(spec)
        })
  }
}
