# tree-noter

A command-line tool to format tree command output with aligned comments.

## Installation

```bash
npm install -g tree-noter
```

## Basic Usage (Aligned Style)

```bash
tree-noter [file] [options]
```

input.txt:
```
.
├── bin # Executable scripts
│   └── www # App entry point and server setup
├── public # Static assets
│   ├── images # Image files
│   ├── javascripts # Frontend JS
│   └── stylesheets # CSS files
│       └── style.css # Default stylesheet
├── routes # Route definitions
│   ├── index.js # Root path handler
│   └── users.js # /users route handler
├── views # Pug templates
│   ├── error.pug # Error page template
│   ├── index.pug # Home page template
│   └── layout.pug # Base layout template
├── app.js # App config and route setup
└── package.json # Project metadata and dependencies

```
```bash
$ tree-noter input.txt
.
├── bin                       Executable scripts
│   └── www                   App entry point and server setup
├── public                    Static assets
│   ├── images                Image files
│   ├── javascripts           Frontend JS
│   └── stylesheets           CSS files
│       └── style.css         Default stylesheet
├── routes                    Route definitions
│   ├── index.js              Root path handler
│   └── users.js              /users route handler
├── views                     Pug templates
│   ├── error.pug             Error page template
│   ├── index.pug             Home page template
│   └── layout.pug            Base layout template
├── app.js                    App config and route setup
└── package.json              Project metadata and dependencies


$ tree-noter -d input.txt
.
├── bin ---------------------------------------------- Executable scripts
│   └── www ---------------------------- App entry point and server setup
├── public ------------------------------------------------ Static assets
│   ├── images ---------------------------------------------- Image files
│   ├── javascripts ----------------------------------------- Frontend JS
│   └── stylesheets ------------------------------------------- CSS files
│       └── style.css -------------------------------- Default stylesheet
├── routes -------------------------------------------- Route definitions
│   ├── index.js -------------------------------------- Root path handler
│   └── users.js ----------------------------------- /users route handler
├── views ------------------------------------------------- Pug templates
│   ├── error.pug ----------------------------------- Error page template
│   ├── index.pug ------------------------------------ Home page template
│   └── layout.pug --------------------------------- Base layout template
├── app.js ----------------------------------- App config and route setup
└── package.json ---------------------- Project metadata and dependencies


$ tree-noter -d -s '👻'
.
├── bin 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 Executable scripts
│   └── www 👻👻👻👻👻👻👻👻👻👻👻👻👻👻 App entry point and server setup
├── public 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 Static assets
│   ├── images 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 Image files
│   ├── javascripts 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻� Frontend JS
│   └── stylesheets 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻� CSS files
│       └── style.css 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 Default stylesheet
├── routes 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 Route definitions
│   ├── index.js 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 Root path handler
│   └── users.js 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻� /users route handler
├── views 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻� Pug templates
│   ├── error.pug 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻� Error page template
│   ├── index.pug 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻 Home page template
│   └── layout.pug 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻� Base layout template
├── app.js 👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻👻� App config and route setup
└── package.json 👻👻👻👻👻👻👻👻👻👻👻 Project metadata and dependencies

```




## More Options

- `-o, --output <file>`: Output file (uses stdout if not specified)
- `-d, --decorator [separator]`: Use decorator style with optional separator (default: -----)
- `-g, --gap <width>`: Gap between tree and comments (default: 30)
- `-c, --comment-marker <marker>`: Comment marker to look for (default: #)
- `-w, --wrap`: Enable comment wrapping for long comments
- `-m, --max-width <width>`: Maximum width for output (auto-detects terminal width if not specified)
- `-i, --indent <spaces>`: Spaces to indent wrapped comment lines (default: 2)
