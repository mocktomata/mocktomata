
In most cases,
you will use [mocktomata] for testing.

So you should install it as a dev dependency:

```sh
# npm
npm install -D mocktomata

# yarn
yarn add -D mocktomata

# pnpm
pnpm install -D mocktomata

# rush
rush add -p mocktomata --dev
```

There are [advance use cases][advance-use-cases] which you can install [mocktomata] as regular dependency.
But we will save that for later.

## `.mocktomata` folder

[mocktomata] will save the `SpecRecord` under the `.mocktomata` folder at the root of the package.

These files should be added in your source control.
For git, please add that folder to your `.gitignore` file.

Now let's take a look at what [I](./mockto.md) can do.

[advance-use-cases]: ./advance-use-cases.md
[mocktomata]: https://github.com/mocktomata/mocktomata/blob/master/packages/mocktomata
