#!/usr/bin/env node
import { cli } from './cli'

cli.parse(process.argv).catch((err: any) => console.error(err))
