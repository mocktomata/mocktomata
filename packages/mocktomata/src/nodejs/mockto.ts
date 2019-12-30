import { SpecContext } from '@mocktomata/framework';
import { createContext } from 'async-fp';
import { createMockto } from '../utils';

const context = createContext<SpecContext>()
export const mockto = createMockto(context)
