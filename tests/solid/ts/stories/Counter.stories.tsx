import { Counter, CounterProps } from '../Counter'
import { kd } from 'mocktomata'
import type { Meta, StoryObj } from '@storybook/html'
import { ComponentProps, lazy } from 'solid-js'

type Story = StoryObj<CounterProps>

export const Default: Story = {
	args: {
		initialValue: 12,
		theme: 'default',
	},
}

export const KD = () => {
	const spec = kd('counter')
	const WrappedCounter = lazy(async () => {
		const fn = await spec(() => Math.round(Math.random() * 100))
		return {
			default: () => <>
				<Counter initialValue={fn()} />
				<button onClick={() => spec.done()}>Done</button>
			</>
		}
	})

	return <WrappedCounter />
}

export default {
	title: 'Example/Counter',
	tags: ['autodocs'],
	/**
	 * Here you need to render JSX for HMR work!
	 *
	 * render: Counter won't trigger HMR updates
	 */
	render: (props) => <Counter {...props} />,
	argTypes: {
		initialValue: { control: 'number' },
		theme: {
			options: ['default', 'red'],
			control: { type: 'radio' },
		},
	},
} as Meta<ComponentProps<typeof Counter>>
