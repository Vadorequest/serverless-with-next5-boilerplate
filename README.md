Serverless with Next
===================

This is a tutorial/showcase to make Serverless (https://serverless.com) work with Next.js (https://github.com/zeit/next.js/).
It's also an in-depth explanation of what are the steps to put those two together.
The goal being to make a [Serverless template](https://github.com/serverless/serverless/tree/master/lib/plugins/create/templates) for ease of use.

# Getting started

- `git clone git@github.com:Vadorequest/serverless-with-next.git`
- `npm i`
- `npm start` (starts development server)
- Go to `http://localhost:3000/` (hello world) and `http://localhost:3000/test` (404)

# WHY?

Because Next.js helps building SSR react applications and serverless helps to deploy them on any cloud provider. (AWS, Google Cloud, etc.)

In my case, I need to render my homepage based on settings I must fetch from a DB. Hence the fact I need a server-side application if I want to have a good SEO.

We could use `create-react-app` and just deploy the bundled version, but SEO wouldn't be great.

# HOW?

We are going to start from the most simple template (`hello-world`) and add what's necessary.

# Features

- es6 (with source map support)
- development ease (using [serverless-offline](https://github.com/dherault/serverless-offline))
- stages (production, staging, development)

# Requirements

This tutorial assume:

- a basic knowledge of Serverless, with the `serverless` cli installed. (see https://serverless.com/learn/quick-start/)
- a basic knowledge of Next.js. (see https://learnnextjs.com)
- an AWS account, `sls deploy` commands will deploy on AWS (another provider is possible, but the `serverless.yml` will need to be modified)
- node < `6.9.3` installed, I personally used `8.9.4`, doesn't matter so much because we use webpack. (See [supported-languages](https://serverless.com/framework/docs/platform/commands/run#supported-languages))

# Acknowledgements

I am just a beginner with Serverless and Next.js

https://github.com/geovanisouza92/serverless-next was my main source of inspiration to put this together, 
but it was overcomplicated to my taste for a "getting started" and I couldn't understand how to decompose it all into smaller pieces.

# Steps (tutorial, from scratch)

1. Run `sls create --template hello-world --path serverless-with-next` (optionally ignore `.idea` folder)
1. Test using `sls deploy` should print something like this:

    ![](./ss/2018-02-25%2013.33.19%20-%20initial%20sls%20deploy.png)

1. Let's add ES6 using webpack and serverless-webpack

    1. Run `npm init -y`
    1. Ignore `.webpack` folder
    1. Update `serverless.yml`
        ```
        plugins:
          - serverless-webpack
        ```
        We use the `serverless-webpack` plugin to build our serverless app.
        The build is then uploaded to aws
        
    1. Add `.babelrc` config
        ```
        {
          "plugins": ["source-map-support", "transform-runtime"],
          "presets": ["env", "stage-3"]
        }
        ```
   
    1. Add the following npm dependencies:
        ```json
        "devDependencies": {
            "babel-core": "6.26.0",
            "babel-loader": "7.1.2",
            "babel-plugin-source-map-support": "2.0.0",
            "babel-plugin-transform-runtime": "6.23.0",
            "babel-preset-env": "1.6.1",
            "babel-preset-stage-3": "6.24.1",
            "serverless-webpack": "4.3.0",
            "webpack": "3.11.0",
            "webpack-node-externals": "1.6.0"
        },
        "dependencies": {
            "aws-sdk": "2.194.0",
            "babel-runtime": "6.26.0",
            "source-map-support": "0.5.3"
        }
        ```
        `aws-sdk` isn't needed for this tutorial, but will be for any real application
    
    1. Test if it works correctly!
        
        1. Run `sls invoke local -f helloWorld`, should print:
            ```bash
            Time: 685ms
             Asset          Size          Chunks        Chunk Names
                handler.js  3.58 kB       0  [emitted]  handler
            handler.js.map  3.82 kB       0  [emitted]  handler
               [0] ./handler.js 796 bytes {0} [built]
               [1] external "babel-runtime/core-js/promise" 42 bytes {0} [not cacheable]
               [2] external "source-map-support/register" 42 bytes {0} [not cacheable]
            {
                "message": "Go Serverless Webpack (Ecma Script) v1.0! First module!",
                "event": ""
            }
            ```
    1. Test source maps too
    
        1. Change `./handler.js` and add a syntax error
            ```
            .then(() => callback(null, {
              throw 'bouh' // Here
              message: 'Go Serverless Webpack (Ecma Script) v1.0! First module!',
              event,
            }))
            ```
        1. Run `sls invoke local -f helloWorld`
        1. It should print (on the server)
            ![](./ss/2018-02-25%2013.39.14%20-%20test%20source%20maps.png)
            
            We can see `ERROR in ./handler.js` with the line number. The stacktrace doesn't show the right line though. (if you know how to fix that, let met know!)
            
1. Add `serverless-offline` support for ease of development (see [serverless-offline](https://github.com/dherault/serverless-offline))
    
    1. Run `npm install serverless-offline --save-dev`
    1. Update `serverless.yml`
        ```
        plugins:
          - serverless-webpack
          - serverless-offline
        ```
    1. Run `sls offline`, should print:
        ![](./ss/2018-02-25%2014.00.09%20-%20sls%20offline.png)
        
    1. Go to http://localhost:3000/, it should print (on the browser)
        ![](./ss/2018-02-25%2014.02.18%20-%20sls%20offline%20not%20found.png)
    
    1. Go to http://localhost:3000/hello-world, it should print (on the server)
        ![](./ss/2018-02-25%2014.03.53%20-%20sls%20offline%20hello-world.png)
        (The web page should be blank)
    
    1. Serverless offline is a great tool to do the dev locally, by running a local node server to handle request and mock AWS lambda behavior for quick development.
        It isn't perfect (can't mock everything) but does help quite a lot.
        
1. Redirecting all requests to our handler entrypoint
    
    1. Update the `serverless.yml`:
        ```yml
        functions:
          helloWorld:
            handler: handler.helloWorld
            # The `events` block defines how to trigger the handler.helloWorld code
            events:
              - http:
                  method: get
                  path: /{proxy+} # This is what captures all get requests and redirect them to our handler.helloWorld function
        ```
    1. Now, go to:
        - http://localhost:3000/hello-world
        - http://localhost:3000/hello
        - http://localhost:3000/whatever
        - http://localhost:3000/whatever/nested
    1. You'll notice all of them return the same thing (on the server)
    
1. Make Next work with Serverless and display "Hello world!"

    1. Move `server.js` to `lambdas/server.js` and rename the `hello` function to `handler`
    1. Create `pages/index.js` with the following content:
        ```jsx harmony
        import React from 'react'

        export default () => {
          return (
            <div>Hello world!</div>
          );
        };
        ```
    1. Run `npm i -D concurrently jest cross-env serverless-jest-plugin`

        `serverless-jest-plugin` is a nice helper to [generate tests](https://github.com/SC5/serverless-jest-plugin)
        
    1. Run `npm i -S aws-serverless-express next react react-dom`
    1. Update the npm scripts as follow in package.json`:
        ```json
        "scripts": {
            "start": "concurrently -p '{name}' -n 'next,serverless' -c 'gray.bgWhite,yellow.bgBlue' \"next\" \"serverless offline --port 3000\"",
            "build": "cross-env-shell NODE_ENV=production \"next build && serverless package\"",
            "emulate": "cross-env-shell NODE_ENV=production \"next build && serverless offline\"",
            "deploy": "serverless deploy",
            "test:create": "sls create test --path {function}",
            "test": "jest"
        },
        ```
        
        - `npm start`: is for development mode, it runs both next and serverless in concurrency, and will display both logs in different color to help debugging.
            You can still use `sls offline` but it will be extremely slow (even though it works) and will do a big rebuild at every request. 
            It is therefore **STRONGLY** advised to run `npm start` instead from now on.
        - `npm start`: 
        - `npm run build`: To build the app for production environment (both Next and SLS) in `.next` and `.serverless` respectively
        - `npm run emulate`: To emulate the production environment in local 
        - `npm run deploy`: To deploy the application on the cloud provider (AWS, through serverless)
        - `npm run test:create`: Run `npm run test:create -- --function server`, where `server` is your function file name, note that you need to run this script within the function directory (haven't found a workaround about that yet)
        - `npm run test`: Run the tests (TODO: Make it work...)
    
    1. Update `.babelrc` and add the `preset` `"next/babel"`
    1. Create `next.config.js` with the following:
        ```js
        module.exports = {
          webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
            config.node = {
              fs: 'empty',
              module: "empty",
            };
            return config;
          },
        };
        ```
        Fixes webpack compilation for `fs` and `module`, see https://github.com/webpack-contrib/css-loader/issues/447
        
    1. Update `serverless.yml` with the following:
        ```yml
        # Welcome to serverless. Read the docs
        # https://serverless.com/framework/docs/
        service: serverless-with-next
        
        plugins:
          - serverless-webpack
          - serverless-offline
          - serverless-jest-plugin
        
        # Enable auto-packing of external modules
        # See https://serverless-stack.com/chapters/add-support-for-es6-es7-javascript.html
        custom:
          webpackIncludeModules: true
        
        # The `provider` block defines where your service will be deployed
        provider:
          name: aws
          runtime: nodejs6.10
        
        package:
          individually: true
        
        # The `functions` block defines what code to deploy
        functions:
          server:
            handler: lambdas/server.handler
            events:
              - http:
                  method: get
                  path: /
              - http:
                  method: get
                  path: /_next/{proxy+}
            package:
              include:
                - ../.next/**
        ```
        
        We package each function individually (doesn't change anything now because we only have one)
        But we basically don't want to package the `.next` build with our other endpoints.
        
        
## Issues
    
- On AWS, I can't get Next.js to work:

    1. `https://bcwl62lv2e.execute-api.us-east-1.amazonaws.com/dev` works almost correctly, but it doesn't act as a main entry point for the Next.js application.
        Basically, only the index is handled by Next.js, but not the other pages. It should display a 404 page.
        Console error: `https://bcwl62lv2e.execute-api.us-east-1.amazonaws.com/_next/59de0360-2226-486a-aa6b-3e6c4640fffc/page/index.js net::ERR_ABORTED`
        The URL is wrong, it should be `https://bcwl62lv2e.execute-api.us-east-1.amazonaws.com/dev/_next/59de0360-2226-486a-aa6b-3e6c4640fffc/page/index.js` (the `dev` part is missing)
        
        When I go to `https://bcwl62lv2e.execute-api.us-east-1.amazonaws.com/dev/_next/59de0360-2226-486a-aa6b-3e6c4640fffc/page/index.js` manually, I get the following: `Error: INVALID_BUILD_ID`
        
        ```
        Error: INVALID_BUILD_ID
        at Server._callee12$ (/var/task/node_modules/next/dist/server/index.js:632:29)
        at tryCatch (/var/task/node_modules/regenerator-runtime/runtime.js:62:40)
        at GeneratorFunctionPrototype.invoke [as _invoke] (/var/task/node_modules/regenerator-runtime/runtime.js:296:22)
        at GeneratorFunctionPrototype.prototype.(anonymous function) [as next] (/var/task/node_modules/regenerator-runtime/runtime.js:114:21)
        at step (/var/task/node_modules/babel-runtime/helpers/asyncToGenerator.js:17:30)
        at /var/task/node_modules/babel-runtime/helpers/asyncToGenerator.js:35:14
        at Promise.F (/var/task/node_modules/core-js/library/modules/_export.js:35:28)
        at Object.<anonymous> (/var/task/node_modules/babel-runtime/helpers/asyncToGenerator.js:14:12)
        at Object._nextBuildIdPagePathJs [as fn] (/var/task/node_modules/next/dist/server/index.js:714:27)
        at Router._callee$ (/var/task/node_modules/next/dist/server/router.js:81:60)

        ```
        
        => Workaround: Use custom domain, it fixes the missing `dev` part of the path, but other paths than "/" are still not handled by the server endpoint