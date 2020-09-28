# import-all

Package for loading multiple modules by one function. Supports recursive imports. Easy usage and exploitation.

An extened version of package [require-all](https://www.npmjs.com/package/require-all) for ES6+

[![NPM](https://nodei.co/npm/@bitler/import-all.svg?downloads=true)](https://npmjs.com/package/@bitler/import-all)

<!-- [![Build status](https://nodei.co/npm/@bitler/import-all.svg?downloads=true)][ci-url] -->
[![NPM downloads](https://img.shields.io/npm/dm/@bitler/import-all.svg)](https://npmjs.org/package/@bitler/import-all)
[![GitHub stars](https://img.shields.io/github/stars/thebitler/import-all.svg?&label=github%20stars)](https://github.com/thebitler/import-all)

# Install

Paste into terminal and execute

`npm i @bitler/import-all`

# Usage

ES6
```js
import importAll from '@bitler/import-all'

const modules = importAll({ path: '../directory', __dirname }).then(doSomethingCallback);
```

# Advanced Usage

###### IgnoreEmptyDirs: ignores empty folders (true)
###### IgnoreEmptyFiles: ignores empty files (true)
###### Unique: import only files with unique names (false)
###### Recursive: will import only modules in specified folder if disabled (true)
###### Tree: object style file imports (true)
```js
// Example
// true
{
 src: {
  test: {
   'foo.js': { /* NodeModule */ }
  }
  importantDir: {
   '1.js': { /* NodeModule */ }
   '2.js': { /* NodeModule */ }
   '3.js': { /* NodeModule */ }
  }
  'index.js': { /* NodeModule */ }
 }
}
// false
{
 'foo.js': { /* NodeModule */ }
 '1.js': { /* NodeModule */ }
 '2.js': { /* NodeModule */ }
 '3.js': { /* NodeModule */ }
 'index.js': { /* NodeModule */ }
}
```

###### Each: Do something with filename and module without redefining them
```js
importAll({ path: '../directory', __dirname, each: (({ filename, module }) => 
 console.log(filename, module)
)})
```

###### Resolve: Edit module without modifying files
```js
importAll({ 
 path: '../directory',
 __dirname,
 resolve: (module => 
  (module.constants.userNames = module.constants.userNames.map(name => 
   name.toLowerCase()
   ))
 ),
 each: (({ module: names }) => console.log(names))
})
```

# Examples

TS: Handling, using for .. of
```ts
import importAll from '@bitler/import-all'

((async function (path: string) {
 const modules = await importAll({ path, __dirname, tree: false });
 const map: Map<string, Structure> = new Map()
 for (const [name, module] of Object.entries(modules)) map.set(name, module as Structure)
 return map;
})('../foo'))
```

TS: Create instance of class in every imported module
```ts
import importAll from '@bitler/import-all'

((async function (path: string) {
 await importAll({
  path,
  __dirname,
  tree: false,
  each: <T extends new () => YourClass>({ module }: { module: object }) => {
   const baz = new (module as T)('bar');
   console.log(baz.text)
  },
 })
})('../foo'))
```

### Ideas, bugs, contribute: [Repository](https://github.com/thebitler/import-all)
