#!/usr/bin/env node
import { app } from './cli'

app.parse(process.argv).catch(err => console.error(err))
