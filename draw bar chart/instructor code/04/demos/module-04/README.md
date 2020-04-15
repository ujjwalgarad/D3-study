# How to work with the demo files

This repo holds all files we build in this module's demo.

- The `before` folder includes the files at the start of the coding demo,
- the `after` folder includes the files in their final state.

Sometimes we produce several small applications in one module, in which case you see either multiple individual files or folders.

## Install

Here are some detailed instructions on how to work with your files.

1. Download this repo onto your computer. For example onto your Desktop.

2. Open up the command prompt of your choice and `cd` (_change directory_) into the base folder you would like to work with. Assuming these folders are on the Desktop and you want to work on the bar chart of module 4 do:

   ```bash
   cd ~/Desktop/after/01-bar-chart
   ```

   on a Mac and

   ```bash
   cd C:\Users\<your user name goes here>\Desktop\after\01-bar-chart
   ```

   on a Windows machine.

3. If you see a `package.json` in that folder, run `npm install`, which will install all dependencies in a newly created `node_modules` folder:

   ```bash
   npm install
   ```

   These dependencies will be brought into the application at the top of the `index.html` file.

   You can skip this step if there's no `package.json` file present.

4. Now you can start a local server to see the site in the browser. There are many local servers you can install and run. In this course I am using [live-server](https://www.npmjs.com/package/live-server). You can install it globally like so:

   ```bash
   npm install -g live-server
   ```

   This will allow you to use it from anywhere on your machine. Omit the `-g` if you only want to install it locally, in the folder you're currently in.

   Once you have it installed you can just run the following from your command prompt:

   ```bash
   live-server
   ```

   Your default browser will open a window on `localhost` at port `8080` (which translates to a URL of `http://127.0.0.1:8080/` or `localhost:8080/`). If _live-server_ doesn't open a browser for you, you can just enter one of above URL's in your browser.

Note, that for the best and most consistent experience, you might want to consider using the latest Chrome browser, as we are using Chrome in the course.

You're all set! Happy coding 🐳...
