const jsdom = require('jsdom')
const { JSDOM } = jsdom

// this POS shows it should be possible to use io-server to serve modules to the client.
new JSDOM(`
<body>
  <script src="./komondor/plugins/@mocktomata/plugin-fixture-dummy"></script>
</body>`, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost:4123' })


// Starting http-server from the POC folder.
// This shows SystemJS can load simple JS file.
new JSDOM(`
<body>
  <script src="system.js"></script>
  <script>
    System.import('./dummy.js')
  </script>
</body>`, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost:8080' })
