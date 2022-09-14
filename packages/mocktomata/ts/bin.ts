#!/usr/bin/env node
import { app } from './cli/index.js'

app.parse(process.argv).catch((err: any) => console.error(err))
