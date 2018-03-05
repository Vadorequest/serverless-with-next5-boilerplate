Serverless with Next
===================

This is a tutorial/showcase to make Serverless (https://serverless.com) work with Next.js (https://github.com/zeit/next.js/).
It's also an in-depth explanation of what are the steps to put those two together.
The goal being to make a [Serverless template](https://github.com/serverless/serverless/tree/master/lib/plugins/create/templates) for ease of use.

**Notice**: This project is under development/debug. I wouldn't recommend to use it as-it for production use. It's a great resource as a getting started and in order to understand how Next and Serverless work together, but there are a few **Known issues** you must be aware of before using this in a production environment.

    => Use this if you want to play around
    => Take a look at https://github.com/apex/up-examples/tree/master/oss/node-next if you're fine with an alternative solution that doesn't use Serverless framework, but Up instead. (https://up.docs.apex.sh/)

---

# Getting started

- `git clone git@github.com:Vadorequest/serverless-with-next.git`
- Disable `serverless.yml:custom:customDomain` or configure your own custom domain on AWS and then run `sls create_domain` (can take 20-40 minutes) _[See "Known issues"]_ [See SLS Tutorial](https://serverless.com/blog/serverless-api-gateway-domain/#create-a-custom-domain-in-api-gateway)
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
- static assets (but I recommend **against** using heavy static assets, it increases the build size, and the upload time to AWS since they are deployed at every `sls deploy`, better to use a separated S3 bucket)

# Requirements

This tutorial assume:

- a basic knowledge of Serverless, with the `serverless` cli installed. (see https://serverless.com/learn/quick-start/)
- a basic knowledge of Next.js. (see https://learnnextjs.com)
- an AWS account, `sls deploy` commands will deploy on AWS (another provider is possible, but the `serverless.yml` will need to be modified)
- node < `6.9.3` installed, I personally used `8.9.4`, doesn't matter so much because we use webpack. (See [supported-languages](https://serverless.com/framework/docs/platform/commands/run#supported-languages))
- (optional) The use of a custom domain to fix a Known issue (see https://github.com/amplify-education/serverless-domain-manager), can simply be disabled to play around

# Acknowledgements

I am just a beginner with Serverless and Next.js

https://github.com/geovanisouza92/serverless-next was my main source of inspiration to put this together, 
but it was overcomplicated to my taste for a "getting started" and I couldn't understand how to decompose it all into smaller pieces.


## Known issues
    
1. On AWS, I can't get Next.js to work correctly because of the Serverless `staging` path rewrite:
   
    The main page (`https://11lwiykejg.execute-api.us-east-1.amazonaws.com/development/`) works fine, but:
   
    - when clicking on a "Page 2" link, it goes to the wrong URL: `https://11lwiykejg.execute-api.us-east-1.amazonaws.com/page2`, it's missing the `/development` part and the browser will display `{"message":"Forbidden"}`
    - **Current workaround**: I **used a custom domain**, it fixes the missing `development` part (by removing the `staging` part of the url entirely, which fixes the issue):
        - https://swn.dev.vadorequest.fr
        - https://swn.dev.vadorequest.fr/page2
        
    [See issue](https://github.com/Vadorequest/serverless-with-next/issues/5)
            
1. Static `png` file don't display on AWS, reason unknown (works fine in local). They are correctly packaged in the `.serverless` folder but aren't accessible online. `svg` work fine though.

    - **Current workaround**: Use an external S3 bucket (or CDN-like), it's also recommended to avoid uploading static assets at every serverless deploy.
    
    [See issue](https://github.com/Vadorequest/serverless-with-next/issues/5)

1. Useless files are packaged and uploaded to AWS:
  
    The `.next` and `static` folders are packaged for all functions, which is useless because only the server handler will use them. 
    Since I'm using Webpack to copy both those folders (and not SLS native packaging because we use `serverless-webpack` which isn't compatible), I don't know how to ignore those folders for certain functions.
    
    See ![](./ss/2018-03-05%2017.58.22%20-%20SLS%20packaging%20useless%20files.png)

1. Routing happens server-side even when request comes from client `<Link>` element
    
    I'm not quite sure about that, but I feel like the client-side browsing is broken and it does server-side requests when following links.
    I just noticed network calls when navigating, which is odd. 


---

# In-depth diving of the configuration

This part aims at giving you explanations about why is the project configured this way, we'll go deep in the configuration in order to explain the choices and understand the reasons behind.

It's perfect if you want to understand how all the pieces are working together, just skip it if

## Serverless plugins

### 1. [serverless-webpack](https://github.com/serverless-heaven/serverless-webpack)

Used to be able to use the latest JS version, in combination with Babel.

One downside of using this plugin is the fact we can't rely on the official [SLS documentation](https://serverless.com/framework/docs/providers/aws/guide/packaging/) about how to package anymore. [Source](https://github.com/serverless-heaven/serverless-webpack/issues/333#issuecomment-370517673)

Since the packaging is done using `serverless-webpack`, we can't follow https://serverless.com/framework/docs/providers/aws/guide/packaging/ doc to do the packaging.

On the other hand, we don't (usually) have to worry about what node module to include for each function, since the plugin does it for us using some kind of smart scan to detect what are the needed dependencies.

Nevertheless, in some case you may need to override the default behavior and [forceInclude/forceExclude](https://github.com/serverless-heaven/serverless-webpack#forced-inclusion) some packages. 

In addition, we use the `CopyWebpackPlugin`, to copy the `.next` and `static` folder during packaging.

### 1. [serverless-offline](https://github.com/dherault/serverless-offline) - AWS provider only!

Must-needed for local development. Kind of simulate lambda functions with local endpoints for ease of development. Time saver.

Read its doc is a must-do.

### 1. [serverless-jest-plugin](https://github.com/SC5/serverless-jest-plugin)

> Plugin for Serverless Framework which adds support for test-driven development using Jest

Note: Not really used but can be a nice addition, I'm thinking about removing it. Not important.

### 1. [serverless-domain-manager](https://github.com/amplify-education/serverless-domain-manager)

> Serverless plugin for managing custom domains with API Gateways.

Custom domain is kind of a must-have in any production application.

Especially because when you delete your stack and recreate it, or change the region, it'll change the endpoint url. 
You need a fixed url that doesn't change for production usage. (I do)

## Webpack advanced

1. `webpack-node-externals`

Read more at https://github.com/serverless-heaven/serverless-webpack#node-modules--externals

Basically, stuff like `aws-sdk` are automatically removed and not bundled/uploaded to AWS.

## Babel config (`.babelrc`)

We enabled `next/babel` preset as explained in the official documentation at https://github.com/zeit/next.js#customizing-babel-config

Additionally, we force to transpile the code to node 6.10 version to avoid any issue in the AWS environment

We also enable source map support.

**Important:** `babel-runtime` and `source-map-support` must be in the `package.json:dependencies` or your build will fail on AWS.
Both those modules are needed at runtime and you'll run into issues if you move them to `devDependencies`.

On the other hand, moving a casual package from `dependencies` to `devDependencies` like `moment` will have no side effect since `serverless-webpack` should resolve it and bundle it anyway.
But for the sake of understanding, better split packages correctly between both.

## Next

### next.config.js

Due to a webpack's bug/unwanted behavior, we get warnings/errors due to missing fs module. See https://github.com/evanw/node-source-map-support/issues/155

### Static

Next looks for static files in the `./static` folder. We kept the folder in the root folder for the sake of simplicity.

You can customize it a bit following [Next documentation](https://github.com/zeit/next.js/#exposing-configuration-to-the-server--client-side)

I highly recommend not to use static folder, and prefer using an external S3 bucket or CDN for that purpose.

The main reason is to speedup deployment, since Serverless/Webpack will bundle those static assets every time you use `sls deploy`.
If you have too many static assets, it'll make it last longer, and if your internet connection is weak, upload can become quite long.
And I don't think Next serves files faster than S3 does.
Also, you pay for files you upload on Lambda, so...

But for playing around, it's perfectly fine.

### Pages

Next "Pages" are in the `/pages` folder and [can't be moved in another folder](https://github.com/zeit/next.js/issues/3921).


### Version

We use the non-stable version `5.0.1-canary.9` because they fix a webpack bug in that particular version and we can't use an older one.
Feel free to update to a more recent version though. I'm waiting for "canary" version to be released.

## Serverless

TODO

### Functions
TODO How to catch all routes (main handler)

## Utils

### Logging

I put together a not-so-great logging helper. It does resolve webpack source map on AWS and that's its most interesting feature.
I also used `stacktrace-js` for better stacktrace, it looked interesting but I never used it before.

Anyway, if you don't like it, just throw it away. Suggestions/improvements are welcome.

---

# DEPRECATED, WON'T MAINTAIN ~~Steps (tutorial, from scratch)~~

> I started this repo with this tutorial, to write down the steps I went through, but I don't actually maintain it anymore, too much has happened and it doesn't really match between those examples and the current version.
> I'm keeping it in case somebody would want to do the same. Most of the knowledge I've acquired from it is now explained in the previous "Deep dive" part.

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
        
